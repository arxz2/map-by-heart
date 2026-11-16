import { countryGeometry } from './countries'
import { allRegions } from './settings'
import type { GameSettings, RoundScope } from './settings'
import type { Challenge } from './challenge-code'

export const startingLives = 3
export type RoundTiming = { scope: RoundScope | null; startedAt: number | null; stoppedAt: number | null }
export type SelectionHistory = { entries: string[]; index: number; cycleStart: number }
export type SavedRound = RoundTiming & {
  mode: GameSettings['mode']
  guessed: string[]
  selected: string | null
  history: SelectionHistory
  lives: number
  last: string | null
}

export function roundStorageKey(challenge: Challenge | null) {
  const base = 'map-by-heart.round.v1'
  if (!challenge) return base
  const { scope, guessed, total, seconds } = challenge
  return base + ':' + JSON.stringify([scope.selectedRegions, scope.includeSmall, scope.includeDisputed, guessed, total, seconds])
}

function readStored<T>(key: string): Partial<T> | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
  } catch {
    return null
  }
}

function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Play can continue when the browser does not allow storage.
  }
}

const countryCodes = new Set(countryGeometry.map(country => country.code))
const isCode = (value: unknown): value is string => typeof value === 'string' && countryCodes.has(value)
const isTimestamp = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0

export function loadRound(key: string, mode: GameSettings['mode']): SavedRound | null {
  const saved = readStored<SavedRound>(key)
  if (saved?.mode !== mode || !Array.isArray(saved.guessed) || !saved.guessed.every(isCode) ||
      (saved.selected !== null && !isCode(saved.selected)) || (saved.last !== null && !isCode(saved.last))) return null
  const { guessed, selected, history, lives, last, scope, startedAt, stoppedAt } = saved
  if (!history || !Array.isArray(history.entries) || !history.entries.every(isCode) ||
      !Number.isInteger(history.index) || history.index < 0 || history.index >= Math.max(1, history.entries.length) ||
      !Number.isInteger(history.cycleStart) || history.cycleStart < 0 || history.cycleStart > history.entries.length ||
      typeof lives !== 'number' || !Number.isInteger(lives) || lives < 0 || lives > startingLives) return null
  if (mode === 'timed' && isTimestamp(startedAt)) {
    if (!scope || !Array.isArray(scope.selectedRegions) || !scope.selectedRegions.length ||
        !scope.selectedRegions.every(region => allRegions.includes(region)) ||
        typeof scope.includeSmall !== 'boolean' || typeof scope.includeDisputed !== 'boolean' ||
        (stoppedAt !== null && (!isTimestamp(stoppedAt) || stoppedAt < startedAt))) return null
    return { mode, guessed, selected, history, lives, last, scope, startedAt, stoppedAt }
  }
  if (scope !== null || startedAt !== null || stoppedAt !== null) return null
  return { mode, guessed, selected, history, lives, last, scope, startedAt, stoppedAt }
}

export function saveRound(key: string, round: SavedRound) {
  saveStored(key, round)
}

type SavedMapView = { x: number; y: number; scale: number; height: number; layout: string }

export function loadMapView(key: string, layout: string): SavedMapView | null {
  const saved = readStored<SavedMapView>(key + '.map')
  if (!saved || saved.layout !== layout) return null
  const { x, y, scale, height } = saved
  if (x === undefined || y === undefined || scale === undefined || height === undefined ||
      ![x, y, scale, height].every(Number.isFinite) || scale <= 0 || height <= 0) return null
  return { x, y, scale, height, layout }
}

export function saveMapView(key: string, view: SavedMapView) {
  saveStored(key + '.map', view)
}

export function clearRound(key: string) {
  try {
    localStorage.removeItem(key)
    localStorage.removeItem(key + '.map')
  } catch {
    // Storage can be unavailable.
  }
}
