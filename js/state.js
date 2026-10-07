/**
 * Game State & LocalStorage Persistence Manager
 */

const STORAGE_KEY = 'BLOCKY_GAME_DATA_V3';

const DEFAULT_STATE = {
  profile: {
    name: 'Blocky',
    avatar: '🎮'
  },
  coins: 200, // Standard starting coins
  spinTickets: 1,
  highScore: 0,
  totalGamesPlayed: 0,
  totalLinesCleared: 0,
  unlockedSkins: ['crimson_neo'], // Only default skin unlocked
  activeSkin: 'crimson_neo',
  boosters: {
    bomb: 2,
    refresh: 2,
    hammer: 2
  },
  dailyLogin: {
    lastClaimDate: null,
    streak: 0,
    claimedToday: false
  },
  luckySpin: {
    lastFreeSpinDate: null,
    totalSpins: 0
  },
  dailyQuests: {
    date: null,
    list: []
  },
  history: [], // Clean, empty match history
  settings: {
    sfx: true,
    bgm: false,
    sfxVol: 0.8,
    bgmVol: 0.4,
    haptic: true
  }
};

const DEFAULT_DAILY_QUEST_TEMPLATES = [
  { id: 'lines_10', title: 'Ledakkan 10 Baris/Kolom', target: 10, current: 0, rewardCoins: 100, icon: '💥', claimed: false },
  { id: 'combo_3', title: 'Capai Kombo x3 Beruntun', target: 3, current: 0, rewardCoins: 150, icon: '🔥', claimed: false },
  { id: 'place_40', title: 'Pasang 40 Blok Balok', target: 40, current: 0, rewardCoins: 120, icon: '🧱', claimed: false },
  { id: 'score_800', title: 'Capai 1,000 Skor dalam 1 Game', target: 1000, current: 0, rewardCoins: 200, icon: '🏆', claimed: false }
];

