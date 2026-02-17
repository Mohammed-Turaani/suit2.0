import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Bounds, Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// تحميل texture اختياري بدون كسر
async function loadOptionalTexture(url, repeat = 3, isColor = false) {
  if (!url || typeof url !== "string") return null;
  const loader = new THREE.TextureLoader();
  const tex = await loader.loadAsync(url);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 16;
  if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function hardApplyFabric(root, { colorMap, normalMap, roughMap, repeat = 3 }) {
  if (!root || !colorMap) return;

  // colorMap setup
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(repeat, repeat);
  colorMap.anisotropy = 16;
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.needsUpdate = true;

  if (normalMap) {
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(repeat, repeat);
    normalMap.anisotropy = 16;
    normalMap.needsUpdate = true;
  }
  if (roughMap) {
    roughMap.wrapS = roughMap.wrapT = THREE.RepeatWrapping;
    roughMap.repeat.set(repeat, repeat);
    roughMap.anisotropy = 16;
    roughMap.needsUpdate = true;
  }

  root.traverse((obj) => {
    if (!obj.isMesh) return;

    obj.castShadow = true;
    obj.receiveShadow = true;

    // dispose old material (اختياري لكن مفيد)
    if (obj.material && obj.material.dispose) obj.material.dispose();

    // ✅ قماش غير لامع
    const mat = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap || null,
      roughnessMap: roughMap || null,
      metalness: 0.0,
      roughness: 0.92,
      envMapIntensity: 0.08, // قليل جداً عشان ما يلمع
    });

    // تنظيف أي خرائط غريبة من GLB
    mat.aoMap = null;
    mat.lightMap = null;
    mat.emissiveMap = null;
    mat.metalnessMap = null;
    mat.bumpMap = null;
    mat.alphaMap = null;
    mat.displacementMap = null;

    mat.side = THREE.DoubleSide;
    mat.needsUpdate = true;

    obj.material = mat;
  });
}

function Garment({ url, fabric }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const [maps, setMaps] = useState({ color: null, normal: null, rough: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!fabric?.color) {
          setMaps({ color: null, normal: null, rough: null });
          return;
        }
        const repeat = fabric?.repeat ?? 3;

        const color = await loadOptionalTexture(fabric.color, repeat, true);
        const normal = await loadOptionalTexture(fabric.normal, repeat, false);
        const rough = await loadOptionalTexture(fabric.roughness, repeat, false);

        if (cancelled) return;
        setMaps({ color, normal, rough });
      } catch (e) {
        console.error("Texture load failed:", e);
        if (!cancelled) setMaps({ color: null, normal: null, rough: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fabric?.color, fabric?.normal, fabric?.roughness, fabric?.repeat]);

  useEffect(() => {
    if (!maps.color) return;
    hardApplyFabric(scene, {
      colorMap: maps.color,
      normalMap: maps.normal,
      roughMap: maps.rough,
      repeat: fabric?.repeat ?? 3,
    });
  }, [scene, maps.color, maps.normal, maps.rough, fabric?.repeat]);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

export default function Scene3D({ modelUrl, fabric }) {
  if (!modelUrl) {
    return (
      <div className="flex h-[720px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm opacity-70">
        اختر موديل أولاً
      </div>
    );
  }

  return (
    <div className="h-[720px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Canvas
        shadows
        camera={{ position: [0, 1.45, 3.2], fov: 38 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={["#f4f6fb"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 7, 4]} intensity={1.0} castShadow />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Bounds fit clip observe margin={1.25}>
            <Garment url={modelUrl} fabric={fabric} />
          </Bounds>
          <ContactShadows opacity={0.35} blur={2.8} scale={12} far={12} />
        </Suspense>

        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}
