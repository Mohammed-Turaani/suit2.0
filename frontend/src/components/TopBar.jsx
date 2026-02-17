export default function TopBar({ title, subtitle }) {
  return (
    <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto max-w-[1500px] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs opacity-70 mt-0.5">{subtitle}</div>
        </div>
        <div className="text-xs opacity-60">ELZAY • Configurator</div>
      </div>
    </div>
  );
}
