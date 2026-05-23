import { useState } from "react";

const STEPS = ["artist","guitar","pickups","strings","amp","speakers","playback","result"];
const LABELS = {artist:"Target Artist",guitar:"Your Guitar",pickups:"Pickups",strings:"Strings & Attack",amp:"Amp & Pedals",speakers:"Monitoring",playback:"Final Use",result:"Tone Blueprint"};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#f0ebe0;font-family:'DM Mono',monospace;min-height:100vh}
#ds-root{max-width:640px;margin:0 auto}
.ds-header{background:#080808;padding:2rem 1.5rem 1.5rem;border-bottom:1px solid #1a1a1a;position:relative;overflow:hidden}
.ds-header-lines{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none}
.ds-logo-row{display:flex;align-items:center;gap:1rem;position:relative;z-index:1}
.ds-logo{font-family:'Bebas Neue',sans-serif;font-size:3rem;letter-spacing:0.06em;line-height:1}
.ds-logo .am{color:#c8821a}.ds-logo .bl{color:#378ADD}
.ds-tagline{font-size:10px;letter-spacing:0.2em;color:#3a3530;text-transform:uppercase;margin-top:0.35rem;position:relative;z-index:1}
.ds-progress{display:flex;gap:3px;padding:1rem 1.5rem 0;background:#080808}
.ds-pip{height:2px;flex:1;background:#1a1a1a;transition:background 0.4s}
.ds-pip.done{background:#c8821a}.ds-pip.active{background:#378ADD}
.ds-body{padding:1.5rem}
.ds-step-lbl{font-size:10px;letter-spacing:0.16em;color:#2a2520;text-transform:uppercase;margin-bottom:0.4rem}
.ds-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:0.05em;color:#f0ebe0;margin-bottom:0.2rem}
.ds-sub{font-size:12px;color:#5a5248;line-height:1.7;margin-bottom:1.25rem}
.ds-field{margin-bottom:0.85rem}
.ds-lbl{display:block;font-size:10px;letter-spacing:0.14em;color:#c8821a;text-transform:uppercase;margin-bottom:0.3rem}
.ds-input,.ds-select,.ds-textarea{width:100%;background:#0f0f0f;border:1px solid #1e1e1e;border-radius:4px;color:#f0ebe0;font-family:'DM Mono',monospace;font-size:13px;padding:9px 12px;outline:none;transition:border-color 0.2s}
.ds-input:focus,.ds-select:focus,.ds-textarea:focus{border-color:#378ADD}
.ds-textarea{resize:vertical;min-height:68px}
.ds-select option{background:#0f0f0f}
.ds-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ds-nav{display:flex;gap:8px;margin-top:1.5rem}
.btn-back{flex:1;padding:11px 0;border-radius:4px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.12em;cursor:pointer;text-transform:uppercase;background:transparent;border:1px solid #1e1e1e;color:#3a3530;transition:all 0.2s}
.btn-back:hover{border-color:#2e2e2e;color:#5a5248}
.btn-next{flex:2;padding:11px 0;border-radius:4px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.12em;cursor:pointer;text-transform:uppercase;background:#c8821a;border:none;color:#080808;font-weight:500;transition:all 0.2s}
.btn-next:hover{background:#e09420}
.btn-ghost{flex:1;padding:11px 0;border-radius:4px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.12em;cursor:pointer;text-transform:uppercase;background:transparent;border:1px solid #1e1e1e;color:#3a3530;transition:all 0.2s}
.btn-ghost:hover{border-color:#378ADD;color:#378ADD}
.ds-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:1rem}
.ds-chip{background:#0f0f0f;border:1px solid #1a1a1a;border-radius:4px;padding:8px 10px}
.ds-chip-lbl{font-size:10px;letter-spacing:0.12em;color:#c8821a;text-transform:uppercase}
.ds-chip-val{font-size:12px;color:#f0ebe0;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ds-result{background:#0a0a0a;border:1px solid #1a1a1a;border-left:2px solid #378ADD;border-radius:4px;padding:1.25rem;font-size:13px;line-height:1.85;white-space:pre-wrap;color:#d0cbc0;min-height:200px}
.ds-save-bar{display:flex;gap:8px;margin-top:1rem;flex-wrap:wrap}
.ds-save-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:4px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase;border:1px solid #1e1e1e;background:#0f0f0f;color:#3a3530;transition:all 0.2s}
.ds-save-btn:hover{border-color:#c8821a;color:#c8821a}
.ds-loading{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:3rem 0;color:#2a2520;font-size:11px;letter-spacing:0.14em;text-transform:uppercase}
.ds-spinner{width:28px;height:28px;border-radius:50%;border:1.5px solid #1a1a1a;border-top-color:#378ADD;animation:spin 0.9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ds-error{color:#E24B4A;font-size:12px;margin-top:0.5rem}
.ds-saved{font-size:11px;color:#c8821a;margin-top:6px;letter-spacing:0.08em}
.ds-note{font-size:11px;color:#2a2520;margin-top:5px}
`;

function Field({ label, k, placeholder, data, setData, type="text" }) {
  return (
    <div className="ds-field">
      <label className="ds-lbl">{label}</label>
      <input className="ds-input" type={type} placeholder={placeholder} value={data[k]||""}
        onChange={e => setData(d => ({...d, [k]: e.target.value}))} />
    </div>
  );
}

function Sel({ label, k, options, data, setData }) {
  return (
    <div className="ds-field">
      <label className="ds-lbl">{label}</label>
      <select className="ds-select" value={data[k]||""} onChange={e => setData(d => ({...d, [k]: e.target.value}))}>
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TA({ label, k, placeholder, data, setData }) {
  return (
    <div className="ds-field">
      <label className="ds-lbl">{label}</label>
      <textarea className="ds-textarea" placeholder={placeholder} value={data[k]||""}
        onChange={e => setData(d => ({...d, [k]: e.target.value}))} />
    </div>
  );
}

function Logo() {
  return (
    <div className="ds-logo-row">
      <div>
        <div className="ds-logo">Dope<span className="am">S</span><span className="bl">on</span><span className="am">ic</span></div>
        <div className="ds-tagline">AI Tone Advisor · Bitwerx Labs</div>
      </div>
    </div>
  );
}

function HeaderBg() {
  return (
    <div className="ds-header-lines" style={{
      backgroundImage: "linear-gradient(to right, #080808 25%, rgba(8,8,8,0.7) 55%, rgba(8,8,8,0.3) 100%), url('/hero.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "right center",
      backgroundRepeat: "no-repeat",
      opacity: 0.85,
    }} />
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const next = () => { setStep(i => i+1); window.scrollTo(0,0); };
  const prev = () => { setStep(i => i-1); window.scrollTo(0,0); };
  const artistRef = [data.artist, data.era].filter(Boolean).join(" — ");

  const buildPrompt = () => `You are DopeSonic, an expert guitar tone advisor. A guitarist wants to sound like ${artistRef}.

First: recall everything documented about ${artistRef}'s actual gear for that specific era or song. Be specific and factual.

The user's rig:
Guitar: ${data.guitarModel||"not specified"} | Body: ${data.bodyWood||"?"} | Neck: ${data.neckWood||"?"} | Fretboard: ${data.fretboard||"?"}
Pickups: ${data.pickupModel||"not specified"} (${data.pickupType||""}, ${data.pickupPos||""}, ${data.pickupOutput||""})
Strings: ${data.stringGauge||"?"} ${data.stringMaterial||""} | Pick: ${data.pickThickness||"?"} ${data.pickMaterial||""} | Style: ${data.playStyle||"?"}
Amp: ${data.ampModel||"not specified"} (${data.ampType||""}) | Cabinet: ${data.cabinet||"?"}
Pedals/Chain: ${data.pedals||"none specified"}
Monitoring: ${data.monitoring||"?"} — ${data.monitorModel||""} | Room: ${data.roomAcoustics||"?"}
Final use: ${data.finalUse||"?"} | Mix context: ${data.listenerContext||"?"}
${data.notes?"Additional notes: "+data.notes:""}

Produce a structured Tone Blueprint:

ARTIST GEAR REFERENCE
What ${artistRef} actually used.

RIG GAP ANALYSIS
How the user's rig compares.

PHYSICAL GEAR ADJUSTMENTS
Specific changes with real numbers.

AMP SIM / SIGNAL CHAIN SETTINGS
Recommended modules and settings.

MONITORING COMPENSATION
Adjustments for their monitoring setup.

QUICK WIN
The single most impactful change right now.

Be direct. Write like a knowledgeable player. Real gear names and real numbers.`;

  const runAnalysis = async () => {
    setStep(STEPS.length-1);
    setLoading(true); setError(""); setResult(""); setSaved(false);
    window.scrollTo(0,0);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      const json = await res.json();
      setResult(json.content?.map(c => c.text||"").join("") || "No response received.");
    } catch(e) {
      setError("Connection error — please try again.");
    }
    setLoading(false);
  };

  const saveText = () => {
    const h = "DOPESONIC TONE BLUEPRINT\nGenerated: "+new Date().toLocaleString()+"\nArtist: "+artistRef+"\nGear: "+(data.guitarModel||"")+" / "+(data.ampModel||"")+"\n"+"—".repeat(48)+"\n\n";
    const b = new Blob([h+result], {type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "dopesonic-"+(data.artist||"tone").replace(/\s+/g,"-").toLowerCase()+".txt";
    a.click(); setSaved(true);
  };

  const saveJSON = () => {
    const b = new Blob([JSON.stringify({generated:new Date().toISOString(),rig:data,blueprint:result},null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "dopesonic-"+(data.artist||"tone").replace(/\s+/g,"-").toLowerCase()+".json";
    a.click(); setSaved(true);
  };

  const cur = STEPS[step];

  return (
    <>
      <style>{css}</style>
      <div id="ds-root">
        <div className="ds-header"><HeaderBg /><Logo /></div>
        <div className="ds-progress">
          {STEPS.map((s,i) => <div key={s} className={`ds-pip${i<step?" done":i===step?" active":""}`} title={LABELS[s]} />)}
        </div>
        <div className="ds-body">

          {cur==="artist" && <>
            <div className="ds-step-lbl">Step 1 of 7 · {LABELS.artist}</div>
            <div className="ds-title">Who's your target?</div>
            <div className="ds-sub">The player you want to sound like. Album, era, or song makes the advice much more precise.</div>
            <Field label="Target artist" k="artist" placeholder="e.g. Eddie Van Halen, David Gilmour, John Mayer" data={data} setData={setData} />
            <Field label="Era / album / song (optional)" k="era" placeholder="e.g. Eruption, Comfortably Numb, Slow Dancing in a Burning Room" data={data} setData={setData} />
            <div className="ds-nav"><button className="btn-next" onClick={next}>Next →</button></div>
          </>}

          {cur==="guitar" && <>
            <div className="ds-step-lbl">Step 2 of 7 · {LABELS.guitar}</div>
            <div className="ds-title">Your guitar</div>
            <div className="ds-sub">The instrument you're actually playing.</div>
            <Field label="Make & model" k="guitarModel" placeholder="e.g. Fender Stratocaster, Gibson Les Paul Standard" data={data} setData={setData} />
            <div className="ds-row">
              <Sel label="Body wood" k="bodyWood" options={["Alder","Ash","Mahogany","Basswood","Poplar","Maple","Semi-hollow","Hollow","Other"]} data={data} setData={setData} />
              <Sel label="Neck wood" k="neckWood" options={["Maple","Mahogany","Roasted Maple","Walnut","Other"]} data={data} setData={setData} />
            </div>
            <div className="ds-row">
              <Sel label="Fretboard" k="fretboard" options={["Rosewood","Maple","Ebony","Pau Ferro","Laurel","Other"]} data={data} setData={setData} />
              <Sel label="Scale length" k="scaleLength" options={["24.75in Gibson","25in PRS","25.5in Fender","26.5in Baritone","Other"]} data={data} setData={setData} />
            </div>
            <div className="ds-nav">
              <button className="btn-back" onClick={prev}>← Back</button>
              <button className="btn-next" onClick={next}>Next →</button>
            </div>
          </>}

          {cur==="pickups" && <>
            <div className="ds-step-lbl">Step 3 of 7 · {LABELS.pickups}</div>
            <div className="ds-title">Pickups</div>
            <div className="ds-sub">What's driving the signal at the source.</div>
            <Field label="Pickup make & model" k="pickupModel" placeholder="e.g. Seymour Duncan SSL-1, DiMarzio Super Distortion" data={data} setData={setData} />
            <div className="ds-row">
              <Sel label="Type" k="pickupType" options={["Single coil","Humbucker","P90","Filtertron","Lipstick","Active humbucker","Mini humbucker"]} data={data} setData={setData} />
              <Sel label="Position" k="pickupPos" options={["Bridge","Middle","Neck","Bridge+Middle","Neck+Middle","All three"]} data={data} setData={setData} />
            </div>
            <Sel label="Output level" k="pickupOutput" options={["Vintage / low output","Medium output","High output","Active (EMG)"]} data={data} setData={setData} />
            <div className="ds-nav">
              <button className="btn-back" onClick={prev}>← Back</button>
              <button className="btn-next" onClick={next}>Next →</button>
            </div>
          </>}

          {cur==="strings" && <>
            <div className="ds-step-lbl">Step 4 of 7 · {LABELS.strings}</div>
            <div className="ds-title">Strings & Attack</div>
            <div className="ds-sub">How you hit the strings matters as much as what strings you use.</div>
            <div className="ds-row">
              <Sel label="String gauge" k="stringGauge" options={[".008-.038",".009-.042",".010-.046",".010-.052",".011-.048",".011-.054",".012+"]} data={data} setData={setData} />
              <Sel label="Material" k="stringMaterial" options={["Nickel wound","Pure nickel","Stainless steel","Coated nickel","Flatwound","Other"]} data={data} setData={setData} />
            </div>
            <div className="ds-row">
              <Sel label="Pick thickness" k="pickThickness" options={["Thin under 0.6mm","Medium 0.6-0.85mm","Heavy 0.85-1.2mm","Extra heavy 1.2mm+","Fingers / no pick"]} data={data} setData={setData} />
              <Sel label="Pick material" k="pickMaterial" options={["Nylon","Celluloid","Tortex","Delrin","Ultex","Metal","Wood or Stone","Fingers"]} data={data} setData={setData} />
            </div>
            <Sel label="Playing style" k="playStyle" options={["Clean fingerpicking","Light strumming","Rhythm / chunk","Lead / melodic","Heavy / palm mute","Heavy shred"]} data={data} setData={setData} />
            <div className="ds-nav">
              <button className="btn-back" onClick={prev}>← Back</button>
              <button className="btn-next" onClick={next}>Next →</button>
            </div>
          </>}

          {cur==="amp" && <>
            <div className="ds-step-lbl">Step 5 of 7 · {LABELS.amp}</div>
            <div className="ds-title">Amp & Pedals</div>
            <div className="ds-sub">Your signal chain — physical gear and/or amp sim software.</div>
            <Field label="Amp make & model" k="ampModel" placeholder="e.g. Marshall JCM800, Fender Twin Reverb, Guitar Rig 7" data={data} setData={setData} />
            <div className="ds-row">
              <Sel label="Amp type" k="ampType" options={["Tube / valve","Solid state","Modeling / digital","Amp sim software","Hybrid"]} data={data} setData={setData} />
              <Sel label="Cabinet / IR" k="cabinet" options={["1x12","2x12","4x12","No cab / headphones","Built-in speaker","Other"]} data={data} setData={setData} />
            </div>
            <TA label="Key pedals / effects in chain" k="pedals" placeholder="e.g. Tube Screamer then Whammy then Carbon Copy delay, or list your Guitar Rig modules" data={data} setData={setData} />
            <div className="ds-nav">
              <button className="btn-back" onClick={prev}>← Back</button>
              <button className="btn-next" onClick={next}>Next →</button>
            </div>
          </>}

          {cur==="speakers" && <>
            <div className="ds-step-lbl">Step 6 of 7 · {LABELS.speakers}</div>
            <div className="ds-title">How you're monitoring</div>
            <div className="ds-sub">What you hear shapes how you dial in. This affects the compensation advice.</div>
            <Sel label="Monitoring setup" k="monitoring" options={["Guitar amp in the room","Studio monitors","Headphones","IEM in-ear monitors","PA / Live rig","Mixed amp + DAW monitors"]} data={data} setData={setData} />
            <Field label="Monitor make & model (optional)" k="monitorModel" placeholder="e.g. Yamaha HS8, Sony MDR-7506" data={data} setData={setData} />
            <Sel label="Room acoustics" k="roomAcoustics" options={["Untreated bedroom / home studio","Partially treated room","Professional studio","Live stage","Direct / no room (headphones)"]} data={data} setData={setData} />
            <div className="ds-nav">
              <button className="btn-back" onClick={prev}>← Back</button>
              <button className="btn-next" onClick={next}>Next →</button>
            </div>
          </>}

          {cur==="playback" && <>
            <div className="ds-step-lbl">Step 7 of 7 · {LABELS.playback}</div>
            <div className="ds-title">Final destination</div>
            <div className="ds-sub">Where will this tone ultimately be heard? End use changes what right sounds like.</div>
            <Sel label="Primary use" k="finalUse" options={["Home practice / playing for fun","Recording to DAW","Streaming / content creation","Live performance","Studio session","Songwriting demos"]} data={data} setData={setData} />
            <Sel label="Listener context" k="listenerContext" options={["Solo guitar / no mix","Full band mix","Produced / mastered track","Unplugged / acoustic reference","Not sure yet"]} data={data} setData={setData} />
            <TA label="Anything else we should know" k="notes" placeholder="Special requests, gear gaps vs target artist, context about the song, etc." data={data} setData={setData} />
            <div className="ds-nav">
              <button className="btn-back" onClick={prev}>← Back</button>
              <button className="btn-next" onClick={runAnalysis}>Analyze My Tone →</button>
            </div>
          </>}

          {cur==="result" && <>
            <div className="ds-step-lbl">Result · {LABELS.result}</div>
            <div className="ds-title">Your Tone Blueprint</div>
            <div className="ds-meta">
              {[{l:"Artist",v:data.artist||"—"},{l:"Era/Song",v:data.era||"General"},{l:"Guitar",v:data.guitarModel||"—"},{l:"Amp",v:data.ampModel||"—"}].map(m=>(
                <div key={m.l} className="ds-chip"><div className="ds-chip-lbl">{m.l}</div><div className="ds-chip-val">{m.v}</div></div>
              ))}
            </div>
            {loading ? (
              <div className="ds-loading"><div className="ds-spinner"/><div>Researching {data.artist||"your artist"}'s gear...</div></div>
            ) : (
              <>
                <div className="ds-result">{result||"No result yet."}</div>
                {error && <div className="ds-error">{error}</div>}
                {result && <>
                  <div className="ds-save-bar">
                    <button className="ds-save-btn" onClick={saveText}>↓ Save .txt</button>
                    <button className="ds-save-btn" onClick={saveJSON}>↓ Save .json</button>
                  </div>
                  {saved && <div className="ds-saved">Saved to your device.</div>}
                  <div className="ds-note">Tip: the JSON stores your full rig profile for reloading later.</div>
                </>}
                <div className="ds-nav" style={{marginTop:"1rem"}}>
                  <button className="btn-back" onClick={prev}>← Edit Rig</button>
                  {result && <button className="btn-ghost" onClick={runAnalysis}>↺ Regenerate</button>}
                </div>
              </>
            )}
          </>}

        </div>
      </div>
    </>
  );
}
