import { useStore, isPointInRotatedRect } from '../store'
import { CROP_COLORS } from './Stats'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useState } from 'react'

function Plant({ plant, allPlants, dimmed }) {
  const { 
    selectedPlantId, setSelectedPlantId, 
    draggingPlantId, setDraggingPlantId,
    measuring, addMeasurePoint,
    removePlant, duplicatePlant
  } = useStore()
  
  const [showDistance, setShowDistance] = useState(false);

  const isDragging = draggingPlantId === plant.id
  const isSelected = selectedPlantId === plant.id
  
  const nearestPlant = useMemo(() => {
    if (!isDragging && !isSelected && !showDistance) return null;
    let minDist = Infinity;
    let nearest = null;
    
    allPlants.forEach(p => {
      if (p.id !== plant.id && p.zoneId === plant.zoneId) {
        const dist = Math.hypot(plant.x - p.x, plant.z - p.z)
        if (dist < minDist) {
          minDist = dist;
          nearest = { p, dist };
        }
      }
    })
    return nearest;
  }, [isDragging, isSelected, showDistance, plant.x, plant.z, allPlants, plant.id, plant.zoneId])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (measuring) {
      addMeasurePoint(plant.id)
    } else {
      setSelectedPlantId(plant.id)
      if (e.point) {
        setDraggingPlantId(plant.id, plant.x - e.point.x, plant.z - e.point.z)
      } else {
        setDraggingPlantId(plant.id, 0, 0)
      }
    }
  }

  const matProps = {
    transparent: dimmed,
    opacity: dimmed ? 0.3 : 1
  }

  const renderPlantShape = () => {
    const baseColor = CROP_COLORS[plant.type] || CROP_COLORS.default;
    const selectedColor = '#ffffff';
    const trunkColor = '#3f2a14'; // Dark organic bark

    // Base tree material properties for realism
    const leafProps = {
      ...matProps,
      roughness: 0.7,
      metalness: 0.05,
    };
    const barkProps = {
      ...matProps,
      roughness: 0.95,
      metalness: 0,
    };

    const typeLower = (plant.type || '').toLowerCase();

    if (typeLower.includes('mango')) {
      return (
        <>
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.5, 0.7, 5, 8]} />
            <meshStandardMaterial color={trunkColor} {...barkProps} />
          </mesh>
          {/* Dense, wide, rounded canopy */}
          <mesh position={[0, 6.5, 0]} castShadow receiveShadow={!dimmed}>
            <dodecahedronGeometry args={[3.5, 2]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('banana')) {
      return (
        <>
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.5, 0.7, 5, 8]} />
            <meshStandardMaterial color="#65a30d" {...leafProps} />
          </mesh>
          <mesh position={[0, 6, 0]} castShadow receiveShadow={!dimmed}>
            <coneGeometry args={[3, 8, 5]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('arecanut')) {
      return (
        <>
          <mesh position={[0, 7, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.2, 0.3, 14, 8]} />
            <meshStandardMaterial color='#713f12' {...barkProps} />
          </mesh>
          <mesh position={[0, 14.5, 0]} castShadow receiveShadow={!dimmed}>
            <dodecahedronGeometry args={[2.2, 1]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('guava')) {
      return (
        <>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color={trunkColor} {...barkProps} />
          </mesh>
          <mesh position={[0, 4.5, 0]} castShadow receiveShadow={!dimmed}>
            <dodecahedronGeometry args={[3, 1]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('mosambi') || typeLower.includes('citrus')) {
      return (
        <>
          <mesh position={[0, 2, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
            <meshStandardMaterial color={trunkColor} {...barkProps} />
          </mesh>
          <mesh position={[0, 5.5, 0]} castShadow receiveShadow={!dimmed}>
            <dodecahedronGeometry args={[2.8, 2]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('coconut')) {
      return (
        <>
          <mesh position={[0, 6, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.35, 0.5, 12, 8]} />
            <meshStandardMaterial color='#78350f' {...barkProps} />
          </mesh>
          <mesh position={[0, 12, 0]} scale={[1, 0.6, 1]} castShadow receiveShadow={!dimmed}>
            <dodecahedronGeometry args={[4, 1]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('moringa')) {
      return (
        <>
          <mesh position={[0, 3, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.3, 0.45, 6, 8]} />
            <meshStandardMaterial color={trunkColor} {...barkProps} />
          </mesh>
          <mesh position={[0, 7, 0]} castShadow receiveShadow={!dimmed}>
            <dodecahedronGeometry args={[2.5, 1]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    if (typeLower.includes('jasmine') || typeLower.includes('flower')) {
      return (
        <>
          <mesh position={[0, 1, 0]} castShadow receiveShadow={!dimmed}>
            <cylinderGeometry args={[0.15, 0.25, 2, 6]} />
            <meshStandardMaterial color={trunkColor} {...barkProps} />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow={!dimmed}>
            <sphereGeometry args={[1.8, 8, 8]} />
            <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        </>
      )
    }

    // Default / Teak / Timber
    return (
      <>
        <mesh position={[0, 6, 0]} castShadow receiveShadow={!dimmed}>
          <cylinderGeometry args={[0.6, 0.8, 12, 8]} />
          <meshStandardMaterial color={trunkColor} {...barkProps} />
        </mesh>
        <mesh position={[0, 14, 0]} castShadow receiveShadow={!dimmed}>
          <coneGeometry args={[3, 8, 7]} />
          <meshStandardMaterial color={isSelected ? selectedColor : baseColor} {...leafProps} emissive={isSelected ? baseColor : '#000000'} emissiveIntensity={isSelected ? 0.3 : 0} />
        </mesh>
      </>
    )
  }

  const isBorderPlant = plant.zoneId === 'border-zone'

  return (
    <group position={[plant.x, 0, plant.z]}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshBasicMaterial color="yellow" side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {isSelected && (
        <Html position={[0, 14, 0]} center zIndexRange={[100, 0]}>
          {isBorderPlant ? (
            <div className="cad-toolbar" onPointerDown={e => e.stopPropagation()}>
              <div className="cad-toolbar-header">BORDER {plant.type.toUpperCase()}</div>
              
              <div style={{display:'flex', gap:'5px', flexDirection:'column'}}>
                <button 
                  className="btn btn-secondary" 
                  onPointerDown={(e) => { e.stopPropagation(); setDraggingPlantId(plant.id); }}
                >
                  Move (Drag)
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowDistance(!showDistance)}
                >
                  {showDistance ? 'Hide Distance' : 'Distance'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => duplicatePlant(plant.id)}
                >
                  Duplicate
                </button>
                <button 
                  className="btn" 
                  style={{ background: 'var(--danger)' }} 
                  onClick={() => removePlant(plant.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="info-card">
              <h4>{plant.type}</h4>
              <div className="info-row"><span>ID</span><span>{plant.id.substring(0,6)}</span></div>
              {nearestPlant && (
                <div className="info-row"><span>Nearest Distance</span><span>{nearestPlant.dist.toFixed(1)} ft</span></div>
              )}
              <div className="info-row"><span>Status</span><span style={{color: '#10b981'}}>Active</span></div>
              <div 
                style={{ pointerEvents: 'auto', cursor: 'grab', background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap', marginTop: '10px', textAlign: 'center' }}
                onPointerDown={(e) => { e.stopPropagation(); setDraggingPlantId(plant.id); }}
              >
                CLICK & DRAG TO MOVE
              </div>
            </div>
          )}
        </Html>
      )}
      
      {(isDragging || showDistance) && nearestPlant && (
        <group>
          <Line 
            points={[[0, 1, 0], [nearestPlant.p.x - plant.x, 1, nearestPlant.p.z - plant.z]]} 
            color="#facc15" 
            lineWidth={3}
          />
          <Html position={[(nearestPlant.p.x - plant.x)/2, 3, (nearestPlant.p.z - plant.z)/2]} center zIndexRange={[100, 0]}>
            <div style={{ background: 'rgba(0,0,0,0.85)', color: '#facc15', padding: '4px 8px', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', border: '1px solid #facc15' }}>
              {nearestPlant.dist.toFixed(1)} FT
            </div>
          </Html>
        </group>
      )}

      <mesh position={[0, 4, 0]} onPointerDown={handlePointerDown} visible={false}>
        <cylinderGeometry args={[4, 4, 10]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {renderPlantShape()}
    </group>
  )
}

export default function PlantModels() {
  const { measuring, measurePoints, plants, infrastructure, selectedCropZoneId } = useStore()
  
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

  const measureLine = useMemo(() => {
    if (measuring && measurePoints.length === 2) {
      const p1 = visiblePlants.find(p => p.id === measurePoints[0])
      const p2 = visiblePlants.find(p => p.id === measurePoints[1])
      if (p1 && p2) {
        const dist = Math.hypot(p1.x - p2.x, p1.z - p2.z)
        return { p1, p2, dist }
      }
    }
    return null
  }, [measuring, measurePoints, visiblePlants])

  return (
    <group>
      {visiblePlants.map(p => (
        <Plant 
          key={p.id} 
          plant={p} 
          allPlants={visiblePlants} 
          dimmed={selectedCropZoneId && p.zoneId !== selectedCropZoneId} 
        />
      ))}
      
      {measureLine && (
        <group>
          <Line 
            points={[[measureLine.p1.x, 1, measureLine.p1.z], [measureLine.p2.x, 1, measureLine.p2.z]]} 
            color="cyan" 
            lineWidth={5}
          />
          <Html position={[(measureLine.p1.x + measureLine.p2.x)/2, 3, (measureLine.p1.z + measureLine.p2.z)/2]} center>
            <div style={{ background: 'cyan', color: 'black', padding: '10px 20px', borderRadius: '8px', fontWeight: '900', fontSize: '1.5rem', whiteSpace: 'nowrap', border: '3px solid black' }}>
              MEASUREMENT: {measureLine.dist.toFixed(1)} FT
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
