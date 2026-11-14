import { geoArea, geoCentroid, geoDistance } from 'd3-geo'
import type { MultiPolygon, Polygon } from 'geojson'
import type { Country } from './countries'
import type { World } from './WorldMap'
import countryBorders from './country-borders.json'

export type NextMode = 'random' | 'nearby'
export type Coordinates = [number, number]
// Skip the current country plus the 200 preceding selections in this cycle.
export const selectionHistorySize = 201

export function mainPolygon(geometry: Polygon | MultiPolygon): Polygon {
  if (geometry.type === 'Polygon') return geometry
  let largest = geometry.coordinates[0]
  let largestArea = 0
  for (const coordinates of geometry.coordinates) {
    const area = geoArea({ type: 'Polygon', coordinates })
    if (area > largestArea) {
      largest = coordinates
      largestArea = area
    }
  }
  return { type: 'Polygon', coordinates: largest }
}

export function countryLocations(world: World, countries: Pick<Country, 'code' | 'marker'>[]) {
  const locations = new Map<string, Coordinates>()
  for (const feature of world.features) {
    if (!feature.properties.code) continue
    locations.set(feature.properties.code, geoCentroid(mainPolygon(feature.geometry)))
  }
  for (const { code, marker } of countries) {
    if (marker) locations.set(code, marker)
  }
  return locations
}

const borders: Partial<Record<string, readonly string[]>> = countryBorders

export function nextCountry(
  remaining: Country[],
  lastCode: string | null,
  mode: NextMode,
  locations: Map<string, Coordinates>,
  recentSelections: string[],
) {
  const candidates = remaining.filter(country => country.code !== lastCode &&
    (mode === 'random' || !recentSelections.includes(country.code)))
  if (!candidates.length) return mode === 'random' ? remaining[0] : undefined
  const origin = lastCode && locations.get(lastCode)
  if (mode === 'random' || !origin) return candidates[Math.floor(Math.random() * candidates.length)]

  const neighbors = lastCode ? borders[lastCode] : undefined
  const borderingCandidates = candidates.filter(candidate => neighbors?.includes(candidate.code))
  if (borderingCandidates.length) return borderingCandidates[Math.floor(Math.random() * borderingCandidates.length)]

  let nearest = candidates[0]
  let nearestDistance = Infinity
  for (const candidate of candidates) {
    const location = locations.get(candidate.code)
    if (!location) continue
    const distance = geoDistance(origin, location)
    if (distance < nearestDistance) {
      nearest = candidate
      nearestDistance = distance
    }
  }
  return nearest
}
