# WisiHealth — Contenuti "Capisci cosa hai"

Documento di riferimento per i testi del sito. Ogni sezione è pensata per stare vicino al punto del form/risultato a cui si riferisce, non in una pagina separata. 🎥 = segnaposto video WisiTube, da generare dopo.

Fonti principali: BAG/UFSP (bag.admin.ch), Priminfo (priminfo.admin.ch, FAQ ufficiale), Istituzione comune LAMal (kvg.org), testi di legge LAMal/LCA, comunicati FINMA e Parlamento su intermediazione assicurativa.

---

## 0. Il fatto che spiega tutto il resto

**Chi lo trova utile:** homepage, primissima cosa da leggere prima di qualunque calcolo.

L'assicurazione di base (LAMal) copre esattamente le stesse prestazioni presso ogni cassa malati in Svizzera — è la legge a deciderlo, non la compagnia. Nessuna cassa può offrire di più, nessuna può offrire di meno, e nessuna può rifiutarti. Quello che varia da cassa a cassa è **solo** il prezzo, il modello di accesso al medico (libera scelta, medico di famiglia, HMO, Telmed) e — se la scegli — l'assicurazione complementare, che è tutt'altra cosa (vedi sezione 6).

🎥 *Video: "La cosa che nessuno ti dice sulla cassa malati" — spiega che il servizio medico che ricevi non cambia mai in base a chi scegli, solo il prezzo e il percorso di accesso.*

---

## 1. Obbligo assicurativo — chi deve assicurarsi e quando

- Chiunque risieda o lavori in Svizzera deve stipulare l'assicurazione di base entro **3 mesi** dall'inizio della residenza (o dalla nascita, per i neonati — retroattivo alla nascita se fatto in tempo).
- Se ci si affilia in ritardo senza giustificazione, la cassa può applicare un supplemento di premio del 30-50%, per una durata pari al doppio del ritardo.
- Esenzioni esistono per casi particolari (es. militari, alcune categorie di frontalieri con doppia copertura UE/AELS) — vanno richieste all'ufficio cantonale competente.

---

## 2. LAMal vs LCA — la distinzione che struttura tutto il resto

| | LAMal (base) | LCA (complementare) |
|---|---|---|
| Obbligatoria? | Sì | No, facoltativa |
| Copertura | Identica per legge in tutta la Svizzera | Decisa liberamente da ogni assicuratore |
| Obbligo di accettazione | Sì, sempre, senza questionario sanitario | No — questionario sanitario, può essere rifiutata o accettata con riserve |
| Chi vigila | UFSP/BAG | FINMA |
| Provvigione massima intermediari | 70 CHF, fissa, tetto di legge | **Nessun tetto legale** — il Parlamento ha respinto esplicitamente la proposta |

🎥 *Video: "LAMal e LCA non sono la stessa cosa" — la distinzione più importante di tutto il sito.*

---

## 3. Cosa copre davvero la base (LAMal)

