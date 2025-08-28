import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import "../styles/theme.css";

export type ThemeName = "light" | "dark";

export interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  initialTheme?: ThemeName;
  useDocument?: boolean;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialTheme = "light",
  useDocument = true,
  children,
}) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    if (useDocument && typeof document !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      return () => {
        root.removeAttribute("data-theme");
      };
    }
  }, [theme, useDocument]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    }),
    [theme]
  );

  if (useDocument) {
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
  }

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme} className="ns-reset">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}; 