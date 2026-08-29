# COGSPA — Project Codebase

This document contains the full packed representation of the COGSPA repository.

## File Summary

This file contains a packed representation of the entire repository's contents, designed to be easily consumable for analysis, code review, or other automated processes.

### Format

The content is organized as follows:
1. Summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each with file path and full contents

### Notes

- Some files may have been excluded based on `.gitignore` rules
- Binary files are not included
- Files are sorted by Git change count (files with more changes are at the bottom)

---

## Directory Structure

```
.emergent/
  emergent.yml
backend/
  requirements.txt
  server.py
frontend/
  plugins/
    health-check/
      health-endpoints.js
      webpack-health-plugin.js
  public/
    index.html
  src/
    components/
      site/
        About.jsx
        ApproachCraft.jsx
        CommunityChat.jsx
        DarkContext.jsx
        Footer.jsx
        ForAgencies.jsx
        HeroVideo.jsx
        LatestRelease.jsx
        Partners.jsx
        Pillars.jsx
        Process.jsx
        StartCTA.jsx
        Stats.jsx
        Testimonials.jsx
        TopNav.jsx
      ui/
        [shadcn/ui primitives]
    hooks/
      use-toast.js
    lib/
      utils.js
    pages/
      Home.jsx
    App.css
    App.js
    index.css
    index.js
  .gitignore
  components.json
  craco.config.js
  jsconfig.json
  package.json
  postcss.config.js
  README.md
  tailwind.config.js
memory/
  PRD.md
test_reports/
  iteration_1.json
.gitconfig
.gitignore
README.md
test_result.md
```

---

## Backend

### `backend/requirements.txt`

```
fastapi==0.110.1
uvicorn==0.25.0
boto3>=1.34.129
requests-oauthlib>=2.0.0
cryptography>=42.0.8
python-dotenv>=1.0.1
pymongo==4.5.0
pydantic>=2.6.4
email-validator>=2.2.0
pyjwt>=2.10.1
bcrypt==4.1.3
passlib>=1.7.4
tzdata>=2024.2
motor==3.3.1
pytest>=8.0.0
black>=24.1.1
isort>=5.13.2
flake8>=7.0.0
mypy>=1.8.0
python-jose>=3.3.0
requests>=2.31.0
pandas>=2.2.0
numpy>=1.26.0
python-multipart>=0.0.9
jq>=1.6.0
typer>=0.9.0
emergentintegrations==0.1.0
```

### `backend/server.py`

```python
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
```

---

## Frontend — Health Check Plugin

### `frontend/plugins/health-check/health-endpoints.js`

