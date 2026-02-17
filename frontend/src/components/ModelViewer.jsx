// frontend/src/components/ModelViewer.jsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  Environment,
  ContactShadows,
  Bounds,
  useBounds,
} from "@react-three/drei";
import * as THREE from "three";
import { useDesignStore } from "../store/designStore.js";

// -------------------- Helpers --------------------
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function makeWhiteDataTexture() {
  const data = new Uint8Array([255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

async function loadOptionalTexture(url, repeat = 3, isColor = false) {
  if (!url || typeof url !== "string") return null;

  const loader = new THREE.TextureLoader();
  const tex = await loader.loadAsync(url);

  tex.flipY = false;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 16;

  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ✅ توسيط + توحيد حجم أي موديل (حتى لو كان كبير/صغير/مائل)
function normalizeModel(root, { targetHeight = 1.7 } = {}) {
  if (!root) return;

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // إذا موديل فاضي أو حجمه صفر
  const h = size.y || 1;

  // ✅ نقل الموديل ليصير مركزه عند (0,0,0)
  root.position.sub(center);

  // ✅ ضبط الموديل بحيث ارتفاعه ثابت تقريباً (كل الموديلات تظهر نفس الحجم)
  const s = targetHeight / h;
  root.scale.setScalar(s);

  // بعد تغيير scale لازم نعيد حساب box لتحسين وضعه على الأرض (اختياري)
  const box2 = new THREE.Box3().setFromObject(root);
const min = box2.min;

  // ✅ ارفع الموديل بحيث يلامس الأرض (Y=0)
  root.position.y -= min.y;
}

/**
 * ✅ تطبيق القماش “إجباري” على كل Mesh عنده UV
 * (بدون استثناء أزرار/معدن/قطع صغيرة)
 */
function applyFabricForced(root, opts) {
  const {
    colorMap,
    normalMap,
    roughMap,
    repeat = 3,
    tint = "#ffffff",
    baseRoughness = 0.9,
    env = 0.15,
  } = opts || {};

  if (!root || !colorMap) return;

  // إعداد الخرائط
  colorMap.flipY = false;
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(repeat, repeat);
  colorMap.anisotropy = 16;
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.needsUpdate = true;

  if (normalMap) {
    normalMap.flipY = false;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(repeat, repeat);
    normalMap.colorSpace = THREE.NoColorSpace;
    normalMap.needsUpdate = true;
  }

  if (roughMap) {
    roughMap.flipY = false;
    roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping;
    roughMap.repeat.set(repeat, repeat);
    roughMap.colorSpace = THREE.NoColorSpace;
    roughMap.needsUpdate = true;
  }

  const tintColor = new THREE.Color(tint);

  root.traverse((obj) => {
    if (!obj?.isMesh) return;

    obj.castShadow = true;
    obj.receiveShadow = true;

    const hasUV = !!obj.geometry?.attributes?.uv;
    if (!hasUV) return;

    // ✅ مادة واحدة موحدة للجميع = القماش يطبق إجباري
    const mat = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap || null,
      roughnessMap: roughMap || null,
      color: tintColor,
      metalness: 0.0,
      roughness: baseRoughness,
      envMapIntensity: env,
      side: THREE.DoubleSide,
    });

    if (mat.normalMap) mat.normalScale = new THREE.Vector2(0.6, 0.6);

    mat.needsUpdate = true;
    obj.material = mat;
  });
}

// -------------------- AutoFit --------------------
function AutoFit({ watchKey }) {
  const bounds = useBounds();
  const resetView = useDesignStore((s) => s.resetView);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        bounds.refresh().fit();
        resetView();
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [bounds, watchKey, resetView]);

  return null;
}

// -------------------- Model --------------------
function Garment({ url, fabric, groupRef, enabled }) {
  // fallback ثابت لتجنب مشاكل hooks
  const gltf = useGLTF(url || "/models/suit.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // texture color (لازم دائماً)
  const whiteFallback = useMemo(() => makeWhiteDataTexture(), []);
  const colorUrl = fabric?.color || null;
  const loadedColor = useTexture(colorUrl || "/__never__missing__.png");
  const colorMap = fabric?.color ? loadedColor : whiteFallback;

  const [optMaps, setOptMaps] = useState({ normal: null, rough: null });

  // ✅ Normalize الموديل عند تغيير الـ URL
  useEffect(() => {
    if (!scene) return;
    normalizeModel(scene, { targetHeight: 1.75 });
  }, [scene, url]);

  // تحميل normal/rough اختياري
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fabric?.color) {
        if (!cancelled) setOptMaps({ normal: null, rough: null });
        return;
      }
      const repeat = fabric?.repeat ?? 3;
      const normal = await loadOptionalTexture(fabric?.normal, repeat, false);
      const rough = await loadOptionalTexture(fabric?.roughness, repeat, false);
      if (!cancelled) setOptMaps({ normal, rough });
    })();
    return () => {
      cancelled = true;
    };
  }, [fabric?.color, fabric?.normal, fabric?.roughness, fabric?.repeat]);

  // ✅ تطبيق القماش إجباري
  useEffect(() => {
    if (!enabled) return;

    applyFabricForced(scene, {
      colorMap,
      normalMap: optMaps.normal,
      roughMap: optMaps.rough,
      repeat: fabric?.repeat ?? 3,
      tint: fabric?.tint ?? "#ffffff",
      baseRoughness: fabric?.baseRoughness ?? 0.9,
      env: fabric?.env ?? 0.15,
    });
  }, [enabled, scene, fabric, colorMap, optMaps.normal, optMaps.rough]);

  return (
    <group ref={groupRef} visible={!!enabled}>
      <primitive object={scene} />
    </group>
  );
}

