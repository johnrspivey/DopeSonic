import { useState } from "react";
import {
  NOTES, NOTE_DISPLAY, STRING_NAMES, PAGE_STYLE,
  getBaseFret, getRootFret, Fretboard, DiagramCard, KeySelector
} from "../lib/fretboard";

// Movable minor CAGED shapes — the two reliable barre-chord forms every guitarist actually uses.
// Built off open Em and Am. (C/G/D minor shapes exist in theory but need awkward mutes/stretches
// most players skip — these two cover the real-world use case.)
const CAGED_MINOR_SHAPES = {
  E: { name:'E Shape (minor)', rootStr:0, youKnow:true,
    description:'Root on low E. Open Em shape barred up the neck. Your minor home base.',
    f:[{o:0,t:'root'},{o:2,t:'fifth'},{o:2,t:'root'},{o:0,t:'third'},{o:0,t:'fifth'},{o:0,t:'root'}] },
  A: { name:'A Shape (minor)', rootStr:1, youKnow:false,
    description:'Root on A string. Open Am shape barred up the neck. Low E muted.',
    f:[{o:null,t:'mute'},{o:0,t:'root'},{o:2,t:'fifth'},{o:2,t:'root'},{o:1,t:'third'},{o:0,t:'fifth'}] },
};

// Minor pentatonic — locked to minor. No mode toggle, no mental gymnastics.
const OPEN = [4,9,2,7,11,4];
function noteAt(strIdx,fret){ return NOTES[(OPEN[strIdx]+fret)%12]; }
const PENTA_MINOR = [0,3,5,7,10];
const MINOR_DEGREES = {0:'R',3:'b3',5:'4',7:'5',10:'b7'};
const DEGREE_COLORS = {0:'#e05c5c',3:'#a87ec8',5:'#5ca8e0',7:'#7ec8a4',10:'#c8a84b'};
const DEGREE_FG = {0:'#fff',3:'#fff',5:'#fff',7:'#000',10:'#000'};

const SHAPE_WINDOWS = {
  1:{start:0,name:'Shape 1',cagedShape:'E',youKnow:true,description:'Root on low E. The classic box.'},
  2:{start:2,name:'Shape 2',cagedShape:'D',description:'Root on A string. Connects above Shape 1.'},
  3:{start:4,name:'Shape 3',cagedShape:'C',description:'Root on D string. Great for melodic runs.'},
  4:{start:7,name:'Shape 4',cagedShape:'A',description:'Root on low E (octave up). Zakk Wylde lives here.'},
  5:{start:9,name:'Shape 5',cagedShape:'G',description:'Root on A string. Connects back to Shape 1 at fret 12.'},
};

function rootFretLowE(key){ const f=(NOTES.indexOf(key)-OPEN[0]+12)%12; return f===0?12:f; }

function getPentaDots(key,windowStart){
  const rootIdx=NOTES.indexOf(key), dots=[], startFret=rootFretLowE(key)+windowStart;
  for(let si=0;si<6;si++)for(let f=startFret-1;f<=startFret+5;f++){
    if(f<0)continue;
    const interval=(NOTES.indexOf(noteAt(si,f))-rootIdx+12)%12;
    if(PENTA_MINOR.includes(interval))dots.push({strIdx:si,fret:f,interval});
  }
  return dots;
}

