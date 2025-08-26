// api/mascot.js — Vercel Serverless Function (gpt-4.1)
const RED_FLAGS = [
  /loss of consciousness|passed out/i,
  /seizure|convulsion/i,
  /repeated vomiting|vomited (twice|three|many)/i,
  /worsening headache|severe headache/i,
  /slurred speech|can't speak clearly/i,
  /weakness|numbness|unequal pupils/i,
  /increasing confusion|very hard to wake|unusual drowsiness|can't wake/i,
  /fluid from (ear|nose)|bleeding from (ear|nose)/i,
  /severe (neck|back) pain/i
];

const ESCALATION = `**Seek urgent medical care now**
Call **000** or go to the nearest emergency department immediately.

While waiting:
- Keep them still and comfortable.
- Do not give food, drink, or medicines.
- Do not leave them alone. Monitor their breathing and responsiveness.

*Information only — not a medical diagnosis. In an emergency call 000.*`;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { message = "" } = (req.body || {});
    const trimmed = String(message).slice(0, 4000);
    if (!trimmed) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "message required" });
    }

    // Red-flag triage
    if (RED_FLAGS.some(r => r.test(trimmed))) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json({ output: ESCALATION });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const SYSTEM =
      process.env.MASCOT_SYSTEM_PROMPT ||
      "You are the FifthQtr Mascot, supporting past AFL/AFLW players and families with safe, compassionate, evidence-based guidance. You are not a doctor. Encourage GP follow-up. Include Australian pathways and helplines where appropriate. End every response with: 'This service provides general information only. Please see your GP for medical advice. In an emergency call 000.'";

    const FRAME = process.env.MASCOT_FRAME || "";

    const payload = {
      model: "gpt-4.1",
      temperature: 0.3,
      input: [
        { role: "system", content: SYSTEM },
        { role: "user", content: trimmed },
        ...(FRAME ? [{ role: "user", content: `Follow this output frame:\n${FRAME}` }] : []),
      ],
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text();
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(502).json({ error: "OpenAI error", detail: txt });
    }

    const data = await r.json();
    const output = data?.output_text || "Sorry, I couldn't generate a response.";
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ output });
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: String(e) });
  }
}
