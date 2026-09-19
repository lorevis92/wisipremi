/**
 * Testi esplicativi adattati da data/capisci-cosa-hai.md, scritti per chi non
 * conosce già il gergo assicurativo. In Compare.jsx sono mostrati per intero
 * accanto al campo (non nascosti dietro un click) — ConceptTooltip.jsx resta
 * disponibile solo come approfondimento extra, non come unica spiegazione.
 */
export const CONCEPTS = {
  franchigia: {
    title: "Franchigia",
    text:
      "La franchigia è l'importo che paghi tu, di tasca tua, prima che la cassa malati inizi a " +
      "contribuire alle tue spese mediche. La scegli tu ogni anno tra 300 e 2500 CHF (per gli " +
      "adulti). Più alta la franchigia, più basso il premio mensile che paghi — ma se ti ammali, " +
      "sei tu a coprire una fetta più grande prima che la cassa intervenga.",
    example:
      "Esempio: hai scelto una franchigia di 300 CHF. In un anno spendi 800 CHF in visite e cure. " +
      "I primi 300 CHF li paghi interamente tu; sui restanti 500 CHF comincia a intervenire anche " +
      "la cassa (vedi \"partecipazione ai costi\" qui sotto). Se invece spendi solo 200 CHF in " +
      "tutto l'anno, paghi tu quei 200 CHF e basta: non arrivi nemmeno a toccare la franchigia.",
  },
  "partecipazione-costi": {
    title: "Partecipazione ai costi",
    text:
      "Superata la franchigia, non è ancora tutto gratis: paghi ancora il 10% di ogni spesa " +
      "medica successiva, fino a un tetto massimo di 700 CHF all'anno (350 CHF per i bambini). " +
      "Questo 10% si chiama \"partecipazione ai costi\" (in tedesco Selbstbehalt). Solo dopo aver " +
      "raggiunto anche questo tetto, la cassa paga il 100% del resto.",
    example:
      "Esempio: franchigia 300 CHF, spese mediche totali nell'anno 2000 CHF. Paghi i primi 300 CHF " +
      "per intero (franchigia). Sui restanti 1700 CHF paghi il 10%, cioè 170 CHF (partecipazione " +
      "ai costi). In totale, di tasca tua, paghi 300 + 170 = 470 CHF — il resto (1530 CHF) lo paga " +
      "la cassa. Questo è il vero costo che conta per confrontare due offerte, non solo il premio " +
      "mensile.",
  },
  "modelli-tariffari": {
    title: "Come vuoi accedere alle cure",
    text:
      "Qualunque modello scegli, hai diritto esattamente alle stesse cure (nessuna cassa può " +
      "offrirtene di meno) — cambia solo il percorso che devi seguire per arrivarci, e quanto " +
      "costa il premio mensile. Più passaggi accetti prima di arrivare allo specialista, più il " +
      "premio scende.",
    options: {
      "TAR-BASE": {
        title: "Libera scelta del medico",
        text:
          "Vai da qualsiasi medico o specialista tu voglia, quando vuoi, senza dover chiedere il " +
          "permesso a nessuno prima. È il modello con più libertà, e per questo il più caro.",
        example: "Esempio: ti fa male un ginocchio? Prenoti direttamente da un ortopedico, senza passaggi intermedi.",
      },
      "TAR-HAM": {
        title: "Medico di famiglia",
        text:
          "Per qualsiasi problema di salute devi prima passare dal tuo medico di famiglia (tranne " +
          "urgenze, e di solito ginecologo, oculista, pediatra). Sarà lui a indirizzarti da uno " +
          "specialista se serve davvero. In cambio di questo passaggio in più, il premio è più basso.",
        example: "Esempio: hai mal di schiena da settimane. Vai prima dal tuo medico di famiglia, che ti visita e, se serve, ti manda da un fisioterapista o da uno specialista.",
      },
      "TAR-HMO": {
        title: "HMO (centro medico convenzionato)",
        text:
          "Stesso principio del medico di famiglia, ma il primo contatto non è una persona singola: " +
          "è un centro medico convenzionato dove lavorano più medici che si alternano. Vai lì per " +
          "primo, loro decidono se e da chi farti seguire in seguito.",
        example: "Esempio: chiami per un appuntamento e vieni visitato dal medico disponibile quel giorno nel centro convenzionato, non sempre dallo stesso.",
      },
      "TAR-DIV": {
        title: "Telmed / modelli digitali",
        text:
          "Prima di andare da qualsiasi medico, devi telefonare (o usare un'app) a un servizio di " +
          "consulenza medica che valuta il tuo problema al telefono e ti dice se, e da chi, andare. " +
          "È lo sconto più alto sul premio, ma richiede disciplina: va contattato anche per cose che " +
          "sembrano semplici, altrimenti rischi che la cassa non copra la spesa.",
        example: "Esempio: hai la febbre alta da due giorni. Prima di andare al pronto soccorso, chiami il numero Telmed: ti fanno domande e ti dicono se basta riposare, andare da un medico, o se è davvero urgente.",
      },
    },
  },
  infortunio: {
    title: "Infortunio incluso",
    text:
      "Se lavori almeno 8 ore alla settimana per lo stesso datore di lavoro, il tuo datore è già " +
      "obbligato per legge ad assicurarti contro gli infortuni — sul lavoro e nel tempo libero — " +
      "tramite un'assicurazione diversa (si chiama LAINF), più generosa di quella della cassa " +
      "malati: niente franchigia, niente partecipazione ai costi sugli infortuni. Se è il tuo caso, " +
      "puoi togliere la copertura infortuni dalla cassa malati, perché altrimenti pagheresti due " +
      "volte la stessa cosa.",
    example:
      "Esempio: lavori 30 ore a settimana in un negozio. Se ti rompi un braccio sciando durante il " +
      "weekend, a pagare è la LAINF del tuo datore di lavoro, non la cassa malati. Escludendo " +
      "\"infortunio\" dalla cassa risparmi in genere circa il 7% sul premio mensile. Attenzione: se " +
      "cambi lavoro, lo perdi, o riduci l'orario sotto le 8 ore, questa copertura cade e va " +
      "riattivata in cassa malati.",
  },
  "lamal-vs-lca": {
    title: "Perché guadagniamo sempre la stessa cifra",
    text:
      "Ci sono due tipi di assicurazione malattia in Svizzera. La base (LAMal) è obbligatoria per " +
      "legge e identica in tutta la Svizzera: ogni cassa deve coprire esattamente le stesse cure, " +
      "senza poter dire di no a nessuno. Le complementari (LCA) sono facoltative, e ogni assicuratore " +
      "decide da solo cosa coprire e chi accettare. La legge fissa anche quanto un intermediario " +
      "come noi può guadagnare quando aiuta qualcuno a cambiare cassa sulla base: 70 CHF, punto, " +
      "uguale per ogni assicuratore.",
    example:
      "Esempio: se ti consigliamo di passare dalla Cassa A alla Cassa B, guadagniamo 70 CHF a " +
      "prescindere da chi sia B — le stesse 70 CHF sia che B sia la cassa più economica del mercato, " +
      "sia una meno nota. Per questo non abbiamo alcun motivo per spingerti verso una cassa " +
      "piuttosto che un'altra: guadagniamo uguale, oppure zero se il consiglio onesto è restare " +
      "dove sei.",
  },
  "cosa-copre-base": {
    title: "Cosa copre la base (LAMal)",
    text: "Coperti: visite mediche, ricoveri in reparto comune, farmaci in elenco, maternità, cure psichiatriche prescritte, Spitex. Non coperti: cure dentarie di routine, occhiali, camera privata/semiprivata, gran parte della medicina alternativa. È uguale per ogni cassa: cambia solo il prezzo, non le prestazioni.",
  },
};
