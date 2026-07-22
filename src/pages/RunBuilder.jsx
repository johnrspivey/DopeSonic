import { useState, useRef, useEffect } from "react";
import { NOTES, STRING_NAMES, PAGE_STYLE, DiagramCard } from "../lib/fretboard";

// Standard tuning open-string frequencies, low E to high e.
const OPEN_FREQ = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
const OPEN_NOTE_IDX = [4, 9, 2, 7, 11, 4];
const FRET_MARKERS = [3, 5, 7, 9, 12, 15];
const STORAGE_KEY = 'dopesonic_runbuilder_licks';

function noteNameAt(strIdx, fret) {
  return NOTES[(OPEN_NOTE_IDX[strIdx] + fret) % 12];
}
function freqAt(strIdx, fret) {
  return OPEN_FREQ[strIdx] * Math.pow(2, fret / 12);
}

const SUBDIVISIONS = {
  quarter: { label: '1/4', beats: 1 },
  eighth: { label: '1/8', beats: 0.5 },
  triplet: { label: '1/8 triplet', beats: 1 / 3 },
  sixteenth: { label: '1/16', beats: 0.25 },
};
const SUB_CYCLE = [null, 'quarter', 'eighth', 'triplet', 'sixteenth'];

const NUM_FRETS = 15;

// Simple synthesized pluck — two detuned oscillators through a lowpass, quick attack/decay.
function playPluck(ctx, freq, startTime, dur) {
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'sawtooth';
  osc2.type = 'triangle';
  osc.frequency.value = freq;
  osc2.frequency.value = freq * 1.003;
  filter.type = 'lowpass';
  filter.frequency.value = 2400;
  filter.Q.value = 0.6;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.32, startTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(dur * 0.9, 0.05));
  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc2.start(startTime);
  osc.stop(startTime + dur + 0.05);
  osc2.stop(startTime + dur + 0.05);
}

function loadSavedLicks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function persistLicks(licks) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(licks)); } catch { /* storage unavailable, ignore */ }
}

