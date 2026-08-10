# Chrome Goo Mirror — MediaPipe edition

Webcam mirror where your body appears half-submerged in liquid black chrome.
True hand + face landmark tracking (MediaPipe Tasks Vision) drives a GPU
ripple simulation: fingertips stir the goo with velocity-scaled splats,
pinching fires a splash burst, and a frame-difference "body wake" catches
everything the skeleton tracker doesn't.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173, click **Enter the goo**, allow the camera.
Camera access works on `localhost` without HTTPS; any other host needs HTTPS.

First launch downloads the MediaPipe WASM runtime and two models
(hand ~7 MB, face ~3 MB) from Google's CDN, then they're cached.

## How the tracking feeds the goo

| Source | Landmarks | Behavior |
|---|---|---|
| HandLandmarker (2 hands) | wrist + 5 fingertips each | per-landmark velocity → Gaussian splat strength; faster movement = bigger waves |
| Pinch gesture | thumb tip ↔ index tip < 0.05 | one-shot splash burst at the pinch point |
| FaceLandmarker | nose, chin, both cheeks | head movement stirs the surface (runs every 2nd frame) |
| Body wake | whole frame | GPU frame-differencing sampled at the reflected coordinate — torso/arm motion leaves a wake |

Points above the waterline are reflected down to where their mirror image
lands in the goo; points that dip below the line stir it directly.

## Rendering

- Ping-pong RGBA8 height-field wave sim (320 × N, 2 substeps/frame)
- Composite shader: video above the wobbling waterline; below it, the
  mirrored reflection warped by ripple normals, crushed to black chrome
  with anisotropic specular streaks, chromatic split, meniscus glow,
  and depth fade
- Plain WebGL1, no three.js — runs comfortably at 60 fps on integrated GPUs

## Controls

| Control | What it does |
|---|---|
| Goo level | Where the surface sits (waterline height) |
| Hand power | Fingertip velocity → ripple gain |
| Face power | Head movement → ripple gain |
| Body wake | Frame-difference injection strength (0 = landmarks only) |
| Viscosity | Wave damping — low = thick mercury, high = watery |
| Warp | Reflection distortion amount |
| Shine | Specular intensity |
| Face / Mirror | Toggle face tracking / selfie mirroring |

## Files

```
src/gooEngine.js   WebGL engine: sim + composite shaders, ping-pong FBOs
src/tracking.js    MediaPipe wrapper: landmark → velocity → splat points
src/App.jsx        Camera lifecycle, RAF loop, control panel
```

See PROMPTS.md for ready-to-paste prompts to extend this in Cursor / Claude Code.