// -------------------- Camera Rig --------------------
function ProCameraRig({ controlsRef, enabled }) {
  const view = useDesignStore((s) => s.design.view);
  const autoRotate = useDesignStore((s) => s.design.autoRotate);

  useFrame((state, dt) => {
    if (!enabled) return;
    const c = controlsRef.current;
    if (!c) return;

    const v = view || { yaw: 0, pitch: 0.2, distance: 3.0, targetY: 0.95 };
    let yaw = v.yaw ?? 0;
    const pitch = clamp(v.pitch ?? 0.2, -1.2, 1.2);
    const dist = clamp(v.distance ?? 3.0, 1.2, 10.0);

    if (autoRotate) yaw += dt * 0.45;

    const targetY = Number.isFinite(v.targetY) ? v.targetY : 0.95;
    const target = new THREE.Vector3(0, targetY, 0);

    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const x = Math.sin(yaw) * cp * dist;
    const y = sp * dist;
    const z = Math.cos(yaw) * cp * dist;

    state.camera.position.lerp(new THREE.Vector3(x, y, z).add(target), 0.22);
    c.target.lerp(target, 0.22);
    c.update();
  });

  return null;
}

// -------------------- Main --------------------
export default function ModelViewer({ modelUrl, fabric }) {
  const body = useDesignStore((s) => s.design.body);
  const groupRef = useRef();
  const controlsRef = useRef();

  const isReady = !!(modelUrl && fabric?.color);

  // ✅ سلايدر الجسم (scale على الجروب)
  useEffect(() => {
    if (!groupRef.current) return;
    const h = Number(body?.height ?? 1);
    const w = Number(body?.weight ?? 1);
    const sh = Number(body?.shoulders ?? 1);
    groupRef.current.scale.set(w * sh, h, w);
  }, [body?.height, body?.weight, body?.shoulders]);

  const watchKey = `${modelUrl || "none"}__${fabric?.id || fabric?.name || "none"}`;

  return (
    <div className="relative w-full h-full">
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm opacity-70">
          اختر موديل + قماش أولاً...
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 1.4, 3.0], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={["#f4f6fb"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 7, 4]} intensity={0.9} castShadow />

        <Suspense fallback={null}>
          <Environment preset="studio" />

          <Bounds fit clip observe margin={1.9}>
            <AutoFit watchKey={watchKey} />
            <Garment url={modelUrl} fabric={fabric} groupRef={groupRef} enabled={isReady} />
          </Bounds>

          <ContactShadows opacity={0.28} blur={2.8} scale={12} far={12} />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
        />

        <ProCameraRig controlsRef={controlsRef} enabled={isReady} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/suit.glb");
