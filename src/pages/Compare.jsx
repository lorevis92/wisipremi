import { useEffect, useState } from "react";
import { recommend } from "../lib/recommend";
import {
  PREMIUM_YEAR,
  resolveCapToRegions,
  fetchInsurers,
  fetchTariffsForInsurer,
  fetchPremiumsForRegion,
} from "../lib/premiumsApi";

// Solo etichetta di visualizzazione: il valore che viene salvato/confrontato
// resta sempre il codice grezzo (tariff_code), mai inventato qui.
const TARIFF_LABELS = {
  "TAR-BASE": "Modello standard",
  "TAR-HAM": "Medico di famiglia",
  "TAR-HMO": "HMO",
  "TAR-DIV": "Altro modello (telemedicina, ecc.)",
};
const tariffLabel = (code) => TARIFF_LABELS[code] ?? code;

// Soglie eta' KVG standard, applicate all'anno dei premi in vigore.
function deriveAgeClass(birthYear) {
  const age = PREMIUM_YEAR - Number(birthYear);
  if (age <= 18) return "AKL-KIN";
  if (age <= 25) return "AKL-JUG";
  return "AKL-ERW";
}

export default function Compare() {
  const [form, setForm] = useState({
    plz: "",
    birthYear: "",
    currentFranchise: 300,
    expectedMedicalCosts: 500,
    currentBagNumber: "",
    currentTariff: "",
    accidentIncluded: false,
    openToRestrictedModel: false,
  });

  const [insurers, setInsurers] = useState([]);
  const [tariffOptions, setTariffOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState(null);
  const [resolvedRegion, setResolvedRegion] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchInsurers()
      .then(setInsurers)
      .catch(() => setError("Impossibile caricare l'elenco delle casse malati."));
  }, []);

  useEffect(() => {
    if (!form.currentBagNumber) {
      setTariffOptions([]);
      return;
    }
    fetchTariffsForInsurer(Number(form.currentBagNumber), PREMIUM_YEAR)
      .then((tariffs) => {
        setTariffOptions(tariffs);
        setForm((f) => (tariffs.includes(f.currentTariff) ? f : { ...f, currentTariff: "" }));
      })
      .catch(() => setError("Impossibile caricare le tariffe per questa cassa."));
  }, [form.currentBagNumber]);

  // Cambiare il CAP invalida la regione gia' risolta: va ricalcolata.
  function handlePlzChange(value) {
    setForm((f) => ({ ...f, plz: value }));
    setResolvedRegion(null);
    setRegionOptions(null);
  }

  async function runRecommendation(region) {
    setLoading(true);
    setError(null);
    try {
      const ageClass = deriveAgeClass(form.birthYear);
      const candidates = await fetchPremiumsForRegion(
        region.canton,
        region.regionCode,
        ageClass,
        PREMIUM_YEAR,
        form.accidentIncluded,
      );
      const recommendation = recommend(
        {
          canton: region.canton,
          regionCode: region.regionCode,
          ageClass,
          currentBagNumber: Number(form.currentBagNumber),
          currentFranchise: form.currentFranchise,
          currentTariff: form.currentTariff,
          accidentIncluded: form.accidentIncluded,
          expectedMedicalCosts: form.expectedMedicalCosts,
          openToRestrictedModel: form.openToRestrictedModel,
        },
        candidates,
      );
      setResult(recommendation);
    } catch (err) {
      setResult(null);
      setError(
        err.message === "Combinazione attuale non trovata nei dati UFSP."
          ? "Non troviamo la tua combinazione attuale (cassa/tariffa/franchigia) nei dati per questa regione/anno — controlla i dati inseriti, oppure l'import per questa zona non e' ancora disponibile."
          : "Si e' verificato un errore nel calcolo. Riprova.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    let region = resolvedRegion;

    if (!region) {
      setLoading(true);
      let options;
      try {
        options = await resolveCapToRegions(form.plz);
      } catch {
        setLoading(false);
        setError("Errore nel recupero della regione dal CAP.");
        return;
      }
      setLoading(false);

      if (options.length === 0) {
        setError("CAP non trovato nei dati UFSP.");
        return;
      }
      if (options.length === 1) {
        region = options[0];
        setResolvedRegion(region);
      } else {
        setRegionOptions(options);
        return; // aspetta che l'utente scelga la regione
      }
    }

    await runRecommendation(region);
  }

  function handleRegionPick(index) {
    const region = regionOptions[Number(index)];
    setResolvedRegion(region);
    setRegionOptions(null);
    runRecommendation(region);
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 4 }}>
        Trova la cassa malati giusta per te
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
        Confronto sul costo totale reale, non solo sul premio. Se conviene restare dove sei, te lo diciamo — anche se per noi vuol dire zero guadagno.
      </p>

      <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <label>
          NPA / Comune
          <input
            required
            value={form.plz}
            onChange={(e) => handlePlzChange(e.target.value)}
            placeholder="3904"
          />
        </label>

        {regionOptions && (
          <label>
            Il tuo CAP copre più regioni di premio — scegli la tua
            <select defaultValue="" onChange={(e) => handleRegionPick(e.target.value)}>
              <option value="" disabled>Seleziona la regione</option>
              {regionOptions.map((r, i) => (
                <option key={i} value={i}>{r.canton} — {r.regionCode}</option>
              ))}
            </select>
          </label>
        )}

        <label>
          Anno di nascita
          <input
            required
            type="number"
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
            placeholder="1992"
          />
        </label>

        <label>
          Cassa attuale
          <select
            required
            value={form.currentBagNumber}
            onChange={(e) => setForm({ ...form, currentBagNumber: e.target.value })}
          >
            <option value="" disabled>Seleziona la tua cassa</option>
            {insurers.map((i) => (
              <option key={i.bagNumber} value={i.bagNumber}>{i.name}</option>
            ))}
          </select>
        </label>

        <label>
          Tariffa attuale
          <select
            required
            disabled={!form.currentBagNumber}
            value={form.currentTariff}
            onChange={(e) => setForm({ ...form, currentTariff: e.target.value })}
          >
            <option value="" disabled>
              {form.currentBagNumber ? "Seleziona la tariffa" : "Scegli prima la cassa"}
            </option>
            {tariffOptions.map((t) => (
              <option key={t} value={t}>{tariffLabel(t)}</option>
            ))}
          </select>
        </label>

        <label>
          Franchigia attuale
          <select
            value={form.currentFranchise}
            onChange={(e) => setForm({ ...form, currentFranchise: Number(e.target.value) })}
          >
            {[300, 500, 1000, 1500, 2000, 2500].map((f) => (
              <option key={f} value={f}>{f} CHF</option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.accidentIncluded}
            onChange={(e) => setForm({ ...form, accidentIncluded: e.target.checked })}
          />
          Infortunio incluso nell'assicurazione di base
        </label>

        <label>
          Spese mediche annue attese (stima)
          <input
            type="number"
            value={form.expectedMedicalCosts}
            onChange={(e) => setForm({ ...form, expectedMedicalCosts: Number(e.target.value) })}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.openToRestrictedModel}
            onChange={(e) => setForm({ ...form, openToRestrictedModel: e.target.checked })}
          />
          Sono disposto a un modello con medico di famiglia, HMO o telemedicina, se conviene
        </label>

        <button className="auth-btn-in" type="submit" style={{ padding: "12px 20px" }} disabled={loading}>
          {loading ? "Calcolo in corso…" : "Calcola"}
        </button>

        {error && (
          <p role="alert" style={{ color: "var(--color-danger, #b3261e)", fontSize: 13 }}>
            {error}
          </p>
        )}
      </form>

      {result && (
        <div
          className={"card badge-" + (result.verdict === "stay" ? "stay" : "switch")}
          style={{ marginTop: 24, borderWidth: 2 }}
        >
          <h2 style={{ marginTop: 0 }}>{result.headline}</h2>
          <p>{result.explanation}</p>
          <p className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Quello che guadagniamo se segui questo consiglio: <b>{result.ourCommissionChf} CHF</b>
          </p>
          <ul style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {result.caveats.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
