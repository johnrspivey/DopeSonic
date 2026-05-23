# DopeSonic — AI Tone Advisor
### by Bitwerx Labs

---

## Deploy Checklist

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Anthropic API key
In Netlify dashboard → Site settings → Environment variables, add:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Never commit your key. Never put it in .env and push it to git.

### 3. Connect to Netlify
Option A — Netlify CLI:
```bash
npx netlify login
npx netlify init
npx netlify deploy --build --prod
```

Option B — Drag and drop:
```bash
npm run build
```
Then drag the `dist/` folder into Netlify's dashboard at app.netlify.com.

### 4. Point your domains
In Namecheap DNS for dopesonic.pro and dopesonic.dev, set:
- Type: CNAME
- Host: @
- Value: your-site-name.netlify.app

Or swap to Netlify nameservers (recommended):
```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

---

## How it works
1. User fills out 7-step rig profile (artist target, guitar, pickups, strings, amp, monitoring, final use)
2. On submit, the form POSTs to `/api/analyze` (Netlify function at `netlify/functions/analyze.js`)
3. The function calls Anthropic's API with the API key from environment variables (never exposed to browser)
4. Response streams back and renders as a structured Tone Blueprint
5. User can save as .txt or .json to their device

## Roadmap
- v1: AI analysis + save to device ✅
- v2: .ngrr preset file export for Guitar Rig (auto-applies settings)
- v3: MIDI CC/sysex output to dial in Guitar Rig automatically
- v4: Hardware pedalboard controller (USB/MIDI, receives DopeSonic profiles wirelessly)
