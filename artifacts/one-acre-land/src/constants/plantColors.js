/**
 * Single Source of Truth for Plant & Crop Visualization Colors
 * Provides distinct, high-contrast, visually pleasing colors for all plants and crops.
 */

// Professionally curated 24-color distinct palette for agricultural visualization
export const DISTINCT_PLANT_PALETTE = [
  '#e67e22', // 0: Warm Mango Orange
  '#8e44ad', // 1: Guava Purple
  '#0284c7', // 2: Sky / Coconut Blue
  '#059669', // 3: Arecanut Deep Emerald
  '#eab308', // 4: Banana Golden Yellow
  '#2563eb', // 5: Mosambi Royal Blue
  '#84cc16', // 6: Moringa Bright Lime
  '#ec4899', // 7: Jasmine Floral Pink
  '#78716c', // 8: Teak / Timber Slate Brown
  '#e11d48', // 9: Crimson Ruby (Sandalwood / Pomegranate)
  '#0d9488', // 10: Deep Teal
  '#f97316', // 11: Vibrant Coral Orange (Papaya)
  '#854d0e', // 12: Rich Amber Coffee
  '#d946ef', // 13: Dragon Fruit Fuchsia
  '#65a30d', // 14: Amla Olive Green
  '#6366f1', // 15: Indigo Blue
  '#14b8a6', // 16: Mint Turquoise
  '#d97706', // 17: Golden Honey Ochre
  '#a855f7', // 18: Lavender Violet
  '#06b6d4', // 19: Cyan Blue
  '#f43f5e', // 20: Rose
  '#16a34a', // 21: Fresh Green (Bamboo)
  '#7c3aed', // 22: Deep Fig Violet
  '#ca8a04', // 23: Mustard Ochre
];

// Explicit mappings for all standard catalog plants and common agricultural varieties
export const KNOWN_PLANT_COLORS = {
  // Mango
  'mango': '#e67e22',
  'kesarmango': '#e67e22',
  'mango-kesar': '#e67e22',
  'alphonso': '#e67e22',

  // Guava
  'guava': '#8e44ad',
  'allahabadguava': '#8e44ad',
  'guava-allahabad': '#8e44ad',
  'taiwanpink': '#9333ea',

  // Teak & Timber
  'teak': '#78716c',
  'teaksapling': '#78716c',
  'teak-sapling': '#78716c',
  'timber': '#78716c',
  'wood': '#78716c',
  'malab नीम': '#64748b',

  // Coconut
  'coconut': '#0284c7',
  'tallcoconut': '#0284c7',
  'coconut-tall': '#0284c7',
  'dwarfcoconut': '#0ea5e9',

  // Arecanut
  'arecanut': '#059669',
  'arecanutpremium': '#059669',
  'arecanut-premium': '#059669',
  'betelnut': '#059669',

  // Mosambi & Citrus
  'mosambi': '#2563eb',
  'sweetmosambi': '#2563eb',
  'mosambi-sweet': '#2563eb',
  'citrus': '#2563eb',
  'lemon': '#0284c7',

  // Banana
  'banana': '#eab308',
  'grandnainebanana': '#eab308',
  'banana-grand-naine': '#eab308',
  'g9banana': '#eab308',

  // Moringa
  'moringa': '#84cc16',
  'pkm1moringa': '#84cc16',
  'moringa-drumstick': '#84cc16',
  'drumstick': '#84cc16',

  // Jasmine & Flowers
  'jasmine': '#ec4899',
  'maduraijasmine': '#ec4899',
  'jasmine-madurai': '#ec4899',
  'starjasmine': '#f43f5e',
  'flower': '#ec4899',

  // Other popular commercial crops
  'sandalwood': '#e11d48',
  'redsandalwood': '#e11d48',
  'pomegranate': '#f43f5e',
  'papaya': '#f97316',
  'coffee': '#854d0e',
  'dragonfruit': '#d946ef',
  'amla': '#65a30d',
  'custardapple': '#0d9488',
  'sitaphal': '#0d9488',
  'bamboo': '#16a34a',
  'rubber': '#475569',
  'fig': '#7c3aed',
  'anjeer': '#7c3aed',
  'border': '#d35400',
};

/**
 * Clean string for dictionary key matching
 */
function cleanKey(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Deterministic hash to consistently select a color from DISTINCT_PLANT_PALETTE
 */
function hashStringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % DISTINCT_PLANT_PALETTE.length;
  return DISTINCT_PLANT_PALETTE[index];
}

/**
 * Single authoritative color resolver for any plant or plant type string.
 * Ensures the exact same color is used everywhere.
 */
export function getPlantColor(plantOrType, libraryPlants = null) {
  if (!plantOrType) return DISTINCT_PLANT_PALETTE[0];

  // 1. If passed an object with direct color property
  if (typeof plantOrType === 'object') {
    if (plantOrType.color && typeof plantOrType.color === 'string' && plantOrType.color.startsWith('#')) {
      return plantOrType.color;
    }
    const nameStr = plantOrType.shortName || plantOrType.name || plantOrType.type || plantOrType.id || '';
    return getPlantColor(nameStr, libraryPlants);
  }

  const raw = String(plantOrType).trim();
  const cleaned = cleanKey(raw);

  // 2. Direct match in KNOWN_PLANT_COLORS
  if (KNOWN_PLANT_COLORS[cleaned]) {
    return KNOWN_PLANT_COLORS[cleaned];
  }

  // Partial match in KNOWN_PLANT_COLORS
  for (const [key, color] of Object.entries(KNOWN_PLANT_COLORS)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return color;
    }
  }

  // 3. Search in libraryPlants if provided
  if (Array.isArray(libraryPlants)) {
    const match = libraryPlants.find(
      p => cleanKey(p.id) === cleaned || cleanKey(p.name) === cleaned || cleanKey(p.shortName) === cleaned
    );
    if (match?.color && typeof match.color === 'string' && match.color.startsWith('#')) {
      return match.color;
    }
  }

  // 4. Deterministic fallback from DISTINCT_PLANT_PALETTE based on name hash
  return hashStringToColor(cleaned || raw);
}

/**
 * Backward compatibility export for components using CROP_COLORS
 */
export const CROP_COLORS = new Proxy(
  {
    ...KNOWN_PLANT_COLORS,
    'default': '#059669',
  },
  {
    get(target, prop) {
      if (typeof prop !== 'string') return target[prop];
      if (prop in target) return target[prop];
      return getPlantColor(prop);
    },
  }
);
