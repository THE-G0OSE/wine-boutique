/**
 * `srcSet` по соглашению имён: рядом с `name.webp` лежат уменьшенные копии `name-<ширина>w.webp`
 * (делает `scripts/optimize-image.mjs`). Оригинал идёт последним — с его настоящей шириной.
 *
 * @example srcSet(asset("/images/hero/1.webp"), [640, 960], 1920)
 */
export const srcSet = (src: string, widths: number[], fullWidth: number) =>
  [...widths.map((width) => `${src.replace(/\.webp$/, `-${width}w.webp`)} ${width}w`), `${src} ${fullWidth}w`].join(", ");
