
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Camera, Group, MathUtils, Vector3 } from 'three'
import CyberCharacter from './CyberCharacter'
import { districts, type DistrictName } from './districts'
import { isWalkable } from './VelocityCityscape'

// Character movement
const WALK_SPEED = 7
const RUN_SPEED = 12
const ACCELERATION = 10
const CHARACTER_TURN_SPEED = 12

// GTA-style third-person orbit camera
const CAMERA_DISTANCE = 9
const CAMERA_TARGET_HEIGHT = 1.6
const CAMERA_FOLLOW_SPEED = 9
const CAMERA_LOOK_SPEED = 12
const MOUSE_SENSITIVITY = 0.0025
const HORIZONTAL_SENSITIVITY = 0.0045

// Pitch is measured in radians above the horizon.
const MIN_PITCH = -1.35
const MAX_PITCH = 1.35
const DEFAULT_PITCH = 0.28

// Accessible areas
const WORLD_LIMIT = 494

// Interaction
const INTERACTION_RADIUS = 17

type PlayerControllerProps = {
  onNearbyDistrictChange: (
    district: DistrictName | null
  ) => void
  onExplore: (district: DistrictName) => void
  interactionOpen: boolean
  onPlayerUpdate?: (x: number, z: number, heading: number) => void
  teleport?: { x: number; y: number; z: number; id: number }
}

