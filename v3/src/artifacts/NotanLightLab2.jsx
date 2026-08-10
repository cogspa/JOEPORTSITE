import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { topicList } from "../content/week03Topics.js";
import TopicNav from "./TopicNav.jsx";

/*
  NOTAN LIGHT LAB
  ----------------------------------------------------------
  Interactive two-value (notan) light study on a raymarched
  SDF skull. Drag on the canvas to move the light around the
  form; toggle drag mode to rotate the skull instead.

  - 2-value / 3-value / silhouette modes
  - Light break (threshold) + dry edge (dither grain) controls
  - Six light presets matching classic study angles
  - PNG export

  Drop-in: no required props. three.js r128 compatible
  (fullscreen quad + ShaderMaterial, no OrbitControls).
  Design system: oxblood #8b3a2f / paper #f5efe1,
  IBM Plex Mono + Newsreader.
*/

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform vec3  uLight;      // world-space light direction (normalized)
uniform vec2  uRot;        // model yaw, pitch (radians)
uniform float uThreshold;  // where the light/shadow break falls (-1..1)
uniform float uMid;        // 3-value: half-width of the mid band
uniform float uGrain;      // dry-brush dither at the break
uniform float uMode;       // 0 = 2-value, 1 = 3-value, 2 = silhouette
uniform float uShape;      // 0 sphere, 1 cube, 2 cone, 3 skull
uniform float uInvert;     // 0/1 flip black-white
varying vec2 vUv;