function PentaFretboard({dots,startFret,numFrets=5}){
  const LEFT=36,RIGHT=32,TOP=28,FRET_H=44,STR_W=36;
  const W=LEFT+5*STR_W+RIGHT,H=TOP+numFrets*FRET_H+8;
  const sx=i=>LEFT+i*STR_W, dotY=f=>TOP+(f-startFret+0.5)*FRET_H;
  const showNut=startFret<=1;
  const dotMap={}; dots.forEach(d=>{const k=`${d.strIdx}-${d.fret}`; if(!dotMap[k])dotMap[k]=d; else if(d.interval===0)dotMap[k]=d;});
  const finalDots=Object.values(dotMap);
  return(<svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block',maxWidth:340,margin:'0 auto'}}>
    {STRING_NAMES.map((name,i)=>(<text key={i} x={sx(i)} y={TOP-8} textAnchor="middle" fontSize="11" fill="#666" fontFamily="monospace">{name}</text>))}
    {showNut?<rect x={sx(0)} y={TOP} width={sx(5)-sx(0)} height={5} fill="#bbb" rx={2}/>:<text x={sx(0)-6} y={TOP+FRET_H*0.55} fontSize="10" fill="#555" fontFamily="monospace" textAnchor="end">{startFret}</text>}
    {Array.from({length:numFrets}).map((_,f)=>(<line key={f} x1={sx(0)} y1={TOP+f*FRET_H+FRET_H} x2={sx(5)} y2={TOP+f*FRET_H+FRET_H} stroke="#3a3a3a" strokeWidth={2}/>))}
    {Array.from({length:6}).map((_,i)=>(<line key={i} x1={sx(i)} y1={TOP+(showNut?5:0)} x2={sx(i)} y2={TOP+numFrets*FRET_H} stroke="#555" strokeWidth={1}/>))}
    {Array.from({length:numFrets}).map((_,f)=>{const fn=startFret+f+1;if(fn<=0)return null;return(<text key={f} x={sx(5)+10} y={TOP+f*FRET_H+FRET_H-2} fontSize="10" fill="#555" fontFamily="monospace">{fn}</text>);})}
    {finalDots.map((d,idx)=>(<g key={idx}><circle cx={sx(d.strIdx)} cy={dotY(d.fret)} r={13} fill={DEGREE_COLORS[d.interval]}/><text x={sx(d.strIdx)} y={dotY(d.fret)} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fontFamily="monospace" fill={DEGREE_FG[d.interval]}>{d.interval===0?'R':''}</text></g>))}
  </svg>);
}

