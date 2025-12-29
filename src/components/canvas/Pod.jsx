import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Float, Text, Edges } from '@react-three/drei'
import * as THREE from 'three'

const STATUS_COLORS = {
  Running: '#86efac', // Pastel Green
  Pending: '#fcd34d', // Pastel Yellow
  Failed: '#fca5a5',  // Pastel Red
}

export function Pod({ id, name, status = 'Running', position = [0, 0, 0], hp = 5, lastHit = 0 }) {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  const targetScale = useRef(0)
  
  // Ref to track local visual effect time
  const hitEffectTime = useRef(0)

  // Animation logic
  useFrame((state, delta) => {
    const now = Date.now()
    
    // Detect new hit by comparing prop update time with local effect time
    if (lastHit > hitEffectTime.current) {
        hitEffectTime.current = lastHit + 200 // Set effect end time (200ms duration)
    }

    // Initial mount animation (0 -> 1)
    if (targetScale.current < 1) {
        targetScale.current += delta * 2
        if (targetScale.current > 1) targetScale.current = 1
    }
    
    if (mesh.current) {
        // Hover scale
        let s = targetScale.current * (hovered ? 1.1 : 1.0)
        
        // Hit Shake & Flash Effect
        if (now < hitEffectTime.current) {
            const shake = Math.sin(now * 0.5) * 0.2
            mesh.current.position.x = shake
            mesh.current.material.emissiveIntensity = 2.0
            mesh.current.material.color.setHex(0xffffff)
        } else {
            mesh.current.position.x = 0
            mesh.current.material.emissiveIntensity = 0.2
            mesh.current.material.color.set(STATUS_COLORS[status] || STATUS_COLORS.Pending)
        }

        mesh.current.scale.lerp(new THREE.Vector3(s, s, s), delta * 10)
    }
  })

  // onClick logic removed as collision is now the interaction method
  
  const color = STATUS_COLORS[status] || STATUS_COLORS.Pending

  return (
    <group position={position}>
        <group>
            {/* Pod Label & HP */}
            <Text
                position={[0, 2.5, 0]}
                fontSize={0.5}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#ffffff"
            >
                {`${name}\n[HP: ${hp}/5]`}
            </Text>

            {/* Pod Body */}
            <RoundedBox
                ref={mesh}
                args={[2, 2, 2]} // Increased size
                radius={0.5} // Larger radius for larger box
                smoothness={4}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={color}
                    roughness={1.0} // Clay matte
                    metalness={0.0}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
                <Edges
                    threshold={15}
                    color="white"
                    scale={1.05}
                    visible={hovered}
                />
            </RoundedBox>
        </group>
    </group>
  )
}
