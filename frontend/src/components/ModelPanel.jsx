export default function ModelPanel({ models, value, onChange }) {
  const items = Array.isArray(models) ? models : [];

  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Models</div>
          <div className="text-xs opacity-70">اختر القطعة/الموديل</div>
        </div>
        <div className="text-xs opacity-60">{items.length} items</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              onClick={() => onChange?.(m.id)}
              className={[
                "text-left rounded-xl border p-2 transition",
                active
                  ? "border-slate-900 bg-slate-900 text-white shadow"
                  : "border-slate-200 bg-white hover:border-slate-300",
              ].join(" ")}
            >
              <div className="text-xs font-semibold leading-tight">{m.name}</div>
              <div className={["text-[11px] mt-1", active ? "opacity-80" : "opacity-60"].join(" ")}>
                {m.tag || "Click to select"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
