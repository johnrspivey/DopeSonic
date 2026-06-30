import { useState, useRef } from "react";

const KIT_PIECES = [
  { id:'kick',     label:'Kick',     abbr:'K',  color:'#e05c5c', defaultX:180, defaultY:280 },
  { id:'snare',    label:'Snare',    abbr:'S',  color:'#c8a84b', defaultX:180, defaultY:180 },
  { id:'hihat',    label:'Hi-Hat',   abbr:'HH', color:'#5ca8e0', defaultX:100, defaultY:130 },
  { id:'tom1',     label:'Tom 1',    abbr:'T1', color:'#a87ec8', defaultX:130, defaultY:100 },
  { id:'tom2',     label:'Tom 2',    abbr:'T2', color:'#7ec8a4', defaultX:230, defaultY:100 },
  { id:'floortom', label:'Floor Tom',abbr:'FT', color:'#e09440', defaultX:280, defaultY:180 },
  { id:'crash',    label:'Crash',    abbr:'CR', color:'#e05c8a', defaultX:60,  defaultY:80  },
  { id:'ride',     label:'Ride',     abbr:'RD', color:'#60c8b0', defaultX:310, defaultY:80  },
];

const SONGS = [
  {
    id:'seven', title:'Seven Nation Army', artist:'The White Stripes',
    bpm:123, feel:'Stomping · Powerful · Minimal',
    why:'Meg White proved you can shake stadiums with the simplest beat ever recorded. Four hits per measure. Pure intention.',
    youtubeId:'OP9tedxpYbw',
    levels:[
      { label:'Level 1 — The Backbone', description:'Just kick and snare. This is the heartbeat of almost every rock song ever made. Get this locked in and everything else is just decoration.', beats:8, pattern:[{piece:'kick',beat:1},{piece:'snare',beat:2},{piece:'kick',beat:3},{piece:'snare',beat:4},{piece:'kick',beat:5},{piece:'snare',beat:6},{piece:'kick',beat:7},{piece:'snare',beat:8}], tip:'Count out loud: ONE two THREE four. Kick on the numbers, snare on the words.' },
      { label:'Level 2 — Add the Hi-Hat', description:'Same kick and snare, but now your right hand hits the hi-hat on every beat too. Suddenly it sounds like a real drum beat.', beats:8, pattern:[{piece:'kick',beat:1},{piece:'hihat',beat:1},{piece:'snare',beat:2},{piece:'hihat',beat:2},{piece:'kick',beat:3},{piece:'hihat',beat:3},{piece:'snare',beat:4},{piece:'hihat',beat:4},{piece:'kick',beat:5},{piece:'hihat',beat:5},{piece:'snare',beat:6},{piece:'hihat',beat:6},{piece:'kick',beat:7},{piece:'hihat',beat:7},{piece:'snare',beat:8},{piece:'hihat',beat:8}], tip:'Your hands and foot are doing different things at the same time. Go slow. That coordination is the whole game.', newPieces:['hihat'] },
      { label:'Level 3 — The Intro Stomp', description:"The iconic intro. Floor tom and kick hit together — that's the stomp you've heard at every stadium.", beats:8, pattern:[{piece:'crash',beat:1},{piece:'kick',beat:1},{piece:'floortom',beat:1},{piece:'kick',beat:2},{piece:'floortom',beat:2},{piece:'kick',beat:3},{piece:'floortom',beat:3},{piece:'snare',beat:4},{piece:'kick',beat:5},{piece:'floortom',beat:5},{piece:'kick',beat:6},{piece:'floortom',beat:6},{piece:'kick',beat:7},{piece:'floortom',beat:7},{piece:'snare',beat:8}], tip:'Kick and floor tom locked together = the stomp. Feel it in your chest.', newPieces:['floortom','crash'] },
    ],
  },
  {
    id:'fade', title:'As You Fade Away', artist:'Jiinzo ft. whatsaheart',
    bpm:100, feel:'Emotional · Steady · Atmospheric',
    why:'A slow, steady heartbeat under something that feels big. The simplicity of the beat is what makes the song breathe.',
    youtubeId:'0jwJUa7RGRE',
    levels:[
      { label:'Level 1 — Slow Heartbeat', description:'Slower tempo, which actually makes it harder to stay steady. Kick on 1, snare on 3. Two hits per measure. Make each one count.', beats:8, pattern:[{piece:'kick',beat:1},{piece:'snare',beat:3},{piece:'kick',beat:5},{piece:'snare',beat:7}], tip:'Slower is harder than fast. Every hit has to land with intention. No rushing.' },
      { label:'Level 2 — Fill the Space', description:'Add the hi-hat on every beat. The space between kick and snare fills in and the groove starts to breathe.', beats:8, pattern:[{piece:'kick',beat:1},{piece:'hihat',beat:1},{piece:'hihat',beat:2},{piece:'snare',beat:3},{piece:'hihat',beat:3},{piece:'hihat',beat:4},{piece:'kick',beat:5},{piece:'hihat',beat:5},{piece:'hihat',beat:6},{piece:'snare',beat:7},{piece:'hihat',beat:7},{piece:'hihat',beat:8}], tip:'Let the hi-hat be quiet. It holds time, not attention.', newPieces:['hihat'] },
      { label:'Level 3 — The Full Feel', description:'Open hi-hat on the snare hits for that washy, atmospheric sound. Crash to open each section. This is where the emotion lives.', beats:8, pattern:[{piece:'crash',beat:1},{piece:'kick',beat:1},{piece:'hihat',beat:2},{piece:'snare',beat:3},{piece:'ride',beat:3},{piece:'hihat',beat:4},{piece:'kick',beat:5},{piece:'hihat',beat:5},{piece:'hihat',beat:6},{piece:'snare',beat:7},{piece:'ride',beat:7},{piece:'hihat',beat:8}], tip:'The ride on the snare beats opens up the sound. That wash is the emotion you hear in the song.', newPieces:['crash','ride'] },
    ],
  },
  {
    id:'ptv', title:'So Far So Fake', artist:'Pierce The Veil',
    bpm:148, feel:'Fast · Driving · Intense',
    why:"This is the goal. Fast, complex, and full of energy. Start here and it'll feel impossible. Come back after Seven Nation Army and it'll feel possible.",
    youtubeId:'1qg6c5ixF8U',
    levels:[
      { label:'Level 1 — The Core Beat', description:"148 BPM is fast. Don't try to match that yet — just learn the pattern at half speed.", beats:8, pattern:[{piece:'kick',beat:1},{piece:'snare',beat:2},{piece:'kick',beat:3},{piece:'snare',beat:4},{piece:'kick',beat:5},{piece:'snare',beat:6},{piece:'kick',beat:7},{piece:'snare',beat:8}], tip:'Speed comes from accuracy. Play it slow and clean 10 times before you try to speed up.' },
      { label:'Level 2 — 16th Note Hi-Hat', description:'This is where the intensity comes from — 16th notes on the hi-hat. Your hand is moving twice as fast as the beat. Be patient with yourself.', beats:8, pattern:[{piece:'kick',beat:1},{piece:'hihat',beat:1},{piece:'hihat',beat:2},{piece:'snare',beat:3},{piece:'hihat',beat:3},{piece:'hihat',beat:4},{piece:'kick',beat:5},{piece:'hihat',beat:5},{piece:'hihat',beat:6},{piece:'snare',beat:7},{piece:'hihat',beat:7},{piece:'hihat',beat:8}], tip:'Your hi-hat hand is the engine. Keep it moving even when kick and snare do their thing.', newPieces:['hihat'] },
      { label:'Level 3 — The Real Drive', description:"Add tom fills and crash accents. This is where it starts sounding like Pierce The Veil.", beats:8, pattern:[{piece:'crash',beat:1},{piece:'kick',beat:1},{piece:'hihat',beat:1},{piece:'hihat',beat:2},{piece:'snare',beat:3},{piece:'hihat',beat:3},{piece:'hihat',beat:4},{piece:'kick',beat:5},{piece:'hihat',beat:5},{piece:'tom1',beat:6},{piece:'tom2',beat:7},{piece:'snare',beat:7},{piece:'floortom',beat:8}], tip:"Tom fills are the punctuation. They tell the listener something is about to change.", newPieces:['crash','tom1','tom2','floortom'] },
    ],
  },
];

