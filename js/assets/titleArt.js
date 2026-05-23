/** Title screen hero slideshow — uses existing scene illustrations */
export const TITLE_SLIDES = [
  "assets/scenes/scene-storm.png",
  "assets/scenes/scene-naktong.png",
  "assets/scenes/scene-inchon.png",
  "assets/scenes/scene-chosin.png",
  "assets/scenes/scene-hanriver.png",
  "assets/scenes/scene-armistice.png",
];

export function preloadTitleSlides() {
  for (const src of TITLE_SLIDES) {
    const img = new Image();
    img.src = src;
  }
}
