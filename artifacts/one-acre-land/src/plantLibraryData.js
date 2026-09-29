export const STORAGE_SELECTED_PLANTS_KEY = 'etr_selected_plant_ids';

export const DEFAULT_SELECTED_PLANT_IDS = [
  'mango-kesar',
  'guava-allahabad',
  'teak-sapling',
];

export const PLANT_SIZES = [
  { code: 'S', label: 'Small', name: 'Small plant', height: '1–2 ft sapling' },
  { code: 'M', label: 'Medium', name: 'Medium plant', height: '3–4 ft established' },
  { code: 'L', label: 'Large', name: 'Large plant', height: '5–6 ft mature stock' },
];

export function getPlantSizePrices(plant) {
  const base = Number(plant?.price) || 100;
  return {
    S: Number(plant?.sizePrices?.S) || Math.round(base * 0.68),
    M: Number(plant?.sizePrices?.M) || base,
    L: Number(plant?.sizePrices?.L) || Math.round(base * 1.48),
  };
}

export const DEFAULT_PLANT_LIBRARY = [
  {
    id: 'mango-kesar',
    name: 'Kesar Mango',
    shortName: 'Mango',
    type: 'Mango',
    category: 'Fruit plants',
    price: 185,
    sizePrices: { S: 125, M: 185, L: 275 },
    spacing: '24 × 24 ft',
    p2p: 24,
    r2r: 24,
    plantsPerAcre: 72,
    fertilizer: '12 kg / year',
    maintenance: 'Moderate',
    growth: '3–4 years',
    description: 'Sun-loving orchard trees with a generous canopy and dependable market demand.',
    color: '#e67e22',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'guava-allahabad',
    name: 'Allahabad Guava',
    shortName: 'Guava',
    type: 'Guava',
    category: 'Fruit plants',
    price: 125,
    sizePrices: { S: 85, M: 125, L: 195 },
    spacing: '15 × 15 ft',
    p2p: 15,
    r2r: 15,
    plantsPerAcre: 190,
    fertilizer: '8 kg / year',
    maintenance: 'Moderate',
    growth: '2–3 years',
    description: 'An early-bearing orchard choice with fragrant fruit and compact growth.',
    color: '#8e44ad',
    image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'teak-sapling',
    name: 'Teak Sapling',
    shortName: 'Teak',
    type: 'Teak',
    category: 'Timber / Wood',
    price: 95,
    sizePrices: { S: 65, M: 95, L: 150 },
    spacing: '12 × 12 ft',
    p2p: 12,
    r2r: 12,
    plantsPerAcre: 300,
    fertilizer: '4 kg / year',
    maintenance: 'Low',
    growth: '12–15 years',
    description: 'A patient long-term asset with strong timber value and quiet presence.',
    color: '#7f8c8d',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coconut-tall',
    name: 'Tall Coconut',
    shortName: 'Coconut',
    type: 'Coconut',
    category: 'Avenue',
    price: 240,
    sizePrices: { S: 160, M: 240, L: 360 },
    spacing: '25 × 25 ft',
    p2p: 25,
    r2r: 25,
    plantsPerAcre: 70,
    fertilizer: '18 kg / year',
    maintenance: 'Low',
    growth: '5–6 years',
    description: 'A resilient boundary and plantation staple for warm, open acreage.',
    color: '#16a085',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'arecanut-premium',
    name: 'Arecanut Premium',
    shortName: 'Arecanut',
    type: 'Arecanut',
    category: 'Avenue',
    price: 155,
    sizePrices: { S: 105, M: 155, L: 235 },
    spacing: '9 × 9 ft',
    p2p: 9,
    r2r: 9,
    plantsPerAcre: 520,
    fertilizer: '9 kg / year',
    maintenance: 'High',
    growth: '5–7 years',
    description: 'Tall, elegant palms that reward careful irrigation and a considered grid.',
    color: '#27ae60',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mosambi-sweet',
    name: 'Sweet Mosambi',
    shortName: 'Mosambi',
    type: 'Mosambi',
    category: 'Fruit plants',
    price: 145,
    sizePrices: { S: 95, M: 145, L: 220 },
    spacing: '18 × 18 ft',
    p2p: 18,
    r2r: 18,
    plantsPerAcre: 130,
    fertilizer: '10 kg / year',
    maintenance: 'Moderate',
    growth: '3–4 years',
    description: 'Bright citrus with a measured canopy, ideal for mixed orchard plans.',
    color: '#2980b9',
    image: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banana-grand-naine',
    name: 'Grand Naine Banana',
    shortName: 'Banana',
    type: 'Banana',
    category: 'Fruit plants',
    price: 42,
    sizePrices: { S: 28, M: 42, L: 65 },
    spacing: '6 × 6 ft',
    p2p: 6,
    r2r: 6,
    plantsPerAcre: 1100,
    fertilizer: '5 kg / year',
    maintenance: 'High',
    growth: '10–12 months',
    description: 'Fast-turning, productive plants for a first harvest while the orchard matures.',
    color: '#f1c40f',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'drumstick-moringa',
    name: 'Moringa',
    shortName: 'Moringa',
    type: 'Moringa',
    category: 'Landscaping',
    price: 38,
    sizePrices: { S: 25, M: 38, L: 58 },
    spacing: '10 × 10 ft',
    p2p: 10,
    r2r: 10,
    plantsPerAcre: 435,
    fertilizer: '4 kg / year',
    maintenance: 'Low',
    growth: '8–10 months',
    description: 'A versatile, fast-growing utility crop for the working edge of a plan.',
    color: '#78b582',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'jasmine-star',
    name: 'Star Jasmine',
    shortName: 'Jasmine',
    type: 'Jasmine',
    category: 'Flower',
    price: 65,
    sizePrices: { S: 45, M: 65, L: 98 },
    spacing: '5 × 5 ft',
    p2p: 5,
    r2r: 5,
    plantsPerAcre: 1742,
    fertilizer: '3 kg / year',
    maintenance: 'Moderate',
    growth: '12–18 months',
    description: 'A fragrant flowering layer for pathways, entries, and living garden edges.',
    color: '#d7c7a1',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
  },
];

export function loadSelectedPlantIds() {
  try {
    const raw = localStorage.getItem(STORAGE_SELECTED_PLANTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_SELECTED_PLANT_IDS];
}

export function saveSelectedPlantIds(ids) {
  try {
    localStorage.setItem(STORAGE_SELECTED_PLANTS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function findPlantByQuery(query, list = DEFAULT_PLANT_LIBRARY) {
  if (!query) return null;
  const q = String(query).toLowerCase().trim();
  return list.find(
    (p) =>
      p.id?.toLowerCase() === q ||
      p.shortName?.toLowerCase() === q ||
      p.type?.toLowerCase() === q ||
      p.name?.toLowerCase() === q,
  ) || null;
}
