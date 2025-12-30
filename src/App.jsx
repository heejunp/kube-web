import React, { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GrassField } from './components/canvas/GrassField'
import { Pod } from './components/canvas/Pod'
import { Node } from './components/canvas/Node'
import { FloatingSphere } from './components/canvas/FloatingSphere'
import './App.css'

import { EffectComposer, Bloom } from '@react-three/postprocessing'

// Use environment variable or fallback to localhost for local dev
// For K8s deployment, VITE_API_URL should be set to: http://web-go.default.svc.cluster.local:8080/api/pods
const API_URL = import.meta.env.VITE_API_URL || 'https//www.heejunp.com/api/pods'

function App() {
  const [pods, setPods] = useState([])

  // Fetch initial pods
  useEffect(() => {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            // Ensure data has necessary UI state props not in DB if needed (e.g. lastHit)
            // Backend provides id, name, status, hp, position
            // We map them to ensure position is array and defaults exist
            const formatted = (data || []).map(p => ({
                ...p,
                lastHit: 0 
            }))
            setPods(formatted)
        })
        .catch(err => console.error("Failed to fetch pods:", err))
  }, [])

  const addPod = useCallback(() => {
    // Optimistic UI update or wait for server? Let's wait for server for consistency or optimistic.
    // Let's do simple fetch for now.
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Let backend handle random gen
    })
    .then(res => res.json())
    .then(newPod => {
        setPods(prev => [...prev, { ...newPod, lastHit: 0 }])
    })
    .catch(err => console.error("Failed to add pod:", err))
  }, [])

  const handleAttack = useCallback((id) => {
    // Find current HP to determine if we need to DELETE or PATCH
    setPods(prev => {
        const target = prev.find(p => p.id === id)
        if (!target) return prev

        const newHp = target.hp - 1
        
        if (newHp <= 0) {
            // Trigger Delete API
            fetch(`${API_URL}/${id}`, { method: 'DELETE' })
                .catch(err => console.error("Failed to delete pod:", err))
            
            return prev.filter(p => p.id !== id)
        } else {
            // Trigger Patch API
            fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hp: newHp })
            }).catch(err => console.error("Failed to patch pod:", err))

            // Update local state
            return prev.map(p => {
                if (p.id === id) {
                    return { ...p, hp: newHp, lastHit: Date.now() }
                }
                return p
            })
        }
    })
  }, [])

  return (
    <>
      <div className="ui-overlay">
        <button className="add-btn" onClick={addPod}>+ Add Random Pod</button>
      </div>

      <Canvas shadows camera={{ position: [10, 15, 10], fov: 50 }}>
        <color attach="background" args={['#d0e8f2']} /> 
        
        <ambientLight intensity={1.2} />
        <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.0} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
        />

        <Suspense fallback={null}>
            <FloatingSphere pods={pods} onAttack={handleAttack} />
            <GrassField />
            
            {/* Demo Node containing Pods */}
            <Node name="worker-node-01" position={[0, 0.25, 0]}>
                {pods.map(pod => (
                    <Pod 
                        key={pod.id}
                        {...pod}
                    />
                ))}
            </Node>
        </Suspense>

        <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.2} 
                mipmapBlur 
                intensity={0.5} 
                radius={0.5} 
            />
        </EffectComposer>
      </Canvas>
    </>
  )
}

export default App
