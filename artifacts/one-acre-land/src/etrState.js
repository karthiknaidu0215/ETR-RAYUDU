import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useStore, isPointInRotatedRect } from './store'
import { defaultPlants, initialSelectedPlantIds, PLANT_SIZES, getPlantSizePrices, getPlantSizeImage, getPlantSizeDetails, getPlantSizeAvailability, isPlantSizeAvailable, INDIAN_MACRO_CONTEXT, getPlantHistoricalData } from './plantsData'

export { defaultPlants, initialSelectedPlantIds, PLANT_SIZES, getPlantSizePrices, getPlantSizeImage, getPlantSizeDetails, getPlantSizeAvailability, isPlantSizeAvailable, INDIAN_MACRO_CONTEXT, getPlantHistoricalData }

const KEY = 'etr-nursery-prototype'

export const defaultLandPricing = {
  S: {
    id: 'S',
    code: 'S',
    name: 'Small Plot',
    acres: 0.5,
    size: '0.5 Acre',
    sqft: '21,780 sq ft',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    description: 'Compact 0.5-acre agricultural plot with rich soil and distinct boundary fencing. Ideal for high-density fruit orchards, nursery beds, or specialized agroforestry.',
    capacity: '120–180 saplings',
    dimensions: '147.5 × 147.5 ft'
  },
  M: {
    id: 'M',
    code: 'M',
    name: 'Standard Acre',
    acres: 1.0,
    size: '1.0 Acre',
    sqft: '43,560 sq ft',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80',
    description: 'Full 1-acre fertile parcel engineered for balanced multi-crop zoning, internal irrigation access roads, and optimum crop yield.',
    capacity: '300–450 saplings',
    dimensions: '208.7 × 208.7 ft'
  },
  L: {
    id: 'L',
    code: 'L',
    name: 'Estate Acreage',
    acres: 2.5,
    size: '2.5 Acres',
    sqft: '1,08,900 sq ft',
    price: 195000,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    description: 'Expansive 2.5-acre agro-estate suitable for extensive commercial timber, orchard blocks, farmhouses, and water retention lakes.',
    capacity: '750–1,100 saplings',
    dimensions: '330 × 330 ft'
  }
}

const defaultUser = { id: 'usr-karthik', name: 'Karthik Naidu', phone: '+91 98490 21212', registeredAt: '2026-01-01' }

const initialSelectedPlantSizes = {
  'mango-kesar': 'M',
  'guava-allahabad': 'M',
  'teak-sapling': 'M',
  'coconut-tall': 'M',
  'arecanut-premium': 'M',
  'mosambi-sweet': 'M',
  'banana-grand-naine': 'M',
  'drumstick-moringa': 'M',
  'jasmine-star': 'M',
}

const initialState = {
  introSeen: true,
  currentUser: defaultUser,
  users: [defaultUser],
  plants: defaultPlants,
  selectedPlantIds: initialSelectedPlantIds,
  selectedPlantSizes: initialSelectedPlantSizes,
  plans: [],
  bills: [],
  settings: {
    gstPercent: 5,
    serviceCharge: 1800,
    transportation: 5000,
    fencing: 25000,
    dripIrrigation: 35000,
    honeyBeeBox: 8000,
    otherCharges: 0,
    discount: 0,
    landPricing: defaultLandPricing,
  },
  content: {
    heroTitle: 'Plan Your Land. Grow Your Future.',
    heroSubtitle: 'Smart plantation planning for every acre.',
    description: 'ETR NURSERY brings planting intelligence, trusted nursery stock, and practical planning into one calm command center for landowners.',
    services: 'Plant selection, spatial planning, nursery supply, delivery coordination, and aftercare guidance.',
    contact: '+91 98490 21212 · nursery@etr.ag'
  }
}

