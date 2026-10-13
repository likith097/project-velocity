
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'

type CyberCharacterProps = {
  moving: boolean
  running: boolean
}

export default function CyberCharacter({
  moving,
  running,
}: CyberCharacterProps) {
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)
  const body = useRef<Group>(null)

  const animationTime = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    if (moving) {
      animationTime.current += dt * (running ? 13 : 8)
    }

    const swing = moving
      ? Math.sin(animationTime.current) * (running ? 0.7 : 0.45)
      : 0

    const smoothing = 1 - Math.exp(-12 * dt)

    if (leftArm.current) {
      leftArm.current.rotation.x = MathUtils.lerp(
        leftArm.current.rotation.x,
        swing,
        smoothing
      )
    }

    if (rightArm.current) {
      rightArm.current.rotation.x = MathUtils.lerp(
        rightArm.current.rotation.x,
        -swing,
        smoothing
      )
    }

    if (leftLeg.current) {
      leftLeg.current.rotation.x = MathUtils.lerp(
        leftLeg.current.rotation.x,
        -swing,
        smoothing
      )
    }

    if (rightLeg.current) {
      rightLeg.current.rotation.x = MathUtils.lerp(
        rightLeg.current.rotation.x,
        swing,
        smoothing
      )
    }

    if (body.current) {
      body.current.position.y = MathUtils.lerp(
        body.current.position.y,
        moving
          ? Math.abs(Math.sin(animationTime.current * 2)) * 0.045
          : 0,
        smoothing
      )
    }
  })

  return (
    <group ref={body}>
      {/* Armored torso */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[0.85, 1.05, 0.48]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>

      {/* Cyan chest reactor */}
      <mesh position={[0, 1.55, 0.255]}>
        <boxGeometry args={[0.42, 0.13, 0.04]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Shoulder armor */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 1.85, 0]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.5]} />
          <meshStandardMaterial
            color="#312e81"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Helmet */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <sphereGeometry args={[0.39, 20, 16]} />
        <meshStandardMaterial
          color="#080e1b"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Glowing front visor */}
      <mesh position={[0, 2.37, 0.33]}>
        <boxGeometry args={[0.59, 0.16, 0.09]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Helmet side lights */}
      {[-0.39, 0.39].map((x) => (
        <mesh key={x} position={[x, 2.32, 0]}>
          <boxGeometry args={[0.06, 0.18, 0.2]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Left arm */}
      <group ref={leftArm} position={[-0.58, 1.75, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.28, 0.8, 0.34]} />
          <meshStandardMaterial color="#172033" metalness={0.65} />
        </mesh>
        <mesh position={[0, -0.55, 0.19]}>
          <boxGeometry args={[0.12, 0.35, 0.04]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      </group>

      {/* Right arm */}
      <group ref={rightArm} position={[0.58, 1.75, 0]}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.28, 0.8, 0.34]} />
          <meshStandardMaterial color="#172033" metalness={0.65} />
        </mesh>
        <mesh position={[0, -0.55, 0.19]}>
          <boxGeometry args={[0.12, 0.35, 0.04]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
      </group>

      {/* Left leg */}
      <group ref={leftLeg} position={[-0.23, 0.95, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <boxGeometry args={[0.34, 0.9, 0.4]} />
          <meshStandardMaterial color="#101827" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.85, 0.12]} castShadow>
          <boxGeometry args={[0.37, 0.2, 0.65]} />
          <meshStandardMaterial color="#312e81" metalness={0.7} />
        </mesh>
      </group>

      {/* Right leg */}
      <group ref={rightLeg} position={[0.23, 0.95, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <boxGeometry args={[0.34, 0.9, 0.4]} />
          <meshStandardMaterial color="#101827" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.85, 0.12]} castShadow>
          <boxGeometry args={[0.37, 0.2, 0.65]} />
          <meshStandardMaterial color="#312e81" metalness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
