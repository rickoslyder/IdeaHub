#!/usr/bin/env node

// Migration script to convert gray-* classes to neutral-* for Tailwind v4
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get directory to process
const rootDir = path.resolve(__dirname, "..");
const webDir = path.resolve(__dirname);

console.log("🔍 Finding all .tsx, .jsx, .ts, .js, and .css files...");

// Get all relevant files
const findCommand = `find ${rootDir} -type f -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" -o -name "*.css" | grep -v "node_modules" | grep -v "dist" | grep -v "build"`;
const files = execSync(findCommand, { encoding: "utf-8" })
  .split("\n")
  .filter(Boolean);

console.log(`Found ${files.length} files to process.`);

let replacedCount = 0;
let filesModified = 0;

// Process each file
files.forEach((filePath) => {
  let fileContent = fs.readFileSync(filePath, "utf-8");
  let originalContent = fileContent;

  // Regular expressions to match Tailwind classes
  // Match text-gray-XXX, bg-gray-XXX, hover:text-gray-XXX, etc.
  const grayPattern =
    /(^|\s|\"|\'|:)(hover:)?(focus:)?(active:)?(bg|text|border|ring|shadow|fill|stroke)-gray-([0-9]+)/g;

  // Replace with equivalent neutral colors
  fileContent = fileContent.replace(
    grayPattern,
    (match, p1, p2, p3, p4, type, shade) => {
      replacedCount++;
      // Reconstruct with neutral instead of gray
      // p1: leading character
      // p2, p3, p4: potentially hover:, focus:, active:
      // type: bg, text, etc.
      // shade: 50, 100, etc.
      return `${p1}${p2 || ""}${p3 || ""}${p4 || ""}${type}-neutral-${shade}`;
    }
  );

  // Check if the file was modified
  if (fileContent !== originalContent) {
    fs.writeFileSync(filePath, fileContent, "utf-8");
    console.log(`✅ Modified: ${filePath}`);
    filesModified++;
  }
});

console.log(`
Migration Summary:
-----------------
Files processed: ${files.length}
Files modified: ${filesModified}
Replacements made: ${replacedCount}

Next steps:
1. Run your build to verify the changes work
2. Check for any missed gray-* classes
`);
