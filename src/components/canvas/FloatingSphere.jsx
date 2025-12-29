import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

export function FloatingSphere({ pods = [], onAttack }) {
  const sphereRef = useRef()
  const keys = useRef({})
  const isAttacking = useRef(false)
  const attackstartTime = useRef(0)
  const podsHitInThisAttack = useRef(new Set()) // Track pods hit in current swing
  const zoomLevel = useRef(20) // Initial camera distance

  React.useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true)
    const handleKeyUp = (e) => (keys.current[e.code] = false)
    
    // Zoom control
    const handleWheel = (e) => {
        zoomLevel.current += e.deltaY * 0.05
        // Clamp zoom level (Min 5, Max 50)
        if (zoomLevel.current < 5) zoomLevel.current = 5
        if (zoomLevel.current > 50) zoomLevel.current = 50
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('wheel', handleWheel)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const now = Date.now()
    const speed = 10 * delta
    
    // Attack Trigger (KeyK)
    // 500ms cooldown (animation duration)
    if (keys.current['KeyK'] && !isAttacking.current && now - attackstartTime.current > 500) {
        isAttacking.current = true
        attackstartTime.current = now
        podsHitInThisAttack.current.clear()
        // Visual cue: Force reset or trigger sound here if needed
    }

    // Reset attack state after duration
    if (isAttacking.current && now - attackstartTime.current > 300) {
        isAttacking.current = false
    }

    if (sphereRef.current) {
      // Base Animation
      let yPos = 0.7 // Fixed height on ground (Radius 0.7)
      let scale = 0.7
      
      // Attack Animation (Lunge/Smash)
      if (isAttacking.current) {
          const progress = (now - attackstartTime.current) / 300 // 0 to 1
          // Pop scale up and down
          const boom = Math.sin(progress * Math.PI) * 0.5 // 0 -> 0.5 -> 0
          scale += boom
          
          sphereRef.current.material.color.setHex(0xff0000) // Flash red
          sphereRef.current.material.emissiveIntensity = 1.0
      } else {
          sphereRef.current.material.color.set('#ff7f50') // Reset color
          sphereRef.current.material.emissiveIntensity = 0.2
      }

      // Movement
      if (keys.current['KeyW']) sphereRef.current.position.z -= speed
      if (keys.current['KeyS']) sphereRef.current.position.z += speed
      if (keys.current['KeyA']) sphereRef.current.position.x -= speed
      if (keys.current['KeyD']) sphereRef.current.position.x += speed
      
      sphereRef.current.position.y = yPos
      sphereRef.current.rotation.y += 0.005
      
      sphereRef.current.scale.setScalar(scale)

      // Camera Follows Sphere (Fixed Offset - Diagonal Top-Down with Zoom)
      state.camera.position.x = sphereRef.current.position.x
      state.camera.position.y = sphereRef.current.position.y + zoomLevel.current
      state.camera.position.z = sphereRef.current.position.z + zoomLevel.current
      state.camera.lookAt(sphereRef.current.position)

      // Collision Detection (Only when attacking)
      if (isAttacking.current) {
          const myPos = sphereRef.current.position
          
          pods.forEach(pod => {
              if (podsHitInThisAttack.current.has(pod.id)) return // Already hit this swing

              const dx = myPos.x - pod.position[0]
              const dz = myPos.z - pod.position[2]
              const distance = Math.sqrt(dx*dx + dz*dz)
              
              if (distance < 2.5) { // Slightly generous hit range
                  onAttack(pod.id)
                  podsHitInThisAttack.current.add(pod.id)
              }
          })
      }
    }
  })

  return (
    <Sphere ref={sphereRef} args={[0.7, 64, 64]} position={[0, 1, 0]} castShadow>
      <MeshDistortMaterial
        color="#ff7f50"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={1.0} // Fully matte
        metalness={0.0} // No metallic reflection
      />
    </Sphere>
  )
}
