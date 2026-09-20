import { useEffect, useState } from "react";
import { recommend } from "../lib/recommend";
import {
  PREMIUM_YEAR,
  TARIFF_CODE_ORDER,
  resolveCapToRegions,
  fetchInsurers,
  fetchTariffsForInsurer,
  fetchPremiumsForRegion,
  buildPremiumGrid,
  topInsurersFor,
} from "../lib/premiumsApi";
import { CONCEPTS } from "../content/concepts";
import VideoPlaceholder from "../components/VideoPlaceholder";
import { Link } from "react-router-dom";

// Soglie eta' KVG standard, applicate all'anno dei premi in vigore.
function deriveAgeClass(birthYear) {
  const age = PREMIUM_YEAR - Number(birthYear);
  if (age <= 18) return "AKL-KIN";
  if (age <= 25) return "AKL-JUG";
  return "AKL-ERW";
}

function franchiseExplanation(amount) {
  return `Fino a ${amount} CHF di spese mediche in un anno le paghi tu; oltre, comincia a ` +
    "contribuire la cassa (con una piccola parte a tuo carico fino al tetto).";
}

function formatPremium(monthly) {
  if (monthly == null) return "n/d";
  return `${monthly.toFixed(2)} CHF/mese (${(monthly * 12).toFixed(2)}/anno)`;
}

