import { gsap } from "gsap";
import {
  AgXToneMapping,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PCFShadowMap,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { type Configuration, clamp, sunDirection } from "../domain";
import { disposeObject } from "./paper";
import { createRain } from "./rain";
import { createStudy } from "./studies";

export type TableState = { config: Configuration; paused: boolean; reduced: boolean };
export function createTable(
  container: HTMLElement,
  initial: TableState,
  onReady: () => void,
  onLost: () => void,
  onFold: (value: number) => void,
) {
  let state = initial,
    disposed = false,
    frame = 0,
    visible = true,
    dirty = true,
    first = true,
    broken = false;
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor("#e1e1dc");
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.localClippingEnabled = true;
  renderer.domElement.className = "table-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.append(renderer.domElement);
  const scene = new Scene();
  scene.background = new Color("#e1e1dc");
  const environment = new RoomEnvironment();
  const pmrem = new PMREMGenerator(renderer),
    env = pmrem.fromScene(environment, 0.07);
  environment.dispose();
  pmrem.dispose();
  scene.environment = env.texture;
  scene.environmentIntensity = 0.3;
  scene.add(new HemisphereLight(0xffffff, 0xd5c6c0, 1.25));
  const sun = new DirectionalLight(0xfff6df, 3.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -11;
  sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 11;
  sun.shadow.camera.bottom = -11;
  sun.shadow.normalBias = 0.018;
  sun.shadow.bias = -0.00006;
  scene.add(sun, sun.target);
  const ground = new Mesh(
    new PlaneGeometry(120, 120),
    new MeshStandardMaterial({ color: 0xe0dfd9, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.14;
  ground.receiveShadow = true;
  scene.add(ground);
  const mount = new Group();
  mount.rotation.y = -0.12;
  scene.add(mount);
  let model = createStudy(state.config),
    rain = createRain(state.config),
    revision = 0,
    transitioning = false,
    renderedStudy = state.config.study;
  mount.add(model.group);
  mount.add(rain.group);
  const camera = new OrthographicCamera(-8, 8, 6, -6, 0.1, 150),
    target = new Vector3(0, 0.5, 0);
  const values = { fold: state.config.fold, roof: state.config.roof, sun: state.config.sun };
  const cameraView = { zoom: 1 };
  const cut = new Plane(
    new Vector3(-1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), mount.rotation.y),
    0,
  );
  let width = 1,
    height = 1;
  let elapsed = 0,
    lastTick = performance.now();
  function rebuild() {
    mount.remove(model.group, rain.group);
    disposeObject(model.group);
    rain.dispose();
    model = createStudy(state.config);
    rain = createRain(state.config);
    renderedStudy = state.config.study;
    mount.add(model.group, rain.group);
  }
  function rebuildRain() {
    mount.remove(rain.group);
    rain.dispose();
    rain = createRain(state.config);
    mount.add(rain.group);
  }
  function wake() {
    dirty = true;
    if (!frame && !disposed && !broken && visible && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function pose(immediate = false) {
    const portrait = width < 700,
      view = state.config.view;
    const point =
      view === "plan"
        ? new Vector3(0.001, 24, 0.001)
        : view === "section"
          ? new Vector3(22, 2, 0.05)
          : view === "seat"
            ? new Vector3(4.8, 3.4, 7)
            : new Vector3(11, 15, 17);
    const aim = view === "object" ? new Vector3(0, 0.4, -0.5) : new Vector3(0, 1, 0.1);
    const zoom =
      view === "object"
        ? portrait
          ? 0.77
          : 1
        : view === "plan"
          ? 2.1
          : view === "seat"
            ? 2.8
            : 2.4;
    camera.up.set(0, view === "plan" ? 0 : 1, view === "plan" ? -1 : 0);
    const duration = immediate || state.reduced ? 0 : 1.1;
    gsap.to(camera.position, {
      x: point.x,
      y: point.y,
      z: point.z,
      duration,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: wake,
    });
    gsap.to(target, {
      x: aim.x,
      y: aim.y,
      z: aim.z,
      duration,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: wake,
    });
    gsap.to(cameraView, { zoom, duration, overwrite: true, onUpdate: wake });
  }
  function draw() {
    frame = 0;
    if (disposed || broken || !visible || document.hidden) return;
    dirty = false;
    const now = performance.now();
    if (!state.paused && !state.reduced) elapsed += Math.min(0.08, (now - lastTick) / 1000);
    lastTick = now;
    model.pose(values.fold, values.roof, state.config.paper, elapsed, state.config.wind);
    const raining =
      renderedStudy === "rain-library" &&
      state.config.rain &&
      values.fold > 99 &&
      Math.abs(values.roof - state.config.roof) < 0.1;
    rain.pose(elapsed, raining);
    container.dataset.fold = values.fold.toFixed(2);
    container.dataset.study = renderedStudy;
    for (const material of model.architectMaterials)
      material.clippingPlanes = state.config.view === "section" ? [cut] : [];
    const light = new Vector3(...sunDirection(values.sun)).multiplyScalar(12);
    light.applyAxisAngle(new Vector3(0, 1, 0), mount.rotation.y);
    sun.position.copy(light);
    sun.target.position.set(0, 0, 0);
    camera.lookAt(target);
    const approach = Math.max(0, Math.min(1, (values.fold - 68) / 32));
    camera.zoom =
      cameraView.zoom *
      (state.config.view === "object" ? 1 + 1.25 * approach * approach * (3 - 2 * approach) : 1);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    if (first) {
      first = false;
      onReady();
    }
    if (
      dirty ||
      (!state.paused &&
        !state.reduced &&
        (raining ||
          (renderedStudy === "listening-pavilion" && values.fold > 90 && state.config.wind > 0)))
    )
      wake();
  }
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    renderer.setSize(width, height);
    const aspect = width / height;
    const half = width < 700 ? 8.8 : 6.8;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    pose(true);
    wake();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { rootMargin: "100px" },
  );
  intersection.observe(container);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  };
  document.addEventListener("visibilitychange", visibility);
  const lost = (event: Event) => {
    event.preventDefault();
    broken = true;
    cancelAnimationFrame(frame);
    frame = 0;
    onLost();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const ray = new Raycaster(),
    pointer = new Vector2();
  let drag: { y: number; fold: number; moved: boolean } | null = null;
  const pointerDown = (event: PointerEvent) => {
    if (state.config.view !== "object") return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    if (!ray.intersectObject(model.group, true).some((hit) => hit.object.userData.foldTab)) return;
    event.preventDefault();
    drag = { y: event.clientY, fold: state.config.fold, moved: false };
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent) => {
    if (!drag) return;
    const delta = event.clientY - drag.y;
    if (Math.abs(delta) > 6) drag.moved = true;
    if (drag.moved) onFold(Math.round(clamp(drag.fold + delta * 0.65, 0, 100)));
  };
  const pointerUp = () => {
    if (drag && !drag.moved) onFold(state.config.fold < 100 ? 100 : 0);
    drag = null;
  };
  const pointerCancel = () => {
    drag = null;
  };
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointermove", pointerMove);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  renderer.domElement.addEventListener("pointercancel", pointerCancel);
  resize();
  cancelAnimationFrame(frame);
  frame = 0;
  draw();
  let detachInspection: (() => void) | undefined;
  if (import.meta.env.DEV || import.meta.env.MODE === "visual-test") {
    void Promise.all([import("../visual/inspection"), import("../visual/bookmarks")]).then(
      ([{ installInspection }, { BOOKMARKS }]) => {
        if (disposed) return;
        let inspectionCamera: (typeof BOOKMARKS)[number]["camera"];
        const freeze = () => {
          state = { ...state, paused: true, reduced: true };
          elapsed = 0;
          gsap.killTweensOf(values);
          gsap.killTweensOf(camera.position);
          gsap.killTweensOf(target);
          gsap.killTweensOf(cameraView);
          values.fold = state.config.fold;
          values.roof = state.config.roof;
          values.sun = state.config.sun;
          cancelAnimationFrame(frame);
          frame = 0;
        };
        const render = () => {
          const wasVisible = visible;
          visible = true;
          draw();
          visible = wasVisible;
          if (inspectionCamera) {
            camera.position.set(...inspectionCamera.position);
            target.set(...inspectionCamera.target);
            camera.lookAt(target);
            camera.zoom = inspectionCamera.zoom;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
          }
        };
        detachInspection = installInspection({
          renderer,
          scene,
          camera,
          bookmarks: BOOKMARKS,
          freeze,
          render,
          current: () => ({ ...state, elapsed, inspectionCamera: !!inspectionCamera }),
          apply: async (id) => {
            const bookmark = BOOKMARKS.find((item) => item.id === id);
            if (!bookmark) throw new Error(`Unknown bookmark: ${id}`);
            window.dispatchEvent(
              new CustomEvent("foldfield-visual-state", { detail: bookmark.config }),
            );
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            );
            revision++;
            transitioning = false;
            state = { config: { ...bookmark.config }, paused: true, reduced: true };
            freeze();
            rebuild();
            model.group.traverse((object) => {
              object.userData.visualFamily = `${state.config.study} paper and fittings`;
            });
            rain.group.traverse((object) => {
              object.userData.visualFamily = "rain and shelter markers";
            });
            ground.userData.visualFamily = "studio ground";
            inspectionCamera = bookmark.camera;
            pose(true);
            render();
          },
          lighting: async (name) => {
            const sun = { low: 15, studio: 55, sunset: 145 }[name];
            if (sun === undefined) throw new Error(`Unknown lighting state: ${name}`);
            state = { ...state, config: { ...state.config, sun } };
            freeze();
            render();
            window.dispatchEvent(
              new CustomEvent("foldfield-visual-state", { detail: state.config }),
            );
          },
        });
      },
    );
  }
  return {
    update(next: TableState) {
      const previous = state;
      state = next;
      if (previous.config.study !== next.config.study) {
        const selection = ++revision;
        transitioning = true;
        gsap.killTweensOf(values);
        gsap.to(values, {
          fold: 0,
          duration: next.reduced ? 0 : 1.15,
          ease: "power2.inOut",
          onUpdate: wake,
          onComplete: () => {
            if (disposed || selection !== revision) return;
            rebuild();
            transitioning = false;
            values.roof = state.config.roof;
            values.sun = state.config.sun;
            gsap.to(values, {
              fold: state.config.fold,
              duration: state.reduced ? 0 : 2.6,
              ease: "power2.inOut",
              overwrite: true,
              onUpdate: wake,
            });
            wake();
          },
        });
      } else if (
        !transitioning &&
        (previous.config.span !== next.config.span || previous.config.panel !== next.config.panel)
      )
        rebuild();
      if (previous.config.roof !== next.config.roof && !transitioning) rebuildRain();
      if (previous.config.view !== next.config.view || previous.reduced !== next.reduced) pose();
      if (transitioning) {
        wake();
        return;
      }
      if (previous.paused !== next.paused || previous.reduced !== next.reduced)
        lastTick = performance.now();
      if (
        previous.config.fold !== next.config.fold ||
        previous.config.roof !== next.config.roof ||
        previous.config.sun !== next.config.sun ||
        previous.reduced !== next.reduced
      )
        gsap.to(values, {
          fold: next.config.fold,
          roof: next.config.roof,
          sun: next.config.sun,
          duration: next.reduced ? 0 : Math.abs(next.config.fold - values.fold) > 20 ? 2.6 : 0.4,
          ease: "power2.inOut",
          overwrite: true,
          onUpdate: wake,
        });
      wake();
    },
    capture() {
      if (transitioning) {
        revision++;
        transitioning = false;
        gsap.killTweensOf(values);
        rebuild();
      }
      model.pose(
        state.config.fold,
        state.config.roof,
        state.config.paper,
        elapsed,
        state.config.wind,
      );
      rain.pose(elapsed, false);
      const captureCamera = new OrthographicCamera(-12, 12, 6, -6, 0.1, 100);
      captureCamera.position.set(11, 15, 17);
      captureCamera.lookAt(0, 0.5, -0.5);
      captureCamera.zoom = state.config.fold > 90 ? 1.75 : 1;
      captureCamera.updateProjectionMatrix();
      const ratio = renderer.getPixelRatio();
      try {
        renderer.setPixelRatio(1);
        renderer.setSize(1600, 800, false);
        renderer.render(scene, captureCamera);
        return renderer.domElement.toDataURL("image/png");
      } finally {
        renderer.setPixelRatio(ratio);
        renderer.setSize(width, height, false);
        wake();
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      detachInspection?.();
      cancelAnimationFrame(frame);
      gsap.killTweensOf(values);
      gsap.killTweensOf(camera);
      gsap.killTweensOf(cameraView);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerCancel);
      disposeObject(model.group);
      rain.dispose();
      ground.geometry.dispose();
      (ground.material as MeshStandardMaterial).dispose();
      sun.shadow.dispose();
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      scene.clear();
    },
  };
}
