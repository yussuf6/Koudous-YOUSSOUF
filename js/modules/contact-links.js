/**
 * Boutons de contact du bloc « Vous avez un projet ? ».
 *
 * Les liens sont complets dans le HTML (appel téléphonique et WhatsApp) et
 * fonctionnent sans JavaScript. Ce module :
 * - [data-contact-link="whatsapp"] : remplace le message pré-rempli par sa
 *   traduction dans la langue choisie (le numéro est lu dans le lien) ;
 * - [data-contact-link="booking"]  : utilise le lien de réservation de
 *   js/config.js s'il est renseigné, sinon garde le lien d'appel.
 */

import { CONTACT } from '../config.js';
import { $$ } from '../utils/dom.js';
import { t } from './i18n.js';

/** N'accepte que des liens https bien formés. */
function safeHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

/** @param {HTMLAnchorElement} link */
function localizeWhatsappLink(link) {
  let url;
  try {
    url = new URL(link.href);
  } catch {
    return;
  }
  if (url.hostname !== 'wa.me') return;

  url.searchParams.set('text', t('contact.whatsappMessage'));
  link.href = url.href;
}

/** @param {HTMLAnchorElement} link */
function applyBookingUrl(link) {
  const bookingUrl = safeHttpsUrl(CONTACT.bookingUrl);
  if (!bookingUrl) return;

  link.href = bookingUrl;
  link.target = '_blank';
  link.rel = 'noopener';
}

export function initContactLinks() {
  const whatsappLinks = $$('[data-contact-link="whatsapp"]');
  const bookingLinks = $$('[data-contact-link="booking"]');

  bookingLinks.forEach(applyBookingUrl);

  const updateWhatsapp = () => whatsappLinks.forEach(localizeWhatsappLink);
  updateWhatsapp();
  document.addEventListener('i18n:change', updateWhatsapp);
}
