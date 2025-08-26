# FifthQtr Mascot — Vercel Package (v4)

Contents
- `api/mascot.js` — Vercel Serverless Function (OpenAI Responses API, gpt-4.1, red-flag triage)
- `public/widget.v4.js` — embeddable widget (bigger bubble, shared avatar, starter prompts, Copy for GP, Reset)
- `public/avatars/ken-style.svg` — neutral, past-player style avatar (no logos)
- `public/index.html` — demo page

## Deploy on Vercel
1. Create a new Vercel project from this folder.
2. In **Settings → Environment Variables** add:
   - `OPENAI_API_KEY`
   - (optional) `MASCOT_SYSTEM_PROMPT`
   - (optional) `MASCOT_FRAME`
3. Deploy. Test:
   - `GET /api/mascot` → `{ "error": "Use POST" }` expected.
   - `/` → demo page → click avatar → ask a question.

## Embed in WordPress (Avada → Code Fields → Space before </body>)
```html
<script
  src="https://<your-vercel-app>.vercel.app/widget.v4.js"
  defer
  data-endpoint="https://<your-vercel-app>.vercel.app/api/mascot"
  data-accent="#0a2342"
  data-text="#111827"
  data-avatar="https://<your-vercel-app>.vercel.app/avatars/ken-style.svg"></script>
