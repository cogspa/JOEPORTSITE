# IDE-ready prompts

Copy-paste into Claude Code / Cursor from the project root. Each is scoped
to the existing architecture (gooEngine.js / tracking.js / App.jsx).

## Record a performance to video

```
Add recording to App.jsx: a Record button in the panel that captures
canvasRef via canvas.captureStream(60) into a MediaRecorder
(video/webm;codecs=vp9, fall back to vp8), shows elapsed time while
recording, and on stop downloads the file as chrome-goo-<timestamp>.webm.
Don't touch the render loop; keep the button styled like the existing
.small-btn class.
```

## Gold goo variant

```
In src/gooEngine.js COMP_FRAG, add a uniform float uGold (0-1) that
lerps the goo between the current cool black chrome and a dark liquid
gold: chrome tint toward vec3(0.62, 0.45, 0.18), specular toward
vec3(1.0, 0.85, 0.55), and warm up the crest-glow color. Wire it to a
"Gold" slider in App.jsx and pass it through engine.render params.
```

## Open-palm shockwave gesture

```
In src/tracking.js, detect an open-palm "push": all five fingertips
extended (tip further from wrist than PIP joints) AND palm z decreasing
fast (moving toward camera). When triggered, emit a ring of 8 splat
points around the palm's reflected position with strength 0.3 and
a 500ms cooldown per hand. Keep the existing pinch splash.
```

## Objects floating on the surface

```
Add a floaters system: 6 small chrome spheres (drawn as radial-gradient
sprites in a 2D overlay canvas positioned above the WebGL canvas) that
sit on the waterline, bob with the ripple height sampled via
gl.readPixels of a 1px row once per frame (or estimate from injection
points), and get pushed sideways by nearby splats. Keep it under 60
lines and don't slow the main loop.
```

## Deploy

```
Add a netlify.toml for this Vite app (build command "npm run build",
publish "dist") and confirm the MediaPipe CDN URLs work from a
production HTTPS origin. Note anything needing a CORS or COEP header.
```