function KitSetup({ positions, setPositions, onDone }) {
  const svgRef=useRef(null), dragging=useRef(null);
  const move=(cx,cy)=>{if(!dragging.current||!svgRef.current)return;const rect=svgRef.current.getBoundingClientRect();setPositions(prev=>({...prev,[dragging.current]:{x:Math.max(24,Math.min(356,Math.round(((cx-rect.left)/rect.width)*380))),y:Math.max(24,Math.min(296,Math.round(((cy-rect.top)/rect.height)*320)))}}));};
  return(<div style={{background:'#0e0e0e',minHeight:'100vh',color:'#e8e8e8',fontFamily:'system-ui,sans-serif',padding:16,maxWidth:520,margin:'0 auto'}}>
    <div style={{marginBottom:20,borderBottom:'1px solid #222',paddingBottom:14}}>
      <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700,color:'#c8a84b',letterSpacing:'0.05em'}}>Your Kit</div>
      <div style={{fontSize:'0.78rem',color:'#666',marginTop:4,lineHeight:1.6}}>Drag each piece to match where it sits on your actual kit. This way the diagrams match what you see in front of you.</div>
    </div>
    <svg ref={svgRef} width="100%" viewBox="0 0 380 320" style={{display:'block',background:'#141414',borderRadius:12,border:'1px solid #2e2e2e',touchAction:'none',cursor:'grab',marginBottom:16,maxHeight:360}}
      onMouseMove={e=>move(e.clientX,e.clientY)} onMouseUp={()=>{dragging.current=null;}} onMouseLeave={()=>{dragging.current=null;}}
      onTouchMove={e=>{e.preventDefault();move(e.touches[0].clientX,e.touches[0].clientY);}} onTouchEnd={()=>{dragging.current=null;}}>
      {[1,2,3].map(i=>(<line key={`h${i}`} x1={0} y1={i*80} x2={380} y2={i*80} stroke="#1e1e1e" strokeWidth={1}/>))}
      {[1,2,3,4].map(i=>(<line key={`v${i}`} x1={i*76} y1={0} x2={i*76} y2={320} stroke="#1e1e1e" strokeWidth={1}/>))}
      <ellipse cx={190} cy={290} rx={30} ry={12} fill="#1a1a1a" stroke="#2e2e2e" strokeWidth={1}/>
      <text x={190} y={294} textAnchor="middle" fontSize="9" fill="#333" fontFamily="monospace">YOU</text>
      {KIT_PIECES.map(piece=>{const pos=positions[piece.id]||{x:piece.defaultX,y:piece.defaultY};return(<g key={piece.id} onMouseDown={e=>{e.preventDefault();dragging.current=piece.id;}} onTouchStart={e=>{e.preventDefault();dragging.current=piece.id;}} style={{cursor:'grab'}}><circle cx={pos.x} cy={pos.y} r={22} fill={piece.color} fillOpacity={0.15} stroke={piece.color} strokeWidth={2}/><text x={pos.x} y={pos.y-4} textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="monospace" fill={piece.color}>{piece.abbr}</text><text x={pos.x} y={pos.y+8} textAnchor="middle" fontSize="8" fontFamily="monospace" fill={piece.color} fillOpacity={0.7}>{piece.label}</text></g>);})}
    </svg>
    <div style={{fontSize:'0.72rem',color:'#555',marginBottom:16,textAlign:'center'}}>Drag pieces into position · Changes save automatically</div>
    <button onClick={onDone} style={{width:'100%',padding:'14px',borderRadius:8,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,background:'#c8a84b',border:'none',color:'#000',letterSpacing:'0.04em'}}>My Kit Is Set Up → Let's Play</button>
  </div>);
}

