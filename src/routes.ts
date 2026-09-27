export const ROUTES: string[] = ["/", "/studio", "/brief", "/about", "/404"];
export function pageTitle(path: string) {
  return `${path === "/" ? "Places made of possibility" : path === "/studio" ? "The paper studio" : path === "/brief" ? "Your little place" : path === "/about" ? "About the folds" : "A missing postcard"} — FOLDFIELD`;
}
