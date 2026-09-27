import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { ROUTES } from "./src/routes.ts";

export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    {
      name: "foldfield-prerendered-routes",
      configurePreviewServer(server) {
        server.middlewares.use((request, response, next) => {
          const [rawPath = "/", query] = (request.url ?? "/").split("?");
          const path = rawPath.replace(/\/$/, "") || "/";
          if (path === "/404" || (path !== "/" && !path.includes(".") && !ROUTES.includes(path))) {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(readFileSync(resolve("dist/404/index.html"), "utf8"));
            return;
          }
          if (path !== "/" && ROUTES.includes(path))
            request.url = `${path}/index.html${query ? `?${query}` : ""}`;
          next();
        });
      },
    },
  ],
  resolve: { dedupe: ["react", "react-dom"] },
  server: {
    host: "127.0.0.1",
    port: 4512,
    strictPort: true,
    watch: {
      ignored: [
        "**/output/**",
        "**/.playwright-cli/**",
        "**/public/plates/**",
        "**/docs/visual/captures/**",
      ],
    },
  },
  preview: { host: "127.0.0.1", port: 4612, strictPort: true },
  build: { cssMinify: "lightningcss", manifest: true },
});
