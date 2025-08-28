'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/theme/ThemeProvider.tsx
var ThemeContext = react.createContext(void 0);
var ThemeProvider = ({
  initialTheme = "light",
  useDocument = true,
  children
}) => {
  const [theme, setTheme] = react.useState(initialTheme);
  react.useEffect(() => {
    if (useDocument && typeof document !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      return () => {
        root.removeAttribute("data-theme");
      };
    }
  }, [theme, useDocument]);
  const value = react.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => t === "light" ? "dark" : "light")
    }),
    [theme]
  );
  if (useDocument) {
    return /* @__PURE__ */ jsxRuntime.jsx(ThemeContext.Provider, { value, children });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(ThemeContext.Provider, { value, children: /* @__PURE__ */ jsxRuntime.jsx("div", { "data-theme": theme, className: "ns-reset", children }) });
};
var useTheme = () => {
  const ctx = react.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
var sizeToClass = {
  sm: "ns-btn--sm",
  md: "ns-btn--md",
  lg: "ns-btn--lg"
};
var Button = ({
  variant = "solid",
  size = "md",
  className = "",
  children,
  loading = false,
  disabled,
  dataTestId,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const classes = [
    "ns-btn",
    `ns-btn--${variant}`,
    sizeToClass[size],
    loading ? "ns-btn--loading" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      className: classes,
      disabled: isDisabled,
      "aria-disabled": isDisabled || void 0,
      "aria-busy": loading || void 0,
      "data-test-id": dataTestId,
      ...rest,
      children: [
        loading && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ns-btn__spinner", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ns-btn__label", children })
      ]
    }
  );
};

exports.Button = Button;
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map