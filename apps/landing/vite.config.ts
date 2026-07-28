import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// To enable pre-rendering (so bots that don't run JS can read page content),
// install vite-plugin-prerender and uncomment the block below:
//
//   pnpm --filter landing add -D vite-plugin-prerender
//
// import prerender from "vite-plugin-prerender";
//
// Then add to plugins:
//   prerender({ staticDir: path.join(__dirname, "dist"), routes: ["/"] })

const componentsPkg = JSON.parse(
  readFileSync(
    resolve(__dirname, "../../packages/components/package.json"),
    "utf-8"
  )
);

// Keep the installed skill canonical. The plugin below exposes it through the
// landing site without maintaining a second checked-in copy.
const skillSourceDir = resolve(
  __dirname,
  "../../.agents/skills/ens-components"
);

const agentQuickstart = `## Agent Quickstart

To use this skill in your AI assistant:

\`\`\`bash
npx skills add thenamespace/skills -s ens-components
\`\`\`

Or install all Namespace skills:

\`\`\`bash
npx skills add thenamespace/skills
\`\`\`

Once installed, your agent will know how to help developers integrate \`@thenamespace/ens-components\` into any React app.
`;

const collectSkillFiles = (
  directory: string,
  relativeDirectory = ""
): Map<string, string> => {
  const files = new Map<string, string>();

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      for (const [path, contents] of collectSkillFiles(
        absolutePath,
        relativePath
      )) {
        files.set(path, contents);
      }
      continue;
    }

    files.set(relativePath, readFileSync(absolutePath, "utf-8"));
  }

  return files;
};

const addAgentQuickstart = (skill: string): string => {
  const frontmatter = skill.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!frontmatter) {
    throw new Error("ENS Components SKILL.md is missing YAML frontmatter.");
  }

  return `${frontmatter[0]}\n${agentQuickstart}\n${skill.slice(frontmatter[0].length)}`;
};

const getSkillAssets = (): Map<string, string> => {
  const sourceFiles = collectSkillFiles(skillSourceDir);
  const skill = sourceFiles.get("SKILL.md");

  if (!skill) {
    throw new Error("ENS Components SKILL.md was not found.");
  }

  const assets = new Map<string, string>([
    ["Skill.md", addAgentQuickstart(skill)],
  ]);

  for (const [path, contents] of sourceFiles) {
    assets.set(`skills/ens-components/${path}`, contents);
  }

  return assets;
};

const ensComponentsSkill = (): Plugin => ({
  name: "ens-components-skill",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const requestPath = decodeURIComponent(
        (request.url || "").split("?")[0]
      ).replace(/^\/+/, "");
      const contents = getSkillAssets().get(requestPath);

      if (contents === undefined) {
        next();
        return;
      }

      response.statusCode = 200;
      response.setHeader("Content-Type", "text/markdown; charset=utf-8");
      response.end(contents);
    });
  },
  generateBundle() {
    for (const [fileName, source] of getSkillAssets()) {
      this.emitFile({ type: "asset", fileName, source });
    }
  },
});

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(componentsPkg.version),
  },
  plugins: [react(), ensComponentsSkill()],
  resolve: {
    dedupe: ["react", "react-dom", "wagmi", "viem", "@tanstack/react-query"],
  },
  optimizeDeps: {
    exclude: ["@thenamespace/ens-components"],
  },
});