function readState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed) {
        const deletedPlantIds = Array.isArray(parsed.deletedPlantIds) ? parsed.deletedPlantIds : []
        const basePlantList = parsed.plants?.length ? parsed.plants : defaultPlants

        // Merge stored plants with defaultPlants so images, spacing, sizePrices, and income params are preserved
        const mergedPlants = basePlantList.map((p) => {
          const def = defaultPlants.find((dp) => dp.id === p.id)
          const fallbackPrices = getPlantSizePrices(p)
          const sizePrices = p.sizePrices || def?.sizePrices || fallbackPrices

          const isAvail = (val, fallback = true) => {
            if (val === undefined || val === null) return fallback
            return val !== false && val !== 'false' && val !== 'Not Available'
          }

          const sizeAvailability = {
            S: p.sizeAvailability?.S !== undefined ? isAvail(p.sizeAvailability.S) : isAvail(def?.sizeAvailability?.S, true),
            M: p.sizeAvailability?.M !== undefined ? isAvail(p.sizeAvailability.M) : isAvail(def?.sizeAvailability?.M, true),
            L: p.sizeAvailability?.L !== undefined ? isAvail(p.sizeAvailability.L) : isAvail(def?.sizeAvailability?.L, true),
          }

          const sizeDetails = {
            S: p.sizeDetails?.S || p.sizeInfoS || def?.sizeDetails?.S || '1–2 ft nursery polybag sapling',
            M: p.sizeDetails?.M || p.sizeInfoM || def?.sizeDetails?.M || '3–4 ft established container tree',
            L: p.sizeDetails?.L || p.sizeInfoL || def?.sizeDetails?.L || '5–6 ft mature stock with developed rootball',
          }

          const expectedYieldPerPlant = p.expectedYieldPerPlant !== undefined 
            ? Number(p.expectedYieldPerPlant) 
            : (def?.expectedYieldPerPlant !== undefined ? Number(def.expectedYieldPerPlant) : 0)
          const expectedSellingPricePerKg = p.expectedSellingPricePerKg !== undefined 
            ? Number(p.expectedSellingPricePerKg) 
            : (def?.expectedSellingPricePerKg !== undefined ? Number(def.expectedSellingPricePerKg) : 0)
          const harvestsPerYear = p.harvestsPerYear !== undefined 
            ? Number(p.harvestsPerYear) 
            : (def?.harvestsPerYear !== undefined ? Number(def.harvestsPerYear) : 1)
          const yieldUnit = p.yieldUnit || def?.yieldUnit || 'kg'
          const image = p.image || def?.image || ''

          return def ? {
            ...def,
            ...p,
            image,
            sizePrices: {
              S: Number(sizePrices.S || def.sizePrices.S),
              M: Number(sizePrices.M || def.sizePrices.M),
              L: Number(sizePrices.L || def.sizePrices.L),
            },
            sizeAvailability,
            sizeImages: p.sizeImages || def.sizeImages,
            sizeDetails,
            price: Number(p.price || sizePrices.M || def.price),
            p2p: def.p2p,
            r2r: def.r2r,
            shortName: p.shortName || def.shortName,
            expectedYieldPerPlant,
            expectedSellingPricePerKg,
            harvestsPerYear,
            yieldUnit
          } : {
            ...p,
            image,
            sizePrices,
            sizeAvailability,
            sizeDetails,
            price: Number(p.price || sizePrices.M || 100),
            expectedYieldPerPlant,
            expectedSellingPricePerKg,
            harvestsPerYear,
            yieldUnit
          }
        })

        // Ensure newly added default plants are present, UNLESS explicitly removed by Admin
        defaultPlants.forEach((dp) => {
          if (!mergedPlants.some((p) => p.id === dp.id) && !deletedPlantIds.includes(dp.id)) {
            mergedPlants.push(dp)
          }
        })

        const selectedPlantIds = Array.isArray(parsed.selectedPlantIds)
          ? parsed.selectedPlantIds
          : initialSelectedPlantIds

        const selectedPlantSizes = {
          ...initialSelectedPlantSizes,
          ...(parsed.selectedPlantSizes || {})
        }

        const landPricing = {
          S: { ...defaultLandPricing.S, ...(parsed.settings?.landPricing?.S || {}) },
          M: { ...defaultLandPricing.M, ...(parsed.settings?.landPricing?.M || {}) },
          L: { ...defaultLandPricing.L, ...(parsed.settings?.landPricing?.L || {}) }
        }

        const settings = {
          ...initialState.settings,
          ...parsed.settings,
          transportation: Number(parsed.settings?.transportation ?? 5000),
          fencing: Number(parsed.settings?.fencing ?? 25000),
          dripIrrigation: Number(parsed.settings?.dripIrrigation ?? 35000),
          honeyBeeBox: Number(parsed.settings?.honeyBeeBox ?? 8000),
          landPricing
        }

        return {
          ...initialState,
          ...parsed,
          introSeen: true,
          currentUser: parsed.currentUser || defaultUser,
          plants: mergedPlants,
          selectedPlantIds,
          selectedPlantSizes,
          settings,
          content: { ...initialState.content, ...parsed.content },
        }
      }
    }
  } catch {
    // Fresh prototype state.
  }
  return initialState
}

