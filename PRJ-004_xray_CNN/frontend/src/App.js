import { useState, useRef, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600;700&family=Exo+2:wght@200;300;400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #020a0f;
    --panel:     #040e14;
    --border:    #0d3a4a;
    --glow:      #00c8ff;
    --glow-dim:  #006a88;
    --warn:      #ff4e4e;
    --safe:      #00e676;
    --text:      #a8d8e8;
    --text-dim:  #3a6070;
    --mono:      'Share Tech Mono', monospace;
    --sans:      'Rajdhani', sans-serif;
    --body:      'Exo 2', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--body); min-height: 100vh; overflow-x: hidden; }

  .scanline {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,255,0.015) 2px, rgba(0,200,255,0.015) 4px);
    animation: scanMove 8s linear infinite;
  }
  @keyframes scanMove { from { background-position: 0 0; } to { background-position: 0 100vh; } }

  .corner { position: absolute; width: 16px; height: 16px; }
  .corner--tl { top: 0; left: 0; border-top: 1.5px solid var(--glow); border-left: 1.5px solid var(--glow); }
  .corner--tr { top: 0; right: 0; border-top: 1.5px solid var(--glow); border-right: 1.5px solid var(--glow); }
  .corner--bl { bottom: 0; left: 0; border-bottom: 1.5px solid var(--glow); border-left: 1.5px solid var(--glow); }
  .corner--br { bottom: 0; right: 0; border-bottom: 1.5px solid var(--glow); border-right: 1.5px solid var(--glow); }

  .app {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .header {
    padding: 28px 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 120px; height: 1px;
    background: var(--glow);
    box-shadow: 0 0 8px var(--glow);
  }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon {
    width: 36px; height: 36px;
    border: 1.5px solid var(--glow);
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    box-shadow: 0 0 12px rgba(0,200,255,0.3), inset 0 0 12px rgba(0,200,255,0.05);
  }
  .logo-cross { position: absolute; background: var(--glow); box-shadow: 0 0 6px var(--glow); }
  .logo-cross--h { width: 18px; height: 2px; }
  .logo-cross--v { width: 2px; height: 18px; }
  .logo-text { font-family: var(--sans); font-weight: 700; font-size: 18px; letter-spacing: 3px; color: #fff; text-transform: uppercase; }
  .logo-sub { font-family: var(--mono); font-size: 9px; color: var(--glow-dim); letter-spacing: 2px; display: block; margin-top: 2px; }

  .status-bar { display: flex; align-items: center; gap: 20px; }
  .status-item { font-family: var(--mono); font-size: 10px; color: var(--text-dim); letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--safe); box-shadow: 0 0 6px var(--safe); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .main { padding: 32px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }

  .panel { background: var(--panel); border: 1px solid var(--border); border-radius: 2px; position: relative; overflow: hidden; }
  .panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--glow), transparent); opacity: 0.5; }
  .panel-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .panel-title { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; color: var(--glow); text-transform: uppercase; }
  .panel-tag { font-family: var(--mono); font-size: 9px; color: var(--text-dim); letter-spacing: 1px; }

  .upload-zone {
    border: 1px dashed var(--border); border-radius: 2px; min-height: 320px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; position: relative; overflow: hidden; transition: border-color 0.2s, background 0.2s;
  }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--glow); background: rgba(0,200,255,0.03); }
  .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .upload-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .upload-icon-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; position: relative; z-index: 1; }
  .upload-rings { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
  .ring { position: absolute; border-radius: 50%; border: 1px solid var(--glow-dim); animation: ringPulse 3s ease-in-out infinite; }
  .ring:nth-child(1) { width: 80px; height: 80px; animation-delay: 0s; }
  .ring:nth-child(2) { width: 56px; height: 56px; animation-delay: 0.5s; }
  .ring:nth-child(3) { width: 32px; height: 32px; border-color: var(--glow); animation-delay: 1s; }
  @keyframes ringPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
  .upload-cross { width: 24px; height: 24px; position: relative; display: flex; align-items: center; justify-content: center; }
  .upload-cross::before, .upload-cross::after { content: ''; position: absolute; background: var(--glow); box-shadow: 0 0 8px var(--glow); }
  .upload-cross::before { width: 16px; height: 1.5px; }
  .upload-cross::after  { width: 1.5px; height: 16px; }
  .upload-label { font-family: var(--sans); font-size: 13px; font-weight: 500; letter-spacing: 2px; color: var(--text); text-transform: uppercase; }
  .upload-hint { font-family: var(--mono); font-size: 10px; color: var(--text-dim); letter-spacing: 1px; }

  .xray-preview { width: 100%; height: 320px; object-fit: contain; filter: grayscale(1) contrast(1.1) brightness(0.9); display: block; position: relative; z-index: 1; }
  .preview-overlay { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,200,255,0.05) 0%, transparent 30%, transparent 70%, rgba(0,200,255,0.05) 100%); }
  .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--glow), transparent); box-shadow: 0 0 8px var(--glow); animation: scanLine 2s linear infinite; opacity: 0.6; }
  @keyframes scanLine { from { top: 0; } to { top: 100%; } }

  .analyze-btn {
    width: 100%; padding: 14px; background: transparent; border: 1px solid var(--glow);
    border-radius: 2px; color: var(--glow); font-family: var(--sans); font-size: 13px;
    font-weight: 600; letter-spacing: 3px; text-transform: uppercase; cursor: pointer;
    position: relative; overflow: hidden; transition: all 0.2s; margin-top: 16px;
    box-shadow: 0 0 12px rgba(0,200,255,0.1), inset 0 0 12px rgba(0,200,255,0.05);
  }
  .analyze-btn::before { content: ''; position: absolute; inset: 0; background: var(--glow); transform: scaleX(0); transform-origin: left; transition: transform 0.3s; z-index: 0; }
  .analyze-btn:hover:not(:disabled)::before { transform: scaleX(1); }
  .analyze-btn:hover:not(:disabled) { color: var(--bg); }
  .analyze-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .analyze-btn span { position: relative; z-index: 1; }

  .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px 20px; }
  .loading-bar-wrap { width: 100%; height: 2px; background: var(--border); border-radius: 1px; overflow: hidden; }
  .loading-bar { height: 100%; background: linear-gradient(90deg, transparent, var(--glow), transparent); animation: loadBar 1.5s ease-in-out infinite; box-shadow: 0 0 8px var(--glow); }
  @keyframes loadBar { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
  .loading-text { font-family: var(--mono); font-size: 10px; color: var(--glow); letter-spacing: 2px; }

  .result-panel { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

  .diagnosis-display { padding: 24px; text-align: center; border-bottom: 1px solid var(--border); }
  .diagnosis-label { font-family: var(--mono); font-size: 10px; letter-spacing: 3px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px; }
  .diagnosis-value { font-family: var(--sans); font-size: 36px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; line-height: 1; margin-bottom: 16px; }
  .diagnosis-value.pneumonia { color: var(--warn); text-shadow: 0 0 20px rgba(255,78,78,0.5); }
  .diagnosis-value.normal    { color: var(--safe); text-shadow: 0 0 20px rgba(0,230,118,0.5); }
  .confidence-bar-wrap { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 8px; }
  .confidence-bar { height: 100%; border-radius: 2px; transition: width 1s ease; box-shadow: 0 0 8px currentColor; }
  .confidence-bar.pneumonia { background: var(--warn); color: var(--warn); }
  .confidence-bar.normal    { background: var(--safe); color: var(--safe); }
  .confidence-pct { font-family: var(--mono); font-size: 11px; color: var(--text-dim); letter-spacing: 1px; text-align: right; }

  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border-top: 1px solid var(--border); }
  .metric-cell { background: var(--panel); padding: 14px 16px; }
  .metric-key { font-family: var(--mono); font-size: 9px; letter-spacing: 2px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px; }
  .metric-val { font-family: var(--sans); font-size: 18px; font-weight: 600; color: var(--text); letter-spacing: 1px; }

  .info-rows { display: flex; flex-direction: column; }
  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-key { font-family: var(--mono); color: var(--text-dim); letter-spacing: 1px; font-size: 10px; }
  .info-val { font-family: var(--sans); color: var(--text); font-weight: 500; letter-spacing: 1px; font-size: 13px; }

  .waveform { display: flex; align-items: center; gap: 2px; height: 24px; }
  .wave-bar { width: 2px; background: var(--glow-dim); border-radius: 1px; animation: waveBounce 1.2s ease-in-out infinite; }
  @keyframes waveBounce { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }

  .footer { padding: 16px 0; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .footer-text { font-family: var(--mono); font-size: 9px; color: var(--text-dim); letter-spacing: 2px; text-transform: uppercase; }

  @media (max-width: 680px) {
    .main { grid-template-columns: 1fr; }
    .status-bar { display: none; }
  }
`;

const WAVE_HEIGHTS = [4, 8, 14, 10, 18, 12, 6, 16, 8, 14, 10, 6, 18, 12, 8, 14];

export default function App() {
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [drag, setDrag]       = useState(false);
  const [scanId, setScanId]   = useState(() => Math.floor(Math.random() * 900000 + 100000));

  const handleFile = useCallback((file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setScanId(Math.floor(Math.random() * 900000 + 100000));
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handlePredict = async () => {
    if (!image) return;
    setLoading(true); setError(null); setResult(null);
    const fd = new FormData();
    fd.append("file", image);
    try {
      const res = await fetch("http://localhost:8000/predict", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("CONNECTION FAILED — VERIFY BACKEND STATUS");
    } finally {
      setLoading(false);
    }
  };

  const cls      = result ? (result.label === "Pneumonia" ? "pneumonia" : "normal") : "";
  const confPct  = result ? Math.round(result.confidence * 100) : 0;
  const now      = new Date();
  const timestamp = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} — ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  return (
    <>
      <style>{styles}</style>
      <div className="scanline" />
      <div className="app">

        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-cross logo-cross--h" />
              <div className="logo-cross logo-cross--v" />
            </div>
            <div>
              <span className="logo-text">PneumoScan</span>
              <span className="logo-sub">CHEST X-RAY DIAGNOSTIC SYSTEM v3.1</span>
            </div>
          </div>
          <div className="status-bar">
            <div className="status-item"><div className="status-dot" />MODEL ONLINE</div>
            <div className="status-item">SYS — NOMINAL</div>
            <div className="status-item">{timestamp}</div>
          </div>
        </header>

        <main className="main">

          {/* Left — upload */}
          <div>
            <div className="panel">
              <div className="corner corner--tl"/><div className="corner corner--tr"/>
              <div className="corner corner--bl"/><div className="corner corner--br"/>
              <div className="panel-header">
                <span className="panel-title">IMAGE INPUT</span>
                <span className="panel-tag">SCAN #{scanId}</span>
              </div>
              <div style={{padding: '16px'}}>
                <label
                  className={`upload-zone${drag ? ' drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
                  <div className="upload-grid" />
                  {preview ? (
                    <>
                      <img src={preview} alt="X-ray" className="xray-preview" />
                      <div className="preview-overlay" />
                      <div className="scan-line" />
                    </>
                  ) : (
                    <div className="upload-icon-wrap">
                      <div className="upload-rings">
                        <div className="ring"/><div className="ring"/><div className="ring"/>
                        <div className="upload-cross" />
                      </div>
                      <span className="upload-label">Load X-Ray Image</span>
                      <span className="upload-hint">DRAG & DROP — JPG / PNG</span>
                    </div>
                  )}
                </label>

                <button className="analyze-btn" onClick={handlePredict} disabled={!image || loading}>
                  <span>{loading ? "ANALYZING..." : "RUN DIAGNOSTIC"}</span>
                </button>

                {image && (
                  <div className="info-rows" style={{marginTop: '16px'}}>
                    {[
                      ["FILE",   image.name.length > 22 ? image.name.slice(0,22)+'…' : image.name],
                      ["SIZE",   (image.size / 1024).toFixed(1) + " KB"],
                      ["TYPE",   image.type.split('/')[1].toUpperCase()],
                      ["STATUS", loading ? "PROCESSING" : result ? "COMPLETE" : "READY"],
                    ].map(([k, v]) => (
                      <div className="info-row" key={k}>
                        <span className="info-key">{k}</span>
                        <span className="info-val">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — result + info */}
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            <div className="panel">
              <div className="corner corner--tl"/><div className="corner corner--tr"/>
              <div className="corner corner--bl"/><div className="corner corner--br"/>
              <div className="panel-header">
                <span className="panel-title">DIAGNOSTIC OUTPUT</span>
                <div className="waveform">
                  {WAVE_HEIGHTS.map((h, i) => (
                    <div key={i} className="wave-bar" style={{
                      height: `${h}px`,
                      animationDelay: `${i * 0.08}s`,
                      opacity: result ? 1 : 0.3,
                    }}/>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="loading-wrap">
                  <div className="loading-bar-wrap"><div className="loading-bar" /></div>
                  <div className="loading-text">PROCESSING IMAGE DATA...</div>
                </div>
              )}

              {!loading && !result && !error && (
                <div style={{padding:'48px 24px', textAlign:'center'}}>
                  <div style={{fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', lineHeight:'2.2'}}>
                    AWAITING IMAGE INPUT<br/>SYSTEM READY
                  </div>
                </div>
              )}

              {error && (
                <div style={{padding:'32px 24px', textAlign:'center'}}>
                  <div style={{fontFamily:'var(--mono)', fontSize:'11px', color:'var(--warn)', letterSpacing:'2px'}}>{error}</div>
                </div>
              )}

              {result && !loading && (
                <div className="result-panel">
                  <div className="diagnosis-display">
                    <div className="diagnosis-label">PRIMARY DIAGNOSIS</div>
                    <div className={`diagnosis-value ${cls}`}>{result.label}</div>
                    <div className="confidence-bar-wrap">
                      <div className={`confidence-bar ${cls}`} style={{width:`${confPct}%`}} />
                    </div>
                    <div className="confidence-pct">CONFIDENCE {confPct}%</div>
                  </div>
                  <div className="metrics-grid">
                    {[
                      ["RESULT",     result.label.toUpperCase()],
                      ["CONFIDENCE", confPct + "%"],
                      ["MODEL",      "RESNET-18"],
                      ["TIME",       `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`],
                    ].map(([k, v]) => (
                      <div className="metric-cell" key={k}>
                        <div className="metric-key">{k}</div>
                        <div className="metric-val">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* System info panel */}
            <div className="panel">
              <div className="corner corner--tl"/><div className="corner corner--tr"/>
              <div className="corner corner--bl"/><div className="corner corner--br"/>
              <div className="panel-header">
                <span className="panel-title">SYSTEM INFO</span>
              </div>
              <div style={{padding:'16px'}}>
                <div className="info-rows">
                  {[
                    ["ARCHITECTURE",  "ResNet-18"],
                    ["TRAINING SET",  "5,216 X-RAYS"],
                    ["TEST ACCURACY", "85.1%"],
                    ["F1 SCORE",      "89.3%"],
                    ["CLASSES",       "NORMAL / PNEUMONIA"],
                    ["FORMAT",        "ONNX RUNTIME"],
                  ].map(([k, v]) => (
                    <div className="info-row" key={k}>
                      <span className="info-key">{k}</span>
                      <span className="info-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <span className="footer-text">PNEUMOSCAN DIAGNOSTIC SYSTEM — FOR RESEARCH USE ONLY</span>
          <span className="footer-text">NOT FOR CLINICAL USE</span>
        </footer>
      </div>
    </>
  );
}