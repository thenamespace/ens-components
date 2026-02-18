// .storybook/main.ts
import tsconfigPaths from "vite-tsconfig-paths";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  viteFinal: async viteConfig => {
    viteConfig.plugins = [...(viteConfig.plugins || []), tsconfigPaths()];
    return viteConfig;
  },
};
export default config;
