// Optional minify build. The app runs fine WITHOUT this — the root files are
// the canonical no-build source that Vercel serves directly. This just emits
// minified copies into dist/ for when you want smaller payloads.
//
//   npm install   (one-time, pulls esbuild)
//   npm run build
//
const path = require("path");
const fs = require("fs");

let esbuild;
try {
  esbuild = require("esbuild");
} catch (e) {
  console.error("esbuild not found — run `npm install` first.");
  process.exit(1);
}

const FILES = ["app.js", "plan.js", "lib/training-math.js", "styles.css"];

(async () => {
  for (const f of FILES) {
    const out = path.join("dist", f);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await esbuild.build({
      entryPoints: [f],
      outfile: out,
      minify: true,
      bundle: false,        // keep the shared-global-scope script model intact
      legalComments: "none",
      logLevel: "warning",
    });
    const before = fs.statSync(f).size;
    const after = fs.statSync(out).size;
    console.log(`${f.padEnd(28)} ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB`);
  }
  console.log("\nMinified files written to dist/. Root files remain the no-build source.");
})().catch((e) => { console.error("Build failed:", e.message); process.exit(1); });
