// frontend/src/components/ViewControls.jsx
import { useDesignStore } from "../store/designStore.js";

function Btn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 shadow-soft ring-1 ring-black/5 hover:bg-white active:scale-[0.99]"
    >
      {children}
    </button>
  );
}

export default function ViewControls() {
  const autoRotate = useDesignStore((s) => s.design.autoRotate);
  const setDesign = useDesignStore((s) => s.setDesign);
  const nudgeView = useDesignStore((s) => s.nudgeView);
  const resetView = useDesignStore((s) => s.resetView);

  const body = useDesignStore((s) => s.design.body);
  const setBody = useDesignStore((s) => s.setBody);

  return (
    <div className="pointer-events-auto">
      <div className="rounded-2xl bg-white/40 backdrop-blur-md ring-1 ring-black/5 shadow-soft p-3">
        <div className="flex flex-wrap gap-2">
          <Btn title="Rotate Left" onClick={() => nudgeView({ dyaw: +0.18 })}>⟲</Btn>
          <Btn title="Rotate Right" onClick={() => nudgeView({ dyaw: -0.18 })}>⟳</Btn>
          <Btn title="Tilt Up" onClick={() => nudgeView({ dpitch: +0.10 })}>▲</Btn>
          <Btn title="Tilt Down" onClick={() => nudgeView({ dpitch: -0.10 })}>▼</Btn>
          <Btn title="Zoom In" onClick={() => nudgeView({ ddist: -0.25 })}>＋</Btn>
          <Btn title="Zoom Out" onClick={() => nudgeView({ ddist: +0.25 })}>－</Btn>

          <Btn
            title="Auto Rotate"
            onClick={() => setDesign({ autoRotate: !autoRotate })}
          >
            {autoRotate ? "Auto: ON" : "Auto: OFF"}
          </Btn>

          <Btn title="Reset View" onClick={resetView}>Reset</Btn>
        </div>

        <div className="mt-3 grid gap-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>الطول</span>
              <span>{Math.round((body.height || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.25}
              step={0.01}
              value={body.height}
              onChange={(e) => setBody({ height: Number(e.target.value) })}
              className="mt-2 w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>نحيف ↔ ناصح</span>
              <span>{Math.round((body.weight || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.80}
              max={1.35}
              step={0.01}
              value={body.weight}
              onChange={(e) => setBody({ weight: Number(e.target.value) })}
              className="mt-2 w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>الأكتاف</span>
              <span>{Math.round((body.shoulders || 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.35}
              step={0.01}
              value={body.shoulders}
              onChange={(e) => setBody({ shoulders: Number(e.target.value) })}
              className="mt-2 w-full"
            />
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-500">
          التحكمات أعلاه “احترافية” وتشتغل بدون ما تعتمد على الماوس.
        </div>
      </div>
    </div>
  );
}
