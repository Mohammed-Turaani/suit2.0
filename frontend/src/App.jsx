// frontend/src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ModelViewer from "./components/ModelViewer.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import ViewControls from "./components/ViewControls.jsx";
import ExportButtons from "./components/ExportButtons.jsx";

function withBase(u) {
  const base = import.meta.env.BASE_URL || "/";
  const clean = String(u || "");
  const noLeading = clean.startsWith("/") ? clean.slice(1) : clean;
  return new URL(noLeading, window.location.origin + base).toString();
}

async function safeFetchJson(paths) {
  for (const p of paths) {
    try {
      const res = await fetch(withBase(p), { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {}
  }
  return [];
}

function normalizeFabrics(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((f) => ({
    ...f,
    color: f?.color ? withBase(f.color) : null,
    normal: f?.normal ? withBase(f.normal) : null,
    roughness: f?.roughness ? withBase(f.roughness) : null,
  }));
}

function normalizeModels(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((m) => ({
    ...m,
    url: m?.url ? withBase(m.url) : null,
  }));
}

export default function App() {
  const [models, setModels] = useState([]);
  const [fabrics, setFabrics] = useState([]);

  const [modelUrl, setModelUrl] = useState("");
  const [fabric, setFabric] = useState(null);

  const viewerWrapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const f = await safeFetchJson(["fabrics/fabrics.json", "fabrics.json"]);
      const m = await safeFetchJson(["models/models.json", "models.json"]);

      const nf = normalizeFabrics(f);
      const nm = normalizeModels(m);

      setFabrics(nf);
      setModels(nm);

      if (nm?.length) setModelUrl(nm[0].url);
      if (nf?.length) setFabric(nf[0]);
    })();
  }, []);

  const titleModel = useMemo(() => models.find((x) => x.url === modelUrl)?.name || "—", [models, modelUrl]);
  const titleFabric = useMemo(() => fabric?.name || "—", [fabric]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f8ff] to-[#eef2ff]">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900">3D Suit Configurator</div>
            <div className="text-xs text-slate-600 mt-1">
              <span className="font-semibold">{titleModel}</span> • <span className="font-semibold">{titleFabric}</span>
            </div>
          </div>

          <ExportButtons previewRef={viewerWrapRef} />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Viewer */}
          <div className="col-span-12 lg:col-span-8">
            <div className="relative rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-md shadow-soft overflow-hidden">
              <div ref={viewerWrapRef} className="h-[72vh] min-h-[560px]">
                <ModelViewer modelUrl={modelUrl} fabric={fabric} />
              </div>

              {/* Overlay Controls */}
              <div className="absolute left-3 top-3">
                <ViewControls />
              </div>

              <div className="absolute right-3 bottom-3 rounded-xl bg-white/60 backdrop-blur-md px-3 py-2 text-[11px] text-slate-600 ring-1 ring-black/5">
                Mouse: drag to orbit • Wheel: zoom
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-md shadow-soft">
              <div className="h-[72vh] min-h-[560px] overflow-hidden">
                <div className="h-full overflow-y-auto p-4">
                  <ControlPanel
                    models={models}
                    modelUrl={modelUrl}
                    setModelUrl={setModelUrl}
                    fabrics={fabrics}
                    fabric={fabric}
                    setFabric={setFabric}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-600 opacity-80">
          Tip: إضافة موديل جديد = ضع GLB داخل <span className="font-mono">public/models</span> ثم أضف سطر في
          <span className="font-mono"> models.json</span>.
        </div>
      </div>
    </div>
  );
}
