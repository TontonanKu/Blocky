/**
 * UI Manager: Modals, Lucky Spin Wheel, Daily Rewards, Leaderboard, Skin Shop
 */

class UIManager {
  constructor() {
    this.activeModal = null;
    this.wheelCanvas = null;
    this.wheelCtx = null;
    this.wheelAngle = 0;
    this.isSpinning = false;

    // Wheel items
    this.wheelSlices = [
      { text: '100 KOIN', icon: '🪙', type: 'coins', value: 100, color: '#94202C', textColor: '#FFF' },
      { text: '1x BOMB', icon: '💣', type: 'booster', booster: 'bomb', value: 1, color: '#E58B24', textColor: '#FFF' },
      { text: '250 KOIN', icon: '💰', type: 'coins', value: 250, color: '#F7F2E7', textColor: '#94202C' },
      { text: '1x HAMMER', icon: '🔨', type: 'booster', booster: 'hammer', value: 1, color: '#94202C', textColor: '#FFF' },
      { text: 'JACKPOT 1K', icon: '👑', type: 'coins', value: 1000, color: '#E58B24', textColor: '#FFF' },
      { text: '1x REFRESH', icon: '🔄', type: 'booster', booster: 'refresh', value: 1, color: '#F7F2E7', textColor: '#94202C' },
      { text: '500 KOIN', icon: '💎', type: 'coins', value: 500, color: '#94202C', textColor: '#FFF' },
      { text: '50 KOIN', icon: '🪙', type: 'coins', value: 50, color: '#D94E34', textColor: '#FFF' }
    ];
  }

  init() {
    this.updateStatsBar();
    this.bindModalTriggers();
    this.initLuckyWheel();
    this.updateBoosterUI();
    this.updateHeaderProfile();
    this.checkDailyBadges();
  }

