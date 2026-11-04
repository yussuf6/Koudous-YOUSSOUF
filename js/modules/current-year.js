/**
 * Met à jour l'année du copyright ([data-current-year]).
 */

import { $$ } from '../utils/dom.js';

export function initCurrentYear() {
  const year = String(new Date().getFullYear());
  $$('[data-current-year]').forEach((element) => {
    element.textContent = year;
  });
}
