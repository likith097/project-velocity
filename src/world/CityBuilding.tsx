import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type Props = { x: number; z: number; height: number; accent: string }
type WindowData = { x: number; y: number; z: number; rotation: number; lit: boolean }

// A deterministic hash keeps the skyline stable between renders.
function noise(a: number, b: number, salt = 0) {
  const n = Math.sin(a * 127.1 + b * 311.7 + salt * 74.7) * 43758.5453
  return n - Math.floor(n)
}

export default function CityBuilding({ x, z, height, accent }: Props) {
  const style = Math.floor(noise(x, z, 1) * 4)
  const width = style === 1 ? 3.9 : style === 2 ? 3.0 : 3.5
  const depth = style === 3 ? 3.9 : 3.5
  const floors = Math.max(2, Math.floor(height / 1.7))
  const windowsRef = useRef<THREE.InstancedMesh>(null)

  const windows = useMemo<WindowData[]>(() => {
    const result: WindowData[] = []
    const rows = Math.max(2, Math.floor(height / 1.7))
    for (let row = 0; row < rows; row++) {
      const y = 1.05 + row * 1.7
      for (let col = -1; col <= 1; col++) {
        const xOffset = col * (width / 3.6)
        const zOffset = col * (depth / 3.6)
        const litFront = noise(x + col, z + row, 3) > 0.44
        const litBack = noise(x + col, z + row, 4) > 0.44
        const litRight = noise(x + row, z + col, 5) > 0.44
        const litLeft = noise(x + row, z + col, 6) > 0.44
        result.push({ x: xOffset, y, z: depth / 2 + 0.025, rotation: 0, lit: litFront })
        result.push({ x: xOffset, y, z: -depth / 2 - 0.025, rotation: 0, lit: litBack })
        result.push({ x: width / 2 + 0.025, y, z: zOffset, rotation: Math.PI / 2, lit: litRight })
        result.push({ x: -width / 2 - 0.025, y, z: zOffset, rotation: Math.PI / 2, lit: litLeft })
      }
    }
    return result
  }, [x, z, height, width, depth])

  useLayoutEffect(() => {
    const mesh = windowsRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    const bright = new THREE.Color(style === 2 ? '#ffd9a0' : '#a8eaff')
    const dark = new THREE.Color('#16283b')
    windows.forEach((win, index) => {
      dummy.position.set(win.x, win.y, win.z)
      dummy.rotation.set(0, win.rotation, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, win.lit ? bright : dark)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [windows, style])

  const facade = ['#192639', '#28313d', '#172f3a', '#2b2834'][style]
  const trim = style === 2 ? '#687482' : '#3e5669'
  const crownHeight = style === 0 ? 1.6 : style === 3 ? 0.7 : 0.35

  return (
    <group position={[x, 0, z]}>
      {/* Main building volume: grounded at y=0 */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={facade} metalness={0.45} roughness={0.52} />
      </mesh>

      {/* Ground floor storefront band */}
      <mesh position={[0, 0.65, depth / 2 + 0.045]}>
        <boxGeometry args={[width * 0.86, 1.05, 0.08]} />
        <meshStandardMaterial color="#163b4c" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.23, depth / 2 + 0.08]}>
        <boxGeometry args={[width * 0.95, 0.07, 0.1]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Window panes are rendered in one draw call per building. */}
      <instancedMesh ref={windowsRef} args={[undefined, undefined, windows.length]} frustumCulled={false}>
        <planeGeometry args={[0.58, 0.85]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} toneMapped={false} />
      </instancedMesh>

      {/* Vertical concrete/metal mullions */}
      {[-1, 1].map(side => (
        <group key={side}>
          <mesh position={[side * (width / 2 - 0.16), height / 2, depth / 2 + 0.045]}>
            <boxGeometry args={[0.1, height, 0.09]} />
            <meshStandardMaterial color={trim} metalness={0.7} roughness={0.38} />
          </mesh>
          <mesh position={[width / 2 + 0.045, height / 2, side * (depth / 2 - 0.16)]}>
            <boxGeometry args={[0.09, height, 0.1]} />
            <meshStandardMaterial color={trim} metalness={0.7} roughness={0.38} />
          </mesh>
        </group>
      ))}

      {/* Floor slab lines add architectural scale. */}
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={i} position={[0, Math.min(height - 0.12, (i + 1) * 1.7), 0]}>
          <boxGeometry args={[width + 0.1, 0.055, depth + 0.1]} />
          <meshStandardMaterial color={trim} metalness={0.65} roughness={0.45} />
        </mesh>
      ))}

      {/* Rooftop parapet and equipment */}
      <mesh position={[0, height + 0.12, 0]}>
        <boxGeometry args={[width + 0.24, 0.24, depth + 0.24]} />
        <meshStandardMaterial color="#344353" metalness={0.45} roughness={0.55} />
      </mesh>
      <mesh position={[0, height + 0.3 + crownHeight / 2, 0]}>
        <boxGeometry args={[width * 0.55, crownHeight, depth * 0.52]} />
        <meshStandardMaterial color="#202e3c" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[width * 0.28, height + 0.55, -depth * 0.23]}>
        <boxGeometry args={[0.55, 0.75, 0.7]} />
        <meshStandardMaterial color="#52606c" metalness={0.55} roughness={0.5} />
      </mesh>

      {/* Selective neon, rather than glowing every edge. */}
      {(style === 0 || style === 3) && (
        <mesh position={[0, height + 0.26, depth / 2 + 0.13]}>
          <boxGeometry args={[width * 0.75, 0.08, 0.08]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      )}
      {style === 3 && (
        <mesh position={[0, height * 0.64, depth / 2 + 0.11]}>
          <boxGeometry args={[width * 0.72, 0.55, 0.1]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      )}
    </group>
  )
}
