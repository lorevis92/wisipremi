import { useState } from "react";
// import { recommend } from "../lib/recommend";
// import { supabase } from "../lib/supabaseClient";

/**
 * Pagina principale: form a 4 campi -> verdetto onesto.
 *
 * TODO per Claude Code (passo 1):
 * 1. Collegare supabaseClient.js (creare in src/lib/) con le env VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * 2. Sostituire MOCK_RESULT con una vera query a `premiums` filtrata su canton/regionCode/ageClass
 * 3. Chiamare recommend() da src/lib/recommend.ts con i dati reali
 * 4. Il blocco "cosa guadagniamo" (ourCommissionChf) va SEMPRE visibile, mai in un accordion chiuso
 */

const MOCK_RESULT = {
  verdict: "stay",
  headline: "Ti conviene restare dove sei.",
  explanation:
    "La tua combinazione attuale è già la migliore fra quelle disponibili nella tua regione, viste le spese mediche indicate.",
  annualSaving: 0,
  ourCommissionChf: 0,
  caveats: ["Con questo consiglio non guadagniamo nulla: la provvigione la riceviamo solo se cambi."],
};

export default function Compare() {
  const [form, setForm] = useState({
    plz: "",
    birthYear: "",
    currentFranchise: 300,
    expectedMedicalCosts: 500,
  });
  const [result, setResult] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: sostituire con la vera chiamata a Supabase + recommend()
    setResult(MOCK_RESULT);
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
            onChange={(e) => setForm({ ...form, plz: e.target.value })}
            placeholder="3904"
          />
        </label>
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
        <label>
          Spese mediche annue attese (stima)
          <input
            type="number"
            value={form.expectedMedicalCosts}
            onChange={(e) => setForm({ ...form, expectedMedicalCosts: Number(e.target.value) })}
          />
        </label>
        <button className="auth-btn-in" type="submit" style={{ padding: "12px 20px" }}>
          Calcola
        </button>
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
