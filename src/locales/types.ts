import type { Region } from '../regions'

export type LanguagePack = {
  locale: string
  label: string
  direction: 'ltr' | 'rtl'
  regions: Record<Region, string>
  names: Partial<Record<string, string>>
  aliases: Partial<Record<string, string[]>>
  fold?: (value: string) => string
  wordStarts?: (value: string) => number[]
  messages: {
    title: string
    description: string
    language: string
    settings: string
    gameSettings: string
    startGame: string
    restartExplore: string
    endGame: string
    roundEndedManually: string
    accuracy: string
    mistakes: string
    elapsedTime: string
    livesRemaining: string
    copyResult: string
    resultCopied: string
    copyResultManually: string
    challengeMessage: (guessed: number, total: number, time: string) => string
    challengeShareMessage: (guessed: number, total: number, time: string) => string
    enabled: string
    disabled: string
    timedMode: string
    exploreMode: string
    learnMode: string
    countrySearch: string
    gameMode: string
    modeInfo: string
    modeDescriptions: Record<'timed' | 'explore' | 'learn', string>
    timeLeft: string
    lives: string
    roundOver: string
    timeExpired: string
    noLives: string
    roundScore: (guessed: number, total: number) => string
    roundSettingsHint: string
    regionSettings: string
    smallCountries: string
    disputedTerritories: string
    nextMode: string
    random: string
    nearby: string
    projection: string
    defaultZoom: string
    mercator: string
    done: string
    loadingMap: string
    mapError: string
    retry: string
    map: string
    noRegions: string
    selectedRegions: string
    mapLegend: string
    unguessed: string
    selected: string
    guessed: string
    countryMarker: string
    gameProgress: string
    overallProgress: string
    countryTotal: (count: number) => string
    answer: string
    chooseRegions: string
    gameComplete: string
    chooseCountry: string
    selectRegionHint: string
    gameCompleteHint: string
    selectCountryHint: string
    correct: (name: string) => string
    nextCountry: string
    countryName: string
    typeName: string
    suggestions: string
    wrongAnswer: (name: string) => string
    politicalMap: string
    mapZoom: string
    zoomIn: string
    zoomOut: string
    resetView: string
    recenter: string
  }
}
