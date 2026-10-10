import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Thermometer, Satellite, Waves, Play, Pause, SkipBack, SkipForward, RotateCcw, Columns2, Info, ExternalLink, FlaskConical } from "lucide-react";
import { MODES, MODE_ORDER, getSeries, type ModeId } from "@/data/modes";

const MapView = lazy(() => import("./MapView").then((m) => ({ default: m.MapView })));
const ICONS = { temperature: Thermometer, land: Satellite, water: Waves };

function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function Explorer() {
  const hydrated = useHydrated();
  const [mode, setMode] = useState<ModeId>("temperature");
  const cfg = MODES[mode];
  const n = cfg.dates.length;
  const [idx, setIdx] = useState(n - 1);
  const [cmpIdx, setCmpIdx] = useState(0);
  const [compare, setCompare] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [opacity, setOpacity] = useState(0.85);
  const series = useMemo(() => getSeries(mode), [mode]);

  useEffect(() => { setIdx(n - 1); setCmpIdx(0); setPlaying(false); }, [mode, n]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setIdx((i) => {
        if (i >= n - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 1800);
    return () => clearInterval(t);
  }, [playing, n]);

  const play = () => { if (idx >= n - 1) setIdx(0); setCompare(false); setPlaying(!playing); };
  const reset = () => { setPlaying(false); setIdx(n - 1); setCmpIdx(0); setCompare(false); setOpacity(0.85); };

  const fb = { date: "", value: 0 };
  const a = series[cmpIdx] ?? fb, b = series[idx] ?? fb;
  const diff = b.value - a.value;
  const fmt = (v: number) => (cfg.series.unit === "NDVI" ? v.toFixed(2) : v.toFixed(1));
  const vals = series.map((s) => s.value);
  const mean = vals.reduce((x, y) => x + y, 0) / vals.length;

  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Interactive Explorer</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Explore Rangpur through time</h2>
        <p className="mt-3 text-muted-foreground">Choose one mode at a time. Imagery is real NASA GIBS data requested for each date; charts use clearly labeled sample values.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3" role="tablist">
        {MODE_ORDER.map((id) => {
          const m = MODES[id]; const Icon = ICONS[id]; const active = id === mode;
          return (
            <button key={id} role="tab" aria-selected={active} onClick={() => setMode(id)}
              className={`panel group flex items-start gap-3 p-4 text-left transition-all ${active ? "glow ring-1 ring-primary" : "opacity-75 hover:opacity-100"}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary" style={{ color: m.colorVar }}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block font-medium">{m.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{m.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Map + timeline */}
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 text-xs">
            <span className="min-w-0 truncate text-muted-foreground"><span style={{ color: cfg.colorVar }}>●</span> {cfg.layer.label} · {cfg.layer.resolution}</span>
            <span className="rounded border border-success/40 px-2 py-0.5 text-success">Real imagery · NASA GIBS</span>
          </div>
          <div className="relative h-[420px] sm:h-[520px]">
            {hydrated ? (
              <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>}>
                <MapView mode={mode} date={cfg.dates[idx] ?? ""} compareDate={compare ? (cfg.dates[cmpIdx] ?? null) : null} opacity={opacity} />
              </Suspense>
            ) : <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>}
            {/* Legend */}
            <div className="absolute right-3 bottom-8 z-[500] w-56 rounded-lg border bg-background/90 p-3 text-xs backdrop-blur">
              <div className="font-medium">{cfg.legend.label}</div>
              <div className="text-muted-foreground">{cfg.legend.unit}</div>
              <div className="mt-2 h-2 rounded" style={{ background: `linear-gradient(90deg, ${cfg.legend.stops.join(",")})` }} />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>{cfg.legend.min}</span><span>{cfg.legend.max}</span></div>
              <p className="mt-2 text-[10px] leading-snug text-muted-foreground">{cfg.legend.note}</p>
            </div>
            {/* Inset */}
            <div className="absolute top-3 right-3 z-[500] hidden rounded-lg border bg-background/90 p-2 sm:block">
              <svg viewBox="0 0 100 120" className="h-24 w-20" aria-label="Rangpur location within Bangladesh">
                <path d="M30 5 L55 8 L60 20 L78 22 L95 35 L88 50 L80 48 L78 70 L90 95 L80 115 L70 100 L60 108 L45 100 L30 105 L20 85 L25 65 L12 50 L18 35 L10 22 Z" className="fill-secondary stroke-muted-foreground" strokeWidth="1" />
                <circle cx="34" cy="22" r="4" className="fill-primary" />
              </svg>
              <div className="text-center text-[10px] text-muted-foreground">Bangladesh</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3 border-t p-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setPlaying(false); setIdx(Math.max(0, idx - 1)); }} className="tbtn" aria-label="Previous date"><SkipBack className="h-4 w-4" /></button>
              <button onClick={play} className="tbtn bg-primary text-primary-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
              <button onClick={() => { setPlaying(false); setIdx(Math.min(n - 1, idx + 1)); }} className="tbtn" aria-label="Next date"><SkipForward className="h-4 w-4" /></button>
              <button onClick={reset} className="tbtn" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
              <div className="ml-1 font-mono text-sm">Selected: <span className="text-primary">{cfg.dates[idx]}</span></div>
              <button onClick={() => { setPlaying(false); setCompare(!compare); }}
                className={`ml-auto inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition ${compare ? "border-primary bg-primary/15 text-primary" : "hover:bg-secondary"}`}>
                <Columns2 className="h-3.5 w-3.5" /> Swipe compare {compare ? "on" : "off"}
              </button>
            </div>
            <input type="range" min={0} max={n - 1} value={idx} onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }} className="w-full accent-primary" aria-label="Timeline" />
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">{cfg.dates.map((d) => <span key={d}>{d.slice(2, 4)}</span>)}</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-muted-foreground">Earlier date
                <select value={cmpIdx} onChange={(e) => { setCmpIdx(Number(e.target.value)); setCompare(true); }} className="mt-1 w-full rounded-md border bg-secondary px-2 py-1.5 text-sm text-foreground">
                  {cfg.dates.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </label>
              <label className="text-xs text-muted-foreground">Later date
                <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="mt-1 w-full rounded-md border bg-secondary px-2 py-1.5 text-sm text-foreground">
                  {cfg.dates.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </label>
              <label className="text-xs text-muted-foreground">Layer opacity {Math.round(opacity * 100)}%
                <input type="range" min={0.2} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-2.5 w-full accent-primary" />
              </label>
            </div>
            <p className="flex gap-1.5 text-[11px] text-muted-foreground"><Info className="mt-px h-3 w-3 shrink-0" />{cfg.dateNote}</p>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{cfg.series.label}</h3>
              <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning"><FlaskConical className="h-3 w-3" />SAMPLE DATA</span>
            </div>
            <div className="mt-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                  <defs><linearGradient id={`g-${mode}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={cfg.colorVar} stopOpacity={0.45} /><stop offset="100%" stopColor={cfg.colorVar} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} ${cfg.series.unit} (sample)`, cfg.title]} />
                  {compare && <ReferenceLine x={a.date} stroke="var(--muted-foreground)" strokeDasharray="3 3" />}
                  <ReferenceLine x={b.date} stroke="var(--primary)" />
                  <Area type="monotone" dataKey="value" stroke={cfg.colorVar} strokeWidth={2} fill={`url(#g-${mode})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Y-axis: {cfg.series.unit}. Illustrative values for interface demonstration — not satellite measurements.</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["Earlier", fmt(a.value), a.date],
              ["Later", fmt(b.value), b.date],
              ["Change", `${diff >= 0 ? "+" : ""}${fmt(diff)}`, cfg.series.unit],
            ].map(([k, v, s]) => (
              <div key={k} className="panel p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1 font-mono text-lg" style={k === "Change" ? { color: cfg.colorVar } : undefined}>{v}</div>
                <div className="text-[10px] text-muted-foreground">{s}</div>
              </div>
            ))}
          </div>
          <p className="-mt-2 text-[10px] text-warning">Metrics computed from sample series · Period mean {fmt(mean)} {cfg.series.unit}</p>

          <div className="panel space-y-3 p-4 text-sm">
            <h3 className="font-medium">What this shows</h3>
            <p className="text-muted-foreground">{cfg.explanation}</p>
            <h4 className="text-xs font-medium uppercase tracking-wider text-warning">Limitations</h4>
            <p className="text-muted-foreground">{cfg.limitations}</p>
            <h4 className="text-xs font-medium uppercase tracking-wider text-primary">About SAR</h4>
            <p className="text-muted-foreground">{cfg.sar}</p>
            <a href={cfg.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Source: {cfg.source.name} · {cfg.source.product} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
