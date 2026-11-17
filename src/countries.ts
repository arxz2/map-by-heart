import data from './countries.json'
import smallCountryData from './small-countries.json'

import type { CountryRegion } from './regions'
import type { LanguagePack } from './locales/types'

type CountryGeometry = {
  code: string
  region: CountryRegion
  marker?: [number, number]
  hideWhenSmallOff: boolean
  disputed: boolean
}

export type Country = CountryGeometry & {
  name: string
  answers: string[]
  wordPrefixes: string[]
}

const smallCountries: Partial<Record<string, {
  marker: number[]
  showMarker: boolean
  hideWhenSmallOff: boolean
}>> = smallCountryData
const countryData: Record<string, { region: string; disputed?: boolean }> = data

export const countryGeometry: CountryGeometry[] = Object.entries(countryData).map(([code, entry]) => {
  const options = smallCountries[code]
  const marker = options?.showMarker ? options.marker as CountryGeometry['marker'] : undefined
  return {
    code, region: entry.region as CountryRegion, marker,
    hideWhenSmallOff: options?.hideWhenSmallOff ?? false, disputed: entry.disputed ?? false,
  }
})

export function createCountryCatalog(language: LanguagePack) {
  const displayNames = new Intl.DisplayNames([language.locale], { type: 'region', fallback: 'none' })
  const normalize = (value: string) => {
    const lower = value.normalize('NFC').toLocaleLowerCase(language.locale)
    return (language.fold?.(lower) ?? lower).replace(/[^\p{L}\p{M}\p{N}]/gu, '')
  }
  const words = language.wordStarts ?? ((value: string) =>
    [...value.matchAll(/[\p{L}\p{M}\p{N}]+/gu)].map(word => word.index))
  const countries: Country[] = countryGeometry.map(country => {
    const { code } = country
    const name = language.names[code] ?? displayNames.of(code) ?? code
    const spellings = [name, ...(language.aliases[code] ?? [])]
    const wordPrefixes = spellings.flatMap(spelling =>
      words(spelling).slice(1).map(index => normalize(spelling.slice(index))))
    return {
      ...country, name, answers: spellings.map(normalize), wordPrefixes,
    }
  }).sort((first, second) => first.name.localeCompare(second.name, language.locale))
  return { countries, normalize }
}

export function countrySuggestions(remaining: Country[], query: string) {
  if (!/\p{L}.*\p{L}/u.test(query)) return []
  const exact: Country[] = []
  const fromStart: Country[] = []
  const fromWord: Country[] = []
  for (const country of remaining) {
    if (country.answers.includes(query)) exact.push(country)
    else if (country.answers.some(answer => answer.startsWith(query))) fromStart.push(country)
    else if (country.wordPrefixes.some(prefix => prefix.startsWith(query))) fromWord.push(country)
  }
  const matches = [...exact, ...fromStart, ...fromWord]
  // The first accepted answer is the name shown in the suggestion.
  const matchesName = (country: Country) => country.answers[0].includes(query)
  return [...matches.filter(matchesName), ...matches.filter(country => !matchesName(country))].slice(0, 8)
}