```javascript
// health-endpoints.js
// API endpoints for health checks and monitoring

const os = require('os');

const SERVER_START_TIME = Date.now();

/**
 * Setup health check endpoints on the dev server
 * @param {Object} devServer - Webpack dev server instance
 * @param {Object} healthPlugin - Instance of WebpackHealthPlugin
 */
function setupHealthEndpoints(devServer, healthPlugin) {
  if (!devServer || !devServer.app) {
    console.warn('[Health Check] Dev server not available, skipping health endpoints');
    return;
  }

  if (!healthPlugin) {
    console.warn('[Health Check] Health plugin not provided, skipping health endpoints');
    return;
  }

  console.log('[Health Check] Setting up health endpoints...');

  // GET /health - Detailed health status (JSON)
  devServer.app.get("/health", (req, res) => {
    const webpackStatus = healthPlugin.getStatus();
    const uptime = Date.now() - SERVER_START_TIME;
    const memUsage = process.memoryUsage();

    res.json({
      status: webpackStatus.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime / 1000),
        formatted: formatDuration(uptime),
      },
      webpack: {
        state: webpackStatus.state,
        isHealthy: webpackStatus.isHealthy,
        hasCompiled: webpackStatus.hasCompiled,
        errors: webpackStatus.errorCount,
        warnings: webpackStatus.warningCount,
        lastCompileTime: webpackStatus.lastCompileTime
          ? new Date(webpackStatus.lastCompileTime).toISOString()
          : null,
        lastSuccessTime: webpackStatus.lastSuccessTime
          ? new Date(webpackStatus.lastSuccessTime).toISOString()
          : null,
        compileDuration: webpackStatus.compileDuration
          ? `${webpackStatus.compileDuration}ms`
          : null,
        totalCompiles: webpackStatus.totalCompiles,
        firstCompileTime: webpackStatus.firstCompileTime
          ? new Date(webpackStatus.firstCompileTime).toISOString()
          : null,
      },
      server: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        memory: {
          heapUsed: formatBytes(memUsage.heapUsed),
          heapTotal: formatBytes(memUsage.heapTotal),
          rss: formatBytes(memUsage.rss),
          external: formatBytes(memUsage.external),
        },
        systemMemory: {
          total: formatBytes(os.totalmem()),
          free: formatBytes(os.freemem()),
          used: formatBytes(os.totalmem() - os.freemem()),
        },
      },
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // GET /health/simple - Simple text response (OK/COMPILING/ERROR)
  devServer.app.get("/health/simple", (req, res) => {
    const webpackStatus = healthPlugin.getSimpleStatus();

    if (webpackStatus.state === 'success') {
      res.status(200).send('OK');
    } else if (webpackStatus.state === 'compiling') {
      res.status(200).send('COMPILING');
    } else if (webpackStatus.state === 'idle') {
      res.status(200).send('IDLE');
    } else {
      res.status(503).send('ERROR');
    }
  });

  // GET /health/ready - Readiness check (Kubernetes/load balancer)
  devServer.app.get("/health/ready", (req, res) => {
    const webpackStatus = healthPlugin.getSimpleStatus();

    if (webpackStatus.state === 'success') {
      res.status(200).json({
        ready: true,
        state: webpackStatus.state,
      });
    } else {
      res.status(503).json({
        ready: false,
        state: webpackStatus.state,
        reason: webpackStatus.state === 'compiling'
          ? 'Compilation in progress'
          : 'Compilation failed',
      });
    }
  });

  // GET /health/live - Liveness check (Kubernetes)
  devServer.app.get("/health/live", (req, res) => {
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
    });
  });

  // GET /health/errors - Get current errors and warnings
  devServer.app.get("/health/errors", (req, res) => {
    const webpackStatus = healthPlugin.getStatus();

    res.json({
      errorCount: webpackStatus.errorCount,
      warningCount: webpackStatus.warningCount,
      errors: webpackStatus.errors,
      warnings: webpackStatus.warnings,
      state: webpackStatus.state,
    });
  });

  // GET /health/stats - Compilation statistics
  devServer.app.get("/health/stats", (req, res) => {
    const webpackStatus = healthPlugin.getStatus();
    const uptime = Date.now() - SERVER_START_TIME;

    res.json({
      totalCompiles: webpackStatus.totalCompiles,
      averageCompileTime: webpackStatus.totalCompiles > 0
        ? `${Math.round(uptime / webpackStatus.totalCompiles)}ms`
        : null,
      lastCompileDuration: webpackStatus.compileDuration
        ? `${webpackStatus.compileDuration}ms`
        : null,
      firstCompileTime: webpackStatus.firstCompileTime
        ? new Date(webpackStatus.firstCompileTime).toISOString()
        : null,
      serverUptime: formatDuration(uptime),
    });
  });

  console.log('[Health Check] ✓ Health endpoints ready');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = setupHealthEndpoints;
```

### `frontend/plugins/health-check/webpack-health-plugin.js`

