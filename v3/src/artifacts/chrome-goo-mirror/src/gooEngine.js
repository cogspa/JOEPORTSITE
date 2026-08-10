/* ============================================================
   GooEngine — WebGL black chrome liquid
   Two passes:
     1) Ripple height-field sim (ping-pong RGBA8 FBO).
        Energy sources:
          a) up to 24 landmark splat points (MediaPipe hands/face,
             velocity-scaled Gaussians)
          b) optional frame-difference "body wake" sampled at the
             reflected video coordinate
     2) Composite: raw video above the (wobbling) waterline,
        distorted mirrored reflection below, shaded as black
        chrome with anisotropic specular + chromatic split.
   ============================================================ */

export const MAX_POINTS = 24;

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
uniform vec3  uPts[${MAX_POINTS}]; // x, y (canvas uv), strength
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
    // ---- landmark splats (fingertips, palms, face points) ----
    for (int i = 0; i < ${MAX_POINTS}; i++){
      if (i >= uNum) break;
      vec2 d = vUv - uPts[i].xy;
      d.x *= uAspect;
      float g = exp(-dot(d, d) / 0.0011);
      next += uPts[i].z * g;
    }

    // ---- frame-difference body wake ----
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

  vec2 rc   = vec2(vUv.x, 2.0 * wLine - vUv.y);
  vec2 base = rc + n.xy * uDistort;

  float rr = texture2D(uVideo, vidUV(base + n.xy * 0.007)).r;
  float gg = texture2D(uVideo, vidUV(base)).g;
  float bb = texture2D(uVideo, vidUV(base - n.xy * 0.007)).b;
  vec3 refl = vec3(rr, gg, bb);

  float lum = dot(refl, vec3(0.299, 0.587, 0.114));
  vec3 chrome = pow(lum, 1.8) * vec3(0.40, 0.46, 0.56);

  vec3 L  = normalize(vec3(0.25, 0.9, 0.5));
  vec3 hv = normalize(L + vec3(0.0, 0.0, 1.0));
  vec3 nA = normalize(vec3(n.x * 0.35, n.y, n.z));
  float spec  = pow(max(dot(nA, hv), 0.0), 90.0);
  float sheen = pow(max(dot(n,  hv), 0.0), 16.0);
  vec3 col = chrome + (spec * 1.25 + sheen * 0.14) * uSpec * vec3(0.85, 0.92, 1.0);

  float depth = clamp((wLine - vUv.y) / max(wLine, 0.001), 0.0, 1.0);
  col *= mix(1.0, 0.28, pow(depth, 0.8));

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
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s));
  }
  return s;
}
function link(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p));
  }
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

export class GooEngine {
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
    };

    this.rippleTex = [null, null];
    this.rippleFbo = [null, null];
    this.rippleIdx = 0;
    this.vidTex = [makeTex(gl, 2, 2), makeTex(gl, 2, 2)];
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

  /** MediaPipe normalized landmark (x right, y DOWN, video space) → canvas uv (y up). */
  mapLandmark(nx, nyDown, mirror) {
    const [fx, fy] = this.lastFit;
    const vyUp = 1 - nyDown;
    const mx = (nx - 0.5) / fx + 0.5;
    const cy = (vyUp - 0.5) / fy + 0.5;
    const cx = mirror ? 1 - mx : mx;
    return { x: cx, y: cy };
  }

  /**
   * @param video   HTMLVideoElement (readyState >= 2)
   * @param pts     array of {x, y, s} in canvas uv, y up, already inside the goo
   * @param params  { water, damp, wake, distort, spec, mirror }
   */
  render(video, pts, params) {
    const { gl, canvas } = this;
    if (!this.simW) return;

    const curVid = this.vidIdx;
    const prevVid = 1 - this.vidIdx;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.vidTex[curVid]);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (e) {
      return;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const va = video.videoWidth / video.videoHeight;
    const ca = canvas.width / canvas.height;
    const fit = ca > va ? [1, va / ca] : [ca / va, 1];
    this.lastFit = fit;

    const n = Math.min(pts.length, MAX_POINTS);
    for (let i = 0; i < n; i++) {
      this.ptsFlat[i * 3] = pts[i].x;
      this.ptsFlat[i * 3 + 1] = pts[i].y;
      this.ptsFlat[i * 3 + 2] = pts[i].s;
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
      gl.uniform1i(this.simU.num, 0); // splats only on the first sub-step
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(this.compProg);
    gl.uniform1i(this.compU.ripple, 0);
    gl.uniform1i(this.compU.video, 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.rippleTex[this.rippleIdx]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.vidTex[curVid]);
    gl.uniform2f(this.compU.simTexel, 1 / this.simW, 1 / this.simH);
    gl.uniform1f(this.compU.water, params.water);
    gl.uniform1f(this.compU.mirror, params.mirror);
    gl.uniform1f(this.compU.distort, params.distort);
    gl.uniform1f(this.compU.spec, params.spec);
    gl.uniform1f(this.compU.time, (performance.now() - this.t0) / 1000);
    gl.uniform2f(this.compU.fit, fit[0], fit[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.vidIdx = prevVid;
  }

  dispose() {
    const { gl } = this;
    this.rippleTex.forEach((t) => t && gl.deleteTexture(t));
    this.rippleFbo.forEach((f) => f && gl.deleteFramebuffer(f));
    this.vidTex.forEach((t) => gl.deleteTexture(t));
  }
}