// ---------- SDF primitives ----------
float sdEll(vec3 p, vec3 r){
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / max(k1, 1e-6);
}
float sdSph(vec3 p, float r){ return length(p) - r; }
float sdRB(vec3 p, vec3 b, float r){
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}
float smin(float a, float b, float k){
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float smax(float a, float b, float k){ return -smin(-a, -b, k); }

float sdCappedCone(vec3 p, float h, float r1, float r2){
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h);
  vec2 k2 = vec2(r2 - r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

// ---------- Subjects ----------
float skullSDF(vec3 p){
  vec3 q = vec3(abs(p.x), p.y, p.z);                                        // bilateral symmetry
  float d = sdEll(p - vec3(0.0, 0.42, -0.08), vec3(0.70, 0.72, 0.78));      // cranium
  d = smin(d, sdEll(p - vec3(0.0, 0.10, 0.40), vec3(0.50, 0.36, 0.40)), 0.14);   // face mass
  d = smin(d, sdEll(q - vec3(0.30, 0.22, 0.55), vec3(0.20, 0.09, 0.16)), 0.06);  // brow ridge
  d = smin(d, sdSph(q - vec3(0.44, -0.20, 0.36), 0.13), 0.10);                   // cheekbone
  d = smin(d, sdEll(p - vec3(0.0, -0.52, 0.40), vec3(0.28, 0.25, 0.26)), 0.10);  // maxilla
  d = smin(d, sdEll(p - vec3(0.0, -0.84, 0.28), vec3(0.27, 0.19, 0.24)), 0.09);  // mandible
  d = smax(d, -sdSph(q - vec3(1.05, 0.02, 0.25), 0.30), 0.14);                   // temple pinch
  d = smax(d, -sdSph(q - vec3(0.28, 0.00, 0.68), 0.22), 0.06);                   // eye sockets
  d = smax(d, -sdEll(p - vec3(0.0, -0.30, 0.76), vec3(0.09, 0.17, 0.22)), 0.05); // nasal cavity
  d = smax(d, -sdRB(p - vec3(0.0, -0.68, 0.58), vec3(0.23, 0.015, 0.10), 0.02), 0.03); // mouth gap
  return d;
}

float map(vec3 p){
  vec3 c = p - vec3(0.0, -0.05, 0.0);
  if (uShape < 0.5) return sdSph(c, 0.95);                       // sphere
  if (uShape < 1.5) return sdRB(c, vec3(0.70), 0.03);            // cube
  if (uShape < 2.5) return sdCappedCone(c, 0.95, 0.85, 0.02);    // cone
  return skullSDF(p);                                            // skull
}

vec3 calcNormal(vec3 p){
  const vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uRes.x / uRes.y;

  vec3 ro = vec3(0.0, -0.05, 3.4);
  vec3 rd = normalize(vec3(uv * 1.5, -3.4));

  // rotate ray into object space (skull rotation)
  mat3 Rinv = rotX(-uRot.y) * rotY(-uRot.x);
  ro = Rinv * ro;
  rd = Rinv * rd;
  vec3 L = normalize(Rinv * uLight);

  // raymarch
  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 100; i++){
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < 0.001){ hit = true; break; }
    t += d * 0.9;
    if (t > 8.0) break;
  }

  float PAPER = 1.0, INK = 0.0;
  if (uInvert > 0.5){ PAPER = 0.0; INK = 1.0; }
  float col = PAPER;

  if (hit){
    if (uMode > 1.5){
      col = INK;                                   // silhouette
    } else {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      float shade = dot(n, L);

      // dry-brush grain along the break
      float g = (hash(gl_FragCoord.xy * 0.7) - 0.5) * uGrain;
      shade += g;

      float w = fwidth(shade) * 1.2 + 0.002;       // AA width
      if (uMode < 0.5){
        // 2-value notan
        float m = smoothstep(uThreshold - w, uThreshold + w, shade);
        col = mix(INK, PAPER, m);
      } else {
        // 3-value: black / mid / white
        float lo = uThreshold - uMid;
        float hi = uThreshold + uMid;
        float m1 = smoothstep(lo - w, lo + w, shade);
        float m2 = smoothstep(hi - w, hi + w, shade);
        float MIDV = mix(0.55, 0.45, uInvert);
        col = mix(INK, MIDV, m1);
        col = mix(col, PAPER, m2);
      }
    }
  }

  gl_FragColor = vec4(vec3(col), 1.0);
}
`;

const VERT = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// ---- shaders for uploaded glTF meshes (rasterized path) ----
const MESH_VERT = `
varying vec3 vN;
varying vec3 vV;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const MESH_FRAG = `
precision highp float;
uniform vec3  uLight;
uniform float uThreshold;
uniform float uMid;
uniform float uGrain;
uniform float uMode;
uniform float uInvert;
varying vec3 vN;
varying vec3 vV;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(){
  float PAPER = 1.0, INK = 0.0;
  if (uInvert > 0.5){ PAPER = 0.0; INK = 1.0; }
  float col;

  if (uMode > 1.5){
    col = INK;                                    // silhouette
  } else {
    vec3 N = normalize(vN);
    if (dot(N, vV) < 0.0) N = -N;                 // handle flipped/double-sided normals
    float shade = dot(N, normalize(uLight));
    shade += (hash(gl_FragCoord.xy * 0.7) - 0.5) * uGrain;
    float w = fwidth(shade) * 1.2 + 0.002;
    if (uMode < 0.5){
      col = mix(INK, PAPER, smoothstep(uThreshold - w, uThreshold + w, shade));
    } else {
      float lo = uThreshold - uMid;
      float hi = uThreshold + uMid;
      float m1 = smoothstep(lo - w, lo + w, shade);
      float m2 = smoothstep(hi - w, hi + w, shade);
      float MIDV = mix(0.55, 0.45, uInvert);
      col = mix(INK, MIDV, m1);
      col = mix(col, PAPER, m2);
    }
  }
  gl_FragColor = vec4(vec3(col), 1.0);
}
`;

// light presets: [azimuth°, elevation°] — azimuth 0 = camera front, + = viewer's right
const PRESETS = [
  { id: "01", label: "KEY L", az: -40, el: 25 },
  { id: "02", label: "TOP", az: 0, el: 75 },
  { id: "03", label: "SIDE R", az: 85, el: 10 },
  { id: "04", label: "UNDER", az: 10, el: -50 },
  { id: "05", label: "3/4 BACK", az: 135, el: 30 },
  { id: "06", label: "RIM", az: 175, el: 8 },
];

const azElToVec = (azDeg, elDeg) => {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  return [
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  ];
};

const C = {
  ox: "#8b3a2f",
  paper: "#f5efe1",
  ink: "#1c1712",
  line: "#d9cfba",
  dim: "#8a7f6a",
};