```javascript
// webpack-health-plugin.js
// Webpack plugin that tracks compilation state and health metrics

class WebpackHealthPlugin {
  constructor() {
    this.status = {
      state: 'idle',
      errors: [],
      warnings: [],
      lastCompileTime: null,
      lastSuccessTime: null,
      compileDuration: 0,
      totalCompiles: 0,
      firstCompileTime: null,
    };
  }

  apply(compiler) {
    const pluginName = 'WebpackHealthPlugin';

    compiler.hooks.compile.tap(pluginName, () => {
      const now = Date.now();
      this.status.state = 'compiling';
      this.status.lastCompileTime = now;

      if (!this.status.firstCompileTime) {
        this.status.firstCompileTime = now;
      }
    });

    compiler.hooks.done.tap(pluginName, (stats) => {
      const info = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
      });

      this.status.totalCompiles++;
      this.status.compileDuration = Date.now() - this.status.lastCompileTime;

      if (stats.hasErrors()) {
        this.status.state = 'failed';
        this.status.errors = info.errors.map(err => ({
          message: err.message || String(err),
          stack: err.stack,
          moduleName: err.moduleName,
          loc: err.loc,
        }));
      } else {
        this.status.state = 'success';
        this.status.lastSuccessTime = Date.now();
        this.status.errors = [];
      }

      if (stats.hasWarnings()) {
        this.status.warnings = info.warnings.map(warn => ({
          message: warn.message || String(warn),
          moduleName: warn.moduleName,
          loc: warn.loc,
        }));
      } else {
        this.status.warnings = [];
      }
    });

    compiler.hooks.failed.tap(pluginName, (error) => {
      this.status.state = 'failed';
      this.status.errors = [{
        message: error.message,
        stack: error.stack,
      }];
      this.status.compileDuration = Date.now() - this.status.lastCompileTime;
    });

    compiler.hooks.invalid.tap(pluginName, () => {
      this.status.state = 'compiling';
    });
  }

  getStatus() {
    return {
      ...this.status,
      isHealthy: this.status.state === 'success',
      errorCount: this.status.errors.length,
      warningCount: this.status.warnings.length,
      hasCompiled: this.status.totalCompiles > 0,
    };
  }

  getSimpleStatus() {
    return {
      state: this.status.state,
      isHealthy: this.status.state === 'success',
      errorCount: this.status.errors.length,
      warningCount: this.status.warnings.length,
    };
  }

  reset() {
    this.status = {
      state: 'idle',
      errors: [],
      warnings: [],
      lastCompileTime: null,
      lastSuccessTime: null,
      compileDuration: 0,
      totalCompiles: 0,
      firstCompileTime: null,
    };
  }
}

module.exports = WebpackHealthPlugin;
```

---

## Frontend — Site Components

### `frontend/src/components/site/HeroVideo.jsx`

```jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";

const VIDEO_SRC_MP4 = "/media/headspin.mp4";
const VIDEO_SRC_WEBM = "/media/headspin.webm";

const CUE_POINTS = [
  {
    time: 0.05,
    eyebrow: "01 — Open",
    titleLead: "Calm where ",
    titleAccent: "creative chaos",
    titleTail: " usually lives.",
    sub: "COGSPA is the operating layer for studios that move fast without losing the craft. Briefs, reviews and shipping in one quiet surface.",
  },
  {
    time: 1.2,
    eyebrow: "02 — Capture",
    titleLead: "Every brief lands ",
    titleAccent: "shaped",
    titleTail: ".",
    sub: "Inputs, references and decisions enter as living documents. Nothing important hides in a chat thread again.",
  },
  {
    time: 2.4,
    eyebrow: "03 — Cohere",
    titleLead: "Reviews stop ",
    titleAccent: "fragmenting",
    titleTail: ".",
    sub: "One canvas for craft notes, time-stamped feedback and resolved threads — wired to the artifact, not a parallel inbox.",
  },
  {
    time: 3.6,
    eyebrow: "04 — Cadence",
    titleLead: "Cadence finds ",
    titleAccent: "itself",
    titleTail: ".",
    sub: "Operations runs underneath the studio, not on top of the makers. Fewer status meetings, more shipped work.",
  },
  {
    time: 4.8,
    eyebrow: "05 — Ship",
    titleLead: "Make work that ",
    titleAccent: "matters",
    titleTail: ", on time.",
    sub: "Twelve hundred creative teams already shipping their best quarters with COGSPA.",
  },
];

const lerp = (a, b, t) => a + (b - a) * t;

export default function HeroVideo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const targetTimeRef = useRef(CUE_POINTS[0].time);
  const rafRef = useRef(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Reduced-motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const update = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Prime video for iOS Safari
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    let cancelled = false;

    const prime = async () => {
      try {
        await v.play();
        v.pause();
        v.currentTime = CUE_POINTS[0].time;
      } catch {
        try {
          v.currentTime = CUE_POINTS[0].time;
        } catch {}
      }
      if (!cancelled) setVideoReady(true);
    };

    const onMeta = () => {
      if (!cancelled) prime();
    };
    const onError = () => {
      if (!cancelled) setVideoReady(false);
    };

    if (v.readyState >= 1) {
      prime();
    } else {
      v.addEventListener("loadedmetadata", onMeta, { once: true });
      v.addEventListener("error", onError, { once: true });
    }

    return () => {
      cancelled = true;
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("error", onError);
    };
  }, []);

  // Scroll → step + progress
  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const passed = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? passed / total : 0;
    setProgress(p);

    const idx = Math.min(
      CUE_POINTS.length - 1,
      Math.max(0, Math.round(p * (CUE_POINTS.length - 1)))
    );
    setStepIndex(idx);
    targetTimeRef.current = CUE_POINTS[idx].time;
  }, []);

  // Smooth seek loop
  useEffect(() => {
    const tick = () => {
      const v = videoRef.current;
      if (v && videoReady) {
        const target = targetTimeRef.current;
        const cur = v.currentTime;
        const diff = target - cur;
        if (reducedMotion) {
          if (Math.abs(diff) > 0.01) v.currentTime = target;
        } else if (Math.abs(diff) > 0.004) {
          v.currentTime = lerp(cur, target, 0.16);
        } else if (Math.abs(diff) > 0) {
          v.currentTime = target;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion, videoReady]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  const cue = CUE_POINTS[stepIndex];

  return (
    <section
      ref={sectionRef}
      id="top"
      className="hero-wrap"
      data-testid="hero-video-section"
    >
      <div className="hero-sticky">
        <video
          ref={videoRef}
          className="hero-video"
          muted
          playsInline
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
          data-testid="hero-video"
        >
          <source src={VIDEO_SRC_WEBM} type="video/webm" />
          <source src={VIDEO_SRC_MP4} type="video/mp4" />
        </video>
        <div className="hero-tint" />
        <div className="hero-vignette" />

        <div className="relative z-10 h-full w-full">
          <div className="grid grid-cols-12 gap-6 px-5 md:px-10 lg:px-14 h-full pt-28 md:pt-32 pb-16">
            <div className="col-span-12 md:col-span-7 lg:col-span-7 flex flex-col justify-end">
              <div className="max-w-[640px]">
                <div
                  key={`eyebrow-${stepIndex}`}
                  className="cue-state cue-active inline-flex items-center gap-3 mb-6"
                >
                  <span className="font-mono-cap text-white/75 px-2.5 py-1 rounded-full">
                    {cue.eyebrow}
                  </span>
                  <span className="font-mono-cap text-white/40">
                    Cogspa · scroll-led
                  </span>
                </div>

                <h1
                  key={`title-${stepIndex}`}
                  className="cue-state cue-active font-display text-white"
                >
                  {cue.titleLead}
                  <span className="italic-display">{cue.titleAccent}</span>
                  {cue.titleTail}
                </h1>

                <p
                  key={`sub-${stepIndex}`}
                  className="cue-state cue-active mt-6 max-w-[480px] text-white/70"
                >
                  {cue.sub}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### `frontend/src/components/site/TopNav.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Changelog", href: "#changelog" },
];

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-start justify-between gap-3 px-5 md:px-8 pt-5 md:pt-6">
        <a href="#top" className="pointer-events-auto flex items-center gap-2.5 group">
          <span className="flex items-center justify-center h-8 w-8 rounded-full text-white">
            <Plus strokeWidth={1.5} className="h-4 w-4" />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-[15px] font-display tracking-tight text-white">COGSPA</span>
            <span className="font-mono-cap text-white/55">Studio · operating system</span>
          </span>
        </a>

        <nav className="pointer-events-auto hidden md:flex items-center gap-1.5 rounded-full px-2 py-1.5">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="px-3.5 py-1.5 rounded-full text-[13px] text-white/85">
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#start" className="pointer-events-auto pill pill-light">
          Start free
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#0a0a0a] text-white">
            <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
          </span>
        </a>
      </div>
    </header>
  );
}
```

### `frontend/src/components/site/DarkContext.jsx`

Audience headline + studio-moment section with right rail. Dark background with radial glow.

### `frontend/src/components/site/Pillars.jsx`

Four numbered modules (Briefs, Review, Production, Reporting) presented as cards in a 2-column grid.

### `frontend/src/components/site/Partners.jsx`

17 partner studio names rendered as text logos in a responsive grid.

### `frontend/src/components/site/LatestRelease.jsx`

Latest release card featuring Review Canvas v4.2 with play button, release notes, and stats (04:12 walkthrough, 6 modules touched, 12 changes shipped).

### `frontend/src/components/site/ApproachCraft.jsx`

Three-column block: "The approach" / "The craft" / "The community" on dark background.

### `frontend/src/components/site/CommunityChat.jsx`

Live activity ticker with auto-scrolling messages from creative teams.

### `frontend/src/components/site/Process.jsx`

Four-step process grid: Capture → Cohere → Review → Ship.

### `frontend/src/components/site/Stats.jsx`

```jsx
import React, { useEffect, useRef, useState } from "react";

