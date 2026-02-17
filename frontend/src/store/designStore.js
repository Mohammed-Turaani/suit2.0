import { create } from "zustand";

const STORAGE_KEY = "suit_config_design_v2";

const defaultDesign = {
  mannequin: "human", // human | male01 | female01 ...

  // auto-rotate the view (nice for presenting the design)
  autoRotate: false,


  // body controls (works الآن حتى لو ما في morphTargets)
  body: {
    height: 1.0, // 0.85 .. 1.15
    weight: 1.0, // 0.80 .. 1.25 (scale XZ)
    shoulders: 1.0, // 0.85 .. 1.25
  },

  // camera/view controls (for UI buttons + keyboard)
  view: {
    yaw: 0.0,      // left/right
    pitch: 0.20,   // up/down
    distance: 3.2, // zoom
    targetY: 0.6,  // look-at height
  },


  // parts enabled (choose one piece or full outfit)
  enabled: {
    jacket: true,
    pants: true,
    shirt: true,
    vest: false,
    tie: false,
  },

  activePart: "jacket", // jacket | pants | shirt | vest | tie
  fabricByPart: {
  jacket: { id: "weave_navy", name: "Navy", color: "#223a5e", pattern: "twill", density: 16, repeat: 2, roughness: 0.92 },
  pants:  { id: "weave_charcoal", name: "Charcoal", color: "#2b2b2b", pattern: "twill", density: 16, repeat: 2, roughness: 0.92 },
  shirt:  { id: "weave_white", name: "White", color: "#f4f6f8", pattern: "weave", density: 18, repeat: 2, roughness: 0.95 },
  vest:   { id: "weave_gray", name: "Gray", color: "#6b7280", pattern: "weave", density: 18, repeat: 2, roughness: 0.93 },
  tie:    { id: "weave_wine", name: "Wine", color: "#5a1f2b", pattern: "pinstripe", density: 22, repeat: 3, roughness: 0.78 },
},
};


function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

export const useDesignStore = create((set, get) => ({
  design: (() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY) || "");
    return saved?.design ? saved.design : defaultDesign;
  })(),

  setActivePart: (part) =>
    set((s) => ({ design: { ...s.design, activePart: part } })),

  setEnabled: (part, on) =>
    set((s) => ({
      design: { ...s.design, enabled: { ...s.design.enabled, [part]: !!on } },
    })),

  setBody: (patch) =>
    set((s) => ({
      design: { ...s.design, body: { ...s.design.body, ...patch } },
    })),

  setMannequin: (mannequin) =>
    set((s) => ({
      design: { ...s.design, mannequin: String(mannequin || "human") },
    })),

  // generic patch helper
  setDesign: (patch) =>
    set((s) => ({ design: { ...s.design, ...(patch || {}) } })),

  setFabricForPart: (part, fabric) =>
    set((s) => ({
      design: {
        ...s.design,
        fabricByPart: { ...s.design.fabricByPart, [part]: fabric },
      },
    })),

  save: () => {
    const payload = { design: get().design, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  },

  reset: () => set({ design: defaultDesign }),


// ---- View controls ----
setView: (patch) =>
  set((s) => ({
    design: { ...s.design, view: { ...s.design.view, ...patch } },
  })),

nudgeView: ({ dyaw = 0, dpitch = 0, ddist = 0 } = {}) =>
  set((s) => {
    const v = s.design.view || { yaw: 0, pitch: 0.15, distance: 2.7, targetY: 0.8 };
    const yaw = v.yaw + dyaw;
    const pitch = Math.max(-0.2, Math.min(1.2, v.pitch + dpitch));
    const distance = Math.max(1.2, Math.min(6.5, v.distance + ddist));
    return { design: { ...s.design, view: { ...v, yaw, pitch, distance } } };
  }),

resetView: () =>
  set((s) => ({
    design: {
      ...s.design,
      view: { yaw: 0.0, pitch: 0.20, distance: 3.2, targetY: 0.6 },
    },
  })),

  exportJSON: () => {
    const payload = { design: get().design, exportedAt: new Date().toISOString() };
    return JSON.stringify(payload, null, 2);
  },

  importJSON: (text) => {
    const data = safeParse(text);
    if (!data?.design?.fabricByPart) return false;
    set({ design: data.design });
    return true;
  },
}));
