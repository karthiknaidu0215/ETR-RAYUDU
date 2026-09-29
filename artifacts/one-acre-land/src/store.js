import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { defaultPlants, initialSelectedPlantIds } from './plantsData';

const ACRE_SQ_FT = 43560;

const calculateBlocks = (acres, borderWidth, cropZones) => {
  const totalSqFt = acres * ACRE_SQ_FT;
  const landSide = Math.sqrt(totalSqFt); 
  
  const interiorSide = Math.max(0, landSide - (2 * borderWidth));
  const interiorArea = interiorSide * interiorSide;
  const borderArea = totalSqFt - interiorArea;
  
  let currentZ = -interiorSide / 2;
  
  const zones = cropZones.map(zone => {
    const area = interiorArea * (zone.percentage / 100);
    const lengthZ = interiorSide * (zone.percentage / 100);
    const block = {
      x: 0, 
      z: currentZ + (lengthZ / 2), 
      width: interiorSide,
      length: lengthZ,
      minX: -interiorSide / 2,
      maxX: interiorSide / 2,
      minZ: currentZ,
      maxZ: currentZ + lengthZ,
      area
    };
    currentZ += lengthZ;
    return { ...zone, block };
  });
  
  return { zones, landSide, interiorSide, interiorArea, borderArea };
};

// Math helpers
export const isPointInRotatedRect = (px, pz, cx, cz, w, l, angle) => {
  const tx = px - cx;
  const tz = pz - cz;
  
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  
  const rx = tx * cos - tz * sin;
  const rz = tx * sin + tz * cos;
  
  return (Math.abs(rx) <= w / 2 && Math.abs(rz) <= l / 2);
}

export const getInfraArea = (infra) => {
  if (infra.type === 'Borewell' || infra.type === 'Water Tank') return Math.PI * Math.pow(infra.radius, 2);
  if (infra.type === 'Road') return infra.width * infra.length;
  return infra.width * infra.length;
}

const initialCalculations = calculateBlocks(1, 10, []);

