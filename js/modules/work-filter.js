/**
 * Filtres de la section « Réalisations ».
 *
 * Boutons : [data-filter="all" | "logos" | "visuals" | "maps" | "motion"]
 * Groupes : [data-category="…"] — masqués avec l'attribut hidden.
 */

import { $, $$ } from '../utils/dom.js';

export function initWorkFilter() {
  const filter = $('[data-work-filter]');
  if (!filter) return;

  const buttons = $$('[data-filter]', filter);
  const groups = $$('[data-category]');

  // Un seul écouteur pour tous les boutons (délégation d'événement).
  filter.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;

    const category = button.dataset.filter;

    for (const item of buttons) {
      item.setAttribute('aria-pressed', String(item === button));
    }

    for (const group of groups) {
      const shouldShow = category === 'all' || group.dataset.category === category;
      const wasHidden = group.hidden;
      group.hidden = !shouldShow;

      if (shouldShow && wasHidden) {
        // Les éléments d'un groupe réaffiché sont visibles immédiatement.
        $$('[data-reveal]', group).forEach((element) => element.classList.add('is-visible'));
        group.classList.remove('is-entering');
        void group.offsetWidth; // relance l'animation d'entrée
        group.classList.add('is-entering');
      }
    }
  });

  for (const group of groups) {
    group.addEventListener('animationend', () => group.classList.remove('is-entering'));
  }
}
