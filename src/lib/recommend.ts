/**
 * Motore di raccomandazione.
 *
 * Regola di design: il verdetto "resta dove sei" è un risultato di prima
 * classe, non un fallback. Viene restituito ogni volta che il guadagno reale
 * non supera la soglia di rilevanza, anche se questo significa zero provvigione.
 */

export type Verdict = "stay" | "switch_insurer" | "adjust_franchise" | "adjust_model";

export interface UserInput {
  canton: string;
  regionCode: string;
  ageClass: "AKL-KIN" | "AKL-JUG" | "AKL-ERW";
  currentBagNumber: number;
  currentFranchise: number;
  currentTariff: string;
  accidentIncluded: boolean;
  /** Spese mediche annue attese in CHF. L'utente le stima, noi mostriamo gli scenari. */
  expectedMedicalCosts: number;
  /** L'utente è disposto a passare a un modello con medico di famiglia / telemedicina? */
  openToRestrictedModel: boolean;
}

export interface PremiumRow {
  bagNumber: number;
  insurerName: string;
  tariffCode: string;
  tariffLabel: string | null;
  franchise: number;
  premiumChf: number;
}

/** Provvigione massima per l'assicurazione di base, tetto BVV in vigore. */
export const COMMISSION_PER_SWITCH_CHF = 70;

/** Sotto questa soglia annua non vale la pena far cambiare qualcuno. */
export const RELEVANCE_THRESHOLD_CHF = 240; // 20 CHF/mese

/* ------------------------------------------------------------------ */
/* Costo totale reale = premi + partecipazione ai costi                */
/* ------------------------------------------------------------------ */
const COINSURANCE_RATE = 0.10;
const COINSURANCE_CAP = { adult: 700, child: 350 };

export function annualTotalCost(
  monthlyPremium: number,
  franchise: number,
  medicalCosts: number,
  isChild: boolean,
): number {
  const cap = isChild ? COINSURANCE_CAP.child : COINSURANCE_CAP.adult;
  const paidFranchise = Math.min(medicalCosts, franchise);
  const coinsurance = Math.min(
    Math.max(0, medicalCosts - franchise) * COINSURANCE_RATE,
    cap,
  );
  return monthlyPremium * 12 + paidFranchise + coinsurance;
}

/**
 * Soglia di indifferenza tra due franchigie, a parità di assicuratore.
 * Restituisce le spese mediche annue oltre le quali conviene la franchigia bassa.
 */
export function franchiseBreakeven(
  lowFranchise: { franchise: number; monthlyPremium: number },
  highFranchise: { franchise: number; monthlyPremium: number },
  isChild: boolean,
): number {
  for (let costs = 0; costs <= 20000; costs += 50) {
    const low = annualTotalCost(lowFranchise.monthlyPremium, lowFranchise.franchise, costs, isChild);
    const high = annualTotalCost(highFranchise.monthlyPremium, highFranchise.franchise, costs, isChild);
    if (low < high) return costs;
  }
  return Infinity; // la franchigia alta conviene sempre
}

/* ------------------------------------------------------------------ */
/* Il verdetto                                                         */
/* ------------------------------------------------------------------ */
export interface Recommendation {
  verdict: Verdict;
  headline: string;
  explanation: string;
  currentAnnualCost: number;
  bestAnnualCost: number;
  annualSaving: number;
  best: PremiumRow | null;
  /** Quello che incassiamo se l'utente segue questo consiglio. Sempre mostrato. */
  ourCommissionChf: number;
  /** Avvertenze oneste, incluse quelle che ci costano la provvigione. */
  caveats: string[];
}

