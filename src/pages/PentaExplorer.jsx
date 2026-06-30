import { useState } from "react";

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_DISPLAY = n => ({'C#':'C#/Db','D#':'D#/Eb','F#':'F#/Gb','G#':'G#/Ab','A#':'A#/Bb'}[n] || n);
const OPEN = [4,9,2,7,11,4];
const STRING_NAMES = ['E','A','D','G','B','e'];
const ALL_KEYS = ['C','D','E','F','G','A','B','C#','D#','F#','G#','A#'];

function noteAt(strIdx, fret) { return NOTES[(OPEN[strIdx] + fret) % 12]; }

const PENTA_INTERVALS = { minor:[0,3,5,7,10], major:[0,2,4,7,9] };
const MINOR_DEGREES = { 0:'R', 3:'b3', 5:'4', 7:'5', 10:'b7' };
const MAJOR_DEGREES = { 0:'R', 2:'2', 4:'3', 7:'5', 9:'6' };
const DEGREE_COLORS = { 0:'#e05c5c', 3:'#a87ec8', 5:'#5ca8e0', 7:'#7ec8a4', 10:'#c8a84b', 2:'#7ec8e8', 4:'#c8a84b', 9:'#7ec8a4' };
const DEGREE_FG = { 0:'#fff', 3:'#fff', 5:'#fff', 7:'#000', 10:'#000', 2:'#000', 4:'#000', 9:'#000' };
const DOT_COLOR = i => DEGREE_COLORS[i] || '#888';
const DOT_FG_C  = i => DEGREE_FG[i] || '#fff';

const SHAPE_WINDOWS = {
  1: { start:0,  rootStr:0, cagedShape:'E', name:'Shape 1', youKnow:true,
       description:'Root on low E. The classic box. Lives in E shape CAGED territory.' },
  2: { start:2,  rootStr:1, cagedShape:'D', name:'Shape 2',
       description:'Root on A string. Connects directly above Shape 1. D shape CAGED territory.' },
  3: { start:4,  rootStr:2, cagedShape:'C', name:'Shape 3',
       description:'Root on D string. C shape CAGED territory. Great for melodic runs.' },
  4: { start:7,  rootStr:0, cagedShape:'A', name:'Shape 4',
       description:'Root on low E (octave position). A shape CAGED territory. Zakk Wylde lives here.' },
  5: { start:9,  rootStr:1, cagedShape:'G', name:'Shape 5',
       description:'Root on A string. G shape CAGED territory. Connects back to Shape 1 at the 12th.' },
};

function rootFretLowE(key) {
  const f = (NOTES.indexOf(key) - OPEN[0] + 12) % 12;
  return f === 0 ? 12 : f;
}

function getPentaDots(key, mode, windowStart) {
  const intervals = PENTA_INTERVALS[mode];
  const rootIdx = NOTES.indexOf(key);
  const dots = [];
  const startFret = rootFretLowE(key) + windowStart;
  for (let si = 0; si < 6; si++) {
    for (let f = startFret - 1; f <= startFret + 5; f++) {
      if (f < 0) continue;
      const interval = (NOTES.indexOf(noteAt(si,f)) - rootIdx + 12) % 12;
      if (intervals.includes(interval)) dots.push({ strIdx:si, fret:f, interval });
    }
  }
  return dots;
}