const STATS = [
  { n: 1207, suffix: "+", label: "creative teams across the studio network" },
  { n: 47, suffix: "", label: "studios on the annual operating plan" },
  { n: 3.4, suffix: "×", label: "faster review cycle than the average tool" },
  { n: 18200, suffix: "", label: "briefs shipped through COGSPA last quarter" },
];

function Counter({ value, suffix }) {
  const [shown, setShown] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(value);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const dur = 1600;
            const tick = (now) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              setShown(value * eased);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [value]);

  const isFloat = value % 1 !== 0;
  const display = isFloat ? shown.toFixed(1) : Math.round(shown).toLocaleString();
  return (
    <span ref={ref} className="font-display tabular-nums">
      {display}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative glow-bg grain">
      {/* Stats grid with animated counters */}
    </section>
  );
}
```

### `frontend/src/components/site/Testimonials.jsx`

Three testimonial quotes with prev/next navigation, attributed to fictional studio operators.

### `frontend/src/components/site/ForAgencies.jsx`

Pitch block for agency partnerships, showing offered services (multi-studio rollouts, custom review templates, dedicated operating partner, data-residency on request).

### `frontend/src/components/site/About.jsx`

Studio "about" block with synthetic portrait card and facts (Studio: COGSPA, Based: Lisbon · Amsterdam, Founded: 2023, Speaks: PT · EN · ES · NL).

### `frontend/src/components/site/StartCTA.jsx`

```jsx
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function StartCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;
    setSent(true);
    try {
      const list = JSON.parse(localStorage.getItem("cogspa.waitlist") || "[]");
      list.push({ email, t: new Date().toISOString() });
      localStorage.setItem("cogspa.waitlist", JSON.stringify(list));
    } catch {}
  };

  return (
    <section id="start" className="relative glow-bg grain">
      <form onSubmit={onSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@yourstudio.com"
        />
        <button type="submit" className="pill pill-light">
          {sent ? "On the list" : "Start free"}
        </button>
      </form>
    </section>
  );
}
```

### `frontend/src/components/site/Footer.jsx`

Footer with massive COGSPA wordmark, three link columns (Product, Studio, Follow), and back-to-top link.

---

## Frontend — Pages

### `frontend/src/pages/Home.jsx`

```jsx
import React from "react";
import TopNav from "@/components/site/TopNav";
import HeroVideo from "@/components/site/HeroVideo";
import DarkContext from "@/components/site/DarkContext";
import Pillars from "@/components/site/Pillars";
import Partners from "@/components/site/Partners";
import LatestRelease from "@/components/site/LatestRelease";
import ApproachCraft from "@/components/site/ApproachCraft";
import CommunityChat from "@/components/site/CommunityChat";
import Process from "@/components/site/Process";
import Stats from "@/components/site/Stats";
import Testimonials from "@/components/site/Testimonials";
import ForAgencies from "@/components/site/ForAgencies";
import About from "@/components/site/About";
import StartCTA from "@/components/site/StartCTA";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <main data-testid="cogspa-home">
      <TopNav />
      <HeroVideo />
      <DarkContext />
      <Pillars />
      <Partners />
      <LatestRelease />
      <ApproachCraft />
      <CommunityChat />
      <Process />
      <Stats />
      <Testimonials />
      <ForAgencies />
      <About />
      <StartCTA />
      <Footer />
    </main>
  );
}
```

---

## Frontend — Styles

### `frontend/src/App.css` (excerpt)

```css
/* Hero scroll video */
.hero-wrap {
  position: relative;
  height: 520vh;
  background: var(--c-ink);
}
.hero-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #060606;
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  filter: saturate(1.05) contrast(1.04);
}