export default function NotanLightLab() {
  const mountRef = useRef(null);
  const stateRef = useRef({
    az: -40, el: 25, yaw: 0, pitch: 0,
    dragging: false, lastX: 0, lastY: 0, shift: false,
  });
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const meshSceneRef = useRef(null);
  const meshCameraRef = useRef(null);
  const meshGroupRef = useRef(null);
  const shapeRef = useRef(3);
  const invertRef = useRef(false);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState(0);          // 0 two-value, 1 three-value, 2 silhouette
  const [shape, setShape] = useState(3);        // 0 sphere, 1 cube, 2 cone, 3 skull
  const [threshold, setThreshold] = useState(0.15);
  const [mid, setMid] = useState(0.18);
  const [grain, setGrain] = useState(0.06);
  const [invert, setInvert] = useState(false);
  const [dragMode, setDragMode] = useState("rotate"); // "rotate" | "light"
  const [readout, setReadout] = useState({ az: -40, el: 25 });
  const [activePreset, setActivePreset] = useState("01");
  const [modelStatus, setModelStatus] = useState(null); // uploaded model name / status

  // --- three.js setup ---
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      preserveDrawingBuffer: true, // for PNG export
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // rasterized scene for uploaded glTF models
    // fov matches the raymarch frustum: 2*atan(1.5/3.4) ≈ 48°
    const meshScene = new THREE.Scene();
    const meshCamera = new THREE.PerspectiveCamera(48, 1, 0.1, 50);
    meshCamera.position.set(0, -0.05, 3.4);
    meshCamera.lookAt(0, -0.05, 0);
    const meshGroup = new THREE.Group();
    meshGroup.rotation.order = "YXZ";
    meshScene.add(meshGroup);
    meshSceneRef.current = meshScene;
    meshCameraRef.current = meshCamera;
    meshGroupRef.current = meshGroup;

    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uLight: { value: new THREE.Vector3(...azElToVec(-40, 25)) },
      uRot: { value: new THREE.Vector2(0, 0) },
      uThreshold: { value: 0.15 },
      uMid: { value: 0.18 },
      uGrain: { value: 0.06 },
      uMode: { value: 0 },
      uShape: { value: 3 },
      uInvert: { value: 0 },
    };
    uniformsRef.current = uniforms;

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    mat.extensions = { derivatives: true };

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.max(320, Math.min(w * 0.9, 560));
      renderer.setSize(w, h);
      uniforms.uRes.value.set(
        w * renderer.getPixelRatio(),
        h * renderer.getPixelRatio()
      );
      meshCamera.aspect = w / h;
      meshCamera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf;
    const loop = () => {
      const s = stateRef.current;
      const useMesh = shapeRef.current === 4 && meshGroup.children.length > 0;
      if (useMesh) {
        meshGroup.rotation.y = s.yaw;
        meshGroup.rotation.x = s.pitch;
        renderer.setClearColor(invertRef.current ? 0x000000 : 0xffffff, 1);
        renderer.render(meshScene, meshCamera);
      } else {
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      mat.dispose();
      quad.geometry.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  // --- push state to uniforms ---
  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    u.uMode.value = mode;
    u.uShape.value = shape;
    u.uThreshold.value = threshold;
    u.uMid.value = mid;
    u.uGrain.value = grain;
    u.uInvert.value = invert ? 1 : 0;
    shapeRef.current = shape;
    invertRef.current = invert;
  }, [mode, shape, threshold, mid, grain, invert]);

  // --- glTF upload ---
  const loadGLTF = (file) => {
    setModelStatus("LOADING…");
    const reader = new FileReader();
    const isGltfJson = /\.gltf$/i.test(file.name);
    reader.onload = () => {
      try {
        const loader = new GLTFLoader();
        loader.parse(
          reader.result, "",
          (gltf) => {
            const group = meshGroupRef.current;
            const u = uniformsRef.current;
            if (!group || !u) return;

            // clear previous model
            while (group.children.length) {
              const c = group.children[0];
              group.remove(c);
              c.traverse?.((n) => {
                n.geometry?.dispose?.();
                n.material?.dispose?.();
              });
            }

            // shared-uniform notan material (live-linked to the controls)
            const notanMat = new THREE.ShaderMaterial({
              vertexShader: MESH_VERT,
              fragmentShader: MESH_FRAG,
              uniforms: {
                uLight: u.uLight,
                uThreshold: u.uThreshold,
                uMid: u.uMid,
                uGrain: u.uGrain,
                uMode: u.uMode,
                uInvert: u.uInvert,
              },
              side: THREE.DoubleSide,
            });
            notanMat.extensions = { derivatives: true };

            const obj = gltf.scene;
            obj.traverse((n) => {
              if (n.isMesh) {
                n.material = notanMat;
                n.geometry.computeVertexNormals?.();
              }
            });

            // normalize: center at origin, fit to ~1.9 units
            const box = new THREE.Box3().setFromObject(obj);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const s = 1.9 / Math.max(size.x, size.y, size.z, 1e-6);
            obj.scale.setScalar(s);
            obj.position.set(-center.x * s, -center.y * s - 0.05, -center.z * s);

            group.add(obj);
            setModelStatus(file.name.toUpperCase());
            setShape(4);
          },
          (err) => {
            console.error("glTF parse error:", err);
            setModelStatus("PARSE FAILED — USE .GLB");
          }
        );
      } catch (err) {
        console.error(err);
        setModelStatus("LOAD FAILED");
      }
    };
    if (isGltfJson) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const applyLight = useCallback((az, el) => {
    const s = stateRef.current;
    s.az = az;
    s.el = Math.max(-88, Math.min(88, el));
    const u = uniformsRef.current;
    if (u) u.uLight.value.set(...azElToVec(s.az, s.el));
    setReadout({ az: Math.round(s.az), el: Math.round(s.el) });
  }, []);

  // --- pointer interaction ---
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const cvs = () => rendererRef.current?.domElement;

    const down = (e) => {
      const s = stateRef.current;
      s.dragging = true;
      s.shift = e.shiftKey;
      s.lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      s.lastY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      setActivePreset(null);
    };
    const move = (e) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? s.lastX;
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? s.lastY;
      const dx = x - s.lastX;
      const dy = y - s.lastY;
      s.lastX = x;
      s.lastY = y;

      const movingLight = dragMode === "light" || s.shift;
      if (!movingLight) {
        s.yaw += dx * 0.008;
        s.pitch = Math.max(-1.2, Math.min(1.2, s.pitch + dy * 0.008));
        uniformsRef.current?.uRot.value.set(s.yaw, s.pitch);
      } else {
        applyLight(s.az + dx * 0.5, s.el - dy * 0.5);
      }
      if (e.cancelable) e.preventDefault();
    };
    const up = () => { stateRef.current.dragging = false; };

    const el = cvs();
    if (!el) return;
    el.style.cursor = "crosshair";
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragMode, applyLight]);

  const exportPNG = () => {
    const cvs = rendererRef.current?.domElement;
    if (!cvs) return;
    const a = document.createElement("a");
    a.download = `notan_study_az${readout.az}_el${readout.el}.png`;
    a.href = cvs.toDataURL("image/png");
    a.click();
  };

  const btn = (active) => ({
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.08em",
    padding: "6px 10px",
    background: active ? C.ox : "transparent",
    color: active ? C.paper : C.ink,
    border: `1px solid ${active ? C.ox : C.line}`,
    cursor: "pointer",
    transition: "all 120ms",
  });

  const sliderRow = (label, value, set, min, max, step, fmt) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", color: C.dim, width: 92, flexShrink: 0,
      }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: C.ox, height: 4 }}
      />
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
        color: C.ink, width: 44, textAlign: "right", flexShrink: 0,
      }}>{fmt(value)}</span>
    </div>
  );

  return (
    <div style={{
      background: C.paper, color: C.ink, maxWidth: 720,
      margin: "0 auto", border: `1px solid ${C.line}`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap');
      `}</style>

      {/* header */}
      <div style={{
        padding: "18px 22px 14px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.22em", color: C.ox, marginBottom: 4,
          }}>VALUE STUDY · INSTRUMENT</div>
          <div style={{
            fontFamily: "'Newsreader', serif", fontSize: 26,
            fontWeight: 600, lineHeight: 1.1,
          }}>Notan Light Lab</div>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: C.dim, letterSpacing: "0.06em", textAlign: "right",
        }}>
          AZ {readout.az}° · EL {readout.el}°
        </div>
      </div>

      {/* canvas */}
      <div ref={mountRef} style={{ width: "100%", lineHeight: 0 }} />

      {/* drag hint */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
        color: C.dim, letterSpacing: "0.06em",
        padding: "8px 22px", borderTop: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <span>
          DRAG → {dragMode === "rotate" ? "ROTATE SKULL" : "MOVE LIGHT"}
          {dragMode === "rotate" ? " · SHIFT-DRAG → MOVE LIGHT" : ""}
        </span>
        <span style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setDragMode(dragMode === "rotate" ? "light" : "rotate")}
            style={{ ...btn(false), padding: "2px 8px", fontSize: 10 }}
          >
            DRAG: {dragMode === "rotate" ? "LIGHT" : "ROTATE"}
          </button>
          <button
            onClick={() => {
              const s = stateRef.current;
              s.yaw = 0; s.pitch = 0;
              uniformsRef.current?.uRot.value.set(0, 0);
            }}
            style={{ ...btn(false), padding: "2px 8px", fontSize: 10 }}
          >
            RESET VIEW
          </button>
        </span>
      </div>

      {/* controls */}
      <div style={{ padding: "16px 22px 20px", display: "grid", gap: 14 }}>

        {/* subject */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {[["SPHERE", 0], ["CUBE", 1], ["CONE", 2], ["SKULL", 3]].map(([l, s]) => (
            <button key={s} onClick={() => setShape(s)} style={btn(shape === s)}>{l}</button>
          ))}
          {modelStatus && !modelStatus.includes("FAILED") && !modelStatus.includes("LOADING") && (
            <button onClick={() => setShape(4)} style={btn(shape === 4)}>MODEL</button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadGLTF(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ ...btn(false), marginLeft: "auto", borderStyle: "dashed" }}
          >
            ↑ UPLOAD GLB
          </button>
        </div>
        {modelStatus && (
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: "0.08em",
            color: modelStatus.includes("FAILED") ? C.ox : C.dim,
            marginTop: -8,
          }}>
            {modelStatus.includes("FAILED") || modelStatus.includes("LOADING")
              ? modelStatus
              : `LOADED: ${modelStatus}`}
          </div>
        )}

        {/* presets */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => { applyLight(p.az, p.el); setActivePreset(p.id); }}
              style={btn(activePreset === p.id)}
              title={`azimuth ${p.az}°, elevation ${p.el}°`}
            >
              {p.id} {p.label}
            </button>
          ))}
        </div>

        {/* mode row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["2-VALUE", 0], ["3-VALUE", 1], ["SILHOUETTE", 2]].map(([l, m]) => (
            <button key={m} onClick={() => setMode(m)} style={btn(mode === m)}>{l}</button>
          ))}
          <button onClick={() => setInvert(!invert)} style={btn(invert)}>INVERT</button>
          <button onClick={exportPNG} style={{ ...btn(false), marginLeft: "auto" }}>
            EXPORT PNG
          </button>
        </div>

        {/* manual light position */}
        <div style={{ display: "grid", gap: 10 }}>
          {sliderRow("LIGHT AZ", readout.az,
            (v) => { applyLight(v, stateRef.current.el); setActivePreset(null); },
            -180, 180, 1, (v) => `${Math.round(v)}°`)}
          {sliderRow("LIGHT EL", readout.el,
            (v) => { applyLight(stateRef.current.az, v); setActivePreset(null); },
            -88, 88, 1, (v) => `${Math.round(v)}°`)}
        </div>

        {/* sliders */}
        {mode !== 2 && (
          <div style={{ display: "grid", gap: 10 }}>
            {sliderRow("LIGHT BREAK", threshold, setThreshold, -0.6, 0.8, 0.01,
              (v) => v.toFixed(2))}
            {mode === 1 && sliderRow("MID BAND", mid, setMid, 0.02, 0.5, 0.01,
              (v) => v.toFixed(2))}
            {sliderRow("DRY EDGE", grain, setGrain, 0, 0.35, 0.01,
              (v) => v.toFixed(2))}
          </div>
        )}

        {/* footnote */}
        <div style={{
          fontFamily: "'Newsreader', serif", fontStyle: "italic",
          fontSize: 13.5, color: C.dim, lineHeight: 1.5,
          borderTop: `1px solid ${C.line}`, paddingTop: 12,
        }}>
          Notan reduces form to the boundary between light and shadow.
          Move the light and watch the shapes it carves — the drawing is
          in the break, not the rendering.
        </div>
        <TopicNav topicList={topicList} topicKey="notan-light-lab" weekNum="03" />
      </div>
    </div>
  );
}
