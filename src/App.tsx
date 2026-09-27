import { gsap } from "gsap";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Drawings } from "./Drawings";
import {
  type Configuration,
  clamp,
  configurationQuery,
  DEFAULT,
  DEPTH,
  observations,
  type Panel,
  readConfiguration,
  resetStudy,
  STORAGE_KEY,
  STUDIES,
  type StudyId,
  studyFor,
  type View,
} from "./domain";
import { downloadPostcard } from "./export";
import { pageTitle, ROUTES } from "./routes";
import { World } from "./World";
import "./style.css";

function Range({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-control" htmlFor={id}>
      <span>{label}</span>
      <output htmlFor={id}>
        {step < 1 ? value.toFixed(1) : value}
        {unit}
      </output>
      <input
        id={id}
        aria-label={label}
        aria-valuetext={`${value}${unit}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
function StudyGlyph({ id }: { id: StudyId }) {
  return (
    <svg viewBox="0 0 240 180" role="img" aria-label={`${studyFor(id).title} paper illustration`}>
      <title>{studyFor(id).title}</title>
      <path d="m22 130 102-69 98 53-103 60Z" fill="#f4f0df" stroke="#203ba5" />
      {id === "rain-library" ? (
        <>
          <path d="m92 120 61-35V46L92 81Z" fill="#233dac" />
          <path d="m39 78 64 33 86-55-68-24Z" fill="#ef633e" stroke="#233dac" />
          <path d="m52 133 34 18 30-19-33-17Z" fill="#ef633e" />
          <path
            d="m45 128 0-31m13 39V103m14 42v-35m53 22V95m13 30V87m13 31V79"
            stroke="#233dac"
            strokeWidth="2"
          />
        </>
      ) : id === "listening-pavilion" ? (
        [0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${45 + i * 39},${48 - i * 7})`}>
            <path d="M0 77V0h39v77" fill="none" stroke="#233dac" strokeWidth="3" />
            <path d="M5 6h29v53q-14 10-29 0Z" fill={i === 1 ? "#233dac" : "#b9ca45"} />
            <circle cx="19" cy="29" r="7" fill="#f4f0df" />
          </g>
        ))
      ) : (
        <>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${70 + i * 25} 119v-66l-10-25 24-9 12 25v62Z`}
              fill={i % 2 ? "#ef633e" : "#b29acb"}
              stroke="#233dac"
            />
          ))}
          <path d="m45 138 83-43 39 23-81 46Z" fill="#f4f0df" stroke="#233dac" />
        </>
      )}
    </svg>
  );
}
function Link({
  to,
  config,
  navigate,
  children,
  className = "",
}: {
  to: string;
  config: Configuration;
  navigate: (path: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={`${to}?${configurationQuery(config)}`}
      className={className}
      onClick={(event) => {
        if (
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.shiftKey
        ) {
          event.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
}

export function App({ initialPath = "/" }: { initialPath?: string }) {
  const [path, setPath] = useState(initialPath),
    [config, setConfig] = useState<Configuration>(DEFAULT),
    [configured, setConfigured] = useState(false);
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [message, setMessage] = useState(""),
    [challenge, setChallenge] = useState(false),
    [hint, setHint] = useState(0),
    [completed, setCompleted] = useState(false),
    [tested, setTested] = useState(false),
    [worldReady, setWorldReady] = useState(false),
    [exporting, setExporting] = useState(false);
  const capture = useRef<(() => string) | null>(null),
    main = useRef<HTMLElement>(null),
    intro = useRef(false),
    autoEligible = useRef(false),
    gesture = useRef<{ y: number; fold: number; moved: boolean } | null>(null),
    suppressClick = useRef(false);
  const update = useCallback(
    (change: Partial<Configuration>) => setConfig((current) => ({ ...current, ...change })),
    [],
  );
  useEffect(() => {
    if (!import.meta.env.DEV && import.meta.env.MODE !== "visual-test") return;
    const apply = (event: Event) => {
      intro.current = true;
      autoEligible.current = false;
      setConfig((event as CustomEvent<Configuration>).detail);
      setPaused(true);
      setReduced(true);
    };
    addEventListener("foldfield-visual-state", apply);
    return () => removeEventListener("foldfield-visual-state", apply);
  }, []);
  const navigate = useCallback(
    (next: string) => {
      history.pushState(null, "", `${next}?${configurationQuery(config)}`);
      setPath(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => main.current?.focus({ preventScroll: true }));
    },
    [config],
  );
  useEffect(() => {
    autoEligible.current = !new URLSearchParams(location.search).has("fold");
    setPath(location.pathname.replace(/\/$/, "") || "/");
    setConfig(readConfiguration(location.search));
    setConfigured(true);
    const pop = () => {
      setPath(location.pathname.replace(/\/$/, "") || "/");
      setConfig(readConfiguration(location.search));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    addEventListener("popstate", pop);
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const change = () => setReduced(query.matches);
    query.addEventListener("change", change);
    return () => {
      removeEventListener("popstate", pop);
      query.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    if (configured) history.replaceState(null, "", `${path}?${configurationQuery(config)}`);
  }, [configured, config, path]);
  useEffect(() => {
    document.title = pageTitle(path);
  }, [path]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A route arrival triggers an authored, scoped text reveal.
  useEffect(() => {
    if (!configured || reduced) return;
    const elements = main.current?.querySelectorAll(".arrival-copy");
    if (!elements?.length) return;
    const animation = gsap.fromTo(
      elements,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power2.out" },
    );
    return () => {
      animation.kill();
    };
  }, [path, configured, reduced]);
  // A single introductory fold; saved/shared states are never overridden.
  useEffect(() => {
    if (!worldReady || !configured || intro.current) return;
    intro.current = true;
    if (!autoEligible.current || path !== "/" || config.fold !== 0) return;
    const timer = setTimeout(() => update({ fold: 100 }), 900);
    return () => clearTimeout(timer);
  }, [worldReady, configured, path, config.fold, update]);
  const onCapture = useCallback((fn: (() => string) | null) => {
      capture.current = fn;
    }, []),
    onReady = useCallback(() => setWorldReady(true), []);
  const state = useMemo(() => ({ config, paused, reduced }), [config, paused, reduced]),
    study = studyFor(config.study),
    metrics = useMemo(() => observations(config), [config]);
  const rain = config.study === "rain-library",
    showWorld = ["/", "/studio", "/brief"].includes(path),
    stamp = rain && completed && metrics.passed;
  const choose = (id: StudyId, enter = false) => {
    intro.current = true;
    setConfig({ ...resetStudy(id), fold: 100 });
    setTested(false);
    setCompleted(false);
    setHint(0);
    if (enter) navigate("/studio");
  };
  const openStudio = () => {
    update({ fold: 100 });
    navigate("/studio");
  };
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, configurationQuery(config));
      setMessage("Your postcard is saved on this device.");
    } catch {
      setMessage("Saving is unavailable. Your choices are still in the address bar.");
    }
  };
  const restore = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setMessage("No saved postcard yet. Make a place, then save it here.");
        return;
      }
      setConfig(readConfiguration(saved));
      intro.current = true;
      setMessage("Your saved place is back on the table.");
    } catch {
      setMessage("This browser cannot read saved postcards. You can keep using the studio.");
    }
  };
  const makeBrief = () => {
    intro.current = true;
    update({ fold: 0, view: "object", rain: false, paper: false });
    navigate("/brief");
  };
  const exportCard = async () => {
    setExporting(true);
    try {
      await downloadPostcard(config, capture.current);
      setMessage("Your postcard is ready. Nothing was sent anywhere.");
    } catch {
      setMessage("The postcard could not be drawn. The printable brief is still available.");
    } finally {
      setExporting(false);
    }
  };
  const replay = () => {
    setConfig({
      ...resetStudy("rain-library"),
      span: 2.4,
      roof: 32,
      panel: "open",
      fold: 100,
      rain: true,
    });
    setCompleted(false);
    setTested(false);
    setHint(0);
  };
  const views = (
    <div className="view-switch">
      {(["object", "plan", "section", "seat"] as View[]).map((view) => (
        <button
          key={view}
          type="button"
          aria-pressed={config.view === view}
          onClick={() => update({ view, fold: view === "object" ? config.fold : 100 })}
        >
          {view === "object" ? "The object" : view === "seat" ? "Inhabit" : `The ${view}`}
        </button>
      ))}
    </div>
  );
  const foldControls = (
    <div className="tab-control">
      <button
        type="button"
        className="pull-tab"
        aria-label={config.fold < 100 ? "Pull to make a place" : "Fold it away"}
        onPointerDown={(e) => {
          gesture.current = { y: e.clientY, fold: config.fold, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const drag = gesture.current;
          if (!drag) return;
          const delta = e.clientY - drag.y;
          if (Math.abs(delta) > 6) drag.moved = true;
          if (drag.moved) {
            intro.current = true;
            update({ fold: Math.round(clamp(drag.fold + delta * 0.65, 0, 100)) });
          }
        }}
        onPointerUp={() => {
          suppressClick.current = gesture.current?.moved ?? false;
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
          suppressClick.current = true;
        }}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          intro.current = true;
          update({ fold: config.fold < 100 ? 100 : 0, view: "object" });
        }}
      >
        <span>{config.fold < 100 ? "PULL TO MAKE A PLACE" : "FOLD IT AWAY"}</span>
        <span aria-hidden="true">↓</span>
      </button>
      <Range
        id="unfold"
        label="Unfold"
        value={config.fold}
        min={0}
        max={100}
        unit="%"
        onChange={(fold) => {
          intro.current = true;
          update({ fold });
        }}
      />
    </div>
  );
  const model = (
    <div className={`studio-stage ${path === "/brief" ? "brief-stage" : ""}`}>
      <section className="worktable" aria-label={`${study.title} interactive paper model`}>
        <World
          state={state}
          onCapture={onCapture}
          onReady={onReady}
          onFold={(fold) => {
            intro.current = true;
            update({ fold });
          }}
        />
        {path !== "/brief" && (
          <div className="study-index">
            {STUDIES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-label={s.title}
                aria-pressed={config.study === s.id}
                onClick={() => choose(s.id)}
              >
                {s.number}
                <span>{s.title.replace("The ", "")}</span>
              </button>
            ))}
          </div>
        )}
        <div className="model-note">
          <span>
            {config.fold < 1
              ? "FLAT / READY TO BECOME A PLACE"
              : config.fold < 100
                ? "A FOLD BETWEEN TWO STATES"
                : config.view === "section"
                  ? "SECTION / HALF THE SHEET REMOVED"
                  : "OPEN / COME A LITTLE CLOSER"}
          </span>
          <span>{study.number} / ORIGINAL PAPER STUDY</span>
        </div>
      </section>
      {path !== "/brief" && (
        <>
          {foldControls}
          {views}
        </>
      )}
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the paper studio
      </a>
      <header className="masthead">
        <Link to="/" config={config} navigate={navigate} className="wordmark">
          FOLDFIELD<span aria-hidden="true">↗</span>
        </Link>
        <p>
          SMALL PLACES.
          <br />
          BIG POSSIBILITIES.
        </p>
        <nav aria-label="Main navigation">
          <Link to="/" config={config} navigate={navigate}>
            The studies
          </Link>
          <Link to="/studio" config={config} navigate={navigate}>
            The studio
          </Link>
          <Link to="/about" config={config} navigate={navigate}>
            About the folds
          </Link>
        </nav>
        <span className="edition">
          PAPER STUDIES
          <br />
          VOL. 01 / 2026
        </span>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        {showWorld && (
          <div className="specimen-heading">
            <p className="eyebrow arrival-copy">
              {path === "/brief"
                ? "A SMALL PLACE, ON PAPER"
                : `${study.number} / ${study.purpose.toUpperCase()}`}
            </p>
            <h1 className="arrival-copy">
              {path === "/brief" ? "Yours to unfold." : study.title}
              <span className="asterisk" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="arrival-copy">
              {path === "/brief"
                ? "A postcard and a clear starting point. Your choices, all in one place."
                : study.short}
              <br />
              {path === "/"
                ? "Pull, click or use the fold slider."
                : "An idea you can get your hands on."}
            </p>
          </div>
        )}
        {path === "/" && (
          <>
            {model}
            <section className="intro-strip">
              <h2 className="arrival-copy">
                Space starts
                <br />
                with a fold.
              </h2>
              <div>
                <p>{study.copy}</p>
                <button type="button" className="solid-action" onClick={openStudio}>
                  Make this place your own <span>↗</span>
                </button>
                <p className="micro">Three original studies. One small paper studio.</p>
              </div>
            </section>
            <section className="archive" aria-label="Three places to begin">
              <div className="section-line">
                <span>THE POSTCARD ARCHIVE</span>
                <span>01—03 / CHOOSE A MOMENT</span>
              </div>
              <div className="study-cards">
                {STUDIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="study-card"
                    style={{ "--study": s.color } as CSSProperties}
                    onClick={() => choose(s.id, true)}
                  >
                    <span className="card-number">{s.number} / FOLDFIELD</span>
                    <StudyGlyph id={s.id} />
                    <strong>{s.title}</strong>
                    <span>{s.purpose} ↗</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
        {path === "/studio" && (
          <>
            <div className="studio-layout">
              {model}
              <aside className="studio-controls" aria-label="Configure the selected study">
                <p className="eyebrow">DESIGN FOR A MOMENT</p>
                <h2>
                  {study.purpose}
                  <span>.</span>
                </h2>
                <p>{study.short} Every choice changes the paper model.</p>
                <div className="controls">
                  {rain && (
                    <>
                      <Range
                        id="span"
                        label="Clear span"
                        value={config.span}
                        min={2.4}
                        max={4.8}
                        step={0.2}
                        unit=" m"
                        onChange={(span) => update({ span })}
                      />
                      <Range
                        id="roof"
                        label="Roof rise"
                        value={config.roof}
                        min={8}
                        max={32}
                        unit="°"
                        onChange={(roof) => update({ roof })}
                      />
                      <label className="select-label" htmlFor="panel">
                        Side screens
                        <select
                          id="panel"
                          aria-label="Side screens"
                          value={config.panel}
                          onChange={(e) => update({ panel: e.target.value as Panel })}
                        >
                          <option value="open">Open edges — keep the horizon</option>
                          <option value="slatted">Paper fins — a filtered view</option>
                          <option value="vellum">Vellum — softly enclosed</option>
                        </select>
                      </label>
                    </>
                  )}
                  {config.study === "listening-pavilion" && (
                    <Range
                      id="wind"
                      label="Breeze"
                      value={config.wind}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(wind) => update({ wind })}
                    />
                  )}{" "}
                  {config.study === "sunset-theatre" && (
                    <Range
                      id="canopy"
                      label="Canopy rise"
                      value={config.roof}
                      min={8}
                      max={32}
                      unit="°"
                      onChange={(roof) => update({ roof })}
                    />
                  )}
                  <Range
                    id="sun"
                    label="Sun position"
                    value={config.sun}
                    min={15}
                    max={165}
                    unit="°"
                    onChange={(sun) => update({ sun })}
                  />
                  <p className="micro">15° morning → 90° overhead → 165° late light.</p>
                  <div className="button-row">
                    <button
                      type="button"
                      aria-pressed={config.paper}
                      onClick={() => update({ paper: !config.paper })}
                    >
                      Paper prototype
                    </button>
                    {rain && (
                      <button
                        type="button"
                        aria-pressed={config.rain}
                        onClick={() => update({ rain: !config.rain, fold: 100 })}
                      >
                        Rain study
                      </button>
                    )}
                  </div>
                </div>
                {rain ? (
                  <div className="metric-ledger">
                    <div>
                      <span>Dry seat</span>
                      <strong>{Math.round(metrics.dry * 100)}%</strong>
                    </div>
                    <div>
                      <span>Side view retained</span>
                      <strong>{Math.round(metrics.view * 100)}%</strong>
                    </div>
                    <div>
                      <span>Seat in shade</span>
                      <strong>{Math.round(metrics.shade * 100)}%</strong>
                    </div>
                    <p>
                      Measured at the open pose using the drawn sheets, seat samples and light
                      direction. An authored study, not weather engineering.
                    </p>
                  </div>
                ) : (
                  <div className="material-note">
                    <strong>
                      {config.study === "listening-pavilion"
                        ? "A breeze made visible."
                        : "The light is part of the cast."}
                    </strong>
                    <p>
                      {config.study === "listening-pavilion"
                        ? "Three inset sails swing about their upper pins. Pause the movement to inspect the quieter space between them."
                        : "Rotate the sun and alter the canopy rise. The four real wings cast different shadows across the stage."}
                    </p>
                  </div>
                )}
                <button type="button" className="solid-action" onClick={makeBrief}>
                  Make my project brief <span>↗</span>
                </button>
                <div className="utility-links">
                  <button type="button" onClick={save}>
                    Save on this device
                  </button>
                  <button type="button" onClick={restore}>
                    Restore a postcard
                  </button>
                  <button type="button" onClick={() => choose(config.study)}>
                    Reset this study
                  </button>
                </div>
              </aside>
            </div>
            <div className="motion-tools">
              <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
                {paused ? "Resume the atmosphere" : "Pause the atmosphere"}
              </button>
              <button type="button" aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
                Gentle motion {reduced ? "on" : "off"}
              </button>
              <span>Silent by design. Every cue is visible.</span>
            </div>
            <section className="drawing-section">
              <div className="section-line">
                <span>SAME PLACE / ANOTHER WAY TO SEE IT</span>
                <span>PLAN + SECTION</span>
              </div>
              <Drawings config={config} />
            </section>
            {rain && (
              <section className={`challenge ${stamp ? "completed" : ""}`}>
                <div>
                  <p className="eyebrow">AN OPTIONAL LITTLE DESIGN CHALLENGE</p>
                  <h2>
                    A dry page.
                    <br />
                    An open horizon.
                  </h2>
                  <p>Can you shelter the marked reading seat without closing the place off?</p>
                  {!challenge ? (
                    <button
                      type="button"
                      onClick={() => {
                        setChallenge(true);
                        update({ rain: true, fold: 100 });
                      }}
                    >
                      Try the shelter challenge ↗
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setChallenge(false)}
                    >
                      Put the challenge away
                    </button>
                  )}
                </div>
                {challenge && (
                  <div className="challenge-work">
                    <ul className="conditions">
                      <li data-pass={metrics.dry >= 0.96}>
                        <span>{metrics.dry >= 0.96 ? "✓" : "○"}</span> Keep at least 96% of the seat
                        dry <strong>{Math.round(metrics.dry * 100)}%</strong>
                      </li>
                      <li data-pass={metrics.view >= 2 / 3}>
                        <span>{metrics.view >= 2 / 3 ? "✓" : "○"}</span> Keep two thirds of the side
                        view <strong>{Math.round(metrics.view * 100)}%</strong>
                      </li>
                    </ul>
                    <p className="micro">
                      Green dots in the rain study are covered seat samples; coral dots still meet
                      the shower. You can solve this with more than one configuration.
                    </p>
                    <div className="button-row">
                      <button
                        type="button"
                        className="solid-action"
                        onClick={() => {
                          setTested(true);
                          setCompleted(metrics.passed);
                          setMessage(
                            metrics.passed
                              ? "A dry page and an open horizon. Your shelter is stamped."
                              : "Almost a place. Check the two conditions below.",
                          );
                        }}
                      >
                        Test my shelter
                      </button>
                      <button type="button" onClick={() => setHint((h) => Math.min(h + 1, 3))}>
                        A small hint
                      </button>
                      <button type="button" onClick={replay}>
                        Start again
                      </button>
                    </div>
                    {hint > 0 && (
                      <p className="hint" role="status">
                        {hint === 1
                          ? "Follow the drawn rain direction. The shower arrives from the left, so roof width matters."
                          : hint === 2
                            ? "A high roof lets the slanted rain travel farther sideways before it meets the seat. Try a gentler rise."
                            : "Try a 4.8 m span, an 8° rise and open edges. Then see how much you can change while keeping both conditions."}
                      </p>
                    )}
                    {tested && !metrics.passed && (
                      <p className="challenge-feedback">
                        {metrics.dry < 0.96
                          ? "Some seat samples still meet the shower. Widen the roof or reduce its rise. "
                          : ""}
                        {metrics.view < 2 / 3
                          ? "The side screen hides too much of the horizon. Try paper fins or open edges."
                          : ""}
                      </p>
                    )}
                    {stamp && (
                      <div className="earned-stamp" role="status">
                        <span>FOLDFIELD / FIELD TEST 01</span>
                        <strong>
                          A PLACE
                          <br />
                          WELL MADE.
                        </strong>
                        <span>DRY PAGE. OPEN HORIZON.</span>
                        <button type="button" onClick={makeBrief}>
                          Keep this little place ↗
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
        {path === "/brief" && (
          <>
            <div className="brief-layout">
              {model}
              <article className="brief-copy">
                <p className="eyebrow">POSTCARD {study.number} / YOUR PROJECT BRIEF</p>
                <h2>{study.title}</h2>
                <p className="brief-purpose">{study.purpose}.</p>
                <dl>
                  <div>
                    <dt>Made from</dt>
                    <dd>
                      Coloured card, scored folds and aluminium pins
                      {rain && config.panel === "vellum" ? ", with vellum screens" : ""}.
                    </dd>
                  </div>
                  {rain ? (
                    <>
                      <div>
                        <dt>Clear span</dt>
                        <dd>{config.span.toFixed(1)} m</dd>
                      </div>
                      <div>
                        <dt>Roof sheet / rise</dt>
                        <dd>
                          {`${DEPTH.toFixed(1)} m`} / {config.roof}°
                        </dd>
                      </div>
                      <div>
                        <dt>Side screens</dt>
                        <dd>
                          {config.panel === "open"
                            ? "Open edges"
                            : config.panel === "slatted"
                              ? "Paper fins"
                              : "Vellum sheets"}
                        </dd>
                      </div>
                      <div>
                        <dt>At the drawn shower</dt>
                        <dd>
                          {Math.round(metrics.dry * 100)}% of seat samples covered;{" "}
                          {Math.round(metrics.view * 100)}% of the side view retained.
                        </dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <dt>Construction</dt>
                        <dd>
                          {config.study === "listening-pavilion"
                            ? "Three 2.5 m portals, inset pivoting sails and a linked folding bench."
                            : "Four 2.3 m rear wings, attached canopy strips and three folding stage treads."}
                        </dd>
                      </div>
                      <div>
                        <dt>Your setting</dt>
                        <dd>
                          {config.study === "listening-pavilion"
                            ? `${config.wind}% breeze`
                            : `${config.roof}° canopy rise`}
                          ; sun at {config.sun}°.
                        </dd>
                      </div>
                    </>
                  )}
                  <div>
                    <dt>Intended next step</dt>
                    <dd>
                      A conversation around a physical prototype. This fictional study is not a
                      construction document.
                    </dd>
                  </div>
                </dl>
                <div className="button-row">
                  <button
                    type="button"
                    className="solid-action"
                    disabled={exporting}
                    onClick={() => void exportCard()}
                  >
                    {exporting ? "Drawing your postcard…" : "Download the postcard"} ↙
                  </button>
                  <button type="button" onClick={() => window.print()}>
                    Print this brief
                  </button>
                </div>
                <div className="utility-links">
                  <button type="button" onClick={openStudio}>
                    Back to my design
                  </button>
                  <button type="button" onClick={save}>
                    Save on this device
                  </button>
                  <Link to="/" config={config} navigate={navigate}>
                    Explore another place
                  </Link>
                </div>
                <p className="micro">
                  No form, no personal details, nothing submitted. Just your idea, ready to keep.
                </p>
              </article>
            </div>
            <section className="drawing-section">
              <Drawings config={config} />
            </section>
          </>
        )}
        {path === "/about" && (
          <section className="about-page">
            <p className="eyebrow arrival-copy">A FICTIONAL STUDIO. THREE ORIGINAL PLACES.</p>
            <h1 className="arrival-copy">
              An idea is a thing
              <br />
              you can unfold.
            </h1>
            <div className="about-columns">
              <p>
                FOLDFIELD is an original portfolio experiment in small architecture, paper mechanics
                and consequential controls. The three places are invented. No real practice, client,
                commission or building approval is implied.
              </p>
              <div>
                <h2>The folds have somewhere to go.</h2>
                <p>
                  Walls, roof sheets and sails rotate about attached pins. A common fold sequence
                  holds them in order, even when you reverse it. The Sun tool moves a real light;
                  the Rain Library's plan, section and shelter observations use the same chosen
                  dimensions.
                </p>
                <h2>A model, with clear limits.</h2>
                <p>
                  The rain study checks sample rays against simplified sheets. It does not simulate
                  fluid dynamics, wind loading, structural safety or real weather. The diagrams are
                  explanatory. Paper thickness and physical hinge clearances are stylised.
                </p>
                <h2>Made to be handled.</h2>
                <p>
                  Use the pull button or the keyboard fold slider. Select a composed view, pause
                  moving atmosphere or turn on gentle motion. The experience is silent by design. If
                  live 3D is unavailable, saved views and the drawings preserve the configuration
                  and brief.
                </p>
                <button type="button" className="solid-action" onClick={openStudio}>
                  Back to the paper studio ↗
                </button>
              </div>
            </div>
          </section>
        )}
        {(!ROUTES.includes(path) || path === "/404") && (
          <section className="about-page">
            <p className="eyebrow">404 / ONE POSTCARD SHORT</p>
            <h1>
              This place hasn't
              <br />
              been folded yet.
            </h1>
            <p>The three studies are still on the table.</p>
            <Link to="/" config={config} navigate={navigate} className="solid-action">
              Return to the studies ↗
            </Link>
          </section>
        )}
      </main>
      <footer>
        <div className="footer-mark">
          FOLDFIELD<span>↗</span>
        </div>
        <p>
          POSTCARDS FROM PLACES
          <br />
          THAT DO NOT EXIST. YET.
        </p>
        <nav aria-label="Footer navigation">
          <Link to="/" config={config} navigate={navigate}>
            The studies
          </Link>
          <Link to="/studio" config={config} navigate={navigate}>
            The studio
          </Link>
          <Link to="/about" config={config} navigate={navigate}>
            About this demonstration
          </Link>
        </nav>
        <small>
          An original fictional studio / 2026
          <br />
          No architectural services, commission or construction approval implied.
        </small>
      </footer>
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button type="button" aria-label="Dismiss message" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
    </>
  );
}
