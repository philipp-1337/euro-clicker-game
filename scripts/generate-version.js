// scripts/generate-version.js
// Liest die Version aus package.json und schreibt sie nach src/version.js

const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '../package.json');
const outPath = path.join(__dirname, '../src/version.js');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version || '0.0.0';

const content = `// Dieses File wird automatisch generiert. Nicht manuell editieren!\n// Enthält die aktuelle Version aus package.json\nexport const APP_VERSION = \"${version}\";\n`;

fs.writeFileSync(outPath, content);
console.log(`Version ${version} written to src/version.js`);