class StateManager {
  constructor() {
    this.serverLeaderboard = [];
    this.data = this.loadState();
    this.checkDayRollOver();
    this.fetchLeaderboard();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = (!parsed.profile || !parsed.profile.name || parsed.profile.name === 'Reihan Pro') 
          ? 'Blocky' 
          : parsed.profile.name;

        // Ensure default skin is present
        const unlockedSkins = Array.isArray(parsed.unlockedSkins) && parsed.unlockedSkins.length > 0 
          ? Array.from(new Set(['crimson_neo', ...parsed.unlockedSkins]))
          : ['crimson_neo'];

        return {
          ...DEFAULT_STATE,
          ...parsed,
          coins: Number(parsed.coins) >= 0 ? Number(parsed.coins) : DEFAULT_STATE.coins,
          unlockedSkins: unlockedSkins,
          profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}), name },
          boosters: { ...DEFAULT_STATE.boosters, ...(parsed.boosters || {}) },
          dailyLogin: { ...DEFAULT_STATE.dailyLogin, ...(parsed.dailyLogin || {}) },
          luckySpin: { ...DEFAULT_STATE.luckySpin, ...(parsed.luckySpin || {}) },
          dailyQuests: { ...DEFAULT_STATE.dailyQuests, ...(parsed.dailyQuests || {}) },
          history: Array.isArray(parsed.history) ? parsed.history : [],
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }
        };
      } else {
        // Clean up previous demo versions
        localStorage.removeItem('BLOCKY_GAME_DATA_V2');
        localStorage.removeItem('BLOCKY_GAME_DATA_V1');
        localStorage.removeItem('BLOCKY_LOCAL_LEADERBOARD');
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  checkDayRollOver() {
    const today = this.getTodayString();

    // Check Daily Quests reset
    if (this.data.dailyQuests.date !== today) {
      this.data.dailyQuests = {
        date: today,
        list: JSON.parse(JSON.stringify(DEFAULT_DAILY_QUEST_TEMPLATES))
      };
    }

    // Check Daily Login streak
    if (this.data.dailyLogin.lastClaimDate !== today) {
      this.data.dailyLogin.claimedToday = false;
    }

    this.save();
  }

  addCoins(amount) {
    const qty = Math.max(0, Number(amount) || 0);
    this.data.coins = (Number(this.data.coins) || 0) + qty;
    this.save();
    if (window.uiManager && typeof window.uiManager.updateStatsBar === 'function') {
      window.uiManager.updateStatsBar();
    }
    return this.data.coins;
  }

  spendCoins(amount) {
    const cost = Number(amount);
    if (isNaN(cost) || cost <= 0) return false;
    const current = Number(this.data.coins) || 0;
    if (current >= cost) {
      this.data.coins = current - cost;
      this.save();
      if (window.uiManager && typeof window.uiManager.updateStatsBar === 'function') {
        window.uiManager.updateStatsBar();
      }
      return true;
    }
    return false;
  }

  unlockSkin(skinId) {
    if (!this.data.unlockedSkins.includes(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
    }
  }

  hasSkin(skinId) {
    return this.data.unlockedSkins.includes(skinId);
  }

  setActiveSkin(skinId) {
    this.data.activeSkin = skinId;
    this.save();
  }

  updateHighScore(score) {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  recordMatch(score, maxCombo, linesCleared) {
    this.data.totalGamesPlayed++;
    this.data.totalLinesCleared += linesCleared;
    const isNewHigh = this.updateHighScore(score);

    this.data.history.unshift({
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + this.getTodayString(),
      score: score,
      maxCombo: maxCombo,
      linesCleared: linesCleared
    });
    if (this.data.history.length > 20) {
      this.data.history.pop();
    }

    if (score > 0) {
      this.submitScoreToLeaderboard(score);
    }

    this.save();
    return isNewHigh;
  }

  // Daily quest progress tracking
  updateQuestProgress(actionType, value = 1) {
    let updated = false;
    if (!this.data.dailyQuests || !this.data.dailyQuests.list) return;

    this.data.dailyQuests.list.forEach(q => {
      if (q.claimed) return;
      if (actionType === 'line' && q.id === 'lines_10') {
        q.current = Math.min(q.target, q.current + value);
        updated = true;
      } else if (actionType === 'combo' && q.id === 'combo_3') {
        if (value >= 3) {
          q.current = Math.min(q.target, Math.max(q.current, value));
          updated = true;
        }
      } else if (actionType === 'place' && q.id === 'place_40') {
        q.current = Math.min(q.target, q.current + value);
        updated = true;
      } else if (actionType === 'score' && q.id === 'score_800') {
        q.current = Math.min(q.target, Math.max(q.current, value));
        updated = true;
      }
    });

    if (updated) {
      this.save();
    }
  }

  claimQuest(questId) {
    const q = this.data.dailyQuests.list.find(x => x.id === questId);
    if (q && !q.claimed && q.current >= q.target) {
      q.claimed = true;
      this.addCoins(q.rewardCoins);
      this.save();
      return q.rewardCoins;
    }
    return 0;
  }

  claimDailyReward(dayNumber, rewardAmount) {
    this.data.dailyLogin.claimedToday = true;
    this.data.dailyLogin.lastClaimDate = this.getTodayString();
    this.data.dailyLogin.streak = dayNumber;
    this.addCoins(rewardAmount);
    this.save();
  }

  hasFreeSpinToday() {
    return this.data.luckySpin.lastFreeSpinDate !== this.getTodayString();
  }

  recordSpin() {
    this.data.luckySpin.lastFreeSpinDate = this.getTodayString();
    this.data.luckySpin.totalSpins = (this.data.luckySpin.totalSpins || 0) + 1;
    this.save();
  }

  useBooster(type) {
    if (this.data.boosters[type] && this.data.boosters[type] > 0) {
      this.data.boosters[type]--;
      this.save();
      return true;
    }
    return false;
  }

  addBooster(type, amount = 1) {
    this.data.boosters[type] = (this.data.boosters[type] || 0) + amount;
    this.save();
  }

  // --- Real-Time Leaderboard Integration ---
  async fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          this.serverLeaderboard = list;
          return list;
        }
      }
    } catch (e) {
      // offline / file protocol fallback
    }

    try {
      const local = JSON.parse(localStorage.getItem('BLOCKY_LOCAL_LEADERBOARD') || '[]');
      this.serverLeaderboard = Array.isArray(local) ? local : [];
    } catch (e) {
      this.serverLeaderboard = [];
    }
    return this.serverLeaderboard;
  }

  async submitScoreToLeaderboard(score) {
    if (!score || score <= 0) return;

    const payload = {
      name: this.data.profile.name || 'Blocky',
      avatar: this.data.profile.avatar || '🎮',
      score: score,
      date: 'Hari ini'
    };

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        if (Array.isArray(updated)) {
          this.serverLeaderboard = updated;
          return;
        }
      }
    } catch (e) {}

    // Local fallback if offline
    try {
      let local = JSON.parse(localStorage.getItem('BLOCKY_LOCAL_LEADERBOARD') || '[]');
      const existIdx = local.findIndex(x => x.name.toLowerCase() === payload.name.toLowerCase());
      if (existIdx !== -1) {
        if (score > local[existIdx].score) {
          local[existIdx].score = score;
          local[existIdx].avatar = payload.avatar;
          local[existIdx].date = payload.date;
        }
      } else {
        local.push(payload);
      }
      local.sort((a, b) => b.score - a.score);
      local = local.slice(0, 50);
      local.forEach((item, idx) => { item.rank = idx + 1; });
      localStorage.setItem('BLOCKY_LOCAL_LEADERBOARD', JSON.stringify(local));
      this.serverLeaderboard = local;
    } catch (e) {}
  }

  getLeaderboardList() {
    let list = [...(this.serverLeaderboard || [])];

    if (this.data.highScore > 0) {
      const playerIndex = list.findIndex(e => 
        (e.name && e.name.toLowerCase() === this.data.profile.name.toLowerCase()) || e.isPlayer
      );

      if (playerIndex !== -1) {
        if (this.data.highScore > list[playerIndex].score) {
          list[playerIndex].score = this.data.highScore;
        }
        list[playerIndex].isPlayer = true;
        list[playerIndex].avatar = this.data.profile.avatar;
      } else {
        list.push({
          rank: 0,
          name: this.data.profile.name + ' (Kamu)',
          avatar: this.data.profile.avatar,
          score: this.data.highScore,
          date: 'Terbaikmu',
          isPlayer: true
        });
      }
      list.sort((a, b) => b.score - a.score);
      list.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });
    }

    return list;
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('BLOCKY_LOCAL_LEADERBOARD');
    this.serverLeaderboard = [];
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.checkDayRollOver();
  }
}

window.stateManager = new StateManager();
