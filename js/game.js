/**
 * Block Blast Core Game Engine
 * 8x8 Grid, Drag-and-Drop, Line Clearing, Combos, Boosters, Scoring
 */

class BlockBlastGame {
  constructor() {
    this.boardSize = 8;
    this.grid = Array(8).fill(null).map(() => Array(8).fill(0));
    this.trayPieces = [null, null, null];
    this.score = 0;
    this.combo = 0;
    this.maxComboInSession = 0;
    this.linesClearedInSession = 0;
    this.activeBooster = null; // 'bomb', 'hammer' or null

    // DOM Elements
    this.boardEl = null;
    this.traySlots = [];
    this.scoreEl = null;
    this.highScoreEl = null;
    this.coinEl = null;
    this.comboEl = null;
    this.ghostEl = null;

    // Drag tracking
    this.isDragging = false;
    this.draggedSlotIndex = null;
    this.draggedPiece = null;
    this.dragOffset = { x: 0, y: 0 };
    this.hoverCells = [];
    this.currentHoverValid = false;
    this.currentHoverRow = null;
    this.currentHoverCol = null;
  }

  init(domElements) {
    this.boardEl = domElements.board;
    this.traySlots = domElements.traySlots;
    this.scoreEl = domElements.score;
    this.highScoreEl = domElements.highScore;
    this.coinEl = domElements.coins;
    this.comboEl = domElements.combo;
    this.ghostEl = domElements.ghost;

    this.createBoardCells();
    this.setupGlobalPointerListeners();
    this.resetGame();
  }

