/** Full-screen blocking spinner overlay (uses the app's `.su-spin`). */
const Loader = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(1px)',
    }}
  >
    <span className="su-spin" style={{ width: 44, height: 44 }} />
  </div>
);

export default Loader;
