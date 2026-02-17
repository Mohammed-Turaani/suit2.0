
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*"
}));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "AI backend running" });
});

app.post("/api/ai/suit", async (req, res) => {
  try {
    const { style = "business", baseColor = "navy" } = req.body || {};

    const prompt = `
Return ONLY JSON:
{
 "style": "${style}",
 "parts": {
  "jacket": {"hex":"#1f2937","fabric":"wool","patternScale":3,"roughness":0.92},
  "pants": {"hex":"#1f2937","fabric":"wool","patternScale":3,"roughness":0.92},
  "vest": {"hex":"#374151","fabric":"wool","patternScale":2,"roughness":0.9},
  "shirt": {"hex":"#ffffff","fabric":"cotton","patternScale":1,"roughness":0.8},
  "tie": {"hex":"#7c3aed","fabric":"silk","patternScale":1,"roughness":0.6}
 },
 "notes_ar":"بدلة رسمية احترافية مناسبة للأعمال"
}
`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        text: { format: { type: "json_object" } }
      })
    });

    const data = await r.json();
    const outText =
      data.output?.[0]?.content?.find(c => c.type === "output_text")?.text
      || data.output_text;

    res.json(JSON.parse(outText));

  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log("AI backend running on port", PORT));
