import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple vertex shader injection for wind movement
const windShader = {
  uniforms: {
    time: { value: 0 }
  },
  onBeforeCompile: (shader) => {
    shader.uniforms.time = windShader.uniforms.time
    shader.vertexShader = `
      uniform float time;
      varying vec2 vUv;
    ` + shader.vertexShader
    
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Wind logic
      float angle = sin(time + position.x * 0.5 + position.z * 0.5) * 0.1;
      float lean = sin(time * 2.0 + position.x * 0.3 + position.z * 0.2) * 0.2;
      
      // Rotate blade top based on height (assumes blade is Y-up, origin at bottom)
      // Simple shear/bend effect
      transformed.x += lean * transformed.y; 
      transformed.z += angle * transformed.y;
      `
    )
  }
}

export function GrassField() {
  const meshRef = useRef()
  const count = 10000 // Number of grass blades
  
  // Generate random positions and colors
  const { positions, colors } = useMemo(() => {
    const positions = []
    const colors = []
    const tempColor = new THREE.Color()
    
    for (let i = 0; i < count; i++) {
      // Position: Random spread across 100x100 area
      const x = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100
      positions.push(x, 0, z)
      
      // Color: Random shades of green
      // Base: #567d46 (HSL: 95, 28%, 38%)
      // Variation: Hue 80-120, Sat 20-50%, Light 40-80% (Brighter)
      const hue = 0.25 + Math.random() * 0.1 // Greenish range
      const sat = 0.4 + Math.random() * 0.4
      const light = 0.4 + Math.random() * 0.4
      tempColor.setHSL(hue, sat, light)
      colors.push(tempColor.r, tempColor.g, tempColor.b)
    }
    return { 
        positions: new Float32Array(positions), 
        colors: new Float32Array(colors) 
    }
  }, [])

  // Set up instances
  useEffect(() => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D()
      for (let i = 0; i < count; i++) {
        dummy.position.set(
            positions[i * 3], 
            positions[i * 3 + 1], 
            positions[i * 3 + 2]
        )
        // varying scale per blade
        const scale = 0.8 + Math.random() * 0.8
        dummy.scale.set(1, scale, 1)
        
        // random rotation around Y axis
        dummy.rotation.y = Math.random() * Math.PI
        
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [positions])

  useFrame((state) => {
    // Update shader time uniform for wind animation
    windShader.uniforms.time.value = state.clock.getElapsedTime()
  })

  return (
    <group position={[0, 0, 0]}>
        {/* Ground Plane (Brighter Earth) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#8fb359" roughness={1} metalness={0} />
        </mesh>

        {/* Grass Blades InstancedMesh */}
        <instancedMesh ref={meshRef} args={[null, null, count]} castShadow receiveShadow>
            {/* Blade Geometry: Simple triangle/cone shape */}
            <coneGeometry args={[0.08, 0.8, 2]} /> 
            {/* 
               Cone geometry is efficient. 
               args: radius=0.08, height=0.8, radialSegments=2 (flat triangle look)
            */}
            <meshStandardMaterial 
                onBeforeCompile={windShader.onBeforeCompile}
                color="#ffffff" // Base color white to multiply with instance color
                roughness={0.8}
                metalness={0.0}
                side={THREE.DoubleSide}
            />
            <instancedBufferAttribute 
                attach="instanceColor" 
                args={[colors, 3]} 
            />
        </instancedMesh>
    </group>
  )
}
