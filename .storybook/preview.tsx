import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import "../src/styles/theme.css";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      return (
        <ThemeProvider initialTheme={theme as any} useDocument={false}>
          <div style={{ background: "var(--ns-color-bg)", minHeight: "100vh", padding: 24 }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
};

export default preview; 