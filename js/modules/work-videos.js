/**
 * Vidéos de la section « Réalisations ».
 *
 * - lecture automatique sans le son uniquement quand la vidéo est à l'écran ;
 * - pause dès qu'elle sort de l'écran (économie de batterie et de données) ;
 * - aucune lecture automatique si le visiteur préfère réduire les animations ;
 * - si le visiteur met lui-même la vidéo en pause, elle n'est plus relancée
 *   automatiquement. Les commandes natives (lecture, son, plein écran)
 *   restent disponibles.
 */

import { $$ } from '../utils/dom.js';
import { reducedMotionQuery } from '../utils/motion.js';

const VISIBILITY_THRESHOLD = 0.5;

export function initWorkVideos() {
  const videos = $$('video[data-work-video]');
  if (!videos.length || !('IntersectionObserver' in window)) return;

  /** Vidéos mises en pause par le visiteur (et non par ce module). */
  const pausedByVisitor = new WeakSet();
  /** Vidéos que ce module est en train de mettre en pause. */
  const pausingAutomatically = new WeakSet();

  const canAutoplay = (video) => !reducedMotionQuery.matches && !pausedByVisitor.has(video) && !document.hidden;

  const play = (video) => {
    if (!video.paused || !canAutoplay(video)) return;
    // play() renvoie une promesse rejetée si le navigateur refuse la lecture : sans gravité.
    video.play().catch(() => {});
  };

  const pause = (video) => {
    if (video.paused) return;
    pausingAutomatically.add(video);
    video.pause();
  };

  for (const video of videos) {
    video.addEventListener('pause', () => {
      if (pausingAutomatically.has(video)) pausingAutomatically.delete(video);
      else pausedByVisitor.add(video);
    });
    video.addEventListener('play', () => pausedByVisitor.delete(video));
  }

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= VISIBILITY_THRESHOLD) {
          visible.add(entry.target);
          play(entry.target);
        } else {
          visible.delete(entry.target);
          pause(entry.target);
        }
      }
    },
    { threshold: [0, VISIBILITY_THRESHOLD] },
  );
  videos.forEach((video) => observer.observe(video));

  // Onglet masqué ou préférence « mouvement réduit » activée : tout s'arrête.
  const sync = () => {
    for (const video of videos) {
      if (visible.has(video) && canAutoplay(video)) play(video);
      else if (!pausedByVisitor.has(video)) pause(video);
    }
  };
  document.addEventListener('visibilitychange', sync);
  reducedMotionQuery.addEventListener('change', sync);
}
