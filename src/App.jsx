import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

// ─── QR ПАНЕЛ ─────────────────────────────────────────────────────────────────
function QRPanel({ url, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:16,padding:28,width:310,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}>
        <div style={{fontSize:18,fontWeight:800,marginBottom:4,color:"#111827"}}>📱 Свържи телефона</div>
        <div style={{fontSize:13,color:"#6b7280",marginBottom:18,lineHeight:1.5}}>Сканирай QR кода с камерата на телефона за да отвориш баркод скенера</div>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=111827&margin=10`}
          alt="QR" style={{width:200,height:200,borderRadius:10,border:"1px solid #e5e7eb",marginBottom:16}}/>
        <div style={{background:"#f9fafb",borderRadius:8,padding:"10px 12px",marginBottom:16,fontFamily:"monospace",fontSize:12,color:"#374151",wordBreak:"break-all",border:"1px solid #e5e7eb",userSelect:"all"}}>{url}</div>
        <div style={{fontSize:12,color:"#9ca3af",marginBottom:18,lineHeight:1.5}}>📶 Компютърът и телефонът трябва да са на <b>един Wi-Fi</b></div>
        <button onClick={onClose} style={{width:"100%",padding:"11px",background:"#1d4ed8",color:"#fff",border:"none",borderRadius:9,fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>Затвори</button>
      </div>
    </div>
  );
}

// ─── НАЧАЛНИ КАТЕГОРИИ (редактируеми) ────────────────────────────────────────
const КАТ_ИНИ = [
  { id:1,  ime:"Климатици",    цв:"#1d4ed8", ico:"❄️"  },
  { id:2,  ime:"Телевизори",   цв:"#6d28d9", ico:"📺"  },
  { id:3,  ime:"Телефони",     цв:"#be185d", ico:"📱"  },
  { id:4,  ime:"Компютри",     цв:"#0e7490", ico:"💻"  },
  { id:5,  ime:"Бяла техника", цв:"#374151", ico:"🫙"  },
  { id:6,  ime:"Малки уреди",  цв:"#9a3412", ico:"🔌"  },
  { id:7,  ime:"Осветление",   цв:"#92400e", ico:"💡"  },
  { id:8,  ime:"Инструменти",  цв:"#3b5e1a", ico:"🔧"  },
  { id:9,  ime:"Отопление",    цв:"#991b1b", ico:"🔥"  },
  { id:10, ime:"Бани",         цв:"#155e75", ico:"🚿"  },
  { id:11, ime:"Домашни",      цв:"#14532d", ico:"🏠"  },
  { id:12, ime:"Градина",      цв:"#166534", ico:"🌿"  },
  { id:13, ime:"Ел. материали",цв:"#4c1d95", ico:"⚡"  },
];

const ИКОНИ = ["❄️","📺","📱","💻","🫙","🔌","💡","🔧","🔥","🚿","🏠","🌿","⚡","🛒","🧹","🪑","🛋","🪟","🚪","🔑","📦","🧰","🪛","🔩","🪝","💈","🧲","🎛","📡","🖥","🖨","⌨️","🖱","📷","📞","☎️","📟","🔋","🔌","💽","💿","📀"];
const ЦВЕТОВЕ = ["#1d4ed8","#6d28d9","#be185d","#0e7490","#374151","#9a3412","#92400e","#3b5e1a","#991b1b","#155e75","#14532d","#166534","#4c1d95","#0f766e","#b45309","#1e40af","#7c2d12","#134e4a"];
const МЕРНИ  = ["бр","к-т","м","м²","л","кг","ролка","пакет"];

// Стоките се зареждат от Supabase

// ─── UTILS ────────────────────────────────────────────────────────────────────
const стат = (н,п) => н<=0?"изч":н<=Math.floor(п/2)?"крит":н<=п?"ниск":"добр";
const сЦ   = s => ({добр:"#15803d",ниск:"#b45309",крит:"#dc2626",изч:"#9ca3af"}[s]||"#9ca3af");
const сФ   = s => ({добр:"rgba(21,128,61,.08)",ниск:"rgba(180,83,9,.08)",крит:"rgba(220,38,38,.08)",изч:"rgba(156,163,175,.08)"}[s]);
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
const toEetЧас  = (str) => new Date(str).toLocaleTimeString("bg",{timeZone:EET,hour:"2-digit",minute:"2-digit",hour12:false});
const toEetМ    = (str) => new Date(str).toLocaleDateString("sv",{timeZone:EET}).slice(0,7);

const csvExp = (rows,name) => {
  const BOM = "\uFEFF";
  const csv = BOM + rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})),download:name}).click();
};

// ─── SCANNER HOOK ─────────────────────────────────────────────────────────────
function useScanner(onResult) {
  const vRef=useRef(); const sRef=useRef(); const rRef=useRef(); const aRef=useRef(false);
  const [ready,setRdy]=useState(false); const [err,setErr]=useState(null);
  const stop=useCallback(()=>{
    aRef.current=false;
    if(rRef.current) cancelAnimationFrame(rRef.current);
    sRef.current?.getTracks().forEach(t=>t.stop());
    sRef.current=null; setRdy(false);
  },[]);
  const start=useCallback(async()=>{
    setErr(null); aRef.current=true;
    try {
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280}}});
      sRef.current=s;
      const v=vRef.current; if(!v){stop();return;}
      v.srcObject=s; await v.play(); setRdy(true);
      if(window.BarcodeDetector){
        const det=new window.BarcodeDetector({formats:["ean_13","ean_8","code_128","code_39","qr_code","upc_a","upc_e"]});
        const loop=async()=>{
          if(!aRef.current) return;
          try{const r=await det.detect(v);if(r.length){onResult(r[0].rawValue);stop();return;}}catch(_){}
          rRef.current=requestAnimationFrame(loop);
        };
        loop();
      } else { setErr("MANUAL"); }
    } catch(e){ setErr(e.name==="NotAllowedError"?"DENIED":"ERROR"); aRef.current=false; }
  },[onResult,stop]);
  useEffect(()=>()=>stop(),[stop]);
  return {vRef,ready,err,start,stop};
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;background:#f0f0f0}
  body{font-family:'Geist',system-ui,sans-serif;color:#111827;overflow:hidden}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:#9ca3af}
  .inp{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-family:inherit;font-size:13.5px;color:#111827;background:#fff;outline:none;transition:border-color .15s}
  .inp:focus{border-color:#1d4ed8;box-shadow:0 0 0 3px rgba(29,78,216,.1)}
  .inp::placeholder{color:#9ca3af}
  .inp-sm{padding:7px 10px;font-size:13px}
  select.inp{cursor:pointer}
  .btn{cursor:pointer;border:none;font-family:inherit;font-weight:600;border-radius:8px;transition:all .13s;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:13.5px}
  .btn:hover{filter:brightness(.95)}
  .btn:active{transform:scale(.98)}
  .btn-blue{background:#1d4ed8;color:#fff;padding:9px 16px}
  .btn-blue:hover{background:#1e40af;filter:none}
  .btn-gray{background:#f3f4f6;color:#374151;padding:9px 14px}
  .btn-gray:hover{background:#e5e7eb;filter:none}
  .btn-red{background:#fef2f2;color:#dc2626;padding:9px 14px}
  .btn-red:hover{background:#fee2e2;filter:none}
  .btn-green{background:#15803d;color:#fff;padding:9px 14px}
  .btn-green:hover{background:#166534;filter:none}
  .btn-sm{padding:6px 12px;font-size:12.5px}
  .btn-icon{padding:7px 10px;font-size:14px}
  .card{background:#fff;border-radius:10px;border:1px solid #e5e7eb}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;transition:background .12s;border:none;background:none;font-family:inherit;font-size:13.5px;font-weight:500;color:#6b7280;width:100%;text-align:left}
  .nav-item:hover{background:#f3f4f6;color:#111827}
  .nav-item.active{background:#eff6ff;color:#1d4ed8;font-weight:600}
  .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:11.5px;font-weight:600}
  .chip{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:11.5px;font-weight:500}
  .M{font-family:"Geist Mono",monospace}
  .table-row{display:grid;align-items:center;padding:10px 14px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background .1s}
  .table-row:hover{background:#fafafa}
  .table-row:last-child{border-bottom:none}
  .th{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;padding:8px 14px;background:#fafafa;border-bottom:1px solid #f3f4f6}
  .lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;margin-bottom:5px;display:block}
  .kpi-box{background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:14px 16px}
  .kpi-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;margin-bottom:4px}
  .kpi-value{font-size:22px;font-weight:800;letter-spacing:-.03em;font-family:"Geist Mono",monospace}
  .divider{height:1px;background:#f3f4f6;margin:0}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .15s ease both}
  @keyframes scanline{0%,100%{top:10%}50%{top:85%}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes toast{0%{opacity:0;transform:translateY(8px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0}}
  .toast{animation:toast 3s ease both;position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:12px 18px;border-radius:10px;font-size:13.5px;font-weight:600;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,.2)}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(3px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
  .modal{background:#fff;border-radius:14px;overflow:hidden;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
  .modal-hdr{padding:18px 22px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1}
  .modal-body{padding:20px 22px;display:flex;flex-direction:column;gap:14px}
  .modal-ftr{padding:14px 22px;border-top:1px solid #f3f4f6;display:flex;gap:8px;justify-content:flex-end}
  input[type=number]::-webkit-inner-spin-button{opacity:.3}
  .dd{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border-radius:10px;border:1px solid #e5e7eb;box-shadow:0 8px 32px rgba(0,0,0,.12);z-index:100;overflow:hidden;animation:fadeIn .1s ease}
  .dd-row{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;transition:background .1s;border-bottom:1px solid #f3f4f6}
  .dd-row:hover{background:#f9fafb}
  .dd-row:last-child{border-bottom:none}
  .swatch{width:22px;height:22px;border-radius:6px;cursor:pointer;border:2px solid transparent;transition:all .12s;flex-shrink:0}
  .swatch:hover{transform:scale(1.1)}
  .swatch.sel{border-color:#111827}
  .ico-btn{width:34px;height:34px;border-radius:7px;border:1.5px solid #e5e7eb;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .12s;background:#fff}
  .ico-btn:hover{border-color:#9ca3af;background:#f9fafb}
  .ico-btn.sel{border-color:#1d4ed8;background:#eff6ff}
`;

// ─── CAMERA MODAL ─────────────────────────────────────────────────────────────
function CamModal({onScan,onClose}){
  const [man,setMan]=useState("");
  const handleR=useCallback(c=>{if(c) onScan(c.trim());},[onScan]);
  const {vRef,ready,err,start,stop}=useScanner(handleR);
  useEffect(()=>{start();return stop;},[]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:16,overflow:"hidden",width:440,boxShadow:"0 24px 60px rgba(0,0,0,.5)"}}>
        <div style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f3f4f6"}}>
          <div style={{fontSize:15,fontWeight:700}}>📷 Сканирай баркод</div>
          <button className="btn btn-gray btn-sm" onClick={()=>{stop();onClose();}}>✕ Затвори</button>
        </div>
        <div style={{position:"relative",background:"#000",aspectRatio:"4/3"}}>
          <video ref={vRef} style={{width:"100%",height:"100%",objectFit:"cover"}} playsInline muted/>
          {ready&&!err&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{width:"55%",height:"60%",position:"relative"}}>
                {[[0,0],[0,1],[1,0],[1,1]].map(([y,x],i)=>(
                  <div key={i} style={{position:"absolute",...(y?{bottom:0}:{top:0}),...(x?{right:0}:{left:0}),width:24,height:24,
                    borderTop:!y?"3px solid #fff":"none",borderBottom:y?"3px solid #fff":"none",
                    borderLeft:!x?"3px solid #fff":"none",borderRight:x?"3px solid #fff":"none"}}/>
                ))}
                <div style={{position:"absolute",left:0,right:0,height:2,background:"rgba(255,255,255,.7)",borderRadius:1,animation:"scanline 1.8s ease-in-out infinite"}}/>
              </div>
            </div>
          )}
          {!ready&&!err&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
              <div style={{width:36,height:36,border:"3px solid rgba(255,255,255,.2)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
              <div style={{color:"rgba(255,255,255,.6)",fontSize:13}}>Стартиране…</div>
            </div>
          )}
          {err&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,padding:20}}>
              <div style={{fontSize:36}}>{err==="DENIED"?"🔒":"📷"}</div>
              <div style={{color:"#fff",fontSize:14,fontWeight:600,textAlign:"center"}}>{err==="DENIED"?"Камерата е заключена":"Въведи ръчно"}</div>
            </div>
          )}
        </div>
        <div style={{padding:"16px 20px"}}>
          <div style={{fontSize:12,color:"#9ca3af",marginBottom:8}}>Или въведи баркода ръчно:</div>
          <div style={{display:"flex",gap:8}}>
            <input className="inp" autoFocus={!!err} placeholder="5901234567890…" value={man}
              onChange={e=>setMan(e.target.value)} onKeyDown={e=>e.key==="Enter"&&man.trim()&&onScan(man.trim())}
              style={{fontFamily:"monospace",fontSize:14}}/>
            <button className="btn btn-blue" onClick={()=>man.trim()&&onScan(man.trim())}>ОК</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ГЛАВЕН КОМПОНЕНТ ─────────────────────────────────────────────────────────
