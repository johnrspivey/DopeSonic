import { useState } from "react";
import { NOTES, NOTE_DISPLAY, ALL_KEYS, CAGED_SHAPES, getBaseFret, getRootFret, STRING_NAMES, DOT_COLORS, DOT_FG, DOT_TEXT, Fretboard } from "../lib/fretboard";

export default function CAGEDExplorer() {
  const [selShape, setShape] = useState('E');
  const [selKey,   setKey]   = useState('C');
  const shape=CAGED_SHAPES[selShape], ki=NOTES.indexOf(selKey);
  const third=NOTES[(ki+4)%12], fifth=NOTES[(ki+7)%12];
  const base=getBaseFret(shape,selKey), rf=getRootFret(shape.rootStr,selKey);

  // Build dots from shape
  const dots = shape.f.map((s,i)=>s.o===null?null:{strIdx:i,fret:base+s.o,type:s.t}).filter(Boolean);
  const mutes = shape.f.map((s,i)=>s.o===null?i:null).filter(x=>x!==null);
  const maxOff = Math.max(...shape.f.filter(s=>s.o!==null).map(s=>s.o));

  return (
    <div style={{background:'#0e0e0e',minHeight:'100vh',color:'#e8e8e8',fontFamily:'system-ui,sans-serif',padding:16,maxWidth:520,margin:'0 auto'}}>
      <div style={{marginBottom:16,borderBottom:'1px solid #222',paddingBottom:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700,color:'#c8a84b',letterSpacing:'0.05em'}}>CAGED Explorer</div>
        <div style={{fontSize:'0.75rem',color:'#666',marginTop:2}}>Every major chord · Every shape · Every position</div>
      </div>

      <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#555',marginBottom:7}}>Shape</div>
      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:16}}>
        {Object.keys(CAGED_SHAPES).map(k=>(
          <button key={k} onClick={()=>setShape(k)} style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,padding:'7px 14px',borderRadius:6,cursor:'pointer',border:k===selShape?'2px solid #c8a84b':'2px solid #2e2e2e',background:k===selShape?'#c8a84b':'#1a1a1a',color:k===selShape?'#000':'#888'}}>
            {k}{CAGED_SHAPES[k].youKnow?' ★':''}
          </button>
        ))}
      </div>

      <div style={{fontSize:'0.65rem',textTransform:'uppercase',letterSpacing:'0.1em',color:'#555',marginBottom:7}}>Chord</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:18}}>
        {ALL_KEYS.map(k=>(
          <button key={k} onClick={()=>setKey(k)} style={{fontFamily:'monospace',fontSize:'0.8rem',padding:'5px 9px',borderRadius:4,cursor:'pointer',minWidth:36,border:k===selKey?'1px solid #7ec8a4':'1px solid #2e2e2e',background:k===selKey?'#7ec8a4':'#1a1a1a',color:k===selKey?'#000':'#888',fontWeight:k===selKey?700:400}}>
            {NOTE_DISPLAY(k)}
          </button>
        ))}
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:'12px 14px',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:14,flexWrap:'wrap',marginBottom:10}}>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'2.2rem',fontWeight:700,color:'#e8e8e8',lineHeight:1}}>{NOTE_DISPLAY(selKey)} Major</div>
            <div style={{display:'inline-block',marginTop:5,padding:'2px 9px',border:'1px solid #c8a84b',borderRadius:4,color:'#c8a84b',fontSize:'0.78rem',fontFamily:'Georgia,serif'}}>
              {shape.name}{shape.youKnow?' · ★ Your home base':''}
            </div>
          </div>
          <div style={{marginBottom:8,textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',color:'#555',fontFamily:'monospace'}}>base fret</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'2rem',color:'#c8a84b',lineHeight:1}}>{base===0?'open':base}</div>
          </div>
        </div>
        {[['Root',<span style={{color:'#e05c5c',fontWeight:700}}>{selKey} — {STRING_NAMES[shape.rootStr]} string, fret {rf}</span>],
          ['3rd', <span style={{color:'#c8a84b'}}>{third}</span>],
          ['5th', <span style={{color:'#5ca8e0'}}>{fifth}</span>],
          ['Tip', <span style={{color:'#aaa'}}>{shape.description}</span>]].map(([label,val])=>(
          <div key={label} style={{display:'flex',gap:8,marginBottom:6,fontSize:'0.8rem',lineHeight:1.5}}>
            <span style={{color:'#c8a84b',fontFamily:'monospace',fontSize:'0.72rem',minWidth:44,paddingTop:1,flexShrink:0}}>{label}</span>
            {val}
          </div>
        ))}
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:16,marginBottom:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',color:'#c8a84b',marginBottom:14}}>
          {NOTE_DISPLAY(selKey)} Major · {shape.name} · position {base===0?'open':base}
        </div>
        <Fretboard dots={dots} mutes={mutes} startFret={Math.max(0,base-1)} numFrets={maxOff+2} allSixStrings={true}/>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:12}}>
          {[['#e05c5c','#fff','R',`Root (${selKey})`],['#c8a84b','#000','3',`3rd (${third})`],['#5ca8e0','#fff','5',`5th (${fifth})`]].map(([bg,fg,sym,lbl])=>(
            <div key={lbl} style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}>
              <div style={{width:18,height:18,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.55rem',fontWeight:700,color:fg,flexShrink:0}}>{sym}</div>
              {lbl}
            </div>
          ))}
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.72rem',color:'#aaa'}}><span style={{color:'#888',fontSize:'0.95rem'}}>x</span> Muted</div>
        </div>
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.85rem',color:'#7ec8a4',marginBottom:10}}>All 5 positions for {NOTE_DISPLAY(selKey)} Major</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7}}>
          {Object.keys(CAGED_SHAPES).map(k=>{
            const bf=getBaseFret(CAGED_SHAPES[k],selKey), active=k===selShape;
            return (
              <div key={k} onClick={()=>setShape(k)} style={{cursor:'pointer',padding:'8px 4px',borderRadius:6,textAlign:'center',border:active?'1px solid #c8a84b':'1px solid #2e2e2e',background:active?'rgba(200,168,75,0.1)':'#1e1e1e'}}>
                <div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:active?'#c8a84b':'#888'}}>{k}</div>
                <div style={{fontFamily:'monospace',fontSize:'0.65rem',color:'#555'}}>fret {bf===0?'open':bf}</div>
                {CAGED_SHAPES[k].youKnow&&<div style={{fontSize:'0.55rem',color:'#e05c5c',marginTop:2}}>★ yours</div>}
              </div>
            );
          })}
        </div>
        <p style={{fontSize:'0.7rem',color:'#444',marginTop:10,lineHeight:1.5}}>Same {NOTE_DISPLAY(selKey)} chord — 5 different neck positions. Tap any to explore.</p>
      </div>
    </div>
  );
}
