import * as esbuild from "esbuild";
import { readFileSync, writeFileSync } from "fs";

const result = await esbuild.build({
  entryPoints: ["src/ui.jsx"],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  target: ["chrome100"],
});

const js = result.outputFiles[0].text;
const html = `<!doctype html><meta charset="utf-8"><div id="root"></div><script>${js}</script>`;
writeFileSync("ui.html", html);
console.log("ui.html", (html.length / 1024).toFixed(1) + "kb");
