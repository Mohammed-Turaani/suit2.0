import { useMemo } from "react";
import { useDesignStore } from "../store/designStore.js";

const MANNEQUINS = [
  { id: "human", label: "Default (human.glb)" },
  { id: "male01", label: "Male 01 (add your GLB)" },
  { id: "female01", label: "Female 01 (add your GLB)" },
];

function clamp(n, a, b) {
  const x = Number(n);
  if (!Number.isFinite(x)) return a;
  return Math.max(a, Math.min(b, x));
}

export default function BodyPanel() {
  const mannequin = useDesignStore((s) => s.design.mannequin);
  const body = useDesignStore((s) => s.design.body);
  const setBody = useDesignStore((s) => s.setBody);
  const setMannequin = useDesignStore((s) => s.setMannequin);

  const info = useMemo(() => {
    const h = Math.round((body.height || 1) * 100);
    const w = Math.round((body.weight || 1) * 100);
    const sh = Math.round((body.shoulders || 1) * 100);
    return { h, w, sh };
  }, [body.height, body.weight, body.shoulders]);

  return (
    <div className="rounded-3xl bg-white/40 p-4 shadow-soft backdrop-blur-md ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-600">الملكان</div>
          <div className="text-lg font-semibold text-slate-900">شكل الجسم</div>
        </div>
        <div className="text-xs text-slate-500">Height {info.h}% • Weight {info.w}% • Shoulders {info.sh}%</div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-semibold text-slate-600">اختيار ملكان (GLB)</label>
        <select
          value={mannequin}
          onChange={(e) => setMannequin(e.target.value)}
          className="mt-1 w-full rounded-2xl bg-white/60 px-3 py-2 text-sm text-slate-800 ring-1 ring-black/5"
        >
          {MANNEQUINS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>

        <div className="mt-3 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">الطول</div>
              <div className="text-xs text-slate-500">{info.h}%</div>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.15}
              step={0.01}
              value={body.height}
              onChange={(e) => setBody({ height: clamp(e.target.value, 0.85, 1.15) })}
              className="mt-2 w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">نحيف ↔ ناصح</div>
              <div className="text-xs text-slate-500">{info.w}%</div>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.25}
              step={0.01}
              value={body.weight}
              onChange={(e) => setBody({ weight: clamp(e.target.value, 0.8, 1.25) })}
              className="mt-2 w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">الأكتاف</div>
              <div className="text-xs text-slate-500">{info.sh}%</div>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.25}
              step={0.01}
              value={body.shoulders}
              onChange={(e) => setBody({ shoulders: clamp(e.target.value, 0.85, 1.25) })}
              className="mt-2 w-full"
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          ملاحظة: هذه التحكمات تعمل الآن عبر Scaling. لما تعطيني ملكان فيه Morph Targets (Shape Keys) بنربطه ليصير واقعي 100%.
        </div>
      </div>
    </div>
  );
}
