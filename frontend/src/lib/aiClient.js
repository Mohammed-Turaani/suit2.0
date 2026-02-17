const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:5050";

export async function generateAISuit({ style = "business", baseColor = "navy" } = {}) {
  const res = await fetch(`${AI_URL}/api/ai/suit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style, baseColor }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
