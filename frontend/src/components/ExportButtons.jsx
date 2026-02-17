import { useRef } from "react";
import { toPng } from "html-to-image";
import { useDesignStore } from "../store/designStore.js";

export default function ExportButtons({ previewRef, canvasEl }) {
  const fileRef = useRef(null);

  const save = useDesignStore((s) => s.save);
  const reset = useDesignStore((s) => s.reset);
  const exportJSON = useDesignStore((s) => s.exportJSON);
  const importJSON = useDesignStore((s) => s.importJSON);

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPNG() {
    if (canvasEl) {
      const url = canvasEl.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "design-3d.png";
      a.click();
      return;
    }
    if (!previewRef?.current) return;
    const dataUrl = await toPng(previewRef.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "design.png";
    a.click();
  }

  function onImportClick() {
    fileRef.current?.click();
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    const ok = importJSON(text);
    if (!ok) alert("JSON غير صالح");
    e.target.value = "";
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => {
          save();
          alert("تم الحفظ ✅");
        }}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-95"
      >
        حفظ
      </button>

      <button
        onClick={exportPNG}
        className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-soft ring-1 ring-black/5 hover:bg-white"
      >
        Export PNG
      </button>

      <button
        onClick={() => downloadText("design.json", exportJSON())}
        className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-soft ring-1 ring-black/5 hover:bg-white"
      >
        Export JSON
      </button>

      <button
        onClick={onImportClick}
        className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-soft ring-1 ring-black/5 hover:bg-white"
      >
        Import JSON
      </button>

      <button
        onClick={() => {
          reset();
          alert("تمت الإعادة للوضع الافتراضي");
        }}
        className="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 shadow-soft ring-1 ring-black/5 hover:bg-white"
      >
        Reset
      </button>

      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
    </div>
  );
}
