/**
 * En-tête : état « défilé », menu mobile et lien actif de la navigation.
 */

import { $, $$ } from '../utils/dom.js';

const SCROLL_THRESHOLD = 40;
const DESKTOP_QUERY = '(min-width: 1180px)';

export function initHeader() {
  const header = $('[data-site-header]');
  if (!header) return;

  const nav = $('[data-site-nav]', header);
  const toggle = $('[data-menu-toggle]', header);

  // ---- État « défilé » : la barre se resserre ------------------------------
  const updateScrolled = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  };
  window.addEventListener('scroll', updateScrolled, { passive: true });
  updateScrolled();

  // ---- Menu mobile ----------------------------------------------------------
  if (nav && toggle) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    const isOpen = () => nav.classList.contains('is-open');

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // Fermer après un choix dans le menu.
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    // Fermer avec Échap et rendre le focus au bouton.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Fermer au clic en dehors.
    document.addEventListener('click', (event) => {
      if (isOpen() && !header.contains(event.target)) setOpen(false);
    });

    // Le menu n'a plus lieu d'être en passant en affichage bureau.
    window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  // ---- Lien actif selon la section visible --------------------------------
  if (nav && 'IntersectionObserver' in window) {
    const links = $$('a[href^="#"]', nav);
    const setActive = (id) => {
      for (const link of links) {
        if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Une section est « active » quand elle traverse le milieu de l'écran.
      { rootMargin: '-45% 0px -50% 0px' },
    );

    $$('main > section[id]').forEach((section) => observer.observe(section));
  }
}
