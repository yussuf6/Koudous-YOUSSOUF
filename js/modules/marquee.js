/**
 * Bandeau défilant sans couture.
 *
 * Le HTML ne contient qu'un seul groupe d'éléments. Ce module le duplique
 * autant de fois que nécessaire pour couvrir l'écran, puis maintient à jour
 * la distance d'un tour (--marquee-distance) et sa durée (--marquee-duration)
 * pour garder une vitesse constante, même quand la police ou la langue
 * change la largeur du texte.
 */

import { $, $$ } from '../utils/dom.js';

/** Vitesse de défilement en pixels par seconde. */
const SPEED_PX_PER_SECOND = 70;

/** @param {Element} root */
function setupMarquee(root) {
  const track = $('.marquee__track', root);
  const group = $('.marquee__group', root);
  if (!track || !group) return;

  const measure = () => group.getBoundingClientRect().width;

  // Nombre de copies : de quoi couvrir l'écran le plus large possible, plus un tour.
  const groupWidth = measure() || 1;
  const widestScreen = Math.max(window.screen.width, window.innerWidth);
  const copies = Math.ceil((widestScreen * 1.5) / groupWidth);

  for (let i = 0; i < copies; i += 1) {
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.append(clone);
  }

  const update = () => {
    const width = measure();
    if (!width) return;
    track.style.setProperty('--marquee-distance', `${width}px`);
    track.style.setProperty('--marquee-duration', `${(width / SPEED_PX_PER_SECOND).toFixed(2)}s`);
  };

  update();

  if ('ResizeObserver' in window) {
    new ResizeObserver(update).observe(group);
  } else {
    document.fonts?.ready.then(update);
  }
}

export function initMarquee() {
  $$('[data-marquee]').forEach(setupMarquee);
}
