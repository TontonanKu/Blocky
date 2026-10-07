/**
 * Skin and Theme Catalog
 * Eye-friendly, high contrast, aesthetically balanced palettes
 */
const SKIN_CATALOG = [
  {
    id: 'crimson_neo',
    name: 'Warm Ivory & Crimson',
    desc: 'Palet hangat klasik kertas gading dengan aksen marun anggur. Nyaman di mata untuk sesi santai.',
    price: 0,
    isDefault: true,
    tag: 'Klasik',
    isDark: false,
    board: {
      bg: '#F6F2E9',
      boardBg: '#EFE7D6',
      cellBg: '#E2DAC8',
      cellBorder: '#D1C6B0',
      cardBg: '#FCFAF6',
      cardBorder: '#8E202B',
      cardText: '#1E1B18',
      cardDesc: '#5A524A',
      accent: '#8E202B',
      accentText: '#FFFFFF',
      accentSecondary: '#D97706',
      boardBorder: '3px solid #8E202B',
      boardShadow: '5px 5px 0px #8E202B'
    },
    blockColors: [
      { fill: '#8E202B', border: '#6E141E', highlight: '#B8323F' }, // Crimson
      { fill: '#D97706', border: '#A65800', highlight: '#F59E0B' }, // Warm Amber
      { fill: '#C84C32', border: '#9E341E', highlight: '#E56D54' }, // Terracotta
      { fill: '#3E6649', border: '#2B4A34', highlight: '#5A8766' }, // Sage Green
      { fill: '#6E3244', border: '#502030', highlight: '#92465C' }, // Wine Plum
      { fill: '#B8822B', border: '#8A5E1C', highlight: '#D4A144' }, // Warm Ochre
      { fill: '#32506B', border: '#22384C', highlight: '#4D7296' }  // Slate Blue
    ]
  },
  {
    id: 'midnight_slate',
    name: 'Midnight Slate (Mode Malam)',
    desc: 'Mode gelap teduh yang sangat ramah mata tanpa cahaya menyilaukan. Pas dimainkan di ruangan redup.',
    price: 300,
    isDefault: false,
    tag: 'Mode Malam',
    isDark: true,
    board: {
      bg: '#141721',
      boardBg: '#1D2230',
      cellBg: '#262D40',
      cellBorder: '#353E57',
      cardBg: '#1D2230',
      cardBorder: '#353E57',
      cardText: '#F1F5F9',
      cardDesc: '#94A3B8',
      accent: '#38BDF8',
      accentText: '#0F172A',
      accentSecondary: '#34D399',
      boardBorder: '3px solid #38BDF8',
      boardShadow: '5px 5px 0px rgba(56, 189, 248, 0.35)'
    },
    blockColors: [
      { fill: '#0284C7', border: '#0369A1', highlight: '#38BDF8' }, // Sky Blue
      { fill: '#059669', border: '#047857', highlight: '#34D399' }, // Emerald
      { fill: '#D97706', border: '#B45309', highlight: '#FBBF24' }, // Soft Amber
      { fill: '#E11D48', border: '#BE123C', highlight: '#FB7185' }, // Rose
      { fill: '#7C3AED', border: '#6D28D9', highlight: '#A78BFA' }, // Violet
      { fill: '#0891B2', border: '#0E7490', highlight: '#22D3EE' }, // Cyan
      { fill: '#EA580C', border: '#C2410C', highlight: '#FB923C' }  // Orange
    ]
  },
  {
    id: 'zen_bamboo',
    name: 'Zen Bamboo & Teak Wood',
    desc: 'Nuansa alam yang menenangkan dengan paduan bambu hijau hutan dan kayu jati hangat.',
    price: 500,
    isDefault: false,
    tag: 'Alami',
    isDark: false,
    board: {
      bg: '#EEEBE2',
      boardBg: '#E2DDCF',
      cellBg: '#D5CDBB',
      cellBorder: '#C2B7A2',
      cardBg: '#FAF7F0',
      cardBorder: '#2D5A27',
      cardText: '#1E221B',
      cardDesc: '#575D50',
      accent: '#2D5A27',
      accentText: '#FFFFFF',
      accentSecondary: '#8A5A36',
      boardBorder: '3px solid #2D5A27',
      boardShadow: '5px 5px 0px #8A5A36'
    },
    blockColors: [
      { fill: '#3E7536', border: '#2B5424', highlight: '#5B9A52' }, // Bamboo Green
      { fill: '#8C5A3B', border: '#633D25', highlight: '#AB7450' }, // Teak Wood
      { fill: '#9C8640', border: '#72612B', highlight: '#BDB359' }, // Dried Straw
      { fill: '#546B4B', border: '#394B33', highlight: '#739169' }, // Forest Moss
      { fill: '#A85740', border: '#793B2A', highlight: '#C7755C' }, // Terracotta
      { fill: '#48635F', border: '#314643', highlight: '#678B86' }, // River Slate
      { fill: '#6B5448', border: '#4C3B32', highlight: '#8D7264' }  // Cedar Bark
    ]
  },
  {
    id: 'pastel_macaron',
    name: 'Pastel Macaron Soft',
    desc: 'Warna manis pastel yang sangat lembut dan sejuk di pandangan. Menyenangkan dimainkan.',
    price: 750,
    isDefault: false,
    tag: 'Teduh',
    isDark: false,
    board: {
      bg: '#F8F5F2',
      boardBg: '#EFE9E6',
      cellBg: '#E3DAD6',
      cellBorder: '#D0C4BF',
      cardBg: '#FFFFFF',
      cardBorder: '#C05672',
      cardText: '#2B2D42',
      cardDesc: '#6C757D',
      accent: '#C05672',
      accentText: '#FFFFFF',
      accentSecondary: '#7C6BA6',
      boardBorder: '3px solid #C05672',
      boardShadow: '5px 5px 0px #C05672'
    },
    blockColors: [
      { fill: '#C05672', border: '#9E3C55', highlight: '#DE7B94' }, // Dusty Rose
      { fill: '#4A7BB0', border: '#325883', highlight: '#74A2D4' }, // Soft Denim
      { fill: '#489A7B', border: '#306F57', highlight: '#6EC0A1' }, // Mint
      { fill: '#D48842', border: '#A66327', highlight: '#F1AC6B' }, // Peach
      { fill: '#7C6BA6', border: '#5B4B82', highlight: '#A292CA' }, // Lavender
      { fill: '#C75D53', border: '#993F36', highlight: '#E5857B' }, // Coral
      { fill: '#3E8E9E', border: '#286875', highlight: '#67B3C2' }  // Ocean Teal
    ]
  },
  {
    id: 'nordic_frost',
    name: 'Nordic Frost Blue',
    desc: 'Gaya Skandinavia minimalis berlatar abu sejuk dengan aksen biru dan toska dingin.',
    price: 450,
    isDefault: false,
    tag: 'Minimalis',
    isDark: false,
    board: {
      bg: '#EDF2F7',
      boardBg: '#E2E8F0',
      cellBg: '#CBD5E1',
      cellBorder: '#94A3B8',
      cardBg: '#FFFFFF',
      cardBorder: '#2563EB',
      cardText: '#1E293B',
      cardDesc: '#64748B',
      accent: '#2563EB',
      accentText: '#FFFFFF',
      accentSecondary: '#0D9488',
      boardBorder: '3px solid #2563EB',
      boardShadow: '5px 5px 0px #2563EB'
    },
    blockColors: [
      { fill: '#2563EB', border: '#1D4ED8', highlight: '#60A5FA' }, // Nordic Blue
      { fill: '#0D9488', border: '#0F766E', highlight: '#2DD4BF' }, // Seafoam
      { fill: '#475569', border: '#334155', highlight: '#94A3B8' }, // Slate
      { fill: '#D97706', border: '#B45309', highlight: '#FBBF24' }, // Amber
      { fill: '#DC2626', border: '#B91C1C', highlight: '#F87171' }, // Nordic Red
      { fill: '#7C3AED', border: '#6D28D9', highlight: '#A78BFA' }, // Royal Violet
      { fill: '#0284C7', border: '#0369A1', highlight: '#38BDF8' }  // Ice Cyan
    ]
  },
  {
    id: 'obsidian_gold',
    name: 'Obsidian & Warm Gold',
    desc: 'Kesan mewah eksklusif marmer grafit gelap dengan sentuhan emas madu hangat tanpa silau.',
    price: 1000,
    isDefault: false,
    tag: 'Premium VIP',
    isDark: true,
    board: {
      bg: '#18181F',
      boardBg: '#22222B',
      cellBg: '#2C2C37',
      cellBorder: '#3C3C4B',
      cardBg: '#22222B',
      cardBorder: '#48485B',
      cardText: '#F8FAFC',
      cardDesc: '#94A3B8',
      accent: '#EAB308',
      accentText: '#18181F',
      accentSecondary: '#F59E0B',
      boardBorder: '3px solid #EAB308',
      boardShadow: '5px 5px 0px rgba(234, 179, 8, 0.35)'
    },
    blockColors: [
      { fill: '#CA8A04', border: '#A16207', highlight: '#FACC15' }, // Warm Gold
      { fill: '#64748B', border: '#475569', highlight: '#94A3B8' }, // Platinum
      { fill: '#BE123C', border: '#9F1239', highlight: '#FB7185' }, // Ruby
      { fill: '#047857', border: '#065F46', highlight: '#34D399' }, // Emerald
      { fill: '#1D4ED8', border: '#1E40AF', highlight: '#60A5FA' }, // Sapphire
      { fill: '#6D28D9', border: '#5B21B6', highlight: '#A78BFA' }, // Amethyst
      { fill: '#B45309', border: '#92400E', highlight: '#F59E0B' }  // Bronze
    ]
  }
];

