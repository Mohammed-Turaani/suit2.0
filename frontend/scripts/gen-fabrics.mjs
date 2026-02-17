import fs from "fs";
import path from "path";

const dir = path.resolve("public/fabrics");
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".jpg"));

const isMap = (f) => /_(normal|rough)\.jpg$/i.test(f);

// صور الأقمشة الأساسية (بدون normal/rough)
const baseFiles = files.filter((f) => !isMap(f));

function pickKind(name) {
  const n = name.toLowerCase();
  if (n.startsWith("cotton_")) return "cotton";
  if (n.startsWith("silk_")) return "silk";
  if (n.startsWith("wool_")) return "wool";
  return null;
}

function exists(fileName) {
  return files.some((f) => f.toLowerCase() === fileName.toLowerCase());
}

const fabrics = baseFiles.map((file) => {
  const base = file.replace(/\.jpg$/i, "");
  const kind = pickKind(base);

  // 1) حاول تربط normal/rough بنفس الاسم (أفضل حالة)
  const directNormal = `${base}_normal.jpg`;
  const directRough = `${base}_rough.jpg`;

  // 2) إذا مش موجودين، استخدم normal/rough الافتراضي حسب النوع
  const fallbackNormal = kind ? `${kind}_normal.jpg` : null;
  const fallbackRough = kind ? `${kind}_rough.jpg` : null;

  const normal =
    exists(directNormal) ? `/fabrics/${directNormal}` :
    (fallbackNormal && exists(fallbackNormal)) ? `/fabrics/${fallbackNormal}` :
    null;

  const roughness =
    exists(directRough) ? `/fabrics/${directRough}` :
    (fallbackRough && exists(fallbackRough)) ? `/fabrics/${fallbackRough}` :
    null;

  return {
    id: base,
    name: base.replace(/_/g, " "),
    color: `/fabrics/${file}`,
    normal,
    roughness,
    repeat: 3,
    baseRoughness: kind === "silk" ? 0.6 : kind === "wool" ? 0.9 : 0.85,
    env: 0.12
  };
});

fs.writeFileSync(path.join(dir, "fabrics.json"), JSON.stringify(fabrics, null, 2), "utf-8");
console.log("✅ Generated fabrics:", fabrics.length);
