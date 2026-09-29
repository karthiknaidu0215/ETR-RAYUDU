import { useStore } from '../store'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'

export default function Obstacles() {
  const { obstacles, draftObstacle, activeObstacleTool, obstacleConfig } = useStore()
  
  return (
    <group>
      {/* Placed Obstacles */}
      {obstacles.map(obs => {
        if (obs.type === 'Borewell') {
          return (
            <group key={obs.id} position={[obs.x, 0.1, obs.z]}>
              {/* Clearance Radius Visualization */}
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[obs.radius, 32]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.2} depthWrite={false} />
              </mesh>
              <lineSegments rotation={[-Math.PI/2, 0, 0]}>
                <edgesGeometry args={[new THREE.CircleGeometry(obs.radius, 32)]} />
                <lineBasicMaterial color="#ef4444" />
              </lineSegments>
              {/* Physical Borewell Structure */}
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[1, 1, 2, 16]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
              <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
              <Html position={[0, 6, 0]} center zIndexRange={[100, 0]}>
                <div style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  BOREWELL
                </div>
              </Html>
            </group>
          )
        }
        
        if (obs.type === 'Road') {
          const dx = obs.endX - obs.startX;
          const dz = obs.endZ - obs.startZ;
          const length = Math.hypot(dx, dz);
          const angle = Math.atan2(dx, dz);
          const cx = (obs.startX + obs.endX) / 2;
          const cz = (obs.startZ + obs.endZ) / 2;
          
          return (
            <group key={obs.id} position={[cx, 0.1, cz]} rotation={[0, angle, 0]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[obs.width, length]} />
                <meshStandardMaterial color="#52525b" />
              </mesh>
              <Html position={[0, 2, 0]} center zIndexRange={[100, 0]}>
                <div style={{ background: '#52525b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  ROAD ({obs.width} FT)
                </div>
              </Html>
            </group>
          )
        }

        if (obs.type === 'Custom') {
          const width = Math.abs(obs.endX - obs.startX);
          const length = Math.abs(obs.endZ - obs.startZ);
          const cx = (obs.startX + obs.endX) / 2;
          const cz = (obs.startZ + obs.endZ) / 2;
          
          return (
            <group key={obs.id} position={[cx, 0.05, cz]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[width, length]} />
                <meshBasicMaterial color="#f97316" transparent opacity={0.3} depthWrite={false} />
              </mesh>
              <lineSegments rotation={[-Math.PI/2, 0, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(width, length)]} />
                <lineBasicMaterial color="#ea580c" linewidth={2} />
              </lineSegments>
              <Html position={[0, 2, 0]} center zIndexRange={[100, 0]}>
                <div style={{ background: '#ea580c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  CUSTOM OBSTACLE
                </div>
              </Html>
            </group>
          )
        }

        if (obs.type === 'Gate') {
          const cx = (obs.minX + obs.maxX) / 2;
          const cz = (obs.minZ + obs.maxZ) / 2;
          const isVert = obs.side === 'North' || obs.side === 'South';
          const gWidth = isVert ? Math.abs(obs.maxX - obs.minX) : Math.abs(obs.maxZ - obs.minZ);
          
          return (
            <group key={obs.id} position={[cx, 0.1, cz]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[Math.abs(obs.maxX - obs.minX) || 5, Math.abs(obs.maxZ - obs.minZ) || 5]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
              {/* Gate Pillars */}
              <mesh position={[isVert ? -gWidth/2 : 0, 5, isVert ? 0 : -gWidth/2]}>
                <boxGeometry args={[1, 10, 1]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <mesh position={[isVert ? gWidth/2 : 0, 5, isVert ? 0 : gWidth/2]}>
                <boxGeometry args={[1, 10, 1]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <Html position={[0, 12, 0]} center zIndexRange={[100, 0]}>
                <div style={{ background: '#0f172a', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  GATE ({gWidth} FT)
                </div>
              </Html>
            </group>
          )
        }
        return null;
      })}
      
      {/* Draft Obstacle Visualizations (while drawing) */}
      {draftObstacle && activeObstacleTool === 'Road' && (
        (() => {
          const dx = draftObstacle.endX - draftObstacle.startX;
          const dz = draftObstacle.endZ - draftObstacle.startZ;
          const length = Math.hypot(dx, dz);
          if (length < 0.1) return null;
          const angle = Math.atan2(dx, dz);
          const cx = (draftObstacle.startX + draftObstacle.endX) / 2;
          const cz = (draftObstacle.startZ + draftObstacle.endZ) / 2;
          return (
            <group position={[cx, 0.2, cz]} rotation={[0, angle, 0]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[obstacleConfig.roadWidth, length]} />
                <meshBasicMaterial color="#a1a1aa" transparent opacity={0.6} depthWrite={false} />
              </mesh>
            </group>
          )
        })()
      )}

      {draftObstacle && activeObstacleTool === 'Custom' && (
        (() => {
          const width = Math.abs(draftObstacle.endX - draftObstacle.startX);
          const length = Math.abs(draftObstacle.endZ - draftObstacle.startZ);
          if (width < 0.1 || length < 0.1) return null;
          const cx = (draftObstacle.startX + draftObstacle.endX) / 2;
          const cz = (draftObstacle.startZ + draftObstacle.endZ) / 2;
          return (
            <group position={[cx, 0.2, cz]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[width, length]} />
                <meshBasicMaterial color="#fdba74" transparent opacity={0.6} depthWrite={false} />
              </mesh>
            </group>
          )
        })()
      )}
    </group>
  )
}
