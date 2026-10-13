import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type TransitTrip = { id: number; from: [number, number, number]; to: [number, number, number]; label: string }

/** A 10-second camera flythrough. Tube hoops move with the camera and frame the skyline. */
export default function CinematicTransit({ trip, onArrive }: { trip: TransitTrip; onArrive: () => void }) {
  const elapsed = useRef(0)
  const completed = useRef(false)
  const hoops = useRef<THREE.Group>(null)
  const start = new THREE.Vector3(...trip.from)
  const end = new THREE.Vector3(...trip.to)
  useFrame(({ camera }, delta) => {
    if (completed.current) return
    elapsed.current = Math.min(10, elapsed.current + Math.min(delta, 0.1))
    const t = elapsed.current / 10
    const smooth = t * t * (3 - 2 * t)
    const height = 75 + Math.sin(Math.PI * smooth) * 115
    const p = new THREE.Vector3().lerpVectors(start, end, smooth)
    p.y = Math.max(start.y, end.y) * (1 - smooth) + height * Math.sin(Math.PI * smooth) + end.y * smooth
    if (start.y > 100) p.y = start.y * (1 - smooth) + height * Math.sin(Math.PI * smooth) + end.y * smooth
    camera.position.copy(p)
    const ahead = new THREE.Vector3().lerpVectors(start, end, Math.min(1, smooth + 0.035))
    ahead.y = p.y - 12
    if (ahead.distanceToSquared(p) < 1) ahead.z -= 20
    camera.lookAt(ahead)
    if (hoops.current) {
      hoops.current.position.copy(p)
      hoops.current.quaternion.copy(camera.quaternion)
    }
    if (elapsed.current >= 10) { completed.current = true; onArrive() }
  }, 1)
  return <group ref={hoops}>
    {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[0, 0, -(i + 1) * 7]}>
      <torusGeometry args={[5.5, 0.075, 6, 20]} />
      <meshBasicMaterial color="#4de3f5" transparent opacity={0.38} depthWrite={false} />
    </mesh>)}
  </group>
}
