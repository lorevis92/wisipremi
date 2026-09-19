/**
 * Converte il foglio B_NPA di "praemienregionen.xlsx" (priminfo.admin.ch) in CSV,
 * cosi' etl:regions puo' leggerlo. B_NPA e' indicizzato per PLZ (non per comune)
 * perche' il form del sito chiede il CAP all'utente, e porta le colonne di flag
 * (*, +) per i CAP divisi su piu' regioni/comuni - vedi README per il motivo.
 *
 * Il file cambia leggermente struttura ogni anno (righe di nota in testa,
 * numero di colonne), quindi l'header non e' a una riga fissa: lo script lo
 * cerca cercando la prima riga che contiene sia "PLZ" sia "Region"/"Kanton".
 * L'ordine delle colonne NON viene toccato: e' compito di chi legge questo CSV
 * (import_bag_premiums.ts / importRegions) fare matching per nome colonna,
 * non per posizione - stesso pattern di COLUMN_ALIASES usato per i premi.
 *
 * Uso:
 *   node etl/convert_regions_xlsx.js data/praemienregionen_2026.xlsx data/Einzugsgebiete.csv
 */

import fs from "node:fs";
import XLSX from "xlsx";

const [, , inputPath, outputPath] = process.argv;
const SHEET_NAME = "B_NPA";

if (!inputPath || !outputPath) {
  console.error("Uso: node etl/convert_regions_xlsx.js <input.xlsx> <output.csv>");
  process.exit(1);
}

const workbook = XLSX.readFile(inputPath);
const sheet = workbook.Sheets[SHEET_NAME];
if (!sheet) {
  console.error(`Foglio "${SHEET_NAME}" non trovato. Fogli disponibili: ${workbook.SheetNames.join(", ")}`);
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });

const flatten = (cell) => (cell == null ? "" : String(cell).replace(/\s+/g, " ").trim());

const HEADER_KEYWORDS = /^(plz|kanton|region|bfs|gemeinde|bezirk|ortsbezeichnung|commune|canton|district|localit)/i;

const headerRowIndex = rows.findIndex((row) => {
  const matches = row.filter((cell) => {
    const v = flatten(cell);
    return v.length < 40 && HEADER_KEYWORDS.test(v);
  });
  return matches.length >= 4;
});

if (headerRowIndex === -1) {
  console.error(`Riga di header non trovata nel foglio "${SHEET_NAME}" (cercavo "PLZ" + "Region"/"Kanton").`);
  console.error("Prime 10 righe del foglio, per capire cosa e' cambiato:");
  rows.slice(0, 10).forEach((r, i) => console.error(i, JSON.stringify(r.map(flatten))));
  process.exit(1);
}

const regionColIndex = rows[headerRowIndex].findIndex((cell) => /^region/i.test(flatten(cell)));
if (regionColIndex === -1) {
  console.error(`Colonna "Region" non trovata nell'header: ${JSON.stringify(rows[headerRowIndex].map(flatten))}`);
  process.exit(1);
}

const dataRows = rows.slice(headerRowIndex).filter((r) => r.some((c) => flatten(c) !== ""));

// Praemien_CH.csv usa il formato "PR-REG CH<n>" per la regione; qui il file
// priminfo.admin.ch porta solo il numero grezzo. Normalizziamo qui cosi' il
// join con premiums.region_code funziona senza toccare schema/import script.
const csvLines = dataRows.map((row, i) =>
  row.map((cell, colIndex) => {
    let v = flatten(cell);
    if (i > 0 && colIndex === regionColIndex && /^\d+$/.test(v)) {
      v = `PR-REG CH${v}`;
    }
    return v.includes(";") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(";"),
);

fs.writeFileSync(outputPath, csvLines.join("\n") + "\n");

console.log(`Foglio: "${SHEET_NAME}"`);
console.log(`Header trovato a riga ${headerRowIndex} (0-indexed): ${JSON.stringify(rows[headerRowIndex].map(flatten))}`);
console.log(`Righe dati scritte: ${csvLines.length - 1}`);
console.log(`-> ${outputPath}`);
