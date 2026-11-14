import type { NextMode } from './country-navigation'
import { defaultLanguage, languages } from './locales'
import { regions } from './regions'
import type { CountryRegion } from './regions'
import type { MapProjection } from './WorldMap'

export const allRegions = regions.filter(region => region !== 'world')
export const settingsStorageKey = 'map-by-heart.settings'
export const minDefaultZoom = 1
export const maxZoom = 22

export type GameSettings = {
  mode: 'explore' | 'timed'
  locale: string
  selectedRegions: CountryRegion[]
  includeSmall: boolean
  includeDisputed: boolean
  nextMode: NextMode
  projection: MapProjection
  defaultZoom: number
}

export type RoundScope = Pick<GameSettings, 'selectedRegions' | 'includeSmall' | 'includeDisputed'>

const defaults: GameSettings = {
  mode: 'explore',
  locale: defaultLanguage.locale,
  selectedRegions: allRegions,
  includeSmall: false,
  includeDisputed: false,
  nextMode: 'nearby',
  projection: 'mercator',
  defaultZoom: 6,
}

export function loadSettings(): GameSettings {
  try {
    const legacyLocale = localStorage.getItem('map-by-heart.language')
    const locale = languages.find(language => language.locale === legacyLocale)?.locale ?? defaults.locale
    let saved: Partial<Record<keyof GameSettings, unknown>> | null = null
    try {
      saved = JSON.parse(localStorage.getItem(settingsStorageKey) ?? 'null')
    } catch {
      // Keep the previous language preference if the settings data is unreadable.
    }
    const selectedRegions = saved?.selectedRegions
    return {
      mode: saved?.mode === 'timed' ? 'timed' : defaults.mode,
      locale: languages.find(language => language.locale === saved?.locale)?.locale ?? locale,
      selectedRegions: Array.isArray(selectedRegions) ? allRegions.filter(region => selectedRegions.includes(region)) : defaults.selectedRegions,
      includeSmall: typeof saved?.includeSmall === 'boolean' ? saved.includeSmall : defaults.includeSmall,
      includeDisputed: typeof saved?.includeDisputed === 'boolean' ? saved.includeDisputed : defaults.includeDisputed,
      nextMode: saved?.nextMode === 'random' || saved?.nextMode === 'nearby' ? saved.nextMode : defaults.nextMode,
      projection: saved?.projection === 'equal-earth' || saved?.projection === 'mercator' ? saved.projection : defaults.projection,
      defaultZoom: typeof saved?.defaultZoom === 'number' && saved.defaultZoom >= minDefaultZoom && saved.defaultZoom <= maxZoom
        ? saved.defaultZoom : defaults.defaultZoom,
    }
  } catch {
    return defaults
  }
}
