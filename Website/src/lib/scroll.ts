/**
 * Smoothly scrolls to a section identified by a CSS selector (e.g. '#demo').
 * Centralised utility — use this instead of duplicating the logic per component.
 */
export function scrollToSection(href: string) {
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
