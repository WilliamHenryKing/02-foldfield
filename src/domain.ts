export type StudyId = "rain-library" | "listening-pavilion" | "sunset-theatre";
export type Panel = "open" | "slatted" | "vellum";
export type View = "object" | "plan" | "section" | "seat";
export type Vec3 = [number, number, number];
export type Surface = { points: [Vec3, Vec3, Vec3, Vec3]; kind: "roof" | "wall" | "screen" };
export type Configuration = {
  study: StudyId;
  span: number;
  roof: number;
  panel: Panel;
  sun: number;
  wind: number;
  view: View;
  fold: number;
  paper: boolean;
  rain: boolean;
};

export const STUDIES = [
  {
    id: "rain-library",
    number: "01",
    title: "The Rain Library",
    short: "A room for a rainy page.",
    purpose: "Read during rain",
    color: "#ef633e",
    noun: "shelter",
    copy: "A rising roof catches the weather. A little seat keeps its own kind of quiet. Pull a place out of a postcard, then make room for the rain.",
  },
  {
    id: "listening-pavilion",
    number: "02",
    title: "The Listening Pavilion",
    short: "An instrument you can sit in.",
    purpose: "Sit out of the wind",
    color: "#b9ca45",
    noun: "pavilion",
    copy: "Three hanging sails borrow a passing breeze. Between them, a small pocket of stillness. A place to hear the things you usually walk past.",
  },
  {
    id: "sunset-theatre",
    number: "03",
    title: "The Sunset Theatre",
    short: "A stage for the last light.",
    purpose: "Watch a small performance",
    color: "#b29acb",
    noun: "theatre",
    copy: "Four folded wings gather around an empty stage. The canopy borrows the setting sun. Tonight, even the shadows have a part.",
  },
] as const;
export const DEFAULT: Configuration = {
  study: "rain-library",
  span: 3.2,
  roof: 20,
  panel: "slatted",
  sun: 55,
  wind: 40,
  view: "object",
  fold: 0,
  paper: false,
  rain: false,
};
export const HEIGHT = 2.1,
  DEPTH = 3.2,
  BACK = -1.5,
  FLOOR = 0.12;