export default function RunBuilder() {
  const [notes, setNotes] = useState([]);
  const [tempo, setTempo] = useState(90);
  const [subdivision, setSubdivision] = useState('eighth');
  const [loop, setLoop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(-1);
  const [savedLicks, setSavedLicks] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const ctxRef = useRef(null);
  const stopFlagRef = useRef(false);
  const idCounter = useRef(0);

  useEffect(() => { setSavedLicks(loadSavedLicks()); }, []);

  // note.sub === null means "use the global subdivision" (the fast path — set tempo/subdivision
  // once and every note follows it). Set an override on individual notes when you need one note
  // to sit longer or shorter than the rest.
  function effectiveDur(note) {
    return (60 / tempo) * SUBDIVISIONS[note.sub || subdivision].beats;
  }

  function addNote(strIdx, fret) {
    idCounter.current += 1;
    setNotes(n => [...n, { id: idCounter.current, strIdx, fret, sub: null }]);
  }
  function removeNote(id) {
    setNotes(n => n.filter(x => x.id !== id));
  }
  function cycleNoteSub(id) {
    setNotes(n => n.map(x => {
      if (x.id !== id) return x;
      const curIdx = SUB_CYCLE.indexOf(x.sub);
      const next = SUB_CYCLE[(curIdx + 1) % SUB_CYCLE.length];
      return { ...x, sub: next };
    }));
  }
  function resetAllToGlobal() {
    setNotes(n => n.map(x => ({ ...x, sub: null })));
  }
  function clearAll() {
    setNotes([]);
  }

  function saveLick() {
    const name = saveName.trim() || `Lick ${savedLicks.length + 1}`;
    const lick = {
      id: Date.now(),
      name,
      tempo,
      subdivision,
      notes: notes.map(({ strIdx, fret, sub }) => ({ strIdx, fret, sub })),
      savedAt: new Date().toISOString(),
    };
    const next = [lick, ...savedLicks];
    setSavedLicks(next);
    persistLicks(next);
    setSaveName('');
    setShowSaveInput(false);
  }
  function loadLick(lick) {
    setNotes(lick.notes.map(nt => { idCounter.current += 1; return { id: idCounter.current, ...nt }; }));
    setTempo(lick.tempo);
    setSubdivision(lick.subdivision);
  }
  function deleteLick(id) {
    const next = savedLicks.filter(l => l.id !== id);
    setSavedLicks(next);
    persistLicks(next);
  }

  async function play() {
    if (notes.length === 0) return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    stopFlagRef.current = false;
    setPlaying(true);

    const runOnce = () => new Promise(resolve => {
      const durs = notes.map(effectiveDur);
      const starts = [];
      let acc = 0;
      durs.forEach(d => { starts.push(acc); acc += d; });
      const totalDur = acc;
      const startTime = ctx.currentTime + 0.05;
      notes.forEach((nt, i) => {
        playPluck(ctx, freqAt(nt.strIdx, nt.fret), startTime + starts[i], durs[i]);
      });
      const t0 = performance.now();
      function tick() {
        if (stopFlagRef.current) { resolve(); return; }
        const elapsed = (performance.now() - t0) / 1000;
        if (elapsed < totalDur) {
          let idx = 0;
          for (let i = 0; i < starts.length; i++) { if (elapsed >= starts[i]) idx = i; else break; }
          setPlayIdx(idx);
          requestAnimationFrame(tick);
        } else {
          setPlayIdx(-1);
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });

    do {
      await runOnce();
    } while (loop && !stopFlagRef.current);

    setPlaying(false);
    setPlayIdx(-1);
  }

  function stop() {
    stopFlagRef.current = true;
    setPlaying(false);
    setPlayIdx(-1);
  }

  useEffect(() => () => {
    stopFlagRef.current = true;
    if (ctxRef.current && ctxRef.current.close) ctxRef.current.close();
  }, []);

  return (
    <div style={PAGE_STYLE}>
      <div style={{ marginBottom: 16, borderBottom: '1px solid #222', paddingBottom: 14 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', fontWeight: 700, color: '#7ec8a4', letterSpacing: '0.05em' }}>Run Builder</div>
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>Click notes onto the neck, hear it back, learn it once it sounds right</div>
      </div>

      <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', color: '#7ec8a4', marginBottom: 10 }}>Fretboard</div>
      <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: 10 }}>Tap any fret to add it to your run, in order.</div>
      <InteractiveFretboard onAdd={addNote} numFrets={NUM_FRETS} />

      <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', color: '#7ec8a4', marginBottom: 10, marginTop: 20, borderTop: '1px solid #222', paddingTop: 16 }}>Your Run</div>
      <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: 10 }}>Tap a note to remove it. Tap the small badge under it to give that note its own duration — leave it on "auto" to just follow the global tempo/subdivision below.</div>
      <DiagramCard accent="#7ec8a4">
        {notes.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#555', textAlign: 'center', padding: '12px 0' }}>Tap frets above to start building a run</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {notes.map((nt, i) => (
              <div key={nt.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <button onClick={() => removeNote(nt.id)} title="Tap to remove" style={{
                  fontFamily: 'monospace', fontSize: '0.7rem', padding: '6px 8px', borderRadius: 5, cursor: 'pointer',
                  border: i === playIdx ? '2px solid #7ec8a4' : '1px solid #333',
                  background: i === playIdx ? 'rgba(126,200,164,0.25)' : '#1a1a1a',
                  color: '#ccc', textAlign: 'center', lineHeight: 1.5,
                }}>
                  {STRING_NAMES[nt.strIdx]}·{nt.fret}<br /><span style={{ color: '#7ec8a4' }}>{noteNameAt(nt.strIdx, nt.fret)}</span>
                </button>
                <button onClick={() => cycleNoteSub(nt.id)} title="Tap to set this note's duration" style={{
                  fontSize: '0.56rem', padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                  border: nt.sub ? '1px solid #7ec8a4' : '1px solid #2a2a2a',
                  background: nt.sub ? 'rgba(126,200,164,0.15)' : '#161616',
                  color: nt.sub ? '#7ec8a4' : '#555',
                }}>
                  {nt.sub ? SUBDIVISIONS[nt.sub].label : 'auto'}
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={clearAll} disabled={notes.length === 0} style={{ fontSize: '0.72rem', padding: '6px 12px', borderRadius: 5, border: '1px solid #333', background: '#1a1a1a', color: '#888', cursor: notes.length ? 'pointer' : 'default' }}>Clear all</button>
          <button onClick={resetAllToGlobal} disabled={notes.length === 0} style={{ fontSize: '0.72rem', padding: '6px 12px', borderRadius: 5, border: '1px solid #333', background: '#1a1a1a', color: '#888', cursor: notes.length ? 'pointer' : 'default' }}>Reset durations to auto</button>
          {!showSaveInput ? (
            <button onClick={() => setShowSaveInput(true)} disabled={notes.length === 0} style={{ fontSize: '0.72rem', padding: '6px 12px', borderRadius: 5, border: '1px solid #7ec8a4', background: notes.length ? 'rgba(126,200,164,0.15)' : '#1a1a1a', color: notes.length ? '#7ec8a4' : '#555', cursor: notes.length ? 'pointer' : 'default' }}>💾 Save this lick</button>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder={`Lick ${savedLicks.length + 1}`} style={{ fontSize: '0.72rem', padding: '6px 8px', borderRadius: 5, border: '1px solid #333', background: '#111', color: '#eee', width: 130 }} onKeyDown={e => { if (e.key === 'Enter') saveLick(); }} autoFocus />
              <button onClick={saveLick} style={{ fontSize: '0.72rem', padding: '6px 10px', borderRadius: 5, border: 'none', background: '#7ec8a4', color: '#000', cursor: 'pointer' }}>Save</button>
              <button onClick={() => { setShowSaveInput(false); setSaveName(''); }} style={{ fontSize: '0.72rem', padding: '6px 10px', borderRadius: 5, border: '1px solid #333', background: '#1a1a1a', color: '#888', cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
      </DiagramCard>

      <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', color: '#7ec8a4', marginBottom: 10, marginTop: 20, borderTop: '1px solid #222', paddingTop: 16 }}>Playback</div>
      <DiagramCard accent="#7ec8a4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#555', fontFamily: 'monospace' }}>tempo</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: '#7ec8a4' }}>{tempo}</div>
          </div>
          <input type="range" min={40} max={220} value={tempo} onChange={e => setTempo(parseInt(e.target.value))} style={{ flex: 1, minWidth: 120 }} />
        </div>
        <div style={{ fontSize: '0.62rem', color: '#555', marginBottom: 6 }}>global subdivision (used by any note set to "auto")</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {Object.keys(SUBDIVISIONS).map(k => (
            <button key={k} onClick={() => setSubdivision(k)} style={{
              fontSize: '0.7rem', padding: '6px 10px', borderRadius: 5, cursor: 'pointer',
              border: k === subdivision ? '2px solid #7ec8a4' : '1px solid #333',
              background: k === subdivision ? '#7ec8a4' : '#1a1a1a',
              color: k === subdivision ? '#000' : '#888',
            }}>{SUBDIVISIONS[k].label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!playing ? (
            <button onClick={play} disabled={notes.length === 0} style={{ fontFamily: 'Georgia,serif', fontSize: '0.95rem', fontWeight: 700, padding: '9px 20px', borderRadius: 6, cursor: notes.length ? 'pointer' : 'default', border: 'none', background: notes.length ? '#7ec8a4' : '#333', color: '#000' }}>▶ Play</button>
          ) : (
            <button onClick={stop} style={{ fontFamily: 'Georgia,serif', fontSize: '0.95rem', fontWeight: 700, padding: '9px 20px', borderRadius: 6, cursor: 'pointer', border: 'none', background: '#e05c5c', color: '#000' }}>■ Stop</button>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#aaa', cursor: 'pointer' }}>
            <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} /> Loop
          </label>
        </div>
      </DiagramCard>

      <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', color: '#7ec8a4', marginBottom: 10, marginTop: 20, borderTop: '1px solid #222', paddingTop: 16 }}>Saved Licks</div>
      <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: 10 }}>Saved to this browser/device only — not synced across devices yet.</div>
      <DiagramCard accent="#7ec8a4">
        {savedLicks.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#555', textAlign: 'center', padding: '8px 0' }}>Nothing saved yet — build a run above and hit "Save this lick"</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {savedLicks.map(lick => (
              <div key={lick.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 6, border: '1px solid #2a2a2a', background: '#161616' }}>
                <div onClick={() => loadLick(lick)} style={{ cursor: 'pointer', flex: 1 }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '0.9rem', color: '#eee' }}>{lick.name}</div>
                  <div style={{ fontSize: '0.62rem', color: '#666', fontFamily: 'monospace', marginTop: 2 }}>{lick.notes.length} notes · {lick.tempo} bpm · {SUBDIVISIONS[lick.subdivision].label}</div>
                </div>
                <button onClick={() => loadLick(lick)} style={{ fontSize: '0.68rem', padding: '5px 10px', borderRadius: 5, border: '1px solid #7ec8a4', background: 'rgba(126,200,164,0.15)', color: '#7ec8a4', cursor: 'pointer' }}>Load</button>
                <button onClick={() => deleteLick(lick.id)} style={{ fontSize: '0.68rem', padding: '5px 8px', borderRadius: 5, border: '1px solid #333', background: '#1a1a1a', color: '#888', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </DiagramCard>

      <p style={{ fontSize: '0.68rem', color: '#444', marginTop: 14, lineHeight: 1.5 }}>Synthesized playback — not a recording. Good enough to judge if a run sounds right before you ever pick up the guitar.</p>
    </div>
  );
}

function InteractiveFretboard({ onAdd, numFrets }) {
  const LEFT = 34, TOP = 24, FRET_H = 32, STR_W = 32, RIGHT = 20;
  const W = LEFT + 5 * STR_W + RIGHT, H = TOP + numFrets * FRET_H + 10;
  const sx = i => LEFT + i * STR_W;
  const dotY = f => (f === 0 ? TOP : TOP + (f - 0.5) * FRET_H);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', margin: '0 auto', background: '#111', borderRadius: 8 }}>
        {STRING_NAMES.map((name, i) => (<text key={i} x={sx(i)} y={TOP - 8} textAnchor="middle" fontSize="10" fill="#666" fontFamily="monospace">{name}</text>))}
        <rect x={sx(0)} y={TOP} width={sx(5) - sx(0)} height={4} fill="#bbb" rx={2} />
        {Array.from({ length: numFrets }).map((_, f) => (<line key={f} x1={sx(0)} y1={TOP + f * FRET_H + FRET_H} x2={sx(5)} y2={TOP + f * FRET_H + FRET_H} stroke="#333" strokeWidth={1} />))}
        {Array.from({ length: 6 }).map((_, i) => (<line key={i} x1={sx(i)} y1={TOP} x2={sx(i)} y2={TOP + numFrets * FRET_H} stroke="#555" strokeWidth={1} />))}
        {Array.from({ length: numFrets }).map((_, f) => {
          const fn = f + 1;
          return (<text key={f} x={sx(5) + 14} y={TOP + f * FRET_H + FRET_H - 2} fontSize="9" fill="#555" fontFamily="monospace">{fn}</text>);
        })}
        {FRET_MARKERS.map(fn => (
          <circle key={fn} cx={sx(2.5)} cy={TOP + (fn - 0.5) * FRET_H} r={3} fill="#2a2a2a" />
        ))}
        {Array.from({ length: 6 }).map((_, si) => Array.from({ length: numFrets + 1 }).map((_, f) => (
          <g key={`${si}-${f}`}>
            <circle cx={sx(si)} cy={dotY(f)} r={3} fill="#2a2a2a" />
            <circle cx={sx(si)} cy={dotY(f)} r={11} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onAdd(si, f)}>
              <title>{`${STRING_NAMES[si]} · fret ${f} · ${noteNameAt(si, f)}`}</title>
            </circle>
          </g>
        )))}
      </svg>
    </div>
  );
}