function Fretboard({ dots, startFret, numFrets=5 }) {
  const LEFT=36,RIGHT=32,TOP=28,FRET_H=44,STR_W=36;
  const W=LEFT+5*STR_W+RIGHT, H=TOP+numFrets*FRET_H+8;
  const sx=i=>LEFT+i*STR_W, fy=f=>TOP+f*FRET_H, dotY=f=>TOP+(f-startFret+0.5)*FRET_H;
  const showNut=startFret<=1;
  const dotMap={};
  dots.forEach(d=>{const k=`${d.strIdx}-${d.fret}`;if(!dotMap[k])dotMap[k]=d;else if(d.interval===0)dotMap[k]=d;});
  const finalDots=Object.values(dotMap);
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block',maxWidth:340,margin:'0 auto'}}>
      {STRING_NAMES.map((name,i)=>(<text key={i} x={sx(i)} y={TOP-8} textAnchor="middle" fontSize="11" fill="#666" fontFamily="monospace">{name}</text>))}
      {showNut?<rect x={sx(0)} y={TOP} width={sx(5)-sx(0)} height={5} fill="#bbb" rx={2}/>:<text x={sx(0)-6} y={TOP+FRET_H*0.55} fontSize="10" fill="#555" fontFamily="monospace" textAnchor="end">{startFret}</text>}
      {Array.from({length:numFrets}).map((_,f)=>(<line key={f} x1={sx(0)} y1={fy(f+1)} x2={sx(5)} y2={fy(f+1)} stroke="#3a3a3a" strokeWidth={2}/>))}
      {Array.from({length:6}).map((_,i)=>(<line key={i} x1={sx(i)} y1={TOP+(showNut?5:0)} x2={sx(i)} y2={fy(numFrets)} stroke="#555" strokeWidth={1}/>))}
      {Array.from({length:numFrets}).map((_,f)=>{const fn=startFret+f+1;if(fn<=0)return null;return(<text key={f} x={sx(5)+10} y={fy(f+1)-2} fontSize="10" fill="#555" fontFamily="monospace" dominantBaseline="auto">{fn}</text>);})}
      {finalDots.map((d,idx)=>(<g key={idx}><circle cx={sx(d.strIdx)} cy={dotY(d.fret)} r={13} fill={DOT_COLOR(d.interval)}/><text x={sx(d.strIdx)} y={dotY(d.fret)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fontFamily="monospace" fill={DOT_FG_C(d.interval)}>{d.interval===0?'R':''}</text></g>))}
    </svg>
  );
}

function FullNeckFretboard({ dots }) {
  const FRETS=24,FRET_H=32,STR_W=36,LEFT=28,TOP=24;
  const W=LEFT+5*STR_W+20, H=TOP+FRETS*FRET_H+16;
  const sx=i=>LEFT+i*STR_W, fretTop=f=>TOP+(f-1)*FRET_H, dotY=f=>TOP+(f-0.5)*FRET_H;
  const dotMap={};
  dots.forEach(d=>{const k=`${d.strIdx}-${d.fret}`;if(!dotMap[k])dotMap[k]=d;else if(d.interval===0)dotMap[k]=d;});
  const finalDots=Object.values(dotMap);
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block',maxWidth:W*1.4,margin:'0 auto'}}>
      {STRING_NAMES.map((name,i)=>(<text key={i} x={sx(i)} y={TOP-8} textAnchor="middle" fontSize="11" fill="#666" fontFamily="monospace">{name}</text>))}
      <rect x={sx(0)} y={TOP} width={sx(5)-sx(0)} height={4} fill="#aaa" rx={1}/>
      {Array.from({length:FRETS}).map((_,f)=>(<line key={f} x1={sx(0)} y1={fretTop(f+1)} x2={sx(5)} y2={fretTop(f+1)} stroke="#2e2e2e" strokeWidth={1.5}/>))}
      {Array.from({length:6}).map((_,i)=>(<line key={i} x1={sx(i)} y1={TOP+4} x2={sx(i)} y2={TOP+FRETS*FRET_H} stroke="#333" strokeWidth={1}/>))}
      {Array.from({length:FRETS}).map((_,f)=>(<text key={f} x={sx(5)+10} y={dotY(f+1)} fontSize="9" fill="#444" fontFamily="monospace" dominantBaseline="middle">{f+1}</text>))}
      {[3,5,7,9,15,17,19,21].map(f=>(<circle key={f} cx={sx(2)+STR_W/2} cy={dotY(f)} r={4} fill="#2a2a2a"/>))}
      {[12,24].map(f=>(<g key={f}><circle cx={sx(1)+STR_W/2} cy={dotY(f)} r={4} fill="#2a2a2a"/><circle cx={sx(3)+STR_W/2} cy={dotY(f)} r={4} fill="#2a2a2a"/></g>))}
      {finalDots.map((d,i)=>(<g key={i}><circle cx={sx(d.strIdx)} cy={dotY(d.fret)} r={11} fill={DOT_COLOR(d.interval)}/><text x={sx(d.strIdx)} y={dotY(d.fret)} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fontFamily="monospace" fill={DOT_FG_C(d.interval)}>{d.interval===0?'R':''}</text></g>))}
    </svg>
  );
}

