import React, { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GrassField } from './components/canvas/GrassField'
import { Pod } from './components/canvas/Pod'
import { Node } from './components/canvas/Node'
import { FloatingSphere } from './components/canvas/FloatingSphere'
import './App.css'

import { EffectComposer, Bloom } from '@react-three/postprocessing'

function App() {
  const [pods, setPods] = useState([
    { id: 1, name: 'nginx-1', status: 'Running', position: [-2, 0, -2], hp: 5, lastHit: 0 },
    { id: 2, name: 'redis-1', status: 'Pending', position: [2, 0, -2], hp: 5, lastHit: 0 },
    { id: 3, name: 'api-svr', status: 'Failed',  position: [-2, 0, 2], hp: 5, lastHit: 0 },
    { id: 4, name: 'test-target', status: 'Running', position: [2, 0, 2], hp: 5, lastHit: 0 },
  ])

  const addPod = useCallback(() => {
    const id = Date.now()
    const statuses = ['Running', 'Pending', 'Failed']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomPos = [
      (Math.random() - 0.5) * 6, 
      0, 
      (Math.random() - 0.5) * 6
    ]
    setPods(prev => [...prev, { 
        id, 
        name: `pod-${id.toString().slice(-4)}`, 
        status: randomStatus, 
        position: randomPos,
        hp: 5,
        lastHit: 0
    }])
  }, [])

  const handleAttack = useCallback((id) => {
    setPods(prev => {
        return prev.map(p => {
            if (p.id === id) {
                const newHp = p.hp - 1
                return { ...p, hp: newHp, lastHit: Date.now() }
            }
            return p
        }).filter(p => p.hp > 0)
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