function BeatGrid({ level, activeBeat }) {
  const usedIds=[...new Set(level.pattern.map(p=>p.piece))];
  const usedPieces=KIT_PIECES.filter(p=>usedIds.includes(p.id));
  const newPieces=level.newPieces||[];
  return(<div style={{overflowX:'auto'}}><div style={{minWidth:Math.max(320,level.beats*44+80)}}>
    <div style={{display:'flex',paddingLeft:72}}>{Array.from({length:level.beats}).map((_,b)=>(<div key={b} style={{width:40,marginRight:4,textAlign:'center',fontFamily:'monospace',fontSize:'0.7rem',color:activeBeat===b+1?'#c8a84b':'#444',fontWeight:activeBeat===b+1?700:400}}>{b+1}</div>))}</div>
    {usedPieces.map(piece=>{const isNew=newPieces.includes(piece.id);return(<div key={piece.id} style={{display:'flex',alignItems:'center',marginBottom:6}}>
      <div style={{width:68,flexShrink:0,display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,borderRadius:'50%',background:piece.color,flexShrink:0}}/><span style={{fontFamily:'monospace',fontSize:'0.68rem',color:isNew?piece.color:'#666',fontWeight:isNew?700:400}}>{piece.abbr}{isNew&&<span style={{fontSize:'0.55rem',color:piece.color,marginLeft:3}}>NEW</span>}</span></div>
      {Array.from({length:level.beats}).map((_,b)=>{const beat=b+1,hit=level.pattern.some(p=>p.piece===piece.id&&p.beat===beat),isActive=activeBeat===beat;return(<div key={b} style={{width:40,height:32,marginRight:4,borderRadius:6,background:hit?isActive?piece.color:`${piece.color}44`:isActive?'#1e1e1e':'#141414',border:hit?`1px solid ${piece.color}`:'1px solid #1e1e1e',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.08s',transform:hit&&isActive?'scale(1.1)':'scale(1)'}}>{hit&&(<div style={{width:10,height:10,borderRadius:'50%',background:isActive?'#fff':piece.color,opacity:isActive?1:0.8}}/>)}</div>);})}
    </div>);})}
  </div></div>);
}

function MiniKit({ positions, activePieces }) {
  return(<svg width="100%" viewBox="0 0 380 220" style={{display:'block',background:'#141414',borderRadius:10,border:'1px solid #2e2e2e',marginBottom:14,maxHeight:200}}>
    {KIT_PIECES.map(piece=>{const pos=positions[piece.id]||{x:piece.defaultX,y:piece.defaultY},isActive=activePieces.includes(piece.id);return(<g key={piece.id}><circle cx={pos.x} cy={pos.y*0.65} r={isActive?26:20} fill={isActive?piece.color:`${piece.color}18`} stroke={piece.color} strokeWidth={isActive?3:1} style={{transition:'all 0.08s'}}/><text x={pos.x} y={pos.y*0.65-4} textAnchor="middle" fontSize={isActive?12:9} fontWeight="700" fontFamily="monospace" fill={isActive?'#fff':piece.color}>{piece.abbr}</text>{isActive&&(<text x={pos.x} y={pos.y*0.65+10} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#fff">HIT</text>)}</g>);})}
  </svg>);
}

function SongPlayer({ song, positions, onBack }) {
  const[levelIdx,setLevelIdx]=useState(0),[playing,setPlaying]=useState(false),[activeBeat,setActiveBeat]=useState(null);
  const intervalRef=useRef(null);
  const level=song.levels[levelIdx];
  const piecesOnBeat=beat=>level.pattern.filter(p=>p.beat===beat).map(p=>p.piece);
  const startStop=()=>{if(playing){clearInterval(intervalRef.current);setPlaying(false);setActiveBeat(null);return;}setPlaying(true);let beat=0;intervalRef.current=setInterval(()=>{beat=(beat%level.beats)+1;setActiveBeat(beat);},(60/song.bpm)*1000);};
  const changeLevel=idx=>{clearInterval(intervalRef.current);setPlaying(false);setActiveBeat(null);setLevelIdx(idx);};
  const activePiecesNow=activeBeat?piecesOnBeat(activeBeat):[];
  return(<div style={{background:'#0e0e0e',minHeight:'100vh',color:'#e8e8e8',fontFamily:'system-ui,sans-serif',padding:16,maxWidth:520,margin:'0 auto'}}>
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,borderBottom:'1px solid #222',paddingBottom:14}}>
      <button onClick={onBack} style={{background:'transparent',border:'1px solid #2e2e2e',borderRadius:6,padding:'5px 10px',color:'#666',cursor:'pointer',fontSize:'0.8rem'}}>← Songs</button>
      <div><div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:'#e8e8e8',lineHeight:1}}>{song.title}</div><div style={{fontSize:'0.72rem',color:'#666',marginTop:2}}>{song.artist}</div></div>
    </div>
    <div style={{background:'#141414',borderRadius:8,padding:'10px 12px',marginBottom:14,fontSize:'0.78rem',color:'#888',lineHeight:1.6}}><span style={{color:'#c8a84b',fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>Feel · </span>{song.feel}</div>
    <div style={{display:'flex',gap:7,marginBottom:14}}>{song.levels.map((l,i)=>(<button key={i} onClick={()=>changeLevel(i)} style={{flex:1,padding:'8px 4px',borderRadius:6,cursor:'pointer',fontSize:'0.7rem',fontFamily:'monospace',border:i===levelIdx?'1px solid #c8a84b':'1px solid #2e2e2e',background:i===levelIdx?'rgba(200,168,75,0.1)':'#141414',color:i===levelIdx?'#c8a84b':'#555',fontWeight:i===levelIdx?700:400}}>L{i+1}{i<levelIdx?' ✓':''}</button>))}</div>
    <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',color:'#c8a84b',marginBottom:8}}>{level.label}</div>
      <div style={{fontSize:'0.8rem',color:'#aaa',lineHeight:1.6,marginBottom:10}}>{level.description}</div>
      <div style={{fontSize:'0.75rem',color:'#7ec8a4',lineHeight:1.5,background:'#141414',borderRadius:6,padding:'8px 10px'}}>💡 {level.tip}</div>
    </div>
    <MiniKit positions={positions} activePieces={activePiecesNow}/>
    <div style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:14,marginBottom:14}}>
      <div style={{fontSize:'0.72rem',color:'#555',fontFamily:'monospace',marginBottom:12}}>{song.bpm} BPM · {level.beats} beats shown{level.newPieces?.length>0&&` · +${level.newPieces.length} new`}</div>
      <BeatGrid level={level} activeBeat={activeBeat}/>
    </div>
    <button onClick={startStop} style={{width:'100%',padding:'16px',borderRadius:10,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,background:playing?'#e05c5c':'#c8a84b',border:'none',color:'#000',letterSpacing:'0.04em',marginBottom:14}}>{playing?'⏹ Stop':'▶ Play Beat'}</button>
    <div style={{background:'#141414',border:'1px solid #2e2e2e',borderRadius:8,padding:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:'0.78rem',color:'#666'}}>Play along with the real song</div>
      <a href={`https://youtube.com/watch?v=${song.youtubeId}`} target="_blank" rel="noopener noreferrer" style={{padding:'6px 14px',borderRadius:5,background:'#e05c5c',color:'#fff',fontSize:'0.75rem',fontWeight:700,textDecoration:'none',fontFamily:'monospace'}}>▶ YouTube</a>
    </div>
    {levelIdx<song.levels.length-1&&(<div style={{marginTop:14,background:'#141414',border:'1px solid #2e2e2e',borderRadius:8,padding:12,textAlign:'center'}}><div style={{fontSize:'0.75rem',color:'#555',marginBottom:8}}>When this feels comfortable →</div><button onClick={()=>changeLevel(levelIdx+1)} style={{padding:'8px 20px',borderRadius:6,cursor:'pointer',border:'1px solid #7ec8a4',background:'transparent',color:'#7ec8a4',fontSize:'0.8rem',fontFamily:'Georgia,serif',fontWeight:600}}>Ready for {song.levels[levelIdx+1].label.split('—')[0].trim()}</button></div>)}
    {levelIdx===song.levels.length-1&&(<div style={{marginTop:14,background:'rgba(126,200,164,0.08)',border:'1px solid #7ec8a4',borderRadius:8,padding:14,textAlign:'center'}}><div style={{fontSize:'0.9rem',color:'#7ec8a4',fontFamily:'Georgia,serif',fontWeight:700,marginBottom:4}}>You're playing the real thing.</div><div style={{fontSize:'0.75rem',color:'#666'}}>Go back and try the next song when you're ready.</div></div>)}
  </div>);
}

function SongSelect({ onSelect, onSetup }) {
  return(<div style={{background:'#0e0e0e',minHeight:'100vh',color:'#e8e8e8',fontFamily:'system-ui,sans-serif',padding:16,maxWidth:520,margin:'0 auto'}}>
    <div style={{marginBottom:20,borderBottom:'1px solid #222',paddingBottom:14}}>
      <div style={{fontFamily:'Georgia,serif',fontSize:'2rem',fontWeight:700,color:'#c8a84b',letterSpacing:'0.04em',lineHeight:1}}>First Beat</div>
      <div style={{fontSize:'0.78rem',color:'#666',marginTop:4}}>Three songs · Three levels each · Your kit · No pressure</div>
    </div>
    <div style={{fontSize:'0.72rem',color:'#555',marginBottom:16,lineHeight:1.7}}>Pick a song you love. Start at Level 1 — just kick and snare. Add one piece at a time when it feels easy. No timer. No grade. Just you and the beat.</div>
    {SONGS.map(song=>(<div key={song.id} onClick={()=>onSelect(song)} style={{background:'#1a1a1a',border:'1px solid #2e2e2e',borderRadius:10,padding:16,marginBottom:12,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#c8a84b'} onMouseLeave={e=>e.currentTarget.style.borderColor='#2e2e2e'}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div><div style={{fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,color:'#e8e8e8',marginBottom:2}}>{song.title}</div><div style={{fontSize:'0.72rem',color:'#666'}}>{song.artist}</div></div>
        <div style={{textAlign:'right'}}><div style={{fontFamily:'monospace',fontSize:'0.7rem',color:'#c8a84b'}}>{song.bpm} BPM</div><div style={{fontSize:'0.65rem',color:'#444',marginTop:2}}>{song.levels.length} levels</div></div>
      </div>
      <div style={{fontSize:'0.72rem',color:'#888',lineHeight:1.5,marginBottom:8}}>{song.why}</div>
      <div style={{display:'flex',gap:6}}>{song.levels.map((_,li)=>(<div key={li} style={{flex:1,height:3,borderRadius:2,background:li===0?'#c8a84b':li===1?'#7ec8a4':'#e05c5c',opacity:0.5}}/>))}</div>
      <div style={{display:'flex',gap:6,marginTop:6}}>{['Easy','Medium','Full Song'].map((l,li)=>(<div key={li} style={{flex:1,fontSize:'0.6rem',color:'#444',fontFamily:'monospace',textAlign:'center'}}>{l}</div>))}</div>
    </div>))}
    <div style={{marginTop:8,textAlign:'center'}}><button onClick={onSetup} style={{background:'transparent',border:'1px solid #2e2e2e',borderRadius:6,padding:'8px 16px',color:'#555',cursor:'pointer',fontSize:'0.75rem',fontFamily:'monospace'}}>⚙ Rearrange My Kit</button></div>
    <div style={{marginTop:20,background:'#141414',borderRadius:8,padding:12,fontSize:'0.72rem',color:'#444',lineHeight:1.6,textAlign:'center'}}>Start with Seven Nation Army. It's the easiest win on a drum kit ever invented.</div>
  </div>);
}

const DEFAULT_POSITIONS=Object.fromEntries(KIT_PIECES.map(p=>[p.id,{x:p.defaultX,y:p.defaultY}]));

export default function FirstBeat() {
  const[screen,setScreen]=useState('songs'),[selectedSong,setSong]=useState(null),[kitPositions,setKitPositions]=useState(DEFAULT_POSITIONS);
  if(screen==='setup') return(<KitSetup positions={kitPositions} setPositions={setKitPositions} onDone={()=>setScreen('songs')}/>);
  if(screen==='player'&&selectedSong) return(<SongPlayer song={selectedSong} positions={kitPositions} onBack={()=>{setSong(null);setScreen('songs');}}/>);
  return(<SongSelect onSelect={song=>{setSong(song);setScreen('player');}} onSetup={()=>setScreen('setup')}/>);
}
