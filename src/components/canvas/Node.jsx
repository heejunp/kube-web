import React from 'react'
import { RoundedBox, Text } from '@react-three/drei'

export function Node({ name, position = [0, 0, 0], size = [8, 0.5, 8], children }) {
  return (
    <group position={position}>
        {/* Node Label */}
        <Text
            position={[-size[0]/2 + 1, 0.2, -size[2]/2 - 0.5]}
            fontSize={0.5}
            color="#787878"
            anchorX="left"
            anchorY="middle"
        >
            {name}
        </Text>

        {/* Node Base Platform */}
        <RoundedBox
            args={size}
            radius={0.1}
            smoothness={4}
            receiveShadow
        >
            <meshStandardMaterial
                color="#f3f4f6" // Clay White/Light Grey
                roughness={1.0}
                metalness={0.0}
            />
        </RoundedBox>

        {/* Border / Outline for grouping */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, size[1]/2 + 0.01, 0]}>
            <planeGeometry args={[size[0] - 0.4, size[2] - 0.4]} />
            <meshBasicMaterial 
                color="#e5e7eb" 
                wireframe 
                transparent 
                opacity={0.5} 
            />
        </mesh>

        {/* Container for Pods placed on this Node */}
        <group position={[0, size[1]/2 + 0.5, 0]}>
            {children}
        </group>
    </group>
  )
}
