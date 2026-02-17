import * as THREE from "three";

function makeCanvas(size = 512) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  return c;
}

function addNoise(ctx, size, amount = 10) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

function weave({ base = "#223a5e", size = 512, density = 16 }) {
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const step = Math.max(3, Math.floor(size / density));
  // horizontal threads
  for (let y = 0; y < size; y += step) {
    ctx.fillStyle = y % (step * 2) === 0 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    ctx.fillRect(0, y, size, 1);
  }
  // vertical threads
  for (let x = 0; x < size; x += step) {
    ctx.fillStyle = x % (step * 2) === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.fillRect(x, 0, 1, size);
  }

  addNoise(ctx, size, 10);

  // subtle highlight (gives depth under HDRI)
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.beginPath();
  ctx.ellipse(size * 0.35, size * 0.25, size * 0.55, size * 0.45, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  return c;
}

function twill({ base = "#223a5e", size = 512, density = 16 }) {
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const step = Math.max(3, Math.floor(size / density));
  // diagonal lines
  for (let i = -size; i < size * 2; i += step) {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - size, size);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.moveTo(i + step / 2, 0);
    ctx.lineTo(i + step / 2 - size, size);
    ctx.stroke();
  }

  addNoise(ctx, size, 10);
  return c;
}

function herringbone({ base = "#223a5e", size = 512, density = 16 }) {
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const step = Math.max(6, Math.floor(size / density));
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const flip = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = flip ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y);
      ctx.lineTo(x, y + step);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = flip ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(x + step, y);
      ctx.lineTo(x + step, y + step);
      ctx.lineTo(x, y + step);
      ctx.closePath();
      ctx.fill();
    }
  }

  addNoise(ctx, size, 9);
  return c;
}

function pinstripe({ base = "#223a5e", size = 512, density = 20 }) {
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const step = Math.max(8, Math.floor(size / density));
  for (let x = 0; x < size; x += step) {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x, 0, 1, size);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(x + 2, 0, 1, size);
  }

  addNoise(ctx, size, 8);
  return c;
}

function normalCanvas(size = 512) {
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1 + Math.random() * 2.2;
    ctx.fillStyle = "rgba(140,140,255,0.35)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function toTexture(canvas, repeat = 2) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

export function buildFabricMaterial({
  color = "#223a5e",
  pattern = "weave",
  density = 16,
  repeat = 2,
  roughness = 0.92,
} = {}) {
  const make =
    pattern === "twill" ? twill :
    pattern === "herringbone" ? herringbone :
    pattern === "pinstripe" ? pinstripe :
    weave;

  const map = toTexture(make({ base: color, density, size: 512 }), repeat);
  const normalMap = toTexture(normalCanvas(512), repeat);

  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughness: Math.min(0.98, Math.max(0.6, Number(roughness) || 0.92)),
    metalness: 0.02,
    envMapIntensity: 0.7,
    color: new THREE.Color("#ffffff"),
  });

  return mat;
}