function FieldExplainer({ question, text, example, children }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-section)",
        padding: 20,
      }}
    >
      <p style={{ fontWeight: 700, margin: "0 0 8px", fontSize: 16 }}>{question}</p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>{text}</p>
      {example && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>{example}</p>
      )}
      <VideoPlaceholder />
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
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
  const [candidates, setCandidates] = useState([]);
  const [selectedGridInsurer, setSelectedGridInsurer] = useState(null);

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
      setCandidates(candidates);
      setSelectedGridInsurer(Number(form.currentBagNumber));
    } catch (err) {
      setResult(null);
      setCandidates([]);
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

      <div className="card" style={{ background: "var(--surface)", marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          L'assicurazione di base (LAMal) copre esattamente le stesse prestazioni presso ogni
          cassa malati in Svizzera — è la legge a deciderlo, non la compagnia. Nessuna cassa può
          offrire di più, nessuna può offrire di meno, e nessuna può rifiutarti. Quello che varia
          da cassa a cassa è <b>solo</b> il prezzo, il modello di accesso al medico (libera
          scelta, medico di famiglia, HMO, Telmed) e — se la scegli — l'assicurazione
          complementare, che è tutt'altra cosa.
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
        <div
          style={{
            display: "grid",
            gap: 16,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-section)",
            padding: 20,
          }}
        >
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
        </div>

        <FieldExplainer
          question="Come vuoi accedere alle cure quando ti servono?"
          text={CONCEPTS["modelli-tariffari"].text}
        >
          <div style={{ display: "grid", gap: 10, margin: "4px 0 12px" }}>
            {TARIFF_CODE_ORDER.map((code) => {
              const opt = CONCEPTS["modelli-tariffari"].options[code];
              return (
                <div
                  key={code}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-section)",
                    padding: "10px 12px",
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13 }}>{opt.title}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-secondary)" }}>{opt.text}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>{opt.example}</p>
                </div>
              );
            })}
          </div>
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
                <option key={t} value={t}>{CONCEPTS["modelli-tariffari"].options[t]?.title ?? t}</option>
              ))}
            </select>
          </label>
        </FieldExplainer>

        <FieldExplainer
          question="Quanto sei disposto a pagare tu prima che intervenga la cassa?"
          text={CONCEPTS.franchigia.text}
          example={CONCEPTS.franchigia.example}
        >
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
        </FieldExplainer>

        <FieldExplainer
          question="Sei già assicurato contro gli infortuni tramite il tuo lavoro?"
          text={CONCEPTS.infortunio.text}
          example={CONCEPTS.infortunio.example}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.accidentIncluded}
              onChange={(e) => setForm({ ...form, accidentIncluded: e.target.checked })}
            />
            Infortunio incluso nell'assicurazione di base
          </label>
        </FieldExplainer>

        <FieldExplainer
          question="Quanto pensi di spendere quest'anno in visite e cure?"
          text={CONCEPTS["partecipazione-costi"].text}
          example={CONCEPTS["partecipazione-costi"].example}
        >
          <label>
            Spese mediche annue attese (stima)
            <input
              type="number"
              value={form.expectedMedicalCosts}
              onChange={(e) => setForm({ ...form, expectedMedicalCosts: Number(e.target.value) })}
            />
          </label>
        </FieldExplainer>

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

      {result && (() => {
        const currentBagNum = Number(form.currentBagNumber);
        const currentRow = candidates.find(
          (c) => c.bagNumber === currentBagNum && c.franchise === form.currentFranchise && c.tariffCode === form.currentTariff,
        );
        const recommendedSameInsurer = result.best ? result.best.bagNumber === currentBagNum : true;
        const recommendedFranchise = result.best ? result.best.franchise : form.currentFranchise;
        const recommendedTariff = result.best ? result.best.tariffCode : form.currentTariff;
        const recommendedPremium = result.best ? result.best.premiumChf : currentRow?.premiumChf;

        const gridInsurer = selectedGridInsurer ?? currentBagNum;
        const isOwnInsurerView = gridInsurer === currentBagNum;
        const grid = buildPremiumGrid(candidates, gridInsurer);
        const gridInsurerOptions = [...new Map(candidates.map((c) => [c.bagNumber, c.insurerName])).entries()]
          .map(([bagNumber, name]) => ({ bagNumber, name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        const topInsurers = topInsurersFor(candidates, form.currentFranchise, form.currentTariff, 5);

        return (
          <>
            <div
              className={"card badge-" + (result.verdict === "stay" ? "stay" : "switch")}
              style={{ marginTop: 24, borderWidth: 2 }}
            >
              <h2 style={{ marginTop: 0 }}>{result.headline}</h2>
              <p style={{ fontWeight: 600 }}>
                Le cure che ricevi sono le stesse, qualunque cassa scegli: cambia solo il prezzo.
              </p>
              <p>{result.explanation}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-section)", padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-secondary)" }}>Premio attuale</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    {formatPremium(currentRow?.premiumChf)}
                  </p>
                </div>
                <div style={{ border: "1px solid var(--primary-border)", background: "var(--primary-light)", borderRadius: "var(--radius-section)", padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-secondary)" }}>Premio consigliato</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    {formatPremium(recommendedPremium)}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {franchiseExplanation(form.currentFranchise)}
              </p>
              {result.best && result.best.franchise !== form.currentFranchise && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Con la franchigia consigliata di {result.best.franchise} CHF: {franchiseExplanation(result.best.franchise)}
                </p>
              )}

              {result.ourCommissionChf > 0 && (
                <p className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Quello che guadagniamo se segui questo consiglio: <b>{result.ourCommissionChf} CHF</b>
                </p>
              )}
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{CONCEPTS["lamal-vs-lca"].text}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{CONCEPTS["lamal-vs-lca"].example}</p>
              <VideoPlaceholder />
              <ul style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {result.caveats.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <p style={{ fontSize: 13, marginBottom: 0 }}>
                <Link to="/capisci">Vuoi capire tutto il sistema, non solo questo calcolo? → Leggi la guida completa</Link>
              </p>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0, fontSize: 16 }}>
                Confronto franchigie e modelli
              </h3>
              <label style={{ display: "block", marginBottom: 12 }}>
                Cassa da confrontare
                <select
                  value={gridInsurer}
                  onChange={(e) => setSelectedGridInsurer(Number(e.target.value))}
                >
                  {gridInsurerOptions.map((i) => (
                    <option key={i.bagNumber} value={i.bagNumber}>
                      {i.name}{i.bagNumber === currentBagNum ? " (la tua cassa attuale)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        borderBottom: "2px solid var(--border)",
                        background: "var(--surface)",
                        fontWeight: 700,
                      }}
                    >
                      Franchigia
                    </th>
                    {grid.tariffCodes.map((code) => (
                      <th
                        key={code}
                        style={{
                          textAlign: "right",
                          padding: "10px 8px",
                          borderBottom: "2px solid var(--border)",
                          background: "var(--surface)",
                          fontWeight: 700,
                        }}
                      >
                        {CONCEPTS["modelli-tariffari"].options[code]?.title ?? code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.franchises.map((f) => (
                    <tr key={f}>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>{f} CHF</td>
                      {grid.tariffCodes.map((code) => {
                        const premium = grid.cell(f, code);
                        const isCurrent = isOwnInsurerView && f === form.currentFranchise && code === form.currentTariff;
                        const isRecommendedPrimary = isOwnInsurerView && recommendedSameInsurer && f === recommendedFranchise && code === recommendedTariff;
                        const isRecommendedNeutral = !isOwnInsurerView && result.best && gridInsurer === result.best.bagNumber && f === result.best.franchise && code === result.best.tariffCode;
                        const highlighted = isCurrent || isRecommendedPrimary || isRecommendedNeutral;
                        return (
                          <td
                            key={code}
                            style={{
                              padding: "8px",
                              borderBottom: "1px solid var(--border)",
                              textAlign: "right",
                              fontWeight: highlighted ? 700 : 400,
                              boxShadow: isCurrent
                                ? "inset 0 0 0 2px var(--text)"
                                : isRecommendedPrimary
                                  ? "inset 0 0 0 2px var(--primary)"
                                  : isRecommendedNeutral
                                    ? "inset 0 0 0 2px var(--text-muted)"
                                    : "none",
                              background: isRecommendedPrimary
                                ? "var(--primary-light)"
                                : isCurrent
                                  ? "var(--surface-alt)"
                                  : isRecommendedNeutral
                                    ? "var(--surface-alt)"
                                    : "transparent",
                            }}
                          >
                            {premium == null ? "–" : formatPremium(premium)}
                            {highlighted && (
                              <div style={{ fontSize: 10, fontWeight: 700, color: isRecommendedPrimary ? "var(--primary)" : "var(--text-secondary)" }}>
                                {isCurrent && isRecommendedPrimary
                                  ? "attuale e consigliata"
                                  : isCurrent
                                    ? "attuale"
                                    : "consigliata"}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {isOwnInsurerView && !recommendedSameInsurer && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 12 }}>
                  La proposta più conveniente è con <b>{result.best.insurerName}</b>, non mostrata in
                  questa tabella che confronta solo la tua cassa attuale.
                </p>
              )}
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-secondary)" }}>
                {CONCEPTS["perche-prezzi-diversi"].text}
              </p>
              <h3 style={{ marginTop: 0, fontSize: 16 }}>
                Chi costa meno per la tua combinazione ({form.currentFranchise} CHF, {CONCEPTS["modelli-tariffari"].options[form.currentTariff]?.title ?? form.currentTariff})
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Cassa</th>
                    <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>Premio</th>
                  </tr>
                </thead>
                <tbody>
                  {topInsurers.map((row) => (
                    <tr key={row.bagNumber}>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>
                        {row.insurerName}
                        {row.bagNumber === currentBagNum ? " (attuale)" : ""}
                      </td>
                      <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
                        {formatPremium(row.premiumChf)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      })()}
    </div>
  );
}
