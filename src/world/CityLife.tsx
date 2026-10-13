import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROAD = 40
const LANES = [-2.8, 2.8]
const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x) }

/** Nearby-only animated traffic. Cars obey an alternating 12-second intersection cycle. */
export function CityLife({ x, z }: { x: number; z: number }) {
  const cars = useRef<THREE.InstancedMesh>(null)
  const walkers = useRef<THREE.InstancedMesh>(null)
  const signals = useRef<THREE.InstancedMesh>(null)
  const centerX = Math.round(x / 40) * 40
  const centerZ = Math.round(z / 40) * 40
  const routes = useMemo(() => {
    const result: { horizontal: boolean; fixed: number; offset: number; speed: number; lane: number; color: THREE.Color }[] = []
    for (let i = -4; i <= 4; i++) for (let j = 0; j < 2; j++) for (const horizontal of [false, true]) {
      const fixed = (horizontal ? centerZ : centerX) + i * ROAD
      result.push({ horizontal, fixed, offset: hash(i * 23 + j * 19 + (horizontal ? 300 : 0)) * 320, speed: 7 + hash(i * 4 + j * 11) * 5, lane: LANES[j], color: new THREE.Color(['#e7eff3','#e24e41','#3179ad','#d6bd72'][Math.abs(i + j) % 4]) })
    }
    return result
  }, [centerX, centerZ])
  const pedestrians = useMemo(() => Array.from({ length: 72 }, (_, i) => ({
    horizontal: i % 2 === 0, fixed: (i % 2 === 0 ? centerZ : centerX) + (Math.floor(i / 8) - 4) * 40 + (i % 4 < 2 ? -7.4 : 7.4),
    offset: hash(i + 91) * 280, speed: 0.65 + hash(i + 11) * 0.8,
  })), [centerX, centerZ])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const dummy = new THREE.Object3D()
    routes.forEach((r, i) => {
      let moving = (r.offset + t * r.speed) % 320 - 160
      // Stop before intersections when the light is red.
      const green = r.horizontal ? t % 12 < 6 : t % 12 >= 6
      if (!green) {
        const next = Math.ceil((moving - 16) / 40) * 40 - 9
        if (moving > next - 8 && moving < next + 7) moving = next - 8
      }
      dummy.position.set(r.horizontal ? centerX + moving : r.fixed + r.lane, 0.7, r.horizontal ? r.fixed + r.lane : centerZ + moving)
      dummy.rotation.set(0, r.horizontal ? Math.PI / 2 : 0, 0)
      dummy.scale.set(2.1, 1.3, 3.8)
      dummy.updateMatrix()
      cars.current?.setMatrixAt(i, dummy.matrix)
      cars.current?.setColorAt(i, r.color)
    })
    pedestrians.forEach((p, i) => {
      const along = ((p.offset + t * p.speed) % 280) - 140
      dummy.position.set(p.horizontal ? centerX + along : p.fixed, 1.05, p.horizontal ? p.fixed : centerZ + along)
      dummy.rotation.set(0, p.horizontal ? Math.PI / 2 : 0, 0)
      dummy.scale.set(0.6, 2.1, 0.6)
      dummy.updateMatrix()
      walkers.current?.setMatrixAt(i, dummy.matrix)
    })
    for (let i = 0; i < 49; i++) {
      const gx = centerX + (i % 7 - 3) * 40
      const gz = centerZ + (Math.floor(i / 7) - 3) * 40
      dummy.position.set(gx + 7, 2.5, gz + 7)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(0.7, 5, 0.7)
      dummy.updateMatrix()
      signals.current?.setMatrixAt(i, dummy.matrix)
      signals.current?.setColorAt(i, new THREE.Color((t % 12 < 6) ? '#28bd65' : '#ef4949'))
    }
    for (const mesh of [cars.current, walkers.current, signals.current]) {
      if (!mesh) continue
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  })
  return <>
    <instancedMesh ref={cars} args={[undefined, undefined, routes.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="white" metalness={0.4} roughness={0.35}/>
    </instancedMesh>
    <instancedMesh ref={walkers} args={[undefined, undefined, pedestrians.length]} frustumCulled={false}>
      <capsuleGeometry args={[0.5, 1, 4, 6]} /><meshStandardMaterial color="#426579" roughness={0.85}/>
    </instancedMesh>
    <instancedMesh ref={signals} args={[undefined, undefined, 49]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="white" emissive="#333333" emissiveIntensity={0.2}/>
    </instancedMesh>
  </>
}
