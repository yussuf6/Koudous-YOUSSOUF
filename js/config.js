/**
 * Configuration du site.
 *
 * Le numéro de téléphone et WhatsApp est écrit directement dans les liens
 * de la section Contact (index.html) : le site fonctionne ainsi même sans
 * JavaScript, et il n'existe qu'un seul endroit où le modifier.
 */

export const CONTACT = Object.freeze({
  /**
   * Lien de prise de rendez-vous (Calendly, Cal.com…), en https.
   * Vide : le bouton « Réserver un appel » garde son lien d'appel téléphonique.
   */
  bookingUrl: '',
});

export const I18N = Object.freeze({
  /** Langue du contenu écrit dans index.html. */
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  /** Clé utilisée pour mémoriser le choix du visiteur. */
  storageKey: 'ky-portfolio:lang',
});
