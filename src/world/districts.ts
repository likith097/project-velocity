export const districts = [
  { name: 'PROJECTS', x: -300, z: 300, color: '#22d3ee' },
  { name: 'EXPERIENCE', x: 300, z: -300, color: '#a78bfa' },
  { name: 'SKILLS', x: -300, z: -300, color: '#3b82f6' },
  { name: 'ABOUT', x: 300, z: 300, color: '#f59e0b' },
  { name: 'CONTACT', x: -75, z: 75, color: '#10b981' },
] as const

export type DistrictName = (typeof districts)[number]['name']