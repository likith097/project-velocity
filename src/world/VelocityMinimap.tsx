import { districts, type DistrictName } from './districts'

type Props = {
  x: number
  z: number
  heading: number
  nearbyDistrict: DistrictName | null
}

// The walkable city spans -500..500 in world X/Z.
const WORLD_SPAN = 1000
const mapCoord = (value: number) => ((value + WORLD_SPAN / 2) / WORLD_SPAN) * 100

export default function VelocityMinimap({ x, z, heading, nearbyDistrict }: Props) {
  const playerX = mapCoord(x)
  const playerY = mapCoord(z)

  return (
    <div className="velocity-radar">
      <div className="velocity-radar-topline">
        <strong>VELOCITY RADAR</strong>
        <span><i /> LIVE</span>
      </div>
      <div className="velocity-radar-map" role="img" aria-label={`City radar. Player at X ${Math.round(x)}, Z ${Math.round(z)}. ${nearbyDistrict ? `Near ${nearbyDistrict}.` : ''}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {Array.from({length: 25}, (_, i) => 2 + i * 4).map(p => <path key={p} d={`M${p} 0V100 M0 ${p}H100`} stroke="#25445d" strokeWidth="0.8" />)}
          <path d="M50 0V100 M0 50H100" stroke="#48b9d6" strokeWidth="0.55" strokeDasharray="2 2" />
          <path d="M27.5 50V25 M72.5 50V25" stroke="#29445b" strokeWidth="6" />
          <circle cx="50" cy="50" r="4.4" fill="#0b2940" stroke="#22d3ee" strokeWidth="0.65" />
          {districts.map(district => (
            <g key={district.name}>
              <circle cx={mapCoord(district.x)} cy={mapCoord(district.z)} r={nearbyDistrict === district.name ? 4.5 : 3.2} fill={district.color} fillOpacity="0.17" stroke={district.color} strokeWidth="0.55" />
              <circle cx={mapCoord(district.x)} cy={mapCoord(district.z)} r="1.35" fill={district.color} />
            </g>
          ))}
          <circle cx={playerX} cy={playerY} r="3.5" fill="#ffffff" fillOpacity="0.12" />
          <g transform={`translate(${playerX} ${playerY}) rotate(${heading * 180 / Math.PI})`}>
            <path d="M0 -3.5 L-2.2 2.7 L0 1.5 L2.2 2.7 Z" fill="#ffffff" stroke="#05101d" strokeWidth="0.6" />
          </g>
        </svg>
        <span className="velocity-radar-north">N ↑</span>
      </div>
      <div className="velocity-radar-footer">
        <span>POS {Math.round(x)}, {Math.round(z)}</span>
        <span>{nearbyDistrict ?? 'FREE ROAM'}</span>
      </div>
      <div className="velocity-radar-legend">
        {districts.map(district => (
          <span key={district.name}><i style={{ backgroundColor: district.color }} />{district.name}</span>
        ))}
      </div>
    </div>
  )
}
