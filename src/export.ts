import { type Configuration, observations, studyFor } from "./domain";

export async function downloadPostcard(config: Configuration, capture: (() => string) | null) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1180;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Postcard drawing is unavailable");
  context.fillStyle = "#f4f0df";
  context.fillRect(0, 0, 1600, 1180);
  const picture = new Image();
  picture.src = capture ? capture() : `/plates/${config.study}-open.jpg`;
  await picture.decode();
  context.drawImage(picture, 40, 40, 1520, 760);
  const study = studyFor(config.study),
    metrics = observations(config);
  context.fillStyle = "#213b9f";
  context.font = '800 90px "Barlow Condensed"';
  context.fillText(`FOLDFIELD / ${study.number}`, 60, 912);
  context.font = '34px "Space Grotesk"';
  context.fillText(`${study.title} — ${study.purpose}`, 60, 975);
  context.font = '24px "IBM Plex Mono"';
  const spec =
    config.study === "rain-library"
      ? `${config.span.toFixed(1)} m span / ${config.roof}° roof / ${config.panel} screens / ${Math.round(metrics.dry * 100)}% dry seat`
      : config.study === "listening-pavilion"
        ? `Three hinged portals / ${config.wind}% breeze / sun ${config.sun}°`
        : `Four stage wings / ${config.roof}° canopy / sun ${config.sun}°`;
  context.fillText(spec, 60, 1030);
  context.font = '19px "Space Grotesk"';
  context.fillText(
    "An original fictional study. A starting point for an idea, not a construction document.",
    60,
    1113,
  );
  if (!capture) {
    context.font = '15px "IBM Plex Mono"';
    context.fillText("Saved studio image; specification reflects your choices.", 60, 1142);
  }
  const link = document.createElement("a");
  link.download = `foldfield-${config.study}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