export function recommend(input: UserInput, candidates: PremiumRow[]): Recommendation {
  const isChild = input.ageClass === "AKL-KIN";
  const costs = input.expectedMedicalCosts;

  // LIMITE NOTO: candidates non porta product_code. Se un assicuratore ha piu'
  // prodotti sotto lo stesso tariff_code+franchigia (es. CSS 01_016 vs 01_046,
  // caso reale nei dati UFSP), .find() prende il primo che trova: puo' non
  // essere il prodotto specifico dell'utente. Non risolto per ora.
  const current = candidates.find(
    (c) =>
      c.bagNumber === input.currentBagNumber &&
      c.franchise === input.currentFranchise &&
      c.tariffCode === input.currentTariff,
  );
  if (!current) throw new Error("Combinazione attuale non trovata nei dati UFSP.");

  const currentAnnualCost = annualTotalCost(current.premiumChf, current.franchise, costs, isChild);

  const pool = input.openToRestrictedModel
    ? candidates
    : candidates.filter((c) => c.tariffCode === "TAR-BASE" || c.tariffCode === input.currentTariff);

  const scored = pool
    .map((c) => ({ row: c, total: annualTotalCost(c.premiumChf, c.franchise, costs, isChild) }))
    .sort((a, b) => a.total - b.total);

  const best = scored[0];
  const saving = Math.round(currentAnnualCost - best.total);
  const caveats: string[] = [];

  // --- Caso 1: restare conviene, o il guadagno è irrilevante ---------
  if (saving < RELEVANCE_THRESHOLD_CHF) {
    return {
      verdict: "stay",
      headline: "Ti conviene restare dove sei.",
      explanation:
        saving <= 0
          ? "La tua combinazione attuale è già la migliore fra quelle disponibili nella tua regione, viste le spese mediche che hai indicato."
          : `Il risparmio massimo possibile sarebbe di circa ${saving} CHF all'anno: sotto la soglia oltre la quale, secondo noi, vale la pena cambiare assicuratore e rifare tutte le pratiche.`,
      currentAnnualCost,
      bestAnnualCost: best.total,
      annualSaving: Math.max(0, saving),
      best: null,
      ourCommissionChf: 0,
      caveats: [
        "Con questo consiglio non guadagniamo nulla: la provvigione la riceviamo solo se cambi.",
      ],
    };
  }

  // --- Caso 2: basta cambiare franchigia, stesso assicuratore --------
  const sameInsurerBest = scored.find((s) => s.row.bagNumber === input.currentBagNumber);
  if (
    sameInsurerBest &&
    currentAnnualCost - sameInsurerBest.total >= saving * 0.7 &&
    sameInsurerBest.row.franchise !== current.franchise
  ) {
    const gain = Math.round(currentAnnualCost - sameInsurerBest.total);
    return {
      verdict: "adjust_franchise",
      headline: `Cambia franchigia, non assicuratore: circa ${gain} CHF all'anno.`,
      explanation: `Restando in ${current.insurerName} e passando alla franchigia da ${sameInsurerBest.row.franchise} CHF ottieni quasi tutto il risparmio possibile, senza cambiare cassa.`,
      currentAnnualCost,
      bestAnnualCost: sameInsurerBest.total,
      annualSaving: gain,
      best: sameInsurerBest.row,
      ourCommissionChf: 0,
      caveats: [
        "Anche qui non guadagniamo nulla: la provvigione scatta solo con un cambio di assicuratore.",
        "Una franchigia alta conviene solo se le tue spese mediche restano basse. Se la tua situazione di salute è incerta, valuta con prudenza.",
      ],
    };
  }

  // --- Caso 3: cambio di assicuratore --------------------------------
  if (best.row.tariffCode !== "TAR-BASE" && best.row.tariffCode !== input.currentTariff) {
    caveats.push(
      "Il modello proposto limita la libera scelta del medico: dovrai passare prima dal medico di famiglia, da un centro HMO o dalla telemedicina.",
    );
  }
  if (best.row.franchise > input.currentFranchise) {
    caveats.push(
      `La franchigia sale da ${input.currentFranchise} a ${best.row.franchise} CHF: in un anno con problemi di salute pagheresti di più di tasca tua.`,
    );
  }
  caveats.push(
    "Le assicurazioni complementari non si trasferiscono automaticamente e possono richiedere un questionario sulla salute. Non disdire le complementari prima di avere l'accettazione scritta della nuova cassa.",
  );
  caveats.push(
    `Se cambi tramite noi riceviamo ${COMMISSION_PER_SWITCH_CHF} CHF dalla nuova cassa. È lo stesso importo per tutte le casse, quindi non abbiamo motivo di spingerne una in particolare.`,
  );

  return {
    verdict: best.row.tariffCode !== input.currentTariff ? "adjust_model" : "switch_insurer",
    headline: `Passando a ${best.row.insurerName} risparmi circa ${saving} CHF all'anno.`,
    explanation: `Calcolo sul costo totale, non solo sul premio: premi annui più franchigia e partecipazione ai costi, ipotizzando ${costs} CHF di spese mediche.`,
    currentAnnualCost,
    bestAnnualCost: best.total,
    annualSaving: saving,
    best: best.row,
    ourCommissionChf: COMMISSION_PER_SWITCH_CHF,
    caveats,
  };
}

/* ------------------------------------------------------------------ */
/* "Loyalty tax": la cassa più economica oggi lo sarà ancora domani?   */
/* Alimentato dalla view insurer_yearly_change.                        */
/* ------------------------------------------------------------------ */
export interface InsurerHistory {
  bagNumber: number;
  avgChangePct: number;   // aumento medio annuo negli ultimi N anni
  avgRankDrift: number;   // >0 = scivola verso il caro anno dopo anno
  yearsObserved: number;
}

export function loyaltyTaxWarning(h: InsurerHistory): string | null {
  if (h.yearsObserved < 4) return null;
  if (h.avgRankDrift > 3 && h.avgChangePct > 4) {
    return `Attenzione: negli ultimi ${h.yearsObserved} anni questa cassa ha alzato i premi in media del ${h.avgChangePct.toFixed(1)}% e ha perso ${Math.round(h.avgRankDrift)} posizioni di competitività. Storicamente è un profilo da "entra economica, poi rincara".`;
  }
  return null;
}
