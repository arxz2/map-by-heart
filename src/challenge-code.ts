import type { CountryRegion } from './regions.ts'

// Bit positions are part of the version 2 link format.
const regions: readonly CountryRegion[] = ['europe', 'americas', 'africa', 'middle-east-central-asia', 'asia-oceania']
export const roundDuration = 15 * 60 * 1000
export const payloadSize = 5
export const checksumSize = 2
export const challengePrefix = '#c=2.'

export type Challenge = {
  scope: { selectedRegions: CountryRegion[]; includeSmall: boolean; includeDisputed: boolean }
  guessed: number
  total: number
  seconds: number
}

export function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

export function decodeBase64Url(text: string, size: number) {
  if (text.length !== Math.ceil(size * 8 / 6) || !/^[A-Za-z0-9_-]+$/.test(text)) return null
  const bytes = Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0))
  return encodeBase64Url(bytes) === text ? bytes : null
}

// CRC-16/CCITT-FALSE detects accidental changes to a version 2 payload.
export function challengeChecksum(payload: Uint8Array) {
  let crc = 0xffff
  for (const byte of payload) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = ((crc << 1) ^ (crc & 0x8000 ? 0x1021 : 0)) & 0xffff
    }
  }
  return crc
}

export function packChallenge({ scope, guessed, total, seconds }: Challenge) {
  const regionMask = regions.reduce((mask, region, index) =>
    scope.selectedRegions.includes(region) ? mask | (1 << index) : mask, 0)
  if (!regionMask || ![guessed, total, seconds].every(Number.isInteger) ||
      guessed < 0 || guessed > total || total < 1 || total > 255 || seconds < 0 || seconds > roundDuration / 1000) {
    throw new Error('Challenge is out of range')
  }
  const flags = regionMask | (scope.includeSmall ? 32 : 0) | (scope.includeDisputed ? 64 : 0)
  return Uint8Array.of(flags, guessed, total, seconds >> 8, seconds & 255)
}

export function unpackChallenge(payload: Uint8Array): Challenge | null {
  if (payload.length !== payloadSize) return null
  const [flags, guessed, total, highSeconds, lowSeconds] = payload
  const seconds = (highSeconds << 8) | lowSeconds
  const selectedRegions = regions.filter((_, index) => flags & (1 << index))
  if (flags >= 128 || !selectedRegions.length || !total || guessed > total || seconds > roundDuration / 1000) return null
  return {
    scope: { selectedRegions, includeSmall: !!(flags & 32), includeDisputed: !!(flags & 64) },
    guessed, total, seconds,
  }
}
