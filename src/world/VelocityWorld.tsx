
import { useCallback, useEffect, useRef, useState } from 'react'
import DistrictContent from './DistrictContent'
import type { DistrictName } from './districts'
import './world.css'

const destinations: DistrictName[] = [
  'PROJECTS',
  'EXPERIENCE',
  'SKILLS',
  'ABOUT',
  'CONTACT',
]

const headings: Record<DistrictName, string> = {
  PROJECTS: 'Selected Projects',
  EXPERIENCE: 'Professional Experience',
  SKILLS: 'Technical Skills',
  ABOUT: 'About Me',
  CONTACT: 'Get in Touch',
}

const isDistrictName = (value: unknown): value is DistrictName =>
  typeof value === 'string' &&
  destinations.some((destination) => destination === value)

export default function VelocityWorld({
  onExit,
}: {
  onExit: () => void
}) {
  const [active, setActive] = useState<DistrictName | null>(null)
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const sendToCity = useCallback(
    (type: string, extra: Record<string, unknown> = {}) => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          source: 'velocity-react',
          type,
          ...extra,
        },
        window.location.origin,
      )
    },
    [],
  )

  const openDistrict = useCallback(
    (district: DistrictName) => {
      setActive(district)
      sendToCity('PAUSE_PLAYER')
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    },
    [sendToCity],
  )

  const closeDistrict = useCallback(() => {
    setActive(null)
    sendToCity('RESUME_PLAYER')
  }, [sendToCity])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.source !== iframeRef.current?.contentWindow) return

      const data = event.data

      if (
        !data ||
        data.source !== 'velocity-city' ||
        data.type !== 'OPEN_DISTRICT' ||
        !isDistrictName(data.district)
      ) {
        return
      }

      openDistrict(data.district)
    }

    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [openDistrict])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && active) {
        event.preventDefault()
        closeDistrict()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active, closeDistrict])

  return (
    <section
      className="velocity-world velocity-integrated"
      role="dialog"
      aria-modal="true"
      aria-label="Project Velocity City"
    >
      <iframe
        ref={iframeRef}
        title="Project Velocity interactive city"
        className="velocity-city-frame"
        src="/velocity-city/index.html"
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
      />

      {!loaded && (
        <div className="velocity-city-loading">
          Loading Project Velocity city...
        </div>
      )}

      <header className="velocity-world-header velocity-integrated-header">
        <div>
          <strong>
            LK<span>.</span> VELOCITY CITY
          </strong>
          <small>E5.5D13 / INTEGRATED WORLD</small>
        </div>

        <button type="button" onClick={onExit}>
          Exit World
        </button>
        <aside className="velocity-instructions-panel" aria-label="Controls and instructions">
          <h2>CONTROLS &amp; INSTRUCTIONS</h2>
          <div className="velocity-instructions-grid">
            <div><kbd>W A S D</kbd><span>Move</span></div>
            <div><kbd>Mouse</kbd><span>Look around</span></div>
            <div><kbd>E</kbd><span>Interact / Security</span></div>
            <div><kbd>I</kbd><span>Enter elevator</span></div>
            <div><kbd>Esc</kbd><span>Release mouse</span></div>
            <div><kbd>M</kbd><span>Map / World</span></div>
          </div>
          <p>
            Explore the five districts, obtain security clearance,
            and use the Crystal Tower elevators to access portfolio destinations.
          </p>
        </aside>
      </header>

      <nav
        className="velocity-district-nav"
        aria-label="Portfolio districts"
      >
        {destinations.map((destination) => (
          <button
            key={destination}
            type="button"
            onClick={() => openDistrict(destination)}
          >
            {destination}
          </button>
        ))}
      </nav>

      {active && (
        <div
          className="velocity-district-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={headings[active]}
        >
          <div className="velocity-district-panel">
            <div className="velocity-district-panel-header">
              <h2>{headings[active]}</h2>

              <button type="button" onClick={closeDistrict}>
                Close ×
              </button>
            </div>

            <DistrictContent district={active} />
          </div>
        </div>
      )}
    </section>
  )
}
