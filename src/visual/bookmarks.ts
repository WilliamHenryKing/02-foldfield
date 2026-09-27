import { type Configuration, DEFAULT } from "../domain";
export type Bookmark = {
  id: string;
  purpose: string;
  hero: boolean;
  config: Configuration;
  camera?: { position: [number, number, number]; target: [number, number, number]; zoom: number };
};
export const BOOKMARKS: Bookmark[] = [
  { id: "rain-flat", purpose: "Establishing flat paper hero", hero: true, config: { ...DEFAULT } },
  {
    id: "rain-half-fold",
    purpose: "Wall/roof clearance and hinge construction",
    hero: false,
    config: { ...DEFAULT, fold: 45 },
  },
  {
    id: "rain-open",
    purpose: "Rain Library open hero and portrait framing",
    hero: true,
    config: { ...DEFAULT, fold: 100 },
  },
  {
    id: "rain-inhabit",
    purpose: "Public close camera, seat and paper detail",
    hero: true,
    config: { ...DEFAULT, fold: 100, view: "seat" },
  },
  {
    id: "roof-grazing",
    purpose: "Arm-length grazing material and fastener inspection",
    hero: false,
    config: { ...DEFAULT, fold: 100, sun: 15 },
    camera: { position: [5.4, 3.8, 4.8], target: [0, 2, 0], zoom: 4.8 },
  },
  {
    id: "rain-plan",
    purpose: "Roof edge and plan alignment",
    hero: false,
    config: { ...DEFAULT, fold: 100, view: "plan" },
  },
  {
    id: "rain-section",
    purpose: "Clipped sheets, scale reader and section artefacts",
    hero: false,
    config: { ...DEFAULT, fold: 100, view: "section" },
  },
  {
    id: "vellum-low-sun",
    purpose: "Translucency and low lighting state",
    hero: false,
    config: { ...DEFAULT, fold: 100, panel: "vellum", sun: 15 },
  },
  {
    id: "shelter-rain",
    purpose: "Maximum span, rain and challenge markers",
    hero: false,
    config: { ...DEFAULT, fold: 100, span: 4.8, roof: 8, panel: "open", rain: true },
  },
  {
    id: "listening-pavilion",
    purpose: "Second study hero and paper sails",
    hero: true,
    config: { ...DEFAULT, study: "listening-pavilion", fold: 100, wind: 75 },
  },
  {
    id: "sunset-theatre",
    purpose: "Third study hero and opposite raking light",
    hero: true,
    config: { ...DEFAULT, study: "sunset-theatre", fold: 100, sun: 145 },
  },
  {
    id: "postcard-return",
    purpose: "Configured flat return and small print",
    hero: false,
    config: { ...DEFAULT, span: 4.8, roof: 8, panel: "open", fold: 0 },
  },
];
