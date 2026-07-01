import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';

interface Dot { id:string; lat:number; lng:number; confidence:number; color:string; cam:string; loc:string; locIdx:number; }

const containerStyle = { width:'100%', height:'100%', minHeight:'400px' };
const CENTER = { lat:30.96770, lng:76.46970 };
const ZOOM_OUT = 16;
const ZOOM_IN = 19;

// 🔧 EDIT people count per location here
const LOCS = [
  { name:'Chenab Hostel Entrance', cam:'CAM-01 Chenab', lat:30.968845, lng:76.465739, people:4, color:'#ff6b35' },
  { name:'LHC Entrance',          cam:'CAM-02 LHC',    lat:30.967526, lng:76.472128, people:2, color:'#3b82f6' },
  { name:'Cafeteria',             cam:'CAM-03 Cafe',   lat:30.966328, lng:76.471401, people:11, color:'#10b981' },
  { name:'Student Activity Centre',cam:'CAM-04 SAC',   lat:30.967673, lng:76.469895, people:4, color:'#a855f7' },
];

const COLORS = ['#ff6b35','#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#84cc16','#e11d48','#a855f7','#14b8a6','#f97316','#6366f1','#ef4444','#22d3ee'];
const sr = (s:number) => { const x=Math.sin(s*9301+49297)*49297; return x-Math.floor(x); };

function makeDots(): Dot[] {
  const d: Dot[] = []; let g=0;
  LOCS.forEach((l,li) => { for(let i=0;i<l.people;i++) { const s=g*7+13;
    d.push({ id:`P${String(g+1).padStart(3,'0')}`, lat:l.lat+(sr(s)-.5)*.00028, lng:l.lng+(sr(s+1)-.5)*.00028,
      confidence:parseFloat((.83+sr(s+2)*.16).toFixed(2)), color:COLORS[g%COLORS.length], cam:l.cam, loc:l.name, locIdx:li });
    g++; } }); return d;
}
const ALL = makeDots();

const darkStyle = [
  {elementType:'geometry',stylers:[{color:'#1a1a2e'}]},{elementType:'labels.text.stroke',stylers:[{color:'#1a1a2e'}]},
  {elementType:'labels.text.fill',stylers:[{color:'#8b8b8b'}]},{featureType:'road',elementType:'geometry',stylers:[{color:'#2a2a4a'}]},
  {featureType:'water',elementType:'geometry',stylers:[{color:'#0e1626'}]},{featureType:'poi',elementType:'geometry',stylers:[{color:'#1e1e3a'}]},
  {featureType:'transit',elementType:'geometry',stylers:[{color:'#16162e'}]},{featureType:'landscape.man_made',elementType:'geometry',stylers:[{color:'#1e1e38'}]},
];

const T = { BOOT:600, PAN:900, SCAN:400, DOT:180, HOLD:1200, ZOUT:500 };

// Event templates for realism
const EVT_TEMPLATES = [
  (d:Dot)=>`[ReID] ${d.id} matched via OSNet embedding (${d.cam})`,
  (d:Dot)=>`[Track] ${d.id} bbox updated @ ${d.loc}`,
  (d:Dot)=>`[Det] ${d.id} conf=${(d.confidence*100).toFixed(1)}% (YOLOv11m)`,
  (d:Dot)=>`[Spatial] ${d.id} mapped to GPS (${d.lat.toFixed(4)}, ${d.lng.toFixed(4)})`,
  (d:Dot)=>`[ReID] Cross-cam match: ${d.id} ↔ ${d.cam}`,
];

