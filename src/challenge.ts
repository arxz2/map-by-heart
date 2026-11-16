import { allRegions } from './settings'
import { challengeChecksum, challengePrefix, checksumSize, decodeBase64Url, encodeBase64Url, packChallenge, payloadSize, roundDuration, unpackChallenge } from './challenge-code'
import type { Challenge } from './challenge-code'

const publishedGameUrl = 'https://arxz2.github.io/map-by-heart/'
export { roundDuration }

export function createChallengeUrl(challenge: Challenge): string {
  const payload = packChallenge(challenge)
  const checksum = challengeChecksum(payload)
  const code = encodeBase64Url(Uint8Array.of(...payload, checksum >> 8, checksum & 255))
  return publishedGameUrl + challengePrefix + code
}

export function readChallenge(hash: string): Challenge | null {
  return hash.startsWith('#c=') ? readCompactChallenge(hash) : readLegacyChallenge(hash)
}

function readCompactChallenge(hash: string): Challenge | null {
  if (!hash.startsWith(challengePrefix)) return null
  const code = hash.slice(challengePrefix.length)
  const bytes = decodeBase64Url(code, payloadSize + checksumSize)
  if (!bytes) return null
  const payload = bytes.subarray(0, payloadSize)
  const checksum = (bytes[payloadSize] << 8) | bytes[payloadSize + 1]
  return challengeChecksum(payload) === checksum ? unpackChallenge(payload) : null
}

function readLegacyChallenge(hash: string): Challenge | null {
  const params = new URLSearchParams(hash.slice(1))
  if (params.get('challenge') !== '1') return null

  const regionCodes = params.get('regions')?.split(',') ?? []
  const selectedRegions = allRegions.filter(region => regionCodes.includes(region))
  const small = params.get('small')
  const disputed = params.get('disputed')
  const score = params.get('score')?.match(/^(\d+)\/(\d+)$/)
  const secondsText = params.get('seconds') ?? ''
  const seconds = Number(secondsText)

  if (!selectedRegions.length || selectedRegions.length !== regionCodes.length ||
    (small !== '0' && small !== '1') || (disputed !== '0' && disputed !== '1') ||
    !score || !/^\d+$/.test(secondsText) || seconds > roundDuration / 1000) return null

  const guessed = Number(score[1])
  const total = Number(score[2])
  if (!Number.isSafeInteger(total) || total < 1 || guessed > total) return null

  return {
    scope: { selectedRegions, includeSmall: small === '1', includeDisputed: disputed === '1' },
    guessed, total, seconds,
  }
}