export default function PlayerController({
  onNearbyDistrictChange,
  onExplore,
  interactionOpen,
  onPlayerUpdate,
  teleport,
}: PlayerControllerProps) {
  const player = useRef<Group>(null)
  const keys = useRef(new Set<string>())

  const [moving, setMoving] = useState(false)
  const [running, setRunning] = useState(false)

  const { camera, gl } = useThree()

  // Orbit angles
  const yaw = useRef(0)
  const pitch = useRef(DEFAULT_PITCH)

  // Camera target smoothing
  const smoothedTarget = useRef(new Vector3())
  const desiredTarget = useRef(new Vector3())
  const desiredCamera = useRef(new Vector3())

  // Character velocity
  const currentVelocity = useRef(new Vector3())
  const desiredVelocity = useRef(new Vector3())

  // Nearby district
  const nearbyDistrict = useRef<DistrictName | null>(null)

  // Latest callbacks
  const onExploreRef = useRef(onExplore)
  const onNearbyChangeRef = useRef(
    onNearbyDistrictChange
  )
  const interactionOpenRef = useRef(interactionOpen)
  const onPlayerUpdateRef = useRef(onPlayerUpdate)
  const radarElapsed = useRef(0)
  const onRoof = useRef(false)
  useEffect(() => {
    if (!teleport || !player.current) return
    player.current.position.set(teleport.x, teleport.y, teleport.z)
    onRoof.current = teleport.y > 100
    currentVelocity.current.set(0, 0, 0)
    desiredVelocity.current.set(0, 0, 0)
    keys.current.clear()
    const target = new Vector3(teleport.x, teleport.y + CAMERA_TARGET_HEIGHT, teleport.z)
    smoothedTarget.current.copy(target)
    camera.position.set(teleport.x, teleport.y + 4, teleport.z + CAMERA_DISTANCE)
    camera.lookAt(target)
  }, [teleport, camera])

  useEffect(() => {
    onExploreRef.current = onExplore
    onNearbyChangeRef.current =
      onNearbyDistrictChange
    interactionOpenRef.current = interactionOpen
    onPlayerUpdateRef.current = onPlayerUpdate
  }, [
    onExplore,
    onNearbyDistrictChange,
    interactionOpen,
    onPlayerUpdate,
  ])

  useEffect(() => {
    const canvas = gl.domElement

    const movementKeys = new Set([
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ShiftLeft',
      'ShiftRight',
    ])

    // Click the canvas to enable unrestricted mouse-look.
    const onCanvasClick = () => {
      if (
        interactionOpenRef.current ||
        document.pointerLockElement === canvas
      ) {
        return
      }

      void canvas.requestPointerLock().catch(() => {
        // Camera still works while the mouse is
        // over the canvas if pointer lock fails.
      })
    }

    // Mouse rotates the camera around the player.
    const onMouseMove = (event: MouseEvent) => {
      if (interactionOpenRef.current) return

      yaw.current -=
  event.movementX * HORIZONTAL_SENSITIVITY

      pitch.current = MathUtils.clamp(
  pitch.current +
    event.movementY * MOUSE_SENSITIVITY,
  MIN_PITCH,
  MAX_PITCH
)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (interactionOpenRef.current) return

      if (
        event.code === 'KeyE' &&
        !event.repeat &&
        nearbyDistrict.current
      ) {
        event.preventDefault()

        const district = nearbyDistrict.current

        keys.current.clear()
        currentVelocity.current.set(0, 0, 0)
        desiredVelocity.current.set(0, 0, 0)

        onExploreRef.current(district)

        if (document.pointerLockElement === canvas) {
          document.exitPointerLock()
        }

        return
      }

      if (movementKeys.has(event.code)) {
        event.preventDefault()
        keys.current.add(event.code)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code)
    }

    const onBlur = () => {
      keys.current.clear()
    }

    const onPointerLockChange = () => {
      if (document.pointerLockElement !== canvas) {
        keys.current.clear()
      }
    }

    canvas.style.cursor = 'crosshair'

    canvas.addEventListener(
      'click',
      onCanvasClick
    )

    canvas.addEventListener(
      'mousemove',
      onMouseMove
    )

    window.addEventListener(
      'keydown',
      onKeyDown
    )

    window.addEventListener(
      'keyup',
      onKeyUp
    )

    window.addEventListener(
      'blur',
      onBlur
    )

    document.addEventListener(
      'pointerlockchange',
      onPointerLockChange
    )

    return () => {
      canvas.style.cursor = ''

      canvas.removeEventListener(
        'click',
        onCanvasClick
      )

      canvas.removeEventListener(
        'mousemove',
        onMouseMove
      )

      window.removeEventListener(
        'keydown',
        onKeyDown
      )

      window.removeEventListener(
        'keyup',
        onKeyUp
      )

      window.removeEventListener(
        'blur',
        onBlur
      )

      document.removeEventListener(
        'pointerlockchange',
        onPointerLockChange
      )

      if (document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }
  }, [gl])

  // Set the initial camera behind the player.
  useEffect(() => {
    const initialTarget = new Vector3(
      0,
      CAMERA_TARGET_HEIGHT,
      0
    )

    smoothedTarget.current.copy(initialTarget)

    const horizontalDistance =
      CAMERA_DISTANCE * Math.cos(pitch.current)

    camera.position.set(
      Math.sin(yaw.current) * horizontalDistance,
      CAMERA_TARGET_HEIGHT +
        Math.sin(pitch.current) * CAMERA_DISTANCE,
      Math.cos(yaw.current) * horizontalDistance
    )

    camera.lookAt(initialTarget)
  }, [camera])

  useFrame((_, delta) => {
    const group = player.current
    if (!group) return

    const dt = Math.min(delta, 0.05)

    if (interactionOpen) {
      keys.current.clear()
      currentVelocity.current.set(0, 0, 0)
      desiredVelocity.current.set(0, 0, 0)

      setMoving(previous =>
        previous ? false : previous
      )

      setRunning(previous =>
        previous ? false : previous
      )

      return
    }

    // Read keyboard movement.
    const horizontal =
      Number(
        keys.current.has('KeyD') ||
        keys.current.has('ArrowRight')
      ) -
      Number(
        keys.current.has('KeyA') ||
        keys.current.has('ArrowLeft')
      )

    const vertical =
      Number(
        keys.current.has('KeyW') ||
        keys.current.has('ArrowUp')
      ) -
      Number(
        keys.current.has('KeyS') ||
        keys.current.has('ArrowDown')
      )

    const wantsToMove =
      horizontal !== 0 || vertical !== 0

    const sprintPressed =
      keys.current.has('ShiftLeft') ||
      keys.current.has('ShiftRight')

    const speed = sprintPressed
      ? RUN_SPEED
      : WALK_SPEED

    // Camera-relative movement.
    // Forward points from the camera toward the player.
    const forwardX = -Math.sin(yaw.current)
    const forwardZ = -Math.cos(yaw.current)

    const rightX = Math.cos(yaw.current)
    const rightZ = -Math.sin(yaw.current)

    if (wantsToMove) {
      const inputLength = Math.hypot(
        horizontal,
        vertical
      )

      desiredVelocity.current.set(
        (
          forwardX * vertical +
          rightX * horizontal
        ) / inputLength,
        0,
        (
          forwardZ * vertical +
          rightZ * horizontal
        ) / inputLength
      )

      desiredVelocity.current.multiplyScalar(speed)
    } else {
      desiredVelocity.current.set(0, 0, 0)
    }

    // Smooth character acceleration.
    const movementSmoothing =
      1 - Math.exp(-ACCELERATION * dt)

    currentVelocity.current.lerp(
      desiredVelocity.current,
      movementSmoothing
    )

    // Candidate position.
    const nextX = MathUtils.clamp(
      group.position.x +
        currentVelocity.current.x * dt,
      -WORLD_LIMIT,
      WORLD_LIMIT
    )

    const nextZ = MathUtils.clamp(
      group.position.z +
        currentVelocity.current.z * dt,
      -WORLD_LIMIT,
      WORLD_LIMIT
    )

    // Street grid and landmark plazas; the helipad has separate boundaries.
    const permitted = onRoof.current
      ? nextX >= -11 && nextX <= 11 && nextZ >= 9 && nextZ <= 23
      : isWalkable(nextX, nextZ)
    if (permitted) {
      group.position.x = nextX
      group.position.z = nextZ
    } else {
      currentVelocity.current.set(0, 0, 0)
    }

    const actualSpeed =
      currentVelocity.current.length()

    const isMoving = actualSpeed > 0.15

    const isRunning =
      isMoving &&
      sprintPressed &&
      actualSpeed > WALK_SPEED

    setMoving(previous =>
      previous === isMoving
        ? previous
        : isMoving
    )

    setRunning(previous =>
      previous === isRunning
        ? previous
        : isRunning
    )

    // Turn the character toward the direction of travel.
    // This allows natural walking and strafing.
    if (isMoving) {
      const targetRotation = Math.atan2(
        currentVelocity.current.x,
        currentVelocity.current.z
      )

      const rotationDifference = Math.atan2(
        Math.sin(targetRotation - group.rotation.y),
        Math.cos(targetRotation - group.rotation.y)
      )

      const rotationSmoothing =
        1 - Math.exp(-CHARACTER_TURN_SPEED * dt)

      group.rotation.y +=
        rotationDifference * rotationSmoothing
    }

    // District proximity detection.
    let closest: DistrictName | null = null
    let closestDistance = INTERACTION_RADIUS

    for (const district of districts) {
      const distance = Math.hypot(
        group.position.x - district.x,
        group.position.z - district.z
      )

      if (distance < closestDistance && (district.name !== 'CONTACT' || onRoof.current)) {
        closestDistance = distance
        closest = district.name
      }
    }

    if (nearbyDistrict.current !== closest) {
      nearbyDistrict.current = closest
      onNearbyChangeRef.current(closest)
    }

    // Send a lightweight player position update to the HUD (~10 Hz).
    // This does not alter camera movement or character physics.
    radarElapsed.current += dt
    if (radarElapsed.current >= 0.1) {
      radarElapsed.current = 0
      onPlayerUpdateRef.current?.(
        group.position.x,
        group.position.z,
        -yaw.current
      )
    }

    // Camera orbit target follows the player.
    desiredTarget.current.copy(group.position)
    desiredTarget.current.y += CAMERA_TARGET_HEIGHT

    const followSmoothing =
      1 - Math.exp(-CAMERA_FOLLOW_SPEED * dt)

    smoothedTarget.current.lerp(
      desiredTarget.current,
      followSmoothing
    )

    // Orbit around the smoothed target.
    const horizontalDistance =
      CAMERA_DISTANCE * Math.cos(pitch.current)

    desiredCamera.current.set(
      smoothedTarget.current.x +
        Math.sin(yaw.current) * horizontalDistance,

      smoothedTarget.current.y +
        Math.sin(pitch.current) * CAMERA_DISTANCE,

      smoothedTarget.current.z +
        Math.cos(yaw.current) * horizontalDistance
    )

    // Smooth camera translation.
    camera.position.lerp(
      desiredCamera.current,
      followSmoothing
    )

    // Smooth camera orientation.
    // Camera always looks at the character.
    const lookSmoothing =
      1 - Math.exp(-CAMERA_LOOK_SPEED * dt)

    cameraTargetQuaternion(
      camera,
      smoothedTarget.current,
      lookSmoothing
    )
  })

  return (
    <group ref={player} position={[0, 0, 0]}>
      <CyberCharacter
        moving={moving}
        running={running}
      />
    </group>
  )
}

// Smoothly rotate the camera toward its target.
function cameraTargetQuaternion(
  camera: Camera,
  target: Vector3,
  smoothing: number
) {
  const previousRotation = camera.quaternion.clone()

  camera.lookAt(target)

  const targetRotation = camera.quaternion.clone()

  camera.quaternion.copy(previousRotation)
  camera.quaternion.slerp(
    targetRotation,
    smoothing
  )
}

