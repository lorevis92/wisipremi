/**
 * Pagina trasparenza: il vero differenziatore rispetto a Comparis/Bonus.ch.
 *
 * TODO per Claude Code:
 * - Query aggregata su `recommendations_log`: % di verdetti 'stay' vs 'switch_*'
 * - Mostrare: "Negli ultimi N mesi, nel X% dei casi abbiamo detto di restare dove si è"
 * - Spiegazione del tetto di provvigione (70 CHF, uguale per tutte le casse)
 * - Eventuale sezione "loyalty tax": casse con storico di rincari dopo aver attirato clienti
 */
export default function Transparency() {
  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1 className="display">Come guadagniamo</h1>
      <div className="card" style={{ marginBottom: 16 }}>
        <p>
          Riceviamo <b>70 CHF</b> dalla nuova cassa quando qualcuno cambia tramite noi — è il
          tetto fissato dall'accordo di settore, uguale per tutti gli assicuratori. Non abbiamo
          quindi motivo di spingere una cassa piuttosto che un'altra.
        </p>
        <p>
          Quando la risposta onesta è "resta dove sei", te lo diciamo — e in quel caso non
          guadagniamo nulla.
        </p>
      </div>
      <div className="card">
        <p className="mono" style={{ color: "var(--text-secondary)" }}>
          {/* TODO: dato reale da recommendations_log */}
          Nei calcoli fatti finora, nel [X]% dei casi abbiamo consigliato di restare dove si è.
        </p>
      </div>
    </div>
  );
}
