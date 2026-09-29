import { useStore, isPointInRotatedRect } from '../store'
import { CROP_COLORS } from './Stats'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'

export default function Ground() {
  const { 
    landSideFt, interiorSideFt, cropZones, 
    draggingPlantId, setDraggingPlantId, updatePlantPosition, 
    plants, manualPlacementZoneId, placeManualPlant,
    activeDrawTool, draftRoad, setDraftRoad, addDrawnRoad,
    draggingInfraId, setDraggingInfraId, infrastructure, updateInfrastructure,
    selectedInfraId, setSelectedInfraId,
    selectedCropZoneId, setSelectedCropZoneId, clearSelection,
    dragOffsetX, dragOffsetZ
  } = useStore()
  
  const visiblePlants = useMemo(() => {
    return plants.filter(p => {
      let isRemoved = false;
      for (const inf of infrastructure) {
        if (inf.type === 'Borewell' || inf.type === 'Water Tank') {
          const dist = Math.hypot(p.x - inf.x, p.z - inf.z);
          if (dist <= (inf.radius || inf.width/2)) { isRemoved = true; break; }
        } else {
          if (isPointInRotatedRect(p.x, p.z, inf.x, inf.z, inf.width, inf.length, inf.rotation)) {
            isRemoved = true; break;
          }
        }
      }
      return !isRemoved;
    });
  }, [plants, infrastructure]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const { x, z } = e.point;

    if (activeDrawTool === 'Road') {
      setDraftRoad({ startX: x, startZ: z, endX: x, endZ: z });
      return;
    }

    if (manualPlacementZoneId && !draggingPlantId && !draggingInfraId) {
      placeManualPlant(x, z);
    }
  }

  const handlePointerMove = (e) => {
    const { x, z } = e.point;

    if (draftRoad && activeDrawTool === 'Road') {
      e.stopPropagation();
      setDraftRoad({ ...draftRoad, endX: x, endZ: z });
      return;
    }

    if (draggingInfraId) {
      e.stopPropagation();
      const inf = infrastructure.find(i => i.id === draggingInfraId);
      if (!inf) return;
      
      let newX = x + dragOffsetX;
      let newZ = z + dragOffsetZ;

      if (inf.type === 'Gate') {
        const halfL = landSideFt / 2;
        newX = Math.max(-halfL, Math.min(halfL, newX));
        newZ = Math.max(-halfL, Math.min(halfL, newZ));
        
        const distToLeft = Math.abs(newX - (-halfL));
        const distToRight = Math.abs(newX - halfL);
        const distToTop = Math.abs(newZ - (-halfL));
        const distToBottom = Math.abs(newZ - halfL);
        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
        
        if (minDist === distToLeft) { newX = -halfL; inf.rotation = 0; }
        else if (minDist === distToRight) { newX = halfL; inf.rotation = 0; }
        else if (minDist === distToTop) { newZ = -halfL; inf.rotation = Math.PI/2; }
        else { newZ = halfL; inf.rotation = Math.PI/2; }
      }

      updateInfrastructure(draggingInfraId, { x: newX, z: newZ, rotation: inf.rotation || 0 });
      return;
    }

    if (draggingPlantId) {
      e.stopPropagation()
      const plant = plants.find(p => p.id === draggingPlantId);
      if (!plant) return;

      let newX = x + dragOffsetX;
      let newZ = z + dragOffsetZ;
      
      if (plant.zoneId === 'border-zone') {
        const halfL = landSideFt / 2;
        const halfI = interiorSideFt / 2;
        newX = Math.max(-halfL + 0.5, Math.min(halfL - 0.5, newX));
        newZ = Math.max(-halfL + 0.5, Math.min(halfL - 0.5, newZ));
        
        if (newX > -halfI && newX < halfI && newZ > -halfI && newZ < halfI) {
          const distToLeft = Math.abs(newX - (-halfI));
          const distToRight = Math.abs(newX - halfI);
          const distToTop = Math.abs(newZ - (-halfI));
          const distToBottom = Math.abs(newZ - halfI);
          const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
          
          if (minDist === distToLeft) newX = -halfI - 0.5;
          else if (minDist === distToRight) newX = halfI + 0.5;
          else if (minDist === distToTop) newZ = -halfI - 0.5;
          else newZ = halfI + 0.5;
        }
      } else {
        const zone = cropZones.find(z => z.id === plant.zoneId);
        if (!zone) return;
        newX = Math.max(zone.block.minX + 0.5, Math.min(zone.block.maxX - 0.5, newX));
        newZ = Math.max(zone.block.minZ + 0.5, Math.min(zone.block.maxZ - 0.5, newZ));
      }
      
      let canMove = true;
      plants.forEach(p => {
        if (p.id !== draggingPlantId) {
          if (Math.hypot(newX - p.x, newZ - p.z) < 1.0) canMove = false;
        }
      });
      
      if (canMove) {
        updatePlantPosition(draggingPlantId, newX, newZ)
      }
    }
  }

  const handlePointerUp = () => {
    if (draftRoad && activeDrawTool === 'Road') {
      const dx = draftRoad.endX - draftRoad.startX;
      const dz = draftRoad.endZ - draftRoad.startZ;
      const dist = Math.hypot(dx, dz);
      
      if (dist > 2) { 
        addDrawnRoad(draftRoad.startX, draftRoad.startZ, draftRoad.endX, draftRoad.endZ, 12);
      } else {
        setDraftRoad(null);
      }
    }

    if (draggingPlantId) setDraggingPlantId(null);
    if (draggingInfraId) setDraggingInfraId(null);
  }

  const handleGroundClick = () => {
    if (!manualPlacementZoneId && !activeDrawTool) {
      clearSelection();
    }
  }

  const outerBoundaryGeom = useMemo(() => new THREE.PlaneGeometry(landSideFt, landSideFt), [landSideFt])
  const innerBoundaryGeom = useMemo(() => new THREE.PlaneGeometry(interiorSideFt, interiorSideFt), [interiorSideFt])

  return (
    <group>
      {/* Realistic Grass / Soil Base */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow 
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerDown={handlePointerDown}
        onClick={handleGroundClick}
      >
        <planeGeometry args={[landSideFt, landSideFt]} />
        <meshStandardMaterial color="#425035" roughness={1} metalness={0} />
      </mesh>
      
      {/* Physical Outer Boundary (Wooden Fence / Berm) */}
      <mesh position={[0, 0.5, landSideFt/2]}>
        <boxGeometry args={[landSideFt, 1, 1]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, -landSideFt/2]}>
        <boxGeometry args={[landSideFt, 1, 1]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      <mesh position={[landSideFt/2, 0.5, 0]}>
        <boxGeometry args={[1, 1, landSideFt]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      <mesh position={[-landSideFt/2, 0.5, 0]}>
        <boxGeometry args={[1, 1, landSideFt]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>

      {/* Subtle Inner Boundary (Tilled edge) */}
      <mesh position={[0, 0.1, interiorSideFt/2]}>
        <boxGeometry args={[interiorSideFt, 0.2, 0.5]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      <mesh position={[0, 0.1, -interiorSideFt/2]}>
        <boxGeometry args={[interiorSideFt, 0.2, 0.5]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      <mesh position={[interiorSideFt/2, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.2, interiorSideFt]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      <mesh position={[-interiorSideFt/2, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.2, interiorSideFt]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      
      {cropZones.map(zone => {
        const isSelected = selectedCropZoneId === zone.id;
        const placedCount = visiblePlants.filter(p => p.zoneId === zone.id).length;
        const cropColor = CROP_COLORS[zone.type] || CROP_COLORS.default;
        
        return (
          <group 
            key={zone.id} 
            position={[zone.block.x, 0.02, zone.block.z]}
            onClick={(e) => { e.stopPropagation(); setSelectedCropZoneId(zone.id); }}
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[zone.block.width - 2, zone.block.length - 2]} />
              <meshStandardMaterial 
                color={isSelected ? cropColor : '#3e2723'} 
                roughness={1} 
                transparent={isSelected} 
                opacity={isSelected ? 0.6 : 1}
              />
            </mesh>
            {/* Tilled soil rows (subtle lines) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
              <planeGeometry args={[zone.block.width - 2, zone.block.length - 2]} />
              <meshStandardMaterial 
                color="#2d1a11" 
                roughness={1} 
                wireframe={true} 
                transparent opacity={0.15}
              />
            </mesh>
            
            {isSelected && (
              <Html position={[0, 5, 0]} center zIndexRange={[100, 0]}>
                <div className="info-card" style={{ borderLeft: `3px solid ${cropColor}` }}>
                  <h4 style={{ color: cropColor }}>{zone.type}</h4>
                  <div className="info-row"><span>Plants</span><span style={{ color: cropColor, fontWeight: 'bold' }}>{placedCount}</span></div>
                  <div className="info-row"><span>Spacing</span><span>{zone.p2p}ft × {zone.r2r}ft</span></div>
                  <div className="info-row"><span>Area</span><span>{Math.round(zone.block.area).toLocaleString()} sq.ft</span></div>
                  <div className="info-row"><span>Allocation</span><span>{zone.percentage}%</span></div>
                </div>
              </Html>
            )}
          </group>
        )
      })}
      
      {/* Subtle grid helper to give scale, but mostly obscured by soil */}
      <gridHelper 
        args={[landSideFt, Math.floor(landSideFt / 10), '#3b432f', '#3b432f']} 
        position={[0, 0.03, 0]} 
      />
    </group>
  )
}
