// scripts/generate-version.js
// Liest die Version aus package.json und schreibt sie nach src/version.js


import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname-Äquivalent bauen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const pkgPath = path.join(__dirname, "../package.json");
  const outPath = path.join(__dirname, "../src/version.js");

  const pkgData = await fs.readFile(pkgPath, "utf8");
  const pkg = JSON.parse(pkgData);
  const version = pkg.version || "0.0.0";

  const content = `// Dieses File wird automatisch generiert. Nicht manuell editieren!
// Enthält die aktuelle Version aus package.json
export const APP_VERSION = "${version}";
`;

  await fs.writeFile(outPath, content);
  console.log(`Version ${version} written to src/version.js`);
}

main().catch((err) => {
  console.error("Fehler beim Generieren der Version:", err);
  process.exit(1);
});
