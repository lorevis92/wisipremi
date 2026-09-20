import { useEffect, useState } from "react";
import VideoPlaceholder from "../components/VideoPlaceholder";

// Indice cliccabile in cima alla pagina - stessi id delle <section> sotto,
// e stessi id usati come ancore da altri punti del sito (es. Compare.jsx).
const TOC = [
  { id: "il-fatto-che-spiega-tutto", label: "0. Il fatto che spiega tutto il resto" },
  { id: "obbligo-assicurativo", label: "1. Obbligo assicurativo" },
  { id: "lamal-vs-lca", label: "2. LAMal vs LCA" },
  { id: "cosa-copre-base", label: "3. Cosa copre davvero la base (LAMal)" },
  { id: "franchigia", label: "4. Franchigia e partecipazione ai costi" },
  { id: "modelli-tariffari", label: "5. I modelli assicurativi" },
  { id: "infortunio", label: "6. L'infortunio" },
  { id: "complementari", label: "7. Le complementari (LCA)" },
  { id: "riduzione-premi", label: "8. Riduzione dei premi" },
  { id: "scadenze", label: "9. Scadenze" },
  { id: "situazioni-particolari", label: "10. Situazioni particolari" },
];

// Pannello accordion: usa .section-label/.toggle gia' definiti in tokens.css
// (bordo superiore, spaziatura, colore) invece di un pattern nuovo - solo il
// minimo di reset necessario perche' l'header e' un <button> vero.
function Panel({ id, title, video, open, onToggle, children }) {
  return (
    <div id={id} className="card" style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="section-label"
        style={{
          width: "100%",
          margin: 0,
          border: "none",
          background: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
          padding: "16px 20px",
        }}
      >
        <span>{title}</span>
        <span className="toggle" style={{ fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          {children}
          {video && <VideoPlaceholder />}
        </div>
      )}
    </div>
  );
}

const p = { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 };
const li = { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 6 };
const note = { fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 12 };

