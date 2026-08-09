/* ============================================================
   ChromeGooMirror.jsx — single-file LIVE artifact

   This is the running tool, not a description of it. Everything
   from the multi-file repo (gooEngine.js + tracking.js + App.jsx)
   is inlined here so the artifact loader only needs one .jsx.

   MediaPipe is pulled from the jsDelivr ESM CDN at runtime, so
   the host site needs no new npm dependency. If the models fail
   to load, the toy keeps running on frame-difference wake +
   pointer splats instead of dying.
   ============================================================ */

import React, { useRef, useEffect, useState, useCallback } from "react";

/* ---------------------------------------------------------- */
/* WebGL engine                                               */
/* ---------------------------------------------------------- */

const MAX_POINTS = 64;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const SIM_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uRipple;
uniform sampler2D uCur;
uniform sampler2D uPrev;
uniform vec2  uTexel;
uniform float uWater;
uniform float uDamp;
uniform float uWake;
uniform float uMirror;
uniform vec2  uFit;
uniform float uAspect;
uniform vec3  uPts[${MAX_POINTS}];
uniform int   uNum;

vec2 vidUV(vec2 p){
  p.x = mix(p.x, 1.0 - p.x, uMirror);
  return (p - 0.5) * uFit + 0.5;
}
float hgt(vec2 p){ return texture2D(uRipple, p).r - 0.5; }

