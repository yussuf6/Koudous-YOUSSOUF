/**
 * Point d'entrée JavaScript.
 *
 * Chaque fonctionnalité vit dans son propre module (js/modules/) et expose
 * une fonction init(). Les modules sont indépendants : si l'un échoue,
 * l'erreur est journalisée et les autres continuent de fonctionner.
 *
 * L'ordre compte pour deux d'entre eux :
 * - initMarquee avant initI18n : les copies du bandeau doivent exister
 *   quand la traduction recense les textes à traduire ;
 * - initI18n avant initContactLinks : le message WhatsApp dépend de la langue.
 */

import { initMarquee } from './modules/marquee.js';
import { initI18n } from './modules/i18n.js';
import { initHeader } from './modules/header.js';
import { initReveal } from './modules/reveal.js';
import { initHeroTerrain } from './modules/hero-terrain.js';
import { initWorkFilter } from './modules/work-filter.js';
import { initWorkVideos } from './modules/work-videos.js';
import { initContactLinks } from './modules/contact-links.js';
import { initCurrentYear } from './modules/current-year.js';

const modules = [
  initMarquee,
  initI18n,
  initHeader,
  initReveal,
  initHeroTerrain,
  initWorkFilter,
  initWorkVideos,
  initContactLinks,
  initCurrentYear,
];

for (const init of modules) {
  try {
    init();
  } catch (error) {
    console.error(`[portfolio] Échec de ${init.name} :`, error);
  }
}
