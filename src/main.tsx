import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { worldReady } from "./loader";

const root = document.getElementById("root");
if (root) {
  const app = <App initialPath={root.dataset.path ?? "/"} />;
  if (root.dataset.rendered) hydrateRoot(root, app);
  else createRoot(root).render(app);
}

// Pages without a paper table reveal as soon as React has painted.
requestAnimationFrame(() => {
  if (!document.querySelector(".scene")) worldReady();
});
