/**
 * Raccourcis de sélection DOM.
 */

/**
 * @param {string} selector
 * @param {ParentNode} [root=document]
 * @returns {Element | null}
 */
export const $ = (selector, root = document) => root.querySelector(selector);

/**
 * @param {string} selector
 * @param {ParentNode} [root=document]
 * @returns {Element[]}
 */
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
