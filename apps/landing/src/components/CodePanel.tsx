import { CopyButton } from "./CopyButton";
import { highlight } from "./highlight";

export function CodePanel({
  title,
  code,
  showCopy,
}: {
  title: string;
  code: string;
  showCopy?: boolean;
}) {
  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <span className="code-panel-title">{title}</span>
        <div className="code-panel-dots">
          <span className="code-panel-dot" style={{ background: "#FF5F57" }} />
          <span className="code-panel-dot" style={{ background: "#FEBC2E" }} />
          <span className="code-panel-dot" style={{ background: "#28C840" }} />
        </div>
      </div>
      <div className="code-panel-body" style={{ position: "relative" }}>
        {showCopy && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <CopyButton text={code} />
          </div>
        )}
        <pre dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </div>
    </div>
  );
}
