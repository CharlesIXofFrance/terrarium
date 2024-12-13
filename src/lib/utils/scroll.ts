/**
 * Scroll restoration utility for page navigation
 */
export function scrollToTop() {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  });
}

export function getScrollPosition() {
  return window.scrollY;
}

export function setScrollPosition(position: number) {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: position,
      behavior: 'instant'
    });
  });
}