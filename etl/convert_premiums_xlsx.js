/**
 * Converte il foglio "Export" di gesamtbericht_ch.xlsx (priminfo.admin.ch)
 * in CSV per import_bag_premiums.ts. A differenza di B_NPA, qui l'header e'
 * gia' alla prima riga (nessuna riga di nota da saltare).
 *
 * Uso:
 *   node etl/convert_premiums_xlsx.js data/gesamtbericht_ch_2026.xlsx data/Praemien_CH.csv
 */

import fs from "node:fs";
import XLSX from "xlsx";

const [, , inputPath, outputPath] = process.argv;
const SHEET_NAME = "Export";

if (!inputPath || !outputPath) {
  console.error("Uso: node etl/convert_premiums_xlsx.js <input.xlsx> <output.csv>");
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);
const sheet = workbook.Sheets[SHEET_NAME];
if (!sheet) {
  console.error(`Foglio "${SHEET_NAME}" non trovato. Fogli disponibili: ${workbook.SheetNames.join(", ")}`);
  process.exit(1);
}

const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ";" });
fs.writeFileSync(outputPath, csv);

const rowCount = csv.split("\n").filter(Boolean).length;
console.log(`Foglio: "${SHEET_NAME}"`);
console.log(`Righe scritte: ${rowCount}`);
console.log(`-> ${outputPath}`);
