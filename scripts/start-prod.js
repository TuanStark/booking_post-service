#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Tìm main.js ở các vị trí có thể
const possiblePaths = [
  'dist/main.js',
  'dist/src/main.js',
  'dist/main',
  'dist/src/main',
];

let mainPath = null;

for (const possiblePath of possiblePaths) {
  const fullPath = path.resolve(possiblePath);
  if (fs.existsSync(fullPath)) {
    mainPath = fullPath;
    console.log(`✅ Found main file at: ${mainPath}`);
    break;
  }
}

if (!mainPath) {
  console.error('❌ ERROR: Cannot find main.js file in any of these locations:');
  possiblePaths.forEach((p) => console.error(`   - ${p}`));
  console.error('\n📁 Contents of dist directory:');
  try {
    const distContents = fs.readdirSync('dist', { withFileTypes: true });
    distContents.forEach((item) => {
      const itemPath = path.join('dist', item.name);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        console.error(`   📁 ${itemPath}/`);
        try {
          const subContents = fs.readdirSync(itemPath);
          subContents.forEach((subItem) => {
            console.error(`      - ${subItem}`);
          });
        } catch (e) {
          // Ignore
        }
      } else {
        console.error(`   📄 ${itemPath}`);
      }
    });
  } catch (e) {
    console.error('   (Could not read dist directory)');
  }
  process.exit(1);
}

// Chạy main file
require(mainPath);

