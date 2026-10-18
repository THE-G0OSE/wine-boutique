/**
 * Путь к файлу из public/ с учётом base сборки (`VITE_BASE`, на GitHub Pages — `/wine-boutique/`).
 * Абсолютные адреса (`https://…`, `//…`) возвращаются как есть.
 *
 * @example asset("/images/textures/wood.webp")
 */
export const asset = (path: string) =>
  path.startsWith("/") && !path.startsWith("//") ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path;
