import React, { useRef, useEffect, useState, useCallback } from "react";
import { GooEngine } from "./gooEngine.js";
import { createTrackers } from "./tracking.js";

export default function App() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const engineRef = useRef(null);
  const rigRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);

  const [phase, setPhase] = useState("idle"); // idle | loading | running
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showPanel, setShowPanel] = useState(true);

  const [params, setParams] = useState({
    water: 0.5,
    handPower: 6.0,   // fingertip velocity → ripple strength
    facePower: 3.5,
    wake: 1.2,        // frame-diff body wake
    damp: 0.985,
    distort: 0.06,
    spec: 1.0,
    mirror: 1,
    faceOn: true,
  });
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const set = (k) => (v) => setParams((p) => ({ ...p, [k]: v }));

  const start = useCallback(async () => {
    setError("");
    setPhase("loading");
    try {
      setStatus("Requesting camera…");
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

      rigRef.current = await createTrackers(setStatus);
      setPhase("running");
    } catch (e) {
      console.error(e);
      setError(
        e.name === "NotAllowedError"
          ? "Camera permission denied. Allow camera access and try again."
          : `Startup failed: ${e.message || e}`
      );
      setPhase("idle");
    }
  }, []);

  const stop = useCallback(() => {
    setPhase("idle");
    cancelAnimationFrame(rafRef.current);
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
      setError("WebGL not available in this browser.");
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
      const video = videoRef.current;
      const rig = rigRef.current;
      if (!video || video.readyState < 2 || !rig) return;
      const p = paramsRef.current;
      const pts = rig.getPoints(video, engine, p);
      engine.render(video, pts, p);
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

  const Slider = ({ label, value, min, max, step, onChange, fmt }) => (
    <label className="slider-row">
      <span className="slider-label">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="slider-val">{fmt ? fmt(value) : value}</span>
    </label>
  );

  return (
    <div ref={wrapRef} className="wrap">
      <canvas ref={canvasRef} className="stage" />

      {phase !== "running" && (
        <div className="overlay">
          <div className="title">CHROME&nbsp;GOO</div>
          <div className="subtitle">
            Hand + face landmark tracking, MediaPipe edition. Fingertips stir
            the goo, pinch to splash, and everything you do above the surface
            echoes in black chrome below it.
          </div>
          {phase === "idle" ? (
            <button className="start-btn" onClick={start}>Enter the goo</button>
          ) : (
            <div className="status">{status}</div>
          )}
          {error && <div className="error">{error}</div>}
        </div>
      )}

      {phase === "running" && (
        <>
          <button className="panel-toggle" onClick={() => setShowPanel((s) => !s)}>
            {showPanel ? "Hide controls" : "Controls"}
          </button>
          {showPanel && (
            <div className="panel">
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
              <div className="panel-foot">
                <button
                  className="small-btn"
                  style={{ opacity: params.faceOn ? 1 : 0.5 }}
                  onClick={() => set("faceOn")(!params.faceOn)}
                >Face</button>
                <button
                  className="small-btn"
                  style={{ opacity: params.mirror ? 1 : 0.5 }}
                  onClick={() => set("mirror")(params.mirror ? 0 : 1)}
                >Mirror</button>
                <button className="small-btn" onClick={stop}>Stop</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
