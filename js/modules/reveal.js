/**
 * Apparition des éléments au défilement.
 *
 * - [data-reveal]        : élément animé à son entrée dans l'écran ;
 * - [data-reveal-group]  : conteneur dont les enfants [data-reveal]
 *                          apparaissent en cascade.
 *
 * L'animation elle-même est en CSS (utilities.css) et ne s'applique pas si
 * le visiteur a demandé de réduire les animations.
 *
 * Filet de sécurité : le CSS affiche tout le contenu après FAILSAFE_MS si ce
 * module n'a pas démarré. S'il démarre trop tard (réseau très lent), le
 * contenu est déjà affiché : on n'y touche plus, pour éviter un clignotement.
 */

import { $$ } from '../utils/dom.js';

const STAGGER_MS = 60;
const STAGGER_STEPS = 5;
/** Doit rester identique au délai de l'animation reveal-failsafe (utilities.css). */
const FAILSAFE_MS = 3000;
/** Marge pour ne pas annuler le filet au moment précis où il se déclenche. */
const FAILSAFE_MARGIN_MS = 200;

export function initReveal() {
  const elements = $$('[data-reveal]');
  if (!elements.length) return;

  if (performance.now() > FAILSAFE_MS - FAILSAFE_MARGIN_MS) return;
  document.documentElement.classList.add('reveal-ready');

  for (const group of $$('[data-reveal-group]')) {
    $$('[data-reveal]', group).forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${(index % STAGGER_STEPS) * STAGGER_MS}ms`);
    });
  }

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
  );

  elements.forEach((element) => observer.observe(element));
}
