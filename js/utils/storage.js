/**
 * Accès sécurisé au localStorage.
 * Le stockage peut être indisponible (navigation privée, cookies bloqués) :
 * on ne laisse jamais une erreur de stockage casser la page.
 */
export const storage = {
  /** @param {string} key */
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /**
   * @param {string} key
   * @param {string} value
   */
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* Stockage indisponible : la préférence ne sera simplement pas mémorisée. */
    }
  },
};
