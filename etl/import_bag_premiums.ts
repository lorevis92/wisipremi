/**
 * ETL — UFSP/BAG "Krankenversicherungsprämien" -> Supabase
 *
 * npm i @supabase/supabase-js csv-parse iconv-lite tsx
 *
 * Uso:
 *   npx tsx etl/import_bag_premiums.ts inspect ./data/Praemien_CH.csv
 *   npx tsx etl/import_bag_premiums.ts import  ./data/Praemien_CH.csv --year 2026
 *   npx tsx etl/import_bag_premiums.ts regions ./data/Einzugsgebiete.csv --year 2026
 *
 * Nota: il BAG cambia i nomi delle colonne tra un anno e l'altro.
 * Lancia SEMPRE `inspect` prima di `import` e aggiorna COLUMN_ALIASES.
 */

import fs from "node:fs";
import { parse } from "csv-parse";
import iconv from "iconv-lite";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role: bypassa RLS, mai nel frontend
);

const BATCH = 2000;

/* ------------------------------------------------------------------ */
/* Mapping colonne — l'unico punto da aggiornare ogni anno            */
/* ------------------------------------------------------------------ */
const COLUMN_ALIASES: Record<string, string[]> = {
  canton:       ["Kanton", "Canton", "Cantone"],
  region:       ["Region", "Région", "Regione"],
  bagNumber:    ["Versicherer", "Assureur", "Assicuratore", "Versicherer_Nr"],
  insurerName:  ["Versicherer_Name", "Nom", "Name", "Bezeichnung"],
  tariffType:   ["Tariftyp"],
  productCode:  ["Tarif"],
  tariffLabel:  ["Tarifbezeichnung", "Tarif_Bezeichnung", "Produkt"],
  ageClass:     ["Altersklasse", "Classe_age", "Altersgruppe"],
  ageSubgroup:  ["Altersuntergruppe", "Untergruppe"],
  franchise:    ["Franchise", "Franchigia"],
  accident:     ["Unfalleinschluss", "Unfall", "Accident"],
  premium:      ["Praemie", "Prämie", "Prime", "Premio"],
};

