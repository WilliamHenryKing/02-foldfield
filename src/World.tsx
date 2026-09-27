import { useEffect, useRef, useState } from "react";
import type { TableState } from "./world/table";

export function World({
  state,
  onCapture,
  onReady,
  onFold,
}: {
  state: TableState;
  onCapture?: (fn: (() => string) | null) => void;
  onReady?: () => void;
  onFold?: (value: number) => void;
}) {
  const container = useRef<HTMLDivElement>(null),
    latest = useRef(state),
    engine = useRef<ReturnType<typeof import("./world/table")["createTable"]> | null>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0);
  latest.current = state;
  const callbacks = useRef({ onCapture, onReady, onFold });
  callbacks.current = { onCapture, onReady, onFold };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry intentionally recreates a failed renderer.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setFailed(false);
    async function prepare() {
      try {
        const { createTable } = await import("./world/table");
        await document.fonts.ready;
        if (cancelled || !container.current) return;
        engine.current = createTable(
          container.current,
          latest.current,
          () => {
            if (!cancelled) {
              setReady(true);
              callbacks.current.onReady?.();
            }
          },
          () => {
            if (!cancelled) {
              setFailed(true);
              callbacks.current.onCapture?.(null);
            }
          },
          (value) => callbacks.current.onFold?.(value),
        );
        callbacks.current.onCapture?.(() => engine.current?.capture() ?? "");
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void prepare();
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
      callbacks.current.onCapture?.(null);
    };
  }, [retry]);
  useEffect(() => {
    engine.current?.update(state);
  }, [state]);
  return (
    <div className={`scene ${ready ? "ready" : ""} ${failed ? "failed" : ""}`}>
      <picture className="scene-poster">
        <source
          media="(max-width:850px)"
          srcSet={`/plates/${state.config.study}-${state.config.fold < 1 ? "flat" : "open"}-phone.jpg`}
        />
        <img
          src={`/plates/${state.config.study}-${state.config.fold < 1 ? "flat" : "open"}.jpg`}
          alt=""
        />
      </picture>
      <div className="scene-mount" ref={container} />
      {!ready && !failed && (
        <div className="scene-message" role="status">
          Scoring the paper. Setting the light.
        </div>
      )}
      {failed && (
        <div className="scene-message">
          <p>
            The live model is unavailable. This saved studio view stays as a reference; your
            controls and drawings still work.
          </p>
          <button type="button" onClick={() => setRetry(retry + 1)}>
            Try the model again ↻
          </button>
        </div>
      )}
    </div>
  );
}
