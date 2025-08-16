import { useEffect, useRef } from "react";
import { useParams } from 'next/navigation';

export default function SnowWithAccumulation({
  density = 120,                 // active falling flakes
  maxSize = 3,                   // flake radius px
  wind = 0.15,                   // horizontal drift
  gravity = 0.6,                 // fall speed
  columns = 160,                 // heightmap resolution
  pileColor = "rgba(241, 245, 249, 0.95)", // slate-100-ish
  flakeColor = "rgba(191, 219, 254, 0.9)", // blue-200-ish
  smoothPasses = 2,              // how many smoothing passes to apply
  kernel = [0.25, 0.5, 0.25],    // simple 1D blur kernel (left, center, right)
  edgeHighlight = true,          // draw a subtle rounded highlight on the ridge
}: {
  density?: number;
  maxSize?: number;
  wind?: number;
  gravity?: number;
  columns?: number;
  pileColor?: string;
  flakeColor?: string;
  smoothPasses?: number;
  kernel?: [number, number, number];
  edgeHighlight?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const state = {
      w: 0,
      h: 0,
      flakes: [] as { x: number; y: number; vx: number; vy: number; r: number }[],
      bins: new Float32Array(columns), // raw heightmap (in px)
    };

    function resize() {
      const parent = canvas.parentElement || document.body;
      state.w = parent.clientWidth;
      state.h = parent.clientHeight;
      canvas.width = Math.floor(state.w * dpr);
      canvas.height = Math.floor(state.h * dpr);
      canvas.style.width = state.w + "px";
      canvas.style.height = state.h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnFlake() {
      const r = Math.random() * (maxSize - 1) + 1;
      state.flakes.push({
        x: Math.random() * state.w,
        y: -10 - Math.random() * state.h,
        vx: (Math.random() - 0.5) * wind * 2,
        vy: Math.random() * 0.5 + gravity * 0.5,
        r,
      });
    }

    function ensurePopulation() {
      while (state.flakes.length < density) spawnFlake();
    }

    const binWidth = () => state.w / state.bins.length;

    function binIndex(x: number) {
      const idx = Math.floor((x / state.w) * state.bins.length);
      return Math.min(state.bins.length - 1, Math.max(0, idx));
    }

    function localPileHeightAt(x: number) {
      // lightweight local smoothing (for collision)
      const i = binIndex(x);
      const b = state.bins;
      const i0 = Math.max(0, i - 1);
      const i2 = Math.min(b.length - 1, i + 1);
      return (b[i0] + 2 * b[i] + b[i2]) / 4;
    }

    function settleFlake(f: { x: number; r: number }) {
      const i = binIndex(f.x);
      // Add to this bin and bleed a bit to neighbors to avoid cliffs
      state.bins[i] += f.r * 1.6;
      if (i > 0) state.bins[i - 1] += f.r * 0.45;
      if (i < state.bins.length - 1) state.bins[i + 1] += f.r * 0.45;
      // Optional: gentle global cap (comment out for “blizzard fills page”)
      // const cap = Math.min(0.45 * state.h, state.h); // ~45% viewport
      // if (state.bins[i] > cap) state.bins[i] = cap;
    }

    function smoothHeightmap(src: Float32Array, passes: number) {
      if (passes <= 0) return src;
      const n = src.length;
      let a = src;
      for (let p = 0; p < passes; p++) {
        const b = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const l = a[Math.max(0, i - 1)];
          const c = a[i];
          const r = a[Math.min(n - 1, i + 1)];
          b[i] = l * kernel[0] + c * kernel[1] + r * kernel[2];
        }
        a = b;
      }
      return a;
    }

    function drawSnowbank() {
      const bw = binWidth();
      // Smooth the raw bins to avoid pointy tops
      const smooth = smoothHeightmap(state.bins, smoothPasses);

      // Filled mound
      ctx.fillStyle = pileColor;
      ctx.beginPath();
      ctx.moveTo(0, state.h);
      // Start at first top point
      let x0 = 0;
      let y0 = state.h - smooth[0];
      ctx.lineTo(x0, y0);

      // Quadratic between midpoints for rounded ridge
      for (let i = 0; i < smooth.length - 1; i++) {
        const x1 = (i + 1) * bw;
        const y1 = state.h - smooth[i + 1];
        const xc = (x0 + x1) / 2;
        const yc = (y0 + y1) / 2;
        ctx.quadraticCurveTo(x0, y0, xc, yc); // control at current point
        x0 = x1;
        y0 = y1;
      }
      // Curve into the last point cleanly
      ctx.quadraticCurveTo(x0, y0, x0, y0);

      // Close shape down to bottom
      ctx.lineTo(state.w, state.h);
      ctx.closePath();
      ctx.fill();

      // Optional edge highlight for softer, rounded top
      if (edgeHighlight) {
        ctx.save();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();
        let px0 = 0;
        let py0 = state.h - smooth[0];
        ctx.moveTo(px0, py0);
        for (let i = 0; i < smooth.length - 1; i++) {
          const x1 = (i + 1) * bw;
          const y1 = state.h - smooth[i + 1];
          const xc = (px0 + x1) / 2;
          const yc = (py0 + y1) / 2;
          ctx.quadraticCurveTo(px0, py0, xc, yc);
          px0 = x1;
          py0 = y1;
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    function step() {
      ensurePopulation();

      // physics update
      for (let i = state.flakes.length - 1; i >= 0; i--) {
        const f = state.flakes[i];
        f.vx += (Math.random() - 0.5) * 0.02; // tiny jitter
        f.x += f.vx + wind * 0.2;
        f.vy = Math.min(f.vy + 0.01 + gravity * 0.02, gravity * 2.2);
        f.y += f.vy;

        // wrap horizontally
        if (f.x < -10) f.x = state.w + 10;
        if (f.x > state.w + 10) f.x = -10;

        // collision with pile or ground
        const groundY = state.h - localPileHeightAt(f.x);
        if (f.y + f.r >= groundY) {
          settleFlake(f);
          state.flakes.splice(i, 1);
          spawnFlake();
          continue;
        }

        // off bottom safety
        if (f.y > state.h + 20) {
          state.flakes.splice(i, 1);
          spawnFlake();
        }
      }

      // render
      ctx.clearRect(0, 0, state.w, state.h);
      drawSnowbank();

      // draw flakes (simple circles for perf)
      ctx.fillStyle = flakeColor;
      for (const f of state.flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    }

    const onResize = () => {
      const oldBins = state.bins;
      resize();
      // resample bins so the mound doesn’t jump on resize
      const newBins = new Float32Array(columns);
      for (let i = 0; i < newBins.length; i++) {
        const src = Math.floor((i / newBins.length) * oldBins.length);
        newBins[i] = oldBins[src] || 0;
      }
      state.bins = newBins;
    };

    resize();
    window.addEventListener("resize", onResize);
    for (let i = 0; i < density; i++) spawnFlake();

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [columns, density, gravity, maxSize, pileColor, flakeColor, wind, smoothPasses, kernel, edgeHighlight]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
