import React, { Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GrassField } from './components/canvas/GrassField'
import { Pod } from './components/canvas/Pod'
import { Node } from './components/canvas/Node'
import { FloatingSphere } from './components/canvas/FloatingSphere'
import './App.css'

import { EffectComposer, Bloom } from '@react-three/postprocessing'

const WS_URL = import.meta.env.VITE_WS_URL
  ? import.meta.env.VITE_WS_URL
  : (import.meta.env.MODE === 'production'
    ? 'wss://bridge.heejunp.com/ws'
    : 'ws://localhost:9090/ws');

function App() {
  const [pods, setPods] = useState([])
  const ws = React.useRef(null)

  // WebSocket Connection
  useEffect(() => {
    ws.current = new WebSocket(WS_URL)
    
    ws.current.onopen = () => {
        console.log("Connected to Bridge Server")
    }

    ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        // Message format: { type: "ADDED"|"MODIFIED"|"DELETED", id, ... }

        setPods(prev => {
            if (msg.type === "DELETED") {
                return prev.filter(p => p.id !== msg.id)
            }
            
            // ADDED or MODIFIED
            const exists = prev.find(p => p.id === msg.id)
            
            if (exists) {
                // Update existing
                return prev.map(p => p.id === msg.id ? { ...p, ...msg, lastHit: p.lastHit } : p)
            } else {
                // Add new
                return [...prev, { ...msg, lastHit: 0 }]
            }
        })
    }

    return () => {
        if (ws.current) ws.current.close()
    }
  }, [])

  const addPod = useCallback(() => {
    // Ideally send command to bridge, but for now our backend auto-creates specific loop
    // or we can invoke POST api directly. But requirement says "Bridge to API".
    // For this step, we rely on Backend's Auto-Healing or direct interaction.
    // Let's create a temporary fetch to legacy API just to trigger creation if needed,
    // OR we can rely on the fact that user just wants to see 're-creation' via auto-healing.
    // We'll leave this button functional via Legacy HTTP for now as 'trigger'.
    fetch('http://localhost:8080/api/pods', { method: 'POST' })
  }, [])

  const handleAttack = useCallback((id) => {
    setPods(prev => {
        const target = prev.find(p => p.id === id)
        if (!target) return prev

        const newHp = target.hp - 1
        
        if (newHp <= 0) {
            // Send Kill Command via WebSocket
            if (ws.current) {
                ws.current.send(JSON.stringify({
                    action: 'kill',
                    podId: id
                }))
            }
            // Optimistic Remove or wait for DELETED event? 
            // Better wait for DELETED event for 'real' feel, but for game loop responsive,
            // we can mark it as dying. Let's just update HP for now.
             return prev.filter(p => p.id !== id) // Remove immediately for responsiveness
        } 
        
        // Just visual HP update (Local)
        return prev.map(p => {
            if (p.id === id) {
                return { ...p, hp: newHp, lastHit: Date.now() }
            }
            return p
        })
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
