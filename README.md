# WisiHealth

Comparatore casse malati svizzere, onesto: se conviene restare dove sei, lo diciamo — anche
quando per noi significa zero provvigione. Motore basato sul costo totale reale (premio +
franchigia + partecipazione ai costi), non solo sul premio nudo.

## Stack
- React + Vite (frontend)
- Supabase / Postgres (dati premi UFSP)
- Vercel (deploy)
- Design system: WiSiVERSE (vedi `src/styles/tokens.css`)

## Struttura

```
src/
  components/   Navbar.jsx, Footer.jsx — pattern WiSiVERSE
  pages/        Compare.jsx (tool principale), Videos.jsx, Transparency.jsx
  lib/          recommend.ts (motore di raccomandazione), supabaseClient.js
  styles/       tokens.css (colori, font, componenti — WiSiVERSE design system)
supabase/
  schema.sql    Schema completo: insurers, premiums, municipalities, recommendations_log
etl/
  import_bag_premiums.ts   Import dei CSV UFSP -> Supabase
data/
  (metti qui i CSV scaricati da opendata.swiss — sono in .gitignore, non finiscono su git)
```

## Setup locale

```bash
npm install
cp .env.example .env      # poi compila con le chiavi Supabase
npm run dev
```

## Import dei dati UFSP (prima di avere un sito funzionante)

1. Scarica da https://opendata.swiss/it/dataset/health-insurance-premiums:
   - `Prämien_CH.csv`
   - `Einzugsgebiete.csv`
   Metti entrambi in `data/`.

2. **Ispeziona sempre prima di importare** (il BAG cambia i nomi delle colonne ogni anno):
   ```bash
   npm run etl:inspect -- data/Praemien_CH.csv
   ```
   Se dice "Colonne non trovate", apri `etl/import_bag_premiums.ts` e aggiorna
   `COLUMN_ALIASES` con i nomi reali stampati.

3. Importa:
   ```bash
   npm run etl:import -- data/Praemien_CH.csv --year 2026
   npm run etl:regions -- data/Einzugsgebiete.csv --year 2026
   ```

## Schema Supabase

Applica `supabase/schema.sql` dal SQL editor di Supabase (o via CLI) prima di lanciare l'ETL.
Le migrazioni successive vanno sempre scritte non distruttive (`if not exists`).

## Stato attuale (checkpoint per Claude Code)

- [x] Struttura cartelle, design tokens, navbar/footer, routing 3 pagine
- [x] Schema SQL completo + view storiche (insurer_rank_history, insurer_yearly_change)
- [x] Motore di raccomandazione (`src/lib/recommend.ts`) con verdetto "resta" di prima classe
- [x] ETL con comando `inspect` per adattarsi ai CSV reali
- [ ] `Compare.jsx` usa ancora MOCK_RESULT — va collegato a Supabase + recommend()
- [ ] Import dati reali UFSP non ancora eseguito
- [ ] Logo `logo-wisihealth.png` non ancora creato (placeholder testuale nel Navbar)
- [ ] Ponte CAP -> comune non incluso nel dataset UFSP: serve dataset separato (Posta/UST)
- [ ] Nessuna registrazione FINMA: in questa fase il sito è solo informativo, nessuna
      raccomandazione di prodotto specifico finché non si passa alla fase 2 (vedi chat Claude)

## Primo prompt da dare a Claude Code

Copia tutto il blocco qui sotto in Claude Code appena apri la cartella:

---

Ho una cartella React+Vite già scaffoldata (WisiHealth, comparatore casse malati CH).
Design system WiSiVERSE già applicato in `src/styles/tokens.css` — usa SEMPRE quelle
variabili CSS esatte, non descrizioni generiche di stile.

Il file `src/pages/Compare.jsx` usa ancora un MOCK_RESULT. Voglio che tu:

1. Crei `src/lib/premiumsApi.js` con una funzione `fetchPremiumsForRegion(canton, regionCode, ageClass)`
   che interroga Supabase (client già in `src/lib/supabaseClient.js`) sulla tabella `premiums`
   e restituisce le righe come array di oggetti `{ bagNumber, insurerName, tariffCode, tariffLabel, franchise, premiumChf }`
   (join con `insurers` per il nome).
2. In `Compare.jsx`, sostituisci MOCK_RESULT: al submit del form, chiama `fetchPremiumsForRegion`,
   poi passa il risultato a `recommend()` da `src/lib/recommend.ts` insieme ai dati del form.
3. NON toccare la logica dentro `recommend.ts` — è già decisa, limitati a chiamarla.
4. Il blocco `ourCommissionChf` e `caveats` nel risultato deve restare sempre visibile,
   mai dentro un accordion chiuso di default.
5. Gestisci lo stato di loading e l'errore "combinazione non trovata nei dati" con un messaggio
   chiaro (succede se l'ETL non è ancora stato importato per quella regione/anno).
6. Alla fine: `git add -A && git commit -m "Collega Compare.jsx a Supabase + motore recommend" && git push`

Fammi vedere prima il piano dei file che modifichi, poi procedi.

---

## Note di processo (dalla chat con Claude)

- Motore di raccomandazione: soglia di irrilevanza 240 CHF/anno sotto la quale il verdetto
  è sempre "stay", anche se un risparmio esiste.
- Provvigione fissa 70 CHF per switch sull'assicurazione di base (tetto BVV in vigore dal
  1° settembre 2024, dichiarato di obbligatorietà generale) — uguale per tutte le casse,
  quindi nessun incentivo a preferirne una.
- Fase 1 (questa cartella): sito puramente informativo, zero raccomandazione di prodotto
  specifico, zero switching service attivo -> non richiede registrazione FINMA.
- Fase 2 (più avanti): per attivare lo switching service serve la registrazione FINMA come
  intermediario non vincolato (esame VBV, RC professionale). Da verificare con
  vermittler.regulierung@finma.ch prima di lanciare quella fase.
