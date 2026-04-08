import { useState, useRef } from "react";
import axios from "axios";

const COLORS = {
  forest:   "#1a3c2e",
  green:    "#2d6a4f",
  mint:     "#52b788",
  light:    "#d8f3dc",
  cream:    "#f8faf7",
  text:     "#1b2e22",
  muted:    "#5a7a65",
  white:    "#ffffff",
  danger:   "#c0392b",
  warning:  "#e67e22",
};

const diseaseInfo = {
  Early_blight: {
    color: "#e67e22",
    bg:    "#fef3e2",
    icon:  "⚠",
    tip:   "Apply copper-based fungicide. Remove infected leaves immediately.",
  },
  Late_blight: {
    color: "#c0392b",
    bg:    "#fdecea",
    icon:  "✕",
    tip:   "Highly contagious. Destroy infected plants and avoid overhead watering.",
  },
  Healthy: {
    color: "#2d6a4f",
    bg:    "#d8f3dc",
    icon:  "✓",
    tip:   "Your plant looks great! Keep up the good care routine.",
  },
};

export default function App() {
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", image);
      const res = await axios.post("http://localhost:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch {
      setError("Could not connect to the model server. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null); setPreview(null);
    setResult(null); setError(null);
  };

  const info = result ? diseaseInfo[result.disease] : null;
  const confidence = result ? (result.confidence * 100).toFixed(1) : 0;

  return (
    <div style={s.page}>

      {/* ── Background blobs ── */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🥔</div>
          <div>
            <div style={s.logoTitle}>PotatoScan</div>
            <div style={s.logoSub}>AI Disease Detection</div>
          </div>
        </div>
        <div style={s.badge}>Powered by CNN Model · 99% Accuracy</div>
      </header>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <h1 style={s.heroTitle}>Detect Potato Disease<br />
          <span style={s.heroAccent}>Instantly with AI</span>
        </h1>
        <p style={s.heroSub}>
          Upload a photo of a potato leaf and get an instant diagnosis
          with treatment recommendations.
        </p>
      </section>

      {/* ── Main card ── */}
      <main style={s.card}>

        {/* Upload zone */}
        {!preview ? (
          <div
            style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div style={s.uploadIcon}>📷</div>
            <p style={s.uploadTitle}>Drop your leaf image here</p>
            <p style={s.uploadSub}>or click to browse · JPG, PNG supported</p>
            <input
              ref={inputRef} type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div style={s.previewSection}>
            <img src={preview} alt="leaf" style={s.previewImg} />
            <button onClick={reset} style={s.removeBtn}>✕ Remove</button>
          </div>
        )}

        {/* Analyse button */}
        {preview && !result && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...s.analyseBtn, ...(loading ? s.analyseBtnLoading : {}) }}
          >
            {loading
              ? <><span style={s.spinner} /> Analysing leaf...</>
              : "Analyse Leaf"}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={s.errorBox}>
            <strong>Connection Error</strong><br />{error}
          </div>
        )}

        {/* Result */}
        {result && info && (
          <div style={s.resultSection}>

            {/* Status banner */}
            <div style={{ ...s.statusBanner, background: info.bg, borderColor: info.color }}>
              <span style={{ ...s.statusIcon, color: info.color }}>{info.icon}</span>
              <div>
                <div style={{ ...s.statusLabel, color: info.color }}>Diagnosis</div>
                <div style={{ ...s.statusDisease, color: info.color }}>
                  {result.disease.replace("_", " ")}
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div style={s.confSection}>
              <div style={s.confHeader}>
                <span style={s.confLabel}>Confidence</span>
                <span style={s.confValue}>{confidence}%</span>
              </div>
              <div style={s.confTrack}>
                <div style={{
                  ...s.confFill,
                  width: `${confidence}%`,
                  background: info.color,
                }} />
              </div>
            </div>

            {/* Tip */}
            <div style={s.tipBox}>
              <div style={s.tipTitle}>Recommendation</div>
              <p style={s.tipText}>{info.tip}</p>
            </div>

            {/* Scan again */}
            <button onClick={reset} style={s.scanAgainBtn}>
              Scan Another Leaf
            </button>
          </div>
        )}
      </main>

      {/* ── Disease guide cards ── */}
      <section style={s.guideSection}>
        <h2 style={s.guideTitle}>What can we detect?</h2>
        <div style={s.guideGrid}>
          {Object.entries(diseaseInfo).map(([name, d]) => (
            <div key={name} style={{ ...s.guideCard, borderTop: `3px solid ${d.color}` }}>
              <span style={{ fontSize: 24 }}>{d.icon}</span>
              <div style={{ ...s.guideName, color: d.color }}>{name.replace("_", " ")}</div>
              <p style={s.guideDesc}>{d.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={s.footer}>
        Built with FastAPI · TensorFlow · React
      </footer>
    </div>
  );
}

/* ── Styles ── */
const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #f0f7f2 0%, #e8f5ec 50%, #f5f9f0 100%)",
    fontFamily: "'Segoe UI', sans-serif",
    color: COLORS.text,
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed", top: -120, right: -120,
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, #c7ecd2 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  blob2: {
    position: "fixed", bottom: -100, left: -100,
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, #d4edda 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  header: {
    position: "relative", zIndex: 1,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(45,106,79,0.1)",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
  },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 32 },
  logoTitle: { fontSize: 20, fontWeight: 700, color: COLORS.forest },
  logoSub: { fontSize: 12, color: COLORS.muted },
  badge: {
    background: COLORS.light, color: COLORS.green,
    padding: "6px 14px", borderRadius: 20,
    fontSize: 12, fontWeight: 600,
    border: "1px solid #b7e4c7",
  },
  hero: {
    position: "relative", zIndex: 1,
    textAlign: "center", padding: "60px 20px 30px",
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: 800, lineHeight: 1.2,
    color: COLORS.forest, margin: 0,
  },
  heroAccent: { color: COLORS.mint },
  heroSub: {
    fontSize: 16, color: COLORS.muted,
    maxWidth: 480, margin: "16px auto 0",
    lineHeight: 1.6,
  },
  card: {
    position: "relative", zIndex: 1,
    maxWidth: 560, margin: "0 auto",
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 24, padding: 32,
    boxShadow: "0 8px 40px rgba(26,60,46,0.1)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  dropZone: {
    border: "2px dashed #b7e4c7",
    borderRadius: 16, padding: "48px 24px",
    textAlign: "center", cursor: "pointer",
    transition: "all 0.2s",
    background: "#f8fdf9",
  },
  dropZoneActive: { borderColor: COLORS.mint, background: "#edf7f1" },
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadTitle: { fontSize: 16, fontWeight: 600, color: COLORS.forest, margin: "0 0 6px" },
  uploadSub: { fontSize: 13, color: COLORS.muted, margin: 0 },
  previewSection: { position: "relative", textAlign: "center" },
  previewImg: {
    width: "100%", maxHeight: 300,
    objectFit: "cover", borderRadius: 16,
    border: "2px solid #b7e4c7",
  },
  removeBtn: {
    position: "absolute", top: 10, right: 10,
    background: "rgba(255,255,255,0.9)", border: "1px solid #ddd",
    borderRadius: 20, padding: "4px 12px",
    fontSize: 12, cursor: "pointer", color: "#666",
  },
  analyseBtn: {
    width: "100%", marginTop: 20,
    background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.mint})`,
    color: COLORS.white,
    border: "none", borderRadius: 14,
    padding: "16px 24px", fontSize: 16,
    fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 10,
    transition: "opacity 0.2s",
  },
  analyseBtnLoading: { opacity: 0.75, cursor: "not-allowed" },
  spinner: {
    width: 18, height: 18,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    marginTop: 20, padding: 16,
    background: "#fdecea", borderRadius: 12,
    border: "1px solid #f5c6cb",
    color: COLORS.danger, fontSize: 14, lineHeight: 1.5,
  },
  resultSection: { marginTop: 20 },
  statusBanner: {
    display: "flex", alignItems: "center", gap: 16,
    padding: 20, borderRadius: 14,
    border: "1.5px solid",
    marginBottom: 20,
  },
  statusIcon: { fontSize: 32, fontWeight: 900 },
  statusLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 },
  statusDisease: { fontSize: 22, fontWeight: 800, marginTop: 2 },
  confSection: { marginBottom: 20 },
  confHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  confLabel: { fontSize: 13, color: COLORS.muted, fontWeight: 600 },
  confValue: { fontSize: 13, fontWeight: 700, color: COLORS.forest },
  confTrack: {
    height: 10, background: "#e8f5ec",
    borderRadius: 10, overflow: "hidden",
  },
  confFill: { height: "100%", borderRadius: 10, transition: "width 0.8s ease" },
  tipBox: {
    background: COLORS.cream, borderRadius: 12,
    padding: 16, marginBottom: 20,
    border: "1px solid #e0ede4",
  },
  tipTitle: { fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  tipText: { fontSize: 14, color: COLORS.text, margin: 0, lineHeight: 1.6 },
  scanAgainBtn: {
    width: "100%", padding: "12px 24px",
    border: `2px solid ${COLORS.green}`, borderRadius: 14,
    background: "transparent", color: COLORS.green,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
  },
  guideSection: {
    position: "relative", zIndex: 1,
    maxWidth: 560, margin: "40px auto 0",
    padding: "0 0 20px",
  },
  guideTitle: {
    textAlign: "center", fontSize: 20,
    fontWeight: 700, color: COLORS.forest,
    marginBottom: 20,
  },
  guideGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  guideCard: {
    background: "rgba(255,255,255,0.85)",
    borderRadius: 16, padding: 20,
    boxShadow: "0 2px 12px rgba(26,60,46,0.07)",
  },
  guideName: { fontSize: 15, fontWeight: 700, margin: "8px 0 6px" },
  guideDesc: { fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5 },
  footer: {
    position: "relative", zIndex: 1,
    textAlign: "center", padding: "30px 20px",
    fontSize: 12, color: COLORS.muted,
  },
};