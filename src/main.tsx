import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "@rainbow-me/rainbowkit/styles.css";

function TestApp() {
  // This is a test app. Its not bundled as component library!!

  return <div>Namespace Component Library</div>;
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
}