  // --- Modal Management ---
  openModal(modalId) {
    window.audioManager.playClick();
    this.closeAllModals();

    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modalId;

      // Modal specific content refresh
      if (modalId === 'modal-leaderboard') this.renderLeaderboard();
      if (modalId === 'modal-skins') this.renderSkinShop();
      if (modalId === 'modal-daily') this.renderDailyUI();
      if (modalId === 'modal-spin') this.renderSpinUI();
      if (modalId === 'modal-settings') this.renderSettingsUI();
    }
  }

  closeModal(modalId) {
    window.audioManager.playClick();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
    if (this.activeModal === modalId) this.activeModal = null;
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    this.activeModal = null;
  }

  bindModalTriggers() {
    // Backdrop click closes
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('pointerdown', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          this.activeModal = null;
        }
      });
    });

    // Close buttons
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });
  }

  // --- Lucky Spin Wheel ---
  initLuckyWheel() {
    this.wheelCanvas = document.getElementById('spin-wheel-canvas');
    if (!this.wheelCanvas) return;
    this.wheelCtx = this.wheelCanvas.getContext('2d');
    this.drawWheel();

    const spinBtn = document.getElementById('btn-do-spin');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => this.spinWheel());
    }
  }

  drawWheel() {
    if (!this.wheelCtx || !this.wheelCanvas) return;
    const ctx = this.wheelCtx;
    const w = this.wheelCanvas.width;
    const h = this.wheelCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = cx - 12;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.wheelAngle);

    const sliceAngle = (Math.PI * 2) / this.wheelSlices.length;

    // Draw slices
    this.wheelSlices.forEach((slice, idx) => {
      const start = idx * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#94202C';
      ctx.stroke();

      // Text & Icon
      ctx.save();
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = slice.textColor;
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillText(`${slice.icon} ${slice.text}`, radius - 20, 0);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#94202C';
    ctx.stroke();

    // Center peg
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#94202C';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F7F2E7';
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  }

  spinWheel() {
    if (this.isSpinning) return;

    const hasFree = window.stateManager.hasFreeSpinToday();
    const cost = 100;
    const playerCoins = Number(window.stateManager.data.coins) || 0;

    if (!hasFree && playerCoins < cost) {
      this.showToast(`Koin tidak cukup! Butuh ${cost} koin untuk putar lagi (Saldo: ${playerCoins} 🪙).`);
      return;
    }

    if (hasFree) {
      this.showToast('🎟️ Menggunakan 1x Tiket Putaran Gratis Harian!');
    } else {
      window.stateManager.spendCoins(cost);
      this.updateStatsBar();
      this.showToast('🪙 -100 Koin digunakan untuk memutar roda!');
    }

    window.stateManager.recordSpin();
    this.isSpinning = true;

    const spinBtn = document.getElementById('btn-do-spin');
    if (spinBtn) spinBtn.disabled = true;

    // Determine winning slice randomly
    const prizeIndex = Math.floor(Math.random() * this.wheelSlices.length);
    const sliceAngle = (Math.PI * 2) / this.wheelSlices.length;

    const extraFullRotations = 5 + Math.floor(Math.random() * 3);
    const targetSliceAngle = (3 * Math.PI / 2) - (prizeIndex * sliceAngle + sliceAngle / 2);
    const totalRotation = (extraFullRotations * Math.PI * 2) + (targetSliceAngle - (this.wheelAngle % (Math.PI * 2)));

    const startAngle = this.wheelAngle;
    const duration = 4200;
    const startTime = performance.now();

    let lastTickAngle = startAngle;

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const ease = 1 - Math.pow(1 - progress, 3);
      this.wheelAngle = startAngle + totalRotation * ease;

      if (Math.abs(this.wheelAngle - lastTickAngle) >= sliceAngle) {
        window.audioManager.playSpinTick();
        lastTickAngle = this.wheelAngle;
      }

      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.isSpinning = false;
        if (spinBtn) spinBtn.disabled = false;
        this.grantWheelPrize(this.wheelSlices[prizeIndex]);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  grantWheelPrize(slice) {
    window.audioManager.playWinPrize();
    window.particleEngine.burstConfetti();

    if (slice.type === 'coins') {
      window.stateManager.addCoins(slice.value);
      this.showToast(`Selamat! Kamu memenangkan ${slice.value} Koin! 🪙🎉`);
    } else if (slice.type === 'booster') {
      window.stateManager.addBooster(slice.booster, slice.value);
      this.showToast(`Selamat! Kamu mendapatkan Booster ${slice.booster.toUpperCase()}! 🎁`);
    }

    this.updateStatsBar();
    this.updateBoosterUI();
    this.renderSpinUI();
  }

  renderSpinUI() {
    const hasFree = window.stateManager.hasFreeSpinToday();
    const spinBtn = document.getElementById('btn-do-spin');
    const spinSub = document.getElementById('spin-status-label');
    const playerCoins = Number(window.stateManager.data.coins) || 0;

    if (hasFree) {
      if (spinBtn) {
        spinBtn.disabled = false;
        spinBtn.innerHTML = '<span>PUTAR GRATIS! 🎁</span>';
      }
      if (spinSub) spinSub.innerHTML = `Saldo: <b>${playerCoins} 🪙</b> • Kamu memiliki 1x Tiket Gratis Hari Ini!`;
    } else {
      const canAfford = playerCoins >= 100;
      if (spinBtn) {
        spinBtn.disabled = !canAfford;
        spinBtn.innerHTML = canAfford ? '<span>PUTAR LAGI (100 KOIN) 🪙</span>' : '<span>KOIN KURANG (100 KOIN) 🪙</span>';
      }
      if (spinSub) spinSub.innerHTML = `Saldo: <b>${playerCoins} 🪙</b> • Putaran berbayar (100 Koin / putar)`;
    }
  }

  // --- Daily Login & Daily Quests ---
  renderDailyUI() {
    const data = window.stateManager.data;
    const streak = data.dailyLogin.streak || 0;
    const claimedToday = data.dailyLogin.claimedToday;

    const rewards = [
      { day: 1, title: 'Hari 1', reward: 100, icon: '🪙' },
      { day: 2, title: 'Hari 2', reward: 150, icon: '🪙' },
      { day: 3, title: 'Hari 3', reward: 200, icon: '💎' },
      { day: 4, title: 'Hari 4', reward: 300, icon: '🪙' },
      { day: 5, title: 'Hari 5', reward: 400, icon: '🎁' },
      { day: 6, title: 'Hari 6', reward: 600, icon: '⚡' },
      { day: 7, title: 'Hari 7', reward: 1200, icon: '👑' }
    ];

    const grid = document.getElementById('daily-streak-grid');
    if (grid) {
      grid.innerHTML = '';
      rewards.forEach((item, idx) => {
        const dayNum = idx + 1;
        const card = document.createElement('div');
        const isPast = dayNum <= streak && (claimedToday || dayNum < streak);
        const isToday = !claimedToday && (dayNum === streak + 1 || (streak === 7 && dayNum === 1));

        card.className = `daily-streak-card ${isPast ? 'claimed' : ''} ${isToday ? 'ready-claim' : ''}`;
        card.innerHTML = `
          <div class="day-label">${item.title}</div>
          <div class="day-icon">${item.icon}</div>
          <div class="day-reward">+${item.reward}</div>
          ${isPast ? '<span class="stamp-check">✓ Terklaim</span>' : ''}
          ${isToday ? '<button class="btn-claim-streak">KLAIM</button>' : ''}
        `;

        if (isToday) {
          const btn = card.querySelector('.btn-claim-streak');
          if (btn) {
            btn.addEventListener('click', () => {
              window.audioManager.playWinPrize();
              window.particleEngine.burstConfetti();
              window.stateManager.claimDailyReward(dayNum, item.reward);
              this.showToast(`Berhasil klaim hadiah Hari ${dayNum}: +${item.reward} Koin! 🪙`);
              this.updateStatsBar();
              this.renderDailyUI();
              this.checkDailyBadges();
            });
          }
        }

        grid.appendChild(card);
      });
    }

    // Daily Quests list
    const questListEl = document.getElementById('daily-quest-list');
    if (questListEl && data.dailyQuests) {
      questListEl.innerHTML = '';
      data.dailyQuests.list.forEach(q => {
        const card = document.createElement('div');
        card.className = 'quest-card';
        const pct = Math.min(100, Math.floor((q.current / q.target) * 100));
        const canClaim = !q.claimed && q.current >= q.target;

        card.innerHTML = `
          <div class="quest-info">
            <div class="quest-title">${q.icon} ${q.title}</div>
            <div class="quest-bar-container">
              <div class="quest-bar-fill" style="width: ${pct}%"></div>
            </div>
            <div class="quest-progress-txt">${q.current} / ${q.target}</div>
          </div>
          <div class="quest-action">
            ${q.claimed 
              ? '<span class="badge-claimed">Selesai ✓</span>' 
              : `<button class="btn-claim-quest ${canClaim ? 'claimable' : 'disabled'}" ${canClaim ? '' : 'disabled'}>+${q.rewardCoins} 🪙</button>`
            }
          </div>
        `;

        if (canClaim) {
          const btn = card.querySelector('.btn-claim-quest');
          btn.addEventListener('click', () => {
            window.audioManager.playWinPrize();
            window.particleEngine.burstConfetti();
            const reward = window.stateManager.claimQuest(q.id);
            this.showToast(`Misi Selesai: +${reward} Koin! 🎉`);
            this.updateStatsBar();
            this.renderDailyUI();
            this.checkDailyBadges();
          });
        }

        questListEl.appendChild(card);
      });
    }
  }

  checkDailyBadges() {
    const hasFreeSpin = window.stateManager.hasFreeSpinToday();
    const hasDailyClaim = !window.stateManager.data.dailyLogin.claimedToday;
    const hasQuestReady = window.stateManager.data.dailyQuests.list.some(q => !q.claimed && q.current >= q.target);

    const spinBadge = document.getElementById('badge-spin-alert');
    if (spinBadge) spinBadge.style.display = hasFreeSpin ? 'block' : 'none';

    const dailyBadge = document.getElementById('badge-daily-alert');
    if (dailyBadge) dailyBadge.style.display = (hasDailyClaim || hasQuestReady) ? 'block' : 'none';
  }

  // --- Leaderboard & History ---
  renderLeaderboard() {
    const tabRank = document.getElementById('tab-btn-rank');
    const tabHist = document.getElementById('tab-btn-hist');
    const viewRank = document.getElementById('leaderboard-view-rank');
    const viewHist = document.getElementById('leaderboard-view-hist');

    if (tabRank && tabHist) {
      tabRank.onclick = () => {
        tabRank.classList.add('active');
        tabHist.classList.remove('active');
        viewRank.classList.remove('hidden');
        viewHist.classList.add('hidden');
      };
      tabHist.onclick = () => {
        tabHist.classList.add('active');
        tabRank.classList.remove('active');
        viewHist.classList.remove('hidden');
        viewRank.classList.add('hidden');
      };
    }

    // Populate Rank Table
    const drawRankList = () => {
      if (!viewRank) return;
      const list = window.stateManager.getLeaderboardList();
      viewRank.innerHTML = '';

      if (list.length === 0) {
        viewRank.innerHTML = `
          <div class="empty-hist" style="padding: 32px 16px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 8px;">🏆</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: var(--theme-card-text);">Peringkat Global Bersih</div>
            <div style="font-size: 12px; color: var(--theme-card-desc); line-height: 1.4;">Data dummy telah direset. Mainkan game sekarang dan jadilah pemain nomor #1 di papan peringkat!</div>
          </div>
        `;
        return;
      }

      list.forEach(item => {
        const row = document.createElement('div');
        row.className = `rank-row ${item.isPlayer ? 'player-row' : ''}`;
        
        let rankBadge = `#${item.rank}`;
        if (item.rank === 1) rankBadge = '🥇 #1';
        if (item.rank === 2) rankBadge = '🥈 #2';
        if (item.rank === 3) rankBadge = '🥉 #3';

        row.innerHTML = `
          <div class="rank-pos">${rankBadge}</div>
          <div class="rank-avatar">${item.avatar}</div>
          <div class="rank-user">
            <span class="user-name">${item.name}</span>
            <span class="user-date">${item.date}</span>
          </div>
          <div class="rank-score">${item.score.toLocaleString()} <small>PTS</small></div>
        `;
        viewRank.appendChild(row);
      });
    };

    drawRankList();

    // Refresh from server async
    window.stateManager.fetchLeaderboard().then(() => {
      drawRankList();
    });

    // Populate History Table
    if (viewHist) {
      viewHist.innerHTML = '';
      const history = window.stateManager.data.history || [];
      if (history.length === 0) {
        viewHist.innerHTML = `
          <div class="empty-hist" style="padding: 32px 16px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 8px;">📜</div>
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: var(--theme-card-text);">Belum Ada Riwayat Pertandingan</div>
            <div style="font-size: 12px; color: var(--theme-card-desc); line-height: 1.4;">Riwayat dummy telah direset. Mainkan game sekarang untuk merekam skor, kombo, dan baris ledakanmu!</div>
          </div>
        `;
      } else {
        history.forEach(h => {
          const row = document.createElement('div');
          row.className = 'history-row';
          row.innerHTML = `
            <div class="hist-date">${h.date}</div>
            <div class="hist-detail">
              <span>🔥 Kombo Max: x${h.maxCombo}</span>
              <span>💥 Baris: ${h.linesCleared}</span>
            </div>
            <div class="hist-score">${h.score.toLocaleString()} PTS</div>
          `;
          viewHist.appendChild(row);
        });
      }
    }
  }

  // --- Skin & Theme Shop ---
  renderSkinShop() {
    const listEl = document.getElementById('skin-shop-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const currentActive = window.stateManager.data.activeSkin;
    const playerCoins = Number(window.stateManager.data.coins) || 0;

    // Header banner with real-time balance
    const balanceBanner = document.createElement('div');
    balanceBanner.className = 'shop-balance-banner';
    balanceBanner.innerHTML = `<span>Saldo Koin Anda:</span> <b>🪙 ${playerCoins.toLocaleString()}</b>`;
    listEl.appendChild(balanceBanner);

    window.SKIN_CATALOG.forEach(skin => {
      const isOwned = window.stateManager.hasSkin(skin.id);
      const isEquipped = skin.id === currentActive;

      const card = document.createElement('div');
      card.className = `skin-card ${isEquipped ? 'equipped' : ''}`;

      const swatches = skin.blockColors.slice(0, 6).map(c => 
        `<span class="color-swatch" style="background:${c.fill}; border-color:${c.border};"></span>`
      ).join('');

      let actionBtnHtml = '';
      if (isEquipped) {
        actionBtnHtml = '<button class="btn-skin-action equipped" disabled>TERPASANG ✓</button>';
      } else if (isOwned) {
        actionBtnHtml = `<button class="btn-skin-action use-skin" data-id="${skin.id}">PASANG TEMA</button>`;
      } else {
        // Always clickable as requested!
        actionBtnHtml = `<button class="btn-skin-action buy-skin" data-id="${skin.id}" data-price="${skin.price}">BELI ${skin.price} 🪙</button>`;
      }

      card.innerHTML = `
        <div class="skin-header">
          <span class="skin-name">${skin.name}</span>
          <span class="skin-tag">${skin.tag}</span>
        </div>
        <div class="skin-desc">${skin.desc}</div>
        <div class="skin-swatches">
          <div class="swatch-label">Palet Balok & Papan:</div>
          <div class="swatch-row">${swatches}</div>
        </div>
        <div class="skin-footer">
          ${actionBtnHtml}
        </div>
      `;

      const actionBtn = card.querySelector('.btn-skin-action');
      if (actionBtn && !isEquipped) {
        actionBtn.addEventListener('click', () => {
          if (isOwned) {
            window.stateManager.setActiveSkin(skin.id);
            window.skinManager.setSkin(skin.id);
            window.audioManager.playPick();
            this.showToast(`Tema "${skin.name}" berhasil dipasang! 🎨`);
            this.renderSkinShop();
            window.blockBlastGame.renderBoard();
            window.blockBlastGame.renderTray();
          } else {
            const curBalance = Number(window.stateManager.data.coins) || 0;
            if (curBalance < skin.price) {
              // Play warning click and wiggle card
              window.audioManager.playClick();
              card.classList.add('insufficient-wiggle');
              setTimeout(() => card.classList.remove('insufficient-wiggle'), 400);
              this.showToast(`⚠️ Koin tidak cukup! Saldo Anda: ${curBalance.toLocaleString()} 🪙, Butuh: ${skin.price.toLocaleString()} 🪙.`);
              return;
            }

            if (window.stateManager.spendCoins(skin.price)) {
              window.audioManager.playWinPrize();
              window.particleEngine.burstConfetti();
              window.stateManager.unlockSkin(skin.id);
              window.stateManager.setActiveSkin(skin.id);
              window.skinManager.setSkin(skin.id);
              this.showToast(`Berhasil membeli & memasang "${skin.name}"! (-${skin.price} 🪙) 🎉`);
              this.updateStatsBar();
              this.renderSkinShop();
              window.blockBlastGame.renderBoard();
              window.blockBlastGame.renderTray();
            } else {
              this.showToast(`Gagal memproses transaksi.`);
            }
          }
        });
      }

      listEl.appendChild(card);
    });
  }

  // --- Settings UI ---
  renderSettingsUI() {
    const s = window.stateManager.data.settings;

    const sfxToggle = document.getElementById('toggle-sfx');
    const bgmToggle = document.getElementById('toggle-bgm');
    const sfxSlider = document.getElementById('slider-sfx-vol');
    const bgmSlider = document.getElementById('slider-bgm-vol');

    if (sfxToggle) {
      sfxToggle.checked = s.sfx;
      sfxToggle.onchange = () => {
        s.sfx = sfxToggle.checked;
        window.audioManager.setSfxEnabled(s.sfx);
        window.stateManager.save();
      };
    }

    if (bgmToggle) {
      bgmToggle.checked = s.bgm;
      bgmToggle.onchange = () => {
        s.bgm = bgmToggle.checked;
        window.audioManager.setBgmEnabled(s.bgm);
        window.stateManager.save();
      };
    }

    if (sfxSlider) {
      sfxSlider.value = s.sfxVol * 100;
      sfxSlider.oninput = () => {
        s.sfxVol = sfxSlider.value / 100;
        window.audioManager.setSfxVolume(s.sfxVol);
        window.stateManager.save();
      };
    }

    if (bgmSlider) {
      bgmSlider.value = s.bgmVol * 100;
      bgmSlider.oninput = () => {
        s.bgmVol = bgmSlider.value / 100;
        window.audioManager.setBgmVolume(s.bgmVol);
        window.stateManager.save();
      };
    }

    const resetBtn = document.getElementById('btn-reset-game-data');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Yakin ingin mereset seluruh koin, skin, dan progres game? Tindakan ini tidak bisa dibatalkan.')) {
          window.stateManager.resetAll();
          window.skinManager.setSkin('crimson_neo');
          location.reload();
        }
      };
    }
  }

  // --- Game Over Modal ---
  showGameOverModal({ score, highScore, isNewHigh, maxCombo, linesCleared }) {
    const modal = document.getElementById('modal-gameover');
    if (!modal) return;

    const finalScoreEl = document.getElementById('go-final-score');
    const finalHighEl = document.getElementById('go-high-score');
    const goComboEl = document.getElementById('go-max-combo');
    const goLinesEl = document.getElementById('go-lines-cleared');
    const newHighBadge = document.getElementById('go-new-high-badge');

    if (finalScoreEl) finalScoreEl.textContent = score.toLocaleString();
    if (finalHighEl) finalHighEl.textContent = highScore.toLocaleString();
    if (goComboEl) goComboEl.textContent = `x${maxCombo}`;
    if (goLinesEl) goLinesEl.textContent = linesCleared;

    if (newHighBadge) {
      newHighBadge.style.display = isNewHigh ? 'inline-block' : 'none';
      if (isNewHigh) {
        window.particleEngine.burstConfetti();
      }
    }

    this.openModal('modal-gameover');

    const retryBtn = document.getElementById('btn-go-retry');
    if (retryBtn) {
      retryBtn.onclick = () => {
        this.closeModal('modal-gameover');
        window.blockBlastGame.resetGame();
      };
    }

    const goHomeBtn = document.getElementById('btn-go-home');
    if (goHomeBtn) {
      goHomeBtn.onclick = () => {
        this.closeModal('modal-gameover');
        this.showScreen('screen-home');
      };
    }
  }

  // --- Screen View Switcher (Homepage <-> In-Game) ---
  showScreen(screenId) {
    window.audioManager.playClick();
    const homeScreen = document.getElementById('screen-home');
    const gameScreen = document.getElementById('screen-game');

    if (screenId === 'screen-home') {
      if (homeScreen) {
        homeScreen.classList.remove('hidden');
        homeScreen.classList.add('active');
      }
      if (gameScreen) {
        gameScreen.classList.add('hidden');
        gameScreen.classList.remove('active');
      }
      this.updateStatsBar();
    } else if (screenId === 'screen-game') {
      if (gameScreen) {
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('active');
      }
      if (homeScreen) {
        homeScreen.classList.add('hidden');
        homeScreen.classList.remove('active');
      }
      this.updateStatsBar();
      if (window.particleEngine) {
        setTimeout(() => window.particleEngine.resize(), 50);
      }
    }
  }

  // --- Booster Tools UI ---
  updateBoosterUI() {
    const b = window.stateManager.data.boosters;
    const bBomb = document.getElementById('booster-count-bomb');
    const bHammer = document.getElementById('booster-count-hammer');
    const bRefresh = document.getElementById('booster-count-refresh');

    if (bBomb) bBomb.textContent = b.bomb || 0;
    if (bHammer) bHammer.textContent = b.hammer || 0;
    if (bRefresh) bRefresh.textContent = b.refresh || 0;
  }

  highlightBoosterButton(type, isActive) {
    const btn = document.querySelector(`.btn-booster[data-type="${type}"]`);
    if (btn) {
      if (isActive) btn.classList.add('booster-active');
      else btn.classList.remove('booster-active');
    }
  }

  updateStatsBar() {
    if (window.blockBlastGame && typeof window.blockBlastGame.updateStatsUI === 'function') {
      window.blockBlastGame.updateStatsUI();
    }

    const currentCoins = Number(window.stateManager.data.coins) || 0;
    const formattedCoins = currentCoins.toLocaleString();

    // Home Header Coins
    const homeCoins = document.getElementById('home-stat-coins');
    if (homeCoins) homeCoins.textContent = formattedCoins;

    // Game Header Coins
    const gameCoins = document.getElementById('stat-coins');
    if (gameCoins) gameCoins.textContent = formattedCoins;

    // Home Highscore
    const highScore = Number(window.stateManager.data.highScore) || 0;
    const homeHigh = document.getElementById('home-display-high-score');
    if (homeHigh) homeHigh.innerHTML = `${highScore.toLocaleString()} <small>PTS</small>`;

    // Game Highscore
    const gameHigh = document.getElementById('stat-high-score');
    if (gameHigh) gameHigh.textContent = highScore.toLocaleString();

    // Skin Shop banner if open
    const shopBalanceVal = document.querySelector('.shop-balance-banner b');
    if (shopBalanceVal) shopBalanceVal.textContent = `🪙 ${formattedCoins}`;

    // Lucky Spin subtitle if open
    const spinSub = document.getElementById('spin-status-label');
    if (spinSub && !window.stateManager.hasFreeSpinToday()) {
      spinSub.innerHTML = `Saldo: <b>${formattedCoins} 🪙</b> • Putaran berbayar (100 Koin / putar)`;
    }
  }

  updateHeaderProfile() {
    const pName = document.getElementById('header-player-name');
    const pAvatar = document.getElementById('header-player-avatar');
    const homeName = document.getElementById('home-player-name');
    const homeAvatar = document.getElementById('home-player-avatar');
    const prof = window.stateManager.data.profile;

    if (pName) pName.textContent = prof.name;
    if (pAvatar) pAvatar.textContent = prof.avatar;
    if (homeName) homeName.textContent = prof.name;
    if (homeAvatar) homeAvatar.textContent = prof.avatar;
  }

  showToast(message) {
    const toast = document.getElementById('game-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

window.uiManager = new UIManager();
