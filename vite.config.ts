// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { campos }, etc }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { execSync } from "node:child_process";
import { loadEnv } from "vite";

// Carrega variáveis sem prefixo VITE_ apenas para o runtime de servidor
// (rotas /lovable/*). Nunca são expostas ao bundle do cliente.
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

function shaDoBuild(): string | null {
  const deAmbiente = process.env["GITHUB_SHA"] ?? process.env["COMMIT_SHA"] ?? process.env["VERCEL_GIT_COMMIT_SHA"];
  if (deAmbiente) return deAmbiente;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || null;
  } catch {
    return null;
  }
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: { __BUILD_SHA__: JSON.stringify(shaDoBuild()) },
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
        entities: path.resolve(process.cwd(), "node_modules/entities"),
      },
    },
  },
});
