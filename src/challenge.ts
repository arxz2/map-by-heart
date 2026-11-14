import { allRegions } from './settings'
import type { RoundScope } from './settings'

const publishedGameUrl = 'https://arxz2.github.io/map-by-heart/'
export const roundDuration = 15 * 60 * 1000

type Challenge = {
  scope: RoundScope
  guessed: number
  total: number
  seconds: number
}

export function createChallengeUrl({ scope, guessed, total, seconds }: Challenge): string {
  const url = new URL(publishedGameUrl)
  url.hash = new URLSearchParams({
    challenge: '1',
    regions: allRegions.filter(region => scope.selectedRegions.includes(region)).join(','),
    small: scope.includeSmall ? '1' : '0',
    disputed: scope.includeDisputed ? '1' : '0',
    score: `${guessed}/${total}`,
    seconds: String(seconds),
  }).toString()
  return url.href
}

export function readChallenge(hash: string): Challenge | null {
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
