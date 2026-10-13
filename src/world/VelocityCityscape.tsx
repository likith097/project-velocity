import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { districts } from './districts'

export const CITY_SIZE = 1000
const BLOCK = 40
const ROAD_WIDTH = 12
const CHUNK = 100
const ACTIVE_RADIUS = 240

function hash(x: number, z: number, salt = 0) {
  const n = Math.sin(x * 127.1 + z * 311.7 + salt * 37.3) * 43758.5453
  return n - Math.floor(n)
}

function roadDistance(value: number) {
  return Math.abs(((value + BLOCK / 2) % BLOCK + BLOCK) % BLOCK - BLOCK / 2)
}

// A shared footprint test: render and collision use the same procedural lot rules.
function buildingAt(x: number, z: number) {
  if (Math.abs(x) > 485 || Math.abs(z) > 485) return false
  if (roadDistance(x) < 10 || roadDistance(z) < 10) return false
  if (Math.abs(x) < 48 && Math.abs(z) < 48) return false
  if (districts.some(d => Math.hypot(x - d.x, z - d.z) < 33)) return false
  return true
}

export function isWalkable(x: number, z: number) {
  if (Math.abs(x) > 494 || Math.abs(z) > 494) return false
  // Keep central tower solid; its public entrance is on the south side.
  if (Math.abs(x) < 24.7 && Math.abs(z) < 24.7) return false
  // Allow the central lobby approach and the district plazas.
  if (x > -10 && x < 10 && z >= 25 && z < 47) return true
  if (districts.some(d => Math.hypot(x - d.x, z - d.z) < 21)) return true
  // Each building occupies the middle of a 40-unit city block, behind sidewalks.
  // Test nearby lots only, leaving roads and sidewalks walkable.
  const ix = Math.round((x - 20) / 40)
  const iz = Math.round((z - 20) / 40)
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
    const bx = (ix + dx) * 40 + 20
    const bz = (iz + dz) * 40 + 20
    if (!buildingAt(bx, bz) || hash(bx, bz, 21) < 0.24) continue
    const halfW = (18 + hash(bx, bz, 2) * 4) / 2 + 0.85
    const halfD = (18 + hash(bx, bz, 3) * 4) / 2 + 0.85
    if (Math.abs(x - bx) < halfW && Math.abs(z - bz) < halfD) return false
  }
  return true
}

type Instance = { x: number; z: number; h: number; w: number; d: number; style: number }