/* Cue dots */
.cue-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  transition: background 0.25s ease, width 0.25s ease;
}
.cue-dot.is-active {
  background: #fff;
  width: 22px;
}

/* Mobile tweaks */
@media (max-width: 768px) {
  .hero-wrap { height: 460vh; }
}

@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; }
  .count-up { animation: none; }
}
```

### `frontend/src/index.css`

Imports DM Sans + DM Mono, sets up Tailwind layers, defines design tokens:

```css
:root {
  --c-ink: #0a0a0a;
  --c-ink-2: #0d0d0e;
  --c-cream: #f6f5f2;
  --c-cream-2: #efece7;
  --c-blush: #efe1d8;
  --c-rust: #b8492c;
  --c-glow: rgba(155, 35, 35, 0.32);
}
```

---

## Frontend — Configuration

### `frontend/package.json` (key dependencies)

- React 19
- React Router 7
- Tailwind 3 + tailwindcss-animate
- shadcn/ui primitives via Radix UI
- lucide-react icons
- DM Sans + DM Mono via Google Fonts
- craco for build config (path aliases)

### `frontend/craco.config.js`

Sets up `@/*` path alias, optional health check plugin (env-flagged), and visual edits dev plugin.

### `frontend/tailwind.config.js`

Standard shadcn/ui-style config with CSS variable-based theming.

---

## Memory / PRD

### `memory/PRD.md`

Defines the project as a frontend-only rebuild of a reference site's visual style for placeholder brand "COGSPA" (premium productivity app for creative teams), with a scroll-controlled video hero using stepped cue points tied to synchronized text states.

**Architecture decisions:**
- React 19 + Tailwind 3 + DM Sans + lucide-react
- Single-page editorial site with dark↔cream alternating sections
- Hero: 520vh sticky section + 5 stepped cue points, rAF-lerp seek
- Two video sources (webm + mp4) for codec coverage
- LocalStorage-only waitlist capture (no backend)

---

## Test Reports

### `test_reports/iteration_1.json` (summary)

Frontend-only end-to-end testing of COGSPA landing page. All critical data-testids present, video loads via webm, 5-step cue progression synchronized with `video.currentTime`, progress bar fills 0→1, testimonials prev/next works, waitlist CTA persists to localStorage, stats counters animate on view, mobile layout stacks correctly, and prefers-reduced-motion snaps video to cue targets without scrubbing animation. **Success rate: 100% frontend.**
