/* ============================================================
   ChromeGooMirror.jsx — single-file LIVE artifact  (v2: THE TUBE)

   You are sealed in a tube of liquid black chrome. A real
   per-pixel depth pass decides what breaks the surface:
   lean toward the camera and your face rises out of the goo,
   reach forward and only your hands emerge while the rest of
   you stays a dark shape under the liquid. The "Z level"
   slider is the fill line of the tube — sweep it and the goo
   drains down your face in depth order.

   Depth sources, in order of preference:
     1. TRUE DEPTH — TensorFlow.js ARPortraitDepth (monocular
        portrait depth model), loaded from the jsDelivr ESM CDN.
        Per-pixel z of face / hands / torso, EMA-smoothed.
     2. LANDMARK DEPTH — MediaPipe face + hand landmarks
        rasterized into a depth map. Proximity is estimated
        from apparent size (face width, palm length), so
        leaning in still raises you out of the goo.
     3. POINTER — no camera at all: the pointer is a glowing
        blob that pokes through the surface.

   Everything is inlined so the artifact loader only needs this
   one .jsx. No new npm dependencies on the host site.
   ============================================================ */

import React, { useRef, useEffect, useState, useCallback } from "react";

/* ---------------------------------------------------------- */
/* WebGL engine                                               */
/* ---------------------------------------------------------- */

const MAX_POINTS = 64;
const DEPTH_W = 256;
const DEPTH_H = 192;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* Ripple simulation across the WHOLE frame — the goo fills the
   tube, so there is no horizontal waterline any more. Motion of
   the body (where the depth pass says a body exists) stirs the
   surface, strongest right where skin crosses the z slice. */
