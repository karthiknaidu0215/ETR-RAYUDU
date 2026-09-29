import { useStore } from '../store'
import * as THREE from 'three'

export default function Infrastructure() {
  const { 
    infrastructure, draftRoad, activeDrawTool, 
    selectedInfraId, setSelectedInfraId, 
    setDraggingInfraId
  } = useStore()

  return (
    <group>
      {infrastructure.map(inf => {
        const isSelected = selectedInfraId === inf.id;
        const isRound = inf.type === 'Borewell' || inf.type === 'Water Tank';

        const handlePointerDown = (e) => {
          e.stopPropagation();
          setSelectedInfraId(inf.id);
          if (e.point) {
            setDraggingInfraId(inf.id, inf.x - e.point.x, inf.z - e.point.z);
          } else {
            setDraggingInfraId(inf.id, 0, 0);
          }
        }

        let model = null;

        if (inf.type === 'Road') {
          model = (
            <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
              <planeGeometry args={[inf.width, inf.length]} />
              <meshStandardMaterial color="#3f3f46" roughness={1} metalness={0} />
            </mesh>
          )
        }
        else if (inf.type === 'Farm House') {
          model = (
            <group>
              <mesh position={[0, 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[inf.width, 8, inf.length]} />
                <meshStandardMaterial color="#e2e8f0" roughness={1} />
              </mesh>
              <mesh position={[0, 10, 0]} castShadow receiveShadow>
                <coneGeometry args={[Math.max(inf.width, inf.length) * 0.7, 6, 4]} rotation={[0, Math.PI/4, 0]} />
                <meshStandardMaterial color="#881337" roughness={0.9} />
              </mesh>
            </group>
          )
        }
        else if (inf.type === 'Pond') {
          model = (
            <group>
              {/* Deep Water base */}
              <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[inf.width, inf.length]} />
                <meshStandardMaterial color="#001a33" roughness={1} />
              </mesh>
              {/* Realistic Water Surface */}
              <mesh position={[0, 0.4, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[inf.width, inf.length]} />
                <meshPhysicalMaterial 
                  color="#0ea5e9" 
                  transmission={0.9} 
                  opacity={1} 
                  metalness={0.1} 
                  roughness={0.1} 
                  ior={1.33} 
                  thickness={2}
                />
              </mesh>
              {/* Pond berm/border */}
              <lineSegments rotation={[-Math.PI/2, 0, 0]} position={[0, 0.5, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(inf.width + 1, inf.length + 1)]} />
                <lineBasicMaterial color="#5c4033" linewidth={4} />
              </lineSegments>
            </group>
          )
        }
        else if (inf.type === 'Storage Shed') {
          model = (
            <group>
              <mesh position={[0, 5, 0]} castShadow receiveShadow>
                <boxGeometry args={[inf.width, 10, inf.length]} />
                <meshStandardMaterial color="#78716c" roughness={0.8} />
              </mesh>
              <mesh position={[0, 10.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[inf.width + 2, 1, inf.length + 2]} />
                <meshStandardMaterial color="#3f3f46" roughness={0.6} metalness={0.5} />
              </mesh>
            </group>
          )
        }
        else if (inf.type === 'Water Tank') {
          model = (
            <group>
              <mesh position={[0, 5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1, 1, 10, 8]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
              </mesh>
              <mesh position={[0, 12, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[inf.radius, inf.radius, 6, 32]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )
        }
        else if (inf.type === 'Pump Room') {
          model = (
            <group>
              <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[inf.width, 6, inf.length]} />
                <meshStandardMaterial color="#d6d3d1" roughness={0.9} />
              </mesh>
            </group>
          )
        }
        else if (inf.type === 'Borewell') {
          model = (
            <group>
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1, 1, 2, 16]} />
                <meshStandardMaterial color="#57534e" roughness={1} />
              </mesh>
              <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
              </mesh>
            </group>
          )
        }
        else if (inf.type === 'Gate') {
          model = (
            <group>
              <mesh position={[0, 0.5, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[inf.width, inf.length]} />
                <meshStandardMaterial color="#52525b" roughness={0.9} />
              </mesh>
              <mesh position={[-inf.width/2, 5, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 10, 1]} />
                <meshStandardMaterial color="#451a03" roughness={1} />
              </mesh>
              <mesh position={[inf.width/2, 5, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 10, 1]} />
                <meshStandardMaterial color="#451a03" roughness={1} />
              </mesh>
            </group>
          )
        }
        else if (inf.type === 'Custom Obstacle') {
          model = (
            <group position={[0, 0.05, 0]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[inf.width, inf.length]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} depthWrite={false} />
              </mesh>
              <lineSegments rotation={[-Math.PI/2, 0, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(inf.width, inf.length)]} />
                <lineBasicMaterial color="#d97706" linewidth={2} />
              </lineSegments>
            </group>
          )
        }

        return (
          <group
            key={inf.id}
            position={[inf.x, 0.1, inf.z]}
            rotation={[0, inf.rotation || 0, 0]}
            onPointerDown={handlePointerDown}
          >
            {/* Selection outline — clean glow, NO popup */}
            {isSelected && (
              <lineSegments rotation={[-Math.PI/2, 0, 0]} position={[0, 0.6, 0]}>
                {isRound ? (
                  <edgesGeometry args={[new THREE.CircleGeometry((inf.radius || inf.width/2) + 1.5, 32)]} />
                ) : (
                  <edgesGeometry args={[new THREE.PlaneGeometry(inf.width + 3, inf.length + 3)]} />
                )}
                <lineBasicMaterial color="#10b981" linewidth={5} />
              </lineSegments>
            )}

            {/* Corner dots for selected non-round objects */}
            {isSelected && !isRound && (
              <>
                {[[-inf.width/2,-inf.length/2],[inf.width/2,-inf.length/2],[inf.width/2,inf.length/2],[-inf.width/2,inf.length/2]].map(([cx,cz],i) => (
                  <mesh key={i} position={[cx, 1, cz]}>
                    <sphereGeometry args={[1.2, 8, 8]} />
                    <meshBasicMaterial color="#10b981" />
                  </mesh>
                ))}
              </>
            )}

            {/* Invisible hitbox for dragging */}
            <mesh position={[0, 4, 0]} visible={false}>
              {isRound ? (
                <cylinderGeometry args={[inf.radius + 2, inf.radius + 2, 12]} />
              ) : (
                <boxGeometry args={[inf.width + 4, 12, inf.length + 4]} />
              )}
              <meshBasicMaterial color="red" />
            </mesh>

            {model}
          </group>
        )
      })}

      {/* Draft Road preview while drawing */}
      {draftRoad && activeDrawTool === 'Road' && (() => {
        const dx = draftRoad.endX - draftRoad.startX;
        const dz = draftRoad.endZ - draftRoad.startZ;
        const length = Math.hypot(dx, dz);
        if (length < 0.1) return null;
        const angle = Math.atan2(dx, dz);
        const cx = (draftRoad.startX + draftRoad.endX) / 2;
        const cz = (draftRoad.startZ + draftRoad.endZ) / 2;
        return (
          <group position={[cx, 0.2, cz]} rotation={[0, angle, 0]}>
            <mesh rotation={[-Math.PI/2, 0, 0]}>
              <planeGeometry args={[12, length]} />
              <meshBasicMaterial color="#a1a1aa" transparent opacity={0.5} depthWrite={false} />
            </mesh>
          </group>
        )
      })()}
    </group>
  )
}
