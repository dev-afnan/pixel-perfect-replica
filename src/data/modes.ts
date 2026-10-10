/**
 * Data-provider layer. Each mode declares:
 *  - a REAL imagery layer from NASA GIBS (public WMTS, no credentials) requested for a given date
 *  - an ILLUSTRATIVE time series (clearly labeled sample values, NOT observations)
 * Replace `getSeries` with a real provider (e.g. a server function calling NASA Earthdata/AppEEARS)
 * without touching UI components.
 */
export type ModeId = "temperature" | "land" | "water";

export interface SeriesPoint { date: string; value: number }

export interface GibsLayer {
  id: string;
  label: string;
  format: "png" | "jpg";
  maxNativeZoom: number;
  matrix: string;
  resolution: string;
}

export interface ModeConfig {
  id: ModeId;
  title: string;
  description: string;
  colorVar: string;
  layer: GibsLayer;
  /** Dates we request from GIBS. Imagery may be partially empty (cloud/no-data). */
  dates: string[];
  dateNote: string;
  legend: { label: string; unit: string; stops: string[]; min: string; max: string; note: string };
  series: { label: string; unit: string; values: number[] };
  explanation: string;
  limitations: string;
  source: { name: string; url: string; product: string };
  sar: string;
}

const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const MODES: Record<ModeId, ModeConfig> = {
  temperature: {
    id: "temperature",
    title: "Temperature",
    description: "Explore temperature patterns and their variation over time.",
    colorVar: "var(--temp)",
    layer: {
      id: "MODIS_Terra_Land_Surface_Temp_Day",
      label: "MODIS Terra Land Surface Temperature (Day)",
      format: "png",
      maxNativeZoom: 7,
      matrix: "GoogleMapsCompatible_Level7",
      resolution: "~1 km",
    },
    dates: years.map((y) => `${y}-04-15`),
    dateNote: "Requested daily LST tiles for 15 April each year (pre-monsoon). Cloudy days show gaps.",
    legend: {
      label: "Land Surface Temperature",
      unit: "K (GIBS palette)",
      stops: ["#2c1a6b", "#3b6fd1", "#3fc9b0", "#e9e43a", "#f08a24", "#c4161c"],
      min: "≈ 200 K",
      max: "≈ 345 K",
      note: "LST is the skin temperature of the ground — not air temperature.",
    },
    series: {
      label: "Illustrative mean LST, April",
      unit: "°C",
      values: [36.1, 35.4, 34.8, 36.9, 33.7, 35.9, 36.4, 37.2, 38.0, 36.8],
    },
    explanation:
      "Land surface temperature (LST) from MODIS thermal infrared shows how hot the ground surface gets. Built-up Rangpur city and bare fields heat faster than irrigated paddy and tree cover.",
    limitations:
      "Thermal infrared cannot see through clouds; monsoon months have large gaps. LST differs from the 2 m air temperature reported by weather stations.",
    source: { name: "NASA GIBS / LP DAAC", url: "https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod11a1-061", product: "MOD11A1 v6.1" },
    sar: "SAR (including NISAR) does not measure temperature. This mode uses thermal infrared data.",
  },
  land: {
    id: "land",
    title: "Land Change",
    description: "Compare land surface and vegetation patterns across different dates.",
    colorVar: "var(--land)",
    layer: {
      id: "MODIS_Terra_NDVI_8Day",
      label: "MODIS Terra NDVI (8-day)",
      format: "png",
      maxNativeZoom: 9,
      matrix: "GoogleMapsCompatible_Level9",
      resolution: "~250 m",
    },
    dates: years.map((y) => `${y}-02-02`),
    dateNote: "Requested 8-day NDVI composites starting 2 February each year (dry-season Boro growth).",
    legend: {
      label: "Vegetation index (NDVI)",
      unit: "unitless",
      stops: ["#a0522d", "#d2b48c", "#f0e68c", "#9acd32", "#228b22", "#004d00"],
      min: "−0.1 (bare/water)",
      max: "0.9 (dense green)",
      note: "Vegetation change only — this is not geological or tectonic change.",
    },
    series: {
      label: "Illustrative mean NDVI, February",
      unit: "NDVI",
      values: [0.52, 0.55, 0.53, 0.56, 0.58, 0.54, 0.55, 0.51, 0.53, 0.54],
    },
    explanation:
      "NDVI compares red and near-infrared reflectance: greener, denser crops score higher. Comparing the same season across years highlights cropping and built-up expansion around Rangpur.",
    limitations:
      "250 m pixels blend small fields and villages. Seasonal timing, clouds and haze change NDVI without any lasting land change.",
    source: { name: "NASA GIBS / LP DAAC", url: "https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod13q1-061", product: "MOD13 NDVI v6.1" },
    sar: "Radar (e.g. NISAR L-band) sees through clouds and responds to surface roughness and moisture, complementing optical NDVI. Interpretation depends on sensor, processing and terrain.",
  },
  water: {
    id: "water",
    title: "Water & Floods",
    description: "Explore changes in water extent and identify areas that may be affected by flooding.",
    colorVar: "var(--water)",
    layer: {
      id: "MODIS_Terra_CorrectedReflectance_Bands721",
      label: "MODIS Terra Corrected Reflectance (Bands 7-2-1)",
      format: "jpg",
      maxNativeZoom: 9,
      matrix: "GoogleMapsCompatible_Level9",
      resolution: "~250–500 m",
    },
    dates: years.map((y) => `${y}-08-20`),
    dateNote: "Requested daily imagery for 20 August each year (monsoon). Clouds often obscure the surface.",
    legend: {
      label: "False colour (7-2-1)",
      unit: "reflectance",
      stops: ["#0a1a5c", "#1f3fa8", "#2fb5d6", "#3aa64a", "#c2a27a", "#e8f4ff"],
      min: "Water: dark blue/black",
      max: "Cloud: cyan/white",
      note: "Water appears dark blue; vegetation green; bare soil tan; clouds cyan-white.",
    },
    series: {
      label: "Illustrative surface-water extent, August",
      unit: "km²",
      values: [142, 198, 131, 214, 236, 158, 189, 167, 221, 175],
    },
    explanation:
      "Shortwave-infrared false colour makes standing water stand out as dark blue. Rivers such as the Teesta and Ghaghat swell during the monsoon; compare years to see where water spreads.",
    limitations:
      "Optical data cannot see through monsoon clouds. Radar flood mapping works under cloud, but urban areas, vegetation and terrain can hide or mimic water. This is not a flood-warning system.",
    source: { name: "NASA GIBS / LANCE", url: "https://www.earthdata.nasa.gov/data/instruments/modis", product: "MOD09 Corrected Reflectance" },
    sar: "SAR flood mapping (Sentinel-1, NISAR) is planned: smooth water reflects radar away, appearing dark even under cloud. Not yet connected.",
  },
};

export const MODE_ORDER: ModeId[] = ["temperature", "land", "water"];

export function gibsUrl(layer: GibsLayer, date: string) {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.id}/default/${date}/${layer.matrix}/{z}/{y}/{x}.${layer.format}`;
}

export function getSeries(mode: ModeId): SeriesPoint[] {
  const m = MODES[mode];
  return m.dates.map((d, i) => ({ date: d.slice(0, 4), value: m.series.values[i] }));
}

export const RANGPUR_CENTER: [number, number] = [25.7439, 89.2752];
/** Approximate outline of Rangpur District (hand-traced, for orientation only). */
export const RANGPUR_OUTLINE: [number, number][] = [
  [25.93, 89.03], [25.98, 89.2], [25.95, 89.38], [25.9, 89.5], [25.78, 89.57],
  [25.62, 89.55], [25.48, 89.47], [25.42, 89.3], [25.47, 89.12], [25.55, 88.98], [25.74, 88.95],
];