export const RAIN_DIRECTION: Vec3 = [-0.85, 1, 0.25];
export const STORAGE_KEY = "foldfield-config-v1";
export const radians = (degrees: number) => (degrees * Math.PI) / 180;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const studyFor = (id: StudyId) => STUDIES.find((s) => s.id === id) ?? STUDIES[0];
const smooth = (p: number, start: number, end: number) => {
  const t = clamp((p - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};

// Every panel pose is a function of one scalar; reversing cannot skip a dependency.
export function hingePose(fold: number, roof: number) {
  const p = clamp(fold / 100, 0, 1);
  return {
    wall: (-(1 - smooth(p, 0.05, 0.45)) * Math.PI) / 2,
    roof: -Math.PI / 2 + smooth(p, 0.5, 1) * (Math.PI / 2 - radians(roof)),
    side: (smooth(p, 0.2, 0.48) * Math.PI) / 2,
    seat: (smooth(p, 0.57, 0.83) * Math.PI) / 2,
  };
}
export function roofOutline(c: Configuration): Surface["points"] {
  const half = c.span / 2 + 0.1,
    end = BACK + DEPTH * Math.cos(radians(c.roof)),
    high = FLOOR + HEIGHT + DEPTH * Math.sin(radians(c.roof));
  return [
    [-half, FLOOR + HEIGHT, BACK],
    [half, FLOOR + HEIGHT, BACK],
    [half, high, end],
    [-half, high, end],
  ];
}
export function librarySurfaces(c: Configuration): Surface[] {
  const half = c.span / 2;
  const surfaces: Surface[] = [
    { kind: "roof", points: roofOutline(c) },
    {
      kind: "wall",
      points: [
        [-half, FLOOR, BACK],
        [half, FLOOR, BACK],
        [half, FLOOR + HEIGHT, BACK],
        [-half, FLOOR + HEIGHT, BACK],
      ],
    },
  ];
  if (c.panel !== "open")
    for (const x of [-half, half]) {
      const count = c.panel === "vellum" ? 1 : 12;
      for (let i = 0; i < count; i++) {
        const start = BACK + 0.12 + (i * 2.72) / count,
          end = start + (2.72 / count) * (c.panel === "vellum" ? 1 : 0.28);
        surfaces.push({
          kind: "screen",
          points: [
            [x, FLOOR, start],
            [x, FLOOR, end],
            [x, FLOOR + 1.55, end],
            [x, FLOOR + 1.55, start],
          ],
        });
      }
    }
  return surfaces;
}
const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function triangleHit(origin: Vec3, direction: Vec3, a: Vec3, b: Vec3, c: Vec3) {
  const edge1 = subtract(b, a),
    edge2 = subtract(c, a),
    h = cross(direction, edge2),
    det = dot(edge1, h);
  if (Math.abs(det) < 1e-8) return null;
  const f = 1 / det,
    s = subtract(origin, a),
    u = f * dot(s, h);
  if (u < -1e-7 || u > 1 + 1e-7) return null;
  const q = cross(s, edge1),
    v = f * dot(direction, q),
    t = f * dot(edge2, q);
  return v >= -1e-7 && u + v <= 1 + 1e-7 && t > 1e-5 ? t : null;
}
export function rayHit(origin: Vec3, direction: Vec3, surfaces: Surface[]) {
  let nearest = Infinity;
  for (const {
    points: [a, b, c, d],
  } of surfaces)
    for (const t of [
      triangleHit(origin, direction, a, b, c),
      triangleHit(origin, direction, a, c, d),
    ])
      if (t !== null) nearest = Math.min(nearest, t);
  return Number.isFinite(nearest) ? nearest : null;
}
export function seatSamples(): Vec3[] {
  return Array.from(
    { length: 25 },
    (_, i) => [-0.5 + (i % 5) * 0.25, FLOOR + 0.635, 0.2 + Math.floor(i / 5) * 0.14] as Vec3,
  );
}
export function sunDirection(sun: number): Vec3 {
  return [Math.cos(radians(sun)), Math.sin(radians(sun)), -0.65];
}
export function observations(c: Configuration) {
  const surfaces = librarySurfaces(c),
    samples = seatSamples();
  const dry =
    samples.filter((point) => rayHit(point, RAIN_DIRECTION, surfaces) !== null).length /
    samples.length;
  const shade =
    samples.filter((point) => rayHit(point, sunDirection(c.sun), surfaces) !== null).length /
    samples.length;
  const horizon = Array.from(
    { length: 27 },
    (_, i): Vec3 => [-1, -0.07 + Math.floor(i / 9) * 0.07, -1.1 + (i % 9) * 0.275],
  );
  const view =
    horizon.filter((direction) => rayHit([0, FLOOR + 1.1, 0.5], direction, surfaces) === null)
      .length / horizon.length;
  return {
    dry,
    shade,
    view,
    passed: dry >= 0.96 && view >= 2 / 3,
    area: c.span * DEPTH,
    frontHeight: HEIGHT + DEPTH * Math.sin(radians(c.roof)),
    run: DEPTH * Math.cos(radians(c.roof)),
  };
}
const number = (value: string | null, fallback: number, min: number, max: number, step: number) =>
  value === null || !Number.isFinite(Number(value))
    ? fallback
    : Math.round(clamp(Number(value), min, max) / step) * step;
export function readConfiguration(query: string): Configuration {
  const q = new URLSearchParams(query),
    study = q.get("study"),
    panel = q.get("panel"),
    view = q.get("view");
  return {
    study: STUDIES.some((s) => s.id === study) ? (study as StudyId) : DEFAULT.study,
    span: Number(number(q.get("span"), DEFAULT.span, 2.4, 4.8, 0.2).toFixed(1)),
    roof: number(q.get("roof"), DEFAULT.roof, 8, 32, 1),
    panel: ["open", "slatted", "vellum"].includes(panel ?? "") ? (panel as Panel) : DEFAULT.panel,
    sun: number(q.get("sun"), DEFAULT.sun, 15, 165, 1),
    wind: number(q.get("wind"), DEFAULT.wind, 0, 100, 5),
    view: ["object", "plan", "section", "seat"].includes(view ?? "")
      ? (view as View)
      : DEFAULT.view,
    fold: number(q.get("fold"), DEFAULT.fold, 0, 100, 1),
    paper: q.get("paper") === "1",
    rain: q.get("rain") === "1",
  };
}
export function configurationQuery(c: Configuration) {
  return new URLSearchParams({
    study: c.study,
    span: String(c.span),
    roof: String(c.roof),
    panel: c.panel,
    sun: String(c.sun),
    wind: String(c.wind),
    view: c.view,
    fold: String(c.fold),
    paper: c.paper ? "1" : "0",
    rain: c.rain ? "1" : "0",
  }).toString();
}
export function resetStudy(study: StudyId): Configuration {
  return { ...DEFAULT, study, sun: study === "sunset-theatre" ? 145 : 55 };
}
