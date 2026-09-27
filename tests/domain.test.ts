import { describe, expect, test } from "bun:test";
import {
  BACK,
  configurationQuery,
  DEFAULT,
  DEPTH,
  FLOOR,
  HEIGHT,
  hingePose,
  librarySurfaces,
  observations,
  radians,
  rayHit,
  readConfiguration,
  roofOutline,
} from "../src/domain";

describe("paper mechanism and geometric brief", () => {
  test("the roof waits for the back wall to stand and reverses on the same path", () => {
    expect(hingePose(0, 20).wall).toBeCloseTo(-Math.PI / 2);
    expect(hingePose(0, 20).roof).toBeCloseTo(-Math.PI / 2);
    expect(hingePose(45, 20).wall).toBeCloseTo(0);
    expect(hingePose(45, 20).roof).toBeCloseTo(-Math.PI / 2);
    expect(hingePose(100, 20).roof).toBeCloseTo(-radians(20));
  });
  test("roof drawing dimensions agree with physical hinge endpoints", () => {
    const points = roofOutline({ ...DEFAULT, span: 4.8, roof: 32 });
    expect(points[0][0]).toBeCloseTo(-2.5);
    expect(points[2][1]).toBeCloseTo(FLOOR + HEIGHT + DEPTH * Math.sin(radians(32)));
    expect(points[2][2]).toBeCloseTo(BACK + DEPTH * Math.cos(radians(32)));
  });
  test("rain rays hit a canopy and miss the same plane outside its footprint", () => {
    const surfaces = librarySurfaces(DEFAULT);
    expect(rayHit([0, 0.67, 0.5], [0, 1, 0], surfaces)).not.toBeNull();
    expect(rayHit([9, 0.67, 0.5], [0, 1, 0], surfaces)).toBeNull();
  });
  test("shelter challenge has real failure, multiple valid solutions and an explained screen tradeoff", () => {
    expect(observations({ ...DEFAULT, span: 2.4, roof: 32, panel: "open" }).dry).toBeLessThan(0.96);
    expect(observations({ ...DEFAULT, span: 4.8, roof: 8, panel: "open" }).passed).toBe(true);
    expect(observations({ ...DEFAULT, span: 4.8, roof: 12, panel: "open" }).passed).toBe(true);
    expect(observations({ ...DEFAULT, panel: "vellum" }).view).toBeLessThan(2 / 3);
  });
  test("query validates hostile numeric inputs and round-trips a purposeful configuration", () => {
    const config = {
      ...DEFAULT,
      span: 4.4,
      roof: 12,
      panel: "open" as const,
      fold: 100,
      rain: true,
    };
    expect(readConfiguration(configurationQuery(config))).toEqual(config);
    const invalid = readConfiguration(
      "study=wrong&span=Infinity&roof=999&fold=-4&panel=bad&sun=NaN",
    );
    expect(invalid.study).toBe(DEFAULT.study);
    expect(invalid.span).toBe(DEFAULT.span);
    expect(invalid.roof).toBe(32);
    expect(invalid.fold).toBe(0);
    expect(invalid.sun).toBe(DEFAULT.sun);
  });
});
