import type { PropDef } from "./types";

export function generateCode(
  componentName: string,
  defs: PropDef[],
  values: Record<string, any>,
  extraLines: string[] = []
): string {
  const propLines: string[] = [];
  for (const def of defs) {
    if (def.readonly) continue;
    const val = values[def.key];
    if (def.type === "boolean") {
      propLines.push(`  ${def.key}={${val}}`);
    } else if (def.type === "number") {
      if (val !== undefined && val !== "" && val !== null) {
        propLines.push(`  ${def.key}={${val}}`);
      }
    } else {
      if (val) propLines.push(`  ${def.key}="${val}"`);
    }
  }
  for (const line of extraLines) propLines.push(`  ${line}`);
  const body = propLines.length ? "\n" + propLines.join("\n") + "\n" : "";
  return `import { ${componentName} } from "@thenamespace/ens-components";\n\n<${componentName}${body}/>`;
}
