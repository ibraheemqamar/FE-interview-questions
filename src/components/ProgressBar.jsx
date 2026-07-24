// Progress bar shown in Quiz mode: how many of the current deck are marked.
export default function ProgressBar({ deckLength, got, rev }) {
  const total = deckLength || 1;
  const done = got + rev;
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: (done / total) * 100 + "%" }} />
      </div>
      <div className="progress-meta">
        <span>{`${done} / ${deckLength} reviewed`}</span>
        <span className="tags">
          <span className="pill-got">
            ✓ <b>{got}</b> got it
          </span>
          <span className="pill-rev">
            ↻ <b>{rev}</b> to review
          </span>
        </span>
      </div>
    </div>
  );
}
