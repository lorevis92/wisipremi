/**
 * Import separato: nome leggibile degli assicuratori.
 * Fonte: zugelassene-krankenversicherer-<anno>-01-01.xlsx (priminfo.admin.ch),
 * foglio "Index " (Nummer, Name, Ort) - l'altro foglio ("Zugelassene
 * Krankenversicherer") ha celle multi-riga per la stampa, non dati puliti.
 *
 * Va lanciato DOPO l'import dei premi (che crea le righe in insurers via FK,
 * senza nome), mai prima: qui si fa solo un upsert del nome sopra righe che
 * gia' esistono.
 *
 * Uso:
 *   npx tsx etl/import_insurer_names.ts data/zugelassene-krankenversicherer-2026-01-01.xlsx
 */

import XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const [, , inputPath] = process.argv;
if (!inputPath) {
  console.error("Uso: npx tsx etl/import_insurer_names.ts <zugelassene-krankenversicherer.xlsx>");
  process.exit(1);
}

const SHEET_NAME = "Index ";

const workbook = XLSX.readFile(inputPath);
const sheet = workbook.Sheets[SHEET_NAME];
if (!sheet) {
  console.error(`Foglio "${SHEET_NAME}" non trovato. Fogli disponibili: ${workbook.SheetNames.join(", ")}`);
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });

const headerRowIndex = rows.findIndex((r) => r.some((c) => String(c).trim() === "Nummer"));
if (headerRowIndex === -1) {
  console.error('Riga di header ("Nummer") non trovata nel foglio.');
  process.exit(1);
}
const header = rows[headerRowIndex].map((c) => String(c).trim());
const bagIdx = header.indexOf("Nummer");
const nameIdx = header.indexOf("Name");

const insurers = rows
  .slice(headerRowIndex + 1)
  .map((row) => ({ bag_number: parseInt(row[bagIdx], 10), name: String(row[nameIdx] || "").trim() }))
  .filter((r) => Number.isFinite(r.bag_number) && r.name);

console.log(`${insurers.length} assicuratori trovati, upsert su insurers.name...`);

const { error } = await supabase
  .from("insurers")
  .upsert(insurers, { onConflict: "bag_number" });

if (error) throw error;
console.log("Fatto.");
