import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Sky, Environment, ContactShadows } from '@react-three/drei'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Ground from './components/Ground'
import PlantModels from './components/PlantModels'
import Infrastructure from './components/Infrastructure'
import Stats from './components/Stats'
import ObjectPropertiesPanel from './components/ObjectPropertiesPanel'
import { useStore } from './store'

function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="status">
      <div className="webgl-fallback-card">
        <span className="webgl-fallback-kicker">3D preview unavailable</span>
        <h2>Open this planner in a WebGL-enabled browser</h2>
        <p>The planning controls are ready, but this preview environment cannot start the 3D renderer.</p>
      </div>
    </div>
  )
}

export default function PlannerWorkspace({ onNavigateToLibrary }) {
  const { draggingPlantId, draggingInfraId, activeDrawTool, manualPlacementZoneId, selectedInfraId, showStats } = useStore()
  const [webglAvailable] = useState(() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch {
      return false
    }
  })

  let helperText = ''
  if (activeDrawTool === 'Road') helperText = 'Road Mode — Click and drag on the farm to draw a road'
  else if (manualPlacementZoneId === 'border-zone') helperText = 'Border Plant Mode — Click on the border strip to place a plant'
  else if (manualPlacementZoneId) helperText = 'Manual Placement — Click inside the crop zone to place'

  return (
    <div className="app-container">
      <Sidebar onNavigateToLibrary={onNavigateToLibrary} />
      
      <div className="canvas-container" style={{ position: 'relative' }}>
        {helperText && (
          <div className="helper-banner">
            {helperText}
          </div>
        )}

        {showStats && <Stats />}
        {selectedInfraId && <ObjectPropertiesPanel />}

        {!webglAvailable ? (
          <WebGLFallback />
        ) : (
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 140, 180]} fov={45} />
            <OrbitControls 
              makeDefault
              maxPolarAngle={Math.PI / 2 - 0.05} 
              minDistance={10} 
              maxDistance={600}
              enabled={!draggingPlantId && !draggingInfraId && !activeDrawTool && !manualPlacementZoneId}
            />
            
            <ambientLight intensity={0.7} />
            <directionalLight 
              position={[80, 120, 50]} 
              intensity={1.8} 
              castShadow 
              shadow-mapSize-width={2048} 
              shadow-mapSize-height={2048}
              shadow-camera-far={600}
              shadow-camera-left={-150}
              shadow-camera-right={150}
              shadow-camera-top={150}
              shadow-camera-bottom={-150}
              shadow-bias={-0.0005}
            />
            
            <Sky sunPosition={[100, 40, 100]} turbidity={0.1} rayleigh={0.4} />
            <Environment preset="park" />
            
            <Ground />
            <PlantModels />
            <Infrastructure />
            
            <ContactShadows 
              position={[0, 0.05, 0]} 
              opacity={0.5} 
              scale={300} 
              blur={1.5} 
              far={10} 
              resolution={1024} 
              color="#000000" 
            />
          </Canvas>
        )}
      </div>
    </div>
  )
}