export default function MinorExplorer(){
  const [selKey,setKey]=useState('A');
  const [selChordShape,setChordShape]=useState('E');
  const [selPentaShape,setPentaShape]=useState(1);

  const chordShape=CAGED_MINOR_SHAPES[selChordShape];
  const ki=NOTES.indexOf(selKey);
  const minorThird=NOTES[(ki+3)%12], fifth=NOTES[(ki+7)%12];
  const base=getBaseFret(chordShape,selKey), rf=getRootFret(chordShape.rootStr,selKey);
  const chordDots=chordShape.f.map((s,i)=>s.o===null?null:{strIdx:i,fret:base+s.o,type:s.t}).filter(Boolean);
  const chordMutes=chordShape.f.map((s,i)=>s.o===null?i:null).filter(x=>x!==null);
  const maxOff=Math.max(...chordShape.f.filter(s=>s.o!==null).map(s=>s.o));

  const rootFret=rootFretLowE(selKey);
  const pentaShapeInfo=SHAPE_WINDOWS[selPentaShape];
  const pentaStart=rootFret+pentaShapeInfo.start;
  const pentaDots=getPentaDots(selKey,pentaShapeInfo.start);

  return(<div style={PAGE_STYLE}>
    <div style={{marginBottom:16,borderBottom:'1px solid #222',paddingBottom:14}}>
      <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700,color:'#e05c5c',letterSpacing:'0.05em'}}>Minor Explorer</div>
      <div style={{fontSize:'0.75rem',color:'#666',marginTop:2}}>CAGED minor shapes + minor pentatonic — dedicated, no toggling</div>
    </div>

    <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#555',marginBottom:7}}>Key</div>
    <div style={{marginBottom:20}}><KeySelector selKey={selKey} onChange={setKey}/></div>

    <div style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',color:'#e05c5c',marginBottom:10,borderTop:'1px solid #222',paddingTop:16}}>Minor CAGED Chords</div>
    <div style={{fontSize:'0.72rem',color:'#666',marginBottom:12,lineHeight:1.6}}>The two moveable minor barre shapes every guitarist actually uses — built off open Em and Am. Bar them anywhere on the neck to play any minor chord.</div>
    <div style={{display:'flex',gap:7,marginBottom:16}}>
      {Object.keys(CAGED_MINOR_SHAPES).map(k=>(
        <button key={k} onClick={()=>setChordShape(k)} style={{flex:1,fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,padding:'7px 10px',borderRadius:6,cursor:'pointer',border:k===selChordShape?'2px solid #e05c5c':'2px solid #2e2e2e',background:k===selChordShape?'#e05c5c':'#1a1a1a',color:k===selChordShape?'#000':'#888'}}>
          {k}m{CAGED_MINOR_SHAPES[k].youKnow?' ★':''}
        </button>
      ))}
    </div>
    <DiagramCard accent="#e05c5c">
      <div style={{display:'flex',alignItems:'flex-end',gap:14,flexWrap:'wrap',marginBottom:10}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'2.2rem',fontWeight:700,color:'#e8e8e8',lineHeight:1}}>{NOTE_DISPLAY(selKey)} Minor</div>
          <div style={{display:'inline-block',marginTop:5,padding:'2px 9px',border:'1px solid #e05c5c',borderRadius:4,color:'#e05c5c',fontSize:'0.78rem',fontFamily:'Georgia,serif'}}>{chordShape.name}{chordShape.youKnow?' · ★ Your home base':''}</div>
        </div>
        <div style={{marginBottom:8,textAlign:'center'}}><div style={{fontSize:'0.65rem',color:'#555',fontFamily:'monospace'}}>base fret</div><div style={{fontFamily:'Georgia,serif',fontSize:'2rem',color:'#e05c5c',lineHeight:1}}>{base===0?'open':base}</div></div>
      </div>
      {[['Root',<span style={{color:'#e05c5c',fontWeight:700}}>{selKey} — {STRING_NAMES[chordShape.rootStr]} string, fret {rf}</span>],
        ['b3rd',<span style={{color:'#a87ec8'}}>{minorThird}</span>],
        ['5th',<span style={{color:'#5ca8e0'}}>{fifth}</span>],
        ['Tip',<span style={{color:'#aaa'}}>{chordShape.description}</span>]].map(([label,val])=>(
        <div key={label} style={{display:'flex',gap:8,marginBottom:6,fontSize:'0.8rem',lineHeight:1.5}}>
          <span style={{color:'#e05c5c',fontFamily:'monospace',fontSize:'0.72rem',minWidth:44,paddingTop:1,flexShrink:0}}>{label}</span>{val}
        </div>
      ))}
    </DiagramCard>
    <DiagramCard title={`${NOTE_DISPLAY(selKey)} Minor · ${chordShape.name} · position ${base===0?'open':base}`} accent="#e05c5c">
      <Fretboard dots={chordDots} mutes={chordMutes} startFret={Math.max(0,base-1)} numFrets={maxOff+2} allSixStrings={true}/>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:12}}>
        {[['#e05c5c','#fff','R',`Root (${selKey})`],['#a87ec8','#fff','b3',`b3 (${minorThird})`],['#5ca8e0','#fff','5',`5th (${fifth})`]].map(([bg,fg,sym,lbl])=>(
          <div key={lbl} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><div style={{width:18,height:18,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.55rem',fontWeight:700,color:fg,flexShrink:0}}>{sym}</div>{lbl}</div>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><span style={{color:'#888',fontSize:'0.95rem'}}>x</span> Muted</div>
      </div>
    </DiagramCard>

    <div style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',color:'#e05c5c',marginBottom:10,borderTop:'1px solid #222',paddingTop:16,marginTop:6}}>Minor Pentatonic</div>
    <div style={{fontSize:'0.72rem',color:'#666',marginBottom:12,lineHeight:1.6}}>All 5 shapes, locked to minor. The scale under almost every rock and metal solo ever recorded.</div>
    <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
      {Object.keys(SHAPE_WINDOWS).map(s=>{const sh=SHAPE_WINDOWS[s],active=parseInt(s)===selPentaShape;return(
        <button key={s} onClick={()=>setPentaShape(parseInt(s))} style={{flex:1,padding:'8px 6px',borderRadius:6,cursor:'pointer',border:active?'2px solid #e05c5c':'2px solid #2e2e2e',background:active?'#e05c5c':'#1a1a1a',color:active?'#000':'#888',fontFamily:'Georgia,serif',fontSize:'0.95rem',fontWeight:700}}>{s}{sh.youKnow&&<div style={{fontSize:'0.55rem',color:active?'#000':'#e05c5c',marginTop:2}}>★</div>}</button>
      );})}
    </div>
    <DiagramCard accent="#e05c5c">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div><div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:'#e05c5c'}}>{pentaShapeInfo.name}</div><div style={{fontSize:'0.72rem',color:'#555',marginTop:2}}>CAGED: {pentaShapeInfo.cagedShape} shape · base fret {pentaStart}</div></div>
        <div style={{background:'rgba(224,92,92,0.1)',border:'1px solid #e05c5c',borderRadius:5,padding:'4px 10px',textAlign:'center'}}><div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#555'}}>fret</div><div style={{fontFamily:'Georgia,serif',fontSize:'1.4rem',color:'#e05c5c',lineHeight:1}}>{pentaStart}</div></div>
      </div>
      <div style={{fontSize:'0.78rem',color:'#aaa',lineHeight:1.6}}>{pentaShapeInfo.description}</div>
    </DiagramCard>
    <DiagramCard title={`${NOTE_DISPLAY(selKey)} minor pentatonic · Shape ${selPentaShape} · fret ${pentaStart}`} accent="#e05c5c">
      <PentaFretboard dots={pentaDots} startFret={pentaStart} numFrets={5}/>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
        {PENTA_MINOR.map(i=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><div style={{width:20,height:20,borderRadius:'50%',background:DEGREE_COLORS[i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:700,color:DEGREE_FG[i],flexShrink:0}}>{MINOR_DEGREES[i]}</div>{{0:'Root',3:'Minor 3rd',5:'4th',7:'5th',10:'Minor 7th'}[i]}</div>))}
      </div>
    </DiagramCard>
    <DiagramCard title={`All 5 shapes for ${NOTE_DISPLAY(selKey)} minor pentatonic`} accent="#e05c5c">
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7}}>
        {Object.keys(SHAPE_WINDOWS).map(s=>{const sh=SHAPE_WINDOWS[s],sf=rootFret+sh.start,active=parseInt(s)===selPentaShape;return(
          <div key={s} onClick={()=>setPentaShape(parseInt(s))} style={{cursor:'pointer',padding:'8px 4px',borderRadius:6,textAlign:'center',border:active?'1px solid #e05c5c':'1px solid #2e2e2e',background:active?'rgba(224,92,92,0.1)':'#1e1e1e'}}>
            <div style={{fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,color:active?'#e05c5c':'#888'}}>{s}</div>
            <div style={{fontFamily:'monospace',fontSize:'0.62rem',color:'#555'}}>fret {sf}</div>
            <div style={{fontSize:'0.58rem',color:'#444',marginTop:2}}>{sh.cagedShape} shape</div>
          </div>
        );})}
      </div>
      <p style={{fontSize:'0.7rem',color:'#444',marginTop:10,lineHeight:1.5}}>Same {NOTE_DISPLAY(selKey)} minor pentatonic scale — 5 positions covering the whole neck. They connect end to end.</p>
    </DiagramCard>
  </div>);
}
