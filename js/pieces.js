/**
 * Block Shapes catalog and smart piece generator
 */

const RAW_SHAPES = [
  // 1-blocks
  { id: 'dot_1x1', shape: [[1]], weight: 5 },

  // 2-blocks
  { id: 'line_1x2', shape: [[1, 1]], weight: 7 },
  { id: 'line_2x1', shape: [[1], [1]], weight: 7 },

  // 3-blocks
  { id: 'line_1x3', shape: [[1, 1, 1]], weight: 8 },
  { id: 'line_3x1', shape: [[1], [1], [1]], weight: 8 },
  { id: 'corner_tl_2x2', shape: [[1, 1], [1, 0]], weight: 8 },
  { id: 'corner_tr_2x2', shape: [[1, 1], [0, 1]], weight: 8 },
  { id: 'corner_bl_2x2', shape: [[1, 0], [1, 1]], weight: 8 },
  { id: 'corner_br_2x2', shape: [[0, 1], [1, 1]], weight: 8 },

  // 4-blocks
  { id: 'square_2x2', shape: [[1, 1], [1, 1]], weight: 10 },
  { id: 'line_1x4', shape: [[1, 1, 1, 1]], weight: 7 },
  { id: 'line_4x1', shape: [[1], [1], [1], [1]], weight: 7 },
  
  // T-shapes
  { id: 't_down', shape: [[1, 1, 1], [0, 1, 0]], weight: 6 },
  { id: 't_up', shape: [[0, 1, 0], [1, 1, 1]], weight: 6 },
  { id: 't_right', shape: [[1, 0], [1, 1], [1, 0]], weight: 6 },
  { id: 't_left', shape: [[0, 1], [1, 1], [0, 1]], weight: 6 },

  // L-shapes (Tetris style 4 blocks)
  { id: 'l_norm', shape: [[1, 0], [1, 0], [1, 1]], weight: 6 },
  { id: 'j_norm', shape: [[0, 1], [0, 1], [1, 1]], weight: 6 },
  { id: 'l_flat1', shape: [[1, 1, 1], [1, 0, 0]], weight: 6 },
  { id: 'l_flat2', shape: [[1, 1, 1], [0, 0, 1]], weight: 6 },
  { id: 'l_inv1', shape: [[1, 1], [0, 1], [0, 1]], weight: 6 },
  { id: 'l_inv2', shape: [[1, 1], [1, 0], [1, 0]], weight: 6 },
  { id: 'l_flat3', shape: [[1, 0, 0], [1, 1, 1]], weight: 6 },
  { id: 'l_flat4', shape: [[0, 0, 1], [1, 1, 1]], weight: 6 },

  // Z and S shapes
  { id: 'z_h', shape: [[1, 1, 0], [0, 1, 1]], weight: 5 },
  { id: 's_h', shape: [[0, 1, 1], [1, 1, 0]], weight: 5 },
  { id: 'z_v', shape: [[0, 1], [1, 1], [1, 0]], weight: 5 },
  { id: 's_v', shape: [[1, 0], [1, 1], [0, 1]], weight: 5 },

  // 5-blocks & Big Shapes
  { id: 'line_1x5', shape: [[1, 1, 1, 1, 1]], weight: 4 },
  { id: 'line_5x1', shape: [[1], [1], [1], [1], [1]], weight: 4 },
  { id: 'big_corner_tl', shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], weight: 4 },
  { id: 'big_corner_tr', shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], weight: 4 },
  { id: 'big_corner_bl', shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], weight: 4 },
  { id: 'big_corner_br', shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], weight: 4 },
  { id: 'plus_cross', shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], weight: 3 },
  { id: 'square_3x3', shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 3 },
  { id: 'rect_2x3', shape: [[1, 1], [1, 1], [1, 1]], weight: 3 },
  { id: 'rect_3x2', shape: [[1, 1, 1], [1, 1, 1]], weight: 3 }
];

class PieceGenerator {
  constructor() {
    this.totalWeight = RAW_SHAPES.reduce((acc, s) => acc + s.weight, 0);
  }

