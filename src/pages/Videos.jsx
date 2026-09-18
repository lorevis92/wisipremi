/**
 * Pagina video: qui vanno incorporati i video prodotti con WisiTube.
 *
 * TODO per Claude Code:
 * - Struttura consigliata: un array VIDEOS con { slug, title, youtubeId, relatedConcept }
 * - Ogni video collegato al concetto che spiega, per poterlo incorporare
 *   anche dentro Compare.jsx come tooltip/spiegazione ("Cos'è la franchigia? -> video")
 * - Formato embed: <iframe> YouTube standard, lazy-loaded
 */
const VIDEOS = [
  // { slug: "franchigia-300-o-2500", title: "Franchigia 300 o 2500: come si decide davvero", youtubeId: "" },
  // { slug: "hausarzt-hmo-telmed", title: "Modello Hausarzt/HMO/Telmed: cosa perdi", youtubeId: "" },
];

export default function Videos() {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <h1 className="display">Video</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Spiegazioni prodotte con WisiTube. Aggiungi i video in VIDEOS quando sono pronti.
      </p>
      {VIDEOS.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>Nessun video ancora pubblicato.</p>
      )}
    </div>
  );
}