void main(){
  vec4 s = texture2D(uRipple, vUv);
  float c = s.r - 0.5;
  float p = s.g - 0.5;

  float sum = hgt(vUv + vec2(uTexel.x, 0.0))
            + hgt(vUv - vec2(uTexel.x, 0.0))
            + hgt(vUv + vec2(0.0, uTexel.y))
            + hgt(vUv - vec2(0.0, uTexel.y));

  float next = sum * 0.5 - p;
  next *= uDamp;

  if (vUv.y < uWater){
    for (int i = 0; i < ${MAX_POINTS}; i++){
      if (i >= uNum) break;
      vec2 d = vUv - uPts[i].xy;
      d.x *= uAspect;
      float g = exp(-dot(d, d) / 0.0011);
      next += uPts[i].z * g;
    }

    if (uWake > 0.001){
      vec2 rc = vec2(vUv.x, 2.0 * uWater - vUv.y);
      if (rc.y <= 1.0){
        vec2 tv = vidUV(rc);
        vec3 a = texture2D(uCur,  tv).rgb;
        vec3 b = texture2D(uPrev, tv).rgb;
        float m = max(0.0, length(a - b) - 0.10);
        float fade = 1.0 - 0.5 * smoothstep(0.0, uWater, uWater - vUv.y);
        next += m * uWake * fade;
      }
      float band = smoothstep(0.06, 0.0, uWater - vUv.y);
      if (band > 0.001){
        vec2 tv2 = vidUV(vec2(vUv.x, uWater + 0.025));
        float m2 = max(0.0, length(texture2D(uCur, tv2).rgb - texture2D(uPrev, tv2).rgb) - 0.10);
        next += m2 * uWake * band * 1.6;
      }
    }
  }

  next = clamp(next, -0.49, 0.49);
  gl_FragColor = vec4(next + 0.5, c + 0.5, 0.0, 1.0);
}`;

const COMP_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uRipple;
uniform sampler2D uVideo;
uniform vec2  uSimTexel;
uniform float uWater;
uniform float uMirror;
uniform float uDistort;
uniform float uSpec;
uniform float uTime;
uniform vec2  uFit;
uniform float uReflect;
uniform float uTransparency;

vec2 vidUV(vec2 p){
  p.x = mix(p.x, 1.0 - p.x, uMirror);
  return (p - 0.5) * uFit + 0.5;
}
float H(vec2 p){ return texture2D(uRipple, p).r - 0.5; }

void main(){
  float lineH = H(vec2(vUv.x, max(uWater - 2.0 * uSimTexel.y, 0.0)));
  float wLine = uWater + lineH * 0.05;

  if (vUv.y > wLine){
    vec3 col = texture2D(uVideo, vidUV(vUv)).rgb;
    col = pow(col, vec3(1.06));
    float sh = smoothstep(0.06, 0.0, vUv.y - wLine);
    col *= 1.0 - 0.38 * sh;
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  float nx = H(vUv + vec2(uSimTexel.x, 0.0)) - H(vUv - vec2(uSimTexel.x, 0.0));
  float ny = H(vUv + vec2(0.0, uSimTexel.y)) - H(vUv - vec2(0.0, uSimTexel.y));
  float h  = H(vUv);
  vec3 n = normalize(vec3(-nx * 30.0, -ny * 30.0, 1.0));

  // Reflection (from mirrored vertical offset)
  vec2 rc   = vec2(vUv.x, 2.0 * wLine - vUv.y);
  vec2 baseRefl = rc + n.xy * uDistort;
  float rr = texture2D(uVideo, vidUV(baseRefl + n.xy * 0.007)).r;
  float gg = texture2D(uVideo, vidUV(baseRefl)).g;
  float bb = texture2D(uVideo, vidUV(baseRefl - n.xy * 0.007)).b;
  vec3 refl = vec3(rr, gg, bb);

  // Refraction (submerged directly under waterline)
  vec2 baseRefr = vUv + n.xy * uDistort * 0.7;
  float rRefr = texture2D(uVideo, vidUV(baseRefr + n.xy * 0.007)).r;
  float gRefr = texture2D(uVideo, vidUV(baseRefr)).g;
  float bRefr = texture2D(uVideo, vidUV(baseRefr - n.xy * 0.007)).b;
  vec3 refr = vec3(rRefr, gRefr, bRefr);

  // Z-depth absorption (fading into the tub)
  float depth = clamp((wLine - vUv.y) / max(wLine, 0.001), 0.0, 1.0);
  vec3 submerged = mix(refr * mix(1.0, 0.0, pow(depth, 1.2 * uTransparency)), vec3(0.0), uTransparency * 0.4);

  // Blend reflection surface and refraction/submerged body
  vec3 blendedVideo = mix(submerged, refl, uReflect);

  float lum = dot(blendedVideo, vec3(0.299, 0.587, 0.114));
  vec3 chrome = pow(lum, 1.8) * vec3(0.40, 0.46, 0.56);

  vec3 L  = normalize(vec3(0.25, 0.9, 0.5));
  vec3 hv = normalize(L + vec3(0.0, 0.0, 1.0));
  vec3 nA = normalize(vec3(n.x * 0.35, n.y, n.z));
  float spec  = pow(max(dot(nA, hv), 0.0), 90.0);
  float sheen = pow(max(dot(n,  hv), 0.0), 16.0);
  vec3 col = chrome + (spec * 1.25 + sheen * 0.14) * uSpec * vec3(0.85, 0.92, 1.0);

  // Depth color shading & tub liquid glow wash
  col *= mix(1.0, 0.28, pow(depth, 0.8));
  col += vec3(0.08, 0.28, 0.48) * pow(depth, 1.4) * (1.0 - uReflect);
  col += vec3(0.55, 0.66, 0.82) * abs(h) * 1.5;

  float edge = smoothstep(0.010, 0.0, wLine - vUv.y);
  col += edge * vec3(0.9, 0.95, 1.0) * 0.7;
  col += 0.018 * sin(vUv.x * 40.0 + uTime * 0.7 + h * 30.0) * (1.0 - depth);

  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function link(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
function makeTex(gl, w, h, data) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data || null);
  return t;
}

class GooEngine {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) throw new Error("WebGL not available");
    this.gl = gl;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.simProg = link(gl, VERT, SIM_FRAG);
    this.compProg = link(gl, VERT, COMP_FRAG);
    const U = (p, n) => gl.getUniformLocation(p, n);
    this.simU = {
      ripple: U(this.simProg, "uRipple"), cur: U(this.simProg, "uCur"), prev: U(this.simProg, "uPrev"),
      texel: U(this.simProg, "uTexel"), water: U(this.simProg, "uWater"), damp: U(this.simProg, "uDamp"),
      wake: U(this.simProg, "uWake"), mirror: U(this.simProg, "uMirror"), fit: U(this.simProg, "uFit"),
      aspect: U(this.simProg, "uAspect"), pts: U(this.simProg, "uPts[0]"), num: U(this.simProg, "uNum"),
    };
    this.compU = {
      ripple: U(this.compProg, "uRipple"), video: U(this.compProg, "uVideo"),
      simTexel: U(this.compProg, "uSimTexel"), water: U(this.compProg, "uWater"),
      mirror: U(this.compProg, "uMirror"), distort: U(this.compProg, "uDistort"),
      spec: U(this.compProg, "uSpec"), time: U(this.compProg, "uTime"), fit: U(this.compProg, "uFit"),
      reflect: U(this.compProg, "uReflect"), transparency: U(this.compProg, "uTransparency"),
      depthMap: U(this.compProg, "uDepthMap"), depthSlice: U(this.compProg, "uDepthSlice"),
    };

    this.rippleTex = [null, null];
    this.rippleFbo = [null, null];
    this.rippleIdx = 0;
    this.vidTex = [makeTex(gl, 2, 2), makeTex(gl, 2, 2)];
    this.depthTex = makeTex(gl, 2, 2);
    this.vidIdx = 0;
    this.simW = 0;
    this.simH = 0;
    this.lastFit = [1, 1];
    this.t0 = performance.now();
    this.ptsFlat = new Float32Array(MAX_POINTS * 3);
  }

  resize(w, h) {
    const { gl, canvas } = this;
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    const simW = 320;
    const simH = Math.max(64, Math.round(simW * (h / w)));
    const fill = new Uint8Array(simW * simH * 4);
    for (let i = 0; i < fill.length; i += 4) { fill[i] = 128; fill[i + 1] = 128; fill[i + 3] = 255; }
    for (let i = 0; i < 2; i++) {
      if (this.rippleTex[i]) gl.deleteTexture(this.rippleTex[i]);
      if (this.rippleFbo[i]) gl.deleteFramebuffer(this.rippleFbo[i]);
      this.rippleTex[i] = makeTex(gl, simW, simH, fill);
      this.rippleFbo[i] = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.rippleFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.rippleTex[i], 0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.simW = simW;
    this.simH = simH;
  }

  /** MediaPipe normalized landmark (y DOWN) → canvas uv (y up). */
  mapLandmark(nx, nyDown, mirror) {
    const [fx, fy] = this.lastFit;
    const vyUp = 1 - nyDown;
    const mx = (nx - 0.5) / fx + 0.5;
    const cy = (vyUp - 0.5) / fy + 0.5;
    const cx = mirror ? 1 - mx : mx;
    return { x: cx, y: cy };
  }

  render(video, depthCanvas, pts, params) {
    const { gl, canvas } = this;
    if (!this.simW) return;

    const curVid = this.vidIdx;
    const prevVid = 1 - this.vidIdx;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.vidTex[curVid]);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.bindTexture(gl.TEXTURE_2D, this.depthTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depthCanvas);
    } catch (e) {
      return;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const vw = video.videoWidth || video.width || 640;
    const vh = video.videoHeight || video.height || 360;
    const va = vw / vh;
    const ca = canvas.width / canvas.height;
    const fit = ca > va ? [1, va / ca] : [ca / va, 1];
    this.lastFit = fit;

    const n = Math.min(pts.length, MAX_POINTS);
    for (let i = 0; i < MAX_POINTS; i++) {
      if (i < n) {
        this.ptsFlat[i * 3] = pts[i].x;
        this.ptsFlat[i * 3 + 1] = pts[i].y;
        this.ptsFlat[i * 3 + 2] = pts[i].s;
      } else {
        this.ptsFlat[i * 3] = -1;
        this.ptsFlat[i * 3 + 1] = -1;
        this.ptsFlat[i * 3 + 2] = 0;
      }
    }

    gl.useProgram(this.simProg);
    gl.uniform1i(this.simU.ripple, 0);
    gl.uniform1i(this.simU.cur, 1);
    gl.uniform1i(this.simU.prev, 2);
    gl.uniform2f(this.simU.texel, 1 / this.simW, 1 / this.simH);
    gl.uniform1f(this.simU.water, params.water);
    gl.uniform1f(this.simU.damp, params.damp);
    gl.uniform1f(this.simU.wake, params.wake);
    gl.uniform1f(this.simU.mirror, params.mirror);
    gl.uniform2f(this.simU.fit, fit[0], fit[1]);
    gl.uniform1f(this.simU.aspect, ca);
    gl.uniform3fv(this.simU.pts, this.ptsFlat);
    gl.uniform1i(this.simU.num, n);
    gl.viewport(0, 0, this.simW, this.simH);
    for (let s = 0; s < 2; s++) {
      const src = this.rippleIdx;
      const dst = 1 - this.rippleIdx;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.rippleFbo[dst]);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.rippleTex[src]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.vidTex[curVid]);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.vidTex[prevVid]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.rippleIdx = dst;
      gl.uniform1i(this.simU.num, 0);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(this.compProg);
    gl.uniform1i(this.compU.ripple, 0);
    gl.uniform1i(this.compU.video, 1);
    gl.uniform1i(this.compU.depthMap, 3);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.rippleTex[this.rippleIdx]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.vidTex[curVid]);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.depthTex);
    gl.uniform2f(this.compU.simTexel, 1 / this.simW, 1 / this.simH);
    gl.uniform1f(this.compU.water, params.water);
    gl.uniform1f(this.compU.mirror, params.mirror);
    gl.uniform1f(this.compU.distort, params.distort);
    gl.uniform1f(this.compU.spec, params.spec);
    gl.uniform1f(this.compU.time, (performance.now() - this.t0) / 1000);
    gl.uniform2f(this.compU.fit, fit[0], fit[1]);
    gl.uniform1f(this.compU.reflect, params.reflect);
    gl.uniform1f(this.compU.transparency, params.transparency);
    gl.uniform1f(this.compU.depthSlice, params.depthSlice);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.vidIdx = prevVid;
  }

  dispose() {
    const { gl } = this;
    this.rippleTex.forEach((t) => t && gl.deleteTexture(t));
    this.rippleFbo.forEach((f) => f && gl.deleteFramebuffer(f));
    this.vidTex.forEach((t) => gl.deleteTexture(t));
    if (this.depthTex) gl.deleteTexture(this.depthTex);
  }
}

/* ---------------------------------------------------------- */
/* MediaPipe tracking (loaded from CDN, optional)             */
/* ---------------------------------------------------------- */

const VISION_ESM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const HAND_POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const FACE_POINTS = [0, 4, 6, 10, 13, 14, 18, 33, 70, 107, 145, 152, 159, 168, 234, 263, 291, 300, 336, 374, 386, 454];

async function createTrackers(onStatus = () => {}) {
  onStatus("Loading vision runtime");
  const { FilesetResolver, HandLandmarker, FaceLandmarker } = await import(
    /* @vite-ignore */ VISION_ESM
  );
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);

  const build = async (delegate) => {
    onStatus(`Loading hand model (${delegate})`);
    const hands = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: HAND_MODEL, delegate },
      runningMode: "VIDEO",
      numHands: 2,
    });
    onStatus("Loading face model");
    const face = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL, delegate },
      runningMode: "VIDEO",
      numFaces: 1,
    });
    return new TrackerRig(hands, face);
  };

  try {
    return await build("GPU");
  } catch (e) {
    return await build("CPU");
  }
}

class TrackerRig {
  constructor(hands, face) {
    this.hands = hands;
    this.face = face;
    this.prev = new Map();
    this.pinched = [false, false];
    this.frame = 0;
    this.lastFace = null;
    this.lastTs = 0;
    this.depthCanvas = document.createElement("canvas");
    this.depthCanvas.width = 320;
    this.depthCanvas.height = 240;
  }

  updateDepthMap(handRes, faceRes) {
    const canvas = this.depthCanvas;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawCircle = (nx, ny, nz, radius) => {
      const cx = nx * canvas.width;
      const cy = ny * canvas.height;
      // Map MediaPipe z coordinate to 0-255 grayscale
      // MediaPipe z is usually in range [-0.15, 0.15], closer is more negative.
      // So let's map (-0.18 to 0.12) to (255 to 0).
      const zNorm = Math.min(Math.max((0.12 - nz) / 0.30, 0.0), 1.0);
      const val = Math.round(zNorm * 255);
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(${val}, ${val}, ${val}, 1.0)`);
      grad.addColorStop(1, `rgba(${val}, ${val}, ${val}, 0.0)`);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    if (handRes && handRes.landmarks) {
      handRes.landmarks.forEach((lm) => {
        lm.forEach((pt) => {
          drawCircle(pt.x, pt.y, pt.z, 28);
        });
      });
    }

    if (faceRes && faceRes.faceLandmarks && faceRes.faceLandmarks[0]) {
      faceRes.faceLandmarks[0].forEach((pt) => {
        drawCircle(pt.x, pt.y, pt.z, 20);
      });
    }
  }

  getPoints(video, engine, params) {
    const now = performance.now();
    const ts = Math.max(now, this.lastTs + 1);
    this.lastTs = ts;
    this.frame++;

    const pts = [];
    const seen = new Set();

    const push = (key, nx, ny, gain) => {
      const c = engine.mapLandmark(nx, ny, params.mirror);
      if (c.x < -0.05 || c.x > 1.05) return;

      const prev = this.prev.get(key);
      let speed = 0;
      if (prev) speed = Math.hypot(c.x - prev.x, c.y - prev.y);
      this.prev.set(key, { x: c.x, y: c.y });
      seen.add(key);

      const s = Math.min(speed * gain, 0.45);
      if (s < 0.004) return;

      const W = params.water;
      let gy = c.y > W ? 2 * W - c.y : c.y;
      if (gy < -0.05) return;
      gy = Math.min(Math.max(gy, 0.005), W - 0.004);
      pts.push({ x: c.x, y: gy, s });
    };

    let handRes = null;
    try {
      handRes = this.hands.detectForVideo(video, ts);
    } catch (e) { /* skip frame */ }

    if (handRes && handRes.landmarks) {
      handRes.landmarks.forEach((lm, hi) => {
        HAND_POINTS.forEach((idx) => {
          const p = lm[idx];
          if (p) push(`h${hi}-${idx}`, p.x, p.y, params.handPower);
        });

        const t = lm[4], i8 = lm[8];
        if (t && i8) {
          const pinchDist = Math.hypot(t.x - i8.x, t.y - i8.y);
          const isPinched = pinchDist < 0.05;
          if (isPinched && !this.pinched[hi]) {
            const c = engine.mapLandmark((t.x + i8.x) / 2, (t.y + i8.y) / 2, params.mirror);
            const W = params.water;
            let gy = c.y > W ? 2 * W - c.y : c.y;
            gy = Math.min(Math.max(gy, 0.005), W - 0.004);
            pts.push({ x: c.x, y: gy, s: 0.4 });
          }
          this.pinched[hi] = isPinched;
        }
      });
    }

    if (params.faceOn) {
      if (this.frame % 2 === 0) {
        try {
          this.lastFace = this.face.detectForVideo(video, ts);
        } catch (e) { /* keep last */ }
      }
      const fl = this.lastFace && this.lastFace.faceLandmarks && this.lastFace.faceLandmarks[0];
      if (fl) {
        FACE_POINTS.forEach((idx) => {
          const p = fl[idx];
          if (p) push(`f-${idx}`, p.x, p.y, params.facePower);
        });
      }
    }

    for (const key of this.prev.keys()) {
      if (!seen.has(key)) this.prev.delete(key);
    }

    this.updateDepthMap(handRes, this.lastFace);

    return pts;
  }

  dispose() {
    try { this.hands.close(); } catch (e) {}
    try { this.face.close(); } catch (e) {}
  }
}

