import React from "react";

function Card({ active, onClick, title, subtitle, thumb }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl border bg-white shadow-sm transition",
        "hover:border-slate-300",
        active ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200",
      ].join(" ")}
    >
      <div className="p-2">
        <div className="h-20 w-full overflow-hidden rounded-lg bg-slate-100">
          {thumb ? (
            <img
              src={thumb}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                // لو الصورة فشلت ما نخربط الكرت
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        <div className="mt-2">
          <div className="text-sm font-semibold leading-tight">{title}</div>
          {subtitle ? <div className="text-[11px] opacity-70">{subtitle}</div> : null}
        </div>
      </div>
    </button>
  );
}

export default function ControlPanel({ models = [], modelUrl, setModelUrl, fabrics = [], fabric, setFabric }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {/* MODELS */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold">Models</div>
          <div className="text-xs opacity-60">اختر القطعة / الموديل</div>
        </div>
        <div className="text-xs opacity-60">{models.length}</div>
      </div>

      <div className="max-h-[260px] overflow-auto pr-1">
        <div className="grid grid-cols-2 gap-2 auto-rows-max">
          {models.map((m) => (
            <Card
              key={m.url || m.id}
              active={m.url === modelUrl}
              onClick={() => setModelUrl?.(m.url)}
              title={m.name}
              subtitle="Click to select"
              thumb={null}
            />
          ))}
        </div>
      </div>

      <div className="my-4 h-px bg-slate-200" />

      {/* FABRICS */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-sm font-semibold">Fabrics</div>
          <div className="text-xs opacity-60">كل الأقمشة من fabrics.json</div>
        </div>
        <div className="text-xs opacity-60">{fabrics.length}</div>
      </div>

      <div className="max-h-[420px] overflow-auto pr-1">
        <div className="grid grid-cols-2 gap-2 auto-rows-max">
          {fabrics.map((f) => (
            <Card
              key={f.id || f.name}
              active={fabric?.id ? fabric.id === f.id : fabric?.name === f.name}
              onClick={() => setFabric?.(f)}
              title={f.name}
              subtitle={`Repeat: ${f.repeat ?? 3}x`}
              thumb={f.color}
            />
          ))}
        </div>

        {(!fabrics || fabrics.length === 0) && (
          <div className="mt-2 rounded-xl border border-dashed border-slate-300 p-3 text-xs opacity-70">
            ما في Fabrics. تأكد من:
            <div className="mt-1 font-mono">frontend/public/fabrics/fabrics.json</div>
          </div>
        )}
      </div>
    </div>
  );
}
