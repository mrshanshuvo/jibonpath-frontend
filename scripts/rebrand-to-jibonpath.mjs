import fs from "fs";
import path from "path";

const REPLACEMENTS = [
  { from: /JibonPath Dispatch Systems/g, to: "JibonPath Dispatch Systems" },
  { from: /JibonPath Operations/g, to: "JibonPath Operations" },
  { from: /JibonPath Emergency Dispatch/g, to: "JibonPath Emergency Dispatch" },
  { from: /JibonPath/g, to: "JibonPath" },
  { from: /pulsepoint\.dev/g, to: "jibonpath.dev" },
  { from: /pulsepoint-emergency\.vercel\.app/g, to: "jibonpath.vercel.app" },
];

const TARGET_DIRS = ["src", "scripts", "docs"];

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name !== "node_modules" &&
        entry.name !== ".next" &&
        entry.name !== ".git"
      ) {
        processDirectory(fullPath);
      }
    } else if (
      entry.isFile() &&
      /\.(tsx|ts|js|mjs|md|json)$/.test(entry.name)
    ) {
      let content = fs.readFileSync(fullPath, "utf-8");
      let changed = false;
      for (const { from, to } of REPLACEMENTS) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, "utf-8");
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}

console.log("Rebranding script complete.");
