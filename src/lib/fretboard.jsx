/**
 * BITWERX FRETBOARD LIBRARY — DopeSonic edition
 * src/lib/fretboard.jsx
 * Shared verified building blocks for all DopeSonic theory tools.
 */

export const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
export const NOTE_DISPLAY = n => ({'C#':'C#/Db','D#':'D#/Eb','F#':'F#/Gb','G#':'G#/Ab','A#':'A#/Bb'}[n] || n);
export const OPEN = [4,9,2,7,11,4];
export const STRING_NAMES = ['E','A','D','G','B','e'];
export const DOT_COLORS = { root:'#e05c5c', third:'#c8a84b', fifth:'#5ca8e0' };
export const DOT_TEXT   = { root:'R', third:'3', fifth:'5' };
export const DOT_FG     = { root:'#fff', third:'#000', fifth:'#fff' };
export const INTERVAL_NAMES = ['R','b2','2','b3','3','4','b5','5','b6','6','b7','7'];
export const ALL_KEYS = ['C','D','E','F','G','A','B','C#','D#','F#','G#','A#'];

export const MODE_INTERVALS = {
  Ionian:     [0,2,4,5,7,9,11],
  Dorian:     [0,2,3,5,7,9,10],
  Phrygian:   [0,1,3,5,7,8,10],
  Lydian:     [0,2,4,6,7,9,11],
  Mixolydian: [0,2,4,5,7,9,10],
  Aeolian:    [0,2,3,5,7,8,10],
  Locrian:    [0,1,3,5,6,8,10],
};

export const CAGED_SHAPES = {
  E: { name:'E Shape', rootStr:0, youKnow:true,
    description:'Root on low E. Your home base — the classic barre chord.',
    f:[{o:0,t:'root'},{o:2,t:'fifth'},{o:2,t:'root'},{o:1,t:'third'},{o:0,t:'fifth'},{o:0,t:'root'}] },
  A: { name:'A Shape', rootStr:1, youKnow:false,
    description:'Root on A string. Low E muted. D/G/B cluster 2 frets above root.',
    f:[{o:null,t:'mute'},{o:0,t:'root'},{o:2,t:'fifth'},{o:2,t:'root'},{o:2,t:'third'},{o:0,t:'fifth'}] },
  G: { name:'G Shape', rootStr:0, youKnow:false,
    description:'Root on low E and high e. Pinky stretches 3 frets above index.',
    f:[{o:3,t:'root'},{o:2,t:'third'},{o:0,t:'fifth'},{o:0,t:'root'},{o:0,t:'third'},{o:3,t:'root'}] },
  C: { name:'C Shape', rootStr:1, youKnow:false,
    description:'Root on A string. Low E muted. Fingers spread across 3 frets.',
    f:[{o:null,t:'mute'},{o:3,t:'root'},{o:2,t:'third'},{o:0,t:'fifth'},{o:1,t:'root'},{o:0,t:'third'}] },
  D: { name:'D Shape', rootStr:2, youKnow:false,
    description:'Root on D string. Low E and A muted. Compact shape on top 4 strings.',
    f:[{o:null,t:'mute'},{o:null,t:'mute'},{o:0,t:'root'},{o:2,t:'fifth'},{o:3,t:'root'},{o:2,t:'third'}] },
};

export function noteAt(strIdx, fret) { return NOTES[(OPEN[strIdx] + fret) % 12]; }

export function toneType(note, root) {
  const interval = (NOTES.indexOf(note) - NOTES.indexOf(root) + 12) % 12;
  if (interval === 0) return 'root';
  if (interval === 4) return 'third';
  if (interval === 7) return 'fifth';
  return null;
}

export function getRootFret(strIdx, keyNote) {
  const f = (NOTES.indexOf(keyNote) - OPEN[strIdx] + 12) % 12;
  return f === 0 ? 12 : f;
}

export function getBaseFret(shape, keyNote) {
  return getRootFret(shape.rootStr, keyNote) - shape.f[shape.rootStr].o;
}