export default function TrackingMap({ active = false }: { active?: boolean }) {
  const mapRef = useRef<google.maps.Map|null>(null);
  const tms = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasStarted = useRef(false);
  const [vis, setVis] = useState<Set<string>>(new Set());
  const [scanIdx, setScanIdx] = useState<number|null>(null);
  const [scanRing, setScanRing] = useState(false);
  const [toasts, setToasts] = useState<{t:string;c:string;k:number}[]>([]);
  const [selId, setSelId] = useState<string|null>(null);
  const [addrMap, setAddrMap] = useState<Record<string,string>>({});
  const [phase, setPhase] = useState<'boot'|'scan'|'live'>('boot');
  const [total, setTotal] = useState(0);
  const [frame, setFrame] = useState(0);
  const [fps, setFps] = useState(0);
  const [infMs, setInfMs] = useState(0);
  const [liveDots, setLiveDots] = useState<Dot[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [liveTrackCount, setLiveTrackCount] = useState(0);
  const [pings, setPings] = useState<{lat:number;lng:number;color:string;k:number}[]>([]);
  const tk = useRef(0);
  const pingK = useRef(0);

  const { isLoaded } = useJsApiLoader({ id:'gmap', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY||'' });
  const onLoad = useCallback((m:google.maps.Map) => { mapRef.current=m; }, []);

  const toast = useCallback((t:string,c:string) => {
    const k=++tk.current;
    setToasts(p=>[...p.slice(-2),{t,c,k}]);
    const tm=setTimeout(()=>setToasts(p=>p.filter(x=>x.k!==k)),2800);
    tms.current.push(tm);
  },[]);

  // Fire a radar-ping circle at a coordinate
  const firePing = useCallback((lat:number,lng:number,color:string) => {
    const k=++pingK.current;
    setPings(p=>[...p,{lat,lng,color,k}]);
    const tm=setTimeout(()=>setPings(p=>p.filter(x=>x.k!==k)),900);
    tms.current.push(tm);
  },[]);

  // ── SCAN SEQUENCE (only starts when section scrolls into view) ──
  useEffect(() => {
    if(!isLoaded || !active || hasStarted.current) return;
    hasStarted.current = true;
    tms.current.forEach(clearTimeout); tms.current=[];
    setVis(new Set()); setScanIdx(null); setScanRing(false); setToasts([]); setTotal(0); setPhase('boot'); setEvents([]);
    let e=T.BOOT;
    LOCS.forEach((loc,li) => {
      const dots=ALL.filter(d=>d.locIdx===li);
      tms.current.push(setTimeout(()=>{ setPhase('scan'); setScanIdx(li); setScanRing(false);
        mapRef.current?.panTo({lat:loc.lat,lng:loc.lng}); mapRef.current?.setZoom(ZOOM_IN); },e));
      e+=T.PAN;
      tms.current.push(setTimeout(()=>setScanRing(true),e)); e+=T.SCAN;
      dots.forEach((dot,di)=>{
        tms.current.push(setTimeout(()=>{ setVis(p=>new Set(p).add(dot.id)); setTotal(p=>p+1);
          firePing(dot.lat, dot.lng, dot.color);
          setEvents(p=>[`[${new Date().toLocaleTimeString()}] Detected ${dot.id} at ${loc.name} (${(dot.confidence*100).toFixed(0)}%)`,...p].slice(0,20));
        },e+di*T.DOT));
      });
      e+=dots.length*T.DOT;
      tms.current.push(setTimeout(()=>{ toast(`${dots.length} person${dots.length>1?'s':''} detected — ${loc.name}`,loc.color); setScanRing(false); },e));
      e+=T.HOLD;
    });
    e+=T.ZOUT;
    tms.current.push(setTimeout(()=>{ setScanIdx(null); setPhase('live');
      mapRef.current?.panTo(CENTER); mapRef.current?.setZoom(ZOOM_OUT);
      toast(`Scan complete — tracking across ${LOCS.length} zones`,'#22c55e');
      setLiveDots(ALL.map(d=>({...d})));
    },e));
    return ()=>tms.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[isLoaded, active]);

  // ── LIVE SIMULATION (after scan) ──
  useEffect(() => {
    if(phase!=='live') return;
    const iv = setInterval(()=>{
      setFrame(p=>p+1);
      setFps(42+Math.floor(Math.random()*8));
      setInfMs(parseFloat((8+Math.random()*6).toFixed(1)));

      // Fluctuate visible track count (±1-2 from base)
      const base = ALL.length;
      setLiveTrackCount(base + Math.floor(Math.random()*5) - 2);

      // Micro-drift positions + confidence jitter
      setLiveDots(prev=>prev.map(d=>({
        ...d,
        lat: d.lat + (Math.random()-.5)*0.000015,
        lng: d.lng + (Math.random()-.5)*0.000015,
        confidence: Math.min(0.99, Math.max(0.78, d.confidence + (Math.random()-.5)*0.04)),
      })));

      // Random event log entry
      if(Math.random()>0.4) {
        const rd = ALL[Math.floor(Math.random()*ALL.length)];
        const tmpl = EVT_TEMPLATES[Math.floor(Math.random()*EVT_TEMPLATES.length)];
        setEvents(p=>[`[${new Date().toLocaleTimeString()}] ${tmpl(rd)}`,...p].slice(0,25));
      }
    }, 1000);
    return ()=>clearInterval(iv);
  },[phase]);

  const handleClick = useCallback((d:Dot)=>{
    setSelId(d.id);
    if(!addrMap[d.id]) fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${d.lat}&lon=${d.lng}`)
      .then(r=>r.json()).then(data=>{ if(data?.display_name) setAddrMap(p=>({...p,[d.id]:data.display_name.split(',').slice(0,3).join(', ').trim()})); }).catch(()=>{});
  },[addrMap]);

  const shownDots = useMemo(()=> phase==='live' ? liveDots : ALL.filter(d=>vis.has(d.id)), [phase,liveDots,vis]);
  const opts = useMemo(()=>({ styles:darkStyle, disableDefaultUI:true, zoomControl:true, mapTypeControl:false, streetViewControl:false, fullscreenControl:false }),[]);

  if(!isLoaded) return (
    <div className="w-full h-full min-h-[400px] rounded-xl bg-white/5 animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-orange-500/40 border-t-orange-500 animate-spin"/>
      <span className="text-white/30 text-sm font-mono">Loading Map…</span>
    </div>
  );

  const aLoc = scanIdx!==null ? LOCS[scanIdx] : null;

  return (
    <div style={{position:'relative',width:'100%',height:'100%',overflow:'hidden'}}>
      <GoogleMap mapContainerStyle={containerStyle} center={CENTER} zoom={ZOOM_OUT} options={opts} onLoad={onLoad}>
        {/* Radar ping effects for new detections */}
        {pings.map(p=>(
          <Circle key={`ping-${p.k}`} center={{lat:p.lat,lng:p.lng}} radius={12}
            options={{fillColor:p.color,fillOpacity:.25,strokeColor:p.color,strokeOpacity:.7,strokeWeight:2}}/>
        ))}
        {scanRing && aLoc && <>
          <Circle center={{lat:aLoc.lat,lng:aLoc.lng}} radius={15} options={{fillColor:aLoc.color,fillOpacity:.15,strokeColor:aLoc.color,strokeOpacity:.6,strokeWeight:2}}/>
          <Circle center={{lat:aLoc.lat,lng:aLoc.lng}} radius={30} options={{fillColor:'transparent',fillOpacity:0,strokeColor:aLoc.color,strokeOpacity:.2,strokeWeight:1}}/>
        </>}
        {LOCS.map((l,i)=>{ const ok=(scanIdx!==null&&i<=scanIdx)||phase==='live'; if(!ok) return null;
          return <Circle key={i} center={{lat:l.lat,lng:l.lng}} radius={18} options={{fillColor:l.color,fillOpacity:.06,strokeColor:l.color,strokeOpacity:.2,strokeWeight:1}}/>;
        })}
        {shownDots.map(d=>(
          <Marker key={d.id} position={{lat:d.lat,lng:d.lng}} onClick={()=>handleClick(d)}
            label={{text:d.id,color:'#fff',fontSize:'9px',fontWeight:'700'}}
            icon={{path:google.maps.SymbolPath.CIRCLE,fillColor:d.color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2,scale:9}}>
            {selId===d.id && <InfoWindow position={{lat:d.lat,lng:d.lng}} onCloseClick={()=>setSelId(null)}>
              <div style={{padding:8,minWidth:180,fontFamily:'Inter,system-ui,sans-serif',color:'#000'}}>
                <div style={{fontWeight:700,fontSize:13,borderBottom:'1px solid #e5e7eb',paddingBottom:4,marginBottom:6,color:d.color}}>🧑 Person {d.id}</div>
                <div style={{fontSize:11,fontWeight:700,color:'#16a34a',marginBottom:4,display:'flex',alignItems:'center',gap:4}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',animation:'pulse .8s infinite',display:'inline-block'}}/> ACTIVE
                </div>
                <div style={{fontSize:11,color:'#4b5563',marginBottom:2}}>📍 <b>{d.loc}</b></div>
                {addrMap[d.id]?<div style={{fontSize:10,color:'#6b7280',marginBottom:2}}>{addrMap[d.id]}</div>
                  :<div style={{fontSize:10,color:'#9ca3af',fontFamily:'monospace'}}>{d.lat.toFixed(6)}, {d.lng.toFixed(6)}</div>}
                <div style={{fontSize:10,fontFamily:'monospace',color:'#2563eb',marginTop:4}}>Conf: {(d.confidence*100).toFixed(1)}%</div>
                <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>📷 {d.cam}</div>
              </div>
            </InfoWindow>}
          </Marker>
        ))}
      </GoogleMap>

      {/* SCANNING BADGE */}
      {phase==='scan'&&aLoc&&(
        <div style={{position:'absolute',top:10,left:10,background:'rgba(0,0,0,.85)',backdropFilter:'blur(10px)',border:`1px solid ${aLoc.color}50`,borderRadius:8,padding:'6px 12px',display:'flex',alignItems:'center',gap:8,animation:'slideL .3s ease-out'}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:aLoc.color,boxShadow:`0 0 8px ${aLoc.color}`,animation:'pulse .7s infinite'}}/>
          <div><div style={{color:'#fff',fontSize:10,fontWeight:700,letterSpacing:.8}}>SCANNING</div><div style={{color:aLoc.color,fontSize:11,fontWeight:600}}>{aLoc.name}</div></div>
        </div>
      )}

      {/* SYSTEM STATS (top-left, live phase) */}
      {phase==='live'&&(
        <div style={{position:'absolute',top:10,left:10,background:'rgba(0,0,0,.85)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'8px 12px',fontSize:10,fontFamily:'monospace',color:'#fff',lineHeight:1.7,animation:'fadeIn .5s'}}>
          <div style={{fontWeight:700,fontSize:11,marginBottom:4,color:'#22c55e',display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',animation:'pulse 1s infinite'}}/>SYSTEM LIVE
          </div>
          <div><span style={{color:'rgba(255,255,255,.4)'}}>Model  </span><span style={{color:'#f59e0b'}}>YOLOv8x + OSNet</span></div>
          <div><span style={{color:'rgba(255,255,255,.4)'}}>FPS    </span><span style={{color:fps>44?'#22c55e':'#f59e0b'}}>{fps}</span></div>
          <div><span style={{color:'rgba(255,255,255,.4)'}}>Infer  </span>{infMs}ms</div>
          <div><span style={{color:'rgba(255,255,255,.4)'}}>Frame  </span>#{String(frame).padStart(5,'0')}</div>
          <div><span style={{color:'rgba(255,255,255,.4)'}}>Tracks </span><span style={{color:'#3b82f6'}}>{liveTrackCount} active</span></div>
        </div>
      )}

      {/* COUNTER (bottom-left) */}
      <div style={{position:'absolute',bottom:10,left:10,background:'rgba(0,0,0,.8)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'6px 12px',display:'flex',alignItems:'center',gap:8,fontFamily:'monospace',fontSize:11,color:'#fff'}}>
        <span style={{width:7,height:7,borderRadius:'50%',background:phase==='live'?'#22c55e':phase==='boot'?'#f59e0b':'#3b82f6',animation:phase!=='live'?'pulse 1s infinite':'none'}}/>
        {phase==='boot'&&'Initializing…'}
        {phase==='scan'&&`Detecting persons…`}
        {phase==='live'&&`✓ ${liveTrackCount} persons tracked • ${LOCS.length} zones`}
      </div>

      {/* LEGEND (bottom-right, live phase) */}
      {phase==='live'&&(
        <div style={{position:'absolute',bottom:10,right:10,background:'rgba(0,0,0,.8)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,padding:'8px 12px',fontSize:10,color:'#fff',animation:'fadeIn .5s'}}>
          {LOCS.map((l,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:i<LOCS.length-1?3:0}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:l.color,flexShrink:0}}/>
              <span style={{color:'rgba(255,255,255,.55)',maxWidth:110,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.name}</span>
              <span style={{fontWeight:700,marginLeft:'auto'}}>{l.people}</span>
            </div>
          ))}
        </div>
      )}

      {/* EVENT LOG (bottom-right during scan, bottom-center during live) */}
      {events.length>0&&(
        <div style={{position:'absolute',bottom:phase==='live'?44:10,right:phase==='live'?10:undefined,left:phase!=='live'?'50%':undefined,transform:phase!=='live'?'translateX(-50%)':undefined,
          background:'rgba(0,0,0,.88)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.06)',borderRadius:8,padding:'6px 10px',
          fontSize:9,fontFamily:'monospace',color:'rgba(255,255,255,.5)',maxWidth:320,maxHeight:phase==='live'?80:60,overflowY:'auto',overflowX:'hidden',lineHeight:1.6,
          scrollbarWidth:'none'}}>
          {events.slice(0, phase==='live'?6:3).map((ev,i)=>(
            <div key={i} style={{opacity:1-i*.12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ev}</div>
          ))}
        </div>
      )}

      {/* TOASTS */}
      <div style={{position:'absolute',top:10,right:10,display:'flex',flexDirection:'column',gap:6,zIndex:50}}>
        {toasts.map(t=>(
          <div key={t.k} style={{background:'rgba(0,0,0,.88)',backdropFilter:'blur(10px)',borderLeft:`3px solid ${t.c}`,borderRadius:8,padding:'8px 14px',fontSize:11,fontWeight:600,color:'#fff',maxWidth:240,animation:'slideR .3s cubic-bezier(.16,1,.3,1)',boxShadow:`0 4px 16px ${t.c}25`}}>
            {t.t}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideR{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
      `}</style>
    </div>
  );
}
