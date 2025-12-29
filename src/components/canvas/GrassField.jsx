import React from 'react'
import { Plane, Grid } from '@react-three/drei'

export function GrassField() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <Plane args={[100, 100]} receiveShadow>
        <meshStandardMaterial 
            color="#8fb359" // Pastel clay green
            roughness={1}
            metalness={0}
        />
      </Plane>
      {/* Subtle grid on top for digital feel */}
      <Grid 
        args={[100, 100]} 
        sectionSize={5} 
        cellSize={1} 
        sectionColor="#ffffff" 
        cellColor="#ffffff" 
        sectionThickness={1}
        cellThickness={0.5}
        fadeDistance={40}
        infiniteGrid
        position={[0, 0, 0.01]} // Slightly above the grass
      />
    </group>
  )
}
