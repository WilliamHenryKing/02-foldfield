import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root");
if (root) {
  const app = <App initialPath={root.dataset.path ?? "/"} />;
  if (root.dataset.rendered) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
