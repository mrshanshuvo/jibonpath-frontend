#!/usr/bin/env node

import fs from "fs";
import path from "path";

// WCAG relative luminance calculation
function getLuminance(hex) {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Lifeline Token Values
const PALETTES = {
  light: {
    name: "Light Mode",
    pairs: [
      {
        name: "Default Text on Canvas",
        fg: "#0F172A",
        bg: "#F8FAFC",
        min: 4.5,
      },
      { name: "Muted Text on Canvas", fg: "#475569", bg: "#F8FAFC", min: 4.5 },
      {
        name: "Default Text on Surface",
        fg: "#0F172A",
        bg: "#FFFFFF",
        min: 4.5,
      },
      { name: "Muted Text on Surface", fg: "#475569", bg: "#FFFFFF", min: 4.5 },
      { name: "Primary FG on Primary", fg: "#FFFFFF", bg: "#1E3A8A", min: 4.5 },
      {
        name: "Emergency FG on Emergency",
        fg: "#FFFFFF",
        bg: "#DC2626",
        min: 4.5,
      },
      {
        name: "Warning Ink on Warning Tint",
        fg: "#B45309",
        bg: "#FEF3C7",
        min: 4.5,
      },
      {
        name: "Success Ink on Success Tint",
        fg: "#15803D",
        bg: "#DCFCE7",
        min: 4.5,
      },
      {
        name: "Danger Ink on Danger Tint",
        fg: "#B91C1C",
        bg: "#FEE2E2",
        min: 4.5,
      },
      { name: "Info Ink on Info Tint", fg: "#1D4ED8", bg: "#DBEAFE", min: 4.5 },
      {
        name: "Emergency Button Hover",
        fg: "#FFFFFF",
        bg: "#B91C1C",
        min: 4.5,
      },
    ],
  },
  dark: {
    name: "Dark Mode",
    pairs: [
      {
        name: "Default Text on Canvas",
        fg: "#E8EBF5",
        bg: "#0E1224",
        min: 4.5,
      },
      { name: "Muted Text on Canvas", fg: "#9AA3C0", bg: "#0E1224", min: 4.5 },
      {
        name: "Default Text on Surface",
        fg: "#E8EBF5",
        bg: "#171C36",
        min: 4.5,
      },
      { name: "Muted Text on Surface", fg: "#9AA3C0", bg: "#171C36", min: 4.5 },
      { name: "Primary FG on Primary", fg: "#0E1224", bg: "#8C9BFF", min: 4.5 },
      {
        name: "Emergency FG on Emergency",
        fg: "#0E1224",
        bg: "#FF5A66",
        min: 4.5,
      },
      {
        name: "Warning Text on Dark Surface",
        fg: "#F5A524",
        bg: "#171C36",
        min: 4.5,
      },
      {
        name: "Success Text on Dark Surface",
        fg: "#3DDC97",
        bg: "#171C36",
        min: 4.5,
      },
      {
        name: "Danger Text on Dark Surface",
        fg: "#FF5A66",
        bg: "#171C36",
        min: 4.5,
      },
      {
        name: "Info Text on Dark Surface",
        fg: "#4FC3F7",
        bg: "#171C36",
        min: 4.5,
      },
    ],
  },
};

console.log("\n=======================================================");
console.log("  JibonPath Lifeline Palette Contrast Audit (WCAG 2.1)");
console.log("=======================================================\n");

let failedPairs = 0;

for (const themeKey of Object.keys(PALETTES)) {
  const theme = PALETTES[themeKey];
  console.log(`\n[Theme: ${theme.name}]`);
  console.log("-------------------------------------------------------");

  for (const pair of theme.pairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const passed = ratio >= pair.min;
    const status = passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";

    console.log(
      ` ${status} ${pair.name.padEnd(32)} ${ratio.toFixed(2)}:1 (min ${pair.min}:1) [${pair.fg} on ${pair.bg}]`,
    );

    if (!passed) {
      failedPairs++;
    }
  }
}

// Codebase Raw Color Utility Linting
console.log("\n\n=======================================================");
console.log("  Auditing Codebase for Forbidden Raw Color Classes");
console.log("=======================================================\n");

const FORBIDDEN_PATTERNS = [
  {
    pattern: /\btext-white\b/g,
    label:
      "text-white (use text-primary-foreground or text-emergency-foreground)",
  },
  {
    pattern:
      /\b(?:bg|text|border)-(?:emerald|rose|amber|blue|indigo|purple|slate|zinc|cyan|sky)-\d+\b/g,
    label: "raw palette utility (use semantic tokens)",
  },
];

function getTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        getTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const srcDir = path.resolve(process.cwd(), "src");
const tsxFiles = getTsxFiles(srcDir);
let lintErrors = 0;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, "/");

  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      console.log(
        `\x1b[31mFAIL\x1b[0m ${relPath}: found ${matches.length} instance(s) of ${label}`,
      );
      lintErrors += matches.length;
    }
  }
}

if (lintErrors === 0) {
  console.log(
    "\x1b[32mPASS\x1b[0m All .tsx files are free of forbidden raw color utilities!",
  );
}

console.log("\n=======================================================");
if (failedPairs === 0 && lintErrors === 0) {
  console.log(
    "\x1b[32m✔ SUCCESS: All Lifeline contrast pairings and token rules verified!\x1b[0m\n",
  );
  process.exit(0);
} else {
  console.log(
    `\x1b[31m✖ FAILURE: ${failedPairs} contrast failures, ${lintErrors} lint errors detected.\x1b[0m\n`,
  );
  process.exit(1);
}
