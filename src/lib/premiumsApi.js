import { supabase } from "./supabaseClient";

// TODO: aggiornare al prossimo import UFSP (vedi etl/import_bag_premiums.ts --year)
export const PREMIUM_YEAR = 2026;

// Ordine fisso dei 4 tariff_code noti nei dati UFSP - usato sia per le card
// descrittive dei modelli sia per l'ordine delle colonne della griglia.
export const TARIFF_CODE_ORDER = ["TAR-BASE", "TAR-HAM", "TAR-HMO", "TAR-DIV"];

/**
 * Risolve un CAP nelle combinazioni canton+regionCode possibili.
 * L'ambiguita' e' calcolata contando le coppie (canton, regionCode) DISTINTE
 * per quel CAP, non il flag grezzo del file sorgente: il flag "+" (stessa
 * regione, comuni diversi) non e' ambiguita' di regione, solo "*" lo e'.
 */
export async function resolveCapToRegions(plz) {
  const { data, error } = await supabase
    .from("postal_codes")
    .select("region_code, municipalities(canton)")
    .eq("plz", plz);
  if (error) throw error;

  const seen = new Map();
  for (const row of data ?? []) {
    const canton = row.municipalities?.canton;
    if (!canton) continue;
    const key = `${canton}|${row.region_code}`;
    if (!seen.has(key)) seen.set(key, { canton, regionCode: row.region_code });
  }

  const options = [...seen.values()];
  const ambiguous = options.length > 1;
  return options.map((o) => ({ ...o, ambiguous }));
}

export async function fetchInsurers() {
  const { data, error } = await supabase
    .from("insurers")
    .select("bag_number, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({ bagNumber: r.bag_number, name: r.name }));
}

/** Valori distinti di tariff_code offerti da un assicuratore per un anno. */
export async function fetchTariffsForInsurer(bagNumber, year) {
  const { data, error } = await supabase
    .from("premiums")
    .select("tariff_code")
    .eq("bag_number", bagNumber)
    .eq("year", year);
  if (error) throw error;
  return [...new Set((data ?? []).map((r) => r.tariff_code))];
}

/**
 * Premi disponibili per una regione/eta'/anno, filtrati anche per
 * accident_included: senza questo filtro, candidates mescolerebbe righe
 * MIT-UNF/OHN-UNF che non sono confrontabili (PremiumRow non porta questa
 * dimensione, va risolta qui in query).
 */
export async function fetchPremiumsForRegion(canton, regionCode, ageClass, year, accidentIncluded) {
  const { data, error } = await supabase
    .from("premiums")
    .select("bag_number, tariff_code, tariff_label, franchise, premium_chf, insurers(name)")
    .eq("canton", canton)
    .eq("region_code", regionCode)
    .eq("age_class", ageClass)
    .eq("year", year)
    .eq("accident_included", accidentIncluded);
  if (error) throw error;

  return (data ?? []).map((r) => ({
    bagNumber: r.bag_number,
    insurerName: r.insurers?.name ?? "",
    tariffCode: r.tariff_code,
    tariffLabel: r.tariff_label,
    franchise: r.franchise,
    premiumChf: Number(r.premium_chf),
  }));
}

/**
 * Organizza candidates (gia' fetchati, nessuna nuova query) in una griglia
 * franchigia x tariff_code per UNA SOLA cassa (quella scelta dall'utente).
 * Se piu' righe combaciano sulla stessa cella (piu' product_code sotto lo
 * stesso tariff_code+franchigia, vedi LIMITE NOTO in recommend.ts), mostra
 * il premio piu' basso tra quelli disponibili in quella cella.
 */
export function buildPremiumGrid(candidates, bagNumber) {
  const franchises = [...new Set(candidates.map((c) => c.franchise))].sort((a, b) => a - b);
  const sameInsurer = candidates.filter((c) => c.bagNumber === bagNumber);
  const tariffCodes = TARIFF_CODE_ORDER.filter((code) => sameInsurer.some((c) => c.tariffCode === code));

  function cell(franchise, tariffCode) {
    const matches = sameInsurer.filter((c) => c.franchise === franchise && c.tariffCode === tariffCode);
    if (!matches.length) return null;
    return Math.min(...matches.map((c) => c.premiumChf));
  }

  return { franchises, tariffCodes, cell };
}

/**
 * Le N casse piu' economiche (tra tutte quelle in candidates, gia' fetchati)
 * per una combinazione franchigia+tariffa fissa - nessuna nuova query.
 * Se una cassa ha piu' righe sulla stessa cella (vedi LIMITE NOTO), conta
 * solo la piu' economica delle sue.
 */
export function topInsurersFor(candidates, franchise, tariffCode, limit = 5) {
  const matches = candidates.filter((c) => c.franchise === franchise && c.tariffCode === tariffCode);
  const cheapestByInsurer = new Map();
  for (const c of matches) {
    const prev = cheapestByInsurer.get(c.bagNumber);
    if (!prev || c.premiumChf < prev.premiumChf) cheapestByInsurer.set(c.bagNumber, c);
  }
  return [...cheapestByInsurer.values()].sort((a, b) => a.premiumChf - b.premiumChf).slice(0, limit);
}
