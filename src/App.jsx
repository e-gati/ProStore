import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

// ─── ЛОГИН ФОРМА ─────────────────────────────────────────────────────────────
function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Попълни всички полета"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError("Грешно потребителско име или парола");
    setLoading(false);
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "10px 13px",
    border: focusedField === field ? "1.5px solid #e4e4e4" : "1.5px solid #e4e4e4",
    borderRadius: 8,
    fontFamily: "'Geist',system-ui,sans-serif",
    fontSize: 14,
    color: "#000000",
    background: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(29,78,216,.12)" : "none",
    transition: "border-color .15s, box-shadow .15s",
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(135deg, #042f2e 0%, #2dd4bf 60%, #2dd4bf 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Geist',system-ui,sans-serif",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "40px 36px",
        width: 380,
        boxSizing: "border-box",
        boxShadow: "0 24px 60px rgba(0,0,0,.28)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.03em", color: "#000000" }}>
            ПроСтор
          </div>
          <div style={{ fontSize: 13, color: "#999999", marginTop: 4 }}>
            Складова система
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: ".07em", color: "#555555", display: "block", marginBottom: 6,
            }}>
              Потребител
            </label>
            <input
              type="text"
              placeholder="потребител@sklad.local"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              autoFocus
              style={inputStyle("email")}
            />
          </div>

          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: ".07em", color: "#555555", display: "block", marginBottom: 6,
            }}>
              Парола
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={inputStyle("password")}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(244,63,94,.1)", border: "1px solid #fecdd3",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#C72B32", fontWeight: 500,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Geist',system-ui,sans-serif",
              background: loading ? "#4a4a4a" : "#000000",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
              letterSpacing: "-.01em",
              boxShadow: loading ? "none" : "0 2px 12px rgba(45,212,191,.25)",
              transition: "background .15s, box-shadow .15s",
            }}
          >
            {loading ? "Влизане…" : "Влез в системата"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR ПАНЕЛ ─────────────────────────────────────────────────────────────────
function QRPanel({ url, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(4px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#ffffff",borderRadius:16,padding:28,width:310,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4,color:"#000000"}}>📱 Свържи телефона</div>
        <div style={{fontSize:13,color:"#555555",marginBottom:18,lineHeight:1.5}}>Сканирай QR кода с камерата на телефона за да отвориш баркод скенера</div>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=111827&margin=10`}
          alt="QR" style={{width:200,height:200,borderRadius:10,border:"1px solid #e8e8e8",marginBottom:16}}/>
        <div style={{background:"#ffffff",borderRadius:8,padding:"10px 12px",marginBottom:16,fontFamily:"monospace",fontSize:12,color:"#000000",wordBreak:"break-all",border:"1px solid #e8e8e8",userSelect:"all"}}>{url}</div>
        <div style={{fontSize:12,color:"#999999",marginBottom:18,lineHeight:1.5}}>📶 Компютърът и телефонът трябва да са на <b>един Wi-Fi</b></div>
        <button onClick={onClose} style={{width:"100%",padding:"11px",background:"#000000",color:"#fff",border:"none",borderRadius:9,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>Затвори</button>
      </div>
    </div>
  );
}

// ─── НАЧАЛНИ КАТЕГОРИИ (редактируеми) ────────────────────────────────────────
const КАТ_ИНИ = [
  { id:1,  ime:"Климатици",    цв:"#16a34a", ico:"❄️"  },
  { id:2,  ime:"Телевизори",   цв:"#0891b2", ico:"📺"  },
  { id:3,  ime:"Телефони",     цв:"#C72B32", ico:"📱"  },
  { id:4,  ime:"Компютри",     цв:"#16a34a", ico:"💻"  },
  { id:5,  ime:"Бяла техника", цв:"#000000", ico:"🫙"  },
  { id:6,  ime:"Малки уреди",  цв:"#9a3412", ico:"🔌"  },
  { id:7,  ime:"Осветление",   цв:"#92400e", ico:"💡"  },
  { id:8,  ime:"Инструменти",  цв:"#3b5e1a", ico:"🔧"  },
  { id:9,  ime:"Отопление",    цв:"#991b1b", ico:"🔥"  },
  { id:10, ime:"Бани",         цв:"#155e75", ico:"🚿"  },
  { id:11, ime:"Домашни",      цв:"#14532d", ico:"🏠"  },
  { id:12, ime:"Градина",      цв:"#16a34a", ico:"🌿"  },
  { id:13, ime:"Ел. материали",цв:"#14532d", ico:"⚡"  },
];

const ИКОНИ = ["❄️","📺","📱","💻","🫙","🔌","💡","🔧","🔥","🚿","🏠","🌿","⚡","🛒","🧹","🪑","🛋","🪟","🚪","🔑","📦","🧰","🪛","🔩","🪝","💈","🧲","🎛","📡","🖥","🖨","⌨️","🖱","📷","📞","☎️","📟","🔋","🔌","💽","💿","📀"];
const ЦВЕТОВЕ = ["#16a34a","#0891b2","#C72B32","#16a34a","#000000","#9a3412","#92400e","#3b5e1a","#991b1b","#155e75","#14532d","#16a34a","#14532d","#14532d","#d97706","#15803d","#7c2d12","#f0fdf4"];
const МЕРНИ  = ["бр","к-т","м","м²","л","кг","ролка","пакет"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const стат = (н,п) => н<=0?"изч":н<=Math.floor(п/2)?"крит":н<=п?"ниск":"добр";
const сЦ   = s => ({добр:"#000000",ниск:"#d97706",крит:"#C72B32",изч:"#999999"}[s]||"#999999");
const сФ   = s => ({добр:"rgba(0,0,0,.04)",ниск:"rgba(180,83,9,.06)",крит:"rgba(199,43,50,.08)",изч:"rgba(0,0,0,.03)"}[s]);
const сЛ   = s => ({добр:"Наличен",ниск:"Ниско",крит:"Критично",изч:"Изчерпан"}[s]||"");
const f2   = n => (+n||0).toFixed(2);
const fN   = n => (+n||0).toLocaleString("bg");
const мрж  = (д,п) => +п>0 ? Math.round((+п-+д)/+п*100) : 0;
const getNow = () => new Date();

// ─── EET/EEST ДАТИ (Europe/Sofia) ────────────────────────────────────────────
const EET = "Europe/Sofia";
const eetДата  = (d=new Date()) => d.toLocaleDateString("sv",{timeZone:EET});
const eetИСО   = (d=new Date()) => { const дата=d.toLocaleDateString("sv",{timeZone:EET}); const час=d.toLocaleTimeString("bg",{timeZone:EET,hour:"2-digit",minute:"2-digit",hour12:false}); return `${дата}T${час}`; };
const toEetДата = (str) => new Date(str).toLocaleDateString("sv",{timeZone:EET});
const toEetМ    = (str) => new Date(str).toLocaleDateString("sv",{timeZone:EET}).slice(0,7);

const csvExp = (rows,name) => {
  const BOM = "\uFEFF";
  const csv = BOM + rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})),download:name}).click();
};

// ─── SCANNER HOOK (iOS Safari + Android Chrome) ───────────────────────────────
async function loadJsQR() {
  if (window.jsQR) return window.jsQR;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.jsQR;
}

function useScanner(onResult) {
  const vRef   = useRef();
  const sRef   = useRef();   // MediaStream
  const rafRef = useRef();   // requestAnimationFrame id
  const aRef   = useRef(false);
  const [ready, setRdy] = useState(false);
  const [err,   setErr] = useState(null);

  const stop = useCallback(() => {
    aRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    sRef.current?.getTracks().forEach(t => t.stop());
    sRef.current = null;
    setRdy(false);
  }, []);

  const start = useCallback(async () => {
    setErr(null);
    aRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } }
      });
      sRef.current = stream;
      const v = vRef.current;
      if (!v) { stop(); return; }
      v.srcObject = stream;
      await v.play();
      setRdy(true);

      // ── Нативен BarcodeDetector (Chrome/Android) ──────────────────────────
      if (window.BarcodeDetector) {
        const det = new window.BarcodeDetector({
          formats: ["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]
        });
        const loop = async () => {
          if (!aRef.current) return;
          try {
            const r = await det.detect(v);
            if (r.length) { onResult(r[0].rawValue); stop(); return; }
          } catch(_) {}
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── jsQR fallback (iOS Safari, Firefox) ───────────────────────────────
      const jsQR = await loadJsQR();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const scan = () => {
        if (!aRef.current) return;
        if (v.readyState === v.HAVE_ENOUGH_DATA) {
          canvas.width  = v.videoWidth;
          canvas.height = v.videoHeight;
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (code?.data) { onResult(code.data); stop(); return; }
        }
        rafRef.current = requestAnimationFrame(scan);
      };
      rafRef.current = requestAnimationFrame(scan);

    } catch (e) {
      console.error("Scanner:", e);
      setErr(e.name === "NotAllowedError" ? "DENIED" : "ERROR");
      aRef.current = false;
    }
  }, [onResult, stop]);

  useEffect(() => () => stop(), [stop]);
  return { vRef, ready, err, start, stop };
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;background:#f7f7f7}
  body{font-family:'Geist',system-ui,sans-serif;color:#000000;overflow:hidden;font-size:13px;line-height:1.4}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#d8d8d8;border-radius:99px}
  ::-webkit-scrollbar-thumb:hover{background:#bbbbbb}

  .M{font-family:"Geist Mono",monospace;font-variant-numeric:tabular-nums;letter-spacing:-.01em;}

  .inp{width:100%;height:32px;padding:0 12px;border:1px solid #e4e4e4;border-radius:6px;font-family:inherit;font-size:13px;color:#000000;background:#ffffff;outline:none;transition:border-color .15s,box-shadow .15s;line-height:1}
  .inp:focus{border-color:#000000;box-shadow:none}
  .inp::placeholder{color:#cccccc;font-size:12px}
  .inp-sm{height:28px;padding:0 10px;font-size:12px}
  select.inp{cursor:pointer}

  .btn{cursor:pointer;border:none;font-family:inherit;font-weight:500;border-radius:6px;transition:all .13s;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-size:13px;line-height:1;white-space:nowrap;height:32px;padding:0 14px;vertical-align:middle;}
  .btn:hover{filter:brightness(.92)}
  .btn:active{transform:scale(.98)}
  .btn > span[role="img"], .btn > .ico{line-height:1;display:inline-flex;align-items:center;}

  .btn-blue{background:#111111;color:#ffffff;font-weight:500;}
  .btn-blue:hover{background:#000000;filter:none}
  .btn-gray{background:#f0f0f0;color:#555555;border:1px solid #e4e4e4;}
  .btn-gray:hover{background:#e4e4e4;color:#000000;filter:none}
  .btn-red{background:#fff5f5;color:#C72B32;border:1px solid #f5c6c8;}
  .btn-red:hover{background:#fde8e8;filter:none}
  .btn-green{background:#111111;color:#ffffff;font-weight:500;}
  .btn-green:hover{background:#000000;filter:none}
  .btn-sm{height:28px;padding:0 10px;font-size:12px;}
  .btn-icon{height:28px;width:28px;padding:0;font-size:13px;border:1px solid #e4e4e4;background:#ffffff;}
  .btn-toggle{height:28px;padding:0 10px;font-size:12px;font-weight:400;cursor:pointer;border-radius:5px;font-family:inherit;border:1px solid #e4e4e4;background:#ffffff;transition:all .12s;display:inline-flex;align-items:center;justify-content:center;line-height:1;white-space:nowrap;color:#555555;}

  .card{background:#ffffff;border-radius:8px;border:1px solid #e8e8e8;}

  .nav-item{display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:5px;cursor:pointer;transition:all .12s;border:none;background:none;font-family:inherit;font-size:13px;font-weight:400;color:#555555;width:100%;text-align:left;line-height:1;height:32px;}
  .nav-item:hover{background:#f0f0f0;color:#000000}
  .nav-item.active{background:#f0f0f0;color:#000000;font-weight:600;}
  .nav-item > span:first-child{display:inline-flex;align-items:center;justify-content:center;width:18px;flex-shrink:0;line-height:1;font-size:14px;}

  .tag{display:inline-flex;align-items:center;padding:2px 7px;border-radius:3px;font-size:11px;font-weight:500;line-height:1.4;letter-spacing:.01em}
  .chip{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:3px;font-size:11px;font-weight:400;line-height:1.4;color:#555555;background:#f0f0f0;}

  .table-row{display:grid;align-items:center;height:38px;border-bottom:1px solid #f0f0f0;cursor:pointer;transition:background .1s}
  .table-row:hover{background:#f7f7f7}
  .table-row:last-child{border-bottom:none}
  .th{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#cccccc;height:30px;display:flex;align-items:center;padding:0}
  .lbl{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:#999999;margin-bottom:4px;display:block}

  .kpi-box{background:#ffffff;border-radius:8px;border:1px solid #e8e8e8;padding:12px 14px}
  .kpi-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:#999999;margin-bottom:3px}
  .kpi-value{font-size:19px;font-weight:700;letter-spacing:-.02em;font-family:"Geist Mono",monospace;font-variant-numeric:tabular-nums;line-height:1.1}

  .divider{height:1px;background:#f0f0f0;margin:0}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .15s ease both}
  @keyframes scanline{0%,100%{top:10%}50%{top:85%}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes toast{0%{opacity:0;transform:translateY(8px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0}}
  .toast{animation:toast 3s ease both;position:fixed;bottom:24px;right:24px;background:#111111;color:#ffffff;padding:10px 16px;border-radius:6px;font-size:13px;font-weight:400;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,.12)}

  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);backdrop-filter:blur(2px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
  .modal{background:#ffffff;border-radius:10px;overflow:hidden;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.1);border:1px solid #e8e8e8}
  .modal-hdr{padding:13px 18px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#ffffff;z-index:1}
  .modal-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px}
  .modal-body .inp{height:34px;padding:0 12px}
  .modal-body .inp-sm{height:32px}
  .modal-body select.inp{height:34px}
  .modal-body .lbl{color:#999999}
  .modal-ftr{padding:12px 18px;border-top:1px solid #f0f0f0;display:flex;gap:8px;justify-content:flex-end}
  input[type=number]::-webkit-inner-spin-button{opacity:.3}

  .dd{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#ffffff;border-radius:8px;border:1px solid #e4e4e4;box-shadow:0 6px 20px rgba(0,0,0,.08);z-index:100;overflow:hidden;animation:fadeIn .1s ease}
  .dd-row{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;transition:background .1s;border-bottom:1px solid #f0f0f0}
  .dd-row:hover{background:#f7f7f7}
  .dd-row:last-child{border-bottom:none}
  .swatch{width:22px;height:22px;border-radius:5px;cursor:pointer;border:2px solid transparent;transition:all .12s;flex-shrink:0}
  .swatch:hover{transform:scale(1.1)}
  .swatch.sel{border-color:#000000}
  .ico-btn{width:32px;height:32px;border-radius:5px;border:1px solid #e4e4e4;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:all .12s;background:#ffffff}
  .ico-btn:hover{border-color:#999999;background:#f7f7f7}
  .ico-btn.sel{border-color:#000000;background:#f7f7f7;}
`;

// ─── CAMERA MODAL ─────────────────────────────────────────────────────────────
function CamModal({onScan,onClose}){
  const [man, setMan] = useState("");
  const [loading, setLoading] = useState(true);

  const handleR = useCallback(c => {
    if (c) onScan(c.trim());
  }, [onScan]);

  const { vRef, ready, err, start, stop } = useScanner(handleR);

  useEffect(() => {
    start().finally(() => setLoading(false));
    return stop;
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.9)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        width: 440, boxShadow: "0 24px 60px rgba(0,0,0,.5)"
      }}>
        {/* Хедър */}
        <div style={{
          padding: "16px 20px", display: "flex", justifyContent: "space-between",
          alignItems: "center", borderBottom: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>📷 Сканирай баркод</div>
          <button className="btn btn-gray btn-sm" onClick={() => { stop(); onClose(); }}>✕ Затвори</button>
        </div>

        {/* Камера */}
        <div style={{ position: "relative", background: "#000", aspectRatio: "4/3" }}>
          <video
            ref={vRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            playsInline
            muted
            autoPlay
          />

          {/* Прицел */}
          {ready && !err && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", pointerEvents: "none"
            }}>
              <div style={{ width: "55%", height: "60%", position: "relative" }}>
                {[[0,0],[0,1],[1,0],[1,1]].map(([y,x], i) => (
                  <div key={i} style={{
                    position: "absolute",
                    ...(y ? { bottom: 0 } : { top: 0 }),
                    ...(x ? { right: 0 } : { left: 0 }),
                    width: 24, height: 24,
                    borderTop:    !y ? "3px solid #fff" : "none",
                    borderBottom:  y ? "3px solid #fff" : "none",
                    borderLeft:   !x ? "3px solid #fff" : "none",
                    borderRight:   x ? "3px solid #fff" : "none",
                  }} />
                ))}
                {/* Scan line */}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2,
                  background: "rgba(255,255,255,.7)", borderRadius: 1,
                  animation: "scanline 1.8s ease-in-out infinite"
                }} />
              </div>
            </div>
          )}

          {/* Зареждане */}
          {(loading || (!ready && !err)) && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 10
            }}>
              <div style={{
                width: 36, height: 36,
                border: "3px solid rgba(255,255,255,.2)",
                borderTopColor: "#fff", borderRadius: "50%",
                animation: "spin .8s linear infinite"
              }} />
              <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>Стартиране…</div>
            </div>
          )}

          {/* Грешка */}
          {err && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 8, padding: 20
            }}>
              <div style={{ fontSize: 36 }}>{err === "DENIED" ? "🔒" : "📷"}</div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                {err === "DENIED"
                  ? "Камерата е заключена — провери настройките на Safari"
                  : "Грешка при стартиране на камерата"}
              </div>
              {err === "DENIED" && (
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12, textAlign: "center" }}>
                  Настройки → Safari → Камера → Разреши
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ръчно въвеждане */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
            Или въведи баркода ръчно:
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="inp"
              autoFocus={!!err}
              placeholder="5901234567890…"
              value={man}
              onChange={e => setMan(e.target.value)}
              onKeyDown={e => e.key === "Enter" && man.trim() && onScan(man.trim())}
              style={{ fontFamily: "monospace", fontSize: 14 }}
            />
            <button
              className="btn btn-blue"
              onClick={() => man.trim() && onScan(man.trim())}
            >
              ОК
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ГЛАВЕН КОМПОНЕНТ ─────────────────────────────────────────────────────────
export default function App(){
  // ── Автентикация ──────────────────────────────────────────────────────────
  const [сесия, setSesiq] = useState(null);
  const [зареждаСесия, setЗарСесия] = useState(true);

  // Данни
  const [стоки,  setSt]  = useState([]);
  const [движ,   setДв]  = useState([]);
  // Стартираме с празен масив — КАТ_ИНИ се пази само като резервни данни ако Supabase е недостъпен
  const [кат,    setКат] = useState([]);
  const [зарежда,setЗар] = useState(true);

  // Навигация
  const [tab,    setTab]  = useState("sale");

  // Продажба
  const [търс,   setТ]    = useState("");
  const [избСт,  setИС]   = useState(null);
  const [кол,    setКол]  = useState("1");
  const [ц,      setЦ]    = useState("");
  const [бел,    setBел]  = useState("");
  const [показДД,setДД]   = useState(false);
  const [flash,  setFl]   = useState(null);
  // Кошница — единна за всички продажби
  const [кошница,   setКош]  = useState([]);
  const [общаЦена,  setОЦ]   = useState("");
  const колRef   = useRef();
  const стокиRef = useRef([]);
  const катRef   = useRef([]);

  // Стоки
  const [сТърс,  setСТ]   = useState("");
  const [фКат,   setФК]   = useState("Всички");
  const [стМод,  setSM]   = useState(false);
  const [форма,  setФ]    = useState(null);
  const [нова,   setН]    = useState(false);
  const [скКод,  setСкК]  = useState(null);
  const [камМ,   setКМ]   = useState(false);
  const [камРеж, setКР]   = useState("стоки");

  // Телефонен скенер
  const [телМ,   setТМ]   = useState(false);
  const [сървИнфо,setSI]  = useState(null);
  const [последенБар,setПБ]= useState(null);

  // Категории
  const [катМод, setКМод] = useState(false);
  const [катФ,   setКФ]   = useState(null);
  const [новКат, setНК]   = useState(false);
  const [разгКат, setРазгКат] = useState(new Set()); // разгънати основни категории

  // Доставки
  const [доставки,   setДост]  = useState([]);
  const [доставчици, setДостч] = useState([]);
  const [достАктив,  setДА]    = useState(false);   // fullscreen режим активен
  const [достФ,      setДФ]    = useState(null);    // активна доставка
  const [достРедове, setДР]    = useState([]);      // редове
  const [достФилтър, setДФил]  = useState("всички");
  const [достКамМ,   setДКМ]   = useState(false);
  const [достРедТърс,setДРТ]   = useState("");
  const [достРедДД,  setДРДД]  = useState(false);
  const [достСпасяване, setДСп]= useState(false);  // loading при приемане
  const достСканRef             = useRef();         // ref към search input
  const [достТелМ,   setДТМ]   = useState(false);   // QR панел за телефон в доставки
  const [достПалМод, setДПМ]   = useState(false);   // прост модал за палетна доставка

  // Доставчици CRUD
  const [достчМод,  setДЧМ]  = useState(false);
  const [достчФ,    setДЧФ]  = useState(null);

  // Разходи
  const [разходи,   setРазх]  = useState([]);
  const [разхМод,   setРМод]  = useState(false);
  const [разхФ,     setРФ]    = useState(null);
  const [плОтчет,   setПЛ]    = useState([]);

  // История
  const [хТърс,  setХТ]   = useState("");
  const [хДата,  setХД]   = useState("all");
  const [хКат,   setХК]   = useState("Всички");

  const [отчМ,   setОМ]   = useState(()=>{
    const d=new Date(getNow().getFullYear(),getNow().getMonth(),1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });

  // ── Сесия ─────────────────────────────────────────────────────────────────
  useEffect(()=>{
    console.log("[Auth] useEffect стартира");
    console.log("[Auth] supabase обект:", supabase);
    console.log("[Auth] supabase.auth:", supabase?.auth);

    // Timeout fallback — ако getSession виси повече от 5 сек, разблокираме UI
    const timeout = setTimeout(() => {
      console.error("[Auth] TIMEOUT — getSession не отговори за 5 сек → показваме логин");
      setЗарСесия(false);
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeout);
        console.log("[Auth] getSession отговор →", { session, error });
        setSesiq(session);
        setЗарСесия(false);
      })
      .catch(err => {
        clearTimeout(timeout);
        console.error("[Auth] getSession хвърли грешка:", err);
        setЗарСесия(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Auth] onAuthStateChange →", event, session);
      setSesiq(session);
      setЗарСесия(false);
    });
    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  },[]);

  // ── Зареди данни от Supabase ──────────────────────────────────────────────
  useEffect(()=>{
    if(!сесия) return;
    async function зареди(показвайЗареждане=false){
      if(показвайЗареждане) setЗар(true);
      try {
        const шестМСтарт = new Date(); шестМСтарт.setMonth(шестМСтарт.getMonth()-6); шестМСтарт.setDate(1); шестМСтарт.setHours(0,0,0,0);
        const дванМСтарт = new Date(); дванМСтарт.setMonth(дванМСтарт.getMonth()-12); дванМСтарт.setDate(1);
        const триМСтарт  = new Date(); триМСтарт.setMonth(триМСтарт.getMonth()-3);   триМСтарт.setDate(1);

        // Всички заявки паралелно — вместо последователно (7x по-бързо)
        const [
          {data:стокиДата,  error:еС},
          {data:катДата,    error:еК},
          {data:движДата,   error:еД},
          {data:достчДата},
          {data:разхДата},
          {data:плДата},
          {data:достДата},
        ] = await Promise.all([
          supabase.from("стоки").select("*").order("ime"),
          supabase.from("категории").select("*").order("родител_id",{nullsFirst:true}).order("ime"),
          supabase.from("движения").select("*").gte("created_at",шестМСтарт.toISOString()).order("created_at",{ascending:false}),
          supabase.from("доставчици").select("*").eq("активен",true).order("ime"),
          supabase.from("разходи").select("*").gte("дата",дванМСтарт.toISOString().slice(0,10)).order("дата",{ascending:false}),
          supabase.from("пл_отчет").select("*"),
          supabase.from("доставки").select("*").gte("дата",триМСтарт.toISOString().slice(0,10)).order("created_at",{ascending:false}),
        ]);

        if(еС) throw еС;
        if(еК) throw еК;
        if(еД) throw еД;

        if(стокиДата) setSt(стокиДата.map(r=>({...r,цд:+r.цд,цп:+r.цп,нал:+r.нал,праг:+r.праг})));
        if(катДата)   setКат(катДата.map(r=>({id:r.id,ime:r.ime,цв:r.цв,ico:r.ico,родител_id:r.родител_id||null})));
        if(движДата?.length) setДв(движДата.map(r=>({
          id:r.id, тип:r.тип, sid:r.стока_id!=null?+r.стока_id:null,
          ime:r.стока_ime, кат:r.стока_кат, код:r.стока_код,
          кол:+r.кол, цп:+r.цп, цд:+r.цд, дата:r.created_at
        })));
        if(достчДата) setДостч(достчДата);
        if(разхДата)  setРазх(разхДата);
        if(плДата)    setПЛ(плДата);
        if(достДата)  setДост(достДата);
      } catch(грешка) {
        console.error("Supabase грешка:", грешка);
      } finally {
        if(показвайЗареждане) setЗар(false);
      }
    }
    зареди(true);
    const канал = supabase.channel("sync")
      .on("postgres_changes",{event:"*",schema:"public",table:"стоки"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"категории"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"движения"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"доставки"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"доставчици"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"доставки_редове"},()=>зареди())
      .subscribe();
    // Ръчен refresh достъпен чрез глобалната функция window.__prostor_refresh
    window.__prostor_refresh = ()=>зареди(true);
    return ()=>{ supabase.removeChannel(канал); delete window.__prostor_refresh; };
  },[сесия]);

  // ── Автоматичен ъпдейт ────────────────────────────────────────────────────
  useEffect(()=>{
    if(!window.electron) return;
    window.electron.onUpdateAvailable(()=>{ setFl("🔄 Нова версия се изтегля..."); });
    window.electron.onUpdateDownloaded(()=>{
      if(confirm("✅ Новата версия е готова!\n\nИнсталирай сега и рестартирай?")){
        window.electron.installUpdate();
      }
    });
  },[]);

  // ── Sync refs ─────────────────────────────────────────────────────────────
  const достАктивRef      = useRef(false);
  const handleScanДостRef = useRef(null);
  const tabRef            = useRef("sale");
  useEffect(()=>{ стокиRef.current       = стоки;    },[стоки]);
  useEffect(()=>{ катRef.current         = кат;      },[кат]);
  useEffect(()=>{ достАктивRef.current   = достАктив;},[достАктив]);
  useEffect(()=>{ tabRef.current         = tab;      },[tab]);

  // ── Electron баркод ───────────────────────────────────────────────────────
  useEffect(()=>{
    if(!window.electron) return;
    window.electron.getServerInfo().then(info=>{ if(info) setSI(info); }).catch(()=>{});
    window.electron.onBarcode(code=>{
      setПБ(code);
      setТМ(false);
      setДТМ(false);
      // Ако сме в режим Доставки — насочи сканирания код там
      if(достАктивRef.current){
        handleScanДостRef.current?.(code);
        return;
      }
      // Ако сме в таб Стоки — отвори модал за стоката без да отиваме в Продажба
      if(tabRef.current==="stock"){
        const същ=стокиRef.current.find(s=>s.код.toUpperCase()===code.toUpperCase());
        if(същ){ setФ({...същ}); setН(false); setСкК(null); setSM(true); }
        else { setФ({id:null,код:code,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2}); setН(true); setСкК(code); setSM(true); }
        return;
      }
      // Иначе — Продажба → всичко в кошницата, БЕЗ модал при съществуваща
      const намерена = стокиRef.current.find(s=>s.код.toUpperCase()===code.toUpperCase());
      if(намерена){
        setTab("sale");
        setКош(prev=>{
          const съществ=prev.find(р=>р.стока.id===намерена.id);
          if(съществ) return prev.map(р=>р.стока.id===намерена.id?{...р,кол:р.кол+1}:р);
          return [...prev,{стока:намерена,кол:1,ц:намерена.цп}];
        });
        setТ(""); setДД(false);
      } else {
        setФ({id:null,код:code,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2});
        setН(true); setСкК(code); setSM(true);
      }
    });
    // Телефонът се свърза → затвори QR модала
    window.electron.onPhoneConnected(()=>{
      setТМ(false);
      setДТМ(false);
    });
    return ()=>{
      if(window.electron?.offBarcode) window.electron.offBarcode();
      if(window.electron?.offPhoneConnected) window.electron.offPhoneConnected();
    };
  },[]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const катМап = useMemo(()=>Object.fromEntries(кат.map(к=>[к.ime,к])),[кат]);
  // Основни категории (без родител)
  const основниКат = useMemo(()=>кат.filter(к=>!к.родител_id),[кат]);
  // Подкатегории по родител_id
  const подкатПо = useMemo(()=>{
    const m={};
    кат.filter(к=>к.родител_id).forEach(к=>{
      if(!m[к.родител_id]) m[к.родител_id]=[];
      m[к.родител_id]=[...(m[к.родител_id]||[]),к];
    });
    return m;
  },[кат]);
  // Helper: подкатегории за дадена категория по id
  const подкатЗа = useCallback(id=>кат.filter(к=>к.родител_id===id),[кат]);
  const ватЦ   = ime => катМап[ime]?.цв||"#000000";
  const ватИ   = ime => катМап[ime]?.ico||"📦";
  const крит   = стоки.filter(s=>стат(s.нал,s.праг)!=="добр").length;

  const предл = useMemo(()=>{
    const т=търс.toLowerCase().trim();
    if(!т) return [];
    return стоки.filter(s=>s.ime.toLowerCase().includes(т)||s.код.toLowerCase().includes(т)).slice(0,8);
  },[стоки,търс]);

  const видими = useMemo(()=>{
    const т=сТърс.toLowerCase();
    return стоки.filter(s=>(!т||s.ime.toLowerCase().includes(т)||s.код.toLowerCase().includes(т))&&(фКат==="Всички"||s.кат===фКат));
  },[стоки,сТърс,фКат]);

  const всДвиж = движ; // директен alias — useMemo тук беше излишен

  const об6М = useMemo(()=>{
    const r={};
    const _н=getNow();for(let i=5;i>=0;i--){const d=new Date(_н.getFullYear(),_н.getMonth()-i,1);const к=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;r[к]={к,кратко:d.toLocaleString("bg",{month:"short"}),пр:0,сб:0};}
    всДвиж.forEach(д=>{const к=toEetМ(д.дата);if(r[к]&&д.тип==="изх"){r[к].пр+=д.кол*д.цп;r[к].сб+=д.кол*д.цд;}});
    return Object.values(r);
  },[всДвиж]);

  const оПр=об6М.reduce((a,м)=>a+м.пр,0);
  const оСб=об6М.reduce((a,м)=>a+м.сб,0);
  const mxПр=Math.max(...об6М.map(м=>м.пр),1);

  const продМ = useMemo(()=>{
    const агр={};
    всДвиж.filter(д=>{const к=toEetМ(д.дата);return д.тип==="изх"&&к===отчМ;}).forEach(д=>{
      const ключ=д.sid!=null?`id_${д.sid}`:`код_${д.код}`;
      if(!агр[ключ]) агр[ключ]={код:д.код,ime:д.ime,кат:д.кат,кол:0,пр:0,сб:0};
      агр[ключ].кол+=д.кол; агр[ключ].пр+=д.кол*д.цп; агр[ключ].сб+=д.кол*д.цд;
    });
    return Object.values(агр).sort((a,b)=>b.пр-a.пр);
  },[всДвиж,отчМ]);

  const мПр=продМ.reduce((a,р)=>a+р.пр,0);
  const мСб=продМ.reduce((a,р)=>a+р.сб,0);
  const мПч=мПр-мСб;

  const историяФ = useMemo(()=>{
    const днес = eetДата();
    const преди7 = eetДата(new Date(Date.now()-7*24*60*60*1000));
    const преди30 = eetДата(new Date(Date.now()-30*24*60*60*1000));
    const т = хТърс.toLowerCase().trim();
    return всДвиж.filter(д=>{
      if(д.тип!=="изх") return false; // само продажби в история
      const дата = toEetДата(д.дата);
      if(!дата||дата==="Invalid Date") return false; // защита от невалидна дата
      const датаОК = хДата==="all" || (хДата==="today"&&дата===днес) || (хДата==="week"&&дата>=преди7) || (хДата==="month"&&дата>=преди30);
      const търсОК = !т || (д.ime||"").toLowerCase().includes(т) || (д.код||"").toLowerCase().includes(т);
      const катОК  = хКат==="Всички" || д.кат===хКат;
      return датаОК && търсОК && катОК;
    });
  },[всДвиж,хТърс,хДата,хКат]);

  const хПр = историяФ.reduce((a,д)=>a+д.кол*д.цп,0);
  const хПч = историяФ.reduce((a,д)=>a+д.кол*(д.цп-д.цд),0);

  const достМ=useMemo(()=>{const r={};const _н=getNow();for(let i=5;i>=0;i--){const d=new Date(_н.getFullYear(),_н.getMonth()-i,1);const к=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;r[к]=d.toLocaleString("bg",{month:"long",year:"numeric"});}return r;},[]);

  // ── Продажба ──────────────────────────────────────────────────────────────
  const изберСт = useCallback(s=>{setИС(s);setЦ(String(s.цп));setКол("1");setТ("");setДД(false);setTimeout(()=>колRef.current?.select(),50);},[]);
  const продай = useCallback(async()=>{
    if(!избСт||+кол<=0) return;
    const цена=+ц||избСт.цп, количество=+кол;
    if(количество > избСт.нал){
      setFl(`⚠️ Недостатъчна наличност! Налични: ${избСт.нал} ${избСт.мерна}`);
      setTimeout(()=>setFl(null),3000);
      return;
    }
    setSt(prev=>prev.map(s=>s.id===избСт.id?{...s,нал:Math.max(0,s.нал-количество)}:s));
    стокиRef.current = стокиRef.current.map(s=>s.id===избСт.id?{...s,нал:Math.max(0,s.нал-количество)}:s);
    const движение = {id:Date.now(),тип:"изх",sid:+избСт.id,ime:избСт.ime,кат:избСт.кат,код:избСт.код,кол:количество,цп:цена,цд:избСт.цд,дата:eetИСО()};
    setДв(prev=>[движение,...prev]);
    const [двRes, стRes] = await Promise.all([
      supabase.from("движения").insert({тип:"изх",стока_id:+избСт.id,стока_код:избСт.код,стока_ime:избСт.ime,стока_кат:избСт.кат,кол:количество,цп:цена,цд:избСт.цд}).select().single(),
      supabase.rpc("намали_наличност", {стока_id_п:+избСт.id, количество_п:количество})
    ]);
    if(двRes.error) console.error("Грешка движение:", двRes.error);
    if(стRes.error) console.error("Грешка наличност:", стRes.error);
    // Замени оптимистичния запис с реалния от Supabase (с коректен created_at)
    if(двRes.data){
      const реален = двRes.data;
      setДв(prev=>prev.map(д=>д.id===движение.id?{
        id:реален.id, тип:"изх", sid:+избСт.id,
        ime:реален.стока_ime, кат:реален.стока_кат, код:реален.стока_код,
        кол:+реален.кол, цп:+реален.цп, цд:+реален.цд, дата:реален.created_at
      }:д));
    }
    setFl(`✓ ${избСт.ime} ×${кол} · ${f2(количество*цена)} €`);
    setИС(null); setКол("1"); setЦ(""); setBел("");
    setTimeout(()=>setFl(null),2800);
  },[избСт,кол,ц,бел]);

  // ── Кошница — добави артикул ──────────────────────────────────────────────
  const добавиВКошница = useCallback(s=>{
    setКош(prev=>{
      const съществ = prev.find(р=>р.стока.id===s.id);
      if(съществ) return prev.map(р=>р.стока.id===s.id?{...р,кол:р.кол+1}:р);
      return [...prev,{стока:s,кол:1,ц:s.цп}];
    });
    setТ(""); setДД(false); setИС(null);
  },[]);

  const промениКошКол = (id,кол) => setКош(prev=>prev.map(р=>р.стока.id===id?{...р,кол:Math.max(1,Math.round(+кол||1))}:р));
  const премахниОтКош = (id)    => setКош(prev=>prev.filter(р=>р.стока.id!==id));
  const изчистиКошница = ()     => { setКош([]); setОЦ(""); };

  // Разпредели общата цена пропорционално по стандартни цени
  const разпределиОбщаЦена = useCallback((обща) => {
    if(!+обща || !кошница.length) return;
    const общоСтандарт = кошница.reduce((a,р)=>a+р.кол*р.стока.цп,0);
    if(!общоСтандарт) return;
    setКош(prev=>prev.map(р=>({
      ...р,
      ц: +(+обща * (р.кол*р.стока.цп/общоСтандарт) / р.кол).toFixed(2)
    })));
  },[кошница]);

  // Продай цялата кошница
  const продайКошница = useCallback(async()=>{
    if(!кошница.length) return;
    const общо = +общаЦена || кошница.reduce((a,р)=>a+р.кол*р.ц,0);

    // Оптимистичен UI update
    setSt(prev=>prev.map(s=>{
      const р=кошница.find(р=>р.стока.id===s.id);
      return р?{...s,нал:Math.max(0,s.нал-р.кол)}:s;
    }));
    стокиRef.current=стокиRef.current.map(s=>{
      const р=кошница.find(р=>р.стока.id===s.id);
      return р?{...s,нал:Math.max(0,s.нал-р.кол)}:s;
    });

    // Запис в Supabase — паралелно за всички артикули
    const резултати = await Promise.all(кошница.map(р=>
      Promise.all([
        supabase.from("движения").insert({
          тип:"изх", стока_id:+р.стока.id, стока_код:р.стока.код,
          стока_ime:р.стока.ime, стока_кат:р.стока.кат,
          кол:р.кол, цп:р.ц, цд:р.стока.цд
        }),
        supabase.rpc("намали_наличност",{стока_id_п:+р.стока.id,количество_п:р.кол})
      ])
    ));
    резултати.forEach(([дв],i)=>{ if(дв.error) console.error("Грешка:",дв.error); });

    setFl(`✓ Групова продажба · ${кошница.length} арт. · ${f2(общо)} €`);
    изчистиКошница();
    setTimeout(()=>setFl(null),3000);
  },[кошница,общаЦена]);

  // ── Камера ────────────────────────────────────────────────────────────────
  const handleScan=useCallback(код=>{
    setКМ(false);
    const същ=стокиRef.current.find(s=>s.код.toUpperCase()===код.toUpperCase());
    if(същ){
      // Стоката съществува — отвори я за редакция директно
      setФ({...същ}); setН(false); setСкК(null); setSM(true);
    } else {
      // Нова стока — отвори формата за добавяне
      setФ({id:null,код,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2});
      setН(true); setСкК(код); setSM(true);
    }
  },[]);

  const handleScanSale=useCallback(код=>{
    setКМ(false);
    const н=стокиRef.current.find(s=>s.код.toUpperCase()===код.toUpperCase());
    if(н){
      // Съществуваща → добави в кошницата, БЕЗ модал
      добавиВКошница(н);
    } else {
      // Непозната → отвори форма за нова стока
      setФ({id:null,код,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2});
      setН(true); setСкК(код); setSM(true);
    }
  },[добавиВКошница]);

  // ── Стоки CRUD ────────────────────────────────────────────────────────────
  const отвНова = ()=>{setФ({id:null,код:"",ime:"",кат:кат[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:0,праг:2,палет:false});setН(true);setСкК(null);setSM(true);};
  const запази = async u=>{
    if(нова){
      if(u.код){
        const {data:съществ} = await supabase.from("стоки").select("id").eq("код",u.код).maybeSingle();
        if(съществ){
          const {error} = await supabase.from("стоки").update({ime:u.ime,кат:u.кат,мерна:u.мерна,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг}).eq("id",съществ.id);
          if(error){ alert("Грешка: "+error.message); return; }
          setSt(prev=>prev.map(s=>s.id===съществ.id?{...u,id:съществ.id,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг}:s));
          setSM(false); setСкК(null); return;
        }
      }
      const {data,error} = await supabase.from("стоки").insert({код:u.код||"",ime:u.ime||"",кат:u.кат||"",мерна:u.мерна||"бр",цд:+u.цд||0,цп:+u.цп||0,нал:+u.нал||0,праг:+u.праг||2,палет:!!u.палет}).select().single();
      if(error){ alert("Грешка: "+error.message); return; }
      setSM(false); setСкК(null);
      if(data) setSt(prev=>[...prev,{...data,цд:+data.цд,цп:+data.цп,нал:+data.нал,праг:+data.праг}]);
      if(скКод && data){
        // скКод е зададен само при сканиране — не при ръчно "+ Нова стока"
        const нов={...data,цд:+data.цд,цп:+data.цп,нал:+data.нал,праг:+data.праг};
        if(достАктивRef.current){
          // Сканирано от доставки — добави артикула там
          добавиРед(нов);
        } else {
          // Сканирано от Продажба или Стоки — избери за продажба
          setTab("sale"); setИС(нов); setЦ(String(нов.цп)); setКол("1"); setДД(false); setТ("");
          setTimeout(()=>колRef.current?.select(),100);
        }
      }
    } else {
      const стараСт = стоки.find(s=>s.id===u.id);
      const {error} = await supabase.from("стоки").update({код:u.код,ime:u.ime,кат:u.кат,мерна:u.мерна,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг,палет:!!u.палет}).eq("id",u.id);
      if(error){ alert("Грешка: "+error.message); return; }
      const разлика = +u.нал - (стараСт?.нал||0);
      if(разлика !== 0){
        await supabase.from("движения").insert({тип:"корекция",стока_id:+u.id,стока_код:u.код,стока_ime:u.ime,стока_кат:u.кат,кол:Math.abs(разлика),цп:+u.цп,цд:+u.цд});
        setДв(prev=>[{id:Date.now(),тип:"корекция",sid:+u.id,ime:u.ime,кат:u.кат,код:u.код,кол:Math.abs(разлика),цп:+u.цп,цд:+u.цд,дата:eetИСО()},...prev]);
      }
      setSM(false); setСкК(null);
      setSt(prev=>prev.map(s=>s.id===u.id?{...u,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг}:s));
    }
  };
  const изтрий = async id=>{
    const {error} = await supabase.from("стоки").delete().eq("id",id);
    if(error){ alert("Грешка при изтриване: "+error.message); return; }
    setSM(false); setSt(prev=>prev.filter(s=>s.id!==id));
  };

  // ── Категории CRUD ────────────────────────────────────────────────────────
  const отвКатНова = ()=>{setКФ({id:null,ime:"",цв:ЦВЕТОВЕ[0],ico:ИКОНИ[0]});setНК(true);setКМод(true);};
  const отвКатРед  = к=>{setКФ({...к});setНК(false);setКМод(true);};
  const запазиКат  = async()=>{
    if(!катФ?.ime?.trim()) return;
    if(новКат){
      const {data,error} = await supabase.from("категории").insert({ime:катФ.ime,цв:катФ.цв,ico:катФ.ico,родител_id:катФ.родител_id||null}).select().single();
      if(error){ alert("Грешка: "+error.message); return; }
      if(data) setКат(prev=>[...prev,{...data,родител_id:data.родител_id||null}]);
    } else {
      const {error} = await supabase.from("категории").update({ime:катФ.ime,цв:катФ.цв,ico:катФ.ico,родител_id:катФ.родител_id||null}).eq("id",катФ.id);
      if(error){ alert("Грешка: "+error.message); return; }
      setКат(prev=>prev.map(к=>к.id===катФ.id?{...катФ}:к));
    }
    setКМод(false);
  };
  const изтрийКат = async id=>{
    const кат_обект = катФ;
    const подкат = кат.filter(п=>п.родител_id===id);
    const бр = стоки.filter(s=>s.кат===кат_обект?.ime).length
             + подкат.reduce((a,п)=>a+стоки.filter(s=>s.кат===п.ime).length,0);
    let съобщение = `Изтрий категория "${кат_обект?.ime}"?`;
    if(подкат.length>0) съобщение += `\n\n⚠️ ${подкат.length} подкатегории ще бъдат изтрити!`;
    if(бр>0) съобщение += `\n⚠️ ${бр} стоки ще останат без категория!`;
    if(!confirm(съобщение)) return;
    // Изтрий подкатегориите първо
    for(const п of подкат){
      await supabase.from("категории").delete().eq("id",п.id);
    }
    const {error} = await supabase.from("категории").delete().eq("id",id);
    if(error){ alert("Грешка: "+error.message); return; }
    setКат(prev=>prev.filter(к=>к.id!==id&&к.родител_id!==id));
    setКМод(false);
  };

  // ── Доставки логика ──────────────────────────────────────────────────────

  // Отвори нова палетна доставка — прост модал само със сума
  const отвНоваДост = ()=>{
    setДФ({
      id:null,
      доставчик_id: доставчици[0]?.id||null,
      доставчик_ime: доставчици[0]?.ime||"",
      дата: eetДата(),
      бележка: "",
      статус: "приета",  // палетите се приемат веднага
      сума: "",
    });
    setДПМ(true);
  };

  // Запази палетна доставка директно
  const запазиПалет = async()=>{
    if(!достФ?.сума||+достФ.сума<=0){ alert("Въведи сумата на палета."); return; }
    const {data,error} = await supabase.from("доставки").insert({
      доставчик_id: достФ.доставчик_id,
      доставчик_ime: достФ.доставчик_ime,
      дата: достФ.дата,
      бележка: достФ.бележка||"",
      статус: "приета",
      сума: +достФ.сума,
      total_стойност: +достФ.сума,
    }).select().single();
    if(error){ alert("Грешка: "+error.message); return; }
    if(data) setДост(prev=>[data,...prev]);
    setДПМ(false);
    setFl(`✅ Палет записан · ${f2(+достФ.сума)} €`);
    setTimeout(()=>setFl(null),3000);
    window.__prostor_refresh?.();
  };

  // Отвори съществуваща доставка
  const отвДост = async д=>{
    setДФ(д);
    const {data} = await supabase.from("доставки_редове").select("*").eq("доставка_id",д.id).order("id");
    setДР(data||[]);
    setДА(true);
    if(д.статус==="чакаща") setTimeout(()=>достСканRef.current?.focus(), 80);
  };

  // Затвори fullscreen — само ако доставката е чернова без редове я изтрива
  const затвориДост = async()=>{
    if(достФ?.id && достРедове.length===0 && достФ.статус==="чакаща"){
      await supabase.from("доставки").delete().eq("id",достФ.id);
      setДост(prev=>prev.filter(д=>д.id!==достФ.id));
    }
    setДА(false); setДФ(null); setДР([]); setДРТ(""); setДРДД(false);
  };

  // Осигури съществуваща доставка в Supabase (lazy create)
  const осигуриДост = async()=>{
    if(достФ?.id) return достФ.id;
    const {data,error} = await supabase.from("доставки").insert({
      доставчик_id:достФ.доставчик_id,
      доставчик_ime:достФ.доставчик_ime,
      дата:достФ.дата,
      бележка:достФ.бележка||"",
      статус:"чакаща"
    }).select().single();
    if(error){ alert("Грешка: "+error.message); return null; }
    setДФ(prev=>({...prev,id:data.id}));
    setДост(prev=>[data,...prev]);
    return data.id;
  };

  // Добави артикул — lazy create доставката при първия артикул
  const добавиРед = async стока=>{
    const достId = await осигуриДост();
    if(!достId) return;
    const съществ = достРедове.find(р=>р.стока_id===стока.id);
    if(съществ){
      // Дублиран — увеличи количеството оптимистично
      const новКол = +съществ.кол + 1;
      setДР(prev=>prev.map(р=>р.id===съществ.id?{...р,кол:новКол}:р));
      supabase.from("доставки_редове").update({кол:новКол}).eq("id",съществ.id);
      setFl(`+1 · ${стока.ime} → ${новКол}`);
    } else {
      // Нов ред — оптимистично добавяне
      const tempId = `tmp_${Date.now()}`;
      const новРед = {id:tempId,доставка_id:достId,стока_id:стока.id,стока_код:стока.код,стока_ime:стока.ime,стока_кат:стока.кат,стока_мерна:стока.мерна,кол:1,цд:стока.цд};
      setДР(prev=>[...prev,новРед]);
      const {data,error} = await supabase.from("доставки_редове").insert({
        доставка_id:достId,стока_id:стока.id,стока_код:стока.код,
        стока_ime:стока.ime,стока_кат:стока.кат,стока_мерна:стока.мерна,
        кол:1,цд:стока.цд
      }).select().single();
      if(error){ setДР(prev=>prev.filter(р=>р.id!==tempId)); alert("Грешка: "+error.message); return; }
      setДР(prev=>prev.map(р=>р.id===tempId?data:р));
      setFl(`✓ ${стока.ime}`);
    }
    setTimeout(()=>setFl(null),1800);
    setДРТ(""); setДРДД(false);
    setTimeout(()=>достСканRef.current?.focus(), 50);
  };

  // Inline редактиране — оптимистично
  const промениРед = (id,поле,стойност)=>{
    setДР(prev=>prev.map(р=>р.id===id?{...р,[поле]:+стойност}:р));
  };
  const запазиРед = async(id,поле,стойност)=>{
    await supabase.from("доставки_редове").update({[поле]:+стойност}).eq("id",id);
  };

  const изтрийРед = async id=>{
    setДР(prev=>prev.filter(р=>р.id!==id));
    await supabase.from("доставки_редове").delete().eq("id",id);
  };

  // Обнови заглавните данни при промяна (доставчик/дата/бележка)
  const обновиДостЗаглавие = async(поле,стойност)=>{
    setДФ(prev=>({...prev,[поле]:стойност}));
    if(достФ?.id){
      await supabase.from("доставки").update({[поле]:стойност}).eq("id",достФ.id);
    }
  };

  // Приеми палета — извиква приеми_палет с обща цена
  const приемиДост = async()=>{
    if(!достФ?.id||!достРедове.length||достСпасяване) return;
    const общаЦена = +достФ.обща_цена;
    if(!общаЦена || общаЦена <= 0){
      alert("Въведи общата цена на палета преди да го приемеш.");
      return;
    }
    setДСп(true);
    const {error} = await supabase.rpc("приеми_палет",{доставка_id_п:достФ.id, обща_цена_п:общаЦена});
    setДСп(false);
    if(error){ alert("Грешка при приемане: "+error.message); return; }
    setДА(false);
    setДост(prev=>prev.map(д=>д.id===достФ.id?{...д,статус:"приета",приета_на:new Date().toISOString(),total_редове:достРедове.length,total_кол:достРедове.reduce((a,р)=>a+р.кол,0),total_стойност:общаЦена,обща_цена:общаЦена}:д));
    setFl(`✅ Приет палет · ${достРедове.length} арт. · ${f2(общаЦена)} €`);
    setTimeout(()=>setFl(null),4000);
    window.__prostor_refresh?.();
  };

  const откажиДост = async()=>{
    if(!достФ?.id) return;
    const {error} = await supabase.rpc("откажи_доставка",{доставка_id_п:достФ.id});
    if(error){ alert("Грешка: "+error.message); return; }
    setДА(false);
    setДост(prev=>prev.map(д=>д.id===достФ.id?{...д,статус:"отказана"}:д));
  };

  const handleScanДост = useCallback(код=>{
    setДКМ(false);
    const намерена = стокиRef.current.find(s=>s.код.toUpperCase()===код.toUpperCase());
    if(намерена){ добавиРед(намерена); }
    else {
      // Нова стока — отвори регистрационния модал
      setФ({id:null,код,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:0,праг:2});
      setН(true); setСкК(код); setSM(true);
    }
  },[стоки,достФ,достРедове]);
  // Ref — за Electron onBarcode closure (не може да ползва state директно)
  useEffect(()=>{ handleScanДостRef.current = handleScanДост; },[handleScanДост]);

  const видимиДост = useMemo(()=>
    доставки.filter(д=>достФилтър==="всички"||д.статус===достФилтър)
  ,[доставки,достФилтър]);

  const предлДост = useMemo(()=>{
    const т=достРедТърс.toLowerCase().trim();
    if(!т) return [];
    return стоки.filter(s=>s.ime.toLowerCase().includes(т)||s.код.toLowerCase().includes(т)).slice(0,7);
  },[стоки,достРедТърс]);

  // ── Доставчици логика ───────────────────────────────────────────────────────
  const запазиДостч = async()=>{
    if(!достчФ?.ime?.trim()) return;
    if(достчФ.id){
      const {error} = await supabase.from("доставчици").update({ime:достчФ.ime.trim(),телефон:достчФ.телефон||"",бележка:достчФ.бележка||""}).eq("id",достчФ.id);
      if(error){ alert("Грешка: "+error.message); return; }
      setДостч(prev=>prev.map(д=>д.id===достчФ.id?{...д,...достчФ}:д));
    } else {
      const {data,error} = await supabase.from("доставчици").insert({ime:достчФ.ime.trim(),телефон:достчФ.телефон||"",бележка:достчФ.бележка||"",активен:true}).select().single();
      if(error){ alert("Грешка: "+error.message); return; }
      if(data) setДостч(prev=>[...prev,data]);
    }
    setДЧМ(false);
  };

  const изтрийДостч = async id=>{
    const {error} = await supabase.from("доставчици").update({активен:false}).eq("id",id);
    if(error){ alert("Грешка: "+error.message); return; }
    setДостч(prev=>prev.filter(д=>д.id!==id));
    setДЧМ(false);
  };

  // ── Разходи логика ────────────────────────────────────────────────────────
  const КАТ_РАЗХ = ["Наем","Заплати","Ток","Друго"];

  const запазиРазх = async()=>{
    if(!разхФ?.сума||+разхФ.сума<=0) return;
    if(разхФ.id){
      const {error} = await supabase.from("разходи").update({дата:разхФ.дата,категория:разхФ.категория,сума:+разхФ.сума,бележка:разхФ.бележка||""}).eq("id",разхФ.id);
      if(error){ alert("Грешка: "+error.message); return; }
      setРазх(prev=>prev.map(р=>р.id===разхФ.id?{...разхФ,сума:+разхФ.сума}:р));
    } else {
      const {data,error} = await supabase.from("разходи").insert({дата:разхФ.дата,категория:разхФ.категория,сума:+разхФ.сума,бележка:разхФ.бележка||""}).select().single();
      if(error){ alert("Грешка: "+error.message); return; }
      if(data) setРазх(prev=>[data,...prev]);
    }
    setРМод(false);
    window.__prostor_refresh?.();
  };

  const изтрийРазх = async id=>{
    const {error} = await supabase.from("разходи").delete().eq("id",id);
    if(error){ alert("Грешка: "+error.message); return; }
    setРазх(prev=>prev.filter(р=>р.id!==id));
    setРМод(false);
  };

  const exportМ=()=>{
    const h=[["Код","Наименование","Категория","Кол.","Ед.цена","Приход","Себест.","Печалба","Марж%"]];
    const р=продМ.map(р=>{const пч=р.пр-р.сб;const мр=р.пр>0?Math.round(пч/р.пр*100):0;return[р.код,р.ime,р.кат,р.кол,f2(р.пр/(р.кол||1)),f2(р.пр),f2(р.сб),f2(пч),`${мр}%`];});
    csvExp([...h,...р,[],["ОБЩО","","",продМ.reduce((a,р)=>a+р.кол,0),"",f2(мПр),f2(мСб),f2(мПч),`${мПр>0?Math.round(мПч/мПр*100):0}%`]],`отчет_${отчМ}.csv`);
  };

  const чакащиДост = доставки.filter(д=>д.статус==="чакаща").length;

  const NAV=[
    {id:"sale",      ico:"⚡",  lab:"Продажба"},
    {id:"stock",     ico:"📦",  lab:"Стоки",     badge:крит},
    {id:"cats",      ico:"🏷",  lab:"Категории"},
    {id:"delivery",  ico:"📥",  lab:"Доставки",  badge:чакащиДост},
    {id:"expenses",  ico:"💸",  lab:"Разходи"},
    {id:"history",   ico:"📋",  lab:"История"},
    {id:"reports",   ico:"📊",  lab:"Отчети"},
  ];

  // ── Изчакай сесията да се зареди ─────────────────────────────────────────
  if(зареждаСесия) return (
    <div style={{position:"fixed",inset:0,background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:48}}>🏪</div>
      <div style={{width:36,height:36,border:"3px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Логин екран ───────────────────────────────────────────────────────────
  if(!сесия) return <LoginForm />;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return(
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;600&display=swap" rel="stylesheet"/>

      {зарежда&&<div style={{position:"fixed",inset:0,background:"rgba(15,17,23,.95)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        <div style={{width:36,height:36,border:"3px solid #e8e8e8",borderTopColor:"#111111",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
        <div style={{fontSize:14,color:"#555555",fontWeight:500}}>Зареждане от Supabase…</div>
      </div>}
      {flash&&<div className="toast">{flash}</div>}
      {камМ&&<CamModal onScan={камРеж==="продажба"?handleScanSale:handleScan} onClose={()=>setКМ(false)}/>}
      {телМ&&сървИнфо&&<QRPanel url={сървИнфо.url} onClose={()=>setТМ(false)}/>}

      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        <aside style={{width:192,flexShrink:0,background:"#ffffff",borderRight:"1px solid #e8e8e8",display:"flex",flexDirection:"column",padding:"14px 10px"}}>
          <div style={{padding:"0 8px 12px",borderBottom:"1px solid #e8e8e8",marginBottom:10}}>
            <div style={{fontSize:15,fontWeight:800,letterSpacing:"-.03em",color:"#000000",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16,opacity:1}}>🏪</span><span>ПроСтор</span></div>
            <div style={{fontSize:11,color:"#cccccc",marginTop:2}}>Складова система</div>
          </div>

          <nav style={{display:"flex",flexDirection:"column",gap:1,flex:1}}>
            {NAV.map(н=>(
              <button key={н.id} className={`nav-item${tab===н.id?" active":""}`} onClick={()=>setTab(н.id)}>
                <span>{н.ico}</span>
                <span style={{flex:1}}>{н.lab}</span>
                {н.badge>0&&<span style={{background:"rgba(220,38,38,.15)",color:"#C72B32",fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:10,minWidth:18,textAlign:"center"}}>{н.badge}</span>}
              </button>
            ))}
          </nav>

          <div style={{borderTop:"1px solid #e8e8e8",paddingTop:10,marginTop:6}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#999999",padding:"0 10px",marginBottom:4}}>Категории</div>
            <div style={{maxHeight:220,overflowY:"auto"}}>
              <button className={`nav-item${фКат==="Всички"?" active":""}`} onClick={()=>{setФК("Всички");setTab("stock");}}>
                <span style={{fontSize:12,opacity:.7}}>⊞</span>Всички
                <span style={{marginLeft:"auto",fontSize:11,fontFamily:"monospace",color:"#999999"}}>{стоки.length}</span>
              </button>
              {основниКат.map(к=>{
                const подкат=кат.filter(п=>п.родител_id===к.id);
                const брВсич=стоки.filter(s=>s.кат===к.ime).length+подкат.reduce((a,п)=>a+стоки.filter(s=>s.кат===п.ime).length,0);
                return(
                  <div key={к.id}>
                    <button className={`nav-item${фКат===к.ime?" active":""}`} onClick={()=>{setФК(к.ime);setTab("stock");}}>
                      <span>{к.ico}</span>
                      <span style={{flex:1,textAlign:"left"}}>{к.ime}</span>
                      <span style={{fontSize:11,color:"#cccccc",fontFamily:"monospace"}}>{брВсич}</span>
                    </button>
                    {подкат.map(п=>{const брП=стоки.filter(s=>s.кат===п.ime).length;return(
                      <button key={п.id} className={`nav-item${фКат===п.ime?" active":""}`} onClick={()=>{setФК(п.ime);setTab("stock");}} style={{paddingLeft:22}}>
                        <span style={{fontSize:9,color:"#cccccc",flexShrink:0}}>└</span>
                        <span style={{fontSize:11}}>{п.ico}</span>
                        <span style={{flex:1,textAlign:"left",fontSize:12}}>{п.ime}</span>
                        <span style={{fontSize:11,color:"#cccccc",fontFamily:"monospace"}}>{брП}</span>
                      </button>
                    );})}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{borderTop:"1px solid #e8e8e8",marginTop:"auto",fontSize:11,color:"#555555",display:"flex",alignItems:"center",gap:5,padding:"8px 10px 0"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#000000"}}/>
            {стоки.length} арт · {кат.length} кат.
          </div>

          {/* Изход */}
          <button
            onClick={()=>supabase.auth.signOut()}
            style={{width:"100%",height:30,padding:"0 8px",background:"#f0f0f0",color:"#555555",border:"1px solid #e8e8e8",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5,lineHeight:1}}>
            🚪 Изход
          </button>
        </aside>

        <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",background:"#f7f7f7"}}>
          <div style={{background:"#ffffff",borderBottom:"1px solid #e8e8e8",padding:"0 20px",display:"flex",alignItems:"center",gap:8,flexShrink:0,height:48}}>
            <div style={{fontSize:14,fontWeight:700,color:"#000000",marginRight:6,display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14,opacity:.7}}>{NAV.find(н=>н.id===tab)?.ico}</span><span>{NAV.find(н=>н.id===tab)?.lab}</span></div>
            {tab==="sale"&&(
              <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}}>
                <div style={{fontFamily:"monospace",fontSize:12,color:"#999999"}}>
                  {new Date().toLocaleDateString("bg",{timeZone:EET,weekday:"short",day:"numeric",month:"long",year:"numeric"})}
                </div>
                <button className="btn btn-gray btn-sm" onClick={()=>window.__prostor_refresh?.()} title="Опресни данните">↺ Опресни</button>
              </div>
            )}
            {tab==="stock"&&(
              <>
                <div style={{position:"relative",flex:1,maxWidth:320}}>
                  <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#999999",fontSize:13}}>⌕</span>
                  <input className="inp inp-sm" placeholder="Търси стока или код…" value={сТърс} onChange={e=>setСТ(e.target.value)} style={{paddingLeft:30}}/>
                </div>
                <select className="inp inp-sm" value={фКат} onChange={e=>setФК(e.target.value)} style={{width:160}}>
                  <option>Всички</option>
                  {кат.map(к=><option key={к.id}>{к.ime}</option>)}
                </select>
                {(фКат!=="Всички"||сТърс)&&<button className="btn btn-gray btn-sm" onClick={()=>{setФК("Всички");setСТ("");}}>✕</button>}
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button className="btn btn-gray btn-sm" onClick={()=>{setКР("стоки");setКМ(true);}}>📷 Камера</button>
                  {сървИнфо&&<button className="btn btn-gray btn-sm" onClick={()=>setТМ(true)} style={{position:"relative"}}>📱 Телефон{последенБар&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#000000"}}/>}</button>}
                  <button className="btn btn-blue btn-sm" onClick={отвНова}>+ Нова стока</button>
                </div>
              </>
            )}
            {tab==="cats"&&(<div style={{marginLeft:"auto"}}><button className="btn btn-blue btn-sm" onClick={отвКатНова}>+ Нова категория</button></div>)}
            {tab==="delivery"&&(
              <>
                <div style={{display:"flex",gap:4}}>
                  {[["всички","Всички"],["чакаща","Чакащи"],["приета","Приети"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setДФил(v)}
                      className="btn-toggle" style={{border:`1px solid ${достФилтър===v?"#111111":"#e4e4e4"}`,background:достФилтър===v?"#000000":"#ffffff",color:достФилтър===v?"#ffffff":"#555555"}}>
                      {l}
                    </button>
                  ))}
                </div>
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button className="btn btn-gray btn-sm" onClick={()=>{setДЧФ(null);setДЧМ(true);}}>👥 Доставчици</button>
                  <button className="btn btn-blue btn-sm" onClick={отвНоваДост}>+ Нова доставка</button>
                </div>
              </>
            )}
            {tab==="expenses"&&(
              <div style={{marginLeft:"auto"}}>
                <button className="btn btn-blue btn-sm" onClick={()=>{setРФ({id:null,дата:eetДата(),категория:"Наем",сума:"",бележка:""});setРМод(true);}}>+ Нов разход</button>
              </div>
            )}
            {tab==="history"&&(
              <>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#999999",fontSize:13}}>⌕</span>
                  <input className="inp inp-sm" placeholder="Търси стока…" value={хТърс} onChange={e=>setХТ(e.target.value)} style={{paddingLeft:26,width:200}}/>
                </div>
                <select className="inp inp-sm" value={хКат} onChange={e=>setХК(e.target.value)} style={{width:150}}>
                  <option>Всички</option>
                  {кат.map(к=><option key={к.id}>{к.ime}</option>)}
                </select>
                <div style={{display:"flex",gap:4}}>
                  {[["all","Всички"],["today","Днес"],["week","7 дни"],["month","30 дни"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setХД(v)}
                      className="btn-toggle" style={{border:`1px solid ${хДата===v?"#111111":"#e4e4e4"}`,background:хДата===v?"#000000":"#ffffff",color:хДата===v?"#ffffff":"#555555"}}>
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}
            {tab==="reports"&&(
              <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
                <select className="inp inp-sm" value={отчМ} onChange={e=>setОМ(e.target.value)} style={{width:180}}>
                  {Object.entries(достМ).map(([к,л])=><option key={к} value={к}>{л}</option>)}
                </select>
                <button className="btn btn-green btn-sm" onClick={exportМ} disabled={!продМ.length} style={{opacity:продМ.length?1:.4}}>↓ CSV</button>
              </div>
            )}
          </div>

          <div style={{flex:1,overflow:"auto",padding:16}}>

            {tab==="sale"&&(
              <div className="fade-in" style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:12,height:"100%",alignItems:"start"}}>

                {/* ══ ЛЯВА: Търсачка + Кошница ══ */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>

                  {/* Търсачка + скенери */}
                  <div style={{display:"flex",gap:8}}>
                    <div style={{position:"relative",flex:1}}>
                      <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#999",pointerEvents:"none"}}>⌕</span>
                      <input className="inp"
                        placeholder="Търси артикул или сканирай баркод…"
                        value={търс}
                        onChange={e=>{setТ(e.target.value);setДД(true);}}
                        onFocus={()=>setДД(true)}
                        onKeyDown={e=>{
                          if(e.key==="Escape"){setТ("");setДД(false);}
                          if(e.key==="Enter"&&предл.length>=1) добавиВКошница(предл[0]);
                        }}
                        style={{height:40,paddingLeft:36,paddingRight:32,fontSize:14,width:"100%"}}/>
                      {търс&&<button onClick={()=>{setТ("");setДД(false);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#999",cursor:"pointer",fontSize:15,padding:2}}>✕</button>}
                      {показДД&&предл.length>0&&(
                        <div className="dd">
                          {предл.map(s=>{
                            const цв=ватЦ(s.кат);const сt=стат(s.нал,s.праг);
                            const вКош=кошница.find(р=>р.стока.id===s.id);
                            return(
                              <div key={s.id} className="dd-row" onClick={()=>добавиВКошница(s)}>
                                <div style={{width:32,height:32,borderRadius:7,background:цв+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{ватИ(s.кат)}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.ime}</div>
                                  <div style={{fontSize:11,color:"#999"}}>{s.код} · <span style={{color:сЦ(сt)}}>{s.нал} {s.мерна}</span></div>
                                </div>
                                <div style={{textAlign:"right",flexShrink:0}}>
                                  <div className="M" style={{fontSize:13,fontWeight:700}}>{f2(s.цп)} €</div>
                                  {вКош&&<div style={{fontSize:10,color:"#205A28",fontWeight:700}}>×{вКош.кол} в кошницата</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <button className="btn btn-gray" title="Камера" onClick={()=>{setКР("продажба");setКМ(true);}} style={{flexShrink:0,fontSize:16,width:40}}>📷</button>
                    {сървИнфо&&(
                      <button className="btn btn-gray" title="Телефон" onClick={()=>setТМ(true)} style={{flexShrink:0,fontSize:16,width:40,position:"relative"}}>
                        📱{последенБар&&<span style={{position:"absolute",top:5,right:5,width:7,height:7,borderRadius:"50%",background:"#000",border:"2px solid #f7f7f7"}}/>}
                      </button>
                    )}
                  </div>

                  {/* ── Кошница ── */}
                  <div className="card" style={{overflow:"hidden"}}>
                    {/* Хедър */}
                    <div style={{padding:"10px 14px",borderBottom:"1px solid #e8e8e8",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fafafa"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#000"}}>
                        🛒 Кошница
                        {кошница.length>0&&<span style={{marginLeft:8,fontSize:11,color:"#999",fontWeight:400}}>{кошница.length} арт. · {кошница.reduce((a,р)=>a+р.кол,0)} бр.</span>}
                      </div>
                      {кошница.length>0&&<button className="btn btn-gray btn-sm" onClick={изчистиКошница} style={{fontSize:11}}>✕ Изчисти</button>}
                    </div>

                    {кошница.length===0?(
                      <div style={{padding:"28px 16px",textAlign:"center",color:"#bbb",fontSize:13}}>
                        <div style={{fontSize:28,marginBottom:8,opacity:.4}}>🛒</div>
                        Търси артикул или сканирай баркод за да добавиш
                      </div>
                    ):(
                      <>
                        {/* Редове */}
                        {кошница.map(р=>(
                          <div key={р.стока.id} style={{display:"grid",gridTemplateColumns:"1fr 110px 90px 28px",gap:8,alignItems:"center",padding:"9px 14px",borderBottom:"1px solid #f0f0f0"}}>
                            {/* Артикул */}
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{р.стока.ime}</div>
                              <div style={{fontSize:11,color:"#999"}}>{f2(р.стока.цп)}/бр · {р.стока.нал} {р.стока.мерна} налични</div>
                            </div>
                            {/* +/- количество */}
                            <div style={{display:"flex",alignItems:"center",border:"1.5px solid #e4e4e4",borderRadius:7,overflow:"hidden",height:32}}>
                              <button onClick={()=>промениКошКол(р.стока.id,р.кол-1)}
                                style={{width:26,border:"none",background:"none",fontSize:16,cursor:"pointer",color:"#555",flexShrink:0}}>−</button>
                              <input type="number" min="1" step="1" value={р.кол}
                                onChange={e=>промениКошКол(р.стока.id,e.target.value)}
                                style={{flex:1,border:"none",textAlign:"center",fontSize:14,fontWeight:800,fontFamily:"monospace",outline:"none",background:"transparent",width:0}}/>
                              <button onClick={()=>промениКошКол(р.стока.id,р.кол+1)}
                                style={{width:26,border:"none",background:"none",fontSize:16,cursor:"pointer",color:"#555",flexShrink:0}}>+</button>
                            </div>
                            {/* Цена */}
                            <div style={{textAlign:"right"}}>
                              <div className="M" style={{fontWeight:700,fontSize:13}}>{f2(р.кол*р.ц)} €</div>
                              {р.ц!==р.стока.цп&&<div style={{fontSize:10,color:"#999"}}>{f2(р.ц)}/бр</div>}
                            </div>
                            <button onClick={()=>премахниОтКош(р.стока.id)}
                              style={{background:"none",border:"none",color:"#ccc",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>✕</button>
                          </div>
                        ))}

                        {/* Тотал + Комплектна цена + Продай */}
                        <div style={{padding:"12px 14px",background:"#f7f7f7",borderTop:"2px solid #e8e8e8",display:"flex",flexDirection:"column",gap:8}}>
                          {/* Стандартна сума */}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:12,color:"#555"}}>Стандартна сума:</span>
                            <span className="M" style={{fontWeight:700,fontSize:13}}>{f2(кошница.reduce((a,р)=>a+р.кол*р.стока.цп,0))} €</span>
                          </div>

                          {/* Комплектна цена */}
                          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"#999",marginBottom:3}}>Комплектна цена (€)</div>
                              <input className="inp M" type="number" min="0" step=".01"
                                placeholder={f2(кошница.reduce((a,р)=>a+р.кол*р.стока.цп,0))}
                                value={общаЦена}
                                onChange={e=>setОЦ(e.target.value)}
                                onBlur={e=>+e.target.value&&разпределиОбщаЦена(+e.target.value)}
                                style={{textAlign:"center",fontSize:16,fontWeight:800,padding:"7px 8px",height:36}}/>
                            </div>
                            <button className="btn btn-gray btn-sm"
                              onClick={()=>разпределиОбщаЦена(+общаЦена)}
                              disabled={!+общаЦена}
                              title="Раздели цената пропорционално"
                              style={{opacity:+общаЦена?1:.3,flexShrink:0,height:36,marginBottom:0}}>⟳</button>
                          </div>

                          {/* Бележка */}
                          <input className="inp" placeholder="Бележка (незадълж.)" value={бел}
                            onChange={e=>setBел(e.target.value)}
                            style={{fontSize:12,height:32}}/>

                          {/* Продай */}
                          <button className="btn btn-blue"
                            style={{width:"100%",height:44,fontSize:15,borderRadius:8,fontWeight:800,letterSpacing:"-.01em"}}
                            onClick={продайКошница}
                            disabled={!кошница.length}>
                            ✓ Продай · {f2(+общаЦена||кошница.reduce((a,р)=>a+р.кол*р.ц,0))} €
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Последни продажби */}
                  {движ.filter(д=>д.тип==="изх").length>0&&(
                    <div className="card">
                      <div style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:"#555",borderBottom:"1px solid #e8e8e8"}}>Последни продажби</div>
                      {движ.filter(д=>д.тип==="изх").slice(0,5).map(д=>(
                        <div key={д.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderBottom:"1px solid #f0f0f0"}}>
                          <span style={{fontSize:13}}>{ватИ(д.кат)}</span>
                          <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{д.ime}</div></div>
                          <span className="M" style={{fontSize:11,color:"#999"}}>×{д.кол}</span>
                          <span className="M" style={{fontSize:12,fontWeight:700}}>{f2(д.кол*д.цп)} €</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ══ ДЯСНА: KPI + Бързи стоки ══ */}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {/* KPI */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[
                      {е:"Приход (6м)",с:`${fN(Math.round(оПр))} €`,а:"#000"},
                      {е:"Печалба (6м)",с:`${fN(Math.round(оПр-оСб))} €`,а:оПр>оСб?"#205A28":"#C72B32"},
                      {е:"Стоки",с:стоки.length,а:"#000"},
                      {е:"За зареждане",с:крит,а:крит>0?"#C72B32":"#000"},
                    ].map(к=>(<div key={к.е} className="kpi-box"><div className="kpi-label">{к.е}</div><div className="kpi-value" style={{fontSize:17,color:к.а}}>{к.с}</div></div>))}
                  </div>

                  {/* Бързи стоки */}
                  <div className="card">
                    <div style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:"#555",borderBottom:"1px solid #e8e8e8"}}>Бързи стоки</div>
                    <div style={{maxHeight:"calc(100vh - 260px)",overflowY:"auto"}}>
                      {[...стоки].sort((a,b)=>{
                        const o={крит:0,изч:1,ниск:2,добр:3};
                        return(o[стат(a.нал,a.праг)]??4)-(o[стат(b.нал,b.праг)]??4);
                      }).slice(0,25).map(s=>{
                        const сt=стат(s.нал,s.праг);const цв=ватЦ(s.кат);
                        const вКош=кошница.find(р=>р.стока.id===s.id);
                        return(
                          <div key={s.id}
                            onClick={()=>добавиВКошница(s)}
                            style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",
                              borderBottom:"1px solid #f0f0f0",cursor:"pointer",
                              background:вКош?"#f0fff4":"transparent",
                              transition:"background .1s"}}
                            onMouseEnter={e=>!вКош&&(e.currentTarget.style.background="#f7f7f7")}
                            onMouseLeave={e=>!вКош&&(e.currentTarget.style.background="transparent")}>
                            <div style={{width:28,height:28,borderRadius:6,background:цв+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{ватИ(s.кат)}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.ime}</div>
                              <div className="M" style={{fontSize:10,color:сЦ(сt)}}>{s.нал} {s.мерна}</div>
                            </div>
                            {вКош&&<span style={{fontSize:10,background:"#e8f5e9",color:"#205A28",padding:"1px 5px",borderRadius:4,fontWeight:700,flexShrink:0}}>×{вКош.кол}</span>}
                            <div className="M" style={{fontSize:12,fontWeight:700,flexShrink:0}}>{f2(s.цп)} €</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab==="stock"&&(
              <div className="fade-in">
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"70px 1fr 116px 46px 86px 94px 56px 80px 72px 52px",padding:"0 14px",background:"#f7f7f7",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                    {["Код","Наименование","Категория","М.ед","Дост.","Прод.","Марж","Нал.","Статус",""].map((h,i)=>(
                      <div key={i} className="th" style={{textAlign:["Дост.","Прод.","Марж","Нал."].includes(h)?"right":"left"}}>{h}</div>
                    ))}
                  </div>
                  <div style={{maxHeight:"calc(100vh - 180px)",overflowY:"auto"}}>
                    {видими.map(s=>{
                      const сt=стат(s.нал,s.праг); const м=мрж(s.цд,s.цп); const цв=ватЦ(s.кат);
                      return(
                        <div key={s.id} className="table-row" style={{gridTemplateColumns:"75px 1fr 120px 55px 95px 100px 62px 80px 75px 60px",display:"grid"}} onClick={()=>{setФ({...s});setН(false);setСкК(null);setSM(true);}}>
                          <div className="M" style={{fontSize:11,color:"#555555",overflow:"hidden",textOverflow:"ellipsis"}}>{s.код}</div>
                          <div style={{fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{s.ime}</div>
                          <div><span className="chip" style={{background:цв+"12",color:"#000000"}}><span style={{color:цв,fontSize:10}}>●</span> {s.кат}</span></div>
                          <div style={{color:"#999999",fontSize:12}}>{s.мерна}</div>
                          <div className="M" style={{textAlign:"right",fontSize:12,color:"#999999"}}>{f2(s.цд)} €</div>
                          <div className="M" style={{textAlign:"right",fontWeight:700,fontSize:12}}>{f2(s.цп)} €</div>
                          <div className="M" style={{textAlign:"right",fontWeight:600,fontSize:12,color:м>=30?"#000000":м>=15?"#999999":"#C72B32"}}>{м}%</div>
                          <div className="M" style={{textAlign:"right",fontWeight:700,color:сЦ(сt)}}>{s.нал} <span style={{fontSize:11,color:"#555555",fontWeight:400}}>{s.мерна}</span></div>
                          <div><span className="tag" style={{background:сФ(сt),color:сЦ(сt),fontSize:11}}>{сЛ(сt)}</span></div>
                          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                            <button className="btn btn-gray btn-icon" style={{fontSize:12}} onClick={e=>{e.stopPropagation();setФ({...s});setН(false);setСкК(null);setSM(true);}}>✎</button>
                          </div>
                        </div>
                      );
                    })}
                    {видими.length===0&&<div style={{padding:"32px",textAlign:"center",color:"#999999",fontSize:14}}>Няма намерени стоки.</div>}
                  </div>
                </div>
              </div>
            )}

            {tab==="cats"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:10}}>
                {основниКат.map(к=>{
                  const подкат = кат.filter(п=>п.родител_id===к.id);
                  const брОсн  = стоки.filter(s=>s.кат===к.ime).length;
                  const брВсич = брОсн + подкат.reduce((a,п)=>a+стоки.filter(s=>s.кат===п.ime).length,0);
                  const крК    = стоки.filter(s=>s.кат===к.ime&&стат(s.нал,s.праг)!=="добр").length
                               + подкат.reduce((a,п)=>a+стоки.filter(s=>s.кат===п.ime&&стат(s.нал,s.праг)!=="добр").length,0);
                  const разгъната = разгКат.has(к.id);
                  const toggleРазг = () => setРазгКат(prev=>{
                    const n=new Set(prev);
                    n.has(к.id)?n.delete(к.id):n.add(к.id);
                    return n;
                  });
                  return(
                    <div key={к.id}>
                      {/* Основна категория */}
                      <div className="card" style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"box-shadow .13s"}}
                        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}
                        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                        {/* Иконка — клик за редакция */}
                        <div style={{width:44,height:44,borderRadius:11,background:к.цв+"15",border:`2px solid ${к.цв}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}} onClick={()=>отвКатРед(к)}>{к.ico}</div>
                        {/* Текст — клик за редакция */}
                        <div style={{flex:1,minWidth:0}} onClick={()=>отвКатРед(к)}>
                          <div style={{fontSize:14,fontWeight:700,color:"#000000",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{к.ime}</div>
                          <div style={{display:"flex",gap:8,marginTop:2}}>
                            <span className="M" style={{fontSize:11.5,color:"#999999"}}>{брВсич} арт.</span>
                            {подкат.length>0&&<span style={{fontSize:11.5,color:"#999999"}}>{подкат.length} подкат.</span>}
                            {крК>0&&<span style={{fontSize:11.5,color:"#C72B32",fontWeight:600}}>⚠ {крК}</span>}
                          </div>
                        </div>
                        {/* Действия */}
                        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                          <button className="btn btn-gray btn-sm" style={{fontSize:11,padding:"4px 10px"}}
                            onClick={e=>{e.stopPropagation();setКФ({id:null,ime:"",цв:к.цв,ico:к.ico,родител_id:к.id});setНК(true);setКМод(true);}}>
                            + Подкат.
                          </button>
                          {подкат.length>0&&(
                            <button onClick={e=>{e.stopPropagation();toggleРазг();}}
                              style={{width:28,height:28,borderRadius:7,border:"1px solid #e4e4e4",background:"#f7f7f7",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,transition:"transform .15s",transform:разгъната?"rotate(180deg)":"rotate(0deg)"}}>
                              ▾
                            </button>
                          )}
                          <div style={{width:10,height:10,borderRadius:"50%",background:к.цв}}/>
                        </div>
                      </div>
                      {/* Подкатегории — показват се само ако разгъната */}
                      {разгъната&&подкат.length>0&&(
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:6,paddingLeft:24,marginTop:6}}>
                          {подкат.map(п=>{
                            const брП=стоки.filter(s=>s.кат===п.ime).length;
                            const крП=стоки.filter(s=>s.кат===п.ime&&стат(s.нал,s.праг)!=="добр").length;
                            return(
                              <div key={п.id} className="card" style={{padding:"9px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderLeft:`3px solid ${к.цв}`}}
                                onClick={()=>отвКатРед(п)}
                                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.08)"}
                                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                                <div style={{width:32,height:32,borderRadius:8,background:п.цв+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{п.ico}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:12.5,fontWeight:600,color:"#000000",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{п.ime}</div>
                                  <div style={{display:"flex",gap:6,marginTop:1}}>
                                    <span className="M" style={{fontSize:11,color:"#999999"}}>{брП} арт.</span>
                                    {крП>0&&<span style={{fontSize:11,color:"#C72B32",fontWeight:600}}>⚠ {крП}</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {/* Добави подкатегория директно от списъка */}
                          <div className="card" style={{padding:"9px 12px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",border:"1.5px dashed #e4e4e4",background:"#fafafa",borderLeft:`3px solid ${к.цв}`}}
                            onClick={()=>{setКФ({id:null,ime:"",цв:к.цв,ico:к.ico,родител_id:к.id});setНК(true);setКМод(true);}}
                            onMouseEnter={e=>e.currentTarget.style.borderColor="#999999"}
                            onMouseLeave={e=>e.currentTarget.style.borderColor="#e4e4e4"}>
                            <span style={{fontSize:15,color:"#999999"}}>+</span>
                            <span style={{fontSize:12,color:"#999999",fontWeight:600}}>Нова подкатегория</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Бутон нова основна категория */}
                <div className="card" style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",border:"1.5px dashed #e4e4e4",background:"#ffffff",minHeight:60}}
                  onClick={отвКатНова}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#000000";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#e4e4e4";}}>
                  <span style={{fontSize:18,color:"#999999"}}>+</span>
                  <span style={{fontSize:13,color:"#999999",fontWeight:600}}>Нова основна категория</span>
                </div>
              </div>
            )}

            {tab==="expenses"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* P&L обобщение */}
                {плОтчет.length>0&&(()=>{
                  const тек = плОтчет[0];
                  return(
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                      {[
                        {е:"Приход (тек. мес.)",  с:`${fN(Math.round(тек.общо_приход||0))} €`,  а:"#000000"},
                        {е:"Разходи (тек. мес.)", с:`${fN(Math.round(тек.общо_разходи||0))} €`, а:"#C72B32"},
                        {е:"Нетна печалба",        с:`${fN(Math.round(тек.нетна_печалба||0))} €`,а:(тек.нетна_печалба||0)>=0?"#000000":"#C72B32"},
                        {е:"Разходи разходи",      с:`${fN(Math.round(разходи.reduce((a,р)=>a+ +р.сума,0)))} €`, а:"#999999"},
                      ].map(к=>(<div key={к.е} className="kpi-box"><div className="kpi-label">{к.е}</div><div className="kpi-value" style={{color:к.а}}>{к.с}</div></div>))}
                    </div>
                  );
                })()}

                {/* Списък разходи */}
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{padding:"11px 14px",borderBottom:"1px solid #e8e8e8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:600}}>Разходи</div>
                    <div className="M" style={{fontSize:12,color:"#C72B32",fontWeight:700}}>
                      {fN(Math.round(разходи.reduce((a,р)=>a+ +р.сума,0)))} € общо
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"84px 110px 1fr 100px 40px",padding:"0 14px",background:"#f7f7f7",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                    {["Дата","Категория","Бележка","Сума",""].map((h,i)=>(
                      <div key={i} className="th" style={{textAlign:h==="Сума"?"right":"left"}}>{h}</div>
                    ))}
                  </div>
                  <div style={{maxHeight:"calc(100vh - 320px)",overflowY:"auto"}}>
                    {разходи.length===0&&<div style={{padding:"32px",textAlign:"center",color:"#999999",fontSize:13}}>Няма разходи. Натисни + Нов разход.</div>}
                    {разходи.map(р=>(
                      <div key={р.id} style={{display:"grid",gridTemplateColumns:"84px 110px 1fr 100px 40px",padding:"0 14px",height:36,borderBottom:"1px solid rgba(0,0,0,.06)",alignItems:"center",cursor:"pointer"}}
                        onClick={()=>{setРФ({...р,сума:String(р.сума)});setРМод(true);}}>
                        <div className="M" style={{fontSize:11,color:"#555555"}}>{р.дата}</div>
                        <div>
                          <span className="chip" style={{background:"#f0f0f0",color:"#000000",fontSize:11}}>
                            {р.категория==="Наем"?"🏠":р.категория==="Заплати"?"👤":р.категория==="Ток"?"⚡":"📋"} {р.категория}
                          </span>
                        </div>
                        <div style={{fontSize:12,color:"#555555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{р.бележка||"—"}</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700,color:"#C72B32"}}>{f2(р.сума)} €</div>
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <button className="btn btn-gray btn-icon btn-sm" style={{fontSize:12}} onClick={e=>{e.stopPropagation();setРФ({...р,сума:String(р.сума)});setРМод(true);}}>✎</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* P&L таблица по месец */}
                {плОтчет.length>0&&(
                  <div className="card" style={{overflow:"hidden"}}>
                    <div style={{padding:"11px 14px",fontSize:13,fontWeight:600,borderBottom:"1px solid #e8e8e8"}}>P&L по месец</div>
                    <div style={{maxHeight:280,overflowY:"auto"}}>
                      <div style={{display:"grid",gridTemplateColumns:"108px 1fr 1fr 1fr 1fr 1fr",padding:"0 14px",background:"#f7f7f7",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                        {["Месец","Приход","Палети","Разходи","Общо разх.","Нетна печ."].map((h,i)=>(
                          <div key={i} className="th" style={{textAlign:i>0?"right":"left"}}>{h}</div>
                        ))}
                      </div>
                      {плОтчет.map((р,i)=>{
                        const пч = р.нетна_печалба||0;
                        const д = new Date(р.месец);
                        const мЛаб = д.toLocaleString("bg",{month:"long",year:"numeric"});
                        return(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"108px 1fr 1fr 1fr 1fr 1fr",padding:"0 14px",height:36,borderBottom:"1px solid rgba(0,0,0,.06)",alignItems:"center",background:i===0?"rgba(217,119,6,.08)":"transparent"}}>
                            <div style={{fontSize:12,fontWeight:i===0?700:400}}>{мЛаб}</div>
                            <div className="M" style={{textAlign:"right",fontSize:12}}>{fN(Math.round(р.общо_приход||0))} €</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,color:"#C72B32"}}>{fN(Math.round(р.разход_палети||0))} €</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,color:"#C72B32"}}>{fN(Math.round((р.разход_наем||0)+(р.разход_заплати||0)+(р.разход_ток||0)+(р.разход_друго||0)))} €</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,fontWeight:600,color:"#C72B32"}}>{fN(Math.round(р.общо_разходи||0))} €</div>
                            <div className="M" style={{textAlign:"right",fontSize:13,fontWeight:700,color:пч>=0?"#205A28":"#C72B32"}}>{пч>=0?"+":""}{fN(Math.round(пч))} €</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab==="history"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    {е:"Транзакции",с:историяФ.length,а:"#000000"},
                    {е:"Приход",с:`${fN(Math.round(хПр))} €`,а:"#000000"},
                    {е:"Печалба",с:`${fN(Math.round(хПч))} €`,а:хПч>=0?"#000000":"#C72B32"},
                  ].map(к=>(<div key={к.е} className="kpi-box"><div className="kpi-label">{к.е}</div><div className="kpi-value" style={{color:к.а}}>{к.с}</div></div>))}
                </div>
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{padding:"11px 14px",borderBottom:"1px solid #e8e8e8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:600}}>{историяФ.length} транзакции{хДата==="today"?" · Днес":хДата==="week"?" · 7 дни":хДата==="month"?" · 30 дни":""}</div>
                    <button className="btn btn-green btn-sm" onClick={()=>{
                      const BOM="﻿";
                      const h=["Дата","Час","Стока","Код","Категория","Кол.","Ед.цена","Сума","Печалба"];
                      const rows=историяФ.map(д=>{const дата=eetИСО(new Date(д.дата));const пч=д.кол*(д.цп-д.цд);return[дата.slice(0,10),дата.slice(11,16),д.ime,д.код,д.кат,д.кол,f2(д.цп),f2(д.кол*д.цп),f2(пч)];});
                      const csv=BOM+[h,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
                      Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})),download:`история_${eetДата()}.csv`}).click();
                    }}>↓ CSV</button>
                  </div>
                  {историяФ.length===0
                    ?<div style={{padding:"32px",textAlign:"center",color:"#999999",fontSize:13}}>Няма намерени транзакции.</div>
                    :<div style={{maxHeight:"calc(100vh - 280px)",overflowY:"auto"}}>
                      <div style={{display:"grid",gridTemplateColumns:"84px 54px 1fr 96px 50px 78px 78px 78px",padding:"0 14px",background:"#f7f7f7",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                        {["Дата","Час","Стока","Категория","Кол.","Ед.цена","Сума","Печалба"].map((h,i)=>(<div key={i} className="th" style={{textAlign:["Кол.","Ед.цена","Сума","Печалба"].includes(h)?"right":"left"}}>{h}</div>))}
                      </div>
                      {историяФ.map((д,i)=>{
                        const дРaw=new Date(д.дата); const дата=isNaN(дРaw)?null:eetИСО(дРaw); if(!дата) return null; const цв=ватЦ(д.кат); const пч=д.кол*(д.цп-д.цд);
                        return(
                          <div key={д.id||i} style={{display:"grid",gridTemplateColumns:"84px 54px 1fr 96px 50px 78px 78px 78px",padding:"0 14px",height:36,borderBottom:"1px solid rgba(0,0,0,.06)",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <div className="M" style={{fontSize:11,color:"#555555"}}>{дата.slice(0,10)}</div>
                            <div className="M" style={{fontSize:11,color:"#555555"}}>{дата.slice(11,16)}</div>
                            <div style={{fontWeight:500,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{д.ime}</div>
                            <div><span className="chip" style={{background:"#f0f0f0",color:"#000000",fontSize:11}}><span style={{color:цв,fontSize:9}}>●</span> {д.кат}</span></div>
                            <div className="M" style={{textAlign:"right",fontWeight:600}}>{д.кол}</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,color:"#999999"}}>{f2(д.цп)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600}}>{f2(д.кол*д.цп)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600,color:пч>=0?"#205A28":"#C72B32"}}>{пч>=0?"+":""}{f2(пч)} €</div>
                          </div>
                        );
                      })}
                    </div>
                  }
                </div>
                <div className="card" style={{padding:"12px 14px"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Топ стоки по приход</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {(()=>{
                      const агр={};
                      историяФ.forEach(д=>{if(!агр[д.код]) агр[д.код]={ime:д.ime,кат:д.кат,кол:0,пр:0,пч:0};агр[д.код].кол+=д.кол;агр[д.код].пр+=д.кол*д.цп;агр[д.код].пч+=д.кол*(д.цп-д.цд);});
                      return Object.values(агр).sort((a,b)=>b.пр-a.пр).slice(0,8);
                    })().map((р,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:10,color:"#cccccc",width:18,fontFamily:"monospace"}}>#{i+1}</span>
                        <span style={{fontSize:13}}>{ватИ(р.кат)}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{р.ime}</div>
                          <div style={{fontSize:11,color:"#555555"}}>×{р.кол} бр.</div>
                        </div>
                        <div className="M" style={{fontSize:12,fontWeight:700,color:"#000000"}}>{fN(Math.round(р.пр))} €</div>
                        <div className="M" style={{fontSize:12,fontWeight:600,color:р.пч>=0?"#205A28":"#C72B32",minWidth:70,textAlign:"right"}}>{р.пч>=0?"+":""}{fN(Math.round(р.пч))} €</div>
                      </div>
                    ))}
                    {историяФ.length===0&&<div style={{fontSize:12,color:"#999999",textAlign:"center",padding:"12px 0"}}>Няма данни.</div>}
                  </div>
                </div>
              </div>
            )}

            {tab==="reports"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[
                    {е:"Общ приход (6м)",с:`${fN(Math.round(оПр))} €`,а:"#000000"},
                    {е:"Себестойност",с:`${fN(Math.round(оСб))} €`,а:"#999999"},
                    {е:"Брутна печалба",с:`${fN(Math.round(оПр-оСб))} €`,а:оПр>оСб?"#205A28":"#C72B32"},
                    {е:"Среден марж",с:`${оПр>0?Math.round((оПр-оСб)/оПр*100):0}%`,а:"#000000"},
                  ].map(к=>(<div key={к.е} className="kpi-box"><div className="kpi-label">{к.е}</div><div className="kpi-value" style={{color:к.а}}>{к.с}</div></div>))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div className="card" style={{padding:"16px 18px",background:"#ffffff"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Месечен оборот</div>
                    <div style={{display:"flex",gap:4,alignItems:"flex-end",height:150,paddingBottom:18,borderBottom:"1px solid #e8e8e8"}}>
                      {об6М.map(м=>(
                        <div key={м.к} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%"}}>
                          <div style={{flex:1,display:"flex",alignItems:"flex-end",gap:1.5,width:"100%",justifyContent:"center"}}>
                            <div style={{width:"42%",height:`${м.пр>0?(м.пр/mxПр)*120:3}px`,background:"#000000",borderRadius:"3px 3px 0 0",minHeight:3}}/>
                            <div style={{width:"42%",height:`${м.сб>0?(м.сб/mxПр)*120:3}px`,background:"#000000",borderRadius:"3px 3px 0 0",minHeight:3}}/>
                          </div>
                          <div style={{fontSize:10,color:"#999999",fontFamily:"monospace"}}>{м.кратко}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:"#555555"}}>
                      <span><b style={{color:"#205A28"}}>■</b> Приход</span>
                      <span><b style={{color:"#C72B32"}}>■</b> Себест.</span>
                    </div>
                  </div>
                  <div className="card" style={{padding:"16px 18px",background:"#ffffff"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Стойност по категория</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:180,overflowY:"auto"}}>
                      {кат.map(к=>{
                        const пп=стоки.filter(s=>s.кат===к.ime); if(!пп.length) return null;
                        const ст=пп.reduce((a,s)=>a+s.нал*s.цп,0);
                        const макс=Math.max(...кат.map(к2=>стоки.filter(s=>s.кат===к2.ime).reduce((a,s)=>a+s.нал*s.цп,0)),1);
                        return(
                          <div key={к.id}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                              <span style={{fontSize:12,color:"#000000"}}>{к.ico} {к.ime} <span style={{color:"#999999"}}>({пп.length})</span></span>
                              <span className="M" style={{fontSize:12,fontWeight:600}}>{fN(Math.round(ст))} €</span>
                            </div>
                            <div style={{height:4,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}>
                              <div style={{width:`${(ст/макс)*100}%`,height:"100%",background:к.цв,borderRadius:2}}/>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                </div>
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{padding:"12px 14px",borderBottom:"1px solid #e8e8e8",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontWeight:600,fontSize:13,color:"#000000"}}>Продадени стоки — {достМ[отчМ]||отчМ}</div>
                    {продМ.length>0&&(
                      <div style={{marginLeft:12,display:"flex",gap:16,fontSize:12}}>
                        {[{е:"Приход",с:`${fN(Math.round(мПр))} €`,цв:"#000000"},{е:"Себест.",с:`${fN(Math.round(мСб))} €`,цв:"#999999"},{е:"Печалба",с:`${fN(Math.round(мПч))} €`,цв:мПч>=0?"#205A28":"#C72B32"},{е:"Марж",с:`${мПр>0?Math.round(мПч/мПр*100):0}%`,цв:"#000000"}].map(к=><span key={к.е} className="M" style={{color:к.цв}}><span style={{color:"#999999",fontFamily:"inherit",fontWeight:400}}>{к.е}: </span>{к.с}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{maxHeight:280,overflowY:"auto"}}>
                    <div style={{display:"grid",gridTemplateColumns:"76px 1fr 124px 50px 90px 94px 84px 60px",padding:"0 14px",background:"#f7f7f7",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                      {["Код","Наименование","Категория","Кол.","Ед.цена","Приход","Печалба","Марж"].map((h,i)=>(<div key={i} className="th" style={{textAlign:["Кол.","Ед.цена","Приход","Печалба","Марж"].includes(h)?"right":"left"}}>{h}</div>))}
                    </div>
                    {продМ.length===0
                      ?<div style={{padding:"28px",textAlign:"center",color:"#999999",fontSize:13}}>Няма продажби за {достМ[отчМ]||отчМ}.</div>
                      :продМ.map((р,i)=>{
                        const пч=р.пр-р.сб; const мр=р.пр>0?Math.round(пч/р.пр*100):0;
                        return(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"76px 1fr 124px 50px 90px 94px 84px 60px",padding:"0 14px",height:36,borderBottom:"1px solid rgba(0,0,0,.06)",alignItems:"center"}}>
                            <div className="M" style={{fontSize:11,color:"#555555"}}>{р.код}</div>
                            <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{р.ime}</div>
                            <div><span className="chip" style={{background:"#f0f0f0",color:"#000000"}}><span style={{color:ватЦ(р.кат),fontSize:9}}>●</span> {р.кат}</span></div>
                            <div className="M" style={{textAlign:"right",fontWeight:700}}>{р.кол}</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,color:"#999999"}}>{f2(р.пр/(р.кол||1))} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600}}>{f2(р.пр)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600,color:пч>=0?"#205A28":"#C72B32"}}>{пч>=0?"+":""}{f2(пч)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600,color:мр>=30?"#000000":мр>=15?"#999999":"#C72B32"}}>{мр}%</div>
                          </div>
                        );
                      })
                    }
                    {продМ.length>0&&(
                      <div style={{display:"grid",gridTemplateColumns:"76px 1fr 124px 50px 90px 94px 84px 60px",padding:"0 14px",height:40,background:"#ffffff",borderTop:"2px solid #e4e4e4",alignItems:"center"}}>
                        <div className="M" style={{fontSize:12,fontWeight:700,gridColumn:"1/4"}}>ОБЩО · {продМ.length} арт.</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700}}>{fN(продМ.reduce((a,р)=>a+р.кол,0))}</div>
                        <div/>
                        <div className="M" style={{textAlign:"right",fontWeight:700}}>{f2(мПр)} €</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700,color:мПч>=0?"#205A28":"#C72B32"}}>{мПч>=0?"+":""}{f2(мПч)} €</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700}}>{мПр>0?Math.round(мПч/мПр*100):0}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab==="delivery"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    {е:"Чакащи",    с:доставки.filter(д=>д.статус==="чакаща").length, а:"#d97706"},
                    {е:"Приети (3м)",с:доставки.filter(д=>д.статус==="приета").length, а:"#000000"},
                    {е:"Доставчици", с:доставчици.length, а:"#000000"},
                  ].map(к=>(<div key={к.е} className="kpi-box"><div className="kpi-label">{к.е}</div><div className="kpi-value" style={{color:к.а}}>{к.с}</div></div>))}
                </div>
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"84px 1fr 0px 54px 104px 94px",padding:"0 14px",background:"#f7f7f7",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                    {["Дата","Доставчик / бележка","","Арт.","Стойност","Статус"].map((h,i)=>(
                      <div key={i} className="th" style={{textAlign:["Арт.","Стойност"].includes(h)?"right":"left"}}>{h}</div>
                    ))}
                  </div>
                  <div style={{maxHeight:"calc(100vh - 230px)",overflowY:"auto"}}>
                    {видимиДост.length===0&&(
                      <div style={{padding:"40px",textAlign:"center",color:"#999999",fontSize:14}}>
                        Няма доставки. Натисни <b>+ Нова доставка</b> за да започнеш.
                      </div>
                    )}
                    {видимиДост.map(д=>{
                      const стЦв=д.статус==="приета"?"#000000":д.статус==="чакаща"?"#d97706":"#999999";
                      const стФ=д.статус==="приета"?"rgba(0,0,0,.04)":д.статус==="чакаща"?"rgba(217,119,6,.06)":"rgba(156,163,175,.08)";
                      const стЛ=д.статус==="приета"?"✓ Приета":д.статус==="чакаща"?"⏳ Чакаща":"✕ Отказана";
                      return(
                        <div key={д.id} className="table-row" style={{gridTemplateColumns:"84px 1fr 0px 54px 104px 94px",display:"grid",padding:"0 14px"}} onClick={()=>отвДост(д)}>
                          <div className="M" style={{fontSize:12,color:"#000000"}}>{д.дата}</div>
                          <div style={{minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{д.доставчик_ime||"—"}</div>
                            {д.бележка&&<div style={{fontSize:11,color:"#555555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{д.бележка}</div>}
                          </div>
                          <div/>
                          <div className="M" style={{textAlign:"right",fontWeight:600}}>{д.total_редове||0}</div>
                          <div className="M" style={{textAlign:"right",fontWeight:700}}>{f2(д.total_стойност||0)} €</div>
                          <div><span className="tag" style={{background:стФ,color:стЦв,fontSize:11}}>{стЛ}</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── МОДАЛ ДОСТАВЧИЦИ ── */}
      {достчМод&&(
        <div className="overlay" onClick={()=>setДЧМ(false)}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>👥 Доставчици</div>
              <button className="btn btn-gray btn-sm" onClick={()=>setДЧМ(false)}>✕</button>
            </div>

            {/* Ако редактираме/добавяме — покажи форма */}
            {достчФ!==null?(
              <>
                <div className="modal-body">
                  <div>
                    <span className="lbl">Наименование</span>
                    <input className="inp" placeholder="Доставчик ООД" autoFocus
                      value={достчФ.ime||""}
                      onChange={e=>setДЧФ(f=>({...f,ime:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&запазиДостч()}/>
                  </div>
                  <div>
                    <span className="lbl">Телефон (незадълж.)</span>
                    <input className="inp" placeholder="+359 88 888 8888"
                      value={достчФ.телефон||""}
                      onChange={e=>setДЧФ(f=>({...f,телефон:e.target.value}))}/>
                  </div>
                  <div>
                    <span className="lbl">Бележка (незадълж.)</span>
                    <input className="inp" placeholder="Условия, контакт…"
                      value={достчФ.бележка||""}
                      onChange={e=>setДЧФ(f=>({...f,бележка:e.target.value}))}/>
                  </div>
                </div>
                <div className="modal-ftr" style={{justifyContent:"space-between"}}>
                  {достчФ.id&&<button className="btn btn-red" onClick={()=>изтрийДостч(достчФ.id)}>Изтрий</button>}
                  <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                    <button className="btn btn-gray" onClick={()=>setДЧФ(null)}>← Назад</button>
                    <button className="btn btn-blue" onClick={запазиДостч} disabled={!достчФ.ime?.trim()} style={{opacity:достчФ.ime?.trim()?1:.4}}>
                      {достчФ.id?"Запази":"Добави"}
                    </button>
                  </div>
                </div>
              </>
            ):(
              <>
                {/* Списък доставчици */}
                <div style={{maxHeight:360,overflowY:"auto"}}>
                  {доставчици.length===0&&(
                    <div style={{padding:"28px",textAlign:"center",color:"#999999",fontSize:13}}>Няма доставчици.</div>
                  )}
                  {доставчици.map(д=>(
                    <div key={д.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 22px",borderBottom:"1px solid #e8e8e8",cursor:"pointer",transition:"background .1s"}}
                      onClick={()=>setДЧФ({...д})}
                      onMouseEnter={e=>e.currentTarget.style.background="#f7f7f7"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{width:36,height:36,borderRadius:9,background:"#f7f7f7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏢</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600}}>{д.ime}</div>
                        {д.телефон&&<div style={{fontSize:12,color:"#999999"}}>{д.телефон}</div>}
                      </div>
                      <span style={{fontSize:12,color:"#999999"}}>✎</span>
                    </div>
                  ))}
                </div>
                <div className="modal-ftr" style={{justifyContent:"flex-end"}}>
                  <button className="btn btn-blue" onClick={()=>setДЧФ({id:null,ime:"",телефон:"",бележка:""})}>+ Нов доставчик</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── МОДАЛ ПАЛЕТ ДОСТАВКА ── */}
      {достПалМод&&достФ&&(
        <div className="overlay" onClick={()=>setДПМ(false)}>
          <div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>📦 Нова палетна доставка</div>
              <button className="btn btn-gray btn-sm" onClick={()=>setДПМ(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <span className="lbl">Доставчик</span>
                  <select className="inp" value={достФ.доставчик_id||""}
                    onChange={e=>{const д=доставчици.find(д=>д.id===+e.target.value);setДФ(f=>({...f,доставчик_id:+e.target.value,доставчик_ime:д?.ime||""}));}}>
                    {доставчици.map(д=><option key={д.id} value={д.id}>{д.ime}</option>)}
                  </select>
                </div>
                <div>
                  <span className="lbl">Дата</span>
                  <input className="inp" type="date" value={достФ.дата||""}
                    onChange={e=>setДФ(f=>({...f,дата:e.target.value}))}/>
                </div>
              </div>
              <div>
                <span className="lbl">Сума на палета (€)</span>
                <input className="inp M" type="number" min="0" step=".01" placeholder="0.00"
                  value={достФ.сума||""}
                  onChange={e=>setДФ(f=>({...f,сума:e.target.value}))}
                  style={{fontSize:26,fontWeight:800,textAlign:"center",padding:"14px",height:"auto"}}
                  autoFocus/>
              </div>
              <div>
                <span className="lbl">Бележка (незадълж.)</span>
                <input className="inp" placeholder="Фактура №, описание…" value={достФ.бележка||""}
                  onChange={e=>setДФ(f=>({...f,бележка:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&запазиПалет()}/>
              </div>
            </div>
            <div className="modal-ftr">
              <button className="btn btn-gray" onClick={()=>setДПМ(false)}>Отказ</button>
              <button className="btn btn-blue" style={{paddingLeft:24,paddingRight:24,opacity:+достФ.сума>0?1:.4}}
                onClick={запазиПалет}
                disabled={!достФ.сума||+достФ.сума<=0}>
                ✓ Запиши палета
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── МОДАЛ РАЗХОД ── */}
      {разхМод&&разхФ&&(
        <div className="overlay" onClick={()=>setРМод(false)}>
          <div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>{разхФ.id?"Редактирай разход":"Нов разход"}</div>
              <button className="btn btn-gray btn-sm" onClick={()=>setРМод(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <span className="lbl">Дата</span>
                  <input className="inp" type="date" value={разхФ.дата||""} onChange={e=>setРФ(f=>({...f,дата:e.target.value}))}/>
                </div>
                <div>
                  <span className="lbl">Категория</span>
                  <select className="inp" value={разхФ.категория||"Наем"} onChange={e=>setРФ(f=>({...f,категория:e.target.value}))}>
                    {["Наем","Заплати","Ток","Друго"].map(к=><option key={к}>{к}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <span className="lbl">Сума (€)</span>
                <input className="inp M" type="number" min="0" step=".01" placeholder="0.00"
                  value={разхФ.сума||""}
                  onChange={e=>setРФ(f=>({...f,сума:e.target.value}))}
                  style={{fontSize:22,fontWeight:800,textAlign:"center"}} autoFocus/>
              </div>
              <div>
                <span className="lbl">Бележка</span>
                <input className="inp" placeholder="Офис наем, ЧЕЗ фактура…" value={разхФ.бележка||""} onChange={e=>setРФ(f=>({...f,бележка:e.target.value}))}/>
              </div>
            </div>
            <div className="modal-ftr" style={{justifyContent:"space-between"}}>
              {разхФ.id&&<button className="btn btn-red" onClick={()=>изтрийРазх(разхФ.id)}>Изтрий</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button className="btn btn-gray" onClick={()=>setРМод(false)}>Отказ</button>
                <button className="btn btn-blue" onClick={запазиРазх} disabled={!разхФ.сума||+разхФ.сума<=0} style={{opacity:+разхФ.сума>0?1:.4}}>
                  {разхФ.id?"Запази":"Добави"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── МОДАЛ СТОКА ── */}
      {стМод&&форма&&(
        <div className="overlay" onClick={()=>{setSM(false);setСкК(null);}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>{нова?"Нова стока":"Редактиране"}</div>
              {скКод&&нова&&<div style={{fontSize:12,color:"#000000",background:"#f7f7f7",padding:"3px 9px",borderRadius:20,fontFamily:"monospace"}}>📷 {скКод}</div>}
              <button className="btn btn-gray btn-sm" onClick={()=>{setSM(false);setСкК(null);}}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <span className="lbl">Код / Баркод</span>
                  <input className="inp" placeholder="AC001" value={форма.код} onChange={e=>setФ(f=>({...f,код:e.target.value}))} style={{fontFamily:"monospace"}}/>
                </div>
                <div>
                  <span className="lbl">Мерна единица</span>
                  <select className="inp" value={форма.мерна} onChange={e=>setФ(f=>({...f,мерна:e.target.value}))}>
                    {МЕРНИ.map(м=><option key={м}>{м}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <span className="lbl">Наименование</span>
                <input className="inp" placeholder="Пълно наименование…" value={форма.ime} onChange={e=>setФ(f=>({...f,ime:e.target.value}))} autoFocus={!!скКод}/>
              </div>
              <div>
                <span className="lbl">Категория</span>
                {(()=>{
                  const избКат = кат.find(к=>к.ime===форма.кат);
                  const основна = избКат?.родител_id
                    ? кат.find(к=>к.id===избКат.родител_id)
                    : избКат;
                  const подкатНаОсн = основна ? кат.filter(п=>п.родител_id===основна.id) : [];
                  return(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <select className="inp" value={основна?.ime||""} onChange={e=>{
                        const нов=кат.find(к=>к.ime===e.target.value&&!к.родител_id);
                        if(нов) setФ(f=>({...f,кат:нов.ime}));
                      }}>
                        {основниКат.map(к=><option key={к.id} value={к.ime}>{к.ico} {к.ime}</option>)}
                      </select>
                      {подкатНаОсн.length>0&&(
                        <select className="inp" value={форма.кат} onChange={e=>setФ(f=>({...f,кат:e.target.value}))}
                          style={{borderLeft:`3px solid ${основна?.цв||"#e4e4e4"}`}}>
                          <option value={основна?.ime}>— Без подкатегория —</option>
                          {подкатНаОсн.map(п=><option key={п.id} value={п.ime}>{п.ico} {п.ime}</option>)}
                        </select>
                      )}
                    </div>
                  );
                })()}
              </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <span className="lbl">Доставна цена (€)</span>
                  <input className="inp" type="number" step=".01" min="0" value={форма.цд} onChange={e=>setФ(f=>({...f,цд:e.target.value}))}/>
                </div>
                <div>
                  <span className="lbl">Продажна цена (€)</span>
                  <input className="inp" type="number" step=".01" min="0" value={форма.цп} onChange={e=>setФ(f=>({...f,цп:e.target.value}))}/>
                </div>
              </div>
              {+форма.цд>0&&+форма.цп>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{background:"#f7f7f7",border:"1px solid #e8e8e8",borderRadius:8,padding:"11px 14px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#000000",marginBottom:3}}>Марж</div>
                    <div className="M" style={{fontSize:22,fontWeight:800,color:"#000000"}}>{мрж(+форма.цд,+форма.цп)}%</div>
                  </div>
                  <div style={{background:"#f7f7f7",border:"1px solid #e8e8e8",borderRadius:8,padding:"11px 14px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#000000",marginBottom:3}}>Печалба / бр.</div>
                    <div className="M" style={{fontSize:22,fontWeight:800,color:"#000000"}}>{f2(+форма.цп-+форма.цд)} €</div>
                  </div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <span className="lbl">Наличност</span>
                  <input className="inp" type="number" step=".1" min="0" value={форма.нал} onChange={e=>setФ(f=>({...f,нал:e.target.value}))}/>
                </div>
                <div>
                  <span className="lbl">Праг зареждане</span>
                  <input className="inp" type="number" step="1" min="0" value={форма.праг} onChange={e=>setФ(f=>({...f,праг:e.target.value}))}/>
                </div>
              </div>
              {/* Таг палет */}
              <div onClick={()=>setФ(f=>({...f,палет:!f.палет}))}
                style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:9,border:`1.5px solid ${форма.палет?"#000000":"#e4e4e4"}`,background:форма.палет?"#f0f0f0":"#f7f7f7",cursor:"pointer",transition:"all .15s",userSelect:"none"}}>
                <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${форма.палет?"#000000":"#e4e4e4"}`,background:форма.палет?"#111111":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                  {форма.палет&&<span style={{color:"#fff",fontSize:13,fontWeight:700,lineHeight:1}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:форма.палет?"#000000":"#000000"}}>📦 Палетна стока</div>
                  <div style={{fontSize:12,color:"#999999",marginTop:1}}>Печалбата се смята спрямо цената на палета</div>
                </div>
              </div>
            </div>
            <div className="modal-ftr" style={{justifyContent:"space-between"}}>
              {!нова&&<button className="btn btn-red" onClick={()=>изтрий(форма.id)}>Изтрий</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button className="btn btn-gray" onClick={()=>{setSM(false);setСкК(null);}}>Отказ</button>
                <button className="btn btn-blue" onClick={()=>запази({...форма,цд:+форма.цд,цп:+форма.цп,нал:+форма.нал,праг:+форма.праг})}>
                  {нова?"Добави стоката":"Запази"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN ДОСТАВКА ── */}
      {достАктив&&достФ&&(
        <div style={{position:"fixed",inset:0,background:"#f7f7f7",zIndex:100,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Горна лента — компактна, всичко на един ред */}
          <div style={{background:"#f7f7f7",borderBottom:"1px solid #e8e8e8",padding:"10px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button className="btn btn-gray btn-sm" onClick={затвориДост} style={{flexShrink:0}}>← Назад</button>
            <div style={{fontSize:14,fontWeight:700,color:"#000000",flexShrink:0}}>
              {достФ.id?"Доставка #"+достФ.id:"Нова доставка"}
            </div>

            {/* Доставчик */}
            {достФ.статус==="чакаща"
              ? <select className="inp inp-sm" value={достФ.доставчик_id||""}
                  style={{width:160,flexShrink:0}}
                  onChange={e=>{const д=доставчици.find(д=>д.id===+e.target.value);обновиДостЗаглавие("доставчик_id",+e.target.value);обновиДостЗаглавие("доставчик_ime",д?.ime||"");}}>
                  {доставчици.map(д=><option key={д.id} value={д.id}>{д.ime}</option>)}
                </select>
              : <span style={{fontSize:13,fontWeight:600,color:"#000000",flexShrink:0}}>{достФ.доставчик_ime}</span>
            }

            {/* Дата */}
            {достФ.статус==="чакаща"
              ? <input className="inp inp-sm" type="date" value={достФ.дата||""} style={{width:140,flexShrink:0}}
                  onChange={e=>обновиДостЗаглавие("дата",e.target.value)}/>
              : <span className="M" style={{fontSize:12,color:"#999999",flexShrink:0}}>{достФ.дата}</span>
            }

            {/* Бележка */}
            {достФ.статус==="чакаща"
              ? <input className="inp inp-sm" placeholder="Палет №, фактура…" value={достФ.бележка||""} style={{width:160,flexShrink:0}}
                  onChange={e=>обновиДостЗаглавие("бележка",e.target.value)}/>
              : <span style={{fontSize:12,color:"#999999",flexShrink:0}}>{достФ.бележка}</span>
            }

            {/* Обща цена на палета */}
            {достФ.статус==="чакаща"
              ? <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <span style={{fontSize:12,color:"#555555",fontWeight:600,whiteSpace:"nowrap"}}>Цена на палета:</span>
                  <input className="inp inp-sm M" type="number" min="0" step="0.01"
                    placeholder="0.00"
                    value={достФ.обща_цена||""}
                    style={{width:110,textAlign:"right",fontWeight:700,
                      borderColor:+достФ.обща_цена>0?"#000000":"#e4e4e4",
                      boxShadow:"none"}}
                    onChange={e=>setДФ(prev=>({...prev,обща_цена:e.target.value}))}
                    onBlur={e=>обновиДостЗаглавие("обща_цена",+e.target.value)}/>
                  <span style={{fontSize:12,color:"#555555"}}>€</span>
                </div>
              : <div style={{flexShrink:0}}>
                  <span style={{fontSize:12,color:"#999999"}}>Платено: </span>
                  <span className="M" style={{fontSize:14,fontWeight:800,color:"#000000"}}>{f2(достФ.обща_цена||0)} €</span>
                </div>
            }

            {/* Статус badge */}
            {достФ.статус==="приета"&&<span className="tag" style={{background:"#f0f0f0",color:"#000000",flexShrink:0}}>✓ Приета</span>}
            {достФ.статус==="отказана"&&<span className="tag" style={{background:"rgba(156,163,175,.1)",color:"#999999",flexShrink:0}}>✕ Отказана</span>}

            {/* Действия */}
            <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:"auto"}}>
              {достФ.статус==="чакаща"&&достФ.id&&(
                <button className="btn btn-red btn-sm" onClick={откажиДост}>✕ Откажи</button>
              )}
              {достФ.статус==="чакаща"&&достРедове.length>0&&(
                <>
                  {сървИнфо&&(
                    <button className="btn btn-gray btn-sm" onClick={()=>setДТМ(true)} style={{position:"relative",fontSize:15}} title="Свържи телефон за сканиране">
                      📱{последенБар&&достАктив&&<span style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:"#000000",border:"2px solid #f7f7f7"}}/>}
                    </button>
                  )}
                  <button className="btn btn-green"
                    style={{padding:"9px 18px",fontSize:14,fontWeight:700,
                      opacity:+достФ.обща_цена>0?1:.5}}
                    onClick={приемиДост} disabled={достСпасяване}>
                    {достСпасяване?"⏳ Записване…":`✓ Приеми · ${достРедове.length} арт.`}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Средна зона — 2 колони: сканиране | списък */}
          <div style={{flex:1,display:"grid",gridTemplateColumns:"340px 1fr",overflow:"hidden",gap:0}}>

            {/* Лява колона — търсене и сканиране */}
            <div style={{background:"#ffffff",borderRight:"1px solid #e8e8e8",display:"flex",flexDirection:"column",padding:16,gap:12,overflow:"hidden"}}>

              {достФ.статус==="чакаща"&&(
                <>
                  {/* Scan/Search поле — автофокус */}
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#999999",fontSize:16,pointerEvents:"none"}}>⌕</span>
                    <input
                      ref={достСканRef}
                      className="inp"
                      placeholder="Сканирай или търси артикул…"
                      value={достРедТърс}
                      onChange={e=>{setДРТ(e.target.value);setДРДД(true);}}
                      onKeyDown={e=>{
                        if(e.key==="Escape"){setДРТ("");setДРДД(false);}
                        if(e.key==="Enter"&&предлДост.length===1) добавиРед(предлДост[0]);
                      }}
                      style={{paddingLeft:32,fontSize:15,padding:"11px 12px 11px 32px"}}
                    />
                    {достРедТърс&&<button onClick={()=>{setДРТ("");setДРДД(false);достСканRef.current?.focus();}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#999999",cursor:"pointer",fontSize:18}}>✕</button>}
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
                    <button className="btn btn-gray" style={{fontSize:14}} onClick={()=>setДКМ(true)}>
                      📷 Камера
                    </button>
                    {сървИнфо&&(
                      <button className="btn btn-gray" style={{fontSize:15,position:"relative"}} onClick={()=>setДТМ(true)} title="Телефон/QR скенер">
                        📱{последенБар&&достАктив&&<span style={{position:"absolute",top:5,right:5,width:7,height:7,borderRadius:"50%",background:"#000000",border:"2px solid #f7f7f7"}}/>}
                      </button>
                    )}
                  </div>

                  {/* Dropdown резултати */}
                  {достРедДД&&предлДост.length>0&&(
                    <div style={{flex:1,overflowY:"auto",border:"1px solid #e8e8e8",borderRadius:8,overflow:"hidden"}}>
                      {предлДост.map(s=>(
                        <div key={s.id} className="dd-row" style={{borderBottom:"1px solid #e8e8e8"}} onClick={()=>добавиРед(s)}>
                          <div style={{width:32,height:32,borderRadius:7,background:ватЦ(s.кат)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ватИ(s.кат)}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.ime}</div>
                            <div style={{fontSize:11,color:"#555555"}}>{s.код} · нал: {s.нал} {s.мерна}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div className="M" style={{fontSize:12,fontWeight:600}}>{f2(s.цд)} €</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Подсказка */}
                  {!достРедТърс&&(
                    <div style={{textAlign:"center",color:"#cccccc",fontSize:12,marginTop:8}}>
                      <div style={{fontSize:28,marginBottom:6}}>📦</div>
                      Сканирай баркод или търси по наименование
                    </div>
                  )}
                </>
              )}

              {достФ.статус==="приета"&&(
                <div style={{textAlign:"center",color:"#999999",fontSize:13,padding:"20px 0"}}>
                  <div style={{fontSize:32,marginBottom:8}}>✅</div>
                  Доставката е приета на<br/>
                  <span className="M" style={{fontSize:12}}>{достФ.приета_на?new Date(достФ.приета_на).toLocaleString("bg",{timeZone:EET}):"—"}</span>
                </div>
              )}
            </div>

            {/* Дясна колона — списък артикули */}
            <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Хедър на таблицата */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 140px 100px 50px",background:"#ffffff",borderBottom:"1px solid #e8e8e8",flexShrink:0}}>
                {["Артикул","Категория","Количество",""].map((h,i)=>(
                  <div key={i} className="th" style={{textAlign:["Количество"].includes(h)?"right":"left"}}>{h}</div>
                ))}
              </div>

              {/* Редове */}
              <div style={{flex:1,overflowY:"auto"}}>
                {достРедове.length===0?(
                  <div style={{padding:"48px 20px",textAlign:"center",color:"#999999",fontSize:14}}>
                    <div style={{fontSize:36,marginBottom:10,opacity:.3}}>📋</div>
                    Добави артикули от лявата страна
                  </div>
                ):достРедове.map((р,idx)=>(
                  <div key={р.id} style={{display:"grid",gridTemplateColumns:"1fr 140px 100px 50px",padding:"8px 14px",borderBottom:"1px solid #e8e8e8",alignItems:"center",background:idx%2===0?"#ffffff":"#f7f7f7"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{р.стока_ime}</div>
                      <div className="M" style={{fontSize:11,color:"#555555"}}>{р.стока_код}</div>
                    </div>
                    <div><span className="chip" style={{background:"#f0f0f0",color:"#000000",fontSize:11}}><span style={{color:ватЦ(р.стока_кат),fontSize:9}}>●</span> {р.стока_кат}</span></div>
                    <div style={{textAlign:"right"}}>
                      {достФ.статус==="чакаща"
                        ?<input className="inp M inp-sm" type="number" min=".1" step=".1" value={р.кол}
                            onChange={e=>промениРед(р.id,"кол",e.target.value)}
                            onBlur={e=>запазиРед(р.id,"кол",e.target.value)}
                            style={{textAlign:"center",fontWeight:700,width:70,padding:"4px 6px"}}/>
                        :<span className="M" style={{fontWeight:700}}>{р.кол} {р.стока_мерна}</span>
                      }
                    </div>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      {достФ.статус==="чакаща"
                        ?<button className="btn btn-red btn-icon btn-sm" onClick={()=>изтрийРед(р.id)} style={{fontSize:11}}>✕</button>
                        :<span className="M" style={{fontSize:11,color:"#000000",fontWeight:700}}>{f2(р.цд)} €</span>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Тотал лента долу */}
              {достРедове.length>0&&(
                <div style={{borderTop:"2px solid #e4e4e4",padding:"10px 14px",background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                  <span className="M" style={{fontSize:12,fontWeight:700,color:"#000000"}}>
                    {достРедове.length} арт. · {достРедове.reduce((a,р)=>a+р.кол,0).toFixed(0)} бр. общо
                  </span>
                  {+достФ.обща_цена>0
                    ? <span className="M" style={{fontSize:14,fontWeight:800,color:"#000000"}}>Цена палет: {f2(+достФ.обща_цена)} €</span>
                    : <span style={{fontSize:12,color:"#d97706",fontWeight:600}}>⚠ Въведи цената на палета</span>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Камера в доставка */}
      {достКамМ&&<CamModal onScan={handleScanДост} onClose={()=>setДКМ(false)}/>}
      {/* Телефон/QR скенер в доставка */}
      {достТелМ&&сървИнфо&&<QRPanel url={сървИнфо.url} onClose={()=>setДТМ(false)}/>}

      {/* ── МОДАЛ ОСНОВНА КАТЕГОРИЯ ── */}
      {катМод&&катФ&&!катФ.родител_id&&(
        <div className="overlay" onClick={()=>setКМод(false)}>
          <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>{новКат?"Нова основна категория":"Редактирай категория"}</div>
              <button className="btn btn-gray btn-sm" onClick={()=>setКМод(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div>
                <span className="lbl">Наименование</span>
                <input className="inp" placeholder="Напр. Климатици" value={катФ.ime} onChange={e=>setКФ(f=>({...f,ime:e.target.value}))} autoFocus/>
              </div>
              <div>
                <span className="lbl">Цвят</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
                  {ЦВЕТОВЕ.map(цв=>(<div key={цв} className={`swatch${катФ.цв===цв?" sel":""}`} style={{background:цв}} onClick={()=>setКФ(f=>({...f,цв}))}/>))}
                </div>
              </div>
              <div>
                <span className="lbl">Иконка</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4,maxHeight:160,overflowY:"auto"}}>
                  {ИКОНИ.map(ico=>(<div key={ico} className={`ico-btn${катФ.ico===ico?" sel":""}`} onClick={()=>setКФ(f=>({...f,ico}))}>{ico}</div>))}
                </div>
              </div>
              {катФ.ime&&(
                <div style={{padding:"11px 14px",background:"#f7f7f7",borderRadius:8,display:"flex",alignItems:"center",gap:12,border:"1px solid #e4e4e4"}}>
                  <div style={{width:38,height:38,borderRadius:9,background:катФ.цв+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{катФ.ico}</div>
                  <div style={{fontSize:14,fontWeight:700,color:"#000000"}}>{катФ.ime}</div>
                  <span style={{fontSize:11,color:"#999999",marginLeft:"auto"}}>Основна категория</span>
                </div>
              )}
            </div>
            <div className="modal-ftr" style={{justifyContent:"space-between"}}>
              {!новКат&&<button className="btn btn-red" onClick={()=>изтрийКат(катФ.id)}>Изтрий</button>}
              <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                <button className="btn btn-gray" onClick={()=>setКМод(false)}>Отказ</button>
                <button className="btn btn-blue" onClick={запазиКат} disabled={!катФ.ime?.trim()} style={{opacity:катФ.ime?.trim()?1:.4}}>
                  {новКат?"Добави":"Запази"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── МОДАЛ ПОДКАТЕГОРИЯ ── */}
      {катМод&&катФ&&катФ.родител_id&&(()=>{
        const родител = основниКат.find(к=>к.id===катФ.родител_id);
        return(
          <div className="overlay" onClick={()=>setКМод(false)}>
            <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
              <div className="modal-hdr">
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {родител&&<span style={{fontSize:13,color:"#999999",display:"flex",alignItems:"center",gap:4}}>{родител.ico} {родител.ime} <span style={{color:"#d4d4d4"}}>›</span></span>}
                  <div style={{fontSize:15,fontWeight:700}}>{новКат?"Нова подкатегория":"Редактирай подкатегория"}</div>
                </div>
                <button className="btn btn-gray btn-sm" onClick={()=>setКМод(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div>
                  <span className="lbl">Наименование</span>
                  <input className="inp" placeholder="Напр. Сплит климатици" value={катФ.ime} onChange={e=>setКФ(f=>({...f,ime:e.target.value}))} autoFocus/>
                </div>
                <div>
                  <span className="lbl">Цвят</span>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
                    {ЦВЕТОВЕ.map(цв=>(<div key={цв} className={`swatch${катФ.цв===цв?" sel":""}`} style={{background:цв}} onClick={()=>setКФ(f=>({...f,цв}))}/>))}
                  </div>
                </div>
                <div>
                  <span className="lbl">Иконка</span>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4,maxHeight:160,overflowY:"auto"}}>
                    {ИКОНИ.map(ico=>(<div key={ico} className={`ico-btn${катФ.ico===ico?" sel":""}`} onClick={()=>setКФ(f=>({...f,ico}))}>{ico}</div>))}
                  </div>
                </div>
                {катФ.ime&&(
                  <div style={{padding:"11px 14px",background:"#f7f7f7",borderRadius:8,display:"flex",alignItems:"center",gap:12,border:"1px solid #e4e4e4",borderLeft:`3px solid ${родител?.цв||"#e4e4e4"}`}}>
                    <div style={{width:38,height:38,borderRadius:9,background:катФ.цв+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{катФ.ico}</div>
                    <div>
                      {родител&&<div style={{fontSize:11,color:"#999999",marginBottom:2}}>{родител.ico} {родител.ime}</div>}
                      <div style={{fontSize:14,fontWeight:700,color:"#000000"}}>{катФ.ime}</div>
                    </div>
                    <span style={{fontSize:11,color:"#999999",marginLeft:"auto"}}>Подкатегория</span>
                  </div>
                )}
              </div>
              <div className="modal-ftr" style={{justifyContent:"space-between"}}>
                {!новКат&&<button className="btn btn-red" onClick={()=>изтрийКат(катФ.id)}>Изтрий</button>}
                <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
                  <button className="btn btn-gray" onClick={()=>setКМод(false)}>Отказ</button>
                  <button className="btn btn-blue" onClick={запазиКат} disabled={!катФ.ime?.trim()} style={{opacity:катФ.ime?.trim()?1:.4}}>
                    {новКат?"Добави":"Запази"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}