export function Fretboard({ dots=[], mutes=[], startFret=0, numFrets=5, allSixStrings=true, activeStrings=null }) {
  const showStrings = allSixStrings ? [0,1,2,3,4,5]
    : (activeStrings || [...new Set(dots.map(d=>d.strIdx).concat(mutes))].sort((a,b)=>a-b));
  const LEFT=36,RIGHT=32,TOP=28,FRET_H=44,STR_W=36,n=showStrings.length;
  const W=LEFT+(n-1)*STR_W+RIGHT, H=TOP+numFrets*FRET_H+8;
  const sx=i=>LEFT+showStrings.indexOf(i)*STR_W, fy=f=>TOP+f*FRET_H;
  const dotY=f=>TOP+(f-startFret+0.5)*FRET_H, showNut=startFret<=1;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block',maxWidth:340,margin:'0 auto'}}>
      {showStrings.map((si,i)=>(<text key={si} x={LEFT+i*STR_W} y={TOP-8} textAnchor="middle" fontSize="11" fill="#666" fontFamily="monospace">{STRING_NAMES[si]}</text>))}
      {showNut ? <rect x={LEFT} y={TOP} width={(n-1)*STR_W} height={5} fill="#bbb" rx={2}/> : <text x={LEFT-6} y={TOP+FRET_H*0.55} fontSize="10" fill="#555" fontFamily="monospace" textAnchor="end">{startFret}</text>}
      {Array.from({length:numFrets}).map((_,f)=>(<line key={f} x1={LEFT} y1={fy(f+1)} x2={LEFT+(n-1)*STR_W} y2={fy(f+1)} stroke="#3a3a3a" strokeWidth={2}/>))}
      {showStrings.map((si,i)=>(<line key={si} x1={LEFT+i*STR_W} y1={TOP+(showNut?5:0)} x2={LEFT+i*STR_W} y2={fy(numFrets)} stroke="#555" strokeWidth={1}/>))}
      {Array.from({length:numFrets}).map((_,f)=>{const fn=startFret+f+1;if(fn<=0)return null;return(<text key={f} x={LEFT+(n-1)*STR_W+10} y={fy(f+1)-2} fontSize="10" fill="#555" fontFamily="monospace" dominantBaseline="auto">{fn}</text>);})}
      {mutes.map(si=>!showStrings.includes(si)?null:(<text key={si} x={sx(si)} y={TOP-8} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#888">x</text>))}
      {dots.map((d,idx)=>!showStrings.includes(d.strIdx)?null:(<g key={idx}><circle cx={sx(d.strIdx)} cy={dotY(d.fret)} r={13} fill={DOT_COLORS[d.type]}/><text x={sx(d.strIdx)} y={dotY(d.fret)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fontFamily="monospace" fill={DOT_FG[d.type]}>{DOT_TEXT[d.type]}</text></g>))}
    </svg>
  );
}

export function BigPictureFretboard({ dots=[], dimDots=[], activePairs=[], modeColor='#c8a84b', numFrets=24 }) {
  const FRET_H=32,STR_W=36,LEFT=28,TOP=24;
  const W=LEFT+5*STR_W+20, H=TOP+numFrets*FRET_H+16;
  const sx=i=>LEFT+i*STR_W, fretTop=f=>TOP+(f-1)*FRET_H, dotY=f=>TOP+(f-0.5)*FRET_H;
  const pairLines=[];
  activePairs.forEach(([sA,sB])=>{
    dots.filter(d=>d.strIdx===sA).forEach(a=>{dots.filter(d=>d.strIdx===sB).forEach(b=>{
      if(Math.abs(a.fret-b.fret)<=3) pairLines.push({x1:sx(sA),y1:dotY(a.fret),x2:sx(sB),y2:dotY(b.fret)});
    });});
  });
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block',maxWidth:W*1.4,margin:'0 auto'}}>
      {STRING_NAMES.map((name,i)=>(<text key={i} x={sx(i)} y={TOP-8} textAnchor="middle" fontSize="11" fill="#666" fontFamily="monospace">{name}</text>))}
      <rect x={sx(0)} y={TOP} width={sx(5)-sx(0)} height={4} fill="#aaa" rx={1}/>
      {Array.from({length:numFrets}).map((_,f)=>(<line key={f} x1={sx(0)} y1={fretTop(f+1)} x2={sx(5)} y2={fretTop(f+1)} stroke="#2e2e2e" strokeWidth={1.5}/>))}
      {STRING_NAMES.map((_,i)=>(<line key={i} x1={sx(i)} y1={TOP+4} x2={sx(i)} y2={TOP+numFrets*FRET_H} stroke="#333" strokeWidth={1}/>))}
      {Array.from({length:numFrets}).map((_,f)=>(<text key={f} x={sx(5)+10} y={dotY(f+1)} fontSize="9" fill="#444" fontFamily="monospace" dominantBaseline="middle">{f+1}</text>))}
      {[3,5,7,9,15,17,19,21].map(f=>f<=numFrets&&(<circle key={f} cx={sx(2)+STR_W/2} cy={dotY(f)} r={4} fill="#2a2a2a"/>))}
      {[12,24].map(f=>f<=numFrets&&(<g key={f}><circle cx={sx(1)+STR_W/2} cy={dotY(f)} r={4} fill="#2a2a2a"/><circle cx={sx(3)+STR_W/2} cy={dotY(f)} r={4} fill="#2a2a2a"/></g>))}
      {pairLines.map((l,i)=>(<line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#444" strokeWidth={2}/>))}
      {dimDots.map((d,i)=>(<circle key={i} cx={sx(d.strIdx)} cy={dotY(d.fret)} r={10} fill="#222" stroke="#333" strokeWidth={1}/>))}
      {dots.map((d,i)=>(<g key={i}><circle cx={sx(d.strIdx)} cy={dotY(d.fret)} r={13} fill={d.type?DOT_COLORS[d.type]:modeColor}/><text x={sx(d.strIdx)} y={dotY(d.fret)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fontFamily="monospace" fill={d.type?DOT_FG[d.type]:'#000'}>{d.type?DOT_TEXT[d.type]:'.'}</text></g>))}
    </svg>
  );
}

export function ChordToneLegend({ selKey, extras=[] }) {
  const ki=NOTES.indexOf(selKey), third=NOTES[(ki+4)%12], fifth=NOTES[(ki+7)%12];
  return (
    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
      {[['root',`Root (${selKey})`],['third',`3rd (${third})`],['fifth',`5th (${fifth})`]].map(([t,lbl])=>(
        <div key={t} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}>
          <div style={{width:18,height:18,borderRadius:'50%',background:DOT_COLORS[t],display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:700,color:DOT_FG[t],flexShrink:0}}>{DOT_TEXT[t]}</div>
          {lbl}
        </div>
      ))}
      {extras.map((e,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><div style={{width:18,height:18,borderRadius:'50%',background:e.color,flexShrink:0}}/>{e.label}</div>))}
      <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><span style={{color:'#888',fontSize:'0.95rem'}}>x</span> Muted</div>
    </div>
  );
}

export function Pager({ index, total, onPrev, onNext, label }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:10}}>
      <button onClick={onPrev} disabled={index===0} style={{padding:'5px 14px',borderRadius:5,cursor:'pointer',fontSize:'0.8rem',border:'1px solid #2e2e2e',background:'#141414',color:index===0?'#333':'#aaa'}}>Prev</button>
      <span style={{fontSize:'0.72rem',color:'#555',fontFamily:'monospace'}}>{label}</span>
      <button onClick={onNext} disabled={index===total-1} style={{padding:'5px 14px',borderRadius:5,cursor:'pointer',fontSize:'0.8rem',border:'1px solid #2e2e2e',background:'#141414',color:index===total-1?'#333':'#aaa'}}>Next</button>
    </div>
  );
}

export function DiagramCard({ title, children, accent='#2e2e2e' }) {
  return (
    <div style={{background:'#1a1a1a',border:`1px solid ${accent}`,borderRadius:10,padding:16,marginBottom:14}}>
      {title&&<div style={{fontFamily:'Georgia,serif',fontSize:'0.88rem',color:'#c8a84b',letterSpacing:'0.04em',marginBottom:12}}>{title}</div>}
      {children}
    </div>
  );
}

export function KeySelector({ selKey, onChange }) {
  return (
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
      {ALL_KEYS.map(k=>(
        <button key={k} onClick={()=>onChange(k)} style={{fontFamily:'monospace',fontSize:'0.8rem',padding:'5px 9px',borderRadius:4,cursor:'pointer',minWidth:36,border:k===selKey?'1px solid #7ec8a4':'1px solid #2e2e2e',background:k===selKey?'#7ec8a4':'#1a1a1a',color:k===selKey?'#000':'#888',fontWeight:k===selKey?700:400}}>
          {NOTE_DISPLAY(k)}
        </button>
      ))}
    </div>
  );
}

export const PAGE_STYLE = {
  background:'#0e0e0e', minHeight:'100vh', color:'#e8e8e8',
  fontFamily:'system-ui,sans-serif', padding:16, maxWidth:520, margin:'0 auto',
};