const SIM_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uRipple;
uniform sampler2D uCur;
uniform sampler2D uPrev;
uniform sampler2D uDepth;
uniform vec2  uTexel;
uniform float uDamp;
uniform float uWake;
uniform float uMirror;
uniform float uSlice;
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

  for (int i = 0; i < ${MAX_POINTS}; i++){
    if (i >= uNum) break;
    vec2 d = vUv - uPts[i].xy;
    d.x *= uAspect;
    float g = exp(-dot(d, d) / 0.0011);
    next += uPts[i].z * g;
  }

  if (uWake > 0.001){
    vec2 tv = vidUV(vUv);
    vec3 a = texture2D(uCur,  tv).rgb;
    vec3 b = texture2D(uPrev, tv).rgb;
    float m = max(0.0, length(a - b) - 0.10);
    float d = texture2D(uDepth, tv).r;
    float presence = smoothstep(0.04, 0.18, d);
    float band = exp(-pow((d - uSlice) / 0.09, 2.0));
    next += m * uWake * presence * (0.30 + 1.5 * band);
  }

  next = clamp(next, -0.49, 0.49);
  gl_FragColor = vec4(next + 0.5, c + 0.5, 0.0, 1.0);
}`;

/* Composite: the z slice is the goo surface. depth > surface
   emerges (wet, chrome-coated video); depth < surface is a dark
   silhouette dissolving into the liquid; the crossing band gets
   a meniscus ring. Ripple height displaces the surface in z, so
   the goo genuinely sloshes over and off your skin. */
const COMP_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uRipple;
uniform sampler2D uVideo;
uniform sampler2D uDepth;
uniform vec2  uSimTexel;
uniform vec2  uDepthTexel;
uniform float uMirror;
uniform float uDistort;
uniform float uSpec;
uniform float uTime;
uniform vec2  uFit;
uniform float uSlice;
uniform float uMeniscus;
uniform float uSlosh;
uniform float uMurk;
uniform float uWet;

vec2 vidUV(vec2 p){
  p.x = mix(p.x, 1.0 - p.x, uMirror);
  return (p - 0.5) * uFit + 0.5;
}
float H(vec2 p){ return texture2D(uRipple, p).r - 0.5; }
float D(vec2 p){ return texture2D(uDepth, p).r; }

void main(){
  float h  = H(vUv);
  float nx = H(vUv + vec2(uSimTexel.x, 0.0)) - H(vUv - vec2(uSimTexel.x, 0.0));
  float ny = H(vUv + vec2(0.0, uSimTexel.y)) - H(vUv - vec2(0.0, uSimTexel.y));
  vec3 rn = normalize(vec3(-nx * 30.0, -ny * 30.0, 1.0));

  vec2 warp = rn.xy * uDistort;
  vec2 tv   = vidUV(vUv);
  float d   = D(tv);

  // The goo surface in z, locally displaced by the ripple field.
  float surface = uSlice + h * uSlosh;
  float em = smoothstep(surface, surface + uMeniscus, d);

  // Screen-space normals from the DEPTH pass (for wet shading
  // that follows the actual geometry of face and hands).
  float dxd = D(tv + vec2(uDepthTexel.x, 0.0)) - D(tv - vec2(uDepthTexel.x, 0.0));
  float dyd = D(tv + vec2(0.0, uDepthTexel.y)) - D(tv - vec2(0.0, uDepthTexel.y));
  vec3 dn = normalize(vec3(-dxd * 6.0, -dyd * 6.0, 0.35));

  vec3 L  = normalize(vec3(0.25, 0.9, 0.5));
  vec3 hv = normalize(L + vec3(0.0, 0.0, 1.0));

  /* -------- GOO: liquid black chrome, whole tube -------- */
  float gspec  = pow(max(dot(rn, hv), 0.0), 90.0);
  float gsheen = pow(max(dot(rn, hv), 0.0), 16.0);

  // Faint refracted glimpse of the submerged body through murk:
  // shallower parts read as brighter ghosts, deep parts vanish.
  vec3  seen  = texture2D(uVideo, vidUV(vUv + warp * 1.4)).rgb;
  float lum   = dot(seen, vec3(0.299, 0.587, 0.114));
  float below = clamp((surface - d) / max(surface, 0.001), 0.0, 1.0);
  float ghost = smoothstep(0.05, 0.55, d) * (1.0 - em) * uMurk;

  vec3 goo = vec3(0.016, 0.020, 0.028);
  goo += pow(lum, 1.8) * vec3(0.40, 0.46, 0.56) * ghost * mix(1.0, 0.12, pow(below, 0.8));
  goo += (gspec * 1.25 + gsheen * 0.14) * uSpec * vec3(0.85, 0.92, 1.0);
  goo += vec3(0.55, 0.66, 0.82) * abs(h) * 1.3;

  /* -------- EMERGED: wet skin breaking the surface ------ */
  vec3 skin = texture2D(uVideo, vidUV(vUv + warp * 0.15)).rgb;
  skin = pow(skin, vec3(1.05));

  float wspec = pow(max(dot(dn, hv), 0.0), 60.0) * uSpec;
  float rimL  = pow(1.0 - max(dn.z, 0.0), 2.0);
  vec3 chromeT = pow(dot(skin, vec3(0.299, 0.587, 0.114)), 1.6) * vec3(0.42, 0.48, 0.58);

  // Chrome coating clings hardest just above the surface and
  // dries off the further a part rises out of the goo.
  float coat = uWet * (1.0 - smoothstep(surface + uMeniscus, surface + uMeniscus + 0.35, d));
  vec3 wet = mix(skin, chromeT, coat * 0.8);
  wet += (wspec + rimL * 0.2) * vec3(0.85, 0.92, 1.0) * (0.35 + coat);

  vec3 col = mix(goo, wet, em);

  /* -------- Meniscus: where skin crosses the slice ------ */
  float ring = exp(-pow((d - surface) / (max(uMeniscus, 0.001) * 0.6), 2.0))
             * smoothstep(0.02, 0.08, d);
  col += ring * vec3(0.90, 0.95, 1.0) * 0.55;
  col += ring * abs(h) * 2.0;

  /* -------- Tube dressing ------------------------------- */
  float cx   = vUv.x * 2.0 - 1.0;
  float tube = sqrt(max(1.0 - cx * cx, 0.0));
  col *= mix(0.30, 1.0, smoothstep(0.0, 0.20, tube));
  float streak = pow(max(0.0, 1.0 - abs(cx - 0.55) * 8.0), 3.0)
               + pow(max(0.0, 1.0 - abs(cx + 0.62) * 10.0), 3.0);
  col += streak * vec3(0.50, 0.60, 0.75) * 0.05;
  col += 0.012 * sin(vUv.y * 70.0 + uTime * 1.3 + h * 40.0) * tube;

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
      depth: U(this.simProg, "uDepth"), texel: U(this.simProg, "uTexel"), damp: U(this.simProg, "uDamp"),
      wake: U(this.simProg, "uWake"), mirror: U(this.simProg, "uMirror"), slice: U(this.simProg, "uSlice"),
      fit: U(this.simProg, "uFit"), aspect: U(this.simProg, "uAspect"),
      pts: U(this.simProg, "uPts[0]"), num: U(this.simProg, "uNum"),
    };
    this.compU = {
      ripple: U(this.compProg, "uRipple"), video: U(this.compProg, "uVideo"), depth: U(this.compProg, "uDepth"),
      simTexel: U(this.compProg, "uSimTexel"), depthTexel: U(this.compProg, "uDepthTexel"),
      mirror: U(this.compProg, "uMirror"), distort: U(this.compProg, "uDistort"),
      spec: U(this.compProg, "uSpec"), time: U(this.compProg, "uTime"), fit: U(this.compProg, "uFit"),
      slice: U(this.compProg, "uSlice"), meniscus: U(this.compProg, "uMeniscus"),
      slosh: U(this.compProg, "uSlosh"), murk: U(this.compProg, "uMurk"), wet: U(this.compProg, "uWet"),
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
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
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
    gl.uniform1i(this.simU.depth, 3);
    gl.uniform2f(this.simU.texel, 1 / this.simW, 1 / this.simH);
    gl.uniform1f(this.simU.damp, params.damp);
    gl.uniform1f(this.simU.wake, params.wake);
    gl.uniform1f(this.simU.mirror, params.mirror);
    gl.uniform1f(this.simU.slice, params.slice);
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
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.depthTex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.rippleIdx = dst;
      gl.uniform1i(this.simU.num, 0);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(this.compProg);
    gl.uniform1i(this.compU.ripple, 0);
    gl.uniform1i(this.compU.video, 1);
    gl.uniform1i(this.compU.depth, 3);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.rippleTex[this.rippleIdx]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.vidTex[curVid]);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.depthTex);
    gl.uniform2f(this.compU.simTexel, 1 / this.simW, 1 / this.simH);
    gl.uniform2f(this.compU.depthTexel, 1 / DEPTH_W, 1 / DEPTH_H);
    gl.uniform1f(this.compU.mirror, params.mirror);
    gl.uniform1f(this.compU.distort, params.distort);
    gl.uniform1f(this.compU.spec, params.spec);
    gl.uniform1f(this.compU.time, (performance.now() - this.t0) / 1000);
    gl.uniform2f(this.compU.fit, fit[0], fit[1]);
    gl.uniform1f(this.compU.slice, params.slice);
    gl.uniform1f(this.compU.meniscus, params.meniscus);
    gl.uniform1f(this.compU.slosh, params.slosh);
    gl.uniform1f(this.compU.murk, params.murk);
    gl.uniform1f(this.compU.wet, params.wet);
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
/* TRUE DEPTH — ARPortraitDepth via TF.js from the CDN        */
/* ---------------------------------------------------------- */

const TF_CORE = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.22.0/+esm";
const TF_CONV = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.22.0/+esm";
const TF_WEBGL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.22.0/+esm";
const TF_DEPTH = "https://cdn.jsdelivr.net/npm/@tensorflow-models/depth-estimation@0.0.3/+esm";

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms)),
  ]);
}

class TrueDepth {
  constructor(estimator) {
    this.estimator = estimator;
    this.canvas = document.createElement("canvas");
    this.canvas.width = DEPTH_W;
    this.canvas.height = DEPTH_H;
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, DEPTH_W, DEPTH_H);
    this.busy = false;
  }

  static async create(onStatus) {
    onStatus("Loading TensorFlow runtime");
    const tf = await withTimeout(import(/* @vite-ignore */ TF_CORE), 25000, "tfjs-core");
    await withTimeout(import(/* @vite-ignore */ TF_CONV), 25000, "tfjs-converter");
    await withTimeout(import(/* @vite-ignore */ TF_WEBGL), 25000, "tfjs-backend-webgl");
    await tf.setBackend("webgl");
    await tf.ready();
    onStatus("Loading portrait depth model");
    const depth = await withTimeout(import(/* @vite-ignore */ TF_DEPTH), 25000, "depth-estimation");
    const estimator = await withTimeout(
      depth.createEstimator(depth.SupportedModels.ARPortraitDepth),
      30000,
      "depth model"
    );
    return new TrueDepth(estimator);
  }

  /** Runs one inference and EMA-blends it into the depth canvas. */
  async update(video, invert) {
    if (this.busy || !video || video.readyState < 2) return;
    this.busy = true;
    try {
      const est = await this.estimator.estimateDepth(video, { minDepth: 0, maxDepth: 1 });
      const src = await est.toCanvasImageSource();
      const ctx = this.canvas.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.45; // temporal EMA — kills monocular flicker
      ctx.filter = invert ? "invert(1)" : "none";
      ctx.drawImage(src, 0, 0, DEPTH_W, DEPTH_H);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
    } finally {
      this.busy = false;
    }
  }

  dispose() {
    try { this.estimator && this.estimator.dispose && this.estimator.dispose(); } catch (e) {}
  }
}

/* ---------------------------------------------------------- */
/* MediaPipe tracking (ripple points + fallback depth)        */
/* ---------------------------------------------------------- */

const VISION_ESM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const HAND_POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const FACE_POINTS = [0, 4, 6, 10, 13, 14, 18, 33, 70, 107, 145, 152, 159, 168, 234, 263, 291, 300, 336, 374, 386, 454];
const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const gray = (v) => {
  const g = Math.round(clamp01(v) * 255);
  return `rgb(${g},${g},${g})`;
};

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
    this.depthCanvas.width = DEPTH_W;
    this.depthCanvas.height = DEPTH_H;
    const ctx = this.depthCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, DEPTH_W, DEPTH_H);
  }

  /* Fallback depth pass, rasterized from landmarks.
     Proximity comes from APPARENT SIZE (face width, wrist→knuckle
     length), so leaning toward the camera raises your z even
     though landmark z alone is only relative-within-part.
     Per-landmark z then adds local relief (nose nearer than jaw,
     fingertips nearer than wrist when pointing at the lens). */
  paintLandmarkDepth(handRes, faceRes) {
    const c = this.depthCanvas;
    const ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    // Fade instead of clear → cheap temporal smoothing.
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.filter = "blur(3px)";
    ctx.globalCompositeOperation = "lighten"; // per-pixel max ≈ nearest wins

    const fl = faceRes && faceRes.faceLandmarks && faceRes.faceLandmarks[0];
    if (fl) {
      const wFace = Math.hypot(fl[454].x - fl[234].x, fl[454].y - fl[234].y);
      const base = clamp01((wFace - 0.10) / 0.35);
      ctx.beginPath();
      FACE_OVAL.forEach((idx, i) => {
        const p = fl[idx];
        if (!p) return;
        const x = p.x * c.width;
        const y = p.y * c.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = gray(base);
      ctx.fill();

      // Nose / brow relief — nearer than the oval base.
      const nose = fl[4];
      if (nose) {
        const r = Math.max(6, wFace * c.width * 0.32);
        const cx = nose.x * c.width;
        const cy = nose.y * c.height;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const v = gray(clamp01(base + 0.10 + (-nose.z) * 0.5));
        g.addColorStop(0, v);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (handRes && handRes.landmarks) {
      handRes.landmarks.forEach((lm) => {
        const w = lm[0], k = lm[9];
        if (!w || !k) return;
        const size = Math.hypot(k.x - w.x, k.y - w.y);
        const base = clamp01((size - 0.05) / 0.22);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(5, size * c.width * 0.55);
        HAND_BONES.forEach(([a, b]) => {
          const pa = lm[a], pb = lm[b];
          if (!pa || !pb) return;
          const zLift = clamp01(base + (-(pa.z + pb.z) * 0.5) * 0.6);
          ctx.strokeStyle = gray(zLift);
          ctx.beginPath();
          ctx.moveTo(pa.x * c.width, pa.y * c.height);
          ctx.lineTo(pb.x * c.width, pb.y * c.height);
          ctx.stroke();
        });
        // Fingertips read slightly nearer — they lead the reach.
        [4, 8, 12, 16, 20].forEach((idx) => {
          const p = lm[idx];
          if (!p) return;
          ctx.fillStyle = gray(clamp01(base + 0.06 + (-p.z) * 0.6));
          ctx.beginPath();
          ctx.arc(p.x * c.width, p.y * c.height, ctx.lineWidth * 0.55, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
  }

  getPoints(video, engine, params, wantLandmarkDepth) {
    const now = performance.now();
    const ts = Math.max(now, this.lastTs + 1);
    this.lastTs = ts;
    this.frame++;

    const pts = [];
    const seen = new Set();

    const push = (key, nx, ny, gain) => {
      const c = engine.mapLandmark(nx, ny, params.mirror);
      if (c.x < -0.05 || c.x > 1.05 || c.y < -0.05 || c.y > 1.05) return;

      const prev = this.prev.get(key);
      let speed = 0;
      if (prev) speed = Math.hypot(c.x - prev.x, c.y - prev.y);
      this.prev.set(key, { x: c.x, y: c.y });
      seen.add(key);

      const s = Math.min(speed * gain, 0.45);
      if (s < 0.004) return;
      pts.push({
        x: c.x,
        y: Math.min(Math.max(c.y, 0.005), 0.995),
        s,
      });
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
            pts.push({
              x: c.x,
              y: Math.min(Math.max(c.y, 0.005), 0.995),
              s: 0.4,
            });
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

    if (wantLandmarkDepth) this.paintLandmarkDepth(handRes, this.lastFace);

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
.cgm-sub { color: #7d8698; font-size: 14px; max-width: 460px; line-height: 1.55; }
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
.cgm-zpip { position: absolute; right: 12px; top: 52px; z-index: 3; width: 160px; height: 120px;
  border: 1px solid rgba(160,175,200,0.3); border-radius: 8px; background: #000;
  image-rendering: pixelated; }
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
.cgm-foot { display: flex; gap: 6px; align-items: center; justify-content: flex-end; flex-wrap: wrap; flex-shrink: 0; }
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
  const zpipRef = useRef(null);
  const videoRef = useRef(null);
  const engineRef = useRef(null);
  const rigRef = useRef(null);
  const trueDepthRef = useRef(null);
  const depthLoopRef = useRef(false);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const pointerRef = useRef(null);
  const recRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | loading | running
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [depthMode, setDepthMode] = useState("none"); // true | landmark | pointer | none
  const [showPanel, setShowPanel] = useState(true);
  const [recording, setRecording] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [zView, setZView] = useState(false);

  const isFallbackRef = useRef(false);
  isFallbackRef.current = isFallback;
  const zViewRef = useRef(false);
  zViewRef.current = zView;
  const depthModeRef = useRef("none");
  depthModeRef.current = depthMode;
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

    const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
    grad.addColorStop(0, "#081426");
    grad.addColorStop(0.5, "#0b2545");
    grad.addColorStop(1, "#03071e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = "rgba(0, 180, 216, 0.15)";
    ctx.lineWidth = 1;
    const grid = 40;
    for (let x = 0; x < c.width; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
    }
    for (let y = 0; y < c.height; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
    }

    ctx.fillStyle = "rgba(0, 180, 216, 0.12)";
    for (let i = 0; i < 3; i++) {
      const cx = c.width * 0.5 + Math.sin(t * 0.5 + i) * c.width * 0.3;
      const cy = c.height * 0.5 + Math.cos(t * 0.7 + i) * c.height * 0.3;
      const r = 80 + Math.sin(t + i) * 20;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    return c;
  };

  const [params, setParams] = useState({
    slice: 0.45,      // the fill line of the tube, in z
    meniscus: 0.10,   // width of the surface-crossing band
    slosh: 0.22,      // how much ripples displace the surface in z
    damp: 0.985,
    handPower: 8.5,
    facePower: 6.0,
    wake: 1.5,
    distort: 0.06,
    spec: 1.0,
    murk: 0.55,       // visibility of the submerged body through the goo
    wet: 0.7,         // chrome coating on freshly-emerged skin
    mirror: 1,
    faceOn: true,
    invertZ: true,    // flip the depth pass if near/far read backwards
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

      // MediaPipe rig: ripple points always, depth fallback if needed.
      try {
        rigRef.current = await createTrackers(setStatus);
      } catch (e) {
        console.warn("MediaPipe unavailable", e);
        rigRef.current = null;
      }

      // True depth model: the star of the show, but optional.
      try {
        trueDepthRef.current = await TrueDepth.create(setStatus);
        setDepthMode("true");
      } catch (e) {
        console.warn("Portrait depth model unavailable, using landmark depth", e);
        trueDepthRef.current = null;
        setDepthMode(rigRef.current ? "landmark" : "pointer");
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
    setDepthMode("pointer");
    setPhase("running");
  }, []);

  const stop = useCallback(() => {
    setPhase("idle");
    setIsFallback(false);
    setRecording(false);
    setDepthMode("none");
    depthLoopRef.current = false;
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
    if (trueDepthRef.current) {
      trueDepthRef.current.dispose();
      trueDepthRef.current = null;
    }
    videoRef.current = null;
  }, []);

  /* True-depth inference loop — independent of the render loop so
     a slow inference never stalls the goo. ~15 Hz + EMA in the
     canvas is plenty; the ripple sim hides the latency. */
  useEffect(() => {
    if (phase !== "running" || !trueDepthRef.current) return;
    depthLoopRef.current = true;
    let cancelled = false;
    (async () => {
      while (depthLoopRef.current && !cancelled) {
        try {
          await trueDepthRef.current.update(videoRef.current, paramsRef.current.invertZ);
        } catch (e) {
          // Model died mid-run → drop to landmark depth for the session.
          console.warn("Depth inference failed, switching to landmark depth", e);
          depthLoopRef.current = false;
          setDepthMode(rigRef.current ? "landmark" : "pointer");
          break;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    })();
    return () => { cancelled = true; depthLoopRef.current = false; };
  }, [phase]);

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

    const getPointerDepthCanvas = () => {
      if (!fallbackDepthCanvasRef.current) {
        const c = document.createElement("canvas");
        c.width = DEPTH_W;
        c.height = DEPTH_H;
        const ictx = c.getContext("2d");
        ictx.fillStyle = "black";
        ictx.fillRect(0, 0, DEPTH_W, DEPTH_H);
        fallbackDepthCanvasRef.current = c;
      }
      const fdc = fallbackDepthCanvasRef.current;
      const fctx = fdc.getContext("2d");
      fctx.fillStyle = "rgba(0,0,0,0.25)";
      fctx.fillRect(0, 0, fdc.width, fdc.height);
      const pr = pointerRef.current;
      if (pr && pr.active && performance.now() - pr.t < 160) {
        const cx = pr.x * fdc.width;
        const cy = (1 - pr.y) * fdc.height;
        const grad = fctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
        grad.addColorStop(0, "rgba(255,255,255,1.0)");
        grad.addColorStop(1, "rgba(255,255,255,0.0)");
        fctx.fillStyle = grad;
        fctx.beginPath();
        fctx.arc(cx, cy, 34, 0, Math.PI * 2);
        fctx.fill();
      }
      return fdc;
    };

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const isFb = isFallbackRef.current;
      const video = isFb ? getFallbackCanvas() : videoRef.current;
      if (!video) return;
      if (video instanceof HTMLVideoElement && video.readyState < 2) return;
      const p = paramsRef.current;
      const mode = depthModeRef.current;

      const pts = rigRef.current
        ? rigRef.current.getPoints(video, engine, p, mode === "landmark")
        : [];

      // pointer splats — always on, and the whole story when tracking is off
      const pr = pointerRef.current;
      if (pr && pr.active && performance.now() - pr.t < 120) {
        const s = Math.min(pr.speed * 9, 0.4);
        if (s > 0.004) {
          pts.push({
            x: pr.x,
            y: Math.min(Math.max(pr.y, 0.005), 0.995),
            s,
          });
        }
      }

      let depthCanvas;
      if (mode === "true" && trueDepthRef.current) {
        depthCanvas = trueDepthRef.current.canvas;
      } else if (mode === "landmark" && rigRef.current) {
        depthCanvas = rigRef.current.depthCanvas;
      } else {
        depthCanvas = getPointerDepthCanvas();
      }

      engine.render(video, depthCanvas, pts, p);

      if (zViewRef.current && zpipRef.current) {
        const zc = zpipRef.current.getContext("2d");
        zc.drawImage(depthCanvas, 0, 0, zpipRef.current.width, zpipRef.current.height);
      }
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

  const modeLabel =
    depthMode === "true" ? "Z: portrait depth model"
    : depthMode === "landmark" ? "Z: landmark estimate"
    : depthMode === "pointer" ? "Z: pointer blob — move to surface"
    : "";

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
            You're sealed in a tube of liquid black chrome. A live depth pass
            decides what breaks the surface — lean in and your face rises out
            of the goo, reach forward and only your hands emerge. Sweep the Z
            level to drain the tube in depth order.
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
          <div className="cgm-note">{modeLabel}</div>
          <button className="cgm-toggle" onClick={() => setShowPanel((s) => !s)}>
            {showPanel ? "Hide controls" : "Controls"}
          </button>
          {zView && <canvas ref={zpipRef} className="cgm-zpip" width={160} height={120} />}
          {showPanel && (
            <div className="cgm-panel">
              <div className="cgm-controls-grid">
                <Slider label="Z level" value={params.slice} min={0.05} max={0.95} step={0.01}
                  onChange={set("slice")} fmt={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Meniscus" value={params.meniscus} min={0.02} max={0.30} step={0.01}
                  onChange={set("meniscus")} fmt={(v) => v.toFixed(2)} />
                <Slider label="Slosh" value={params.slosh} min={0} max={0.6} step={0.02}
                  onChange={set("slosh")} fmt={(v) => v.toFixed(2)} />
                <Slider label="Viscosity" value={params.damp} min={0.9} max={0.997} step={0.001}
                  onChange={set("damp")} fmt={(v) => (1 - v).toFixed(3)} />
                <Slider label="Hand stir" value={params.handPower} min={0} max={16} step={0.5}
                  onChange={set("handPower")} fmt={(v) => v.toFixed(1)} />
                <Slider label="Face stir" value={params.facePower} min={0} max={10} step={0.5}
                  onChange={set("facePower")} fmt={(v) => v.toFixed(1)} />
                <Slider label="Body wake" value={params.wake} min={0} max={4} step={0.1}
                  onChange={set("wake")} fmt={(v) => v.toFixed(1)} />
                <Slider label="Warp" value={params.distort} min={0} max={0.15} step={0.005}
                  onChange={set("distort")} fmt={(v) => v.toFixed(2)} />
                <Slider label="Shine" value={params.spec} min={0} max={2} step={0.05}
                  onChange={set("spec")} fmt={(v) => v.toFixed(2)} />
                <Slider label="Murk" value={params.murk} min={0} max={1} step={0.05}
                  onChange={set("murk")} fmt={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Wet coat" value={params.wet} min={0} max={1} step={0.05}
                  onChange={set("wet")} fmt={(v) => `${Math.round(v * 100)}%`} />
              </div>
              <div className="cgm-foot">
                <button className="cgm-btn" style={{ opacity: params.faceOn ? 1 : 0.5 }}
                  onClick={() => set("faceOn")(!params.faceOn)}>Face</button>
                <button className="cgm-btn" style={{ opacity: params.mirror ? 1 : 0.5 }}
                  onClick={() => set("mirror")(params.mirror ? 0 : 1)}>Mirror</button>
                <button className="cgm-btn" style={{ opacity: params.invertZ ? 1 : 0.5 }}
                  onClick={() => set("invertZ")(!params.invertZ)}>Flip Z</button>
                <button className="cgm-btn" style={{ opacity: zView ? 1 : 0.5 }}
                  onClick={() => setZView((z) => !z)}>Z pass</button>
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