function BuildingInstances({ items }: { items: Instance[] }) {
  const bodies = useRef<THREE.InstancedMesh>(null)
  const roofs = useRef<THREE.InstancedMesh>(null)
  const lights = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const colors = ['#92a6b4', '#c0c9cd', '#6c93a9', '#a4a6aa', '#c5bba9']
    items.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z)
      dummy.scale.set(b.w, b.h, b.d)
      dummy.updateMatrix()
      bodies.current?.setMatrixAt(i, dummy.matrix)
      bodies.current?.setColorAt(i, new THREE.Color(colors[b.style]))
      dummy.position.set(b.x, b.h + 0.4, b.z)
      dummy.scale.set(b.w + 0.5, 0.8, b.d + 0.5)
      dummy.updateMatrix()
      roofs.current?.setMatrixAt(i, dummy.matrix)
      dummy.position.set(b.x, b.h * 0.65, b.z + b.d / 2 + 0.08)
      dummy.scale.set(b.w * 0.78, Math.max(0.5, b.h * 0.045), 0.1)
      dummy.updateMatrix()
      lights.current?.setMatrixAt(i, dummy.matrix)
      lights.current?.setColorAt(i, new THREE.Color(hash(b.x, b.z) > 0.5 ? '#84d8ed' : '#e9f2fa'))
    })
    for (const mesh of [bodies.current, roofs.current, lights.current]) {
      if (!mesh) continue
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  }, [items])
  return <>
    <instancedMesh ref={bodies} args={[undefined, undefined, items.length]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="white" metalness={0.45} roughness={0.48} />
    </instancedMesh>
    <instancedMesh ref={roofs} args={[undefined, undefined, items.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#b9c5cc" metalness={0.55} roughness={0.45} />
    </instancedMesh>
    <instancedMesh ref={lights} args={[undefined, undefined, items.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="white" toneMapped={false} />
    </instancedMesh>
  </>
}

function CityChunk({ cx, cz }: { cx: number; cz: number }) {
  const items = useMemo(() => {
    const result: Instance[] = []
    // Place one building inside each 40-unit block, leaving a road and sidewalk buffer.
    for (let x = Math.ceil((cx * CHUNK - 20) / 40) * 40 + 20; x < (cx + 1) * CHUNK; x += 40) {
      for (let z = Math.ceil((cz * CHUNK - 20) / 40) * 40 + 20; z < (cz + 1) * CHUNK; z += 40) {
        if (!buildingAt(x, z) || hash(x, z, 21) < 0.24) continue
        const n = hash(x, z, 1)
        const downtown = Math.max(0, 1 - Math.hypot(x, z) / 600)
        // Predominantly low/mid-rise, with rare towers concentrated downtown.
        const tier = hash(x, z, 19)
        const h = tier < 0.38 ? 8 + n * 12 : tier < 0.72 ? 19 + n * 24 : tier < 0.91 ? 40 + n * 30 : 65 + n * (25 + downtown * 60)
        result.push({ x, z, h: Math.min(150, h), w: 18 + hash(x, z, 2) * 4, d: 18 + hash(x, z, 3) * 4, style: Math.floor(hash(x, z, 4) * 5) })
      }
    }
    return result
  }, [cx, cz])
  return <BuildingInstances items={items} />
}

export function Cityscape({ x, z }: { x: number; z: number }) {
  const chunks = useMemo(() => {
    const result: { cx: number; cz: number }[] = []
    for (let cx = -5; cx < 5; cx++) for (let cz = -5; cz < 5; cz++) {
      const centerX = cx * CHUNK + CHUNK / 2
      const centerZ = cz * CHUNK + CHUNK / 2
      if (Math.hypot(centerX - x, centerZ - z) < ACTIVE_RADIUS + 75) result.push({ cx, cz })
    }
    return result
  }, [Math.floor(x / 60), Math.floor(z / 60)])
  const roadLines = useMemo(() => Array.from({ length: 25 }, (_, i) => -480 + i * BLOCK), [])
  const roadPaint = '#505963'
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[CITY_SIZE, CITY_SIZE]} />
      <meshStandardMaterial color="#c5c8c0" roughness={0.96} />
    </mesh>
    {roadLines.map(p => <group key={p}>
      {/* Asphalt: high contrast against the light concrete city blocks. */}
      <mesh position={[p, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, CITY_SIZE]} />
        <meshStandardMaterial color={roadPaint} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.037, p]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CITY_SIZE, ROAD_WIDTH]} />
        <meshStandardMaterial color={roadPaint} roughness={0.96} />
      </mesh>
      {/* Sidewalk strips flank each road, and never overlap the building lots. */}
      {[-1, 1].map(side => <group key={side}>
        <mesh position={[p + side * 7.15, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.3, CITY_SIZE]} />
          <meshStandardMaterial color="#e3e1d9" roughness={0.94} />
        </mesh>
        <mesh position={[0, 0.067, p + side * 7.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_SIZE, 2.3]} />
          <meshStandardMaterial color="#e3e1d9" roughness={0.94} />
        </mesh>
        <mesh position={[p + side * 5.95, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, CITY_SIZE]} />
          <meshBasicMaterial color="#f8f8ee" />
        </mesh>
        <mesh position={[0, 0.091, p + side * 5.95]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CITY_SIZE, 0.18]} />
          <meshBasicMaterial color="#f8f8ee" />
        </mesh>
      </group>)}
      {/* Dashed lane markings between intersections. */}
      {Array.from({ length: 25 }, (_, i) => -460 + i * 40).map(q => <group key={q}>
        <mesh position={[p, 0.095, q]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 14]} />
          <meshBasicMaterial color="#f5e6aa" />
        </mesh>
        <mesh position={[q, 0.096, p]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 0.18]} />
          <meshBasicMaterial color="#f5e6aa" />
        </mesh>
      </group>)}
    </group>)}
    {chunks.map(c => <CityChunk key={`${c.cx}:${c.cz}`} {...c} />)}
  </>

}