/* ---------------------------------------------------------- */
/* Styles (scoped, injected once)                             */
/* ---------------------------------------------------------- */

const CSS = `
.cgm-wrap { position: relative; width: 100%; height: 100%; min-height: 460px;
  background: #05060a; overflow: hidden; border-radius: 12px;
  font-family: 'Helvetica Neue', Arial, sans-serif; }
.cgm-stage { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.cgm-overlay { position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 22px; padding: 24px; text-align: center;
  background: radial-gradient(120% 90% at 50% 0%, #10131c 0%, #05060a 55%); }
.cgm-title { font-size: clamp(34px, 6vw, 72px); font-weight: 800; letter-spacing: 0.12em;
  background: linear-gradient(180deg, #f2f5fa 0%, #9aa4b5 38%, #2a3040 52%, #c8d2e2 66%, #565f72 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 2px 14px rgba(150,170,210,0.25)); }
.cgm-sub { color: #7d8698; font-size: 14px; max-width: 440px; line-height: 1.55; }
.cgm-start { padding: 13px 32px; font-size: 15px; font-weight: 600; letter-spacing: 0.05em;
  color: #0a0c12; cursor: pointer; border: none; border-radius: 999px;
  background: linear-gradient(180deg, #eef2f8, #a9b3c4 55%, #7d8698);
  box-shadow: 0 6px 24px rgba(160,180,220,0.28), inset 0 1px 0 rgba(255,255,255,0.8); }
.cgm-start:focus-visible, .cgm-toggle:focus-visible, .cgm-btn:focus-visible {
  outline: 2px solid #c8d2e2; outline-offset: 2px; }
.cgm-status { color: #9aa4b5; font-size: 13px; letter-spacing: 0.04em; }
.cgm-error { color: #e08f8f; font-size: 13px; max-width: 380px; line-height: 1.5; }
.cgm-note { position: absolute; left: 12px; top: 12px; z-index: 3; font-size: 11px;
  letter-spacing: 0.05em; color: #6b7485; background: rgba(8,10,16,0.55);
  border: 1px solid rgba(160,175,200,0.18); border-radius: 999px; padding: 6px 12px; }
.cgm-toggle { position: absolute; top: 12px; right: 12px; z-index: 3; padding: 8px 14px;
  font-size: 12px; letter-spacing: 0.06em; color: #c8d0dd; background: rgba(10,12,18,0.55);
  border: 1px solid rgba(160,175,200,0.25); border-radius: 999px; cursor: pointer;
  backdrop-filter: blur(8px); }
.cgm-panel { position: absolute; left: 0; bottom: 0; width: 100%; z-index: 2;
  display: flex; flex-direction: column; gap: 12px; padding: 12px 16px;
  background: rgba(8,10,16,0.85); border-top: 1px solid rgba(160,175,200,0.18);
  border-radius: 0 0 12px 12px; backdrop-filter: blur(12px); box-sizing: border-box; }
@media (min-width: 768px) {
  .cgm-panel { flex-direction: row; align-items: center; }
}
.cgm-controls-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px 12px; flex: 1; width: 100%; }
.cgm-row { display: flex; flex-direction: column; gap: 3px; }
.cgm-row-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.cgm-row input[type="range"] { width: 100%; accent-color: #c8d2e2; height: 4px; margin: 0; padding: 0; }
.cgm-lab { font-size: 11px; color: #9aa4b5; letter-spacing: 0.04em; }
.cgm-val { font-size: 10px; color: #6b7485; text-align: right; font-variant-numeric: tabular-nums; }
.cgm-foot { display: flex; gap: 6px; align-items: center; justify-content: flex-end; flex-shrink: 0; }
.cgm-btn { padding: 6px 12px; font-size: 11px; color: #c8d0dd; cursor: pointer;
  background: rgba(30,34,46,0.7); border: 1px solid rgba(160,175,200,0.25); border-radius: 999px; }
.cgm-rec { color: #ffb4b4; border-color: rgba(255,140,140,0.45); }
@media (prefers-reduced-motion: reduce) { .cgm-title { filter: none; } }
`;

