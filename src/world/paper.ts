import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import { BACK, type Configuration, DEPTH, FLOOR, HEIGHT, hingePose, studyFor } from "../domain";

export function disposeObject(group: Group) {
  const materials = new Set<Material>(),
    textures = new Set<Texture>();
  group.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose();
      for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) materials.add(m);
    }
  });
  for (const m of materials) {
    for (const value of Object.values(m))
      if (value && typeof value === "object" && "isTexture" in value)
        textures.add(value as Texture);
    m.dispose();
  }
  for (const t of textures) t.dispose();
  group.clear();
}
export function paperGrain() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Paper texture unavailable");
  const pixels = ctx.createImageData(256, 256);
  let seed = 82;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const light = 220 + Math.floor((seed / 4294967296) * 35);
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = light;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}
export function box(
  parent: Group,
  size: [number, number, number],
  position: [number, number, number],
  material: Material | Material[],
) {
  const mesh = new Mesh(new BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function pin(
  parent: Group,
  length: number,
  position: [number, number, number],
  material: Material,
  axis: "x" | "z" = "x",
) {
  const mesh = new Mesh(new CylinderGeometry(0.033, 0.033, length, 12), material);
  mesh.position.set(...position);
  if (axis === "x") mesh.rotation.z = Math.PI / 2;
  else mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
export function printTexture(c: Configuration) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1664;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Printing unavailable");
  ctx.fillStyle = "#f4f0df";
  ctx.fillRect(0, 0, 1024, 1664);
  ctx.fillStyle = "#2440b0";
  ctx.strokeStyle = "#bdc2c6";
  ctx.lineWidth = 1;
  for (let x = 80; x < 980; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 75);
    ctx.lineTo(x, 1460);
    ctx.stroke();
  }
  for (let y = 75; y < 1460; y += 48) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(965, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#2440b0";
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, 954, 1594);
  const study = studyFor(c.study);
  ctx.font = '800 96px "Barlow Condensed",sans-serif';
  ctx.fillText("FOLDFIELD", 65, 1468);
  ctx.font = '22px "IBM Plex Mono",monospace';
  ctx.fillText(`${study.number} / ${study.title.toUpperCase()}`, 68, 1512);
  ctx.fillText("PLACES THAT DO NOT EXIST. YET.", 68, 1580);
  ctx.fillStyle = study.color;
  ctx.beginPath();
  ctx.arc(880, 1510, 53, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2440b0";
  ctx.font = '800 63px "Barlow Condensed"';
  ctx.textAlign = "center";
  ctx.fillText(study.number, 880, 1533);
  ctx.textAlign = "left";
  ctx.font = '18px "IBM Plex Mono"';
  ctx.fillText("CUT HERE", 68, 95);
  ctx.fillText("CREASE / OPEN / INHABIT", 540, 95);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
export type PaperModel = {
  group: Group;
  architectMaterials: Material[];
  pose(fold: number, angle: number, paperMode: boolean, time: number, wind: number): void;
};
export function createLibrary(c: Configuration): PaperModel {
  const group = new Group(),
    grain = paperGrain(),
    accent = studyFor(c.study).color;
  const paper = (color: string) =>
    new MeshStandardMaterial({
      color,
      roughness: 0.92,
      bumpMap: grain,
      bumpScale: 0.016,
      side: DoubleSide,
    });
  const ivory = paper("#f3efdf"),
    orange = paper(accent),
    blue = paper("#2644bd"),
    edge = paper("#d9cbb0");
  const metal = new MeshStandardMaterial({ color: "#a8adae", metalness: 0.8, roughness: 0.33 });
  const vellum = new MeshPhysicalMaterial({
    color: "#ddd6a8",
    roughness: 0.8,
    transparent: true,
    opacity: 0.62,
    side: DoubleSide,
    depthWrite: false,
  });
  const reverseCanvas = document.createElement("canvas");
  reverseCanvas.width = reverseCanvas.height = 512;
  const ink = reverseCanvas.getContext("2d");
  if (!ink) throw new Error("Roof print unavailable");
  ink.fillStyle = "#f3efdf";
  ink.fillRect(0, 0, 512, 512);
  ink.fillStyle = "#2440b0";
  ink.font = '800 110px "Barlow Condensed"';
  ink.fillText("RAIN", 35, 135);
  ink.fillText("LIBRARY", 35, 230);
  ink.strokeStyle = "#ef633e";
  ink.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    ink.beginPath();
    ink.moveTo(35, 285 + i * 25);
    ink.lineTo(477, 285 + i * 25);
    ink.stroke();
  }
  ink.font = '16px "IBM Plex Mono"';
  ink.fillText("02 / LIFT AT THE CREASE", 35, 480);
  const reverseMap = new CanvasTexture(reverseCanvas);
  reverseMap.colorSpace = SRGBColorSpace;
  const reversePaper = new MeshStandardMaterial({
    map: reverseMap,
    roughness: 0.94,
    bumpMap: grain,
    bumpScale: 0.015,
  });
  const architectMaterials = [ivory, orange, blue, edge, metal, vellum, reversePaper];
  box(group, [9.2, 0.08, 15], [0, 0, 0], edge);
  const printed = new Mesh(
    new PlaneGeometry(9.2, 15),
    new MeshStandardMaterial({ map: printTexture(c), roughness: 0.94 }),
  );
  printed.rotation.x = -Math.PI / 2;
  printed.position.y = 0.043;
  printed.receiveShadow = true;
  group.add(printed);
  // A real projecting tab below the edge; pointer and keyboard controls live in the DOM.
  box(group, [1.45, 0.035, 0.6], [0, 0.04, 7.6], blue).userData.foldTab = true;
  for (let i = 0; i < 3; i++) box(group, [0.45, 0.008, 0.023], [0, 0.062, 7.45 + i * 0.1], ivory);
  const spine = new Group();
  spine.position.set(0, FLOOR, BACK);
  group.add(spine);
  box(spine, [c.span, 0.001 + HEIGHT, 0.036], [0, HEIGHT / 2, 0], blue);
  pin(spine, c.span, [0, 0, 0], metal);
  // Raised ink/book spines are part of the back wall and move with it.
  for (let i = 0; i < 14; i++) {
    const book = box(
      spine,
      [0.1, 0.23 + 0.025 * (i % 3), 0.042],
      [-c.span * 0.38 + i * c.span * 0.058, 0.55, 0.044],
      i % 4 === 0 ? orange : ivory,
    );
    book.rotation.z = i % 5 === 0 ? 0.08 : 0;
  }
  box(spine, [c.span * 0.87, 0.035, 0.13], [0, 0.39, 0.074], edge);
  const roof = new Group();
  roof.position.y = HEIGHT;
  spine.add(roof);
  box(
    roof,
    [c.span + 0.2, 0.036, DEPTH],
    [0, 0, DEPTH / 2],
    [edge, edge, orange, reversePaper, edge, edge],
  );
  pin(roof, c.span + 0.16, [0, 0, 0], metal);
  for (let i = 0; i < 5; i++)
    box(
      roof,
      [0.012, 0.01, DEPTH - 0.05],
      [-c.span * 0.4 + i * c.span * 0.2, 0.023, DEPTH / 2],
      edge,
    );
  // Gutter is at the low, attached end of the rising roof.
  box(roof, [c.span + 0.3, 0.018, 0.14], [0, 0.03, 0.09], metal);
  box(roof, [c.span + 0.3, 0.07, 0.018], [0, 0.06, 0.02], metal);
  box(roof, [c.span + 0.3, 0.07, 0.018], [0, 0.06, 0.16], metal);
  const screens: { group: Group; side: number }[] = [];
  for (const side of [-1, 1]) {
    const screen = new Group();
    screen.position.set((side * c.span) / 2, FLOOR, BACK + 0.12);
    group.add(screen);
    screens.push({ group: screen, side });
    pin(screen, 2.72, [0, 0, 1.36], metal, "z");
    if (c.panel === "vellum") box(screen, [0.028, 1.55, 2.72], [0, 0.775, 1.36], vellum);
    if (c.panel === "slatted")
      for (let i = 0; i < 12; i++)
        box(
          screen,
          [0.03, 1.55, (2.72 / 12) * 0.28],
          [0, 0.775, (i * 2.72) / 12 + (2.72 / 12) * 0.14],
          ivory,
        );
  }
  const legs: Group[] = [];
  for (const x of [-0.48, 0.48])
    for (const z of [0.24, 0.76]) {
      const leg = new Group();
      leg.position.set(x, FLOOR + 0.02, z);
      group.add(leg);
      box(leg, [0.045, 0.55, 0.045], [0, 0.275, 0], blue);
      legs.push(leg);
    }
  const seat = new Group();
  group.add(seat);
  box(seat, [1.25, 0.04, 0.8], [0, 0, 0.5], orange);
  const reader = new Group();
  reader.position.set(0, 0.025, 0.7);
  seat.add(reader);
  box(reader, [0.26, 0.32, 0.025], [0, 0.23, 0], blue);
  const head = new Mesh(new CircleGeometry(0.12, 24), blue);
  head.position.set(0.03, 0.5, 0.02);
  reader.add(head);
  const book = box(reader, [0.3, 0.02, 0.22], [0, 0.21, 0.16], ivory);
  book.rotation.x = -0.3;
  for (const x of [-0.08, 0.08]) {
    box(reader, [0.09, 0.035, 0.26], [x, 0.025, 0.12], blue);
    box(reader, [0.08, 0.24, 0.025], [x, -0.09, 0.25], blue);
    box(reader, [0.11, 0.02, 0.12], [x, -0.215, 0.29], blue);
  }
  return {
    group,
    architectMaterials,
    pose(fold: number, angle: number, paperMode: boolean) {
      const pose = hingePose(fold, angle);
      spine.rotation.x = pose.wall;
      roof.rotation.x = pose.roof;
      for (const s of screens) s.group.rotation.z = s.side * (pose.side - Math.PI / 2);
      for (const leg of legs) leg.rotation.z = pose.seat - Math.PI / 2;
      seat.position.set(0.55 * Math.cos(pose.seat), FLOOR + 0.06 + 0.55 * Math.sin(pose.seat), 0);
      reader.rotation.x = (-(1 - Math.sin(pose.seat)) * Math.PI) / 2;
      for (const material of [ivory, orange, blue]) {
        material.transparent = paperMode;
        material.opacity = paperMode ? 0.55 : 1;
        material.depthWrite = !paperMode;
      }
    },
  };
}