export const useStore = create((set, get) => ({
  landAcres: 1, 
  borderWidth: 10,
  landSideFt: initialCalculations.landSide,
  interiorSideFt: initialCalculations.interiorSide,
  interiorAreaSqFt: initialCalculations.interiorArea,
  borderAreaSqFt: initialCalculations.borderArea,
  
  showStats: true,
  toggleStats: () => set((state) => ({ showStats: !state.showStats })),
  
  // Plant Library connection state (Single Source of Truth)
  libraryPlants: defaultPlants,
  selectedPlantIds: ['mango-kesar', 'guava-allahabad', 'teak-sapling'],
  selectedPlantSizes: {
    'mango-kesar': 'M',
    'guava-allahabad': 'M',
    'teak-sapling': 'M',
  },

  syncWithLibrary: (libraryPlants, selectedPlantIds, selectedPlantSizes) => set((state) => {
    const updatedLibrary = libraryPlants?.length ? libraryPlants : state.libraryPlants;
    const updatedSelectedIds = Array.isArray(selectedPlantIds) ? selectedPlantIds : state.selectedPlantIds;
    const updatedSelectedSizes = selectedPlantSizes || state.selectedPlantSizes || {};
    
    // Check if current border plant is still in available set, or switch to first available
    const selectedSet = new Set(updatedSelectedIds);
    const available = updatedLibrary
      .filter(p => selectedSet.has(p.id))
      .filter(p => p.sizeAvailability?.[updatedSelectedSizes[p.id] || 'M'] !== false);
    
    let borderType = state.borderZone.type;
    if (available.length > 0) {
      const match = available.find(p => (p.shortName || p.name) === borderType || p.name === borderType);
      if (!match) {
        borderType = available[0].shortName || available[0].name;
      }
    }

    // Keep crop zone types aligned with shortlisted plants if available
    let updatedCropZones = state.cropZones;
    if (available.length > 0 && updatedCropZones.length > 0) {
      updatedCropZones = updatedCropZones.map(zone => {
        const isStillAvailable = available.some(p => (p.shortName || p.name) === zone.type || p.name === zone.type);
        if (!isStillAvailable) {
          const fallback = available[0];
          return {
            ...zone,
            type: fallback.shortName || fallback.name,
            p2p: fallback.p2p || zone.p2p,
            r2r: fallback.r2r || zone.r2r,
          };
        }
        return zone;
      });
    }
    
    return {
      libraryPlants: updatedLibrary,
      selectedPlantIds: updatedSelectedIds,
      selectedPlantSizes: updatedSelectedSizes,
      borderZone: { ...state.borderZone, type: borderType },
      cropZones: updatedCropZones
    };
  }),

  // Carries user selected plants & S/M/L sizes directly into Plan Maker zones
  carrySelectedPlantsIntoPlanner: (libraryPlants, selectedPlantIds, selectedPlantSizes) => set((state) => {
    const updatedLibrary = libraryPlants?.length ? libraryPlants : state.libraryPlants;
    const updatedSelectedIds = Array.isArray(selectedPlantIds) ? selectedPlantIds : state.selectedPlantIds;
    const updatedSelectedSizes = selectedPlantSizes || state.selectedPlantSizes || {};
    
    const selectedSet = new Set(updatedSelectedIds);
    const available = updatedLibrary.filter(p => selectedSet.has(p.id));
    
    if (available.length === 0) {
      return {
        libraryPlants: updatedLibrary,
        selectedPlantIds: updatedSelectedIds,
        selectedPlantSizes: updatedSelectedSizes,
      };
    }
    
    // Choose border plant: prefer timber or avenue if selected, else first selected
    const timberOrAvenue = available.find(p => p.category === 'Timber / Wood' || p.category === 'Avenue');
    const borderPlant = timberOrAvenue || available[0];
    const borderType = borderPlant.shortName || borderPlant.name;
    
    // Create cropZones representing the selected plants
    const percPerCrop = Math.floor(100 / available.length);
    const remainder = 100 - (percPerCrop * available.length);
    
    const newCropZones = available.map((plant, index) => {
      const perc = index === 0 ? (percPerCrop + remainder) : percPerCrop;
      return {
        id: uuidv4(),
        type: plant.shortName || plant.name,
        percentage: perc,
        p2p: plant.p2p || 15,
        r2r: plant.r2r || 15,
        targetPlants: plant.plantsPerAcre ? Math.round(plant.plantsPerAcre * (perc / 100)) : 0
      };
    });
    
    const { zones, interiorArea, borderArea } = calculateBlocks(state.landAcres, state.borderWidth, newCropZones);
    
    return {
      libraryPlants: updatedLibrary,
      selectedPlantIds: updatedSelectedIds,
      selectedPlantSizes: updatedSelectedSizes,
      borderZone: { ...state.borderZone, type: borderType },
      cropZones: zones,
      interiorAreaSqFt: interiorArea,
      borderAreaSqFt: borderArea,
      plants: [] // Reset plant placements to populate with new zones
    };
  }),

  // Returns ONLY plants selected by the user from the Plant Library
  getAvailablePlants: () => {
    const state = get();
    const library = state.libraryPlants || defaultPlants;
    const selectedIds = new Set(state.selectedPlantIds || []);
    const sizes = state.selectedPlantSizes || {};
    
    // Helper to enrich plant with selected nursery size, price, and size image
    const enrich = (plant) => {
      const selectedSize = sizes[plant.id] || 'M';
      const sizePrices = plant.sizePrices || {
        S: Math.round((plant.price || 100) * 0.68),
        M: plant.price || 100,
        L: Math.round((plant.price || 100) * 1.48),
      };
      const sizeAvailability = plant.sizeAvailability || { S: true, M: true, L: true };
      const rawAvail = sizeAvailability[selectedSize];
      const isAvailable = rawAvail !== false && rawAvail !== 'Not Available' && rawAvail !== 'false';
      const selectedPrice = Number(sizePrices[selectedSize] || plant.price || 100);
      const sizeImage = plant.image || plant.sizeImages?.[selectedSize] || '';
      return {
        ...plant,
        selectedSize,
        selectedPrice,
        sizePrices,
        sizeAvailability,
        isAvailable,
        image: sizeImage,
      };
    };

    // Return ONLY plants selected by user where the selected size is available
    return library
      .filter(p => selectedIds.has(p.id))
      .map(enrich)
      .filter(p => p.isAvailable);
  },

  cropZones: [],  
  borderZone: { id: 'border-zone', type: 'Mango', targetPlants: 0 },
  
  plants: [], // All placed/intended plants
  selectedPlantId: null,
  draggingPlantId: null,
  measuring: false,
  measurePoints: [],
  manualPlacementZoneId: null,

  // --- INFRASTRUCTURE ---
  infrastructure: [],
  selectedInfraId: null,
  draggingInfraId: null,
  activeDrawTool: null, // 'Road'
  draftRoad: null, // { startX, startZ, endX, endZ }
  
  addInfrastructure: (type) => set((state) => {
    let width = 20;
    let length = 20;
    let radius = 5;

    if (type === 'Farm House') { width = 30; length = 40; }
    if (type === 'Pond') { width = 40; length = 40; }
    if (type === 'Storage Shed') { width = 20; length = 30; }
    if (type === 'Water Tank') { width = 15; length = 15; radius = 7.5; }
    if (type === 'Pump Room') { width = 10; length = 10; }
    if (type === 'Gate') { width = 15; length = 5; }
    if (type === 'Custom Obstacle') { width = 20; length = 20; }
    if (type === 'Borewell') { width = 10; length = 10; radius = 5; }

    const newItem = {
      id: uuidv4(),
      type,
      x: 0,
      z: 0,
      width,
      length,
      radius,
      rotation: 0
    };
    
    return { infrastructure: [...state.infrastructure, newItem], selectedInfraId: newItem.id };
  }),

  addDrawnRoad: (startX, startZ, endX, endZ, width) => set((state) => {
    const dx = endX - startX;
    const dz = endZ - startZ;
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const cx = (startX + endX) / 2;
    const cz = (startZ + endZ) / 2;

    const newItem = {
      id: uuidv4(),
      type: 'Road',
      x: cx,
      z: cz,
      width,
      length,
      rotation: angle
    };

    return { infrastructure: [...state.infrastructure, newItem], selectedInfraId: newItem.id, draftRoad: null, activeDrawTool: null };
  }),

  addFullRoad: (position) => set((state) => {
    const width = 12; // default 12ft road
    const L = state.landSideFt;
    let cx = 0, cz = 0, len = L, rot = 0;

    if (position === 'top') {
      cx = 0; cz = -L / 2 + width / 2; len = L; rot = Math.PI / 2;
    } else if (position === 'bottom') {
      cx = 0; cz = L / 2 - width / 2; len = L; rot = Math.PI / 2;
    } else if (position === 'left') {
      cx = -L / 2 + width / 2; cz = 0; len = L; rot = 0;
    } else if (position === 'right') {
      cx = L / 2 - width / 2; cz = 0; len = L; rot = 0;
    } else if (position === 'center-h') {
      cx = 0; cz = 0; len = L; rot = Math.PI / 2;
    } else if (position === 'center-v') {
      cx = 0; cz = 0; len = L; rot = 0;
    }

    const newItem = {
      id: uuidv4(),
      type: 'Road',
      x: cx,
      z: cz,
      width,
      length: len,
      rotation: rot
    };

    return { infrastructure: [...state.infrastructure, newItem], selectedInfraId: newItem.id };
  }),

  updateInfrastructure: (id, updates) => set((state) => ({
    infrastructure: state.infrastructure.map(i => i.id === id ? { ...i, ...updates } : i)
  })),

  removeInfrastructure: (id) => set((state) => ({
    infrastructure: state.infrastructure.filter(i => i.id !== id),
    selectedInfraId: state.selectedInfraId === id ? null : state.selectedInfraId
  })),

  setSelectedInfraId: (id) => set({ selectedInfraId: id, selectedPlantId: null }),
  setDraggingInfraId: (id) => set({ draggingInfraId: id }),
  setActiveDrawTool: (tool) => set({ activeDrawTool: tool, manualPlacementZoneId: null }),
  setDraftRoad: (road) => set({ draftRoad: road }),

  setLandAcres: (acres) => set((state) => {
    const { zones, landSide, interiorSide, interiorArea, borderArea } = calculateBlocks(acres, state.borderWidth, state.cropZones);
    return { 
      landAcres: acres, 
      landSideFt: landSide, 
      interiorSideFt: interiorSide,
      interiorAreaSqFt: interiorArea,
      borderAreaSqFt: borderArea,
      cropZones: zones, 
      plants: [], 
      manualPlacementZoneId: null 
    }; 
  }),

  setBorderWidth: (width) => set((state) => {
    const { zones, landSide, interiorSide, interiorArea, borderArea } = calculateBlocks(state.landAcres, width, state.cropZones);
    return { 
      borderWidth: width, 
      landSideFt: landSide, 
      interiorSideFt: interiorSide,
      interiorAreaSqFt: interiorArea,
      borderAreaSqFt: borderArea,
      cropZones: zones 
    };
  }),
  
  addCropZone: (type) => set((state) => {
    const used = state.cropZones.reduce((sum, z) => sum + z.percentage, 0);
    let perc = Math.min(100 - used, 20);
    if (perc <= 0) perc = 10; 
    
    const available = state.getAvailablePlants();
    const chosenType = type || available[0]?.shortName || available[0]?.name || 'Mango';
    const plantObj = (state.libraryPlants || defaultPlants).find(p => (p.shortName || p.name || p.type) === chosenType);
    
    const newZone = {
      id: uuidv4(),
      type: chosenType,
      percentage: perc,
      p2p: plantObj?.p2p || 15,
      r2r: plantObj?.r2r || 15,
      targetPlants: plantObj?.plantsPerAcre ? Math.round(plantObj.plantsPerAcre * (perc / 100)) : 0
    };
    
    const { zones, interiorArea, borderArea } = calculateBlocks(state.landAcres, state.borderWidth, [...state.cropZones, newZone]);
    return { cropZones: zones, interiorAreaSqFt: interiorArea, borderAreaSqFt: borderArea };
  }),
  
  updateCropZone: (id, updates) => set((state) => {
    const updated = state.cropZones.map(z => z.id === id ? { ...z, ...updates } : z);
    const { zones } = calculateBlocks(state.landAcres, state.borderWidth, updated);
    return { cropZones: zones };
  }),

  updateBorderZone: (updates) => set((state) => ({
    borderZone: { ...state.borderZone, ...updates }
  })),
  
  removeCropZone: (id) => set((state) => {
    const updated = state.cropZones.filter(z => z.id !== id);
    const { zones } = calculateBlocks(state.landAcres, state.borderWidth, updated);
    return { 
      cropZones: zones, 
      plants: state.plants.filter(p => p.zoneId !== id),
      manualPlacementZoneId: state.manualPlacementZoneId === id ? null : state.manualPlacementZoneId
    };
  }),
  
  setManualPlacementZoneId: (id) => set({ manualPlacementZoneId: id, activeDrawTool: null, selectedInfraId: null }),

  placeManualPlant: (x, z) => set((state) => {
    if (!state.manualPlacementZoneId) return state;
    
    let type = '';
    let zoneId = state.manualPlacementZoneId;
    
    if (zoneId === 'border-zone') {
      const halfL = state.landSideFt / 2;
      const halfI = state.interiorSideFt / 2;
      const inOuter = x >= -halfL && x <= halfL && z >= -halfL && z <= halfL;
      const inInner = x > -halfI && x < halfI && z > -halfI && z < halfI;
      if (!inOuter || inInner) return state; 
      type = state.borderZone.type;
    } else {
      const zone = state.cropZones.find(z => z.id === zoneId);
      if (!zone) return state;
      if (x < zone.block.minX || x > zone.block.maxX || z < zone.block.minZ || z > zone.block.maxZ) {
        return state;
      }
      type = zone.type;
    }

    const newPlant = {
      id: uuidv4(),
      zoneId,
      type,
      x,
      z
    };
    
    return { plants: [...state.plants, newPlant] };
  }),

  autoArrangeZone: (zoneId) => set((state) => {
    const zone = state.cropZones.find(z => z.id === zoneId);
    if (!zone) return state;
    
    const otherPlants = state.plants.filter(p => p.zoneId !== zoneId);
    let newPlants = [];
    
    const maxCols = Math.floor(zone.block.width / zone.p2p);
    const maxRows = Math.floor(zone.block.length / zone.r2r);
    
    let count = 0;
    const target = zone.targetPlants > 0 ? zone.targetPlants : (maxCols * maxRows);
    
    const startX = zone.block.minX + (zone.p2p / 2);
    const startZ = zone.block.minZ + (zone.r2r / 2);
    
    for (let r = 0; r < maxRows; r++) {
      for (let c = 0; c < maxCols; c++) {
        if (count >= target) break;
        newPlants.push({
          id: uuidv4(),
          zoneId,
          type: zone.type,
          x: startX + (c * zone.p2p),
          z: startZ + (r * zone.r2r)
        });
        count++;
      }
      if (count >= target) break;
    }
    
    return { plants: [...otherPlants, ...newPlants] };
  }),

  autoArrangeBorder: () => set((state) => {
    const spacing = 20; // 20ft spacing along perimeter
    const otherPlants = state.plants.filter(p => p.zoneId !== 'border-zone');
    const newPlants = [];
    
    const halfL = state.landSideFt / 2;
    const offset = state.borderWidth / 2;
    const edge = halfL - offset;
    
    const steps = Math.floor(state.landSideFt / spacing);
    
    for (let i = 0; i < steps; i++) {
      const pos = -halfL + (i * spacing) + (spacing / 2);
      newPlants.push({ id: uuidv4(), zoneId: 'border-zone', type: state.borderZone.type, x: pos, z: -edge });
      newPlants.push({ id: uuidv4(), zoneId: 'border-zone', type: state.borderZone.type, x: pos, z: edge });
      newPlants.push({ id: uuidv4(), zoneId: 'border-zone', type: state.borderZone.type, x: -edge, z: pos });
      newPlants.push({ id: uuidv4(), zoneId: 'border-zone', type: state.borderZone.type, x: edge, z: pos });
    }
    
    return { plants: [...otherPlants, ...newPlants] };
  }),

  updatePlantPosition: (id, x, z) => set((state) => ({
    plants: state.plants.map(p => p.id === id ? { ...p, x, z } : p)
  })),

  removePlant: (id) => set((state) => ({
    plants: state.plants.filter(p => p.id !== id),
    selectedPlantId: state.selectedPlantId === id ? null : state.selectedPlantId
  })),

  duplicatePlant: (id) => set((state) => {
    const plant = state.plants.find(p => p.id === id);
    if (!plant) return state;
    const newPlant = {
      ...plant,
      id: uuidv4(),
      x: plant.x + 5,
      z: plant.z + 5
    };
    return { plants: [...state.plants, newPlant], selectedPlantId: newPlant.id };
  }),

  clearAllPlants: () => set({ plants: [], selectedPlantId: null }),

  setSelectedPlantId: (id) => set({ selectedPlantId: id, selectedInfraId: null }),
  setDraggingPlantId: (id) => set({ draggingPlantId: id }),
  setMeasuring: (measuring) => set({ measuring, measurePoints: [] }),
  addMeasurePoint: (plantId) => set((state) => {
    const points = [...state.measurePoints, plantId];
    return { measurePoints: points };
  }),
}));
