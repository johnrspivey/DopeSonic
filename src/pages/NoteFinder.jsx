import { useState } from "react";

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_DISPLAY = {
  'C':'C', 'C#':'C#', 'D':'D', 'D#':'D#', 'E':'E',
  'F':'F', 'F#':'F#', 'G':'G', 'G#':'G#', 'A':'A',
  'A#':'A#', 'B':'B'
};
const NOTE_ALT = {
  'C#':'Db', 'D#':'Eb', 'F#':'Gb', 'G#':'Ab', 'A#':'Bb'
};
const STRING_NAMES = ['E','A','D','G','B','e'];
const OPEN = [4,9,2,7,11,4];

function noteAt(strIdx, fret) {
  return NOTES[(OPEN[strIdx] + fret) % 12];
}

const SINGLE_DOTS = [3,5,7,9,15,17,19,21];
const DOUBLE_DOTS = [12,24];

export default function NoteFinder() {
  const [selNote, setNote] = useState('A');

  const FRETS = 24;
  const FRET_H = 24;
  const STR_W  = 36;
  const LEFT   = 28;
  const TOP    = 24;
  const W      = LEFT + 5*STR_W + 20;
  const H      = TOP + FRETS*FRET_H + 16;

  const sx      = i => LEFT + i*STR_W;
  const fretTop = f => TOP + (f-1)*FRET_H;
  const dotY    = f => TOP + (f-0.5)*FRET_H;

  const hits = [];
  for (let si = 0; si < 6; si++) {
    for (let f = 0; f <= FRETS; f++) {
      if (noteAt(si, f) === selNote) hits.push({ si, f });
    }
  }
  const openHits    = hits.filter(h => h.f === 0);
  const frettedHits = hits.filter(h => h.f > 0);
  const isSharp     = NOTE_ALT[selNote];

  return (
    <div style={{background:'#0e0e0e',minHeight:'100vh',color:'#e8e8e8',
      fontFamily:'system-ui,sans-serif',padding:16,maxWidth:480,margin:'0 auto'}}>

      <div style={{marginBottom:16,borderBottom:'1px solid #222',paddingBottom:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700,
          color:'#c8a84b',letterSpacing:'0.05em'}}>Note Finder</div>
        <div style={{fontSize:'0.75rem',color:'#666',marginTop:2}}>
          Every position of every note · 24 frets · All 6 strings
        </div>
      </div>

      <div style={{fontSize:'0.65rem',textTransform:'uppercase',
        letterSpacing:'0.1em',color:'#555',marginBottom:10}}>Select a note</div>

      <div style={{display:'flex',gap:6,marginBottom:6}}>
        {['C','D','E','F','G','A','B'].map(n=>(
          <button key={n} onClick={()=>setNote(n)}
            style={{flex:1,padding:'10px 4px',borderRadius:6,cursor:'pointer',
              fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,
              border:n===selNote?'2px solid #c8a84b':'2px solid #2e2e2e',
              background:n===selNote?'#c8a84b':'#1a1a1a',
              color:n===selNote?'#000':'#888',transition:'all 0.12s'}}>
            {n}
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:6,marginBottom:18}}>
        {['C#','D#',null,'F#','G#','A#',null].map((n,i)=>(
          <div key={i} style={{flex:1}}>
            {n ? (
              <button onClick={()=>setNote(n)}
                style={{width:'100%',padding:'8px 2px',borderRadius:6,cursor:'pointer',
                  fontFamily:'Georgia,serif',fontSize:'0.75rem',fontWeight:700,
                  border:n===selNote?'2px solid #7ec8a4':'2px solid #2e2e2e',
                  background:n===selNote?'#7ec8a4':'#141414',
                  color:n===selNote?'#000':'#666',transition:'all 0.12s',lineHeight:1.2}}>
                {NOTE_DISPLAY[n]}<br/>
                <span style={{fontSize:'0.6rem',opacity:0.7}}>{NOTE_ALT[n]}</span>
              </button>
            ) : <div/>}
          </div>
        ))}
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',
        borderRadius:10,padding:'12px 14px',marginBottom:14,
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:'2.4rem',
            fontWeight:700,color:'#c8a84b',lineHeight:1}}>
            {selNote}
            {isSharp&&<span style={{fontSize:'1rem',color:'#666',
              marginLeft:8,fontFamily:'system-ui'}}>/ {NOTE_ALT[selNote]}</span>}
          </div>
          <div style={{fontSize:'0.72rem',color:'#555',marginTop:4}}>
            {hits.length} positions on a 24-fret neck
            {openHits.length>0&&` · ${openHits.length} open string${openHits.length>1?'s':''}`}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          {openHits.map(h=>(
            <div key={h.si} style={{fontSize:'0.75rem',color:'#7ec8a4',fontFamily:'monospace'}}>
              Open {STRING_NAMES[h.si]} string
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',
        borderRadius:10,padding:12,marginBottom:14,overflowX:'auto'}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}
          style={{display:'block',maxWidth:W*1.3,margin:'0 auto'}}>
          {STRING_NAMES.map((name,i)=>(
            <text key={i} x={sx(i)} y={TOP-8} textAnchor="middle"
              fontSize="11" fill="#666" fontFamily="monospace">{name}</text>
          ))}
          <rect x={sx(0)} y={TOP} width={sx(5)-sx(0)} height={4} fill="#aaa" rx={1}/>
          {Array.from({length:FRETS}).map((_,f)=>(
            <line key={f} x1={sx(0)} y1={fretTop(f+1)} x2={sx(5)} y2={fretTop(f+1)}
              stroke="#2e2e2e" strokeWidth={f===11||f===23?2.5:1.5}/>
          ))}
          {STRING_NAMES.map((_,i)=>(
            <line key={i} x1={sx(i)} y1={TOP+4} x2={sx(i)} y2={TOP+FRETS*FRET_H}
              stroke="#444" strokeWidth={i===0?2:i===5?1:1.2}/>
          ))}
          {Array.from({length:FRETS}).map((_,f)=>(
            <text key={f} x={sx(5)+10} y={dotY(f+1)} fontSize="9" fill="#888"
              fontFamily="monospace" dominantBaseline="middle">{f+1}</text>
          ))}
          {SINGLE_DOTS.map(f=>(
            <circle key={f} cx={sx(2)+STR_W/2} cy={dotY(f)} r={4} fill="#222"/>
          ))}
          {DOUBLE_DOTS.map(f=>(
            <g key={f}>
              <circle cx={sx(1)+STR_W/2} cy={dotY(f)} r={4} fill="#222"/>
              <circle cx={sx(3)+STR_W/2} cy={dotY(f)} r={4} fill="#222"/>
            </g>
          ))}
          {openHits.map(h=>(
            <g key={h.si}>
              <circle cx={sx(h.si)} cy={TOP-18} r={9} fill="#c8a84b"/>
              <text x={sx(h.si)} y={TOP-18} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fontWeight="700"
                fontFamily="monospace" fill="#000">{selNote}</text>
            </g>
          ))}
          {frettedHits.map((h,idx)=>(
            <g key={idx}>
              <circle cx={sx(h.si)} cy={dotY(h.f)} r={9} fill="#c8a84b"/>
              <text x={sx(h.si)} y={dotY(h.f)} textAnchor="middle"
                dominantBaseline="middle" fontSize="7" fontWeight="700"
                fontFamily="monospace" fill="#000">{selNote}</text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',
        borderRadius:10,padding:14}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'0.85rem',
          color:'#7ec8a4',marginBottom:10}}>
          All positions — {selNote}{isSharp?` / ${NOTE_ALT[selNote]}`:''}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {hits.map((h,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,
              padding:'6px 10px',background:'#141414',borderRadius:6,
              border:'1px solid #2e2e2e'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'#c8a84b',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'0.65rem',fontWeight:700,color:'#000',
                flexShrink:0,fontFamily:'monospace'}}>
                {h.f===0?'O':h.f}
              </div>
              <div>
                <div style={{fontFamily:'monospace',fontSize:'0.78rem',
                  color:'#e8e8e8',fontWeight:600}}>{STRING_NAMES[h.si]} string</div>
                <div style={{fontSize:'0.65rem',color:'#555'}}>
                  {h.f===0?'Open string':`Fret ${h.f}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:14,background:'#141414',borderRadius:8,
        padding:12,fontSize:'0.72rem',color:'#444',lineHeight:1.7,textAlign:'center'}}>
        Every note appears {Math.round(hits.length/2)} times per octave across the neck.
        The pattern repeats at the 12th fret — same notes, one octave higher.
      </div>
    </div>
  );
}
