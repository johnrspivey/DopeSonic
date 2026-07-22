import { useState, useRef, useEffect } from "react";
import { NOTES, STRING_NAMES, PAGE_STYLE, DiagramCard } from "../lib/fretboard";

// Standard tuning open-string frequencies, low E to high e.
const OPEN_FREQ = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
const OPEN_NOTE_IDX = [4, 9, 2, 7, 11, 4];
const FRET_MARKERS = [3, 5, 7, 9, 12, 15];

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

export default function RunBuilder() {
  const [notes, setNotes] = useState([]);
  const [tempo, setTempo] = useState(90);
  const [subdivision, setSubdivision] = useState('eighth');
  const [loop, setLoop] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(-1);
  const ctxRef = useRef(null);
  const stopFlagRef = useRef(false);
  const idCounter = useRef(0);

  const noteDur = (60 / tempo) * SUBDIVISIONS[subdivision].beats;

  function addNote(strIdx, fret) {
    idCounter.current += 1;
    setNotes(n => [...n, { id: idCounter.current, strIdx, fret }]);
  }
  function removeNote(id) {
    setNotes(n => n.filter(x => x.id !== id));
  }
  function clearAll() {
    setNotes([]);
  }

  async function play() {
    if (notes.length === 0) return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    stopFlagRef.current = false;
    setPlaying(true);

    const runOnce = () => new Promise(resolve => {
      const startTime = ctx.currentTime + 0.05;
      notes.forEach((nt, i) => {
        playPluck(ctx, freqAt(nt.strIdx, nt.fret), startTime + i * noteDur, noteDur);
      });
      const totalDur = notes.length * noteDur;
      const t0 = performance.now();
      function tick() {
        if (stopFlagRef.current) { resolve(); return; }
        const elapsed = (performance.now() - t0) / 1000;
        if (elapsed < totalDur) {
          setPlayIdx(Math.min(notes.length - 1, Math.floor(elapsed / noteDur)));
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
      <DiagramCard accent="#7ec8a4">
        {notes.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#555', textAlign: 'center', padding: '12px 0' }}>Tap frets above to start building a run</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {notes.map((nt, i) => (
              <button key={nt.id} onClick={() => removeNote(nt.id)} title="Tap to remove" style={{
                fontFamily: 'monospace', fontSize: '0.7rem', padding: '6px 8px', borderRadius: 5, cursor: 'pointer',
                border: i === playIdx ? '2px solid #7ec8a4' : '1px solid #333',
                background: i === playIdx ? 'rgba(126,200,164,0.25)' : '#1a1a1a',
                color: '#ccc', textAlign: 'center', lineHeight: 1.5,
              }}>
                {STRING_NAMES[nt.strIdx]}·{nt.fret}<br /><span style={{ color: '#7ec8a4' }}>{noteNameAt(nt.strIdx, nt.fret)}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={clearAll} disabled={notes.length === 0} style={{ fontSize: '0.72rem', padding: '6px 12px', borderRadius: 5, border: '1px solid #333', background: '#1a1a1a', color: '#888', cursor: notes.length ? 'pointer' : 'default' }}>Clear all</button>
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
