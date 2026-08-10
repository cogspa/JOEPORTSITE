/* ============================================================
   tracking.js — MediaPipe HandLandmarker + FaceLandmarker
   Turns landmarks into velocity-scaled ripple injection points.
   Pinching (thumb tip → index tip) fires a splash burst.
   ============================================================ */

import { FilesetResolver, HandLandmarker, FaceLandmarker } from "@mediapipe/tasks-vision";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// Landmarks we stir the goo with
const HAND_POINTS = [0, 4, 8, 12, 16, 20];   // wrist + all five fingertips
const FACE_POINTS = [1, 152, 234, 454];       // nose tip, chin, left/right cheek

export async function createTrackers(onStatus = () => {}) {
  onStatus("Loading vision runtime…");
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);

  onStatus("Loading hand model…");
  const hands = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: HAND_MODEL, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: 2,
  });

  onStatus("Loading face model…");
  const face = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
    runningMode: "VIDEO",
    numFaces: 1,
  });

  return new TrackerRig(hands, face);
}

export class TrackerRig {
  constructor(hands, face) {
    this.hands = hands;
    this.face = face;
    this.prev = new Map();      // key → {x, y}
    this.pinched = [false, false];
    this.frame = 0;
    this.lastFace = null;
    this.lastTs = 0;
  }

  /**
   * Detect on the current video frame and return ripple injection
   * points in CANVAS uv space (y up), already reflected into the goo.
   *
   * @param video      HTMLVideoElement
   * @param engine     GooEngine (for landmark → canvas mapping)
   * @param params     { water, mirror, handPower, facePower, faceOn }
   * @returns          array of {x, y, s}
   */
  getPoints(video, engine, params) {
    const now = performance.now();
    const ts = Math.max(now, this.lastTs + 1); // monotonically increasing
    this.lastTs = ts;
    this.frame++;

    const pts = [];
    const seen = new Set();

    const push = (key, nx, ny, gain) => {
      const c = engine.mapLandmark(nx, ny, params.mirror);
      if (c.x < -0.05 || c.x > 1.05) return;

      // per-landmark velocity in canvas space
      const prev = this.prev.get(key);
      let speed = 0;
      if (prev) speed = Math.hypot(c.x - prev.x, c.y - prev.y);
      this.prev.set(key, { x: c.x, y: c.y });
      seen.add(key);

      const s = Math.min(speed * gain, 0.45);
      if (s < 0.004) return;

      // reflect points above the surface down into the goo;
      // points already below the line stir it directly
      const W = params.water;
      let gy = c.y > W ? 2 * W - c.y : c.y;
      if (gy < -0.05) return;
      gy = Math.min(Math.max(gy, 0.005), W - 0.004);
      pts.push({ x: c.x, y: gy, s });
    };

    // ---- hands: every frame ----
    let handRes = null;
    try {
      handRes = this.hands.detectForVideo(video, ts);
    } catch (e) { /* skip frame */ }

    if (handRes && handRes.landmarks) {
      handRes.landmarks.forEach((lm, hi) => {
        HAND_POINTS.forEach((idx) => {
          const p = lm[idx];
          push(`h${hi}-${idx}`, p.x, p.y, params.handPower);
        });

        // pinch → splash burst at the pinch midpoint
        const t = lm[4], i8 = lm[8];
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
      });
    }

    // ---- face: every other frame (cheaper), reuse last result between ----
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

    // drop stale velocity entries (hand left frame)
    for (const key of this.prev.keys()) {
      if (!seen.has(key)) this.prev.delete(key);
    }

    return pts;
  }

  dispose() {
    try { this.hands.close(); } catch (e) {}
    try { this.face.close(); } catch (e) {}
  }
}
