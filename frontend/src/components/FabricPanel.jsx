export default function FabricPanel({ fabrics, value, onChange }) {
  const items = Array.isArray(fabrics) ? fabrics : [];

  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Fabrics</div>
          <div className="text-xs opacity-70">اختر قماش (Color/Normal/Roughness)</div>
        </div>
        <div className="text-xs opacity-60">{items.length} items</div>
      </div>

      {items.length === 0 ? (
        <div className="mt-3 text-xs opacity-70">
          لا يوجد Fabrics — تأكد أن <b>/fabrics/fabrics.json</b> موجود.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {items.map((f) => {
            const active = f.id === value;
            return (
              <button
                key={f.id}
                onClick={() => onChange?.(f.id)}
                className={[
                  "overflow-hidden rounded-2xl border bg-white text-left transition",
                  active ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 hover:border-slate-300",
                ].join(" ")}
              >
                <div className="h-24 w-full bg-slate-100">
                  <img
                    src={f.color}
                    alt={f.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.opacity = "0.2";
                      e.currentTarget.title = `Image not found: ${f.color}`;
                    }}
                    loading="lazy"
                  />
                </div>

                <div className="p-2">
                  <div className="text-xs font-semibold leading-tight">{f.name}</div>
                  <div className="text-[11px] opacity-70 mt-1">Repeat: {f.repeat ?? 3}x</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