  // Get a random shape from pool using weights
  getRandomShape(filterFn = null) {
    let pool = RAW_SHAPES;
    if (filterFn) {
      pool = RAW_SHAPES.filter(filterFn);
      if (pool.length === 0) pool = RAW_SHAPES;
    }

    const poolTotalWeight = pool.reduce((acc, s) => acc + s.weight, 0);
    let rand = Math.random() * poolTotalWeight;

    for (const item of pool) {
      if (rand < item.weight) {
        return item;
      }
      rand -= item.weight;
    }
    return pool[0];
  }

  // Generate 3 balanced pieces for tray
  generateBatch(boardGrid, colorPalette) {
    const occupiedCount = boardGrid ? boardGrid.flat().filter(cell => cell !== 0).length : 0;
    const isCrowded = occupiedCount > 40;
    const isVeryCrowded = occupiedCount > 52;

    const batch = [];
    const usedColors = [];

    for (let i = 0; i < 3; i++) {
      let candidate;
      let attempts = 0;

      do {
        attempts++;
        if (isVeryCrowded) {
          // Strongly favor smaller pieces (1x1, 1x2, 2x1, 1x3, 2x2 corner)
          candidate = this.getRandomShape(s => {
            const h = s.shape.length;
            const w = s.shape[0].length;
            return (h <= 2 && w <= 2) || (h === 1 && w <= 3) || (w === 1 && h <= 3);
          });
        } else if (isCrowded && i === 0) {
          // Guarantee at least 1 manageable piece
          candidate = this.getRandomShape(s => s.shape.length <= 3 && s.shape[0].length <= 3 && s.id !== 'square_3x3');
        } else {
          candidate = this.getRandomShape();
        }
      } while (attempts < 8 && batch.some(b => b.shapeId === candidate.id));

      // Pick distinct color from active skin palette
      let colorIndex = Math.floor(Math.random() * colorPalette.length);
      if (usedColors.includes(colorIndex) && colorPalette.length > 3) {
        colorIndex = (colorIndex + 1) % colorPalette.length;
      }
      usedColors.push(colorIndex);

      batch.push({
        id: 'piece_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
        shapeId: candidate.id,
        shape: candidate.shape,
        colorIndex: colorIndex,
        color: colorPalette[colorIndex]
      });
    }

    // Check if at least 1 of the pieces can be placed anywhere on board
    if (boardGrid && !this.canAnyPieceFit(boardGrid, batch)) {
      // Emergency rescue: replace piece[0] with a single dot or 1x2 that fits
      const simpleShapes = RAW_SHAPES.filter(s => s.id === 'dot_1x1' || s.id === 'line_1x2' || s.id === 'line_2x1');
      for (const s of simpleShapes) {
        if (this.canFitShape(boardGrid, s.shape)) {
          batch[0] = {
            id: 'piece_rescue_' + Date.now(),
            shapeId: s.id,
            shape: s.shape,
            colorIndex: 0,
            color: colorPalette[0]
          };
          break;
        }
      }
    }

    return batch;
  }

  // Check if a specific shape can fit anywhere on the 8x8 board
  canFitShape(boardGrid, shape) {
    const sH = shape.length;
    const sW = shape[0].length;
    const bSize = boardGrid.length;

    for (let r = 0; r <= bSize - sH; r++) {
      for (let c = 0; c <= bSize - sW; c++) {
        let valid = true;
        for (let sr = 0; sr < sH; sr++) {
          for (let sc = 0; sc < sW; sc++) {
            if (shape[sr][sc] === 1 && boardGrid[r + sr][c + sc] !== 0) {
              valid = false;
              break;
            }
          }
          if (!valid) break;
        }
        if (valid) return true;
      }
    }
    return false;
  }

  canAnyPieceFit(boardGrid, pieceList) {
    return pieceList.some(p => p && this.canFitShape(boardGrid, p.shape));
  }
}

window.pieceGenerator = new PieceGenerator();