export function useETRStore() {
  const [state, setState] = useState(readState)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch (err) {
      console.warn('Failed to save to localStorage:', err)
    }
    // Keep 3D planner store in sync safely
    try {
      const storeState = useStore?.getState?.()
      if (storeState && typeof storeState.syncWithLibrary === 'function') {
        storeState.syncWithLibrary(state.plants, state.selectedPlantIds, state.selectedPlantSizes)
      }
    } catch (err) {
      console.warn('Sync with library deferred:', err)
    }
  }, [state])

  const patch = (updates) => setState((current) => ({
    ...current,
    ...(typeof updates === 'function' ? updates(current) : updates)
  }))

  const loginUser = (name, phone) => {
    const cleanName = name.trim()
    const cleanPhone = phone.trim()
    const existing = state.users.find((user) => user.phone === cleanPhone)
    const user = existing || { id: uuidv4(), name: cleanName, phone: cleanPhone, registeredAt: new Date().toISOString() }
    setState((current) => ({ ...current, users: existing ? current.users : [...current.users, user], currentUser: user }))
    return user
  }

  const logout = () => patch({ currentUser: null })

  const updateSettings = (settings) => patch((current) => ({ settings: { ...current.settings, ...settings } }))
  const updateContent = (content) => patch((current) => ({ content: { ...current.content, ...content } }))

  // Select plant size (S, M, L) and sync unit price into draft plan items
  const setPlantSelectedSize = (plantId, size) => {
    patch((current) => {
      const plant = current.plants.find((p) => p.id === plantId)
      const sizePrices = getPlantSizePrices(plant)
      const unitPrice = sizePrices[size] || plant?.price || 0
      const nextSizes = { ...(current.selectedPlantSizes || {}), [plantId]: size }

      const plans = current.plans.map((plan) => {
        if (plan.status !== 'draft') return plan
        const items = (plan.items || []).map((item) => {
          if (item.plantId === plantId) {
            return { ...item, size, price: unitPrice }
          }
          return item
        })
        return { ...plan, items }
      })

      return {
        selectedPlantSizes: nextSizes,
        plans
      }
    })
  }

  // Toggle selection for Plan My Acre connection with chosen plant size
  const togglePlantSelection = (plantId, optionalSize) => {
    patch((current) => {
      const currentSelected = current.selectedPlantIds || []
      const isSelected = currentSelected.includes(plantId)
      const nextSelected = isSelected
        ? currentSelected.filter((id) => id !== plantId)
        : [...currentSelected, plantId]

      const plant = current.plants.find((p) => p.id === plantId)
      const size = optionalSize || current.selectedPlantSizes?.[plantId] || 'M'
      const sizePrices = getPlantSizePrices(plant)
      const price = sizePrices[size] || plant?.price || 0

      // Also ensure draft plan reflects items if adding or removing
      let plans = current.plans
      if (!isSelected) {
        const currentPlan = current.plans.find((plan) => plan.userId === (current.currentUser?.id || 'guest') && plan.status === 'draft')
        const items = currentPlan?.items || []
        if (!items.some((i) => i.plantId === plantId)) {
          const nextItems = [...items, { plantId, size, price, quantity: 50 }]
          const nextPlan = currentPlan
            ? { ...currentPlan, items: nextItems }
            : { id: uuidv4(), userId: current.currentUser?.id || 'guest', items: nextItems, landAcres: 1, status: 'draft', createdAt: new Date().toISOString() }
          plans = currentPlan ? current.plans.map((p) => p.id === currentPlan.id ? nextPlan : p) : [...current.plans, nextPlan]
        }
      } else {
        const currentPlan = current.plans.find((plan) => plan.userId === (current.currentUser?.id || 'guest') && plan.status === 'draft')
        if (currentPlan) {
          const nextItems = (currentPlan.items || []).filter((i) => i.plantId !== plantId)
          const nextPlan = { ...currentPlan, items: nextItems }
          plans = current.plans.map((p) => p.id === currentPlan.id ? nextPlan : p)
        }
      }

      return {
        selectedPlantIds: nextSelected,
        selectedPlantSizes: { ...(current.selectedPlantSizes || {}), [plantId]: size },
        plans,
      }
    })
  }

  const isPlantSelected = (plantId) => {
    return (state.selectedPlantIds || []).includes(plantId)
  }

  const addToPlan = (plantId, optionalSize) => {
    patch((current) => {
      const currentSelected = current.selectedPlantIds || []
      const nextSelected = currentSelected.includes(plantId) ? currentSelected : [...currentSelected, plantId]

      const plant = current.plants.find((p) => p.id === plantId)
      const size = optionalSize || current.selectedPlantSizes?.[plantId] || 'M'
      const sizePrices = getPlantSizePrices(plant)
      const price = sizePrices[size] || plant?.price || 0

      const currentPlan = current.plans.find((plan) => plan.userId === (current.currentUser?.id || 'guest') && plan.status === 'draft')
      const items = currentPlan?.items || []
      const found = items.find((item) => item.plantId === plantId)
      const nextItems = found
        ? items.map((item) => item.plantId === plantId ? { ...item, quantity: item.quantity + 1, size: size || item.size, price: price || item.price } : item)
        : [...items, { plantId, size, price, quantity: 1 }]
      const nextPlan = currentPlan
        ? { ...currentPlan, items: nextItems }
        : { id: uuidv4(), userId: current.currentUser?.id || 'guest', items: nextItems, landAcres: 1, status: 'draft', createdAt: new Date().toISOString() }

      return {
        selectedPlantIds: nextSelected,
        selectedPlantSizes: { ...(current.selectedPlantSizes || {}), [plantId]: size },
        plans: currentPlan ? current.plans.map((plan) => plan.id === currentPlan.id ? nextPlan : plan) : [...current.plans, nextPlan]
      }
    })
  }

  const getDraftPlan = (userId = state.currentUser?.id || 'guest') => state.plans.find((plan) => plan.userId === userId && plan.status === 'draft')

  const updatePlanItems = (items, landAcres = 1) => {
    patch((current) => {
      const userId = current.currentUser?.id || 'guest'
      const draft = current.plans.find((plan) => plan.userId === userId && plan.status === 'draft')
      const next = draft ? { ...draft, items, landAcres } : { id: uuidv4(), userId, items, landAcres, status: 'draft', createdAt: new Date().toISOString() }
      return { plans: draft ? current.plans.map((plan) => plan.id === draft.id ? next : plan) : [...current.plans, next] }
    })
  }

  // Sync placed plants from the 3D planner into draftPlan items
  const syncPlannerCountsToDraft = () => {
    try {
      const plannerStoreState = useStore?.getState?.()
      if (!plannerStoreState) return

      const { plants = [], infrastructure = [], landAcres = 1, cropZones = [], borderZone } = plannerStoreState
      
      // Calculate visible plants (not blocked by infrastructure)
      const visible = plants.filter(p => {
        let isRemoved = false
        for (const inf of (infrastructure || [])) {
          if (inf.type === 'Borewell' || inf.type === 'Water Tank') {
            const dist = Math.hypot(p.x - inf.x, p.z - inf.z)
            if (dist <= (inf.radius || inf.width / 2)) { isRemoved = true; break; }
          } else {
            if (isPointInRotatedRect(p.x, p.z, inf.x, inf.z, inf.width, inf.length, inf.rotation)) {
              isRemoved = true; break;
            }
          }
        }
        return !isRemoved
      })

      const counts = {}
      visible.forEach(p => {
        const match = state.plants.find(sp => 
          (sp.shortName || sp.name) === p.type || 
          sp.name === p.type || 
          sp.id === p.type || 
          sp.modelType === p.type
        )
        if (match) {
          counts[match.id] = (counts[match.id] || 0) + 1
        }
      })

      // If no individual plants were auto-arranged yet, check cropZones targetPlants
      if (Object.keys(counts).length === 0 && cropZones.length > 0) {
        cropZones.forEach(z => {
          const match = state.plants.find(sp => (sp.shortName || sp.name) === z.type || sp.name === z.type || sp.id === z.type)
          if (match && z.targetPlants > 0) {
            counts[match.id] = (counts[match.id] || 0) + z.targetPlants
          }
        })
        if (borderZone?.targetPlants > 0) {
          const match = state.plants.find(sp => (sp.shortName || sp.name) === borderZone.type || sp.name === borderZone.type || sp.id === borderZone.type)
          if (match) {
            counts[match.id] = (counts[match.id] || 0) + borderZone.targetPlants
          }
        }
      }

      if (Object.keys(counts).length > 0) {
        patch((current) => {
          const userId = current.currentUser?.id || 'guest'
          const draft = current.plans.find((p) => p.userId === userId && p.status === 'draft')
          const existingItems = draft?.items || []

          const updatedItems = Object.entries(counts).map(([plantId, qty]) => {
            const plant = current.plants.find(p => p.id === plantId)
            const size = current.selectedPlantSizes?.[plantId] || 'M'
            const sizePrices = getPlantSizePrices(plant)
            const price = sizePrices[size] || plant?.price || 100
            return {
              plantId,
              size,
              price,
              quantity: qty
            }
          })

          // Also keep any shortlisted items not placed yet if desired, or replace with placed
          const mergedItemIds = new Set(updatedItems.map(i => i.plantId))
          const remainingItems = existingItems.filter(i => !mergedItemIds.has(i.plantId))
          const finalItems = [...updatedItems, ...remainingItems]

          const nextDraft = draft 
            ? { ...draft, items: finalItems, landAcres } 
            : { id: uuidv4(), userId, items: finalItems, landAcres, status: 'draft', createdAt: new Date().toISOString() }

          return {
            plans: draft ? current.plans.map(p => p.id === draft.id ? nextDraft : p) : [...current.plans, nextDraft]
          }
        })
      }
    } catch (err) {
      console.warn('Failed to sync planner counts:', err)
    }
  }

  const savePlan = (planInput) => {
    let saved
    patch((current) => {
      const userId = current.currentUser?.id || 'guest'
      const draft = current.plans.find((plan) => plan.userId === userId && plan.status === 'draft')
      saved = { 
        ...(draft || {}), 
        ...planInput, 
        id: draft?.id || uuidv4(), 
        userId, 
        status: 'confirmed', 
        createdAt: draft?.createdAt || new Date().toISOString() 
      }
      const plans = draft ? current.plans.map((plan) => plan.id === draft.id ? saved : plan) : [...current.plans, saved]
      
      const bill = { 
        id: `ETR-${new Date().getFullYear()}-${String(current.bills.length + 1).padStart(4, '0')}`, 
        planId: saved.id, 
        userId, 
        amount: saved.totalInvestment || saved.total || 0, 
        status: 'review', 
        createdAt: saved.createdAt,
        items: saved.items || [],
        plantCost: saved.plantCost || saved.totalPlantCost || saved.subtotal || 0,
        selectedAddOns: saved.selectedAddOns || {},
        addOnCosts: saved.addOnCosts || {},
        totalInvestment: saved.totalInvestment || saved.total || 0,
        plantIncomes: saved.plantIncomes || [],
        totalAnnualIncome: saved.totalAnnualIncome || 0,
      }
      return { plans, bills: [...current.bills, bill] }
    })
    return saved
  }

  const adminLogin = (username, password) => username === 'rayudu' && password === 'rayudu'

  const addPlant = (plant) => patch((current) => {
    const sizePrices = plant.sizePrices || getPlantSizePrices(plant)
    const isAvailS = plant.sizeAvailability?.S !== undefined 
      ? (plant.sizeAvailability.S !== false && plant.sizeAvailability.S !== 'Not Available' && plant.sizeAvailability.S !== 'false')
      : (plant.availabilityS !== undefined ? plant.availabilityS === 'Available' : true)
    const isAvailM = plant.sizeAvailability?.M !== undefined 
      ? (plant.sizeAvailability.M !== false && plant.sizeAvailability.M !== 'Not Available' && plant.sizeAvailability.M !== 'false')
      : (plant.availabilityM !== undefined ? plant.availabilityM === 'Available' : true)
    const isAvailL = plant.sizeAvailability?.L !== undefined 
      ? (plant.sizeAvailability.L !== false && plant.sizeAvailability.L !== 'Not Available' && plant.sizeAvailability.L !== 'false')
      : (plant.availabilityL !== undefined ? plant.availabilityL === 'Available' : true)

    const sizeDetails = plant.sizeDetails || {
      S: plant.sizeInfoS || '1–2 ft nursery polybag sapling',
      M: plant.sizeInfoM || '3–4 ft established container tree',
      L: plant.sizeInfoL || '5–6 ft mature stock with developed rootball',
    }

    const newPlant = {
      ...plant,
      id: plant.id || uuidv4(),
      name: plant.name || 'New Plant',
      shortName: plant.shortName || plant.name || 'Plant',
      category: plant.category || 'Fruit plants',
      description: plant.description || '',
      image: plant.image || '',
      spacing: plant.spacing || '12 × 12 ft',
      plantsPerAcre: Number(plant.plantsPerAcre || 100),
      growth: plant.growth || '3–4 years',
      fertilizer: plant.fertilizer || '6 kg / year',
      maintenance: plant.maintenance || 'Moderate',
      price: Number(sizePrices.M || plant.priceM || plant.price || 100),
      sizePrices: {
        S: Number(sizePrices.S || plant.priceS || 70),
        M: Number(sizePrices.M || plant.priceM || plant.price || 100),
        L: Number(sizePrices.L || plant.priceL || 150),
      },
      sizeAvailability: {
        S: isAvailS,
        M: isAvailM,
        L: isAvailL,
      },
      sizeDetails,
      expectedYieldPerPlant: Number(plant.expectedYieldPerPlant || 0),
      yieldUnit: plant.yieldUnit || 'kg',
      expectedSellingPricePerKg: Number(plant.expectedSellingPricePerKg || 0),
      harvestsPerYear: Number(plant.harvestsPerYear || 1),
      color: plant.color || '#98bf77'
    }
    return {
      plants: [...current.plants, newPlant],
      deletedPlantIds: (current.deletedPlantIds || []).filter((pid) => pid !== newPlant.id)
    }
  })

  const updatePlant = (id, updates) => patch((current) => {
    const updatedPlants = current.plants.map((plant) => {
      if (plant.id !== id) return plant
      const currentSizePrices = plant.sizePrices || getPlantSizePrices(plant)
      const nextSizePrices = {
        S: Number(updates.sizePrices?.S ?? updates.priceS ?? currentSizePrices.S),
        M: Number(updates.sizePrices?.M ?? updates.priceM ?? updates.price ?? currentSizePrices.M),
        L: Number(updates.sizePrices?.L ?? updates.priceL ?? currentSizePrices.L),
      }
      const currentAvailability = plant.sizeAvailability || { S: true, M: true, L: true }
      const parseAvail = (val, fallback) => {
        if (val === undefined) return fallback
        return val !== false && val !== 'Not Available' && val !== 'false'
      }

      const nextAvailability = {
        S: updates.sizeAvailability?.S !== undefined 
          ? parseAvail(updates.sizeAvailability.S, currentAvailability.S) 
          : (updates.availabilityS !== undefined ? updates.availabilityS === 'Available' : currentAvailability.S),
        M: updates.sizeAvailability?.M !== undefined 
          ? parseAvail(updates.sizeAvailability.M, currentAvailability.M) 
          : (updates.availabilityM !== undefined ? updates.availabilityM === 'Available' : currentAvailability.M),
        L: updates.sizeAvailability?.L !== undefined 
          ? parseAvail(updates.sizeAvailability.L, currentAvailability.L) 
          : (updates.availabilityL !== undefined ? updates.availabilityL === 'Available' : currentAvailability.L),
      }
      const nextSizeDetails = {
        S: updates.sizeDetails?.S || updates.sizeInfoS || plant.sizeDetails?.S || '1–2 ft sapling',
        M: updates.sizeDetails?.M || updates.sizeInfoM || plant.sizeDetails?.M || '3–4 ft established',
        L: updates.sizeDetails?.L || updates.sizeInfoL || plant.sizeDetails?.L || '5–6 ft mature stock',
      }
      const price = Number(updates.price ?? nextSizePrices.M ?? plant.price)
      
      const expectedYieldPerPlant = updates.expectedYieldPerPlant !== undefined 
        ? Number(updates.expectedYieldPerPlant) 
        : Number(plant.expectedYieldPerPlant || 0)
      const expectedSellingPricePerKg = updates.expectedSellingPricePerKg !== undefined 
        ? Number(updates.expectedSellingPricePerKg) 
        : Number(plant.expectedSellingPricePerKg || 0)
      const harvestsPerYear = updates.harvestsPerYear !== undefined 
        ? Number(updates.harvestsPerYear) 
        : Number(plant.harvestsPerYear || 1)
      const yieldUnit = updates.yieldUnit || plant.yieldUnit || 'kg'
      const image = updates.image !== undefined ? updates.image : plant.image

      return {
        ...plant,
        ...updates,
        image,
        price,
        shortName: updates.shortName || updates.name || plant.shortName || plant.name,
        sizePrices: nextSizePrices,
        sizeAvailability: nextAvailability,
        sizeDetails: nextSizeDetails,
        expectedYieldPerPlant,
        expectedSellingPricePerKg,
        harvestsPerYear,
        yieldUnit
      }
    })

    // Sync updated prices into any existing draft plans
    const updatedPlans = current.plans.map((plan) => {
      if (plan.status !== 'draft') return plan
      const items = (plan.items || []).map((item) => {
        if (item.plantId === id) {
          const plantObj = updatedPlants.find((p) => p.id === id)
          const sizePrices = getPlantSizePrices(plantObj)
          const unitPrice = sizePrices[item.size || 'M'] || plantObj?.price || item.price
          return { ...item, price: unitPrice }
        }
        return item
      })
      return { ...plan, items }
    })

    return {
      plants: updatedPlants,
      plans: updatedPlans,
    }
  })

  const setPlantSizeAvailability = (plantId, size, isAvailable) => {
    updatePlant(plantId, {
      sizeAvailability: {
        [size]: Boolean(isAvailable)
      }
    })
  }

  const removePlant = (id) => patch((current) => ({
    plants: current.plants.filter((plant) => plant.id !== id),
    selectedPlantIds: (current.selectedPlantIds || []).filter((pid) => pid !== id),
    deletedPlantIds: [...(current.deletedPlantIds || []), id]
  }))

  const updateBillStatus = (id, status) => patch((current) => ({
    bills: current.bills.map((bill) => bill.id === id ? { ...bill, status } : bill),
    plans: current.plans.map((plan) => {
      const bill = current.bills.find((entry) => entry.id === id)
      return bill && plan.id === bill.planId ? { ...plan, status } : plan
    })
  }))

  const syncPlannerWithSelectedPlants = (selectedPlantIds, selectedPlantSizes) => {
    try {
      const storeState = useStore?.getState?.()
      if (storeState && typeof storeState.carrySelectedPlantsIntoPlanner === 'function') {
        storeState.carrySelectedPlantsIntoPlanner(state.plants, selectedPlantIds, selectedPlantSizes)
      }
    } catch (err) {
      console.warn('syncPlannerWithSelectedPlants error:', err)
    }
  }

  const draftPlan = getDraftPlan()

  return {
    ...state,
    patch,
    loginUser,
    logout,
    updateSettings,
    updateContent,
    addToPlan,
    togglePlantSelection,
    setPlantSelectedSize,
    isPlantSelected,
    getDraftPlan,
    draftPlan,
    updatePlanItems,
    syncPlannerCountsToDraft,
    syncPlannerWithSelectedPlants,
    savePlan,
    adminLogin,
    addPlant,
    updatePlant,
    setPlantSizeAvailability,
    removePlant,
    updateBillStatus
  }
}

