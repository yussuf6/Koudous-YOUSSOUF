/**
 * Tracé de courbes de niveau par l'algorithme « marching squares ».
 *
 * À partir d'une grille de hauteurs (field), on trace sur un contexte
 * canvas 2D la ligne qui sépare les points au-dessus et au-dessous d'un
 * niveau donné — comme les isolignes d'une carte topographique.
 *
 * Cette fonction est appelée des dizaines de milliers de fois par image :
 * elle n'alloue aucun objet dans la boucle.
 */

const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;

/**
 * Segments à tracer pour chacune des 16 configurations d'une cellule.
 * L'index encode les coins au-dessus du niveau : haut-gauche 8,
 * haut-droite 4, bas-droite 2, bas-gauche 1.
 */
const SEGMENTS = [
  [],
  [[LEFT, BOTTOM]],
  [[BOTTOM, RIGHT]],
  [[LEFT, RIGHT]],
  [[TOP, RIGHT]],
  [[LEFT, TOP], [BOTTOM, RIGHT]],
  [[TOP, BOTTOM]],
  [[LEFT, TOP]],
  [[LEFT, TOP]],
  [[TOP, BOTTOM]],
  [[TOP, RIGHT], [LEFT, BOTTOM]],
  [[TOP, RIGHT]],
  [[LEFT, RIGHT]],
  [[BOTTOM, RIGHT]],
  [[LEFT, BOTTOM]],
  [],
];

/** Point réutilisé pour éviter toute allocation. */
const point = { x: 0, y: 0 };

/**
 * Position, par interpolation linéaire, du passage du niveau sur un bord.
 * a, b, c, d : hauteurs des coins haut-gauche, haut-droite, bas-droite, bas-gauche.
 */
function locate(edge, x, y, cell, level, a, b, c, d) {
  switch (edge) {
    case TOP:
      point.x = x + (cell * (level - a)) / (b - a);
      point.y = y;
      break;
    case RIGHT:
      point.x = x + cell;
      point.y = y + (cell * (level - b)) / (c - b);
      break;
    case BOTTOM:
      point.x = x + (cell * (level - d)) / (c - d);
      point.y = y + cell;
      break;
    default: // LEFT
      point.x = x;
      point.y = y + (cell * (level - a)) / (d - a);
  }
  return point;
}

/**
 * Ajoute au chemin courant du contexte la courbe de niveau `level`.
 * L'appelant gère beginPath() / stroke() pour regrouper plusieurs niveaux.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Float32Array} field  hauteurs, ligne par ligne (cols × rows)
 * @param {number} cols
 * @param {number} rows
 * @param {number} cell         taille d'une cellule en pixels
 * @param {number} level
 */
export function traceContour(ctx, field, cols, rows, cell, level) {
  for (let j = 0; j < rows - 1; j += 1) {
    const y = j * cell;
    const row = j * cols;
    const nextRow = row + cols;

    for (let i = 0; i < cols - 1; i += 1) {
      const a = field[row + i];
      const b = field[row + i + 1];
      const c = field[nextRow + i + 1];
      const d = field[nextRow + i];

      const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      const segments = SEGMENTS[index];
      if (!segments.length) continue;

      const x = i * cell;
      for (const [from, to] of segments) {
        locate(from, x, y, cell, level, a, b, c, d);
        ctx.moveTo(point.x, point.y);
        locate(to, x, y, cell, level, a, b, c, d);
        ctx.lineTo(point.x, point.y);
      }
    }
  }
}
