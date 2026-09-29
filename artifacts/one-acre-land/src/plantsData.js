// Single Source of Truth for Plant Library and Plan My Acre

export const PLANT_SIZES = [
  { 
    code: 'S', 
    label: 'Small', 
    name: 'Small Plant', 
    badge: '1–2 ft sapling',
    height: '1–2 ft sapling',
    stage: 'Young nursery polybag sapling with active taproot',
    details: 'Compact 1–2 ft root-trained sapling in nursery polybag. High vigor and optimal for large-scale economic field plantation.'
  },
  { 
    code: 'M', 
    label: 'Medium', 
    name: 'Medium Plant', 
    badge: '3–4 ft established',
    height: '3–4 ft established',
    stage: 'Hardened container specimen with sturdy trunk and early lateral branching',
    details: 'Vigorous 3–4 ft container tree with sturdy stem. Balanced root system with rapid field adaptation and strong wind tolerance.'
  },
  { 
    code: 'L', 
    label: 'Large', 
    name: 'Large Plant', 
    badge: '5–6 ft mature stock',
    height: '5–6 ft mature stock',
    stage: 'Advanced specimen with developed crown and early fruiting wood',
    details: 'Mature 5–6+ ft rootball specimen with developed crown. Instant field presence, accelerated canopy shade and faster fruiting.'
  },
]

export function getPlantSizePrices(plant) {
  const base = Number(plant?.price) || 100
  return {
    S: Number(plant?.sizePrices?.S) || Math.round(base * 0.68),
    M: Number(plant?.sizePrices?.M) || base,
    L: Number(plant?.sizePrices?.L) || Math.round(base * 1.48),
  }
}

export function getPlantSizeImage(plant, size = 'M') {
  if (plant?.image) return plant.image
  if (plant?.sizeImages?.[size]) return plant.sizeImages[size]
  return ''
}

export function getPlantSizeDetails(plant, size = 'M') {
  const base = PLANT_SIZES.find((s) => s.code === size) || PLANT_SIZES[1]
  if (plant?.sizeDetails?.[size]) {
    return {
      ...base,
      details: plant.sizeDetails[size],
      badge: plant.sizeDetails[size]
    }
  }
  return base
}

export function getPlantSizeAvailability(plant) {
  return {
    S: isPlantSizeAvailable(plant, 'S'),
    M: isPlantSizeAvailable(plant, 'M'),
    L: isPlantSizeAvailable(plant, 'L'),
  }
}

export function isPlantSizeAvailable(plant, size = 'M') {
  if (!plant) return false
  if (plant.sizeAvailability && plant.sizeAvailability[size] !== undefined) {
    const val = plant.sizeAvailability[size]
    return val !== false && val !== 'false' && val !== 'Not Available'
  }
  return true
}

// Current official Indian economic indicators as macroeconomic context
export const INDIAN_MACRO_CONTEXT = {
  headlineCPI: '5.1% YoY',
  ruralCFPI: '5.4% YoY',
  wpiFoodArticles: '6.2% YoY',
  fertilizerSubsidySupport: 'Statutory MRP ₹268/bag for Urea + NBS scheme for P&K nutrients',
  reportingAuthority: 'Ministry of Statistics & Programme Implementation (MoSPI) & Reserve Bank of India (RBI)',
  bulletinPeriod: '2024–2025 Economic Trends Bulletin',
  distinctionNote: 'Important Distinction: Official economic indicators reflect national macroeconomic cost trends across general household consumer baskets. Crop-specific market prices fluctuate independently based on actual harvest supply, APMC mandi arrivals, grading, moisture levels, export demand, and seasonality. General inflation is NOT applied as the crop price.'
}

