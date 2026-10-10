import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Orbit, Radar, Database, RefreshCw, ShieldAlert, PlayCircle, ExternalLink } from "lucide-react";
import heroImg from "@/assets/hero-earth.jpg";
import { Explorer } from "@/components/terra/Explorer";
import { PROJECT_VIDEO_URL, PROJECT_VIDEO_TITLE, PROJECT_VIDEO_DESCRIPTION, resolveVideo } from "@/config/site";
import { MODES, MODE_ORDER } from "@/data/modes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoMorph — Rangpur Earth Explorer" },
      { name: "description", content: "Explore temperature, land and water change in Rangpur, Bangladesh with NASA satellite imagery. NASA Space Apps 2026 — Dancing with the SARs." },
      { property: "og:title", content: "GeoMorph — Rangpur Earth Explorer" },
      { property: "og:description", content: "Interactive satellite Earth-observation explorer for Rangpur, Bangladesh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [["Overview", "overview"], ["Explore", "explore"], ["About", "about"], ["Project Video", "video"]];

function Logo() {
  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/50">
      <span className="h-3.5 w-3.5 rounded-full bg-primary glow" />
      <Orbit className="absolute h-9 w-9 text-primary/60" strokeWidth={1} />
    </span>
  );
}

function Index() {
  const video = resolveVideo(PROJECT_VIDEO_URL);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-[1000] border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:flex lg:justify-between">
          <a href="#overview" className="flex min-w-0 items-center gap-3">
            <Logo />
            <span className="min-w-0 leading-tight">
              <span className="block font-semibold tracking-tight">GeoMorph</span>
              <span className="block truncate text-xs text-muted-foreground">Rangpur Earth Explorer</span>
            </span>
          </a>
          <nav className="order-3 col-span-2 flex gap-1 overflow-x-auto text-sm lg:order-none">
            {NAV.map(([l, id]) => (
              <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden rounded-full border border-primary/40 px-2.5 py-1 text-primary md:inline">NASA Space Apps Challenge 2026</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1"><MapPin className="h-3 w-3 text-primary" />Rangpur, BD</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="overview" className="relative overflow-hidden">
        <img src={heroImg} alt="Satellite view of river floodplains in northern Bangladesh" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-28 sm:px-6 sm:pt-32">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Dancing with the SARs · NASA Space Apps 2026</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">See Earth Change. <span className="text-primary">Understand What Comes Next.</span></h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Explore how Rangpur, Bangladesh, changes over time through satellite-based Earth observation, interactive maps, and scientific data visualization.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#explore" className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground glow transition hover:opacity-90">Explore Rangpur</a>
            <a href="#about" className="rounded-lg border border-foreground/20 bg-background/40 px-5 py-3 font-medium backdrop-blur transition hover:bg-secondary">Our Mission</a>
          </div>
          <div className="mt-14 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[["Study Area", "Rangpur, Bangladesh"], ["Exploration Modes", "3"], ["Time-Based Comparison", "Available"]].map(([k, v]) => (
              <div key={k} className="panel p-4 backdrop-blur">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1 font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Explorer />

      {/* About */}
      <section id="about" className="border-y bg-surface grid-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Our Mission</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Making satellite Earth observation understandable</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">Rangpur sits on the Teesta floodplain in northern Bangladesh, where heat stress, shifting agriculture and monsoon floods shape daily life. GeoMorph turns satellite records into a simple time-based story anyone can explore — and is built to grow into NISAR radar observations.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [Radar, "Why SAR", "Synthetic Aperture Radar works day and night and through clouds — vital during the monsoon. NISAR's L- and S-band radar will map surface change and flooding at high resolution. SAR does not measure temperature."],
              [Database, "Data architecture", "Each mode has its own data provider. Imagery streams live from NASA GIBS (public, no keys). Time-series charts use labeled sample data until a server-side Earthdata provider is connected."],
              [RefreshCw, "Automatic updates (planned)", "A scheduled server job will query NASA CMR for new acquisitions over Rangpur, record their real dates and add them to the timeline. Not yet active."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Radar;
              return (
                <div key={t as string} className="panel p-5">
                  <I className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-medium">{t as string}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
                </div>
              );
            })}
          </div>

          <h3 className="mt-14 text-lg font-medium">Data sources & integration status</h3>
          <div className="mt-4 overflow-x-auto panel">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr className="border-b"><th className="p-3">Mode</th><th className="p-3">Product</th><th className="p-3">Resolution</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {MODE_ORDER.map((id) => { const m = MODES[id]; return (
                  <tr key={id} className="border-b last:border-0">
                    <td className="p-3" style={{ color: m.colorVar }}>{m.title}</td>
                    <td className="p-3"><a href={m.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">{m.layer.label} <ExternalLink className="h-3 w-3" /></a></td>
                    <td className="p-3 text-muted-foreground">{m.layer.resolution}</td>
                    <td className="p-3"><span className="text-success">Imagery connected</span> · <span className="text-warning">Chart: sample</span></td>
                  </tr>); })}
                <tr><td className="p-3 text-primary">SAR</td><td className="p-3">NISAR / Sentinel-1 (ASF DAAC)</td><td className="p-3 text-muted-foreground">~10–30 m</td><td className="p-3 text-muted-foreground">Planned — not connected</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Limitations.</span> Satellite observations need scientific interpretation. This prototype is not a real-time system and is not a substitute for official emergency warnings (e.g. Bangladesh FFWC / BMD) or professional advice.</p>
          </div>
        </div>
      </section>

      {/* Video */}
      <section id="video" className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See GeoMorph in Action</h2>
          <p className="mt-3 text-muted-foreground">Watch our four-minute project presentation for NASA Space Apps Challenge 2026.</p>
        </div>
        <div className="mt-8 panel glow overflow-hidden p-2">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-background">
            {video.kind === "embed" && <iframe src={video.src} title={PROJECT_VIDEO_TITLE} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
            {video.kind === "file" && <video src={video.src} controls className="h-full w-full" />}
            {video.kind === "none" && (
              <div className="absolute inset-0 grid place-items-center grid-bg text-center">
                <div className="px-6">
                  <PlayCircle className="mx-auto h-14 w-14 text-muted-foreground" strokeWidth={1} />
                  <p className="mt-3 font-medium">Presentation video coming soon</p>
                  <p className="mt-1 text-sm text-muted-foreground">The team's 4-minute video will appear here once published.</p>
                </div>
              </div>
            )}
          </div>
          <div className="px-3 py-3">
            <div className="font-medium">{PROJECT_VIDEO_TITLE}</div>
            <div className="text-sm text-muted-foreground">{PROJECT_VIDEO_DESCRIPTION}</div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3"><Logo /><span className="font-semibold">GeoMorph — Rangpur Earth Explorer</span></div>
            <p className="mt-3 text-muted-foreground">Built for NASA Space Apps Challenge 2026.<br />Challenge: “Dancing with the SARs.”<br />Study area: Rangpur, Bangladesh.</p>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#about" className="text-muted-foreground hover:text-foreground">About</a>
            <a href="#explore" className="text-muted-foreground hover:text-foreground">Explore</a>
            <a href="#video" className="text-muted-foreground hover:text-foreground">Project Video</a>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Imagery: NASA EOSDIS GIBS, MODIS (LP DAAC, LANCE). Base map © OpenStreetMap contributors, (base map).</p>
            <p className="mt-3">Independent student project. Not an official NASA product and not endorsed by NASA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
