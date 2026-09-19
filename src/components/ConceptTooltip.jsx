import { useEffect, useRef, useState } from "react";

/**
 * (i) cliccabile che apre un popover con testo breve + segnaposto video.
 * videoId e' predisposto per un embed reale in futuro: finche' nessun
 * concetto lo passa, si vede sempre il placeholder "Video in arrivo".
 */
export default function ConceptTooltip({ title, text, videoId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block", marginLeft: 6 }}>
      <button
        type="button"
        aria-label={`Cos'è: ${title}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "1px solid var(--border)",
          background: open ? "var(--primary)" : "var(--surface)",
          color: open ? "#fff" : "var(--text-secondary)",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
          padding: 0,
          verticalAlign: "middle",
        }}
      >
        i
      </button>

      {open && (
        <div
          className="card"
          role="dialog"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 20,
            width: 260,
            padding: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13 }}>{title}</p>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-secondary)" }}>{text}</p>
          <div
            className="mono"
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              background: "var(--surface)",
              borderRadius: "var(--radius-section)",
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            {videoId ? `🎥 Video: ${videoId}` : "🎥 Video in arrivo"}
          </div>
        </div>
      )}
    </span>
  );
}
