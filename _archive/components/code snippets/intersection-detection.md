Intersection detection
This function is helpful to detect whether two elements are overlapping each other. You could use this in a freeform canvas tool to detect when two layers are on top of each other.

export function areIntersecting(
  el1: HTMLElement,
  el2: HTMLElement,
  padding = 0
) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  return !(
    rect1.right + padding < rect2.left ||
    rect1.left - padding > rect2.right ||
    rect1.bottom + padding < rect2.top ||
    rect1.top - padding > rect2.bottom
  );
}
It is also used in Radial Timeline to detect when to begin blurring overlapping contents on scroll.