function buildMap(header: string[]): Record<string, number> {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[\s._-]/g, "");
  const map: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = header.findIndex((h) => aliases.some((a) => norm(a) === norm(h)));
    if (idx >= 0) map[field] = idx;
  }
  const required = ["canton", "region", "bagNumber", "tariffType", "ageClass", "franchise", "premium"];
  const missing = required.filter((f) => !(f in map));
  if (missing.length) {
    throw new Error(
      `Colonne non trovate: ${missing.join(", ")}\n` +
      `Header reale: ${header.join(" | ")}\n` +
      `Aggiorna COLUMN_ALIASES in questo file.`,
    );
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Mapping colonne per Einzugsgebiete.csv (comuni/CAP -> regione)      */
/* Header bilingue concatenato (es. "BFS-Nr. No OFS"): match per       */
/* prefisso, non per uguaglianza esatta come in buildMap.              */
/* La colonna flag (* / +) non ha un header proprio nel file           */
/* convertito da B_NPA: resta indice posizionale 0, fisso.             */
/* ------------------------------------------------------------------ */
const REGION_COLUMN_ALIASES: Record<string, string[]> = {
  plz:              ["PLZ"],
  canton:           ["Kanton"],
  region:           ["Region"],
  bfsNumber:        ["BFS-Nr.", "BFS-Nr"],
  municipalityName: ["Gemeinde"],
};

function buildRegionMap(header: string[]): Record<string, number> {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[\s._-]/g, "");
  const map: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(REGION_COLUMN_ALIASES)) {
    const idx = header.findIndex((h) => aliases.some((a) => norm(h).startsWith(norm(a))));
    if (idx >= 0) map[field] = idx;
  }
  const required = ["plz", "canton", "region", "bfsNumber", "municipalityName"];
  const missing = required.filter((f) => !(f in map));
  if (missing.length) {
    throw new Error(
      `Colonne regioni non trovate: ${missing.join(", ")}\n` +
      `Header reale: ${header.join(" | ")}\n` +
      `Aggiorna REGION_COLUMN_ALIASES in questo file.`,
    );
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* Lettura CSV (il BAG usa ';' e talvolta latin1)                      */
/* ------------------------------------------------------------------ */
function readRows(path: string, encoding = "utf8") {
  return fs
    .createReadStream(path)
    .pipe(iconv.decodeStream(encoding))
    .pipe(parse({ delimiter: ";", relax_column_count: true, skip_empty_lines: true, trim: true }));
}

/* ------------------------------------------------------------------ */
/* inspect — guarda cosa c'è dentro prima di importare                 */
/* ------------------------------------------------------------------ */
async function inspect(path: string) {
  let i = 0;
  const distinct: Record<string, Set<string>> = {};
  let header: string[] = [];

  for await (const row of readRows(path)) {
    if (i === 0) {
      header = row;
      console.log("\nHEADER:");
      header.forEach((h, n) => console.log(`  [${n}] ${h}`));
      console.log("\nPRIME 3 RIGHE:");
    } else if (i <= 3) {
      console.log(" ", row.join(" | "));
    }
    if (i > 0 && i < 50000) {
      header.forEach((h, n) => {
        if (/tarif|alters|unfall|region|franchise/i.test(h)) {
          (distinct[h] ??= new Set()).add(row[n]);
        }
      });
    }
    i++;
    if (i > 50000) break;
  }

  console.log("\nVALORI DISTINTI (campi categoriali):");
  for (const [col, vals] of Object.entries(distinct)) {
    const list = [...vals].slice(0, 25);
    console.log(`  ${col}: ${list.join(", ")}${vals.size > 25 ? ` … (${vals.size})` : ""}`);
  }
  console.log(`\nRighe lette: ${i - 1}\n`);
}

/* ------------------------------------------------------------------ */
/* import — premi                                                      */
/* ------------------------------------------------------------------ */
const ACCIDENT_TRUE = new Set(["MIT", "OUI", "AVEC", "1", "J", "JA"]);

async function importPremiums(path: string, year: number) {
  let map: Record<string, number> | null = null;
  let buffer: any[] = [];
  const insurers = new Map<number, string>();
  let total = 0;

  const flush = async () => {
    if (!buffer.length) return;
    const { error } = await supabase
      .from("premiums")
      .upsert(buffer, { onConflict: "year,canton,region_code,bag_number,tariff_code,product_code,age_class,age_subgroup,franchise,accident_included" });
    if (error) throw error;
    total += buffer.length;
    process.stdout.write(`\r  importate ${total} righe…`);
    buffer = [];
  };

  for await (const row of readRows(path)) {
    if (!map) { map = buildMap(row); continue; }

    const g = (f: string) => (map![f] !== undefined ? row[map![f]] : null);
    const bagNumber = parseInt(g("bagNumber"), 10);
    if (!Number.isFinite(bagNumber)) continue;

    const name = g("insurerName");
    if (name && !insurers.has(bagNumber)) insurers.set(bagNumber, name);

    buffer.push({
      year,
      canton: g("canton"),
      region_code: g("region"),
      bag_number: bagNumber,
      tariff_code: g("tariffType"),
      tariff_label: g("tariffLabel"),
      product_code: g("productCode") || "",
      age_class: g("ageClass"),
      age_subgroup: g("ageSubgroup") || "",
      franchise: parseInt(String(g("franchise")).replace(/\D/g, ""), 10) || 0,
      accident_included: String(g("accident")).toUpperCase().startsWith("MIT"),
      premium_chf: parseFloat(String(g("premium")).replace(",", ".")),
    });

    if (buffer.length >= BATCH) await flush();
  }
  await flush();

  // Gli assicuratori vanno inseriti prima (FK): in pratica lancia questo
  // una volta a vuoto, poi di nuovo. Oppure pre-popola con il file Tarife.
  if (insurers.size) {
    const rows = [...insurers].map(([bag_number, name]) => ({ bag_number, name }));
    await supabase.from("insurers").upsert(rows, { onConflict: "bag_number" });
  }

  console.log(`\n✔ ${total} premi importati per l'anno ${year}`);
}

/* ------------------------------------------------------------------ */
/* import — comuni / regioni di premio                                 */
/* ------------------------------------------------------------------ */
async function importRegions(path: string, year: number) {
  let map: Record<string, number> | null = null;
  const municipalities = new Map<number, { bfs_number: number; name: string; canton: string; region_code: string; year: number }>();
  const postalCodes = new Map<string, { plz: number; bfs_number: number; region_code: string; region_ambiguous: boolean }>();
  let rowsRead = 0;

  for await (const row of readRows(path)) {
    if (!map) { map = buildRegionMap(row); continue; }

    const g = (f: string) => (map![f] !== undefined ? row[map![f]] : null);
    const bfsNumber = parseInt(g("bfsNumber"), 10);
    const plz = parseInt(g("plz"), 10);
    if (!Number.isFinite(bfsNumber) || !Number.isFinite(plz)) continue;

    const canton = g("canton");
    const region = g("region");
    const name = g("municipalityName");
    const flag = String(row[0] ?? "").trim(); // colonna flag: indice posizionale fisso, nessun header proprio

    rowsRead++;

    if (!municipalities.has(bfsNumber)) {
      municipalities.set(bfsNumber, { bfs_number: bfsNumber, name, canton, region_code: region, year });
    }

    // Piu' Ortsbezeichnung (sotto-localita') possono condividere lo stesso
    // plz+comune+regione: non ci serve quella granularita', l'ultima vince.
    postalCodes.set(`${plz}|${bfsNumber}|${region}`, { plz, bfs_number: bfsNumber, region_code: region, region_ambiguous: flag !== "" });
  }

  console.log(`${rowsRead} righe lette, ${postalCodes.size} chiavi uniche (${rowsRead - postalCodes.size} sotto-località duplicate scartate)`);

  const municipalityRows = [...municipalities.values()];
  for (let i = 0; i < municipalityRows.length; i += BATCH) {
    const { error } = await supabase
      .from("municipalities")
      .upsert(municipalityRows.slice(i, i + BATCH), { onConflict: "bfs_number" });
    if (error) throw error;
  }
  console.log(`✔ ${municipalityRows.length} comuni importati`);

  const postalCodeRows = [...postalCodes.values()];
  for (let i = 0; i < postalCodeRows.length; i += BATCH) {
    const { error } = await supabase
      .from("postal_codes")
      .upsert(postalCodeRows.slice(i, i + BATCH), { onConflict: "plz,bfs_number,region_code" });
    if (error) throw error;
  }
  console.log(`✔ ${postalCodeRows.length} CAP importati`);
}

/* ------------------------------------------------------------------ */
const [, , cmd, file, ...rest] = process.argv;
const yearArg = parseInt(rest[rest.indexOf("--year") + 1] ?? "", 10) || new Date().getFullYear() + 1;

(async () => {
  if (cmd === "inspect") await inspect(file);
  else if (cmd === "import") await importPremiums(file, yearArg);
  else if (cmd === "regions") await importRegions(file, yearArg);
  else console.log("Comandi: inspect | import | regions");
})().catch((e) => { console.error("\n✖", e.message); process.exit(1); });
