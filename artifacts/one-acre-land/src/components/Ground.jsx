import { useStore, isPointInRotatedRect } from '../store'
import { getPlantColor, CROP_COLORS } from '../constants/plantColors'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'

export default function Ground() {
  const { 
    landSideFt, interiorSideFt, cropZones, borderZone, libraryPlants,
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

  const borderColor = getPlantColor(borderZone?.type || 'Teak', libraryPlants)
  const borderWidthFt = (landSideFt - interiorSideFt) / 2

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

      {/* Boundary Strip (Perimeter Buffer) Tinted in Border Plant's Distinct Color */}
      {borderWidthFt > 0 && (
        <group>
          {/* North strip */}
          <mesh position={[0, 0.015, -(landSideFt / 2 - borderWidthFt / 2)]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[landSideFt, borderWidthFt]} />
            <meshStandardMaterial color={borderColor} transparent opacity={0.32} roughness={0.9} />
          </mesh>
          {/* South strip */}
          <mesh position={[0, 0.015, (landSideFt / 2 - borderWidthFt / 2)]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[landSideFt, borderWidthFt]} />
            <meshStandardMaterial color={borderColor} transparent opacity={0.32} roughness={0.9} />
          </mesh>
          {/* West strip */}
          <mesh position={[-(landSideFt / 2 - borderWidthFt / 2), 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[borderWidthFt, interiorSideFt]} />
            <meshStandardMaterial color={borderColor} transparent opacity={0.32} roughness={0.9} />
          </mesh>
          {/* East strip */}
          <mesh position={[(landSideFt / 2 - borderWidthFt / 2), 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[borderWidthFt, interiorSideFt]} />
            <meshStandardMaterial color={borderColor} transparent opacity={0.32} roughness={0.9} />
          </mesh>
        </group>
      )}
      
      {/* Physical Outer Boundary (Wooden Fence / Berm) */}
      <mesh position={[0, 0.5, landSideFt/2]}>
        <boxGeometry args={[landSideFt, 1, 1]} />
        <meshStandardMaterial color={borderColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, -landSideFt/2]}>
        <boxGeometry args={[landSideFt, 1, 1]} />
        <meshStandardMaterial color={borderColor} roughness={0.8} />
      </mesh>
      <mesh position={[landSideFt/2, 0.5, 0]}>
        <boxGeometry args={[1, 1, landSideFt]} />
        <meshStandardMaterial color={borderColor} roughness={0.8} />
      </mesh>
      <mesh position={[-landSideFt/2, 0.5, 0]}>
        <boxGeometry args={[1, 1, landSideFt]} />
        <meshStandardMaterial color={borderColor} roughness={0.8} />
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
        const cropColor = getPlantColor(zone.type, libraryPlants);
        
        return (
          <group 
            key={zone.id} 
            position={[zone.block.x, 0.02, zone.block.z]}
            onClick={(e) => { e.stopPropagation(); setSelectedCropZoneId(zone.id); }}
          >
            {/* Distinct Colored Agricultural Crop Bed */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[zone.block.width - 2, zone.block.length - 2]} />
              <meshStandardMaterial 
                color={cropColor} 
                roughness={0.8} 
                transparent={true} 
                opacity={isSelected ? 0.68 : 0.38}
              />
            </mesh>

            {/* Distinct Zone Wireframe Grid / Tilled Rows */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
              <planeGeometry args={[zone.block.width - 2, zone.block.length - 2]} />
              <meshStandardMaterial 
                color={cropColor} 
                roughness={0.9} 
                wireframe={true} 
                transparent={true} 
                opacity={isSelected ? 0.85 : 0.5}
              />
            </mesh>

            {/* Zone Ground Identifier Badge */}
            <Html 
              position={[-(zone.block.width / 2) + Math.min(20, Math.max(10, zone.block.width * 0.15)), 0.25, -(zone.block.length / 2) + Math.min(16, Math.max(8, zone.block.length * 0.2))]} 
              center 
              zIndexRange={[60, 0]}
            >
              <div 
                onClick={(e) => { e.stopPropagation(); setSelectedCropZoneId(isSelected ? null : zone.id); }}
                style={{
                  background: isSelected ? 'rgba(15, 26, 21, 0.98)' : 'rgba(15, 26, 21, 0.88)',
                  border: isSelected ? `2px solid #ffffff` : `1.5px solid ${cropColor}`,
                  borderRadius: '6px',
                  padding: '3px 8px',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  boxShadow: `0 3px 10px ${cropColor}66`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                }}
                title={`Click to focus on ${zone.type} zone`}
              >
                <span 
                  style={{ 
                    width: '9px', 
                    height: '9px', 
                    borderRadius: '50%', 
                    background: cropColor, 
                    boxShadow: `0 0 8px ${cropColor}`,
                    flexShrink: 0
                  }} 
                />
                <span>{zone.type}</span>
                <span style={{ color: cropColor, fontWeight: 700, fontSize: '0.7rem' }}>
                  ({placedCount} plants)
                </span>
              </div>
            </Html>
            
            {isSelected && (
              <Html position={[0, 6, 0]} center zIndexRange={[100, 0]}>
                <div className="info-card" style={{ borderLeft: `4px solid ${cropColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cropColor }} />
                    <h4 style={{ margin: 0, color: cropColor }}>{zone.type}</h4>
                  </div>
                  <div className="info-row"><span>Placed Plants</span><span style={{ color: cropColor, fontWeight: 'bold' }}>{placedCount}</span></div>
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