Coperto: visite dal medico (generico e specialista), ricoveri in reparto comune (nell'ospedale della lista del tuo cantone), farmaci nell'elenco delle specialità, maternità (visite di controllo, corsi preparto, consulenza allattamento — senza partecipazione ai costi), riabilitazione, cure psichiatriche secondo prescrizione, cure a domicilio (Spitex) prescritte dal medico, alcune prestazioni di prevenzione (vaccinazioni, alcuni check-up).

Parzialmente coperto: trasporto (50%, max 500 CHF/anno), salvataggio in Svizzera (50%, max 5000 CHF/anno), cure all'estero (rimborso secondo le tariffe svizzere, non quelle locali — può lasciare un conto salato in paesi cari).

**Non coperto (il punto dove nascono più incomprensioni):** cure dentarie di routine per adulti (coperte solo se conseguenza di una malattia grave o di un infortunio), occhiali/lenti per adulti, camera privata o semiprivata in ospedale, libera scelta dell'ospedale fuori dal cantone di residenza (salvo urgenza o prestazione non disponibile nel proprio cantone), gran parte della medicina alternativa (alcune terapie complementari sono coperte solo se erogate da un medico riconosciuto).

🎥 *Video: "Cosa NON paga mai la cassa malati, qualunque cassa tu abbia" — le voci sopra, con esempi concreti.*

---

## 4. Franchigia e partecipazione ai costi — già nel motore di calcolo

(Contenuto già implementato in `recommend.ts` — qui va solo la spiegazione discorsiva collegata al form.)

- **Franchigia**: quanto paghi tu di tasca tua prima che la cassa inizi a intervenire. Adulti: 300-2500 CHF (a scelta); bambini: 0-600 CHF.
- **Partecipazione ai costi (Selbstbehalt)**: oltre la franchigia, paghi ancora il 10% delle spese, fino a un tetto massimo di 700 CHF/anno per adulti, 350 CHF/anno per bambini.
- Franchigia alta = premio mensile più basso, ma rischio maggiore se ti ammali. Conviene solo se ti aspetti spese mediche basse nell'anno.

🎥 *Video: "Franchigia 300 o 2500? Come deciderlo senza indovinare" — con l'esempio del breakeven già calcolato da `franchiseBreakeven()`.*

---

## 5. I modelli assicurativi — cosa cambia scegliendo un percorso diverso

Tutti danno accesso alla stessa lista di prestazioni (sezione 3). Cambia solo *come* ci arrivi:

- **Libera scelta del medico**: vai da chi vuoi, quando vuoi. Il più caro.
- **Medico di famiglia (Hausarzt)**: il tuo medico di base è il primo contatto per tutto, tranne urgenze e alcuni specialisti (ginecologo, oculista, pediatra).
- **HMO**: primo contatto in un centro medico convenzionato, spesso con più medici che si alternano.
- **Telmed**: prima di andare dal medico, telefoni a un centro di consulenza medica che ti indirizza. Sconto premio più alto, ma richiede disciplina (serve chiamare anche per cose non urgenti).
- **Modelli digitali/app**: variante di Telmed via app invece che telefono.

Il compromesso è sempre lo stesso: sconto sul premio in cambio di un passaggio in più per arrivare alle cure. Non è mai una riduzione delle prestazioni — quelle restano identiche.

🎥 *Video: "Telmed conviene o è solo un fastidio?" — cosa succede davvero quando chiami prima di andare dal medico.*

---

## 6. L'infortunio — un risparmio spesso dimenticato

(Collegato diretto al checkbox "infortunio incluso" nel form.)

Se lavori **almeno 8 ore a settimana per lo stesso datore di lavoro**, sei già assicurato contro gli infortuni (professionali e non professionali) tramite il tuo datore, secondo la LAINF — una copertura più generosa di quella della cassa malati (nessuna franchigia, nessuna partecipazione ai costi sugli infortuni). In questo caso puoi **escludere la copertura infortuni dalla cassa malati** e risparmiare, in genere, intorno al 7% sul premio mensile.

Attenzione: se cambi lavoro, perdi il lavoro, riduci l'orario sotto le 8 ore, o resti senza impiego per un periodo, la copertura del datore cade — bisogna riattivare l'infortunio in cassa malati (o stipulare un'assicurazione mediante convenzione per il periodo di transizione, valida fino a 6 mesi dopo la fine del rapporto di lavoro).

🎥 *Video: "Stai pagando due volte l'assicurazione infortuni? Ecco come controllare."*

---

## 7. Le complementari (LCA) — il territorio dove serve più cautela

Questa sezione resta **educativa, non di vendita**, per ora (vedi decisione presa in chat sul modello di business).

- Coprono ciò che LAMal non copre: camera privata/semiprivata, dentista, medicina alternativa più ampia, occhiali, trasporto/salvataggio oltre i minimi LAMal, a volte palestra o wellness.
- **Nessun obbligo di accettazione.** Va compilato un questionario sullo stato di salute; la cassa può accettare, accettare con riserva (esclude specifiche patologie, spesso in modo permanente), o rifiutare senza dover motivare.
- **Regola d'oro, va ripetuta ovunque appaia il tema:** non disdire mai una complementare esistente prima di avere l'accettazione scritta della nuova. Non c'è portabilità garantita — se nel frattempo cambia il tuo stato di salute, rischi di restare scoperto.
- Il momento migliore per sottoscriverne una è da giovani e in salute, proprio perché più avanti il questionario potrebbe portare a riserve o rifiuti.
- **Nota di trasparenza per noi**: qui le provvigioni non hanno un tetto di legge come su LAMal — è il motivo per cui, per ora, non le vendiamo, solo le spieghiamo.

🎥 *Video: "Perché il momento giusto per la complementare è adesso, se sei giovane e sano" — e il rischio di aspettare.*

---

## 8. Riduzione dei premi (RIP/RIPAM) — il sussidio che molti non richiedono

Chi ha un reddito modesto ha diritto a una riduzione dei premi, finanziata insieme da Confederazione e Cantone. Le condizioni esatte (soglie di reddito, importo, scadenza della domanda) sono decise **cantone per cantone** — in alcuni cantoni (es. Ticino) ne beneficia circa un residente su tre. Va richiesta attivamente all'ufficio cantonale competente, non arriva automaticamente.

🎥 *Video: "Il sussidio che quasi nessuno chiede — controlla se ti spetta" (con link/rimando all'ufficio del proprio cantone, dato che varia).*

---

## 9. Scadenze — la parte che fa perdere più occasioni di risparmio

- **Cambio cassa (LAMal), modello standard/franchigia libera**: disdetta entro il **30 novembre**, effetto dal 1° gennaio successivo.
- **Cambio semestrale**: possibile solo per chi ha franchigia ordinaria (300 CHF adulti / 0 CHF bambini) e modello standard — disdetta entro il 31 marzo, effetto dal 1° luglio.
- **Complementare (LCA)**: di norma disdetta entro il **30 settembre** per fine anno — termine diverso e più stretto della base, va gestito separatamente.
- Nessun questionario sanitario per cambiare cassa sulla base — questo vale solo per la complementare.

🎥 *Video: "Le due scadenze che non sono la stessa data" — 30 novembre per la base, 30 settembre per la complementare.*

---

## 10. Situazioni particolari (da sviluppare come contenuti dedicati più avanti)

- Neonati: 3 mesi di tempo dalla nascita, copertura retroattiva se rispettato.
- Studenti e giovani adulti: fascia d'età 19-25 con premio ridotto rispetto agli adulti.
- Frontalieri UE/AELS: diritto di opzione tra assicurazione svizzera e quella del paese di residenza.
- Disoccupati: restano coperti da LAINF per gli infortuni se rispettano i requisiti per l'indennità.
- Pensionati: al raggiungimento dell'età pensionabile, la copertura infortuni torna automaticamente in cassa malati (non più coperta dal datore).

---

## Come si collega al form esistente

- Il checkbox "infortunio incluso" → tooltip dalla sezione 6.
- La franchigia → tooltip dalla sezione 4, con link al concetto di breakeven già calcolato.
- Il select tariffa/modello → tooltip dalla sezione 5, una voce per modello.
- Il blocco `ourCommissionChf`/caveat → può richiamare la sezione 2 (perché 70 CHF è un tetto di legge, non una nostra scelta).
- La pagina "Trasparenza" → può richiamare la sezione 7 per spiegare perché lì, per ora, non guadagniamo nulla.
