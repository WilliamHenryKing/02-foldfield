import {
  CanvasTexture,
  CircleGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Path,
  PlaneGeometry,
  Shape,
  SRGBColorSpace,
} from "three";
import { type Configuration, clamp, FLOOR, radians, studyFor } from "../domain";
import { box, createLibrary, type PaperModel, paperGrain, pin, printTexture } from "./paper";

function base(c: Configuration) {
  const group = new Group(),
    grain = paperGrain();
  const paper = (color: string) =>
    new MeshStandardMaterial({
      color,
      roughness: 0.93,
      bumpMap: grain,
      bumpScale: 0.016,
      side: DoubleSide,
    });
  const ivory = paper("#f3efdf"),
    accent = paper(studyFor(c.study).color),
    blue = paper("#2340b2"),
    orange = paper("#ef633e"),
    pink = paper("#c988a9"),
    edge = paper("#d9cbb0"),
    metal = new MeshStandardMaterial({ color: 0x9ca9ab, metalness: 0.85, roughness: 0.32 });
  const architectMaterials = [ivory, accent, blue, orange, pink, edge, metal];
  box(group, [9.2, 0.08, 15], [0, 0, 0], edge);
  const top = new Mesh(
    new PlaneGeometry(9.2, 15),
    new MeshStandardMaterial({ map: printTexture(c), roughness: 0.94 }),
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.043;
  top.receiveShadow = true;
  group.add(top);
  box(group, [1.45, 0.035, 0.6], [0, 0.04, 7.6], blue).userData.foldTab = true;
  for (let i = 0; i < 3; i++) box(group, [0.45, 0.008, 0.023], [0, 0.062, 7.45 + i * 0.1], ivory);
  return { group, ivory, accent, blue, orange, pink, edge, metal, architectMaterials };
}
function foldingBench(
  parent: Group,
  width: number,
  depth: number,
  height: number,
  x: number,
  z: number,
  top: MeshStandardMaterial,
  frame: MeshStandardMaterial,
) {
  const legs: Group[] = [];
  for (const side of [-1, 1])
    for (const end of [-1, 1]) {
      const hinge = new Group();
      hinge.position.set(x + side * width * 0.4, FLOOR + 0.02, z + end * depth * 0.37);
      parent.add(hinge);
      box(hinge, [0.025, height, 0.035], [0, height / 2, 0], frame);
      legs.push(hinge);
    }
  const seat = box(parent, [width, 0.03, depth], [x, FLOOR + 0.05, z], top);
  return (p: number) => {
    const angle = (clamp((p - 0.55) / 0.35, 0, 1) * Math.PI) / 2;
    for (const leg of legs) leg.rotation.x = Math.PI / 2 - angle;
    seat.position.set(x, FLOOR + 0.055 + height * Math.sin(angle), z + height * Math.cos(angle));
  };
}
function sailShape() {
  const shape = new Shape();
  shape.moveTo(-0.46, -0.04);
  shape.lineTo(0.46, -0.04);
  shape.lineTo(0.39, -1.69);
  shape.quadraticCurveTo(0, -1.85, -0.39, -1.69);
  shape.closePath();
  const hole = new Path();
  hole.absarc(0, -0.8, 0.21, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}
function listening(c: Configuration): PaperModel {
  const kit = base(c),
    { group, metal, accent, blue, ivory } = kit;
  const portals: { root: Group; sail: Group }[] = [];
  for (let i = 0; i < 3; i++) {
    const root = new Group();
    root.position.set(-1.1 + i * 0.35, FLOOR + 0.015 * i, -1.4 + i * 1.3);
    group.add(root);
    for (const z of [-0.59, 0.59]) box(root, [0.055, 2.5, 0.06], [0, 1.25, z], metal);
    box(root, [0.06, 0.06, 1.24], [0, 2.5, 0], metal);
    pin(root, 1.26, [0, 0, 0], metal, "z");
    const sail = new Group();
    sail.position.y = 2.4;
    root.add(sail);
    const sheet = new Mesh(
      new ExtrudeGeometry(sailShape(), { depth: 0.026, bevelEnabled: false, curveSegments: 20 }),
      i === 1 ? blue : accent,
    );
    sheet.rotation.y = Math.PI / 2;
    sheet.castShadow = sheet.receiveShadow = true;
    sail.add(sheet);
    for (const z of [-0.34, 0.34]) pin(sail, 0.08, [0, -0.03, z], metal, "z");
    portals.push({ root, sail });
  }
  const bench = foldingBench(group, 2.8, 0.7, 0.5, 0.45, 1.95, ivory, blue);
  const disc = new Mesh(new CircleGeometry(0.48, 48), blue);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(1.65, 0.054, -0.6);
  group.add(disc);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f3efdf";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "#2340b2";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(110, 128, 32 + i * 26, -1, 1);
      ctx.stroke();
    }
    ctx.font = '800 34px "Barlow Condensed"';
    ctx.fillStyle = "#2340b2";
    ctx.fillText("LISTEN", 22, 233);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const print = new Mesh(
    new PlaneGeometry(1.4, 1.4),
    new MeshStandardMaterial({ map: texture, roughness: 1 }),
  );
  print.rotation.x = -Math.PI / 2;
  print.position.set(1.3, 0.056, -3.6);
  group.add(print);
  return {
    group,
    architectMaterials: kit.architectMaterials,
    pose(fold, _angle, paper, time, wind) {
      const p = fold / 100;
      for (let i = 0; i < portals.length; i++) {
        const portal = portals[i];
        if (!portal) continue;
        const rise = clamp((p - 0.05 - i * 0.07) / 0.55, 0, 1);
        portal.root.rotation.z = (-(1 - rise) * Math.PI) / 2;
        portal.sail.rotation.z = p > 0.9 ? Math.sin(time * 1.3 + i * 0.9) * (wind / 100) * 0.42 : 0;
      }
      bench(p);
      for (const m of [accent, blue, ivory]) {
        m.transparent = paper;
        m.opacity = paper ? 0.55 : 1;
        m.depthWrite = !paper;
      }
    },
  };
}
function theatre(c: Configuration): PaperModel {
  const kit = base(c),
    { group, metal, accent, orange, pink, blue, ivory } = kit;
  const wings: { wall: Group; roof: Group; index: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const wall = new Group();
    wall.position.set(-1.65 + i * 1.1, FLOOR, -1.5);
    group.add(wall);
    const color = [accent, orange, pink, orange][i] ?? accent;
    box(wall, [0.98, 2.3, 0.035], [0, 1.15, 0], color);
    pin(wall, 1.0, [0, 0, 0], metal);
    for (let stripe = 0; stripe < 3; stripe++)
      box(wall, [0.025, 1.8, 0.01], [-0.29 + stripe * 0.29, 1.3, 0.024], ivory);
    const roof = new Group();
    roof.position.y = 2.3;
    wall.add(roof);
    box(roof, [0.98, 0.036, 1.75], [0, 0, 0.875], color);
    pin(roof, 1.0, [0, 0, 0], metal);
    wings.push({ wall, roof, index: i });
  }
  const steps = Array.from({ length: 3 }, (_, i) =>
    foldingBench(group, 3.9, 0.55, 0.38 - i * 0.11, 0, -0.8 + i * 0.65, ivory, blue),
  );
  const benches = [
    foldingBench(group, 1.2, 0.45, 0.38, -1.1, 2.0, accent, blue),
    foldingBench(group, 1.2, 0.45, 0.38, 1.1, 2.0, pink, blue),
  ];
  const spot = new Mesh(new CircleGeometry(0.48, 48), orange);
  spot.rotation.x = -Math.PI / 2;
  spot.position.set(0, FLOOR + 0.45, -0.75);
  group.add(spot);
  return {
    group,
    architectMaterials: kit.architectMaterials,
    pose(fold, angle, paper) {
      const p = fold / 100;
      for (const { wall, roof, index } of wings) {
        const rise = clamp((p - 0.05) / 0.5, 0, 1);
        wall.rotation.x = (-(1 - rise) * Math.PI) / 2;
        wall.rotation.z = (1.5 - index) * 0.12 * clamp((p - 0.5) / 0.5, 0, 1);
        roof.rotation.x =
          -Math.PI / 2 + clamp((p - 0.58) / 0.42, 0, 1) * (Math.PI / 2 - radians(angle));
      }
      for (const update of [...steps, ...benches]) update(p);
      spot.position.y =
        FLOOR + 0.055 + 0.38 * Math.sin((clamp((p - 0.55) / 0.35, 0, 1) * Math.PI) / 2) + 0.016;
      spot.position.z = -0.8 + 0.38 * Math.cos((clamp((p - 0.55) / 0.35, 0, 1) * Math.PI) / 2);
      for (const m of [accent, orange, pink, ivory]) {
        m.transparent = paper;
        m.opacity = paper ? 0.55 : 1;
        m.depthWrite = !paper;
      }
    },
  };
}
export function createStudy(c: Configuration): PaperModel {
  return c.study === "rain-library"
    ? createLibrary(c)
    : c.study === "listening-pavilion"
      ? listening(c)
      : theatre(c);
}
