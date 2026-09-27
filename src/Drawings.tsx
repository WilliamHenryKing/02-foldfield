import {
  BACK,
  type Configuration,
  DEPTH,
  FLOOR,
  HEIGHT,
  librarySurfaces,
  observations,
  RAIN_DIRECTION,
  rayHit,
  roofOutline,
  seatSamples,
} from "./domain";

export function Drawings({ config }: { config: Configuration }) {
  const metrics = observations(config),
    roof = roofOutline(config),
    rain = config.study === "rain-library";
  const x = (n: number) => 200 + n * 48,
    y = (n: number) => 105 + n * 48;
  return (
    <div className="drawings">
      <figure>
        <svg viewBox="0 0 400 280" role="img" aria-label={`Open ${config.study} plan drawing`}>
          <title>Plan drawing of the selected study</title>
          <g fill="none" stroke="#243ea8" strokeWidth="1.5">
            <path d="M32 30h336v204H32Z" stroke="#c7c8c1" />
            <path d="M200 28v211M28 130h345" stroke="#c7c8c1" strokeDasharray="3 5" />
            {rain ? (
              <>
                <polygon
                  points={roof.map((p) => `${x(p[0])},${y(p[2])}`).join(" ")}
                  fill="#ef633e"
                  fillOpacity=".11"
                  strokeDasharray="5 4"
                />
                <path
                  d={`M${x(-config.span / 2)} ${y(BACK)}H${x(config.span / 2)}`}
                  strokeWidth="4"
                />
                {librarySurfaces(config)
                  .filter((s) => s.kind === "screen")
                  .map((surface) => (
                    <path
                      key={surface.points[0].join(":")}
                      d={`M${x(surface.points[0][0])} ${y(surface.points[0][2])}L${x(surface.points[1][0])} ${y(surface.points[1][2])}`}
                      strokeWidth="3"
                    />
                  ))}
                <rect
                  x={x(-0.625)}
                  y={y(0.1)}
                  width={1.25 * 48}
                  height={0.8 * 48}
                  fill="#ef633e"
                  fillOpacity=".35"
                />
                {config.rain &&
                  seatSamples().map((p) => (
                    <circle
                      key={p.join(":")}
                      cx={x(p[0])}
                      cy={y(p[2])}
                      r="2.5"
                      fill={
                        rayHit(p, RAIN_DIRECTION, librarySurfaces(config)) === null
                          ? "#d84b3a"
                          : "#1b8276"
                      }
                      stroke="none"
                    />
                  ))}
                <path
                  d={`M${x(-config.span / 2)} 249H${x(config.span / 2)}m0-5v10M${x(-config.span / 2)} 244v10`}
                />
              </>
            ) : config.study === "listening-pavilion" ? (
              <>
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    <path
                      d={`M${x(-1.1 + i * 0.35)} ${y(-1.99 + i * 1.3)}v${1.18 * 48}`}
                      strokeWidth="4"
                    />
                    <circle
                      cx={x(-1.1 + i * 0.35)}
                      cy={y(-1.4 + i * 1.3)}
                      r="9"
                      fill={i === 1 ? "#243ea8" : "#b9ca45"}
                    />
                  </g>
                ))}
                <rect
                  x={x(-0.95)}
                  y={y(1.6)}
                  width={2.8 * 48}
                  height={0.7 * 48}
                  fill="#b9ca45"
                  fillOpacity=".3"
                />
              </>
            ) : (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <rect
                    key={i}
                    x={x(-2.1 + i * 1.1)}
                    y={y(-1.5)}
                    width={0.98 * 48}
                    height={1.75 * 48}
                    fill={i % 2 ? "#ef633e" : "#b29acb"}
                    fillOpacity=".3"
                  />
                ))}
                {[0, 1, 2].map((i) => (
                  <rect
                    key={i}
                    x={x(-1.95)}
                    y={y(-1.075 + i * 0.65)}
                    width={3.9 * 48}
                    height={0.55 * 48}
                  />
                ))}
                <rect x={x(-1.7)} y={y(1.78)} width="58" height="22" />
                <rect x={x(0.5)} y={y(1.78)} width="58" height="22" />
              </>
            )}
          </g>
          <g fill="#243ea8" fontFamily="monospace" fontSize="10">
            <text x="34" y="20">
              PLAN / OPEN POSE
            </text>
            <text x="200" y="270" textAnchor="middle">
              {rain
                ? `${config.span.toFixed(1)} m clear span`
                : config.study === "listening-pavilion"
                  ? "3 PORTALS / 1 QUIET SEAT"
                  : "4 WINGS / 3 STAGE TREADS"}
            </text>
          </g>
        </svg>
        <figcaption>
          01 / Plan.{" "}
          {rain
            ? "Dashed line is the actual canopy footprint."
            : "Fold axes and seating in the same arrangement."}
        </figcaption>
      </figure>
      <figure>
        <svg viewBox="0 0 400 280" role="img" aria-label={`Open ${config.study} section drawing`}>
          <title>Section drawing of the selected study</title>
          <g fill="none" stroke="#243ea8" strokeWidth="1.5">
            <path d="M35 232h330" />
            <path d="M82 25v217M316 25v217" stroke="#c7c8c1" strokeDasharray="3 5" />
            {rain ? (
              <>
                <path
                  d={`M82 232V${232 - (HEIGHT + FLOOR) * 47}L${82 + (roof[2][2] - BACK) * 65} ${232 - roof[2][1] * 47}`}
                  strokeWidth="5"
                  stroke="#ef633e"
                />
                <path d={`M${82 + 1.65 * 65} ${232 - (FLOOR + 0.63) * 47}h52m-45 0v26m38-26v26`} />
                <path d={`M${82 + 1.65 * 65 + 18} ${232 - (FLOOR + 1.2) * 47}v24h12v17`} />
                <circle
                  cx={82 + 1.65 * 65 + 18}
                  cy={232 - (FLOOR + 1.31) * 47}
                  r="4"
                  fill="#243ea8"
                />
                <path d={`M338 232V${232 - roof[2][1] * 47}m-5 0h10m-10 ${roof[2][1] * 47}h10`} />
              </>
            ) : config.study === "listening-pavilion" ? (
              [0, 1, 2].map((i) => (
                <g key={i}>
                  <path d={`M${93 + i * 70} 232V104h52v128`} />
                  <path
                    d={`M${98 + i * 70} 110v78q20 7 40 0v-78Z`}
                    fill={i === 1 ? "#243ea8" : "#b9ca45"}
                    fillOpacity=".4"
                  />
                  <circle cx={118 + i * 70} cy="144" r="11" />
                </g>
              ))
            ) : (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M${80 + i * 61} 232V122l${(1.5 - i) * 9} -28`}
                    strokeWidth="22"
                    stroke={i % 2 ? "#ef633e" : "#b29acb"}
                  />
                ))}
                <path d="M65 216h270v16M78 208h245v8M90 200h221v8" />
              </>
            )}
          </g>
          <g fill="#243ea8" fontFamily="monospace" fontSize="10">
            <text x="34" y="20">
              {rain ? "SECTION / THROUGH THE SEAT" : "ELEVATION / OPEN POSE"}
            </text>
            <text x="200" y="270" textAnchor="middle">
              {rain
                ? `${config.roof}° rise / ${metrics.frontHeight.toFixed(2)} m front edge`
                : config.study === "listening-pavilion"
                  ? "2.5 m HIGH / PINNED SAILS"
                  : `${config.roof}° CANOPY RISE / SPLAYED WINGS`}
            </text>
          </g>
        </svg>
        <figcaption>
          02 /{" "}
          {rain
            ? "Section. Roof and floor use the model's dimensions."
            : "Study elevation. An illustrative paper construction."}
        </figcaption>
      </figure>
      {rain && (
        <p className="drawing-note">
          Metres describe the imagined full-size place. The live model is a paper prototype.
          Geometry is illustrative; these are not construction documents. Roof sheet length:{" "}
          {DEPTH.toFixed(1)} m.
        </p>
      )}
    </div>
  );
}
