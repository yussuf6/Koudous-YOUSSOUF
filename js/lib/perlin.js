/**
 * Bruit de Perlin 3D (implémentation de référence de Ken Perlin)
 * avec une table de permutation reproductible à partir d'une graine.
 *
 * Utilisé pour générer le relief du fond de l'accueil : x et y donnent la
 * position, z fait évoluer le relief dans le temps.
 */

/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * @param {number} seed
 * @returns {() => number} nombre dans [0, 1)
 */
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + t * (b - a);

function gradient(hash, x, y, z) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * @param {number} seed
 * @returns {(x: number, y: number, z: number) => number} valeur dans [-1, 1] environ
 */
export function createPerlinNoise(seed) {
  const random = createRandom(seed);
  const base = Array.from({ length: 256 }, (_, i) => i);

  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }

  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i += 1) p[i] = base[i & 255];

  return function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
      lerp(
        lerp(gradient(p[AA], x, y, z), gradient(p[BA], x - 1, y, z), u),
        lerp(gradient(p[AB], x, y - 1, z), gradient(p[BB], x - 1, y - 1, z), u),
        v,
      ),
      lerp(
        lerp(gradient(p[AA + 1], x, y, z - 1), gradient(p[BA + 1], x - 1, y, z - 1), u),
        lerp(gradient(p[AB + 1], x, y - 1, z - 1), gradient(p[BB + 1], x - 1, y - 1, z - 1), u),
        v,
      ),
      w,
    );
  };
}
