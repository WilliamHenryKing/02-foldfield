import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
} from "three";
import {
  type Configuration,
  FLOOR,
  librarySurfaces,
  RAIN_DIRECTION,
  rayHit,
  seatSamples,
  type Vec3,
} from "../domain";

export function createRain(config: Configuration) {
  const group = new Group(),
    surfaces = librarySurfaces(config),
    positions = new Float32Array(96 * 6),
    geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  const lines = new LineSegments(
    geometry,
    new LineBasicMaterial({ color: 0x4569ac, transparent: true, opacity: 0.45 }),
  );
  group.add(lines);
  const paths = Array.from({ length: 96 }, (_, i) => {
    const x = (((i * 37) % 97) / 97) * 6 - 3,
      z = (((i * 61) % 89) / 89) * 5 - 2,
      origin: Vec3 = [x, 5, z],
      direction: Vec3 = [0.85, -1, -0.25];
    return {
      origin,
      direction,
      hit: rayHit(origin, direction, surfaces) ?? 5 - FLOOR,
      offset: (i * 0.618) % 1,
    };
  });
  for (const point of seatSamples()) {
    const dry = rayHit(point, RAIN_DIRECTION, surfaces) !== null;
    const dot = new Mesh(
      new CircleGeometry(0.047, 12),
      new MeshBasicMaterial({ color: dry ? 0x1f947d : 0xdb493b }),
    );
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(...point);
    group.add(dot);
  }
  return {
    group,
    pose(time: number, show: boolean) {
      group.visible = show;
      if (!show) return;
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (!path) continue;
        const t = ((time * 0.7 + path.offset) % 1) * path.hit;
        for (let k = 0; k < 2; k++)
          for (let a = 0; a < 3; a++)
            positions[i * 6 + k * 3 + a] =
              (path.origin[a] ?? 0) + (path.direction[a] ?? 0) * Math.min(path.hit, t + k * 0.14);
      }
      const attribute = geometry.getAttribute("position");
      attribute.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      (lines.material as LineBasicMaterial).dispose();
      group.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          (object.material as MeshBasicMaterial).dispose();
        }
      });
      group.clear();
    },
  };
}
