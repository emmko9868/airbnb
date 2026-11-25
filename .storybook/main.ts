import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials", // autodocs 포함
    "@storybook/addon-designs", // parameters.design → Figma 패널
  ],
  framework: {
    name: "@storybook/react-vite",
    options: { builder: { viteConfigPath: fileURLToPath(new URL("./vite.config.ts", import.meta.url)) } },
  },
  docs: { autodocs: "tag" },
  viteFinal: async (cfg) => {
    // Tailwind v4 로 @theme 토큰을 처리한다 (DSP `packages/ui` 와 동일 파이프라인).
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    return mergeConfig(cfg, {
      plugins: [tailwindcss()],
      resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    });
  },
};

export default config;
