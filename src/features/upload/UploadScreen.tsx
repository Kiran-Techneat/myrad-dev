/** Simple CD/DVD dropzone screen (kept for parity with the original template). */
export function UploadScreen() {
  return (
    <div className="wrap">
      <div className="pagehd">
        <div>
          <div className="kicker">Upload your own images</div>
          <div className="h1 serif" style={{ fontSize: 26 }}>
            Upload from a CD or DVD
          </div>
        </div>
      </div>
      <div className="dropzone">
        <div className="dropzone-ic">
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 3v12m0-12l-5 5m5-5l5 5" />
            <path d="M5 21h14" />
          </svg>
        </div>
        <h4 className="serif">Drag your files here</h4>
        <p>Or choose them from your computer. We accept CDs, DVDs, and image files.</p>
        <button className="btn btn-ghost">Choose files</button>
      </div>
    </div>
  );
}
