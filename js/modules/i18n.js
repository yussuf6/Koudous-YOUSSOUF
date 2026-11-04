/**
 * Traduction français / anglais.
 *
 * Principe :
 * - le français est écrit dans index.html (bon pour le référencement et
 *   lisible même sans JavaScript) ;
 * - les autres langues viennent de dictionnaires (js/i18n/*.js) ;
 * - data-i18n="clé"                → remplace le texte de l'élément ;
 * - data-i18n-attr="alt:clé;…"     → remplace un ou plusieurs attributs.
 *
 * Le texte est inséré avec textContent (jamais innerHTML) : aucune
 * injection de HTML n'est possible depuis un dictionnaire.
 *
 * Événement émis : « i18n:change » sur document, detail = { language }.
 */

import { I18N } from '../config.js';
import { $$ } from '../utils/dom.js';
import { storage } from '../utils/storage.js';
import fr from '../i18n/fr.js';
import en from '../i18n/en.js';

const DICTIONARIES = { fr, en };

/** Textes et attributs d'origine (français) de chaque élément traduisible. */
const originals = new WeakMap();
const warnedKeys = new Set();

let currentLanguage = I18N.defaultLanguage;
let translatableElements = [];

/**
 * « alt:hero.portraitAlt;title:x » → [['alt', 'hero.portraitAlt'], ['title', 'x']]
 * @param {string} value
 * @returns {Array<[string, string]>}
 */
function parseAttributeMap(value) {
  return value
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const separator = pair.indexOf(':');
      return [pair.slice(0, separator).trim(), pair.slice(separator + 1).trim()];
    });
}

/** @param {Element} element */
function rememberOriginal(element) {
  const attributes = {};
  if (element.dataset.i18nAttr) {
    for (const [attribute] of parseAttributeMap(element.dataset.i18nAttr)) {
      attributes[attribute] = element.getAttribute(attribute);
    }
  }
  originals.set(element, {
    text: element.dataset.i18n ? element.textContent : null,
    attributes,
  });
}

/**
 * Renvoie la traduction d'une clé dans la langue courante.
 * Repli : dictionnaire français, puis la clé elle-même.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  return DICTIONARIES[currentLanguage]?.[key] ?? DICTIONARIES[I18N.defaultLanguage]?.[key] ?? key;
}

/** @returns {string} */
export function getLanguage() {
  return currentLanguage;
}

/**
 * @param {string} key
 * @param {string} fallback
 */
function translate(key, fallback) {
  if (currentLanguage === I18N.defaultLanguage) return fallback;

  const value = DICTIONARIES[currentLanguage]?.[key];
  if (value !== undefined) return value;

  if (!warnedKeys.has(key)) {
    warnedKeys.add(key);
    console.warn(`[i18n] Traduction « ${currentLanguage} » manquante pour la clé « ${key} ».`);
  }
  return fallback;
}

function applyTranslations() {
  for (const element of translatableElements) {
    const original = originals.get(element);
    if (!original) continue;

    if (element.dataset.i18n) {
      element.textContent = translate(element.dataset.i18n, original.text);
    }

    if (element.dataset.i18nAttr) {
      for (const [attribute, key] of parseAttributeMap(element.dataset.i18nAttr)) {
        element.setAttribute(attribute, translate(key, original.attributes[attribute] ?? ''));
      }
    }
  }
}

/**
 * Change la langue du site.
 * @param {string} language
 * @param {{ persist?: boolean }} [options]
 */
export function setLanguage(language, { persist = true } = {}) {
  if (!I18N.supportedLanguages.includes(language)) return;

  currentLanguage = language;
  document.documentElement.lang = language;
  applyTranslations();

  for (const button of $$('[data-lang-switch]')) {
    button.setAttribute('aria-pressed', String(button.dataset.langSwitch === language));
  }

  if (persist) storage.set(I18N.storageKey, language);

  document.dispatchEvent(new CustomEvent('i18n:change', { detail: { language } }));
}

/**
 * Langue de départ : paramètre ?lang= dans l'URL, puis choix mémorisé,
 * puis langue par défaut.
 */
function resolveInitialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl && I18N.supportedLanguages.includes(fromUrl)) return fromUrl;

  const stored = storage.get(I18N.storageKey);
  if (stored && I18N.supportedLanguages.includes(stored)) return stored;

  return I18N.defaultLanguage;
}

export function initI18n() {
  translatableElements = $$('[data-i18n], [data-i18n-attr]');
  translatableElements.forEach(rememberOriginal);

  for (const button of $$('[data-lang-switch]')) {
    button.addEventListener('click', () => setLanguage(button.dataset.langSwitch));
  }

  setLanguage(resolveInitialLanguage(), { persist: false });
}
