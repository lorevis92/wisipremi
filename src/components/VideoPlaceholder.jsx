export default function VideoPlaceholder() {
  return (
    <div
      className="mono"
      style={{
        fontSize: 12,
        color: "var(--text-muted)",
        background: "var(--surface)",
        borderRadius: "var(--radius-section)",
        padding: "8px 10px",
        textAlign: "center",
        margin: "8px 0 12px",
      }}
    >
      🎥 Video in arrivo
    </div>
  );
}