  createBoardCells() {
    this.boardEl.innerHTML = '';
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Click handler for booster tools (Bomb, Hammer)
        cell.addEventListener('pointerup', () => {
          if (this.activeBooster) {
            this.handleBoosterTarget(r, c);
          }
        });

        this.boardEl.appendChild(cell);
      }
    }
  }

  resetGame() {
    this.grid = Array(8).fill(null).map(() => Array(8).fill(0));
    this.score = 0;
    this.combo = 0;
    this.maxComboInSession = 0;
    this.linesClearedInSession = 0;
    this.activeBooster = null;

    this.renderBoard();
    this.updateStatsUI();
    this.spawnNewBatch();
  }

  updateStatsUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score.toLocaleString();
    if (this.highScoreEl) this.highScoreEl.textContent = window.stateManager.data.highScore.toLocaleString();
    if (this.coinEl) this.coinEl.textContent = window.stateManager.data.coins.toLocaleString();
    
    if (this.comboEl) {
      if (this.combo > 1) {
        this.comboEl.textContent = `COMBO x${this.combo}! 🔥`;
        this.comboEl.classList.remove('hidden');
      } else {
        this.comboEl.classList.add('hidden');
      }
    }
  }

  renderBoard() {
    const cells = this.boardEl.querySelectorAll('.board-cell');
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      const val = this.grid[r][c];

      // Remove previous inline styles & classes
      cell.className = 'board-cell';
      cell.style.backgroundColor = '';
      cell.style.borderColor = '';
      cell.style.boxShadow = '';

      if (val !== 0) {
        cell.classList.add('cell-filled');
        cell.style.backgroundColor = val.fill;
        cell.style.borderColor = val.border;
        cell.style.boxShadow = `inset 2px 2px 0px ${val.highlight}, inset -2px -2px 0px ${val.border}`;
      }
    });
  }

  spawnNewBatch() {
    const skin = window.skinManager.getCurrentSkin();
    this.trayPieces = window.pieceGenerator.generateBatch(this.grid, skin.blockColors);
    this.renderTray();

    // Check game over right after new pieces appear
    if (!window.pieceGenerator.canAnyPieceFit(this.grid, this.trayPieces)) {
      this.triggerGameOver();
    }
  }

  renderTray() {
    this.traySlots.forEach((slot, idx) => {
      slot.innerHTML = '';
      const piece = this.trayPieces[idx];
      if (!piece) return;

      const pieceEl = this.createPieceElement(piece, idx);
      slot.appendChild(pieceEl);

      // Check if this specific piece can fit on the current board
      const canFit = window.pieceGenerator.canFitShape(this.grid, piece.shape);
      if (!canFit) {
        pieceEl.classList.add('piece-unfit');
      } else {
        pieceEl.classList.remove('piece-unfit');
      }
    });
  }

  createPieceElement(piece, slotIndex, isGhost = false) {
    const container = document.createElement('div');
    container.className = isGhost ? 'piece-block ghost-piece' : 'piece-block';
    container.dataset.slotIndex = slotIndex;

    const rows = piece.shape.length;
    const cols = piece.shape[0].length;

    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const miniCell = document.createElement('div');
        miniCell.className = 'mini-cell';
        if (piece.shape[r][c] === 1) {
          miniCell.classList.add('mini-cell-filled');
          miniCell.style.backgroundColor = piece.color.fill;
          miniCell.style.borderColor = piece.color.border;
          miniCell.style.boxShadow = `inset 2px 2px 0px ${piece.color.highlight}, inset -2px -2px 0px ${piece.color.border}`;
        } else {
          miniCell.style.opacity = '0';
          miniCell.style.pointerEvents = 'none';
        }
        container.appendChild(miniCell);
      }
    }

    if (!isGhost) {
      container.addEventListener('pointerdown', (e) => this.onPiecePointerDown(e, slotIndex, piece, container));
    }

    return container;
  }

  getCellMetrics() {
    const firstCell = this.boardEl.querySelector('.board-cell[data-r="0"][data-c="0"]');
    const secondCell = this.boardEl.querySelector('.board-cell[data-r="0"][data-c="1"]');
    if (!firstCell) return { cellSize: 44, stride: 49, originX: 0, originY: 0, gap: 5 };

    const firstRect = firstCell.getBoundingClientRect();
    const cellSize = firstRect.width;
    const stride = secondCell ? (secondCell.getBoundingClientRect().left - firstRect.left) : (cellSize + 5);
    const gap = Math.max(0, stride - cellSize);

    return {
      cellSize,
      stride,
      gap,
      originX: firstRect.left,
      originY: firstRect.top
    };
  }

  // Pointer Down / Drag Start
  onPiecePointerDown(e, slotIndex, piece, originalEl) {
    if (this.activeBooster) return; // Ignore drag if using booster tool
    if (!piece) return;

    // Check if playable
    if (!window.pieceGenerator.canFitShape(this.grid, piece.shape)) {
      // Wiggle animation feedback
      originalEl.classList.add('wiggle');
      setTimeout(() => originalEl.classList.remove('wiggle'), 350);
      return;
    }

    e.preventDefault();
    this.isDragging = true;
    this.draggedSlotIndex = slotIndex;
    this.draggedPiece = piece;
    this.clearHoverPreview();
    this.hoverCells = [];
    this.currentHoverValid = false;
    this.currentHoverRow = null;
    this.currentHoverCol = null;

    window.audioManager.playPick();

    // Hide original piece in tray while dragging
    originalEl.style.opacity = '0.15';

    // Position ghost piece
    this.ghostEl.innerHTML = '';
    const ghostPiece = this.createPieceElement(piece, slotIndex, true);
    this.ghostEl.appendChild(ghostPiece);
    this.ghostEl.style.display = 'block';

    const { cellSize, stride, gap } = this.getCellMetrics();
    const cols = piece.shape[0].length;
    const rows = piece.shape.length;
    const pieceWidth = (cols - 1) * stride + cellSize;
    const pieceHeight = (rows - 1) * stride + cellSize;

    // Size ghost according to board cell metrics for 1:1 visual match with board
    ghostPiece.style.width = `${pieceWidth}px`;
    ghostPiece.style.height = `${pieceHeight}px`;
    ghostPiece.style.gap = `${gap}px`;

    // Offset: lift above touch/cursor so finger does not cover placement preview
    const isTouch = e.pointerType === 'touch';
    this.dragOffset = {
      x: pieceWidth / 2,
      y: isTouch ? pieceHeight + 45 : pieceHeight / 2
    };

    this.updateGhostPosition(e.clientX, e.clientY);
  }

  updateGhostPosition(clientX, clientY) {
    if (!this.isDragging) return;

    const left = clientX - this.dragOffset.x;
    const top = clientY - this.dragOffset.y;

    this.ghostEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;

    // Calculate hover preview on board
    this.calculateBoardHover(left, top);
  }

  setupGlobalPointerListeners() {
    window.addEventListener('pointermove', (e) => {
      if (this.isDragging) {
        this.updateGhostPosition(e.clientX, e.clientY);
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (this.isDragging) {
        this.onPiecePointerUp(e);
      }
    });

    window.addEventListener('pointercancel', (e) => {
      if (this.isDragging) {
        this.cancelDrag();
      }
    });
  }

  calculateBoardHover(ghostLeft, ghostTop) {
    this.clearHoverPreview();
    this.hoverCells = [];
    this.currentHoverValid = false;
    this.currentHoverRow = null;
    this.currentHoverCol = null;

    if (!this.draggedPiece) return;

    const { cellSize, stride, originX, originY } = this.getCellMetrics();

    // Top-left anchor relative to board first cell
    const relX = ghostLeft - originX;
    const relY = ghostTop - originY;

    const startCol = Math.round(relX / stride);
    const startRow = Math.round(relY / stride);

    // Validate placement bounds and grid occupancy
    if (this.isValidPlacement(this.draggedPiece.shape, startRow, startCol)) {
      const shape = this.draggedPiece.shape;
      const candidateCells = [];
      let allCellsEmpty = true;

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c] === 1) {
            const targetR = startRow + r;
            const targetC = startCol + c;

            // Extra safety guard: target must strictly be 0 (empty)
            if (this.grid[targetR][targetC] !== 0) {
              allCellsEmpty = false;
              break;
            }
            candidateCells.push({ r: targetR, c: targetC });
          }
        }
        if (!allCellsEmpty) break;
      }

      if (allCellsEmpty && candidateCells.length > 0) {
        this.hoverCells = candidateCells;
        this.currentHoverValid = true;
        this.currentHoverRow = startRow;
        this.currentHoverCol = startCol;
        this.renderHoverPreview(true);
      }
    }
  }

  clearHoverPreview() {
    this.hoverCells = [];
    this.currentHoverValid = false;
    const hovered = this.boardEl.querySelectorAll('.cell-hover-valid, .cell-hover-invalid');
    hovered.forEach(el => {
      el.classList.remove('cell-hover-valid', 'cell-hover-invalid');
      const r = parseInt(el.dataset.r, 10);
      const c = parseInt(el.dataset.c, 10);
      const val = this.grid[r] && this.grid[r][c];
      // Restore filled cell color if occupied, or clear if empty
      if (val && val !== 0) {
        el.style.backgroundColor = val.fill;
      } else {
        el.style.backgroundColor = '';
      }
    });
  }

  renderHoverPreview(isValid) {
    this.hoverCells.forEach(({ r, c }) => {
      const cell = this.boardEl.querySelector(`.board-cell[data-r="${r}"][data-c="${c}"]`);
      if (cell) {
        cell.classList.add(isValid ? 'cell-hover-valid' : 'cell-hover-invalid');
        if (isValid && this.draggedPiece) {
          cell.style.backgroundColor = this.draggedPiece.color.fill + '77';
        }
      }
    });
  }

  isValidPlacement(shape, startRow, startCol) {
    const sH = shape.length;
    const sW = shape[0].length;

    if (startRow < 0 || startCol < 0) return false;
    if (startRow + sH > this.boardSize || startCol + sW > this.boardSize) return false;

    for (let r = 0; r < sH; r++) {
      for (let c = 0; c < sW; c++) {
        if (shape[r][c] === 1) {
          if (this.grid[startRow + r][startCol + c] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  onPiecePointerUp(e) {
    if (!this.isDragging) return;

    this.ghostEl.style.display = 'none';
    this.isDragging = false;

    // Check if dropped onto strictly valid location
    if (this.currentHoverValid && this.hoverCells.length > 0 && this.draggedPiece) {
      const isValid = this.isValidPlacement(this.draggedPiece.shape, this.currentHoverRow, this.currentHoverCol);
      if (isValid) {
        this.placeDraggedPiece();
        return;
      }
    }

    // Invalid drop (overlapping block or off-board): return piece to tray
    this.cancelDrag();
  }

  cancelDrag() {
    this.clearHoverPreview();
    this.ghostEl.style.display = 'none';
    this.isDragging = false;
    this.hoverCells = [];
    this.currentHoverValid = false;
    this.currentHoverRow = null;
    this.currentHoverCol = null;
    this.draggedPiece = null;
    this.draggedSlotIndex = null;

    // Restore tray element visibility
    this.renderTray();
  }

  placeDraggedPiece() {
    const piece = this.draggedPiece;
    const slotIdx = this.draggedSlotIndex;

    if (!piece || !this.currentHoverValid || this.hoverCells.length === 0) {
      this.cancelDrag();
      return;
    }

    // Strict collision safeguard: absolutely NO cell in hoverCells may be occupied
    const hasCollision = this.hoverCells.some(({ r, c }) => {
      return !this.grid[r] || this.grid[r][c] !== 0;
    });

    if (hasCollision) {
      // Reject placement on top of existing blocks
      this.cancelDrag();
      return;
    }

    // 1. Commit cells to grid
    let blockCount = 0;
    this.hoverCells.forEach(({ r, c }) => {
      this.grid[r][c] = {
        fill: piece.color.fill,
        border: piece.color.border,
        highlight: piece.color.highlight
      };
      blockCount++;
    });

    // 2. Clear hover and drag references immediately
    this.hoverCells = [];
    this.currentHoverValid = false;
    this.currentHoverRow = null;
    this.currentHoverCol = null;
    this.draggedPiece = null;
    this.draggedSlotIndex = null;

    // 3. Play drop SFX
    window.audioManager.playDrop();

    // 4. Clear tray slot
    this.trayPieces[slotIdx] = null;
    this.clearHoverPreview();
    this.renderBoard();
    this.renderTray();

    // 5. Update block placement stats & score
    const placementScore = blockCount * 10;
    this.score += placementScore;
    window.stateManager.updateQuestProgress('place', blockCount);

    // 6. Check lines
    this.checkAndClearLines();
  }

  checkAndClearLines() {
    const fullRows = [];
    const fullCols = [];

    // Check horizontal rows
    for (let r = 0; r < this.boardSize; r++) {
      if (this.grid[r].every(cell => cell !== 0)) {
        fullRows.push(r);
      }
    }

    // Check vertical columns
    for (let c = 0; c < this.boardSize; c++) {
      let isFull = true;
      for (let r = 0; r < this.boardSize; r++) {
        if (this.grid[r][c] === 0) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        fullCols.push(c);
      }
    }

    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      // Streak continues!
      this.combo++;
      if (this.combo > this.maxComboInSession) {
        this.maxComboInSession = this.combo;
      }
      this.linesClearedInSession += totalLines;

      // Calculate score bonus
      const lineBaseMultiplier = [0, 100, 300, 600, 1000, 1500, 2200, 3000][Math.min(totalLines, 7)];
      const comboMultiplier = Math.max(1, this.combo);
      const earnedScore = lineBaseMultiplier * comboMultiplier;
      this.score += earnedScore;

      // Award coins
      const coinsWon = (totalLines * 10) + (this.combo > 1 ? this.combo * 5 : 0);
      window.stateManager.addCoins(coinsWon);

      // Quest updates
      window.stateManager.updateQuestProgress('line', totalLines);
      window.stateManager.updateQuestProgress('combo', this.combo);
      window.stateManager.updateQuestProgress('score', this.score);

      // SFX
      window.audioManager.playLineClear(totalLines);
      if (this.combo > 1) {
        setTimeout(() => window.audioManager.playCombo(this.combo), 180);
      }

      // Visual Juice: Particles, screen shake, floating combo text
      this.triggerBlastEffects(fullRows, fullCols, totalLines, earnedScore);

      // Clear from data grid
      fullRows.forEach(r => {
        for (let c = 0; c < this.boardSize; c++) this.grid[r][c] = 0;
      });
      fullCols.forEach(c => {
        for (let r = 0; r < this.boardSize; r++) this.grid[r][c] = 0;
      });

      // Delayed re-render so blast animation can play
      setTimeout(() => {
        this.renderBoard();
        this.afterTurnChecks();
      }, 260);

    } else {
      // No lines cleared: combo resets to 0
      this.combo = 0;
      this.afterTurnChecks();
    }

    this.updateStatsUI();
  }

  triggerBlastEffects(fullRows, fullCols, totalLines, earnedScore) {
    // Screen shake
    this.boardEl.classList.add('shake-anim');
    setTimeout(() => this.boardEl.classList.remove('shake-anim'), 400);

    // Collect coordinates of cleared cells for particle explosion
    const clearedCells = [];
    const boardRect = this.boardEl.getBoundingClientRect();

    fullRows.forEach(r => {
      for (let c = 0; c < this.boardSize; c++) {
        const cell = this.boardEl.querySelector(`.board-cell[data-r="${r}"][data-c="${c}"]`);
        if (cell) {
          cell.classList.add('cell-clearing');
          const rect = cell.getBoundingClientRect();
          clearedCells.push({
            x: rect.left - boardRect.left,
            y: rect.top - boardRect.top,
            size: rect.width
          });
        }
      }
    });

    fullCols.forEach(c => {
      for (let r = 0; r < this.boardSize; r++) {
        const cell = this.boardEl.querySelector(`.board-cell[data-r="${r}"][data-c="${c}"]`);
        if (cell) {
          cell.classList.add('cell-clearing');
          const rect = cell.getBoundingClientRect();
          clearedCells.push({
            x: rect.left - boardRect.left,
            y: rect.top - boardRect.top,
            size: rect.width
          });
        }
      }
    });

    // Particle explosion
    const skin = window.skinManager.getCurrentSkin();
    window.particleEngine.explodeCells(clearedCells, skin.blockColors[0]);

    // Floating text
    let banner = `+${earnedScore}`;
    if (this.combo > 1) {
      banner = `COMBO x${this.combo}! (+${earnedScore})`;
    } else if (totalLines >= 3) {
      banner = `TRIPLE BLAST! (+${earnedScore})`;
    } else if (totalLines === 2) {
      banner = `DOUBLE BLAST! (+${earnedScore})`;
    }

    const midX = boardRect.width / 2;
    const midY = boardRect.height / 2;
    window.particleEngine.spawnFloatingText(banner, midX, midY, {
      scale: 1.4,
      color: '#94202C',
      strokeColor: '#FFFFFF'
    });
  }

  afterTurnChecks() {
    // 1. If tray is completely empty, spawn next batch
    if (this.trayPieces.every(p => p === null)) {
      this.spawnNewBatch();
    } else {
      // Update unfit indicators on remaining pieces
      this.renderTray();

      // 2. Check if remaining pieces can fit anywhere
      if (!window.pieceGenerator.canAnyPieceFit(this.grid, this.trayPieces)) {
        setTimeout(() => this.triggerGameOver(), 350);
      }
    }
  }

  triggerGameOver() {
    window.audioManager.playGameOver();

    const isNewHigh = window.stateManager.recordMatch(
      this.score,
      this.maxComboInSession,
      this.linesClearedInSession
    );

    // Call UI modal
    if (window.uiManager) {
      window.uiManager.showGameOverModal({
        score: this.score,
        highScore: window.stateManager.data.highScore,
        isNewHigh: isNewHigh,
        maxCombo: this.maxComboInSession,
        linesCleared: this.linesClearedInSession
      });
    }
  }

  // --- Booster Tools ---
  activateBooster(type) {
    if (this.activeBooster === type) {
      // Toggle off
      this.deactivateBooster();
      return;
    }

    const available = window.stateManager.data.boosters[type] || 0;
    if (available <= 0) {
      window.uiManager.showToast(`Booster ${type.toUpperCase()} habis! Dapatkan lewat Lucky Spin / Toko.`);
      return;
    }

    if (type === 'refresh') {
      // Instant action
      if (window.stateManager.useBooster('refresh')) {
        window.audioManager.playBooster();
        this.spawnNewBatch();
        window.uiManager.updateBoosterUI();
        window.uiManager.showToast('Balok berhasil diacak ulang! 🔄');
      }
      return;
    }

    // Bomb or Hammer requires board target selection
    this.activeBooster = type;
    this.boardEl.classList.add(`booster-active-${type}`);
    window.uiManager.showToast(`Mode ${type.toUpperCase()} aktif! Ketuk papan untuk menggunakan.`);
    window.uiManager.highlightBoosterButton(type, true);
  }

  deactivateBooster() {
    if (!this.activeBooster) return;
    this.boardEl.classList.remove('booster-active-bomb', 'booster-active-hammer');
    window.uiManager.highlightBoosterButton(this.activeBooster, false);
    this.activeBooster = null;
  }

  handleBoosterTarget(targetR, targetC) {
    if (!this.activeBooster) return;

    const type = this.activeBooster;
    if (!window.stateManager.useBooster(type)) {
      this.deactivateBooster();
      return;
    }

    window.audioManager.playBooster();
    const cellsToClear = [];

    if (type === 'hammer') {
      // Clears single cell
      cellsToClear.push({ r: targetR, c: targetC });
    } else if (type === 'bomb') {
      // Clears 3x3 radius
      for (let r = targetR - 1; r <= targetR + 1; r++) {
        for (let c = targetC - 1; c <= targetC + 1; c++) {
          if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
            cellsToClear.push({ r, c });
          }
        }
      }
    }

    const boardRect = this.boardEl.getBoundingClientRect();
    const blastParticles = [];

    cellsToClear.forEach(({ r, c }) => {
      this.grid[r][c] = 0;
      const cell = this.boardEl.querySelector(`.board-cell[data-r="${r}"][data-c="${c}"]`);
      if (cell) {
        cell.classList.add('cell-clearing');
        const rect = cell.getBoundingClientRect();
        blastParticles.push({
          x: rect.left - boardRect.left,
          y: rect.top - boardRect.top,
          size: rect.width
        });
      }
    });

    window.particleEngine.explodeCells(blastParticles, { fill: '#E58B24', highlight: '#FFD700' });
    this.deactivateBooster();
    window.uiManager.updateBoosterUI();

    setTimeout(() => {
      this.renderBoard();
      this.afterTurnChecks();
    }, 250);
  }
}

window.blockBlastGame = new BlockBlastGame();