export default function App(){
  // Данни
  const [стоки,  setSt]  = useState([]);
  const [движ,   setДв]  = useState([]);
  const [кат,    setКат] = useState(КАТ_ИНИ);
  const [зарежда,setЗар] = useState(true);

  // Зареди данни от Supabase при стартиране
  useEffect(()=>{
    async function зареди(показвайЗареждане=false){
      if(показвайЗареждане) setЗар(true);
      try {
        // Стоки
        const {data:стокиДата,error:еС} = await supabase.from("стоки").select("*").order("ime");
        if(еС) throw еС;
        if(стокиДата) setSt(стокиДата.map(r=>({...r,цд:+r.цд,цп:+r.цп,нал:+r.нал,праг:+r.праг})));
        // Категории
        const {data:катДата,error:еК} = await supabase.from("категории").select("*").order("ime");
        if(еК) throw еК;
        if(катДата?.length) setКат(катДата.map(r=>({id:r.id,ime:r.ime,цв:r.цв,ico:r.ico})));
        // Движения (последните 500) — Fix: sid от стока_id вместо null
        const {data:движДата,error:еД} = await supabase.from("движения").select("*").order("created_at",{ascending:false}).limit(500);
        if(еД) throw еД;
        if(движДата?.length) setДв(движДата.map(r=>({
          id:r.id, тип:r.тип, sid:r.стока_id!=null?+r.стока_id:null,
          ime:r.стока_ime, кат:r.стока_кат, код:r.стока_код,
          кол:+r.кол, цп:+r.цп, цд:+r.цд, дата:r.created_at
        })));
      } catch(грешка) {
        console.error("Supabase грешка:", грешка);
        if(показвайЗареждане) alert("Грешка при зареждане от базата: " + (грешка.message||String(грешка)));
      } finally {
        if(показвайЗареждане) setЗар(false);
      }
    }

    // Първо зареждане
    зареди(true);

    // Realtime — основен механизъм за синхрон между устройства
    const канал = supabase.channel("sync")
      .on("postgres_changes",{event:"*",schema:"public",table:"стоки"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"категории"},()=>зареди())
      .on("postgres_changes",{event:"*",schema:"public",table:"движения"},()=>зареди())
      .subscribe();

    // Fallback polling на 15с — само ако Realtime не е активиран в Supabase Dashboard
    const интервал = setInterval(()=>зареди(), 15000);

    return ()=>{
      supabase.removeChannel(канал);
      clearInterval(интервал);
    };
  },[]);

  // Sync refs при промяна на state — fix за stale closure в callbacks
  useEffect(()=>{ стокиRef.current = стоки; },[стоки]);
  useEffect(()=>{ катRef.current   = кат;   },[кат]);

  // Слушай за баркодове от телефона (само в Electron)
  useEffect(()=>{
    if(!window.electron) return;
    // Вземи IP адреса на сървъра
    window.electron.getServerInfo().then(info=>{
      if(info) setSI(info);
    }).catch(()=>{});
    // Слушай за входящи баркодове
    window.electron.onBarcode(code=>{
      setПБ(code);
      setТМ(false);
      const намерена = стокиRef.current.find(s=>s.код.toUpperCase()===code.toUpperCase());
      if(намерена){
        // Стоката е намерена → директно в продажба
        setTab("sale");
        setИС(намерена);
        setЦ(String(намерена.цп));
        setКол("1");
        setДД(false);
        setТ("");
        // Фокус на количеството след малко закъснение
        setTimeout(()=>{ try{ document.querySelector('input[type="number"]')?.select(); }catch(_){} }, 150);
      } else {
        // Не намерена → отвори форма за нова стока
        setФ({id:null,код:code,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2});
        setН(true); setСкК(code); setSM(true);
      }
    });
    return ()=>{ if(window.electron?.offBarcode) window.electron.offBarcode(); };
  },[]);   // eslint-disable-line

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
  const колRef   = useRef();
  const стокиRef = useRef([]);   // винаги актуални стоки — fix за stale closure
  const катRef   = useRef([]);   // винаги актуални категории

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
  const [телМ,   setТМ]   = useState(false);   // QR панел
  const [сървИнфо,setSI]  = useState(null);    // {ip, port, url}
  const [последенБар,setПБ]= useState(null);   // последно сканиран код

  // Категории
  const [катМод, setКМод] = useState(false);
  const [катФ,   setКФ]   = useState(null);   // редактирана категория
  const [новКат, setНК]   = useState(false);

  // Отчети
  // История
  const [хТърс,  setХТ]   = useState("");
  const [хДата,  setХД]   = useState("all");  // all | today | week | month
  const [хКат,   setХК]   = useState("Всички");

  const [отчМ,   setОМ]   = useState(()=>{
    const d=new Date(getNow().getFullYear(),getNow().getMonth(),1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });

  // ── Derived ──────────────────────────────────────────────────────────────────
  const катМап = useMemo(()=>Object.fromEntries(кат.map(к=>[к.ime,к])),[кат]);
  const ватЦ   = ime => катМап[ime]?.цв||"#374151";
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

  // Bug 5 fix: използваме само реални данни от Supabase, без ДЕМО
  const всДвиж = useMemo(()=>движ,[движ]);

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

  // История — филтрирани движения
  const историяФ = useMemo(()=>{
    const днес = eetДата();
    const преди7 = eetДата(new Date(Date.now()-7*24*60*60*1000));
    const преди30 = eetДата(new Date(Date.now()-30*24*60*60*1000));
    const т = хТърс.toLowerCase().trim();
    return всДвиж.filter(д=>{
      const дата = toEetДата(д.дата);
      const датаОК = хДата==="all" || (хДата==="today"&&дата===днес) || (хДата==="week"&&дата>=преди7) || (хДата==="month"&&дата>=преди30);
      const търсОК = !т || (д.ime||"").toLowerCase().includes(т) || (д.код||"").toLowerCase().includes(т);
      const катОК  = хКат==="Всички" || д.кат===хКат;
      return датаОК && търсОК && катОК;
    });
  },[всДвиж,хТърс,хДата,хКат]);

  const хПр = историяФ.reduce((a,д)=>a+д.кол*д.цп,0);
  const хПч = историяФ.reduce((a,д)=>a+д.кол*(д.цп-д.цд),0);

  const достМ=useMemo(()=>{const r={};const _н=getNow();for(let i=5;i>=0;i--){const d=new Date(_н.getFullYear(),_н.getMonth()-i,1);const к=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;r[к]=d.toLocaleString("bg",{month:"long",year:"numeric"});}return r;},[]);

  // ── Продажба ──
  const изберСт = useCallback(s=>{setИС(s);setЦ(String(s.цп));setКол("1");setТ("");setДД(false);setTimeout(()=>колRef.current?.select(),50);},[]);
  const продай = useCallback(async()=>{
    if(!избСт||+кол<=0) return;
    const цена       = +ц||избСт.цп;
    const количество = +кол;

    // Оптимистична UI промяна — веднага, без да чакаме Supabase
    setSt(prev=>prev.map(s=>s.id===избСт.id?{...s,нал:Math.max(0,s.нал-количество)}:s));
    стокиRef.current = стокиRef.current.map(s=>s.id===избСт.id?{...s,нал:Math.max(0,s.нал-количество)}:s);

    // Добави в локална история
    const движение = {id:Date.now(),тип:"изх",sid:+избСт.id,ime:избСт.ime,кат:избСт.кат,код:избСт.код,кол:количество,цп:цена,цд:избСт.цд,дата:eetИСО()};
    setДв(prev=>[движение,...prev]);

    // Запази в Supabase — атомарен decrement предотвратява race condition при 2 устройства
    const [двRes, стRes] = await Promise.all([
      supabase.from("движения").insert({
        тип:"изх", стока_id:+избСт.id, стока_код:избСт.код, стока_ime:избСт.ime,
        стока_кат:избСт.кат, кол:количество, цп:цена, цд:избСт.цд
      }),
      supabase.rpc("намали_наличност", {стока_id_п:+избСт.id, количество_п:количество})
    ]);
    if(двRes.error) console.error("Грешка движение:", двRes.error);
    if(стRes.error) console.error("Грешка наличност:", стRes.error);

    setFl(`✓ ${избСт.ime} ×${кол} · ${f2(количество*цена)} €`);
    setИС(null); setКол("1"); setЦ(""); setBел("");
    setTimeout(()=>setFl(null),2800);
  },[избСт,кол,ц,бел]);

  // ── Камера ──
  const handleScan=useCallback(код=>{
    setКМ(false);
    const същ=стокиRef.current.find(s=>s.код.toUpperCase()===код.toUpperCase());
    setФ(същ?{...същ}:{id:null,код,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2});
    setН(!същ); setСкК(код); setSM(true);
  },[]);

  // Сканиране в раздел ПРОДАЖБА — избира стока за продажба
  const handleScanSale=useCallback(код=>{
    setКМ(false);
    const н=стокиRef.current.find(s=>s.код.toUpperCase()===код.toUpperCase());
    if(н){
      setИС(н); setЦ(String(н.цп)); setКол("1"); setДД(false); setТ("");
      setTimeout(()=>колRef.current?.select(),100);
    } else {
      setФ({id:null,код,ime:"",кат:катRef.current[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:1,праг:2});
      setН(true); setСкК(код); setSM(true);
    }
  },[]);

  // ── Стоки CRUD ──
  const отвНова = ()=>{setФ({id:null,код:"",ime:"",кат:кат[0]?.ime||"",мерна:"бр",цд:0,цп:0,нал:0,праг:2});setН(true);setСкК(null);setSM(true);};
  const запази = async u=>{
    if(нова){
      // Провери дали кодът вече съществува
      if(u.код){
        const {data:съществ} = await supabase.from("стоки").select("id").eq("код",u.код).maybeSingle();
        if(съществ){
          // Кодът съществува → редактирай вместо добавяй
          const {error} = await supabase.from("стоки").update({
            ime:u.ime,кат:u.кат,мерна:u.мерна,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг
          }).eq("id",съществ.id);
          if(error){ alert("Грешка: "+error.message); return; }
          setSt(prev=>prev.map(s=>s.id===съществ.id?{...u,id:съществ.id,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг}:s));
          setSM(false); setСкК(null);
          return;
        }
      }
      // Нов запис
      const {data,error} = await supabase.from("стоки").insert({
        код:u.код||"",ime:u.ime||"",кат:u.кат||"",мерна:u.мерна||"бр",
        цд:+u.цд||0,цп:+u.цп||0,нал:+u.нал||0,праг:+u.праг||2
      }).select().single();
      if(error){ alert("Грешка: "+error.message); return; }
      setSM(false); setСкК(null);
      if(data) setSt(prev=>[...prev,{...data,цд:+data.цд,цп:+data.цп,нал:+data.нал,праг:+data.праг}]);
      if(скКод && data){
        const нов={...data,цд:+data.цд,цп:+data.цп,нал:+data.нал,праг:+data.праг};
        setTab("sale"); setИС(нов);
        setЦ(String(нов.цп)); setКол("1"); setДД(false); setТ("");
        setTimeout(()=>колRef.current?.select(),100);
      }
    } else {
      const {error} = await supabase.from("стоки").update({
        код:u.код,ime:u.ime,кат:u.кат,мерна:u.мерна,
        цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг
      }).eq("id",u.id);
      if(error){ alert("Грешка: "+error.message); return; }
      setSM(false); setСкК(null);
      setSt(prev=>prev.map(s=>s.id===u.id?{...u,цд:+u.цд,цп:+u.цп,нал:+u.нал,праг:+u.праг}:s));
    }
  };
  const изтрий = async id=>{
    const {error} = await supabase.from("стоки").delete().eq("id",id);
    if(error){ alert("Грешка при изтриване: "+error.message); return; }
    setSM(false);
    setSt(prev=>prev.filter(s=>s.id!==id));
  };

  // ── Категории CRUD ──
  const отвКатНова = ()=>{setКФ({id:null,ime:"",цв:ЦВЕТОВЕ[0],ico:ИКОНИ[0]});setНК(true);setКМод(true);};
  const отвКатРед  = к=>{setКФ({...к});setНК(false);setКМод(true);};
  const запазиКат  = async()=>{
    if(!катФ?.ime?.trim()) return;
    if(новКат){
      const {data,error} = await supabase.from("категории").insert({ime:катФ.ime,цв:катФ.цв,ico:катФ.ico}).select().single();
      if(error){ alert("Грешка: "+error.message); return; }
      if(data) setКат(prev=>[...prev,data]);
    } else {
      const {error} = await supabase.from("категории").update({ime:катФ.ime,цв:катФ.цв,ico:катФ.ico}).eq("id",катФ.id);
      if(error){ alert("Грешка: "+error.message); return; }
      setКат(prev=>prev.map(к=>к.id===катФ.id?{...катФ}:к));
    }
    setКМод(false);
  };
  const изтрийКат = async id=>{
    const {error} = await supabase.from("категории").delete().eq("id",id);
    if(error){ alert("Грешка: "+error.message); return; }
    setКат(prev=>prev.filter(к=>к.id!==id));
    setКМод(false);
  };

  const exportМ=()=>{
    const h=[["Код","Наименование","Категория","Кол.","Ед.цена","Приход","Себест.","Печалба","Марж%"]];
    const р=продМ.map(р=>{const пч=р.пр-р.сб;const мр=р.пр>0?Math.round(пч/р.пр*100):0;return[р.код,р.ime,р.кат,р.кол,f2(р.пр/(р.кол||1)),f2(р.пр),f2(р.сб),f2(пч),`${мр}%`];});
    csvExp([...h,...р,[],["ОБЩО","","",продМ.reduce((a,р)=>a+р.кол,0),"",f2(мПр),f2(мСб),f2(мПч),`${мПр>0?Math.round(мПч/мПр*100):0}%`]],`отчет_${отчМ}.csv`);
  };

  const NAV=[
    {id:"sale",    ico:"⚡", lab:"Продажба"},
    {id:"stock",   ico:"📦", lab:"Стоки",  badge:крит},
    {id:"cats",    ico:"🏷",  lab:"Категории"},
    {id:"history", ico:"📋", lab:"История"},
    {id:"reports", ico:"📊", lab:"Отчети"},
  ];

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return(
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;600&display=swap" rel="stylesheet"/>

      {зарежда&&<div style={{position:"fixed",inset:0,background:"rgba(255,255,255,.9)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        <div style={{width:36,height:36,border:"3px solid #e5e7eb",borderTopColor:"#1d4ed8",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
        <div style={{fontSize:14,color:"#6b7280",fontWeight:500}}>Зареждане от Supabase…</div>
      </div>}
      {flash&&<div className="toast">{flash}</div>}
      {камМ&&<CamModal onScan={камРеж==="продажба"?handleScanSale:handleScan} onClose={()=>setКМ(false)}/>}
      {телМ&&сървИнфо&&<QRPanel url={сървИнфо.url} onClose={()=>setТМ(false)}/>}

      {/* ── Layout: Sidebar + Content ── */}
      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>

        {/* SIDEBAR */}
        <aside style={{width:220,flexShrink:0,background:"#fff",borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column",padding:"16px 12px"}}>
          {/* Logo */}
          <div style={{padding:"4px 8px 16px",borderBottom:"1px solid #f3f4f6",marginBottom:12}}>
            <div style={{fontSize:16,fontWeight:800,letterSpacing:"-.03em",color:"#111827"}}>🏪 ProStore</div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:2,fontFamily:"monospace"}}>Складова система</div>
          </div>

          {/* Nav */}
          <nav style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
            {NAV.map(н=>(
              <button key={н.id} className={`nav-item${tab===н.id?" active":""}`} onClick={()=>setTab(н.id)}>
                <span style={{fontSize:15}}>{н.ico}</span>
                <span style={{flex:1}}>{н.lab}</span>
                {н.badge>0&&<span style={{background:"#dc2626",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:10,minWidth:18,textAlign:"center"}}>{н.badge}</span>}
              </button>
            ))}
          </nav>

          {/* Категории в sidebar */}
          <div style={{borderTop:"1px solid #f3f4f6",paddingTop:12,marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#9ca3af",padding:"0 8px",marginBottom:6}}>Категории</div>
            <div style={{maxHeight:220,overflowY:"auto"}}>
              <button className={`nav-item${фКат==="Всички"?" active":""}`} onClick={()=>{setФК("Всички");setTab("stock");}}>
                <span style={{fontSize:13}}>⊞</span>Всички
                <span style={{marginLeft:"auto",fontSize:11,color:"#9ca3af",fontFamily:"monospace"}}>{стоки.length}</span>
              </button>
              {кат.map(к=>{const бр=стоки.filter(s=>s.кат===к.ime).length;return(
                <button key={к.id} className={`nav-item${фКат===к.ime?" active":""}`}
                  onClick={()=>{setФК(к.ime);setTab("stock");}}>
                  <span style={{fontSize:12}}>{к.ico}</span>
                  <span style={{flex:1,textAlign:"left"}}>{к.ime}</span>
                  <span style={{fontSize:11,color:"#9ca3af",fontFamily:"monospace"}}>{бр}</span>
                </button>
              );})}
            </div>
          </div>

          <div style={{borderTop:"1px solid #f3f4f6",paddingTop:10,marginTop:8,fontSize:11,color:"#9ca3af",display:"flex",alignItems:"center",gap:5,padding:"10px 8px 0"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#15803d"}}/>
            {стоки.length} арт · {кат.length} кат.
          </div>
        </aside>

        {/* MAIN */}
        <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",background:"#f8f9fa"}}>

          {/* Top bar */}
          <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"10px 24px",display:"flex",alignItems:"center",gap:10,flexShrink:0,minHeight:52}}>
            <div style={{fontSize:16,fontWeight:700,color:"#111827",marginRight:8}}>
              {NAV.find(н=>н.id===tab)?.ico} {NAV.find(н=>н.id===tab)?.lab}
            </div>
            {tab==="sale"&&(
              <div style={{fontFamily:"monospace",fontSize:12,color:"#9ca3af",marginLeft:"auto"}}>
                {new Date().toLocaleDateString("bg",{timeZone:EET,weekday:"short",day:"numeric",month:"long",year:"numeric"})}
              </div>
            )}
            {tab==="stock"&&(
              <>
                <div style={{position:"relative",flex:1,maxWidth:320}}>
                  <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontSize:14}}>⌕</span>
                  <input className="inp inp-sm" placeholder="Търси стока или код…" value={сТърс} onChange={e=>setСТ(e.target.value)} style={{paddingLeft:30}}/>
                </div>
                <select className="inp inp-sm" value={фКат} onChange={e=>setФК(e.target.value)} style={{width:160}}>
                  <option>Всички</option>
                  {кат.map(к=><option key={к.id}>{к.ime}</option>)}
                </select>
                {(фКат!=="Всички"||сТърс)&&<button className="btn btn-gray btn-sm" onClick={()=>{setФК("Всички");setСТ("");}}>✕</button>}
                <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                  <button className="btn btn-gray btn-sm" onClick={()=>{setКР("стоки");setКМ(true);}} title="Сканирай с камерата на компютъра">📷 Камера</button>
                  {сървИнфо&&<button className="btn btn-gray btn-sm" onClick={()=>setТМ(true)} title="Свържи телефон за сканиране" style={{position:"relative"}}>📱 Телефон{последенБар&&<span style={{position:"absolute",top:-4,right:-4,width:8,height:8,borderRadius:"50%",background:"#22c55e"}}/>}</button>}
                  <button className="btn btn-blue btn-sm" onClick={отвНова}>+ Нова стока</button>
                </div>
              </>
            )}
            {tab==="cats"&&(
              <div style={{marginLeft:"auto"}}>
                <button className="btn btn-blue btn-sm" onClick={отвКатНова}>+ Нова категория</button>
              </div>
            )}
            {tab==="history"&&(
              <>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontSize:13}}>⌕</span>
                  <input className="inp inp-sm" placeholder="Търси стока…" value={хТърс} onChange={e=>setХТ(e.target.value)} style={{paddingLeft:26,width:200}}/>
                </div>
                <select className="inp inp-sm" value={хКат} onChange={e=>setХК(e.target.value)} style={{width:150}}>
                  <option>Всички</option>
                  {кат.map(к=><option key={к.id}>{к.ime}</option>)}
                </select>
                <div style={{display:"flex",gap:4}}>
                  {[["all","Всички"],["today","Днес"],["week","7 дни"],["month","30 дни"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setХД(v)}
                      style={{padding:"6px 10px",border:`1.5px solid ${хДата===v?"#1d4ed8":"#e5e7eb"}`,borderRadius:7,background:хДата===v?"#1d4ed8":"#fff",color:хДата===v?"#fff":"#374151",cursor:"pointer",fontFamily:"inherit",fontSize:12.5,fontWeight:600,transition:"all .12s"}}>
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

          {/* Page content */}
          <div style={{flex:1,overflow:"auto",padding:20}}>

            {/* ══ ПРОДАЖБА ══ */}
            {tab==="sale"&&(
              <div className="fade-in" style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,height:"100%",alignItems:"start"}}>

                {/* Лява колона — форма */}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* Търсене + Скан бутони */}
                  <div style={{display:"flex",gap:8}}>
                    <div style={{position:"relative",flex:1}}>
                      <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#9ca3af",pointerEvents:"none"}}>⌕</span>
                      <input className="inp" placeholder="Търси стока по наименование или код…"
                        value={търс} onChange={e=>{setТ(e.target.value);setДД(true);setИС(null);}}
                        onFocus={()=>setДД(true)}
                        onKeyDown={e=>{if(e.key==="Escape"){setТ("");setДД(false);}if(e.key==="Enter"&&предл.length===1) изберСт(предл[0]);}}
                        style={{paddingLeft:34,fontSize:15,padding:"11px 12px 11px 34px",width:"100%"}}/>
                      {търс&&<button onClick={()=>{setТ("");setДД(false);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:18,padding:"2px"}}>✕</button>}
                    {показДД&&предл.length>0&&(
                      <div className="dd">
                        {предл.map(s=>{const цв=ватЦ(s.кат);const сt=стат(s.нал,s.праг);return(
                          <div key={s.id} className="dd-row" onClick={()=>изберСт(s)}>
                            <div style={{width:34,height:34,borderRadius:8,background:цв+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{ватИ(s.кат)}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.ime}</div>
                              <div style={{fontSize:11.5,color:"#9ca3af",marginTop:1}}>{s.код} · {s.кат}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div className="M" style={{fontSize:14,fontWeight:700}}>{f2(s.цп)} €</div>
                              <div className="M" style={{fontSize:11,color:сЦ(сt)}}>{s.нал} {s.мерна}</div>
                            </div>
                          </div>
                        );})}
                      </div>
                    )}
                  </div>
                    {/* Бутони за сканиране */}
                    <button className="btn btn-gray" title="Сканирай с камерата на компютъра"
                      onClick={()=>{setКР("продажба");setКМ(true);}}
                      style={{padding:"11px 14px",fontSize:18,flexShrink:0,borderRadius:9}}>
                      📷
                    </button>
                    {сървИнфо&&(
                      <button className="btn btn-gray" title="Свържи телефон за сканиране"
                        onClick={()=>setТМ(true)}
                        style={{padding:"11px 14px",fontSize:18,flexShrink:0,borderRadius:9,position:"relative"}}>
                        📱
                        {последенБар&&<span style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#22c55e",border:"2px solid #fff"}}/>}
                      </button>
                    )}
                  </div>

                  {/* Избрана стока */}
                  {избСт?(
                    <div className="card" style={{padding:18}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:16}}>
                        <div style={{width:44,height:44,borderRadius:10,background:ватЦ(избСт.кат)+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{ватИ(избСт.кат)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:700,color:"#111827"}}>{избСт.ime}</div>
                          <div style={{display:"flex",gap:8,alignItems:"center",marginTop:4,flexWrap:"wrap"}}>
                            <span className="M" style={{fontSize:11.5,color:"#9ca3af"}}>{избСт.код}</span>
                            <span className="chip" style={{background:ватЦ(избСт.кат)+"15",color:ватЦ(избСт.кат)}}>{избСт.кат}</span>
                            <span className="M" style={{fontSize:11.5,color:сЦ(стат(избСт.нал,избСт.праг)),fontWeight:600}}>{избСт.нал} {избСт.мерна} в склад</span>
                          </div>
                        </div>
                        <button onClick={()=>{setИС(null);setТ("");}} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:20,lineHeight:1,padding:"2px"}}>✕</button>
                      </div>

                      {/* Количество, цена, сума — три равни колони */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
                        <div>
                          <span className="lbl">Количество</span>
                          <input ref={колRef} className="inp M" type="number" min=".1" step=".1" value={кол}
                            onChange={e=>setКол(e.target.value)} onKeyDown={e=>e.key==="Enter"&&продай()}
                            style={{textAlign:"center",fontSize:22,fontWeight:800,padding:"10px 8px"}}/>
                        </div>
                        <div>
                          <span className="lbl">Цена (€)</span>
                          <input className="inp M" type="number" min="0" step=".01" value={ц}
                            onChange={e=>setЦ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&продай()}
                            style={{textAlign:"center",fontSize:22,fontWeight:800,padding:"10px 8px"}}/>
                        </div>
                        <div>
                          <span className="lbl">Сума</span>
                          <div className="inp M" style={{textAlign:"center",fontSize:22,fontWeight:800,padding:"10px 8px",background:"#f0fdf4",borderColor:"#bbf7d0",color:"#15803d",cursor:"default"}}>
                            {f2(+кол*(+ц||избСт.цп))} €
                          </div>
                        </div>
                      </div>

                      <div style={{marginBottom:14}}>
                        <span className="lbl">Бележка (незадълж.)</span>
                        <input className="inp" placeholder="Клиент, фактура №…" value={бел}
                          onChange={e=>setBел(e.target.value)} onKeyDown={e=>e.key==="Enter"&&продай()}/>
                      </div>

                      <button className="btn btn-blue" style={{width:"100%",padding:"13px",fontSize:15,borderRadius:10}}
                        onClick={продай} disabled={+кол<=0}>
                        ✓ Продай · {f2(+кол*(+ц||избСт.цп))} €
                      </button>
                    </div>
                  ):(
                    <div className="card" style={{padding:"28px 20px",textAlign:"center",border:"1.5px dashed #e5e7eb"}}>
                      <div style={{fontSize:32,marginBottom:10,opacity:.3}}>🔍</div>
                      <div style={{fontSize:14,color:"#9ca3af",fontWeight:500}}>Търси или избери стока от панела вдясно</div>
                      <div style={{fontSize:12,color:"#d1d5db",marginTop:4}}>Enter при един резултат — директно избира</div>
                      {сървИнфо&&(
                        <div style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                          <button onClick={()=>setТМ(true)}
                            style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,color:"#1d4ed8"}}>
                            📱 Свържи телефон за сканиране
                          </button>
                        </div>
                      )}
                      {последенБар&&(
                        <div style={{marginTop:10,padding:"8px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:"#15803d",fontFamily:"monospace",fontWeight:600}}>
                          ✓ Последно сканиран: {последенБар}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Последни продажби */}
                  {движ.length>0&&(
                    <div className="card">
                      <div style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:"#374151",borderBottom:"1px solid #f3f4f6"}}>Продажби днес</div>
                      {движ.slice(0,6).map(д=>(
                        <div key={д.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:"1px solid #f3f4f6"}}>
                          <span style={{fontSize:15}}>{ватИ(д.кат)}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{д.ime}</div>
                          </div>
                          <span className="M" style={{fontSize:12,color:"#9ca3af"}}>×{д.кол}</span>
                          <span className="M" style={{fontSize:13,fontWeight:700}}>{f2(д.кол*д.цп)} €</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Дясна колона — KPI + бързи стоки */}
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* KPI */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                      {е:"Приход (6м)",   с:`${fN(Math.round(оПр))} €`, а:"#111827"},
                      {е:"Печалба (6м)",  с:`${fN(Math.round(оПр-оСб))} €`, а:оПр>оСб?"#15803d":"#dc2626"},
                      {е:"Стоки",         с:стоки.length, а:"#111827"},
                      {е:"За зареждане", с:крит, а:крит>0?"#dc2626":"#15803d"},
                    ].map(к=>(
                      <div key={к.е} className="kpi-box">
                        <div className="kpi-label">{к.е}</div>
                        <div className="kpi-value" style={{fontSize:18,color:к.а}}>{к.с}</div>
                      </div>
                    ))}
                  </div>

                  {/* Бързи стоки */}
                  <div className="card">
                    <div style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:"#374151",borderBottom:"1px solid #f3f4f6"}}>Бързи стоки</div>
                    <div style={{maxHeight:420,overflowY:"auto"}}>
                      {стоки.slice(0,15).map(s=>{
                        const сt=стат(s.нал,s.праг); const цв=ватЦ(s.кат); const акт=избСт?.id===s.id;
                        return(
                          <div key={s.id} onClick={()=>изберСт(s)}
                            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:"1px solid #f3f4f6",cursor:"pointer",background:акт?"#eff6ff":"transparent",transition:"background .1s"}}
                            onMouseEnter={e=>!акт&&(e.currentTarget.style.background="#fafafa")}
                            onMouseLeave={e=>!акт&&(e.currentTarget.style.background="transparent")}>
                            <div style={{width:30,height:30,borderRadius:7,background:цв+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{ватИ(s.кат)}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12.5,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:акт?"#1d4ed8":"#111827"}}>{s.ime}</div>
                              <div className="M" style={{fontSize:10.5,color:сЦ(сt)}}>{s.нал} {s.мерна}</div>
                            </div>
                            <div className="M" style={{fontSize:13,fontWeight:700,color:акт?"#1d4ed8":"#111827",flexShrink:0}}>{f2(s.цп)} €</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ СТОКИ ══ */}
            {tab==="stock"&&(
              <div className="fade-in">
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"80px 1fr 130px 60px 110px 110px 70px 90px 90px 80px",gap:0}}>
                    {["Код","Наименование","Категория","М.ед","Дост.","Прод.","Марж","Нал.","Статус",""].map((h,i)=>(
                      <div key={i} className="th" style={{textAlign:["Дост.","Прод.","Марж","Нал."].includes(h)?"right":"left"}}>{h}</div>
                    ))}
                  </div>
                  <div style={{maxHeight:"calc(100vh - 180px)",overflowY:"auto"}}>
                    {видими.map(s=>{
                      const сt=стат(s.нал,s.праг); const м=мрж(s.цд,s.цп); const цв=ватЦ(s.кат);
                      return(
                        <div key={s.id} className="table-row"
                          style={{gridTemplateColumns:"80px 1fr 130px 60px 110px 110px 70px 90px 90px 80px",display:"grid"}}
                          onClick={()=>{setФ({...s});setН(false);setСкК(null);setSM(true);}}>
                          <div className="M" style={{fontSize:11,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis"}}>{s.код}</div>
                          <div style={{fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{s.ime}</div>
                          <div><span className="chip" style={{background:цв+"12",color:цв}}>{ватИ(s.кат)} {s.кат}</span></div>
                          <div style={{color:"#9ca3af",fontSize:12}}>{s.мерна}</div>
                          <div className="M" style={{textAlign:"right",fontSize:12,color:"#9ca3af"}}>{f2(s.цд)} €</div>
                          <div className="M" style={{textAlign:"right",fontWeight:700,fontSize:13}}>{f2(s.цп)} €</div>
                          <div className="M" style={{textAlign:"right",fontWeight:600,fontSize:12,color:м>=30?"#15803d":м>=15?"#b45309":"#dc2626"}}>{м}%</div>
                          <div className="M" style={{textAlign:"right",fontWeight:700,color:сЦ(сt)}}>{s.нал} <span style={{fontSize:10,color:"#9ca3af",fontWeight:400}}>{s.мерна}</span></div>
                          <div><span className="tag" style={{background:сФ(сt),color:сЦ(сt),fontSize:11}}>{сЛ(сt)}</span></div>
                          <div style={{display:"flex",gap:4,justifyContent:"flex-end"}}>
                            <button className="btn btn-gray btn-icon" style={{fontSize:12}} onClick={e=>{e.stopPropagation();setФ({...s});setН(false);setСкК(null);setSM(true);}}>✎</button>
                          </div>
                        </div>
                      );
                    })}
                    {видими.length===0&&<div style={{padding:"32px",textAlign:"center",color:"#9ca3af",fontSize:14}}>Няма намерени стоки.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* ══ КАТЕГОРИИ ══ */}
            {tab==="cats"&&(
              <div className="fade-in">
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
                  {кат.map(к=>{
                    const бр=стоки.filter(s=>s.кат===к.ime).length;
                    const крК=стоки.filter(s=>s.кат===к.ime&&стат(s.нал,s.праг)!=="добр").length;
                    return(
                      <div key={к.id} className="card" style={{padding:"16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"box-shadow .13s"}}
                        onClick={()=>отвКатРед(к)}
                        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"}
                        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                        <div style={{width:48,height:48,borderRadius:12,background:к.цв+"15",border:`2px solid ${к.цв}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{к.ico}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:700,color:"#111827",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{к.ime}</div>
                          <div style={{display:"flex",gap:8,marginTop:3}}>
                            <span className="M" style={{fontSize:11.5,color:"#9ca3af"}}>{бр} арт.</span>
                            {крК>0&&<span style={{fontSize:11.5,color:"#dc2626",fontWeight:600}}>⚠ {крК}</span>}
                          </div>
                        </div>
                        <div style={{width:10,height:10,borderRadius:"50%",background:к.цв,flexShrink:0}}/>
                      </div>
                    );
                  })}

                  {/* Добави нова */}
                  <div className="card" style={{padding:"16px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",border:"1.5px dashed #e5e7eb",background:"#fafafa",minHeight:82}}
                    onClick={отвКатНова}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#1d4ed8";e.currentTarget.style.background="#eff6ff";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.background="#fafafa";}}>
                    <span style={{fontSize:22,color:"#9ca3af"}}>+</span>
                    <span style={{fontSize:13.5,color:"#9ca3af",fontWeight:600}}>Нова категория</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ОТЧЕТИ ══ */}
            {tab==="history"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* KPI */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[
                    {е:"Транзакции",   с:историяФ.length,                      а:"#111827"},
                    {е:"Приход",        с:`${fN(Math.round(хПр))} €`,          а:"#111827"},
                    {е:"Печалба",       с:`${fN(Math.round(хПч))} €`,          а:хПч>=0?"#15803d":"#dc2626"},
                  ].map(к=>(
                    <div key={к.е} className="kpi-box">
                      <div className="kpi-label">{к.е}</div>
                      <div className="kpi-value" style={{fontSize:18,color:к.а}}>{к.с}</div>
                    </div>
                  ))}
                </div>

                {/* Таблица с транзакции */}
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{padding:"11px 14px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:13,fontWeight:600}}>
                      {историяФ.length} транзакции
                      {хДата==="today"?" · Днес":хДата==="week"?" · 7 дни":хДата==="month"?" · 30 дни":""}
                    </div>
                    <button className="btn btn-green btn-sm" onClick={()=>{
                      const BOM="﻿";
                      const h=["Дата","Час","Стока","Код","Категория","Кол.","Ед.цена","Сума","Печалба"];
                      const rows=историяФ.map(д=>{
                        const дата=eetИСО(new Date(д.дата));
                        const пч=д.кол*(д.цп-д.цд);
                        return[дата.slice(0,10),дата.slice(11,16),д.ime,д.код,д.кат,д.кол,f2(д.цп),f2(д.кол*д.цп),f2(пч)];
                      });
                      const csv=BOM+[h,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\r\n");
                      Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})),download:`история_${eetДата()}.csv`}).click();
                    }}>↓ CSV</button>
                  </div>

                  {историяФ.length===0
                    ?<div style={{padding:"32px",textAlign:"center",color:"#9ca3af",fontSize:13}}>Няма намерени транзакции.</div>
                    :<div style={{maxHeight:"calc(100vh - 280px)",overflowY:"auto"}}>
                      <div style={{display:"grid",gridTemplateColumns:"90px 90px 1fr 100px 70px 90px 90px 90px"}}>
                        {["Дата","Час","Стока","Категория","Кол.","Ед.цена","Сума","Печалба"].map((h,i)=>(
                          <div key={i} className="th" style={{textAlign:["Кол.","Ед.цена","Сума","Печалба"].includes(h)?"right":"left"}}>{h}</div>
                        ))}
                      </div>
                      {историяФ.map((д,i)=>{
                        const дата=eetИСО(new Date(д.дата));
                        const цв=ватЦ(д.кат); const пч=д.кол*(д.цп-д.цд);
                        return(
                          <div key={д.id||i} style={{display:"grid",gridTemplateColumns:"90px 90px 1fr 100px 70px 90px 90px 90px",padding:"8px 14px",borderBottom:"1px solid #f5f5f5",alignItems:"center"}}
                            onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <div className="M" style={{fontSize:11,color:"#9ca3af"}}>{дата.slice(0,10)}</div>
                            <div className="M" style={{fontSize:11,color:"#9ca3af"}}>{дата.slice(11,16)}</div>
                            <div style={{fontWeight:500,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{д.ime}</div>
                            <div><span className="chip" style={{background:цв+"12",color:цв,fontSize:10.5}}>{ватИ(д.кат)} {д.кат}</span></div>
                            <div className="M" style={{textAlign:"right",fontWeight:600}}>{д.кол}</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,color:"#9ca3af"}}>{f2(д.цп)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600}}>{f2(д.кол*д.цп)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600,color:пч>=0?"#15803d":"#dc2626"}}>{пч>=0?"+":""}{f2(пч)} €</div>
                          </div>
                        );
                      })}
                    </div>
                  }
                </div>

                {/* По стока */}
                <div className="card" style={{padding:"13px 15px"}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:11}}>Топ стоки по приход</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {(()=>{
                      const агр={};
                      историяФ.forEach(д=>{
                        if(!агр[д.код]) агр[д.код]={ime:д.ime,кат:д.кат,кол:0,пр:0,пч:0};
                        агр[д.код].кол+=д.кол; агр[д.код].пр+=д.кол*д.цп; агр[д.код].пч+=д.кол*(д.цп-д.цд);
                      });
                      return Object.values(агр).sort((a,b)=>b.пр-a.пр).slice(0,8);
                    })().map((р,i)=>{
                      const цв=ватЦ(р.кат);
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:10,color:"#d1d5db",width:18,fontFamily:"monospace"}}>#{i+1}</span>
                          <span style={{fontSize:13}}>{ватИ(р.кат)}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12.5,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{р.ime}</div>
                            <div style={{fontSize:10.5,color:"#9ca3af"}}>×{р.кол} бр.</div>
                          </div>
                          <div className="M" style={{fontSize:13,fontWeight:700,color:"#111827"}}>{fN(Math.round(р.пр))} €</div>
                          <div className="M" style={{fontSize:12,fontWeight:600,color:р.пч>=0?"#15803d":"#dc2626",minWidth:70,textAlign:"right"}}>{р.пч>=0?"+":""}{fN(Math.round(р.пч))} €</div>
                        </div>
                      );
                    })}
                    {историяФ.length===0&&<div style={{fontSize:12,color:"#9ca3af",textAlign:"center",padding:"12px 0"}}>Няма данни.</div>}
                  </div>
                </div>
              </div>
            )}

            {tab==="reports"&&(
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* KPI */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[
                    {е:"Общ приход (6м)",  с:`${fN(Math.round(оПр))} €`,         а:"#111827"},
                    {е:"Себестойност",      с:`${fN(Math.round(оСб))} €`,         а:"#9ca3af"},
                    {е:"Брутна печалба",    с:`${fN(Math.round(оПр-оСб))} €`,     а:оПр>оСб?"#15803d":"#dc2626"},
                    {е:"Среден марж",       с:`${оПр>0?Math.round((оПр-оСб)/оПр*100):0}%`, а:"#111827"},
                  ].map(к=>(
                    <div key={к.е} className="kpi-box">
                      <div className="kpi-label">{к.е}</div>
                      <div className="kpi-value" style={{color:к.а}}>{к.с}</div>
                    </div>
                  ))}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  {/* Диаграма */}
                  <div className="card" style={{padding:"16px 18px"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Месечен оборот</div>
                    <div style={{display:"flex",gap:6,alignItems:"flex-end",height:100,paddingBottom:16,borderBottom:"1px solid #f3f4f6"}}>
                      {об6М.map(м=>(
                        <div key={м.к} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%"}}>
                          <div style={{flex:1,display:"flex",alignItems:"flex-end",gap:1.5,width:"100%",justifyContent:"center"}}>
                            <div style={{width:"45%",height:`${м.пр>0?(м.пр/mxПр)*82:2}px`,background:"#1d4ed8",borderRadius:"2px 2px 0 0",minHeight:2}}/>
                            <div style={{width:"45%",height:`${м.сб>0?(м.сб/mxПр)*82:2}px`,background:"#dbeafe",borderRadius:"2px 2px 0 0",minHeight:2}}/>
                          </div>
                          <div style={{fontSize:9,color:"#9ca3af",fontFamily:"monospace"}}>{м.кратко}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:12,marginTop:8,fontSize:11,color:"#9ca3af"}}>
                      <span><b style={{color:"#1d4ed8"}}>■</b> Приход</span>
                      <span><b style={{color:"#bfdbfe"}}>■</b> Себест.</span>
                    </div>
                  </div>

                  {/* По категория */}
                  <div className="card" style={{padding:"16px 18px"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Стойност по категория</div>
                    <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:180,overflowY:"auto"}}>
                      {кат.map(к=>{
                        const пп=стоки.filter(s=>s.кат===к.ime);if(!пп.length) return null;
                        const ст=пп.reduce((a,s)=>a+s.нал*s.цп,0);
                        const макс=Math.max(...кат.map(к2=>стоки.filter(s=>s.кат===к2.ime).reduce((a,s)=>a+s.нал*s.цп,0)),1);
                        return(
                          <div key={к.id}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                              <span style={{fontSize:12,color:"#374151"}}>{к.ico} {к.ime} <span style={{color:"#9ca3af"}}>({пп.length})</span></span>
                              <span className="M" style={{fontSize:12,fontWeight:600}}>{fN(Math.round(ст))} €</span>
                            </div>
                            <div style={{height:4,background:"#f3f4f6",borderRadius:2,overflow:"hidden"}}>
                              <div style={{width:`${(ст/макс)*100}%`,height:"100%",background:к.цв,borderRadius:2}}/>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                </div>

                {/* Месечен отчет */}
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{padding:"12px 14px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontWeight:600,fontSize:13}}>Продадени стоки — {достМ[отчМ]||отчМ}</div>
                    {продМ.length>0&&(
                      <div style={{marginLeft:12,display:"flex",gap:16,fontSize:12}}>
                        {[
                          {е:"Приход",с:`${fN(Math.round(мПр))} €`,цв:"#111827"},
                          {е:"Себест.",с:`${fN(Math.round(мСб))} €`,цв:"#9ca3af"},
                          {е:"Печалба",с:`${fN(Math.round(мПч))} €`,цв:мПч>=0?"#15803d":"#dc2626"},
                          {е:"Марж",с:`${мПр>0?Math.round(мПч/мПр*100):0}%`,цв:"#111827"},
                        ].map(к=><span key={к.е} className="M" style={{color:к.цв}}><span style={{color:"#9ca3af",fontFamily:"inherit",fontWeight:400}}>{к.е}: </span>{к.с}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{maxHeight:280,overflowY:"auto"}}>
                    <div style={{display:"grid",gridTemplateColumns:"80px 1fr 130px 60px 110px 110px 100px 80px"}}>
                      {["Код","Наименование","Категория","Кол.","Ед.цена","Приход","Печалба","Марж"].map((h,i)=>(
                        <div key={i} className="th" style={{textAlign:["Кол.","Ед.цена","Приход","Печалба","Марж"].includes(h)?"right":"left"}}>{h}</div>
                      ))}
                    </div>
                    {продМ.length===0
                      ?<div style={{padding:"28px",textAlign:"center",color:"#9ca3af",fontSize:13}}>Няма продажби за {достМ[отчМ]||отчМ}.</div>
                      :продМ.map((р,i)=>{
                        const пч=р.пр-р.сб; const мр=р.пр>0?Math.round(пч/р.пр*100):0;
                        return(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"80px 1fr 130px 60px 110px 110px 100px 80px",padding:"9px 14px",borderBottom:"1px solid #f3f4f6",alignItems:"center"}}>
                            <div className="M" style={{fontSize:11,color:"#9ca3af"}}>{р.код}</div>
                            <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{р.ime}</div>
                            <div><span className="chip" style={{background:ватЦ(р.кат)+"12",color:ватЦ(р.кат)}}>{ватИ(р.кат)} {р.кат}</span></div>
                            <div className="M" style={{textAlign:"right",fontWeight:700}}>{р.кол}</div>
                            <div className="M" style={{textAlign:"right",fontSize:12,color:"#9ca3af"}}>{f2(р.пр/(р.кол||1))} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600}}>{f2(р.пр)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600,color:пч>=0?"#15803d":"#dc2626"}}>{пч>=0?"+":""}{f2(пч)} €</div>
                            <div className="M" style={{textAlign:"right",fontWeight:600,color:мр>=30?"#15803d":мр>=15?"#b45309":"#dc2626"}}>{мр}%</div>
                          </div>
                        );
                      })
                    }
                    {продМ.length>0&&(
                      <div style={{display:"grid",gridTemplateColumns:"80px 1fr 130px 60px 110px 110px 100px 80px",padding:"10px 14px",background:"#f9fafb",borderTop:"2px solid #e5e7eb",alignItems:"center"}}>
                        <div className="M" style={{fontSize:12,fontWeight:700,gridColumn:"1/4"}}>ОБЩО · {продМ.length} арт.</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700}}>{fN(продМ.reduce((a,р)=>a+р.кол,0))}</div>
                        <div/>
                        <div className="M" style={{textAlign:"right",fontWeight:700}}>{f2(мПр)} €</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700,color:мПч>=0?"#15803d":"#dc2626"}}>{мПч>=0?"+":""}{f2(мПч)} €</div>
                        <div className="M" style={{textAlign:"right",fontWeight:700}}>{мПр>0?Math.round(мПч/мПр*100):0}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── МОДАЛ СТОКА ── */}
      {стМод&&форма&&(
        <div className="overlay" onClick={()=>{setSM(false);setСкК(null);}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>{нова?"Нова стока":"Редактиране"}</div>
              {скКод&&нова&&<div style={{fontSize:12,color:"#1d4ed8",background:"#eff6ff",padding:"3px 9px",borderRadius:20,fontFamily:"monospace"}}>📷 {скКод}</div>}
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
                <select className="inp" value={форма.кат} onChange={e=>setФ(f=>({...f,кат:e.target.value}))}>
                  {кат.map(к=><option key={к.id}>{к.ime}</option>)}
                </select>
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
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"11px 14px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#15803d",marginBottom:3}}>Марж</div>
                    <div className="M" style={{fontSize:22,fontWeight:800,color:"#15803d"}}>{мрж(+форма.цд,+форма.цп)}%</div>
                  </div>
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"11px 14px",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:"#15803d",marginBottom:3}}>Печалба / бр.</div>
                    <div className="M" style={{fontSize:22,fontWeight:800,color:"#15803d"}}>{f2(+форма.цп-+форма.цд)} €</div>
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

      {/* ── МОДАЛ КАТЕГОРИЯ ── */}
      {катМод&&катФ&&(
        <div className="overlay" onClick={()=>setКМод(false)}>
          <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr">
              <div style={{fontSize:15,fontWeight:700}}>{новКат?"Нова категория":"Редактирай категория"}</div>
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
                  {ЦВЕТОВЕ.map(цв=>(
                    <div key={цв} className={`swatch${катФ.цв===цв?" sel":""}`}
                      style={{background:цв}} onClick={()=>setКФ(f=>({...f,цв}))}/>
                  ))}
                </div>
              </div>

              <div>
                <span className="lbl">Иконка</span>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4,maxHeight:160,overflowY:"auto"}}>
                  {ИКОНИ.map(ico=>(
                    <div key={ico} className={`ico-btn${катФ.ico===ico?" sel":""}`} onClick={()=>setКФ(f=>({...f,ico}))}>
                      {ico}
                    </div>
                  ))}
                </div>
              </div>

              {/* Преглед */}
              {катФ.ime&&(
                <div style={{padding:"12px 14px",background:"#f9fafb",borderRadius:8,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:катФ.цв+"15",border:`2px solid ${катФ.цв}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{катФ.ico}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{катФ.ime}</div>
                    <div style={{fontSize:11.5,color:"#9ca3af",marginTop:2}}>Преглед на категорията</div>
                  </div>
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
    </>
  );
  }