function useStyles() {
  useEffect(() => {
    if (document.getElementById("cgm-styles")) return;
    const el = document.createElement("style");
    el.id = "cgm-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

/* ---------------------------------------------------------- */
/* Component                                                  */
/* ---------------------------------------------------------- */

export default function ChromeGooMirror() {
  useStyles();

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const engineRef = useRef(null);
  const rigRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const pointerRef = useRef(null);
  const recRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | loading | running
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [recording, setRecording] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const isFallbackRef = useRef(false);
  isFallbackRef.current = isFallback;
  const fallbackCanvasRef = useRef(null);
  const fallbackDepthCanvasRef = useRef(null);

  const getFallbackCanvas = () => {
    if (!fallbackCanvasRef.current) {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 360;
      fallbackCanvasRef.current = c;
    }
    const c = fallbackCanvasRef.current;
    const ctx = c.getContext("2d");
    const t = performance.now() * 0.001;

    // Draw dark background gradient
    const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, "#081426");
    grad.addColorStop(0.5, "#0b2545");
    grad.addColorStop(1, "#03071e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);

    // Draw tech gridlines
    ctx.strokeStyle = "rgba(0, 180, 216, 0.15)";
    ctx.lineWidth = 1;
    const grid = 40;
    for (let x = 0; x < c.width; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, c.height);
      ctx.stroke();
    }
    for (let y = 0; y < c.height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(c.width, y);
      ctx.stroke();
    }

    // Draw moving glowing color sweeps
    ctx.fillStyle = "rgba(0, 180, 216, 0.12)";
    for (let i = 0; i < 3; i++) {
      const cx = c.width * 0.5 + Math.sin(t * 0.5 + i) * c.width * 0.3;
      const cy = c.height * 0.5 + Math.cos(t * 0.7 + i) * c.height * 0.3;
      const r = 80 + Math.sin(t + i) * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  };

  const [params, setParams] = useState({
    water: 0.5,
    handPower: 8.5,
    facePower: 6.0,
    wake: 1.5,
    damp: 0.985,
    distort: 0.06,
    spec: 1.0,
    mirror: 1,
    faceOn: true,
    reflect: 0.6,
    transparency: 0.65,
    depthSlice: 0.15,
  });
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const set = (k) => (v) => setParams((p) => ({ ...p, [k]: v }));

  const start = useCallback(async () => {
    setError("");
    setIsFallback(false);
    setPhase("loading");
    try {
      setStatus("Requesting camera");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      await video.play();
      videoRef.current = video;

      try {
        rigRef.current = await createTrackers(setStatus);
        setTracking(true);
      } catch (e) {
        console.warn("MediaPipe unavailable, falling back to wake + pointer", e);
        rigRef.current = null;
        setTracking(false);
      }
      setPhase("running");
    } catch (e) {
      console.error(e);
      setError(
        e.name === "NotAllowedError"
          ? "Camera access is blocked. Allow the camera for this site, then start again."
          : e.name === "NotFoundError"
          ? "No camera found. Connect one and start again."
          : `Startup failed: ${e.message || e}`
      );
      setPhase("idle");
    }
  }, []);

  const startFallback = useCallback(() => {
    setError("");
    setIsFallback(true);
    setTracking(false);
    setPhase("running");
  }, []);

  const stop = useCallback(() => {
    setPhase("idle");
    setIsFallback(false);
    setRecording(false);
    cancelAnimationFrame(rafRef.current);
    if (recRef.current && recRef.current.state !== "inactive") {
      try { recRef.current.stop(); } catch (e) {}
    }
    recRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (rigRef.current) {
      rigRef.current.dispose();
      rigRef.current = null;
    }
    videoRef.current = null;
  }, []);

  useEffect(() => {
    if (phase !== "running") return;

    const canvas = canvasRef.current;
    let engine;
    try {
      engine = new GooEngine(canvas);
    } catch (e) {
      setError("This browser can't run WebGL, so the goo has nowhere to live.");
      setPhase("idle");
      return;
    }
    engineRef.current = engine;

    const resize = () => {
      const rect = wrapRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      engine.resize(
        Math.max(2, Math.floor(rect.width * dpr)),
        Math.max(2, Math.floor(rect.height * dpr))
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const isFb = isFallbackRef.current;
      const video = isFb ? getFallbackCanvas() : videoRef.current;
      if (!video) return;
      if (video instanceof HTMLVideoElement && video.readyState < 2) return;
      const p = paramsRef.current;

      const pts = rigRef.current ? rigRef.current.getPoints(video, engine, p) : [];

      // pointer splats — always on, and the whole story when tracking is off
      const pr = pointerRef.current;
      if (pr && pr.active && performance.now() - pr.t < 120) {
        const s = Math.min(pr.speed * 9, 0.4);
        if (s > 0.004) {
          const W = p.water;
          let gy = pr.y > W ? 2 * W - pr.y : pr.y;
          gy = Math.min(Math.max(gy, 0.005), W - 0.004);
          pts.push({ x: pr.x, y: gy, s });
        }
      }

      let depthCanvas;
      if (rigRef.current) {
        depthCanvas = rigRef.current.depthCanvas;
      } else {
        if (!fallbackDepthCanvasRef.current) {
          fallbackDepthCanvasRef.current = document.createElement("canvas");
          fallbackDepthCanvasRef.current.width = 320;
          fallbackDepthCanvasRef.current.height = 240;
        }
        const fdc = fallbackDepthCanvasRef.current;
        const fctx = fdc.getContext("2d");
        fctx.fillStyle = "black";
        fctx.fillRect(0, 0, fdc.width, fdc.height);

        if (pr && pr.active && performance.now() - pr.t < 120) {
          const cx = pr.x * fdc.width;
          const cy = (1 - pr.y) * fdc.height;
          const grad = fctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
          grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
          grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
          fctx.fillStyle = grad;
          fctx.beginPath();
          fctx.arc(cx, cy, 35, 0, Math.PI * 2);
          fctx.fill();
        }
        depthCanvas = fdc;
      }

      engine.render(video, depthCanvas, pts, p);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, [phase]);

  useEffect(() => () => stop(), [stop]);

  const onPointer = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    const prev = pointerRef.current;
    const speed = prev ? Math.hypot(x - prev.x, y - prev.y) : 0;
    pointerRef.current = { x, y, speed, t: performance.now(), active: true };
  };
  const onPointerOut = () => {
    if (pointerRef.current) pointerRef.current.active = false;
  };

  const toggleRecord = () => {
    if (recording) {
      try { recRef.current && recRef.current.stop(); } catch (e) {}
      return;
    }
    try {
      const stream = canvasRef.current.captureStream(60);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm;codecs=vp8";
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12e6 });
      const chunks = [];
      rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      rec.onstop = () => {
        setRecording(false);
        const blob = new Blob(chunks, { type: "video/webm" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `chrome-goo-${Date.now()}.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (e) {
      setError("Recording isn't supported in this browser.");
    }
  };

  const Slider = ({ label, value, min, max, step, onChange, fmt }) => (
    <label className="cgm-row">
      <div className="cgm-row-header">
        <span className="cgm-lab">{label}</span>
        <span className="cgm-val">{fmt ? fmt(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );

  return (
    <div
      ref={wrapRef}
      className="cgm-wrap"
      onPointerMove={phase === "running" ? onPointer : undefined}
      onPointerLeave={onPointerOut}
    >
      <canvas ref={canvasRef} className="cgm-stage" />

      {phase !== "running" && (
        <div className="cgm-overlay">
          <div className="cgm-title">CHROME&nbsp;GOO</div>
          <div className="cgm-sub">
            Your webcam feed, half-submerged in liquid black chrome. Fingertips
            stir the surface, a pinch throws a splash, and every move above the
            waterline echoes in the reflection below.
          </div>
          {phase === "idle" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <button className="cgm-start" onClick={start}>Turn on camera</button>
              <button 
                className="cgm-toggle" 
                style={{ position: "static", transform: "none", background: "rgba(30,34,46,0.7)" }}
                onClick={startFallback}
              >
                Run Pointer-Only (No Camera)
              </button>
            </div>
          ) : (
            <div className="cgm-status">{status}…</div>
          )}
          {error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginTop: "10px" }}>
              <div className="cgm-error">{error}</div>
              <button 
                className="cgm-start" 
                style={{ padding: "8px 20px", fontSize: "12px" }}
                onClick={startFallback}
              >
                Launch Pointer-Only Mode
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "running" && (
        <>
          <div className="cgm-note">
            {tracking ? "Hands + face tracked" : "Move the pointer to stir — tracking offline"}
          </div>
          <button className="cgm-toggle" onClick={() => setShowPanel((s) => !s)}>
            {showPanel ? "Hide controls" : "Controls"}
          </button>
          {showPanel && (
            <div className="cgm-panel">
              <div className="cgm-controls-grid">
                <Slider label="Goo level" value={params.water} min={0.15} max={0.75} step={0.01}
                  onChange={set("water")} fmt={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Hand power" value={params.handPower} min={0} max={16} step={0.5}
                  onChange={set("handPower")} fmt={(v) => v.toFixed(1)} />
                <Slider label="Face power" value={params.facePower} min={0} max={10} step={0.5}
                  onChange={set("facePower")} fmt={(v) => v.toFixed(1)} />
                <Slider label="Body wake" value={params.wake} min={0} max={4} step={0.1}
                  onChange={set("wake")} fmt={(v) => v.toFixed(1)} />
                <Slider label="Viscosity" value={params.damp} min={0.9} max={0.997} step={0.001}
                  onChange={set("damp")} fmt={(v) => (1 - v).toFixed(3)} />
                <Slider label="Warp" value={params.distort} min={0} max={0.15} step={0.005}
                  onChange={set("distort")} fmt={(v) => v.toFixed(2)} />
                <Slider label="Shine" value={params.spec} min={0} max={2} step={0.05}
                  onChange={set("spec")} fmt={(v) => v.toFixed(2)} />
                <Slider label="Reflection" value={params.reflect} min={0.0} max={1.0} step={0.05}
                  onChange={set("reflect")} fmt={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Transparency" value={params.transparency} min={0.0} max={1.0} step={0.05}
                  onChange={set("transparency")} fmt={(v) => `${Math.round((1 - v) * 100)}%`} />
                <Slider label="Depth Slice" value={params.depthSlice} min={0.0} max={1.0} step={0.02}
                  onChange={set("depthSlice")} fmt={(v) => `${Math.round(v * 100)}%`} />
              </div>
              <div className="cgm-foot">
                <button className="cgm-btn" style={{ opacity: params.faceOn ? 1 : 0.5 }}
                  onClick={() => set("faceOn")(!params.faceOn)}>Face</button>
                <button className="cgm-btn" style={{ opacity: params.mirror ? 1 : 0.5 }}
                  onClick={() => set("mirror")(params.mirror ? 0 : 1)}>Mirror</button>
                <button className={`cgm-btn${recording ? " cgm-rec" : ""}`} onClick={toggleRecord}>
                  {recording ? "Stop recording" : "Record"}
                </button>
                <button className="cgm-btn" onClick={stop}>Stop</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
