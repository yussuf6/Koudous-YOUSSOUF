/**
 * Relief animé en courbes de niveau derrière l'accueil.
 *
 * - le relief évolue lentement dans le temps (bruit de Perlin) ;
 * - une « colline » suit la souris, ou se promène seule sur mobile ;
 * - l'animation s'arrête quand l'accueil n'est plus visible, quand l'onglet
 *   est en arrière-plan, ou si le visiteur préfère réduire les animations
 *   (une image fixe est alors dessinée).
 */

import { createPerlinNoise } from '../lib/perlin.js';
import { traceContour } from '../lib/contours.js';
import { reducedMotionQuery } from '../utils/motion.js';

const FRAME_INTERVAL_MS = 40;   // ~25 images/s : fluide et économe
const TIME_SPEED = 0.00004;     // vitesse d'évolution du relief
const FOLLOW_EASING = 0.06;     // inertie de la colline qui suit la souris
const LEVELS = Array.from({ length: 32 }, (_, i) => (i - 12) / 10);
const isMajorLevel = (level) => Math.round(level * 10) % 5 === 0;

export function initHeroTerrain() {
  const canvas = document.querySelector('[data-hero-terrain]');
  const host = canvas?.parentElement;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !host || !ctx) return;

  const styles = getComputedStyle(canvas);
  const colors = {
    minor: styles.getPropertyValue('--terrain-line').trim() || 'rgba(255,255,255,.05)',
    major: styles.getPropertyValue('--terrain-line-major').trim() || 'rgba(45,190,126,.2)',
  };

  const noise = createPerlinNoise(11);
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false, placed: false };
  const grid = { width: 0, height: 0, cell: 16, cols: 0, rows: 0, field: new Float32Array(0) };

  let time = 3.7;
  let lastFrame = 0;
  let frameId = 0;
  let isVisible = true;

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    grid.width = width;
    grid.height = height;
    grid.cell = width < 700 ? 13 : 16;
    grid.cols = Math.ceil(width / grid.cell) + 2;
    grid.rows = Math.ceil(height / grid.cell) + 2;
    grid.field = new Float32Array(grid.cols * grid.rows);

    if (!pointer.placed) {
      pointer.x = pointer.targetX = width * 0.74;
      pointer.y = pointer.targetY = height * 0.45;
      pointer.placed = true;
    }
  }

  function computeField() {
    const { width, height, cell, cols, rows, field } = grid;
    const scale = width < 700 ? 0.0042 : 0.0028;
    const radius = Math.max(150, Math.min(width, height) * 0.22);
    const falloff = 1 / (2 * radius * radius);

    for (let j = 0; j < rows; j += 1) {
      const y = j * cell;
      for (let i = 0; i < cols; i += 1) {
        const x = i * cell;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        field[j * cols + i] =
          noise(x * scale, y * scale, time) +
          0.35 * noise(x * scale * 2.2 + 17.3, y * scale * 2.2 + 3.1, time * 1.6) +
          0.8 * Math.exp(-(dx * dx + dy * dy) * falloff);
      }
    }
  }

  function draw() {
    if (!grid.cols) return;
    computeField();

    const { width, height, field, cols, rows, cell } = grid;
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Courbes ordinaires, puis courbes maîtresses (une sur cinq), plus marquées.
    for (const major of [false, true]) {
      ctx.strokeStyle = major ? colors.major : colors.minor;
      ctx.lineWidth = major ? 1.2 : 1;
      ctx.beginPath();
      for (const level of LEVELS) {
        if (isMajorLevel(level) === major) traceContour(ctx, field, cols, rows, cell, level);
      }
      ctx.stroke();
    }
  }

  function tick(now) {
    frameId = requestAnimationFrame(tick);
    if (now - lastFrame < FRAME_INTERVAL_MS) return;

    const delta = Math.min(now - lastFrame, 100);
    lastFrame = now;
    time += delta * TIME_SPEED;

    if (!pointer.active) {
      const seconds = now / 1000;
      pointer.targetX = grid.width * (0.7 + 0.14 * Math.sin(seconds * 0.29));
      pointer.targetY = grid.height * (0.45 + 0.16 * Math.sin(seconds * 0.43 + 1.3));
    }
    pointer.x += (pointer.targetX - pointer.x) * FOLLOW_EASING;
    pointer.y += (pointer.targetY - pointer.y) * FOLLOW_EASING;

    draw();
  }

  const canAnimate = () => isVisible && !document.hidden && !reducedMotionQuery.matches;

  function start() {
    if (frameId || !canAnimate()) return;
    lastFrame = performance.now();
    frameId = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  const sync = () => (canAnimate() ? start() : stop());

  // ---- Mise en place ------------------------------------------------------
  resize();
  draw();

  new ResizeObserver(() => {
    resize();
    draw();
  }).observe(canvas);

  host.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = event.clientX - rect.left;
    pointer.targetY = event.clientY - rect.top;
    pointer.active = true;
  });
  host.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    sync();
  }).observe(host);

  document.addEventListener('visibilitychange', sync);
  reducedMotionQuery.addEventListener('change', sync);

  sync();
}
