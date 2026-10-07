/**
 * Main Application Entry Point
 * Wires together Audio, Skins, State, Game, Particles, UI, and Screen Routing
 */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Apply active skin
  const currentSkinId = window.stateManager.data.activeSkin || 'crimson_neo';
  window.skinManager.setSkin(currentSkinId);

  // 2. Setup Audio settings
  const settings = window.stateManager.data.settings;
  window.audioManager.setSfxEnabled(settings.sfx);
  window.audioManager.setBgmEnabled(settings.bgm);
  window.audioManager.setSfxVolume(settings.sfxVol);
  window.audioManager.setBgmVolume(settings.bgmVol);

  // Unlock audio context on first user gesture
  const unlockAudio = () => {
    window.audioManager.ensureContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // 3. Initialize Particle Canvas
  const canvas = document.getElementById('fx-canvas');
  if (canvas) {
    window.particleEngine.init(canvas);
  }

  // 4. Initialize Core Game
  const domElements = {
    board: document.getElementById('game-board'),
    traySlots: [
      document.getElementById('tray-slot-0'),
      document.getElementById('tray-slot-1'),
      document.getElementById('tray-slot-2')
    ],
    score: document.getElementById('stat-current-score'),
    highScore: document.getElementById('stat-high-score'),
    coins: document.getElementById('stat-coins'),
    combo: document.getElementById('streak-indicator'),
    ghost: document.getElementById('drag-ghost')
  };

  window.blockBlastGame.init(domElements);

  // 5. Initialize UI Manager
  window.uiManager.init();

  // 6. Bind Screen Switching & Buttons
  setupScreenNavigation();
  setupBoosterButtons();
  setupProfileModal();

  console.log('🎮 Block Blast Loaded! Menu Homepage & In-Game Screens Ready.');
});

function setupScreenNavigation() {
  // Play Now Button (From Home -> Game)
  const btnPlayNow = document.getElementById('btn-play-now');
  if (btnPlayNow) {
    btnPlayNow.addEventListener('click', () => {
      window.uiManager.showScreen('screen-game');
      // If previous game was over or empty, start fresh
      if (window.blockBlastGame.score === 0 && window.blockBlastGame.grid.every(r => r.every(c => c === 0))) {
        window.blockBlastGame.resetGame();
      }
    });
  }

  // Back to Home Button (From Game -> Home)
  const btnBackHome = document.getElementById('btn-back-home');
  if (btnBackHome) {
    btnBackHome.addEventListener('click', () => {
      window.uiManager.showScreen('screen-home');
    });
  }

  // Home Menu Grid Buttons
  const btnMenuDaily = document.getElementById('btn-menu-daily');
  const btnMenuSpin = document.getElementById('btn-menu-spin');
  const btnMenuSkins = document.getElementById('btn-menu-skins');
  const btnMenuLeaderboard = document.getElementById('btn-menu-leaderboard');
  const btnMenuHowto = document.getElementById('btn-menu-howto');
  const btnMenuDonate = document.getElementById('btn-menu-donate');
  const btnCloseDonate = document.getElementById('btn-close-donate');
  const btnHomeSettings = document.getElementById('btn-home-settings');
  const btnGameSettings = document.getElementById('btn-game-settings');

  if (btnMenuDaily) {
    btnMenuDaily.addEventListener('click', () => window.uiManager.openModal('modal-daily'));
  }
  if (btnMenuSpin) {
    btnMenuSpin.addEventListener('click', () => window.uiManager.openModal('modal-spin'));
  }
  if (btnMenuSkins) {
    btnMenuSkins.addEventListener('click', () => window.uiManager.openModal('modal-skins'));
  }
  if (btnMenuLeaderboard) {
    btnMenuLeaderboard.addEventListener('click', () => window.uiManager.openModal('modal-leaderboard'));
  }
  if (btnMenuHowto) {
    btnMenuHowto.addEventListener('click', () => window.uiManager.openModal('modal-howto'));
  }
  if (btnMenuDonate) {
    btnMenuDonate.addEventListener('click', () => window.uiManager.openModal('modal-donate'));
  }
  if (btnCloseDonate) {
    btnCloseDonate.addEventListener('click', () => window.uiManager.closeModal('modal-donate'));
  }
  if (btnHomeSettings) {
    btnHomeSettings.addEventListener('click', () => window.uiManager.openModal('modal-settings'));
  }
  if (btnGameSettings) {
    btnGameSettings.addEventListener('click', () => window.uiManager.openModal('modal-settings'));
  }

  // In-Game Restart Button
  const btnRestart = document.getElementById('btn-action-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      window.audioManager.playClick();
      if (confirm('Mulai ulang permainan sekarang? Skor saat ini akan dihitung ke riwayat.')) {
        window.stateManager.recordMatch(
          window.blockBlastGame.score,
          window.blockBlastGame.maxComboInSession,
          window.blockBlastGame.linesClearedInSession
        );
        window.blockBlastGame.resetGame();
        window.uiManager.showToast('Permainan baru dimulai! 🚀');
      }
    });
  }
}

function setupBoosterButtons() {
  document.querySelectorAll('.btn-booster').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      window.audioManager.playClick();
      window.blockBlastGame.activateBooster(type);
    });
  });
}

function setupProfileModal() {
  const homeProfileBadge = document.getElementById('home-profile-badge');
  const nameInput = document.getElementById('input-profile-name');
  const avatarChoices = document.querySelectorAll('.avatar-choice');
  const saveBtn = document.getElementById('btn-save-profile');

  if (homeProfileBadge) {
    homeProfileBadge.addEventListener('click', () => {
      if (nameInput) nameInput.value = window.stateManager.data.profile.name;
      window.uiManager.openModal('modal-profile');
    });
  }

  let selectedAvatar = window.stateManager.data.profile.avatar;

  avatarChoices.forEach(choice => {
    choice.addEventListener('click', () => {
      avatarChoices.forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');
      selectedAvatar = choice.textContent.trim();
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const newName = nameInput ? nameInput.value.trim() : '';
      if (newName) {
        window.stateManager.data.profile.name = newName;
      }
      if (selectedAvatar) {
        window.stateManager.data.profile.avatar = selectedAvatar;
      }
      window.stateManager.save();
      window.uiManager.updateHeaderProfile();
      window.uiManager.closeModal('modal-profile');
      window.uiManager.showToast('Profil pemain berhasil diperbarui! ✨');
    });
  }
}
