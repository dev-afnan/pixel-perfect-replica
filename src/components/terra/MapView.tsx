import { useEffect, useRef, useState } from "react";
import type * as LType from "leaflet";
import { MODES, RANGPUR_CENTER, RANGPUR_OUTLINE, gibsUrl, type ModeId } from "@/data/modes";

interface Props {
  mode: ModeId;
  date: string;
  compareDate: string | null; // when set, enables swipe: left = compareDate (earlier), right = date
  opacity: number;
}

export function MapView({ mode, date, compareDate, opacity }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const L = useRef<typeof LType | null>(null);
  const map = useRef<LType.Map | null>(null);
  const main = useRef<LType.TileLayer | null>(null);
  const left = useRef<LType.TileLayer | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(0);
  const [split, setSplit] = useState(0.5);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !el.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(el.current, { center: RANGPUR_CENTER, zoom: 9, minZoom: 5, maxZoom: 12, zoomControl: true });
      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
        })
        .addTo(m);
      m.createPane("leftPane").style.zIndex = "350";
      m.createPane("labels").style.zIndex = "450";
      m.getPane("labels")!.style.pointerEvents = "none";
      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", { pane: "labels", subdomains: "abcd" })
        .addTo(m);
      leaflet
        .polygon(RANGPUR_OUTLINE, { color: "#5fd4f0", weight: 1.5, dashArray: "4 4", fill: false })
        .bindTooltip("Rangpur District (approximate outline)", { className: "tp-label", sticky: true })
        .addTo(m);
      leaflet
        .circleMarker(RANGPUR_CENTER, { radius: 5, color: "#fff", weight: 2, fillColor: "#5fd4f0", fillOpacity: 1 })
        .bindTooltip("Rangpur City", { permanent: true, direction: "right", className: "tp-label", offset: [8, 0] })
        .addTo(m);
      map.current = m;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // overlay layers
  useEffect(() => {
    const m = map.current, leaflet = L.current;
    if (!ready || !m || !leaflet) return;
    const layer = MODES[mode].layer;
    main.current?.remove();
    left.current?.remove();
    left.current = null;
    setErrors(0);
    const opts = { maxNativeZoom: layer.maxNativeZoom, maxZoom: 12, opacity, attribution: '<a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>' };
    const t = leaflet.tileLayer(gibsUrl(layer, date), opts);
    t.on("loading", () => setLoading(true));
    t.on("load", () => setLoading(false));
    t.on("tileerror", () => setErrors((e) => e + 1));
    t.addTo(m);
    main.current = t;
    if (compareDate) {
      left.current = leaflet.tileLayer(gibsUrl(layer, compareDate), { ...opts, pane: "leftPane" }).addTo(m);
    }
  }, [ready, mode, date, compareDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    main.current?.setOpacity(opacity);
    left.current?.setOpacity(opacity);
  }, [opacity]);

  // swipe clipping: left pane shows earlier date on the left side of the divider
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const pane = m.getPane("leftPane")!;
    const clip = () => {
      if (!compareDate) { pane.style.clip = ""; return; }
      const size = m.getSize();
      const nw = m.containerPointToLayerPoint([0, 0]);
      const se = m.containerPointToLayerPoint(size);
      const x = nw.x + size.x * split;
      pane.style.clip = `rect(${nw.y}px, ${x}px, ${se.y}px, ${nw.x}px)`;
      // hide main layer on the left so it doesn't show under the earlier image
      const mc = main.current?.getContainer();
      if (mc) mc.style.clip = `rect(${nw.y}px, ${se.x}px, ${se.y}px, ${x}px)`;
    };
    clip();
    m.on("move zoom resize", clip);
    return () => {
      m.off("move zoom resize", clip);
      const mc = main.current?.getContainer();
      if (mc) mc.style.clip = "";
    };
  }, [ready, compareDate, split, mode, date]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" aria-label="Interactive map of Rangpur, Bangladesh" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-surface text-sm text-muted-foreground">Loading map…</div>
      )}
      {compareDate && (
        <>
          <div className="pointer-events-none absolute inset-y-0 z-[500] w-0.5 bg-primary glow" style={{ left: `${split * 100}%` }} />
          <div className="pointer-events-none absolute top-3 z-[500] rounded bg-background/80 px-2 py-1 font-mono text-[11px]" style={{ left: `calc(${split * 100}% - 7.5rem)` }}>◀ {compareDate}</div>
          <div className="pointer-events-none absolute top-3 z-[500] rounded bg-background/80 px-2 py-1 font-mono text-[11px]" style={{ left: `calc(${split * 100}% + 0.5rem)` }}>{date} ▶</div>
          <input
            type="range" min={5} max={95} value={split * 100}
            onChange={(e) => setSplit(Number(e.target.value) / 100)}
            aria-label="Swipe comparison divider"
            className="absolute bottom-10 left-1/2 z-[500] w-2/3 -translate-x-1/2 accent-primary"
          />
        </>
      )}
      <div className="pointer-events-none absolute bottom-2 left-2 z-[500] flex gap-2 text-[11px]">
        {loading && <span className="rounded bg-background/85 px-2 py-1 text-primary">Loading NASA imagery…</span>}
        {errors > 0 && !loading && (
          <span className="rounded bg-background/85 px-2 py-1 text-warning">Some tiles unavailable for this date</span>
        )}
      </div>
    </div>
  );
}