export default function Guide() {
  const [openIds, setOpenIds] = useState(() => new Set());

  function toggle(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Un link dell'indice (o un link esterno con hash) deve espandere la
  // sezione ed andarci a scroll - React Router non lo fa in automatico per
  // navigazioni client-side, quindi lo gestiamo a mano sia al mount sia su
  // ogni cambio di hash (click su un altro link mentre si e' gia' sulla pagina).
  useEffect(() => {
    function handleHash() {
      const id = window.location.hash.slice(1);
      if (!id || !TOC.some((t) => t.id === id)) return;
      setOpenIds((prev) => new Set(prev).add(id));
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px 64px" }}>
      <h1 className="display" style={{ fontSize: 28, marginBottom: 4 }}>
        Capisci cosa hai
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
        Tutto quello che c'è da sapere sull'assicurazione malattia svizzera, non solo la parte
        che serve per il calcolo del confronto.
      </p>

      <nav className="card" style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13 }}>Indice</p>
        <ul style={{ margin: 0, paddingLeft: 20, columns: 2, fontSize: 13 }}>
          {TOC.map((t) => (
            <li key={t.id} style={{ marginBottom: 6 }}>
              <a href={`#${t.id}`} style={{ fontWeight: 600 }}>{t.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <Panel id="il-fatto-che-spiega-tutto" title="0. Il fatto che spiega tutto il resto" video open={openIds.has("il-fatto-che-spiega-tutto")} onToggle={() => toggle("il-fatto-che-spiega-tutto")}>
        <p style={p}>
          L'assicurazione di base (LAMal) copre esattamente le stesse prestazioni presso ogni
          cassa malati in Svizzera — è la legge a deciderlo, non la compagnia. Nessuna cassa può
          offrire di più, nessuna può offrire di meno, e nessuna può rifiutarti. Quello che varia
          da cassa a cassa è <b>solo</b> il prezzo, il modello di accesso al medico (libera
          scelta, medico di famiglia, HMO, Telmed) e — se la scegli — l'assicurazione
          complementare, che è tutt'altra cosa (vedi <a href="#complementari">sezione 7</a>).
        </p>
      </Panel>

      <Panel id="obbligo-assicurativo" title="1. Obbligo assicurativo — chi deve assicurarsi e quando" open={openIds.has("obbligo-assicurativo")} onToggle={() => toggle("obbligo-assicurativo")}>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}>
            Chiunque risieda o lavori in Svizzera deve stipulare l'assicurazione di base entro
            <b> 3 mesi</b> dall'inizio della residenza (o dalla nascita, per i neonati —
            retroattivo alla nascita se fatto in tempo).
          </li>
          <li style={li}>
            Se ci si affilia in ritardo senza giustificazione, la cassa può applicare un
            supplemento di premio del 30-50%, per una durata pari al doppio del ritardo.
          </li>
          <li style={li}>
            Esenzioni esistono per casi particolari (es. militari, alcune categorie di
            frontalieri con doppia copertura UE/AELS) — vanno richieste all'ufficio cantonale
            competente.
          </li>
        </ul>
      </Panel>

      <Panel id="lamal-vs-lca" title="2. LAMal vs LCA — la distinzione che struttura tutto il resto" video open={openIds.has("lamal-vs-lca")} onToggle={() => toggle("lamal-vs-lca")}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid var(--border)", background: "var(--surface)" }} />
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid var(--border)", background: "var(--surface)" }}>LAMal (base)</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid var(--border)", background: "var(--surface)" }}>LCA (complementare)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Obbligatoria?", "Sì", "No, facoltativa"],
              ["Copertura", "Identica per legge in tutta la Svizzera", "Decisa liberamente da ogni assicuratore"],
              ["Obbligo di accettazione", "Sì, sempre, senza questionario sanitario", "No — questionario sanitario, può essere rifiutata o accettata con riserve"],
              ["Chi vigila", "UFSP/BAG", "FINMA"],
              ["Provvigione massima intermediari", "70 CHF, fissa, tetto di legge", "Nessun tetto legale — il Parlamento ha respinto esplicitamente la proposta"],
            ].map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", fontSize: 13, color: j === 0 ? "var(--text)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400 }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel id="cosa-copre-base" title="3. Cosa copre davvero la base (LAMal)" video open={openIds.has("cosa-copre-base")} onToggle={() => toggle("cosa-copre-base")}>
        <p style={p}>
          <b>Coperto:</b> visite dal medico (generico e specialista), ricoveri in reparto comune
          (nell'ospedale della lista del tuo cantone), farmaci nell'elenco delle specialità,
          maternità (visite di controllo, corsi preparto, consulenza allattamento — senza
          partecipazione ai costi), riabilitazione, cure psichiatriche secondo prescrizione, cure
          a domicilio (Spitex) prescritte dal medico, alcune prestazioni di prevenzione
          (vaccinazioni, alcuni check-up).
        </p>
        <p style={p}>
          <b>Parzialmente coperto:</b> trasporto (50%, max 500 CHF/anno), salvataggio in Svizzera
          (50%, max 5000 CHF/anno), cure all'estero (rimborso secondo le tariffe svizzere, non
          quelle locali — può lasciare un conto salato in paesi cari).
        </p>
        <p style={p}>
          <b>Non coperto (il punto dove nascono più incomprensioni):</b> cure dentarie di routine
          per adulti (coperte solo se conseguenza di una malattia grave o di un infortunio),
          occhiali/lenti per adulti, camera privata o semiprivata in ospedale, libera scelta
          dell'ospedale fuori dal cantone di residenza (salvo urgenza o prestazione non
          disponibile nel proprio cantone), gran parte della medicina alternativa (alcune terapie
          complementari sono coperte solo se erogate da un medico riconosciuto).
        </p>
      </Panel>

      <Panel id="franchigia" title="4. Franchigia e partecipazione ai costi — già nel motore di calcolo" video open={openIds.has("franchigia")} onToggle={() => toggle("franchigia")}>
        <p style={note}>
          (Contenuto già implementato nel motore di calcolo — qui trovi solo la spiegazione
          discorsiva collegata al form di confronto.)
        </p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}>
            <b>Franchigia:</b> quanto paghi tu di tasca tua prima che la cassa inizi a
            intervenire. Adulti: 300-2500 CHF (a scelta); bambini: 0-600 CHF.
          </li>
          <li style={li}>
            <b>Partecipazione ai costi (Selbstbehalt):</b> oltre la franchigia, paghi ancora il
            10% delle spese, fino a un tetto massimo di 700 CHF/anno per adulti, 350 CHF/anno per
            bambini.
          </li>
          <li style={li}>
            Franchigia alta = premio mensile più basso, ma rischio maggiore se ti ammali. Conviene
            solo se ti aspetti spese mediche basse nell'anno.
          </li>
        </ul>
      </Panel>

      <Panel id="modelli-tariffari" title="5. I modelli assicurativi — cosa cambia scegliendo un percorso diverso" video open={openIds.has("modelli-tariffari")} onToggle={() => toggle("modelli-tariffari")}>
        <p style={p}>
          Tutti danno accesso alla stessa lista di prestazioni (<a href="#cosa-copre-base">sezione 3</a>).
          Cambia solo <i>come</i> ci arrivi:
        </p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}><b>Libera scelta del medico:</b> vai da chi vuoi, quando vuoi. Il più caro.</li>
          <li style={li}>
            <b>Medico di famiglia (Hausarzt):</b> il tuo medico di base è il primo contatto per
            tutto, tranne urgenze e alcuni specialisti (ginecologo, oculista, pediatra).
          </li>
          <li style={li}>
            <b>HMO:</b> primo contatto in un centro medico convenzionato, spesso con più medici
            che si alternano.
          </li>
          <li style={li}>
            <b>Telmed:</b> prima di andare dal medico, telefoni a un centro di consulenza medica
            che ti indirizza. Sconto premio più alto, ma richiede disciplina (serve chiamare anche
            per cose non urgenti).
          </li>
          <li style={li}><b>Modelli digitali/app:</b> variante di Telmed via app invece che telefono.</li>
        </ul>
        <p style={p}>
          Il compromesso è sempre lo stesso: sconto sul premio in cambio di un passaggio in più
          per arrivare alle cure. Non è mai una riduzione delle prestazioni — quelle restano
          identiche.
        </p>
      </Panel>

      <Panel id="infortunio" title="6. L'infortunio — un risparmio spesso dimenticato" video open={openIds.has("infortunio")} onToggle={() => toggle("infortunio")}>
        <p style={note}>(Collegato diretto al checkbox "infortunio incluso" nel form di confronto.)</p>
        <p style={p}>
          Se lavori almeno 8 ore a settimana per lo stesso datore di lavoro, sei già assicurato
          contro gli infortuni (professionali e non professionali) tramite il tuo datore, secondo
          la LAINF — una copertura più generosa di quella della cassa malati (nessuna franchigia,
          nessuna partecipazione ai costi sugli infortuni). In questo caso puoi escludere la
          copertura infortuni dalla cassa malati e risparmiare, in genere, intorno al 7% sul
          premio mensile.
        </p>
        <p style={p}>
          Attenzione: se cambi lavoro, perdi il lavoro, riduci l'orario sotto le 8 ore, o resti
          senza impiego per un periodo, la copertura del datore cade — bisogna riattivare
          l'infortunio in cassa malati (o stipulare un'assicurazione mediante convenzione per il
          periodo di transizione, valida fino a 6 mesi dopo la fine del rapporto di lavoro).
        </p>
      </Panel>

      <Panel id="complementari" title="7. Le complementari (LCA) — il territorio dove serve più cautela" video open={openIds.has("complementari")} onToggle={() => toggle("complementari")}>
        <p style={note}>Questa sezione resta educativa, non di vendita, per ora.</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}>
            Coprono ciò che LAMal non copre: camera privata/semiprivata, dentista, medicina
            alternativa più ampia, occhiali, trasporto/salvataggio oltre i minimi LAMal, a volte
            palestra o wellness.
          </li>
          <li style={li}>
            <b>Nessun obbligo di accettazione.</b> Va compilato un questionario sullo stato di
            salute; la cassa può accettare, accettare con riserva (esclude specifiche patologie,
            spesso in modo permanente), o rifiutare senza dover motivare.
          </li>
          <li style={li}>
            <b>Regola d'oro:</b> non disdire mai una complementare esistente prima di avere
            l'accettazione scritta della nuova. Non c'è portabilità garantita — se nel frattempo
            cambia il tuo stato di salute, rischi di restare scoperto.
          </li>
          <li style={li}>
            Il momento migliore per sottoscriverne una è da giovani e in salute, proprio perché
            più avanti il questionario potrebbe portare a riserve o rifiuti.
          </li>
          <li style={li}>
            <b>Nota di trasparenza:</b> qui le provvigioni non hanno un tetto di legge come su
            LAMal — è il motivo per cui, per ora, non le vendiamo, solo le spieghiamo.
          </li>
        </ul>
      </Panel>

      <Panel id="riduzione-premi" title="8. Riduzione dei premi (RIP/RIPAM) — il sussidio che molti non richiedono" video open={openIds.has("riduzione-premi")} onToggle={() => toggle("riduzione-premi")}>
        <p style={p}>
          Chi ha un reddito modesto ha diritto a una riduzione dei premi, finanziata insieme da
          Confederazione e Cantone. Le condizioni esatte (soglie di reddito, importo, scadenza
          della domanda) sono decise cantone per cantone — in alcuni cantoni (es. Ticino) ne
          beneficia circa un residente su tre. Va richiesta attivamente all'ufficio cantonale
          competente, non arriva automaticamente.
        </p>
      </Panel>

      <Panel id="scadenze" title="9. Scadenze — la parte che fa perdere più occasioni di risparmio" video open={openIds.has("scadenze")} onToggle={() => toggle("scadenze")}>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}>
            <b>Cambio cassa (LAMal), modello standard/franchigia libera:</b> disdetta entro il
            30 novembre, effetto dal 1° gennaio successivo.
          </li>
          <li style={li}>
            <b>Cambio semestrale:</b> possibile solo per chi ha franchigia ordinaria (300 CHF
            adulti / 0 CHF bambini) e modello standard — disdetta entro il 31 marzo, effetto dal
            1° luglio.
          </li>
          <li style={li}>
            <b>Complementare (LCA):</b> di norma disdetta entro il 30 settembre per fine anno —
            termine diverso e più stretto della base, va gestito separatamente.
          </li>
          <li style={li}>
            Nessun questionario sanitario per cambiare cassa sulla base — questo vale solo per la
            complementare.
          </li>
        </ul>
      </Panel>

      <Panel id="situazioni-particolari" title="10. Situazioni particolari" open={openIds.has("situazioni-particolari")} onToggle={() => toggle("situazioni-particolari")}>
        <p style={note}>(Contenuti da sviluppare più nel dettaglio in futuro.)</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}>Neonati: 3 mesi di tempo dalla nascita, copertura retroattiva se rispettato.</li>
          <li style={li}>Studenti e giovani adulti: fascia d'età 19-25 con premio ridotto rispetto agli adulti.</li>
          <li style={li}>Frontalieri UE/AELS: diritto di opzione tra assicurazione svizzera e quella del paese di residenza.</li>
          <li style={li}>Disoccupati: restano coperti da LAINF per gli infortuni se rispettano i requisiti per l'indennità.</li>
          <li style={li}>Pensionati: al raggiungimento dell'età pensionabile, la copertura infortuni torna automaticamente in cassa malati (non più coperta dal datore).</li>
        </ul>
      </Panel>
    </div>
  );
}
