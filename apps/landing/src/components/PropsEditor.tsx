import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PropDef, StrProp } from "./types";

function PropTip({ text }: { text: string }) {
  return (
    <span className="prop-tip">
      ?<span className="prop-tip-text">{text}</span>
    </span>
  );
}

export function PropsEditor({
  defs,
  values,
  onChange,
}: {
  defs: PropDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="props-editor">
      <button className="props-editor-toggle" onClick={() => setOpen(o => !o)}>
        <span className="props-editor-label">Props</span>
        <ChevronDown
          size={14}
          className={`props-chevron ${open ? "props-chevron-open" : ""}`}
        />
      </button>
      {open && (
        <table className="props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {defs.map(def => (
              <tr key={def.key}>
                <td className="prop-name-cell">
                  <code>{def.key}</code>
                  {def.required && <span className="prop-required">*</span>}
                  {def.tip && <PropTip text={def.tip} />}
                </td>
                <td className="prop-type-cell">
                  <span className={`prop-type-badge type-${def.type}`}>
                    {def.type}
                  </span>
                </td>
                <td className="prop-value-cell">
                  {def.readonly ? (
                    <span className="prop-readonly-val">
                      {String(values[def.key] ?? "-")}
                    </span>
                  ) : def.type === "boolean" ? (
                    <button
                      className={`prop-toggle ${values[def.key] ? "on" : "off"}`}
                      onClick={() => onChange(def.key, !values[def.key])}
                    >
                      <span className="toggle-track">
                        <span className="toggle-thumb" />
                      </span>
                      <span className="toggle-val">
                        {String(values[def.key])}
                      </span>
                    </button>
                  ) : (
                    <input
                      className="prop-input"
                      type={def.type === "number" ? "number" : "text"}
                      value={values[def.key] ?? ""}
                      placeholder={
                        (def as StrProp).placeholder ?? `${def.key}…`
                      }
                      onChange={e =>
                        onChange(
                          def.key,
                          def.type === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