export const defaultPlants = [
  {
    id: 'mango-kesar',
    name: 'Kesar Mango',
    shortName: 'Mango',
    category: 'Fruit plants',
    price: 185,
    sizePrices: {
      S: 125,
      M: 185,
      L: 275,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '24 × 24 ft',
    p2p: 24,
    r2r: 24,
    plantsPerAcre: 72,
    fertilizer: '12 kg / year',
    maintenance: 'Moderate',
    growth: '3–4 years',
    expectedYieldPerPlant: 60,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 72,
    harvestsPerYear: 1,
    description: 'Sun-loving orchard trees with a generous canopy and dependable market demand.',
    color: '#e67e22',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    modelType: 'Mango',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 48, expectedYield: 60, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Govt. of India, Ministry of Agriculture) — APMC Talala & Ahmedabad Mandi modal price' },
      { year: 2022, referenceMarketPrice: 54, expectedYield: 60, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet & Gujarat State Agricultural Marketing Board annual mandi bulletin' },
      { year: 2023, referenceMarketPrice: 60, expectedYield: 60, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'National Horticulture Board (NHB) Indian Horticulture Database 2023' },
      { year: 2024, referenceMarketPrice: 68, expectedYield: 60, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Directorate of Marketing & Inspection Mandi Arrival Statistics 2024' },
      { year: 2025, referenceMarketPrice: 72, expectedYield: 60, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Ministry of Agriculture & Farmers Welfare, Govt. of India) 2025 modal benchmark' },
    ]
  },
  {
    id: 'guava-allahabad',
    name: 'Allahabad Guava',
    shortName: 'Guava',
    category: 'Fruit plants',
    price: 125,
    sizePrices: {
      S: 85,
      M: 125,
      L: 195,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '15 × 15 ft',
    p2p: 15,
    r2r: 15,
    plantsPerAcre: 190,
    fertilizer: '8 kg / year',
    maintenance: 'Moderate',
    growth: '2–3 years',
    expectedYieldPerPlant: 35,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 38,
    harvestsPerYear: 2,
    description: 'An early-bearing orchard choice with fragrant fruit and compact growth.',
    color: '#8e44ad',
    image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80',
    modelType: 'Guava',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 24, expectedYield: 35, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Ministry of Agriculture) — Prayagraj & Nagpur APMC wholesale price' },
      { year: 2022, referenceMarketPrice: 28, expectedYield: 35, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'National Horticulture Board (NHB) Wholesale Horticultural Price Bulletin 2022' },
      { year: 2023, referenceMarketPrice: 32, expectedYield: 35, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Directorate of Marketing & Inspection Mandi Reports 2023' },
      { year: 2024, referenceMarketPrice: 36, expectedYield: 35, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Mandi Statistics & Uttar Pradesh Mandi Parishad 2024' },
      { year: 2025, referenceMarketPrice: 38, expectedYield: 35, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Ministry of Agriculture, Govt. of India) 2025 benchmark' },
    ]
  },
  {
    id: 'teak-sapling',
    name: 'Teak Sapling',
    shortName: 'Teak',
    category: 'Timber / Wood',
    price: 95,
    sizePrices: {
      S: 65,
      M: 95,
      L: 150,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '12 × 12 ft',
    p2p: 12,
    r2r: 12,
    plantsPerAcre: 300,
    fertilizer: '4 kg / year',
    maintenance: 'Low',
    growth: '12–15 years',
    expectedYieldPerPlant: 20,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 110,
    harvestsPerYear: 1,
    description: 'A patient long-term asset with strong timber value and quiet presence.',
    color: '#7f8c8d',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    modelType: 'Timber',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 85, expectedYield: 20, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'State Forest Development Corporation (SFDC) Commercial Timber E-Auction 2021' },
      { year: 2022, referenceMarketPrice: 92, expectedYield: 20, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Van Vikas Nigam & State Forest Department Timber Benchmark 2022' },
      { year: 2023, referenceMarketPrice: 98, expectedYield: 20, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'IWST (Indian Council of Forestry Research & Education) Timber Indices 2023' },
      { year: 2024, referenceMarketPrice: 105, expectedYield: 20, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'State Forest Corporation Commercial Wood E-Auction Reports 2024' },
      { year: 2025, referenceMarketPrice: 110, expectedYield: 20, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'State Forest Development Corporation Timber Market Benchmark 2025' },
    ]
  },
  {
    id: 'coconut-tall',
    name: 'Tall Coconut',
    shortName: 'Coconut',
    category: 'Avenue',
    price: 240,
    sizePrices: {
      S: 160,
      M: 240,
      L: 360,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '25 × 25 ft',
    p2p: 25,
    r2r: 25,
    plantsPerAcre: 70,
    fertilizer: '18 kg / year',
    maintenance: 'Low',
    growth: '5–6 years',
    expectedYieldPerPlant: 85,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 32,
    harvestsPerYear: 4,
    description: 'A resilient boundary and plantation staple for warm, open acreage.',
    color: '#16a085',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    modelType: 'Coconut',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 22, expectedYield: 85, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Coconut Development Board (CDB, Ministry of Agriculture, Kochi) 2021 Bulletin' },
      { year: 2022, referenceMarketPrice: 25, expectedYield: 85, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Coconut Development Board Monthly Indian Coconut Journal 2022' },
      { year: 2023, referenceMarketPrice: 27, expectedYield: 85, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'CDB Farmgate & Mandi Price Statistics 2023' },
      { year: 2024, referenceMarketPrice: 30, expectedYield: 85, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet & Coconut Development Board Market Analysis 2024' },
      { year: 2025, referenceMarketPrice: 32, expectedYield: 85, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Coconut Development Board (Govt. of India) Mandi Benchmark 2025' },
    ]
  },
  {
    id: 'arecanut-premium',
    name: 'Arecanut Premium',
    shortName: 'Arecanut',
    category: 'Avenue',
    price: 155,
    sizePrices: {
      S: 105,
      M: 155,
      L: 235,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '9 × 9 ft',
    p2p: 9,
    r2r: 9,
    plantsPerAcre: 520,
    fertilizer: '9 kg / year',
    maintenance: 'High',
    growth: '5–7 years',
    expectedYieldPerPlant: 4.5,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 380,
    harvestsPerYear: 1,
    description: 'Tall, elegant palms that reward careful irrigation and a considered grid.',
    color: '#27ae60',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    modelType: 'Arecanut',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 295, expectedYield: 4.5, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'CAMPCO & Directorate of Arecanut and Spices Development (DASD) 2021' },
      { year: 2022, referenceMarketPrice: 320, expectedYield: 4.5, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Shimoga & Mangalore APMC Reports 2022' },
      { year: 2023, referenceMarketPrice: 345, expectedYield: 4.5, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'CAMPCO Mandi Market Review 2023' },
      { year: 2024, referenceMarketPrice: 365, expectedYield: 4.5, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet & DASD Agricultural Statistics 2024' },
      { year: 2025, referenceMarketPrice: 380, expectedYield: 4.5, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'CAMPCO & Karnataka State APMC Benchmark 2025' },
    ]
  },
  {
    id: 'mosambi-sweet',
    name: 'Sweet Mosambi',
    shortName: 'Mosambi',
    category: 'Fruit plants',
    price: 145,
    sizePrices: {
      S: 95,
      M: 145,
      L: 220,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '18 × 18 ft',
    p2p: 18,
    r2r: 18,
    plantsPerAcre: 130,
    fertilizer: '10 kg / year',
    maintenance: 'Moderate',
    growth: '3–4 years',
    expectedYieldPerPlant: 40,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 50,
    harvestsPerYear: 2,
    description: 'Bright citrus with a measured canopy, ideal for mixed orchard plans.',
    color: '#2980b9',
    image: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=800&q=80',
    modelType: 'Mosambi',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 32, expectedYield: 40, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Ministry of Agriculture) — Jalna & Ahmednagar APMC 2021' },
      { year: 2022, referenceMarketPrice: 36, expectedYield: 40, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'National Horticulture Board (NHB) Citrus Price Reports 2022' },
      { year: 2023, referenceMarketPrice: 40, expectedYield: 40, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Mandi Arrivals & Prices 2023' },
      { year: 2024, referenceMarketPrice: 46, expectedYield: 40, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'NHB Horticulture Market Database 2024' },
      { year: 2025, referenceMarketPrice: 50, expectedYield: 40, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Ministry of Agriculture, Govt. of India) 2025 benchmark' },
    ]
  },
  {
    id: 'banana-grand-naine',
    name: 'Grand Naine Banana',
    shortName: 'Banana',
    category: 'Fruit plants',
    price: 42,
    sizePrices: {
      S: 28,
      M: 42,
      L: 65,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '6 × 6 ft',
    p2p: 6,
    r2r: 6,
    plantsPerAcre: 1100,
    fertilizer: '5 kg / year',
    maintenance: 'High',
    growth: '10–12 months',
    expectedYieldPerPlant: 28,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 24,
    harvestsPerYear: 1,
    description: 'Fast-turning, productive plants for a first harvest while the orchard matures.',
    color: '#f1c40f',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    modelType: 'Banana',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 15, expectedYield: 28, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet & ICAR-National Research Centre for Banana (NRCB) 2021' },
      { year: 2022, referenceMarketPrice: 17, expectedYield: 28, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Jalgaon & Theni Mandi Price Series 2022' },
      { year: 2023, referenceMarketPrice: 19, expectedYield: 28, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'ICAR-NRCB Market Bulletin 2023' },
      { year: 2024, referenceMarketPrice: 22, expectedYield: 28, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet APMC Wholesale Price Bulletin 2024' },
      { year: 2025, referenceMarketPrice: 24, expectedYield: 28, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'ICAR-NRCB & Agmarknet Mandi Reports 2025' },
    ]
  },
  {
    id: 'drumstick-moringa',
    name: 'Moringa',
    shortName: 'Moringa',
    category: 'Landscaping',
    price: 38,
    sizePrices: {
      S: 25,
      M: 38,
      L: 58,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '10 × 10 ft',
    p2p: 10,
    r2r: 10,
    plantsPerAcre: 435,
    fertilizer: '4 kg / year',
    maintenance: 'Low',
    growth: '8–10 months',
    expectedYieldPerPlant: 38,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 36,
    harvestsPerYear: 2,
    description: 'A versatile, fast-growing utility crop for the working edge of a plan.',
    color: '#78b582',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    modelType: 'Moringa',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 24, expectedYield: 38, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet (Govt. of India) — Oddanchatram & Dindigul APMC 2021' },
      { year: 2022, referenceMarketPrice: 27, expectedYield: 38, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Horticultural Vegetable Mandi Statistics 2022' },
      { year: 2023, referenceMarketPrice: 30, expectedYield: 38, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'TNAU Market Advisory & Agmarknet 2023' },
      { year: 2024, referenceMarketPrice: 33, expectedYield: 38, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Market Information System 2024' },
      { year: 2025, referenceMarketPrice: 36, expectedYield: 38, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Mandi Benchmark 2025' },
    ]
  },
  {
    id: 'jasmine-star',
    name: 'Star Jasmine',
    shortName: 'Jasmine',
    category: 'Flower',
    price: 65,
    sizePrices: {
      S: 45,
      M: 65,
      L: 98,
    },
    sizeAvailability: {
      S: true,
      M: true,
      L: true,
    },
    sizeImages: {
      S: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
      M: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80',
      L: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    },
    spacing: '5 × 5 ft',
    p2p: 5,
    r2r: 5,
    plantsPerAcre: 1742,
    fertilizer: '3 kg / year',
    maintenance: 'Moderate',
    growth: '12–18 months',
    expectedYieldPerPlant: 3,
    yieldUnit: 'kg',
    expectedSellingPricePerKg: 290,
    harvestsPerYear: 3,
    description: 'A fragrant flowering layer for pathways, entries, and living garden edges.',
    color: '#d7c7a1',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    modelType: 'Flower',
    historicalMarketData: [
      { year: 2021, referenceMarketPrice: 210, expectedYield: 3, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Madurai & Bangalore Flower Market APMC Bulletin 2021' },
      { year: 2022, referenceMarketPrice: 235, expectedYield: 3, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Cut-flower & Loose Flower Daily Modal Reports 2022' },
      { year: 2023, referenceMarketPrice: 255, expectedYield: 3, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'National Horticulture Board (NHB) Floriculture Statistics 2023' },
      { year: 2024, referenceMarketPrice: 275, expectedYield: 3, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet DMI Floriculture Market Arrival Bulletin 2024' },
      { year: 2025, referenceMarketPrice: 290, expectedYield: 3, priceUnit: '₹/kg', yieldUnit: 'kg', dataSource: 'Agmarknet Mandi Benchmark (Govt. of India) 2025' },
    ]
  }
]

export const initialSelectedPlantIds = ['mango-kesar', 'guava-allahabad', 'teak-sapling']

export function getPlantHistoricalData(plant) {
  if (Array.isArray(plant?.historicalMarketData) && plant.historicalMarketData.length > 0) {
    return plant.historicalMarketData
  }
  const defaultMatch = defaultPlants.find(p => p.id === plant?.id || p.name === plant?.name)
  if (defaultMatch?.historicalMarketData) {
    return defaultMatch.historicalMarketData
  }
  return null
}
