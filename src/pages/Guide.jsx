import { useEffect } from "react";
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

function Section({ id, title, video, children }) {
  return (
    <section id={id} style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 24 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>{title}</h2>
      {children}
      {video && <VideoPlaceholder />}
    </section>
  );
}

const p = { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 };
const li = { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 6 };
const note = { fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 12 };

export default function Guide() {
  // Navigazione client-side (React Router) non fa lo scroll automatico
  // all'hash come farebbe un caricamento pagina pieno: lo facciamo a mano.
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
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
              <a href={`#${t.id}`}>{t.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="il-fatto-che-spiega-tutto" title="0. Il fatto che spiega tutto il resto" video>
        <p style={p}>
          L'assicurazione di base (LAMal) copre esattamente le stesse prestazioni presso ogni
          cassa malati in Svizzera — è la legge a deciderlo, non la compagnia. Nessuna cassa può
          offrire di più, nessuna può offrire di meno, e nessuna può rifiutarti. Quello che varia
          da cassa a cassa è <b>solo</b> il prezzo, il modello di accesso al medico (libera
          scelta, medico di famiglia, HMO, Telmed) e — se la scegli — l'assicurazione
          complementare, che è tutt'altra cosa (vedi <a href="#complementari">sezione 7</a>).
        </p>
      </Section>

      <Section id="obbligo-assicurativo" title="1. Obbligo assicurativo — chi deve assicurarsi e quando">
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
      </Section>

      <Section id="lamal-vs-lca" title="2. LAMal vs LCA — la distinzione che struttura tutto il resto" video>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)" }} />
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>LAMal (base)</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)" }}>LCA (complementare)</th>
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
      </Section>

      <Section id="cosa-copre-base" title="3. Cosa copre davvero la base (LAMal)" video>
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
      </Section>

      <Section id="franchigia" title="4. Franchigia e partecipazione ai costi — già nel motore di calcolo" video>
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
      </Section>

      <Section id="modelli-tariffari" title="5. I modelli assicurativi — cosa cambia scegliendo un percorso diverso" video>
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
      </Section>

      <Section id="infortunio" title="6. L'infortunio — un risparmio spesso dimenticato" video>
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
      </Section>

      <Section id="complementari" title="7. Le complementari (LCA) — il territorio dove serve più cautela" video>
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
      </Section>

      <Section id="riduzione-premi" title="8. Riduzione dei premi (RIP/RIPAM) — il sussidio che molti non richiedono" video>
        <p style={p}>
          Chi ha un reddito modesto ha diritto a una riduzione dei premi, finanziata insieme da
          Confederazione e Cantone. Le condizioni esatte (soglie di reddito, importo, scadenza
          della domanda) sono decise cantone per cantone — in alcuni cantoni (es. Ticino) ne
          beneficia circa un residente su tre. Va richiesta attivamente all'ufficio cantonale
          competente, non arriva automaticamente.
        </p>
      </Section>

      <Section id="scadenze" title="9. Scadenze — la parte che fa perdere più occasioni di risparmio" video>
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
      </Section>

      <Section id="situazioni-particolari" title="10. Situazioni particolari">
        <p style={note}>(Contenuti da sviluppare più nel dettaglio in futuro.)</p>
        <ul style={{ paddingLeft: 20 }}>
          <li style={li}>Neonati: 3 mesi di tempo dalla nascita, copertura retroattiva se rispettato.</li>
          <li style={li}>Studenti e giovani adulti: fascia d'età 19-25 con premio ridotto rispetto agli adulti.</li>
          <li style={li}>Frontalieri UE/AELS: diritto di opzione tra assicurazione svizzera e quella del paese di residenza.</li>
          <li style={li}>Disoccupati: restano coperti da LAINF per gli infortuni se rispettano i requisiti per l'indennità.</li>
          <li style={li}>Pensionati: al raggiungimento dell'età pensionabile, la copertura infortuni torna automaticamente in cassa malati (non più coperta dal datore).</li>
        </ul>
      </Section>
    </div>
  );
}