function Legend({ mode }) {
  const intervals=PENTA_INTERVALS[mode], labels=mode==='minor'?MINOR_DEGREES:MAJOR_DEGREES;
  const names=mode==='minor'?{0:'Root',3:'Minor 3rd',5:'4th',7:'5th',10:'Minor 7th'}:{0:'Root',2:'Major 2nd',4:'Major 3rd',7:'5th',9:'Major 6th'};
  return(<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{intervals.map(i=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><div style={{width:20,height:20,borderRadius:'50%',background:DOT_COLOR(i),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:700,color:DOT_FG_C(i),flexShrink:0}}>{labels[i]}</div>{names[i]}</div>))}</div>);
}

const VIEWS=[{id:'shape',label:'By Shape'},{id:'neck',label:'Full Neck'},{id:'connect',label:'CAGED Link'}];

export default function PentaExplorer() {
  const[selKey,setKey]=useState('A'),[selMode,setMode]=useState('minor'),[selShape,setShape]=useState(1),[selView,setView]=useState('shape');
  const mode=selMode, rootFret=rootFretLowE(selKey), shapeInfo=SHAPE_WINDOWS[selShape], shapeStart=rootFret+shapeInfo.start;
  const shapeDots=getPentaDots(selKey,mode,shapeInfo.start);
  const allDots=[];
  for(let si=0;si<6;si++)for(let f=1;f<=24;f++){const interval=(NOTES.indexOf(noteAt(si,f))-NOTES.indexOf(selKey)+12)%12;if(PENTA_INTERVALS[mode].includes(interval))allDots.push({strIdx:si,fret:f,interval});}
  const ki=NOTES.indexOf(selKey), relativeKey=mode==='minor'?NOTES[(ki+3)%12]:NOTES[(ki+9)%12];

  return(<div style={{background:'#0e0e0e',minHeight:'100vh',color:'#e8e8e8',fontFamily:'system-ui,sans-serif',padding:16,maxWidth:520,margin:'0 auto'}}>
    <div style={{marginBottom:16,borderBottom:'1px solid #222',paddingBottom:14}}>
      <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700,color:'#c8a84b',letterSpacing:'0.05em'}}>Pentatonic Explorer</div>
      <div style={{fontSize:'0.75rem',color:'#666',marginTop:2}}>5 shapes · Major & minor · Connected to CAGED</div>
    </div>
    <div style={{display:'flex',gap:0,marginBottom:14,background:'#141414',borderRadius:8,padding:4}}>{['minor','major'].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:6,cursor:'pointer',fontSize:'0.82rem',border:'none',fontFamily:'Georgia,serif',fontWeight:600,background:m===mode?'#2a2a2a':'transparent',color:m===mode?'#c8a84b':'#555'}}>{m==='minor'?'Minor Pentatonic':'Major Pentatonic'}</button>))}</div>
    <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:8,padding:'10px 12px',marginBottom:14,fontSize:'0.78rem',color:'#aaa',lineHeight:1.6}}>
      {mode==='minor'?<><span style={{color:'#e05c5c',fontWeight:700}}>Minor pentatonic</span> — dark, bluesy, emotional. The scale underneath almost every rock and metal solo ever recorded. Drop the 2nd and b6 from natural minor and what's left works over almost anything.</>:<><span style={{color:'#c8a84b',fontWeight:700}}>Major pentatonic</span> — bright, country, soulful. Drop the 4th and 7th from the major scale. Sounds like wide open spaces. The country and southern rock secret weapon.</>}
      <div style={{marginTop:6,fontSize:'0.72rem',color:'#555'}}>Relative {mode==='minor'?'major':'minor'}: same 5 shapes also spell out <span style={{color:'#7ec8a4'}}>{NOTE_DISPLAY(relativeKey)} {mode==='minor'?'major':'minor'} pentatonic</span>. Same notes, different home base.</div>
    </div>
    <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#555',marginBottom:7}}>Root / Key</div>
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>{ALL_KEYS.map(k=>(<button key={k} onClick={()=>setKey(k)} style={{fontFamily:'monospace',fontSize:'0.8rem',padding:'5px 9px',borderRadius:4,cursor:'pointer',minWidth:36,border:k===selKey?'1px solid #7ec8a4':'1px solid #2e2e2e',background:k===selKey?'#7ec8a4':'#1a1a1a',color:k===selKey?'#000':'#888',fontWeight:k===selKey?700:400}}>{NOTE_DISPLAY(k)}</button>))}</div>
    <div style={{display:'flex',gap:0,marginBottom:16,background:'#141414',borderRadius:8,padding:4}}>{VIEWS.map(v=>(<button key={v.id} onClick={()=>setView(v.id)} style={{flex:1,padding:'7px 4px',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',border:'none',background:v.id===selView?'#2a2a2a':'transparent',color:v.id===selView?'#c8a84b':'#666',fontWeight:v.id===selView?600:400}}>{v.label}</button>))}</div>

    {selView==='shape'&&(<div>
      <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#555',marginBottom:7}}>Shape</div>
      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>{Object.keys(SHAPE_WINDOWS).map(s=>{const sh=SHAPE_WINDOWS[s],active=parseInt(s)===selShape;return(<button key={s} onClick={()=>setShape(parseInt(s))} style={{flex:1,padding:'8px 6px',borderRadius:6,cursor:'pointer',border:active?'2px solid #c8a84b':'2px solid #2e2e2e',background:active?'#c8a84b':'#1a1a1a',color:active?'#000':'#888',fontFamily:'Georgia,serif',fontSize:'0.95rem',fontWeight:700}}>{s}{sh.youKnow&&<div style={{fontSize:'0.55rem',color:active?'#000':'#e05c5c',marginTop:2}}>★</div>}</button>);})}</div>
      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
          <div><div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:'#c8a84b'}}>{shapeInfo.name}</div><div style={{fontSize:'0.72rem',color:'#555',marginTop:2}}>CAGED: {shapeInfo.cagedShape} shape · base fret {shapeStart}</div></div>
          <div style={{background:'rgba(200,168,75,0.1)',border:'1px solid #c8a84b',borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#555'}}>fret</div><div style={{fontFamily:'Georgia,serif',fontSize:'1.4rem',color:'#c8a84b',lineHeight:1}}>{shapeStart}</div></div>
        </div>
        <div style={{fontSize:'0.78rem',color:'#aaa',lineHeight:1.6}}>{shapeInfo.description}</div>
      </div>
      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.88rem',color:'#c8a84b',marginBottom:14}}>{NOTE_DISPLAY(selKey)} {mode} pentatonic · Shape {selShape} · fret {shapeStart}</div>
        <Fretboard dots={shapeDots} startFret={shapeStart} numFrets={5}/>
        <div style={{marginTop:12}}><Legend mode={mode}/></div>
      </div>
      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.85rem',color:'#7ec8a4',marginBottom:10}}>All 5 shapes for {NOTE_DISPLAY(selKey)} {mode} pentatonic</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7}}>{Object.keys(SHAPE_WINDOWS).map(s=>{const sh=SHAPE_WINDOWS[s],sf=rootFret+sh.start,active=parseInt(s)===selShape;return(<div key={s} onClick={()=>setShape(parseInt(s))} style={{cursor:'pointer',padding:'8px 4px',borderRadius:6,textAlign:'center',border:active?'1px solid #c8a84b':'1px solid #2e2e2e',background:active?'rgba(200,168,75,0.1)':'#1e1e1e'}}><div style={{fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,color:active?'#c8a84b':'#888'}}>{s}</div><div style={{fontFamily:'monospace',fontSize:'0.62rem',color:'#555'}}>fret {sf}</div><div style={{fontSize:'0.58rem',color:'#444',marginTop:2}}>{sh.cagedShape} shape</div></div>);})}</div>
        <p style={{fontSize:'0.7rem',color:'#444',marginTop:10,lineHeight:1.5}}>Same {NOTE_DISPLAY(selKey)} {mode} scale — 5 positions covering the whole neck. They connect end to end. Tap any to explore.</p>
      </div>
    </div>)}

    {selView==='neck'&&(<div>
      <div style={{color:'#aaa',fontSize:'0.78rem',lineHeight:1.6,marginBottom:14}}>Every note of <span style={{color:'#c8a84b'}}>{NOTE_DISPLAY(selKey)} {mode} pentatonic</span> across all 24 frets. Red dots are your root. See how the 5 shapes tile the neck and repeat at fret 12.</div>
      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.88rem',color:'#c8a84b',marginBottom:14}}>{NOTE_DISPLAY(selKey)} {mode} pentatonic · full neck</div>
        <FullNeckFretboard dots={allDots}/>
      </div>
      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14,marginBottom:14}}><Legend mode={mode}/></div>
      <div style={{background:'#141414',borderRadius:8,padding:12,fontSize:'0.75rem',color:'#555',lineHeight:1.7}}>Notice the pattern repeating every 12 frets. The 5 shapes connect end to end with no gaps — the whole neck is covered.</div>
    </div>)}

    {selView==='connect'&&(<div>
      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14,marginBottom:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',color:'#c8a84b',marginBottom:10}}>The connection nobody shows you</div>
        <div style={{fontSize:'0.8rem',color:'#aaa',lineHeight:1.7}}>The 5 pentatonic shapes live inside the 5 CAGED shapes. Same positions on the neck. When you know which CAGED shape you're in, you automatically know which pentatonic shape is right under your hand. No jumping around — it's all one system.</div>
      </div>
      {Object.keys(SHAPE_WINDOWS).map(s=>{const sh=SHAPE_WINDOWS[s],sf=rootFret+sh.start,active=parseInt(s)===selShape,dots=getPentaDots(selKey,mode,sh.start);return(<div key={s} onClick={()=>{setShape(parseInt(s));setView('shape');}} style={{background:'#1a1a1a',border:active?'1px solid #c8a84b':'1px solid #2e2e2e',borderRadius:10,padding:14,marginBottom:10,cursor:'pointer'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><div><div style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',fontWeight:700,color:active?'#c8a84b':'#e8e8e8'}}>Pentatonic Shape {s}</div><div style={{fontSize:'0.72rem',color:'#555',marginTop:2}}>lives inside CAGED {sh.cagedShape} shape · fret {sf}</div></div><div style={{display:'flex',gap:6,alignItems:'center'}}><div style={{background:'rgba(200,168,75,0.1)',border:'1px solid #c8a84b',borderRadius:4,padding:'3px 8px',fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,color:'#c8a84b'}}>{sh.cagedShape}</div><div style={{fontFamily:'monospace',fontSize:'0.85rem',color:'#555'}}>#{s}</div></div></div><div style={{fontSize:'0.72rem',color:'#666',lineHeight:1.5,marginBottom:10}}>{sh.description}</div><Fretboard dots={dots} startFret={sf} numFrets={4}/></div>);})}
      <div style={{background:'#141414',borderRadius:8,padding:12,marginTop:4,fontSize:'0.75rem',color:'#555',lineHeight:1.7}}><span style={{color:'#7ec8a4'}}>Practical tip:</span> When you're playing a chord in the CAGED system, the pentatonic shape that shares that position contains your chord tones plus two more notes that connect them smoothly. That's your solo vocabulary right there — no position change needed.</div>
    </div>)}
  </div>);
}
