// Arrival loader (D09): the paper veil in index.html stays until the first table frame is ready
// (or at once on pages without a table). A safety reveal after 12 s never leaves a blank screen.
let revealed = false;

export function worldReady() {
  if (revealed || typeof document === "undefined") return;
  revealed = true;
  const veil = document.getElementById("fold-loader");
  if (!veil) return;
  veil.classList.add("is-done");
  window.setTimeout(() => veil.remove(), 700);
}

// Only in the browser: the prerender imports this module on the server.
if (typeof window !== "undefined") window.setTimeout(worldReady, 12_000);