export function CrystalSpire({ color }: { color: string }) {
  const tip = useRef<THREE.Group>(null)
  useFrame(({ clock }) => { if (tip.current) tip.current.rotation.y = clock.elapsedTime * 0.08 })
  return <group>
    <mesh position={[0, 238, 0]}>
      <cylinderGeometry args={[2.2, 6.5, 476, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.35} transparent opacity={0.67} depthWrite={false} />
    </mesh>
    <group ref={tip} position={[0, 485, 0]}>
      <mesh>
        <coneGeometry args={[8, 20, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 10, 0]}>
        <sphereGeometry args={[1.3, 10, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[14, 17, 0.8, 8]} />
      <meshStandardMaterial color="#14263a" emissive={color} emissiveIntensity={0.12} />
    </mesh>
  </group>
}

export function LKTower() {
  const tiers = [
    { bottom: 0, top: 140, size: 48 },
    { bottom: 140, top: 250, size: 39 },
    { bottom: 250, top: 335, size: 30 },
    { bottom: 335, top: 405, size: 22 },
    { bottom: 405, top: 450, size: 13 },
    { bottom: 450, top: 477, size: 7 },
  ]
  return <group>
    {tiers.map(t => <group key={t.bottom}>
      <mesh position={[0, (t.bottom + t.top) / 2, 0]}>
        <boxGeometry args={[t.size, t.top - t.bottom, t.size]} />
        <meshStandardMaterial color="#7eacbf" metalness={0.76} roughness={0.23} />
      </mesh>
      {[-1, 1].map(s => <group key={s}>
        <mesh position={[s * (t.size / 2 + 0.06), (t.bottom + t.top) / 2, 0]}>
          <boxGeometry args={[0.2, t.top - t.bottom, t.size * 0.72]} />
          <meshBasicMaterial color="#b7e4ed" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, (t.bottom + t.top) / 2, s * (t.size / 2 + 0.06)]}>
          <boxGeometry args={[t.size * 0.72, t.top - t.bottom, 0.2]} />
          <meshBasicMaterial color="#b7e4ed" transparent opacity={0.6} />
        </mesh>
      </group>)}
    </group>)}
    <mesh position={[0, 488.5, 0]}>
      <coneGeometry args={[3.5, 23, 8]} />
      <meshStandardMaterial color="#b5dce6" emissive="#22d3ee" emissiveIntensity={0.45} metalness={0.75} />
    </mesh>
    {/* Walkable setback deck to the south, clear of the 13-unit-wide upper tier. */}
    <mesh position={[0, 449.1, 16]}>
      <boxGeometry args={[26, 1.8, 18]} />
      <meshStandardMaterial color="#9eafb9" metalness={0.65} roughness={0.4} />
    </mesh>
    <mesh position={[0, 450.04, 16]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[4.5, 6, 48]} />
      <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, 451.2, 24.5]}>
      <boxGeometry args={[26, 2.4, 0.45]} />
      <meshStandardMaterial color="#66a7b9" transparent opacity={0.65} />
    </mesh>
    {[-13, 13].map(s => <mesh key={s} position={[s, 451.2, 16]}>
      <boxGeometry args={[0.45, 2.4, 18]} />
      <meshStandardMaterial color="#66a7b9" transparent opacity={0.65} />
    </mesh>)}
    <mesh position={[0, 451.5, 7.1]}>
      <boxGeometry args={[9, 3, 0.8]} />
      <meshBasicMaterial color="#22d3ee" />
    </mesh>
    <mesh position={[0, 419, 11.3]}>
      <boxGeometry args={[9, 7, 0.5]} />
      <meshBasicMaterial color="#67e8f9" />
    </mesh>
    <mesh position={[0, 0.5, 30]}>
      <boxGeometry args={[16, 1, 12]} />
      <meshStandardMaterial color="#1c3344" />
    </mesh>
  </group>
}

export function MovingClouds() {
  const group = useRef<THREE.Group>(null)
  const clouds = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    x: (hash(i, 0) - 0.5) * 1600,
    y: 550 + hash(i, 1) * 180,
    z: (hash(i, 2) - 0.5) * 1600,
    size: 60 + hash(i, 3) * 90,
  })), [])
  useFrame((_, delta) => {
    if (!group.current) return
    group.current.position.x = (group.current.position.x + delta * 1.2) % 120
  })
  return <group ref={group}>
    {clouds.map((c, i) => <mesh key={i} position={[c.x, c.y, c.z]} scale={[c.size, 13, c.size * 0.55]}>
      <sphereGeometry args={[1, 9, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.54} depthWrite={false} />
    </mesh>)}
  </group>
}
