import { supabase } from "./supabaseClient";

// TODO: aggiornare al prossimo import UFSP (vedi etl/import_bag_premiums.ts --year)
export const PREMIUM_YEAR = 2026;

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