export const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

/**
 * Calculates agricultural income estimate for a given plant and quantity.
 * Supports passing an overrideMarketPrice (for future market-rate API integrations).
 */
export function calculatePlantIncome(plant, quantity, overrideMarketPrice = null) {
  const qty = Number(quantity || 0)
  const yieldPerPlant = Number(plant?.expectedYieldPerPlant || 0)
  const yieldUnit = plant?.yieldUnit || 'kg'
  const sellingPrice = overrideMarketPrice !== null && overrideMarketPrice !== undefined 
    ? Number(overrideMarketPrice) 
    : Number(plant?.expectedSellingPricePerKg || 0)
  const harvestsPerYear = Number(plant?.harvestsPerYear || 1)

  const hasData = yieldPerPlant > 0 && sellingPrice > 0

  if (!hasData) {
    return {
      hasData: false,
      yieldPerPlant,
      yieldUnit,
      sellingPrice,
      harvestsPerYear,
      incomePerPlantPerHarvest: 0,
      incomePerPlantAnnual: 0,
      incomePerHarvest: 0,
      annualIncome: 0,
      statusText: 'Income data not configured'
    }
  }

  // Formula as required:
  // incomePerHarvest = quantity × expectedYieldPerPlant × expectedSellingPricePerKg
  // annualIncome = incomePerHarvest × harvestsPerYear
  const incomePerPlantPerHarvest = Math.round(yieldPerPlant * sellingPrice)
  const incomePerPlantAnnual = Math.round(incomePerPlantPerHarvest * harvestsPerYear)
  const incomePerHarvest = Math.round(qty * yieldPerPlant * sellingPrice)
  const annualIncome = Math.round(incomePerHarvest * harvestsPerYear)

  return {
    hasData: true,
    yieldPerPlant,
    yieldUnit,
    sellingPrice,
    harvestsPerYear,
    incomePerPlantPerHarvest,
    incomePerPlantAnnual,
    incomePerHarvest,
    annualIncome,
    statusText: null
  }
}

