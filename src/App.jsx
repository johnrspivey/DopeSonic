import { useState } from "react";

const STEPS = ["artist", "guitar", "pickups", "strings", "amp", "speakers", "playback", "result"];

const STEP_LABELS = {
  artist: "Target Artist", guitar: "Your Guitar", pickups: "Pickups",
  strings: "Strings & Attack", amp: "Amp & Pedals", speakers: "Monitoring",
  playback: "Final Use", result: "Tone Blueprint",
};

const s = {
  root: { maxWidth: 620, margin: "0 auto", padding: "2rem 1.25rem 3rem" },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.6rem", letterSpacing: "0.08em", lineHeight: 1, marginBottom: "0.2rem" },
  logoAccent: { color: "#BA7517" },
  tagline: { fontSize: 11, letterSpacing: "0.16em", color: "var(--text-2)", textTransform: "uppercase", marginBottom: "1.75rem" },
  progressWrap: { display: "flex", gap: 4, marginBottom: "1.75rem" },
  pip: (state) => ({ height: 3, flex: 1, borderRadius: 2, background: state === "done" ? "#BA7517" : state === "active" ? "#EF9F27" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }),
  stepLabel: { fontSize: 10, letterSpacing: "0.14em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: "0.4rem" },
  sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.06em", marginBottom: "0.2rem" },
  sectionSub: { fontSize: 12, color: "var(--text-2)", marginBottom: "1.25rem", lineHeight: 1.7 },
  field: { marginBottom: "0.9rem" },
  label: { display: "block", fontSize: 10, letterSpacing: "0.14em", color: "#BA7517", textTransform: "uppercase", marginBottom: "0.3rem" },
  input: { width: "100%", background: "var(--bg-2)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "8px 12px", outline: "none" },
  select: { width: "100%", background: "var(--bg-2)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "8px 12px", outline: "none" },
  textarea: { width: "100%", background: "var(--bg-2)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "8px 12px", outline: "none", resize: "vertical", minHeight: 72 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  nav: { display: "flex", gap: 10, marginTop: "1.5rem" },
  btnBack: { flex: 1, padding: "10px 0", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", color: "var(--text-2)" },
  btnNext: { flex: 2, padding: "10px 0", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", background: "#BA7517", border: "none", color: "#fff", fontWeight: 500 },
  btnGhost: { flex: 1, padding: "10px 0", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", color: "var(--text-2)" },
  resultBox: { background: "var(--bg-2)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "1.25rem", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--text)", minHeight: 200 },
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 8, marginBottom: "1rem" },
  metaChip: { background: "var(--bg-2)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px" },
  metaLabel: { fontSize: 10, letterSpacing: "0.12em", color: "#BA7517", textTransform: "uppercase" },
  metaVal: { fontSize: 12, color: "var(--text)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  saveBar: { display: "flex", gap: 8, marginTop: "1.25rem", flexWrap: "wrap" },
  saveBtn: { display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase", border: "0.5px solid rgba(255,255,255,0.15)", background: "var(--bg-2)", color: "var(--text-2)" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "3rem 0", color: "var(--text-2)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" },
  errorText: { color: "var(--red)", fontSize: 12, marginTop: "0.5rem" },
  gdNote: { fontSize: 11, color: "var(--text-3)", marginTop: 6 },
};

function Field({ label, fieldKey, placeholder, data, setData, type = "text" }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} placeholder={placeholder} value={data[fieldKey] || ""}
        onChange={e => setData(d => ({ ...d, [fieldKey]: e.target.value }))} />
    </div>
  );
}

function SelectField({ label, fieldKey, options, data, setData }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <select style={s.select} value={data[fieldKey] || ""} onChange={e => setData(d => ({ ...d, [fieldKey]: e.target.value }))}>
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, fieldKey, placeholder, data, setData }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <textarea style={s.textarea} placeholder={placeholder} value={data[fieldKey] || ""}
        onChange={e => setData(d => ({ ...d, [fieldKey]: e.target.value }))} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#BA7517", animation: "ds-spin 0.8s linear infinite" }} />
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const next = () => { setStep(i => i + 1); window.scrollTo(0, 0); };
  const prev = () => { setStep(i => i - 1); window.scrollTo(0, 0); };

  const artistRef = [data.artist, data.era].filter(Boolean).join(" — ");

  const buildPrompt = () => `You are DopeSonic, an expert guitar tone advisor. A guitarist wants to sound like ${artistRef}.

First: recall everything documented about ${artistRef}'s actual gear — guitars, pickups, strings, amps, cabinets, pedals, settings, and techniques for that specific era or song. Be specific and factual.

The user's rig:
Guitar: ${data.guitarModel || "not specified"} | Body: ${data.bodyWood || "?"} | Neck: ${data.neckWood || "?"} | Fretboard: ${data.fretboard || "?"}
Pickups: ${data.pickupModel || "not specified"} (${data.pickupType || ""}, ${data.pickupPos || ""}, ${data.pickupOutput || ""})
Strings: ${data.stringGauge || "?"} ${data.stringMaterial || ""} | Pick: ${data.pickThickness || "?"} ${data.pickMaterial || ""} | Style: ${data.playStyle || "?"}
Amp: ${data.ampModel || "not specified"} (${data.ampType || ""}) | Cabinet: ${data.cabinet || "?"}
Pedals/Chain: ${data.pedals || "none specified"}
Monitoring: ${data.monitoring || "?"} — ${data.monitorModel || ""} | Room: ${data.roomAcoustics || "?"}
Final use: ${data.finalUse || "?"} | Mix context: ${data.listenerContext || "?"}
${data.notes ? `Additional notes: ${data.notes}` : ""}

Produce a structured Tone Blueprint with these exact sections:

🎸 ARTIST GEAR REFERENCE
What ${artistRef} actually used (documented gear for this era/song).

📊 RIG GAP ANALYSIS
How the user's rig compares — what's close, what's different, what matters most.

🎛️ PHYSICAL GEAR ADJUSTMENTS
Specific, precise changes: pickup height, tone/volume controls, pick technique, amp settings, pedal settings. Give real numbers (e.g. "Roll tone to 7, pick near the neck").

🖥️ AMP SIM / SIGNAL CHAIN SETTINGS
Recommended amp sim modules and settings if applicable. Otherwise amp channel/EQ/gain guidance.

🔊 MONITORING COMPENSATION
Tone adjustments to account for their monitoring setup vs the original recording context.

⚡ QUICK WIN
The single most impactful change they can make right now.

Be direct and specific. Write like a knowledgeable player, not generic AI. Reference real gear names and real numbers.`;

  const runAnalysis = async () => {
    setStep(STEPS.length - 1);
    setLoading(true);
    setError("");
    setResult("");
    setSaved(false);
    window.scrollTo(0, 0);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      const json = await res.json();
      const text = json.content?.map(c => c.text || "").join("") || "No response received.";
      setResult(text);
    } catch (e) {
      setError("Connection error — please try again.");
    }
    setLoading(false);
  };

  const saveAsText = () => {
    const header = `DOPESONIC TONE BLUEPRINT\nGenerated: ${new Date().toLocaleString()}\nArtist: ${artistRef}\nGear: ${data.guitarModel || ""} / ${data.ampModel || ""}\n${"—".repeat(48)}\n\n`;
    const blob = new Blob([header + result], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dopesonic-${(data.artist || "tone").replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    setSaved(true);
  };

  const saveAsJSON = () => {
    const payload = { generated: new Date().toISOString(), rig: data, blueprint: result };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dopesonic-${(data.artist || "tone").replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    setSaved(true);
  };

  const currentStepName = STEPS[step];

  return (
    <>
      <style>{`@keyframes ds-spin { to { transform: rotate(360deg); } } select option { background: #1e1e1e; }`}</style>
      <div style={s.root}>
        <div style={s.logo}>Dope<span style={s.logoAccent}>Sonic</span></div>
        <div style={s.tagline}>AI Tone Advisor · Bitwerx Labs</div>

        {/* Progress */}
        <div style={s.progressWrap}>
          {STEPS.map((st, i) => (
            <div key={st} title={STEP_LABELS[st]} style={s.pip(i < step ? "done" : i === step ? "active" : "idle")} />
          ))}
        </div>

        {/* Step: Artist */}
        {currentStepName === "artist" && (
          <>
            <div style={s.stepLabel}>Step 1 of 7 · {STEP_LABELS.artist}</div>
            <div style={s.sectionTitle}>Who's your target?</div>
            <div style={s.sectionSub}>The player you want to sound like. Album, era, or song makes the advice much more precise.</div>
            <Field label="Target artist" fieldKey="artist" placeholder="e.g. David Gilmour, John Mayer, Dimebag Darrell" data={data} setData={setData} />
            <Field label="Era / album / song (optional)" fieldKey="era" placeholder="e.g. Comfortably Numb, Continuum, Vulgar Display of Power" data={data} setData={setData} />
            <div style={s.nav}>
              <button style={s.btnNext} onClick={next}>Next →</button>
            </div>
          </>
        )}

        {/* Step: Guitar */}
        {currentStepName === "guitar" && (
          <>
            <div style={s.stepLabel}>Step 2 of 7 · {STEP_LABELS.guitar}</div>
            <div style={s.sectionTitle}>Your guitar</div>
            <div style={s.sectionSub}>The instrument you're actually playing.</div>
            <Field label="Make & model" fieldKey="guitarModel" placeholder="e.g. Fender Stratocaster, Gibson Les Paul Standard" data={data} setData={setData} />
            <div style={s.row}>
              <SelectField label="Body wood" fieldKey="bodyWood" options={["Alder","Ash","Mahogany","Basswood","Poplar","Maple","Semi-hollow","Hollow","Other"]} data={data} setData={setData} />
              <SelectField label="Neck wood" fieldKey="neckWood" options={["Maple","Mahogany","Roasted Maple","Walnut","Other"]} data={data} setData={setData} />
            </div>
            <div style={s.row}>
              <SelectField label="Fretboard" fieldKey="fretboard" options={["Rosewood","Maple","Ebony","Pau Ferro","Laurel","Other"]} data={data} setData={setData} />
              <SelectField label="Scale length" fieldKey="scaleLength" options={['24.75" (Gibson)','25" (PRS)','25.5" (Fender)','26.5" (Baritone)',"Other"]} data={data} setData={setData} />
            </div>
            <div style={s.nav}>
              <button style={s.btnBack} onClick={prev}>← Back</button>
              <button style={s.btnNext} onClick={next}>Next →</button>
            </div>
          </>
        )}

        {/* Step: Pickups */}
        {currentStepName === "pickups" && (
          <>
            <div style={s.stepLabel}>Step 3 of 7 · {STEP_LABELS.pickups}</div>
            <div style={s.sectionTitle}>Pickups</div>
            <div style={s.sectionSub}>What's driving the signal at the source.</div>
            <Field label="Pickup make & model" fieldKey="pickupModel" placeholder="e.g. Seymour Duncan SSL-1, DiMarzio Super Distortion" data={data} setData={setData} />
            <div style={s.row}>
              <SelectField label="Pickup type" fieldKey="pickupType" options={["Single coil","Humbucker","P90","Filtertron","Lipstick","Active humbucker","Mini humbucker"]} data={data} setData={setData} />
              <SelectField label="Position used most" fieldKey="pickupPos" options={["Bridge","Middle","Neck","Bridge+Middle","Neck+Middle","All three"]} data={data} setData={setData} />
            </div>
            <SelectField label="Output level" fieldKey="pickupOutput" options={["Vintage / low output","Medium output","High output","Active (e.g. EMG)"]} data={data} setData={setData} />
            <div style={s.nav}>
              <button style={s.btnBack} onClick={prev}>← Back</button>
              <button style={s.btnNext} onClick={next}>Next →</button>
            </div>
          </>
        )}

        {/* Step: Strings */}
        {currentStepName === "strings" && (
          <>
            <div style={s.stepLabel}>Step 4 of 7 · {STEP_LABELS.strings}</div>
            <div style={s.sectionTitle}>Strings & Attack</div>
            <div style={s.sectionSub}>How you hit the strings matters as much as what strings you use.</div>
            <div style={s.row}>
              <SelectField label="String gauge" fieldKey="stringGauge" options={[".008-.038",".009-.042",".010-.046",".010-.052",".011-.048",".011-.054",".012+"]} data={data} setData={setData} />
              <SelectField label="String material" fieldKey="stringMaterial" options={["Nickel wound","Pure nickel","Stainless steel","Coated nickel","Flatwound","Other"]} data={data} setData={setData} />
            </div>
            <div style={s.row}>
              <SelectField label="Pick thickness" fieldKey="pickThickness" options={["Thin (< 0.6mm)","Medium (0.6–0.85mm)","Heavy (0.85–1.2mm)","Extra heavy (1.2mm+)","Fingers / no pick"]} data={data} setData={setData} />
              <SelectField label="Pick material" fieldKey="pickMaterial" options={["Nylon","Celluloid","Tortex","Delrin","Ultex","Metal","Wood/Stone","Fingers"]} data={data} setData={setData} />
            </div>
            <SelectField label="Playing style" fieldKey="playStyle" options={["Clean fingerpicking","Light strumming","Rhythm / chunk","Lead / melodic","Heavy/palm mute","Heavy shred"]} data={data} setData={setData} />
            <div style={s.nav}>
              <button style={s.btnBack} onClick={prev}>← Back</button>
              <button style={s.btnNext} onClick={next}>Next →</button>
            </div>
          </>
        )}

        {/* Step: Amp */}
        {currentStepName === "amp" && (
          <>
            <div style={s.stepLabel}>Step 5 of 7 · {STEP_LABELS.amp}</div>
            <div style={s.sectionTitle}>Amp & Pedals</div>
            <div style={s.sectionSub}>Your signal chain — physical gear and/or amp sim software.</div>
            <Field label="Amp make & model" fieldKey="ampModel" placeholder="e.g. Marshall JCM800, Fender Twin Reverb, Guitar Rig 7" data={data} setData={setData} />
            <div style={s.row}>
              <SelectField label="Amp type" fieldKey="ampType" options={["Tube / valve","Solid state","Modeling / digital","Amp sim (software)","Hybrid"]} data={data} setData={setData} />
              <SelectField label="Cabinet / IR" fieldKey="cabinet" options={["1x12","2x12","4x12","No cab (headphones/IR)","Built-in speaker","Other"]} data={data} setData={setData} />
            </div>
            <TextareaField label="Key pedals / effects in chain" fieldKey="pedals" placeholder="e.g. Tube Screamer → Whammy → Carbon Copy delay, or list your Guitar Rig modules" data={data} setData={setData} />
            <div style={s.nav}>
              <button style={s.btnBack} onClick={prev}>← Back</button>
              <button style={s.btnNext} onClick={next}>Next →</button>
            </div>
          </>
        )}

        {/* Step: Speakers */}
        {currentStepName === "speakers" && (
          <>
            <div style={s.stepLabel}>Step 6 of 7 · {STEP_LABELS.speakers}</div>
            <div style={s.sectionTitle}>How you're monitoring</div>
            <div style={s.sectionSub}>What you hear shapes how you dial in. This affects the compensation advice.</div>
            <SelectField label="Monitoring setup" fieldKey="monitoring" options={["Guitar amp in the room","Studio monitors","Headphones","IEM (in-ear monitors)","PA/Live rig","Mixed (amp + DAW monitors)"]} data={data} setData={setData} />
            <Field label="Monitor make & model (optional)" fieldKey="monitorModel" placeholder="e.g. Yamaha HS8, Sony MDR-7506" data={data} setData={setData} />
            <SelectField label="Room acoustics" fieldKey="roomAcoustics" options={["Untreated bedroom / home studio","Partially treated room","Professional studio","Live stage","Direct / no room (headphones only)"]} data={data} setData={setData} />
            <div style={s.nav}>
              <button style={s.btnBack} onClick={prev}>← Back</button>
              <button style={s.btnNext} onClick={next}>Next →</button>
            </div>
          </>
        )}

        {/* Step: Playback */}
        {currentStepName === "playback" && (
          <>
            <div style={s.stepLabel}>Step 7 of 7 · {STEP_LABELS.playback}</div>
            <div style={s.sectionTitle}>Final destination</div>
            <div style={s.sectionSub}>Where will this tone ultimately be heard? End use changes what "right" sounds like.</div>
            <SelectField label="Primary use" fieldKey="finalUse" options={["Home practice / playing for fun","Recording to DAW","Streaming / content creation","Live performance","Studio session","Songwriting demos"]} data={data} setData={setData} />
            <SelectField label="Listener context" fieldKey="listenerContext" options={["Solo guitar / no mix","Full band mix","Produced/mastered track","Unplugged / acoustic reference","Not sure yet"]} data={data} setData={setData} />
            <TextareaField label="Anything else we should know?" fieldKey="notes" placeholder="Special requests, gear gaps vs target artist, context about the song, etc." data={data} setData={setData} />
            <div style={s.nav}>
              <button style={s.btnBack} onClick={prev}>← Back</button>
              <button style={s.btnNext} onClick={runAnalysis}>Analyze My Tone ↗</button>
            </div>
          </>
        )}

        {/* Step: Result */}
        {currentStepName === "result" && (
          <>
            <div style={s.stepLabel}>Result · {STEP_LABELS.result}</div>
            <div style={s.sectionTitle}>Your Tone Blueprint</div>

            {/* Meta chips */}
            <div style={s.metaGrid}>
              {[{ label: "Artist", val: data.artist || "—" }, { label: "Era/Song", val: data.era || "General" }, { label: "Guitar", val: data.guitarModel || "—" }, { label: "Amp", val: data.ampModel || "—" }].map(m => (
                <div key={m.label} style={s.metaChip}>
                  <div style={s.metaLabel}>{m.label}</div>
                  <div style={s.metaVal}>{m.val}</div>
                </div>
              ))}
            </div>

            {loading ? (
              <div style={s.loadingWrap}>
                <Spinner />
                <div>Researching {data.artist || "your artist"}'s gear...</div>
              </div>
            ) : (
              <>
                <div style={s.resultBox}>{result || "No result yet."}</div>
                {error && <div style={s.errorText}>{error}</div>}

                {result && (
                  <>
                    <div style={s.saveBar}>
                      <button style={s.saveBtn} onClick={saveAsText}>↓ Save as .txt</button>
                      <button style={s.saveBtn} onClick={saveAsJSON}>↓ Save as JSON</button>
                    </div>
                    {saved && <div style={{ fontSize: 11, color: "#BA7517", marginTop: 6 }}>Saved to your device.</div>}
                    <div style={s.gdNote}>Tip: open the JSON file later to reload your full rig profile.</div>
                  </>
                )}

                <div style={s.nav}>
                  <button style={s.btnBack} onClick={prev}>← Edit Rig</button>
                  {result && <button style={s.btnGhost} onClick={runAnalysis}>↺ Regenerate</button>}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
