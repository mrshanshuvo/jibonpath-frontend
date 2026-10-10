import fs from "fs";
import path from "path";

const TARGET_DIRS = ["src/app", "src/components"];

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // Replace various max-w-7xl combinations with clean fluid w-full
  content = content.replace(/mx-auto flex h-16 max-w-7xl/g, "w-full flex h-16");
  content = content.replace(/relative mx-auto max-w-7xl/g, "relative w-full");
  content = content.replace(
    /flex-1 max-w-7xl w-full mx-auto/g,
    "flex-1 w-full",
  );
  content = content.replace(/max-w-7xl w-full mx-auto/g, "w-full");
  content = content.replace(/max-w-7xl mx-auto/g, "w-full");
  content = content.replace(/mx-auto max-w-7xl/g, "w-full");
  content = content.replace(/\bmax-w-7xl\b/g, "w-full");

  // Clean up any redundant "w-full w-full"
  content = content.replace(/w-full w-full/g, "w-full");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Removed max-w-7xl in: ${filePath}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      cleanFile(fullPath);
    }
  }
}

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
}

console.log("Fluid full-width layout conversion complete.");
