function clamp01(x) { return Math.min(1, Math.max(0, x)); }

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  const to = (x) => x.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToRgb({ h, s, v }) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0, gp = 0, bp = 0;

  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

function rotateHue(hex, deg) {
  const hsv = rgbToHsv(hexToRgb(hex));
  hsv.h = (hsv.h + deg) % 360;
  return rgbToHex(hsvToRgb(hsv));
}

function tweak(hex, { s = 1, v = 1 }) {
  const hsv = rgbToHsv(hexToRgb(hex));
  hsv.s = clamp01(hsv.s * s);
  hsv.v = clamp01(hsv.v * v);
  return rgbToHex(hsvToRgb(hsv));
}

export function suggestPalette({ baseJacket }) {
  const comp = rotateHue(baseJacket, 180);
  const ana1 = rotateHue(baseJacket, 25);
  const ana2 = rotateHue(baseJacket, -25);
  const tri1 = rotateHue(baseJacket, 120);
  const tri2 = rotateHue(baseJacket, 240);

  const pants = tweak(baseJacket, { s: 0.9, v: 0.33 });
  const shirt = "#f4f6f8";
  const accent = tweak(comp, { s: 0.75, v: 0.60 });

  return {
    recommended: [
      { name: "Classic", jacket: tweak(baseJacket, { s: 0.95, v: 0.45 }), pants, shirt, accent },
      { name: "Analogous", jacket: tweak(ana1, { s: 0.9, v: 0.45 }), pants: tweak(ana2, { s: 0.6, v: 0.30 }), shirt, accent: tweak(ana1, { s: 0.85, v: 0.60 }) },
      { name: "Triad", jacket: tweak(tri1, { s: 0.85, v: 0.45 }), pants: tweak(tri2, { s: 0.65, v: 0.32 }), shirt, accent: tweak(comp, { s: 0.7, v: 0.60 }) },
    ],
    swatches: [baseJacket, comp, ana1, ana2, tri1, tri2].map((c) => tweak(c, { s: 0.9, v: 0.55 })),
  };
}