class SkinManager {
  constructor() {
    this.currentSkinId = 'crimson_neo';
  }

  getCurrentSkin() {
    return SKIN_CATALOG.find(s => s.id === this.currentSkinId) || SKIN_CATALOG[0];
  }

  setSkin(id) {
    const skin = SKIN_CATALOG.find(s => s.id === id);
    if (skin) {
      this.currentSkinId = id;
      this.applySkinToDOM(skin);
      return true;
    }
    return false;
  }

  applySkinToDOM(skin) {
    const root = document.documentElement;
    const b = skin.board;

    root.style.setProperty('--theme-bg', b.bg);
    root.style.setProperty('--theme-board-bg', b.boardBg);
    root.style.setProperty('--theme-cell-bg', b.cellBg);
    root.style.setProperty('--theme-cell-border', b.cellBorder);
    root.style.setProperty('--theme-card-bg', b.cardBg);
    root.style.setProperty('--theme-card-border', b.cardBorder);
    root.style.setProperty('--theme-card-text', b.cardText);
    root.style.setProperty('--theme-card-desc', b.cardDesc);
    root.style.setProperty('--theme-accent', b.accent);
    root.style.setProperty('--theme-accent-text', b.accentText);
    root.style.setProperty('--theme-accent-sec', b.accentSecondary);
    root.style.setProperty('--theme-board-border', b.boardBorder);
    root.style.setProperty('--theme-board-shadow', b.boardShadow);

    document.body.dataset.theme = skin.id;
    document.body.dataset.isDark = skin.isDark ? 'true' : 'false';
  }
}

window.skinManager = new SkinManager();
window.SKIN_CATALOG = SKIN_CATALOG;
