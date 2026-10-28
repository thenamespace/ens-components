import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import * as prettier from "prettier";

const base = process.argv[2] || "origin/main";
const changed = execFileSync(
  "git",
  [
    "diff",
    "--name-only",
    "--diff-filter=ACMR",
    "-z",
    "--end-of-options",
    base,
    "--",
  ],
  { encoding: "utf8" }
);
const untracked = execFileSync(
  "git",
  ["ls-files", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" }
);

let checked = 0;
for (const filepath of new Set(
  `${changed}${untracked}`.split("\0").filter(Boolean)
)) {
  const info = await prettier.getFileInfo(filepath, {
    ignorePath: ".prettierignore",
  });
  if (info.ignored || !info.inferredParser) continue;

  checked++;
  const options = await prettier.resolveConfig(filepath);
  if (
    !(await prettier.check(await readFile(filepath, "utf8"), {
      ...options,
      filepath,
    }))
  ) {
    console.error(`Formatting required: ${filepath}`);
    process.exitCode = 1;
  }
}
console.log(`Checked formatting in ${checked} changed files.`);
