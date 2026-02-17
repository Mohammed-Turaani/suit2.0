import { FABRIC_LIBRARY } from "./fabricLibrary.js";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function byPattern(pat) {
  return FABRIC_LIBRARY.filter((f) => f.pattern === pat);
}

export function generateFormalSuitAI(mode = "business") {
  // Formal rules:
  // - Jacket & Pants same fabric (suit)
  // - Vest optional
  // - Shirt mostly white/off-white
  // - Tie accent based on fabric tone
  const suitFabricPool =
    mode === "wedding"
      ? [...byPattern("herringbone"), ...byPattern("twill")]
      : mode === "classic"
      ? [...byPattern("weave"), ...byPattern("pinstripe")]
      : [...byPattern("twill"), ...byPattern("weave"), ...byPattern("pinstripe")];

  const suit = pick(suitFabricPool);

  const shirtPool = [
    { id: "shirt_white", name: "Cotton • White", color: "#ffffff", pattern: "weave", density: 18, repeat: 2, roughness: 0.95 },
    { id: "shirt_cream", name: "Cotton • Cream", color: "#f7f3ea", pattern: "weave", density: 18, repeat: 2, roughness: 0.95 },
    { id: "shirt_ice", name: "Cotton • Ice", color: "#f1f5f9", pattern: "weave", density: 18, repeat: 2, roughness: 0.95 },
  ];

  const tiePool = [
    { id: "tie_burgundy", name: "Silk • Burgundy", color: "#7f1d1d", pattern: "twill", density: 22, repeat: 3, roughness: 0.75 },
    { id: "tie_navy", name: "Silk • Navy", color: "#1e3a8a", pattern: "twill", density: 22, repeat: 3, roughness: 0.75 },
    { id: "tie_emerald", name: "Silk • Emerald", color: "#065f46", pattern: "twill", density: 22, repeat: 3, roughness: 0.75 },
    { id: "tie_black", name: "Silk • Black", color: "#0b0b0b", pattern: "twill", density: 22, repeat: 3, roughness: 0.75 },
  ];

  const shirt = pick(shirtPool);

  // Vest: slightly lighter/darker variant
  const vest = { ...suit, id: suit.id + "_vest", name: suit.name + " (Vest)", density: suit.density + 2, roughness: Math.min(0.97, suit.roughness + 0.03) };

  // Tie: for pinstripe prefer solid accent
  const tie = pick(tiePool);

  return {
    name:
      mode === "wedding" ? "Wedding Formal" :
      mode === "classic" ? "Classic Formal" :
      "Business Formal",
    jacket: suit,
    pants: suit,
    vest,
    shirt,
    tie,
  };
}
