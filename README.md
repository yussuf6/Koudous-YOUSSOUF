# Portfolio · Koudous Youssouf

Site vitrine en une page, bilingue français / anglais, écrit en **HTML, CSS et JavaScript natifs** : pas de framework, pas de dépendance, pas d'étape de build. Le dossier tel quel est le site en production.

---

## Sommaire

1. [Démarrer](#1-démarrer)
2. [Avant la mise en ligne](#2-avant-la-mise-en-ligne)
3. [Architecture](#3-architecture)
4. [Conventions](#4-conventions)
5. [Tâches courantes](#5-tâches-courantes)
6. [Sécurité](#6-sécurité)
7. [Qualité, accessibilité, performance](#7-qualité-accessibilité-performance)
8. [Mise en ligne sur Vercel](#8-mise-en-ligne-sur-vercel)

---

## 1. Démarrer

Le JavaScript est découpé en **modules ES**. Les navigateurs refusent de charger des modules depuis un fichier ouvert par double-clic (`file://`) : il faut un petit serveur local.

- **VS Code (recommandé)** : extension *Live Server* (Ritwick Dey), puis clic droit sur `index.html` → *Open with Live Server*.
- **Ligne de commande** : `npx serve .` (Node.js) ou `python3 -m http.server 8000` (Python).

> **Page pâle et flèches absentes ?** C'est le signe qu'elle a été ouverte par double-clic : le JavaScript ne démarre pas (pas d'animations, pas de traduction, pas de menu mobile, pas de filtres). Le contenu s'affiche quand même au bout de 3 s, mais seul l'aperçu avec Live Server (ou le site en ligne) montre le vrai résultat.

---

## 2. Avant la mise en ligne

### Adresse du site (obligatoire)

L'adresse `portfolio-koudous.vercel.app` est **provisoire**. Remplace-la par l'adresse définitive (celle que Vercel t'attribue, ou ton nom de domaine) dans :

| Fichier | Où |
|---|---|
| `index.html` | `<link rel="canonical">`, balises `og:url`, `og:image`, `twitter:image`, bloc JSON-LD (`url`, `image`) |
| `robots.txt` | ligne `Sitemap:` |
| `sitemap.xml` | balise `<loc>` |

Dans VS Code : *Édition → Remplacer dans les fichiers* (Ctrl+Maj+H), cherche `portfolio-koudous.vercel.app`, remplace partout.

### Lien Bénin Hébergement

Le bouton « Visiter le site » pointe vers l'environnement de **test** (`staging-web.benin-hebergement.bj`). Dès que l'adresse de production existe, mets-la à jour à deux endroits de `index.html`, signalés par un commentaire : le lien `href` du bouton et le texte de l'adresse dans la maquette du navigateur.

---

## 3. Architecture

```
portfolio-koudous/
├── index.html                 Structure, contenu (français) et icônes vectorielles
├── vercel.json                En-têtes de sécurité (CSP…) et cache, appliqués par Vercel
├── robots.txt / sitemap.xml   Référencement
├── assets/
│   ├── favicon.svg
│   ├── fonts/                 Police Schibsted Grotesk (licence OFL, voir OFL.txt)
│   ├── icons/
│   │   └── services/          Icônes des cartes de services
│   ├── images/
│   │   ├── portrait.webp
│   │   ├── og-image.jpg       Image d'aperçu des liens partagés (1200×630)
│   │   ├── projects/          Captures de Bénin Hébergement
│   │   ├── partners/          Logos des entreprises (aussi utilisés dans « Logos réalisés »)
│   │   ├── work/              Visuels, cartes, images d'aperçu des vidéos
│   │   └── tools/             Logos des logiciels
│   └── videos/                Vidéos de motion design (MP4 H.264, 720×1280)
├── css/
│   ├── main.css               Point d'entrée : ordre des couches et imports
│   ├── settings/tokens.css    Design tokens : couleurs, typo, espacements…
│   ├── base/                  Reset, police, styles globaux, contextes de couleur
│   ├── layout/                Conteneur, rythme des sections
│   ├── components/            Éléments réutilisables (bouton, en-tête…)
│   ├── sections/              Un fichier par section de la page
│   └── utilities/             Classes utilitaires, animation d'apparition
└── js/
    ├── main.js                Point d'entrée : initialise chaque module
    ├── config.js              Réglages (lien de réservation, langues)
    ├── i18n/                  Traductions (fr.js, en.js)
    ├── modules/               Une fonctionnalité par fichier
    │   ├── i18n.js            Traduction FR / EN
    │   ├── header.js          En-tête, menu mobile, lien actif
    │   ├── reveal.js          Apparition au défilement
    │   ├── marquee.js         Bandeau défilant
    │   ├── hero-terrain.js    Relief animé de l'accueil
    │   ├── work-filter.js     Filtres des réalisations
    │   ├── work-videos.js     Lecture des vidéos quand elles sont à l'écran
    │   ├── contact-links.js   Message WhatsApp traduit, lien de réservation
    │   └── current-year.js    Année du copyright
    ├── lib/                   Algorithmes (bruit de Perlin, courbes de niveau)
    └── utils/                 Petites fonctions partagées (DOM, stockage…)
```

### HTML

- **Sémantique** : `header`, `nav`, `main`, des `section` reliées à leur titre par `aria-labelledby`, `footer`, un seul `h1`, puis une hiérarchie `h2` → `h3` sans saut.
- **Aucun style ni script en ligne**, avec deux exceptions :
  - la ligne qui remplace `no-js` par `js` dans `<head>`, qui doit s'exécuter avant l'affichage (elle est autorisée par la CSP, voir §6) ;
  - le bloc de données structurées JSON-LD, qui est une donnée et n'est pas exécuté.
- Les comportements sont reliés par des attributs `data-*`, jamais par des classes de style.

### CSS

- **Couches de cascade (`@layer`)** déclarées dans `main.css` : `settings → base → layout → components → sections → utilities`. Une couche plus basse l'emporte toujours, quelle que soit la spécificité. Aucun `!important`.
- **Design tokens** dans `settings/tokens.css` : aucune couleur écrite en dur dans les composants.
- **Contextes de couleur** (`base/surfaces.css`) : `.surface-dark` et `.surface-brand` redéfinissent les variables `--ctx-*`, si bien qu'un composant s'adapte seul au fond sur lequel il est posé.
- **Mouvement** : les animations sont déclarées dans `@media (prefers-reduced-motion: no-preference)`, et les effets de survol ne s'appliquent qu'aux appareils qui ont une souris (`@media (hover: hover)`).
- Le découpage en fichiers via `@import` est conservé volontairement. Sur Vercel, en HTTP/2, le LCP mesuré est d'environ 1,8 s en 4G lente avec les 25 fichiers, contre 1,6 s avec un seul fichier fusionné. Ce gain ne justifie pas d'ajouter une étape de build.

### JavaScript

- **Modules ES** : chaque fichier de `modules/` exporte une fonction `init…()`. Aucune variable globale.
- **Isolation des erreurs** : `main.js` lance chaque module dans un `try…catch`.
- **Amélioration progressive** : sans JavaScript, le contenu reste lisible et les liens de contact (appel et WhatsApp) fonctionnent.
- **Sécurité DOM** : les textes sont insérés avec `textContent`, jamais `innerHTML`. Il n'y a ni `eval` ni `new Function`. Le paramètre `?lang` est filtré par une liste blanche, et les liens configurés ne sont acceptés qu'en `https`.

---

## 4. Conventions

| Sujet | Règle |
|---|---|
| Classes CSS | **BEM** : `.bloc`, `.bloc__element`, `.bloc--variante` |
| États | Classes `is-*` ou attributs ARIA (`aria-pressed`, `aria-expanded`, `aria-current`) |
| Liens JS ↔ HTML | Attributs `data-*` uniquement |
| Points de rupture | `560px` · `760px` · `980px` · `1180px` |
| Noms de fichiers | minuscules, mots séparés par des tirets, sans espace, accent, `&` ni parenthèse (ex. `visuel-air-and-van.webp`) |
| Icônes vectorielles | symboles `<symbol id="icon-…">` en haut de `<body>` dans `index.html` (flèche, coche, cadenas), utilisés avec `<use href="#icon-…">` |
| Commentaires SVG | jamais deux tirets consécutifs dans un commentaire d'un fichier `.svg` : le fichier deviendrait invalide |
| Indentation | 2 espaces, UTF-8, LF (voir `.editorconfig`) |

---

## 5. Tâches courantes

### Modifier un texte

1. **Français** : directement dans `index.html`.
2. **Anglais** : l'élément porte `data-i18n="cle"`. Modifie la même clé dans `js/i18n/en.js`.

Pour un attribut (texte alternatif, `aria-label`), l'élément porte `data-i18n-attr="alt:cle"`. Une clé absente de `en.js` garde le texte français et affiche un avertissement dans la console.

### Ajouter une réalisation

**1. Prépare le fichier** avec un outil gratuit comme [Squoosh](https://squoosh.app) pour les images ou HandBrake pour les vidéos :

| Type | Format conseillé | Poids visé |
|---|---|---|
| Visuel (carré) | WebP 800×800 | < 120 Ko |
| Carte | WebP, 1 300 px de large maximum | < 200 Ko |
| Logo | WebP ou PNG transparent, 480 px de large maximum | < 30 Ko |
| Vidéo | MP4 H.264, 720×1280, sans son ou AAC 96 kb/s | < 1 Mo |
| Aperçu de vidéo | WebP 540×960 (première image de la vidéo) | < 30 Ko |

**2. Place-le** dans le bon dossier (`assets/images/work/`, `assets/videos/`…), avec un nom en minuscules et tirets.

**3. Ajoute un bloc** dans le bon groupe de `index.html`, en copiant un bloc existant :

```html
<li data-reveal>
  <figure class="media-slot media-slot--visual">
    <img src="assets/images/work/visuel-nom-du-projet.webp" width="800" height="800"
         alt="Ce que montre l'image, en une phrase" loading="lazy" decoding="async">
  </figure>
</li>
```

Formats disponibles : `media-slot--logo` (logo centré), `media-slot--visual` (carré), `media-slot--map` (carte affichée en entier), `media-slot--video` (vertical 9:16).

Pour une vidéo, copie un bloc `<video>` existant : il doit garder `muted`, `loop`, `playsinline`, `controls`, `preload="none"`, un `poster` et l'attribut `data-work-video`.

**Toujours** renseigner `width` et `height` avec les vraies dimensions du fichier, pour éviter que la page ne saute au chargement. Pense aussi à ajouter la traduction anglaise du texte `alt`.

### Coordonnées de contact

Le numéro est écrit dans les deux liens de la section Contact de `index.html` (`tel:` et `wa.me`), qui doivent rester identiques. Le message WhatsApp français se modifie dans `js/i18n/fr.js` et dans le lien `wa.me` ; sa version anglaise est dans `js/i18n/en.js`.

Pour que « Réserver un appel » ouvre un agenda (Calendly, Cal.com) au lieu d'un appel, renseigne `bookingUrl` dans `js/config.js`.

### Changer une couleur

Tout se passe dans `css/settings/tokens.css`.

---

## 6. Sécurité

Le site est statique : pas de formulaire, pas de base de données, pas de clé ni de secret. Les protections suivantes reposent sur l'**hébergeur**. Elles sont décrites dans `vercel.json` et n'existent que si le site est servi par Vercel : un autre hébergeur demande la même configuration dans son propre format.

| En-tête | Rôle |
|---|---|
| `Content-Security-Policy` | N'autorise que les scripts, styles, polices, images et vidéos du site lui-même. |
| `X-Frame-Options` + `frame-ancestors` | Empêche d'afficher le site dans une iframe piégée (clickjacking). |
| `X-Content-Type-Options` | Empêche le navigateur de deviner le type d'un fichier. |
| `Referrer-Policy` | Limite les informations transmises aux sites visités depuis le portfolio. |
| `Permissions-Policy` | Désactive caméra, micro, géolocalisation, paiement et USB. |
| `Cross-Origin-Opener-Policy` | Isole la page des fenêtres ouvertes par d'autres sites. |

### Si tu modifies le petit script de `<head>`

La CSP autorise ce script par son empreinte `sha256`. Si tu changes ne serait-ce qu'un caractère de cette ligne, il est bloqué, et les animations d'apparition ne s'activent plus (le contenu reste visible). Pour obtenir la nouvelle empreinte :

- **le plus simple** : après le déploiement, ouvre la console du navigateur (F12). Le message d'erreur CSP indique l'empreinte attendue (`'sha256-…'`) : copie-la dans `vercel.json` ;
- **ou** avec Node.js :

```bash
node -e "const c=require('crypto');console.log('sha256-'+c.createHash('sha256').update(\"document.documentElement.classList.replace('no-js', 'js');\").digest('base64'))"
```

### Ajouter un service externe

Une vidéo YouTube, une carte ou un outil de statistiques sera bloqué par la CSP tant que son domaine n'est pas ajouté à la bonne directive de `vercel.json` (`frame-src`, `img-src`…).

### À vérifier après la mise en ligne

Passe l'adresse du site sur [securityheaders.com](https://securityheaders.com) pour confirmer que les en-têtes sont bien envoyés.

---

## 7. Qualité, accessibilité, performance

- Lien d'évitement « Aller au contenu », focus clavier visible, menu mobile utilisable au clavier (Échap pour fermer).
- Textes alternatifs descriptifs et traduits, `alt=""` pour les images décoratives.
- Vidéos : pas de lecture automatique si le visiteur a demandé de réduire les animations, pause hors de l'écran, commandes natives disponibles.
- Images aux dimensions réelles (`width` / `height`), chargement différé sous le premier écran, portrait prioritaire, police préchargée.
- Données structurées Schema.org (`Person`), balises Open Graph et Twitter Card, `robots.txt`, `sitemap.xml`.
- Lien partageable dans une langue : `?lang=en`.

**Valider le HTML** (Node.js requis) : `npx html-validate index.html`.

La configuration `.htmlvalidate.json` désactive trois règles, de façon assumée :
- `doctype-style` : `<!doctype html>` en minuscules est valide ;
- `no-redundant-role` : `role="list"` sur les listes sans puces est volontaire, car Safari et VoiceOver ne les annoncent plus comme des listes sans lui ;
- `tel-non-breaking` : cette règle vise les numéros de téléphone affichés en clair, alors que le lien `tel:` du site affiche le texte « Réserver un appel ».

**Navigateurs pris en charge** : versions récentes de Chrome, Edge, Firefox et Safari (2023 et après).

---

## 8. Mise en ligne sur Vercel

1. Pousse le dossier `portfolio-koudous` sur GitHub : dans un nouveau dépôt, *uploading an existing file*, puis glisse tout son contenu ; ou utilise `git push`. Ne pousse jamais le dossier `_hors-site` ni d'archive `.zip` ou `.rar` (ils sont exclus par `.gitignore`).
2. Sur [vercel.com](https://vercel.com) : *Add New → Project*, importe le dépôt.
3. Laisse **Framework Preset : Other** et les autres champs vides, puis clique sur **Deploy**.
4. Fais les remplacements de la [section 2](#2-avant-la-mise-en-ligne) avec l'adresse obtenue, puis pousse à nouveau.

> Le plan **Hobby** de Vercel est gratuit et réservé à un usage personnel, non commercial ([conditions](https://vercel.com/docs/plans/hobby)).