/**
 * Calculates the Live Estimate breakdown:
 * 1. Plant Billing: plantTotal = quantity * adminControlledPlantPrice
 * 2. Optional Add-ons: Transportation, Fencing, Drip Irrigation, Honey Bee Box (controlled by Admin)
 * 3. Final Investment Summary: plantCost + selected add-ons
 * 4. Estimated Income breakdown and Total Estimated Annual Income
 */
export function calculateLiveEstimate(plan, plants, settings, selectedAddOns = { transportation: false, fencing: false, dripIrrigation: false, honeyBeeBox: false }) {
  const items = plan?.items || []

  // 1. Plant Billing
  const plantCost = items.reduce((sum, item) => {
    const plant = plants.find((p) => p.id === item.plantId)
    const sizePrices = getPlantSizePrices(plant)
    const unitPrice = item.price || (item.size && sizePrices[item.size]) || plant?.price || 0
    return sum + (unitPrice * Number(item.quantity || 0))
  }, 0)

  // 2. Optional Add-on Prices (Admin Controlled)
  const transportationPrice = Number(settings?.transportation ?? 5000)
  const fencingPrice = Number(settings?.fencing ?? 25000)
  const dripIrrigationPrice = Number(settings?.dripIrrigation ?? 35000)
  const honeyBeeBoxPrice = Number(settings?.honeyBeeBox ?? 8000)

  const transportationCost = selectedAddOns?.transportation ? transportationPrice : 0
  const fencingCost = selectedAddOns?.fencing ? fencingPrice : 0
  const dripIrrigationCost = selectedAddOns?.dripIrrigation ? dripIrrigationPrice : 0
  const honeyBeeBoxCost = selectedAddOns?.honeyBeeBox ? honeyBeeBoxPrice : 0

  // Total Estimated Investment
  const totalInvestment = plantCost + transportationCost + fencingCost + dripIrrigationCost + honeyBeeBoxCost

  // 3. Estimated Income per Plant, Historical Trend (2021–2025) & Future Range Estimates
  let totalAnnualIncome = 0
  let totalConservativeAnnual = 0
  let totalHigherRangeAnnual = 0
  let totalAnnualIncomePerHarvest = 0

  const plantIncomes = items.map((item) => {
    const plant = plants.find((p) => p.id === item.plantId)
    const incomeData = calculatePlantIncome(plant, item.quantity)
    const rawHistorical = getPlantHistoricalData(plant)
    
    // Historical trends from 2021 to 2025
    let historicalTrend = null
    if (Array.isArray(rawHistorical) && rawHistorical.length > 0) {
      historicalTrend = rawHistorical.map((h) => {
        const estInc = Math.round(Number(item.quantity || 0) * Number(h.expectedYield || 0) * Number(h.referenceMarketPrice || 0))
        return {
          ...h,
          estimatedIncome: estInc
        }
      })
    }

    // Future Range Estimates
    let futureRange = null
    if (incomeData.hasData) {
      const expected = incomeData.annualIncome
      const conservative = Math.round(expected * 0.80)
      const higherRange = Math.round(expected * 1.20)
      futureRange = {
        hasData: true,
        conservative,
        expected,
        higherRange,
        conservativePerPlant: Math.round(incomeData.incomePerPlantAnnual * 0.80),
        higherRangePerPlant: Math.round(incomeData.incomePerPlantAnnual * 1.20),
        statusText: null
      }
      totalAnnualIncome += expected
      totalConservativeAnnual += conservative
      totalHigherRangeAnnual += higherRange
      totalAnnualIncomePerHarvest += incomeData.incomePerHarvest
    } else {
      futureRange = {
        hasData: false,
        conservative: 0,
        expected: 0,
        higherRange: 0,
        statusText: 'Market data unavailable for this estimate.'
      }
    }

    return {
      plantId: item.plantId,
      plantName: plant?.name || 'Plant',
      shortName: plant?.shortName || plant?.name,
      category: plant?.category || 'Fruit plants',
      quantity: item.quantity,
      size: item.size || 'M',
      incomeData,
      historicalTrend,
      futureRange
    }
  })

  // Estimated Net Return
  const estimatedNetAnnual = totalAnnualIncome
  const firstYearNetReturn = totalAnnualIncome - totalInvestment

  return {
    plantCost,
    totalPlantCost: plantCost,
    selectedAddOns,
    addOnPrices: {
      transportation: transportationPrice,
      fencing: fencingPrice,
      dripIrrigation: dripIrrigationPrice,
      honeyBeeBox: honeyBeeBoxPrice
    },
    addOnCosts: {
      transportation: transportationCost,
      fencing: fencingCost,
      dripIrrigation: dripIrrigationCost,
      honeyBeeBox: honeyBeeBoxCost
    },
    transportationCost,
    fencingCost,
    dripIrrigationCost,
    honeyBeeBoxCost,
    totalInvestment,
    total: totalInvestment,
    plantIncomes,
    totalAnnualIncome,
    totalAnnualIncomePerHarvest,
    totalConservativeAnnual,
    totalHigherRangeAnnual,
    estimatedNetAnnual,
    firstYearNetReturn,
    macroContext: INDIAN_MACRO_CONTEXT
  }
}

// Retained for backwards compatibility
export function calculatePlan(plan, plants, settings) {
  const items = plan?.items || []
  const subtotal = items.reduce((sum, item) => {
    const plant = plants.find((p) => p.id === item.plantId)
    const sizePrices = getPlantSizePrices(plant)
    const unitPrice = item.price || (item.size && sizePrices[item.size]) || plant?.price || 0
    return sum + unitPrice * item.quantity
  }, 0)
  const services = Number(settings.serviceCharge || 0)
  const fertilizer = Math.round(subtotal * 0.06)
  const transportation = Number(settings.transportation || 0)
  const otherCharges = Number(settings.otherCharges || 0)
  const discount = Number(settings.discount || 0)
  const taxable = Math.max(0, subtotal + services + fertilizer + transportation + otherCharges - discount)
  const tax = Math.round(taxable * Number(settings.gstPercent || 0) / 100)
  return { subtotal, services, fertilizer, transportation, otherCharges, discount, tax, total: taxable + tax }
}
