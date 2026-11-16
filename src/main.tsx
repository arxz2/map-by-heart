import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import { countryGeometry, createCountryCatalog, countrySuggestions } from './countries'
import type { Country } from './countries'
import { countryHints, shuffleHintOrder } from './country-hints'
import { hintPhotos } from './hint-photos'
import type { CountryRegion } from './regions'
import { defaultLanguage, languages } from './locales'
import type { LanguagePack } from './locales/types'
import { countryLocations, nextCountry, selectionHistorySize } from './country-navigation'
import type { NextMode } from './country-navigation'
import { Icon } from './Icon'
import { WorldMap } from './WorldMap'
import type { MapProjection, World } from './WorldMap'
import { allRegions, loadSettings, maxZoom, minDefaultZoom, settingsStorageKey } from './settings'
import type { GameSettings, RoundScope } from './settings'
import { createChallengeUrl, readChallenge, roundDuration } from './challenge'
import type { Challenge } from './challenge-code'
import './styles.css'

const startingLives = 3
function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function roundScope({ selectedRegions, includeSmall, includeDisputed }: RoundScope): RoundScope {
  return { selectedRegions, includeSmall, includeDisputed }
}

type CountryFormProps = {
  candidates: Country[]
  messages: LanguagePack['messages']
  normalize: (value: string) => string
} & ({ country: Country; onAnswer: (correct: boolean) => void } | { onFind: (country: Country) => void })

function CountryForm(props: CountryFormProps) {
  const { candidates, messages: t, normalize } = props
  const searching = 'onFind' in props
  const input = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null)
  const query = normalize(value)
  const suggestions = countrySuggestions(candidates, query)
  const expanded = open && suggestions.length > 0
  const highlightedIndex = highlighted < suggestions.length ? highlighted : -1

  useEffect(() => {
    if (!searching && !document.querySelector('dialog[open]')) input.current?.focus({ preventScroll: true })
  }, [searching])

  function submitAnswer(answer: string, suggestion?: Country) {
    const normalized = normalize(answer)
    if (!normalized) return
    if ('onFind' in props) {
      const found = suggestion ?? candidates.find(item => item.answers.includes(normalized))
      if (!found) return
      setOpen(false)
      setHighlighted(-1)
      setValue(found.name)
      input.current?.blur()
      props.onFind(found)
      return
    }
    setOpen(false)
    setHighlighted(-1)
    const correct = props.country.answers.includes(normalized)
    props.onAnswer(correct)
    if (!correct) {
      setValue('')
      setWrongAnswer(answer.trim())
      input.current?.focus({ preventScroll: true })
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const suggestion = expanded ? suggestions[Math.max(0, highlightedIndex)] : undefined
    submitAnswer(suggestion?.name ?? value, suggestion)
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key === 'Enter' && event.repeat) event.preventDefault()
    if (event.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
    if (suggestions.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      setOpen(true)
      setHighlighted(current => {
        if (!expanded || current < 0) return event.key === 'ArrowDown' ? 0 : suggestions.length - 1
        const direction = event.key === 'ArrowDown' ? 1 : -1
        return (current + direction + suggestions.length) % suggestions.length
      })
    }
  }

  return (
    <form className="answer-form" onSubmit={submit}>
      <label htmlFor="country-name">{searching ? t.countrySearch : t.countryName}</label>
      <div className="answer-entry">
        <input ref={input} id="country-name" type="text" role="combobox" autoComplete="off" spellCheck={false}
          enterKeyHint={searching ? 'search' : undefined}
          placeholder={searching ? t.countrySearch : t.typeName} value={value} aria-autocomplete="list" aria-expanded={expanded}
          aria-controls={expanded ? 'country-suggestions' : undefined}
          aria-activedescendant={expanded && highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
          aria-invalid={wrongAnswer !== null} aria-describedby={wrongAnswer !== null ? 'answer-feedback' : undefined}
          onChange={event => { setValue(event.target.value); setOpen(true); setHighlighted(-1); setWrongAnswer(null) }}
          onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={navigate} />
        {expanded && <ul className="suggestions" id="country-suggestions" role="listbox" aria-label={t.suggestions}>
          {suggestions.map((item, index) => <li key={item.code} id={`option-${index}`} role="option"
            aria-selected={index === highlighted} onPointerDown={event => event.preventDefault()}
            onClick={() => submitAnswer(item.name, item)}>{item.name}</li>)}
        </ul>}
      </div>
      {wrongAnswer !== null && <p className="answer-feedback" id="answer-feedback" role="status">
        <Icon name="alert" size={17}/><span>{t.wrongAnswer(wrongAnswer)}</span>
      </p>}
    </form>
  )
}

type RegionScore = { region: CountryRegion; label: string; count: number; total: number }

function ExploreHints({ code, language }: { code: string; language: LanguagePack }) {
  const [index, setIndex] = useState(-1)
  const card = useRef<HTMLDivElement>(null)
  const { messages: t } = language
  const hints = countryHints(code, language.locale)
  const [order] = useState(() => shuffleHintOrder(hints))
  const current = hints[order[index]]
  const isOpen = index >= 0

  useEffect(() => {
    if (isOpen) card.current?.focus({ preventScroll: true })
  }, [isOpen])

  if (!hints.length) return null
  const photo = current?.photoId && hintPhotos[current.photoId]

  return (
    <div className="explore-hints">
      {current ? <div ref={card} className="hint-card" tabIndex={-1} role="group" aria-label={t.showHint}>
        {hints.length > 1 && <div className="hint-navigation">
          <button type="button" className="reset-button hint-previous" aria-label={t.previousHint}
            aria-controls="current-hint" aria-disabled={index === 0} onClick={() => setIndex(position => Math.max(0, position - 1))}>
            <Icon name="arrow" size={18}/>
          </button>
          <span>{index + 1} / {hints.length}</span>
          <button type="button" className="reset-button hint-next" aria-label={t.nextHint}
            aria-controls="current-hint" aria-disabled={index === hints.length - 1} onClick={() => setIndex(position => Math.min(hints.length - 1, position + 1))}>
            <Icon name="arrow" size={18}/>
          </button>
        </div>}
        <div id="current-hint" aria-live="polite" aria-atomic="true">
          <strong>{t.hintKinds[current.kind]} · {current.name}</strong>
          {current.note && <p>{current.note}</p>}
          {photo && <figure className="hint-photo">
            <img src={`${import.meta.env.BASE_URL}hint-photos/${current.photoId}.webp`} alt={photo.alt[language.locale] ?? photo.alt.en}
              width={photo.width} height={photo.height} loading="lazy" decoding="async" />
            <figcaption>
              <a href={photo.source} target="_blank" rel="noreferrer">{photo.title}</a> · {photo.author} ·{' '}
              <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>
              {current.photoId === 'gagarin' && <> · <a href="https://www.mos.ru/" target="_blank" rel="noreferrer">Mos.ru</a></>}
            </figcaption>
          </figure>}
        </div>
      </div> : <button type="button" className="reset-button" onClick={() => setIndex(0)}>{t.showHint}</button>}
    </div>
  )
}

function RegionProgress({ scores }: { scores: RegionScore[] }) {
  return (
    <ul className="region-progress">
      {scores.map(({ region, label, count, total }) => (
        <li key={region}>
          <div><span>{label}</span><b>{count} / {total}</b></div>
          <progress value={count} max={total || 1} aria-label={label} />
        </li>
      ))}
    </ul>
  )
}

function Game({ world, selectedRegions, includeSmall, includeDisputed, nextMode, autoAdvance, projection, defaultZoom, language, catalog, mode,
  startedAt, stoppedAt, challenge, onStart, onTimedFinish }: {
  world: World; selectedRegions: CountryRegion[]; includeSmall: boolean; includeDisputed: boolean;
  nextMode: NextMode; autoAdvance: boolean; projection: MapProjection; language: LanguagePack; catalog: ReturnType<typeof createCountryCatalog>;
  defaultZoom: number
  mode: GameSettings['mode']
  startedAt: number | null
  stoppedAt: number | null
  challenge: Challenge | null
  onStart: () => void
  onTimedFinish: (finishedAt: number) => void
}) {
  const { countries, normalize } = catalog
  const { messages: t } = language
  const wholeWorld = selectedRegions.length === allRegions.length
  const mapRegion = selectedRegions.length === 1 ? selectedRegions[0] : 'world'
  const active = countries.filter(country => selectedRegions.includes(country.region) &&
    (includeSmall || !country.hideWhenSmallOff) && (includeDisputed || !country.disputed))
  const locations = useMemo(() => countryLocations(world, countryGeometry), [world])
  const [guessed, setGuessed] = useState(new Set<string>())
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState({ entries: [] as string[], index: 0, cycleStart: 0 })
  const [jumpTarget, setJumpTarget] = useState<{ code: string; recenter?: boolean } | null>(null)
  const [last, setLast] = useState<string | null>(null)
  const [observedTime, setObservedTime] = useState(startedAt ?? 0)
  const [lives, setLives] = useState(startingLives)
  const resultsDialog = useRef<HTMLDialogElement>(null)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const shareTextField = useRef<HTMLTextAreaElement>(null)
  const remaining = active.filter(country => !guessed.has(country.code))
  const country = remaining.find(item => item.code === selected)
  const lastSelected = history.entries[history.index] ?? null
  const lastAnswer = active.find(item => item.code === last)
  const recentSelections = history.entries.slice(history.index,
    Math.min(history.index + selectionHistorySize, history.entries.length - history.cycleStart))
  const canRevisit = (code: string) => code !== lastSelected && remaining.some(item => item.code === code)
  const previousIndex = history.entries.findIndex((code, index) => index > history.index && canRevisit(code))
  const done = remaining.length === 0
  const timed = mode === 'timed'
  const learning = mode === 'learn'
  const deadline = startedAt === null ? null : startedAt + roundDuration
  const elapsed = startedAt === null ? 0 : Math.min(roundDuration, Math.max(0, (stoppedAt ?? observedTime) - startedAt))
  const timeLeft = roundDuration - elapsed
  const expired = timed && timeLeft === 0
  const outOfLives = timed && lives === 0
  const showResults = timed && startedAt !== null && (done || expired || outOfLives || stoppedAt !== null)
  const waitingToStart = timed && startedAt === null
  const selectionDisabled = waitingToStart || showResults
  const playActive = !learning && !selectionDisabled && !done
  const compactPlay = timed || playActive
  const resultTitle = done ? t.gameComplete : t.roundOver
  const resultReason = done ? t.gameCompleteHint : expired ? t.timeExpired : outOfLives ? t.noLives : t.roundEndedManually
  const noRegions = selectedRegions.length === 0
  const guessedCount = active.length - remaining.length
  const percent = active.length ? Math.floor(guessedCount / active.length * 100) : 0
  const mistakes = startingLives - lives
  const attempts = guessedCount + mistakes
  const regionScores = allRegions.filter(region => selectedRegions.includes(region)).map(region => {
    const countries = active.filter(country => country.region === region)
    return {
      region, label: language.regions[region],
      count: countries.filter(country => guessed.has(country.code)).length, total: countries.length,
    }
  })
  const resultStats = [
    { label: t.accuracy, value: attempts ? `${Math.round(guessedCount / attempts * 100)}%` : '—' },
    { label: t.mistakes, value: String(mistakes) },
    { label: t.elapsedTime, value: formatTime(elapsed) },
    { label: t.livesRemaining, value: `${lives} / ${startingLives}` },
  ]
  const resultSettings = [
    { label: t.smallCountries, enabled: includeSmall },
    { label: t.disputedTerritories, enabled: includeDisputed },
  ].map(({ label, enabled }) => ({ label, value: enabled ? t.enabled : t.disabled }))
  const shareText = showResults ? [
    t.challengeShareMessage(guessedCount, active.length, formatTime(elapsed)),
    createChallengeUrl({ scope: { selectedRegions, includeSmall, includeDisputed },
      guessed: guessedCount, total: active.length, seconds: Math.floor(elapsed / 1000) }),
  ].join('\n') : ''

  useEffect(() => {
    if (shareStatus !== 'manual') return
    shareTextField.current?.focus()
    shareTextField.current?.select()
  }, [shareStatus])

  async function copyResults() {
    setShareStatus('idle')
    try {
      await navigator.clipboard.writeText(shareText)
      setShareStatus('copied')
    } catch {
      setShareStatus('manual')
    }
  }

  useEffect(() => {
    if (!showResults) return
    onTimedFinish(observedTime)
    const dialog = resultsDialog.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [showResults, observedTime, onTimedFinish])

  useEffect(() => {
    if (deadline === null || showResults) return
    const tick = () => setObservedTime(Date.now())
    const interval = window.setInterval(tick, 200)
    document.addEventListener('visibilitychange', tick)
    tick()
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [deadline, showResults])

  function canPlay(now: number) {
    if (done || selectionDisabled) return false
    if (deadline !== null && now >= deadline) {
      setObservedTime(now)
      return false
    }
    return true
  }

  function showCountry(code: string) {
    setSelected(code)
    setLast(null)
  }

  function select(code: string, restartCycle = false) {
    showCountry(code)
    setHistory(previous => {
      if (previous.entries[previous.index] === code) return previous
      const past = previous.entries.slice(previous.index)
      return {
        entries: [code, ...past],
        index: 0,
        cycleStart: restartCycle ? past.length : previous.cycleStart < past.length ? previous.cycleStart : 0,
      }
    })
  }

  function revisit(index: number) {
    const code = history.entries[index]
    setHistory(previous => ({ ...previous, index }))
    setJumpTarget({ code })
    showCountry(code)
  }

  function advance(candidates: Country[]) {
    if (candidates.length === 1) {
      const { code } = candidates[0]
      setJumpTarget({ code, recenter: true })
      select(code)
      document.getElementById('country-name')?.focus({ preventScroll: true })
      return
    }
    for (let index = history.index - 1; index >= 0; index--) {
      const code = history.entries[index]
      if (code !== lastSelected && candidates.some(item => item.code === code)) {
        revisit(index)
        return
      }
    }
    const anchor = active.some(item => item.code === lastSelected) ? lastSelected : null
    const nextInCycle = nextCountry(candidates, anchor, nextMode, locations, recentSelections)
    const next = nextInCycle ?? nextCountry(candidates, anchor, nextMode, locations, [])
    if (!next) return
    setJumpTarget({ code: next.code })
    select(next.code, !nextInCycle)
  }

  function selectNext() {
    if (canPlay(Date.now())) advance(remaining)
  }

  useEffect(() => {
    function onTab(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey ||
          event.repeat || event.defaultPrevented || !playActive) return
      const target = event.target
      if (target !== document.body && !(target instanceof HTMLElement &&
          (target.id === 'game-main' || target.closest('.answer-form')))) return
      if (event.shiftKey && previousIndex < 0) return
      event.preventDefault()
      if (!canPlay(Date.now())) return
      if (event.shiftKey) revisit(previousIndex)
      else selectNext()
    }
    window.addEventListener('keydown', onTab)
    return () => window.removeEventListener('keydown', onTab)
  })

  function answer(code: string, correct: boolean) {
    const now = Date.now()
    if (!canPlay(now)) return
    if (timed) setObservedTime(now)
    if (!correct) {
      if (timed) setLives(count => Math.max(0, count - 1))
      return
    }
    setGuessed(previous => new Set([...previous, code]))
    if (autoAdvance && remaining.length > 1) advance(remaining.filter(item => item.code !== code))
    else setSelected(null)
    setLast(code)
  }

  return (
    <div className={`game-layout${learning ? ' learn-layout' : compactPlay ? ' compact-play' : ''}`}>
      {learning && <section className="panel learn-search" aria-label={t.countrySearch}>
        {noRegions ? <p className="play-instruction">{t.selectRegionHint}</p> :
          <CountryForm key={language.locale} candidates={active} messages={t} normalize={normalize} onFind={item => {
            showCountry(item.code)
            setJumpTarget({ code: item.code, recenter: true })
          }}/>}
      </section>}
      <section className="panel map-panel" aria-label={t.map}>
        <div className="map-header">
          <h2><Icon name="layers" size={19}/>{noRegions ? t.noRegions : wholeWorld || selectedRegions.length === 1
            ? language.regions[mapRegion]
            : t.selectedRegions}</h2>
        </div>
        <WorldMap key={`${projection}-${mapRegion}`} world={world} region={mapRegion} projection={projection} defaultZoom={defaultZoom} messages={t}
          active={active} guessed={guessed} selected={selectionDisabled ? null : country?.code ?? null} selectionDisabled={selectionDisabled}
          labelLocations={learning ? locations : undefined}
          selectedLocation={!selectionDisabled && country ? locations.get(country.code) : undefined}
          jumpTarget={!selectionDisabled && country && jumpTarget?.code === country.code ? jumpTarget : null}
          onSelect={code => {
            if (!canPlay(Date.now())) return
            setJumpTarget(null)
            if (!learning) setHistory({ entries: [code], index: 0, cycleStart: 0 })
            showCountry(code)
          }} />
        {(!learning || active.some(item => item.marker)) && <div className="map-footer">
          <div className="legend" aria-label={t.mapLegend}>
            {!learning && <>
              <span><i className="legend-dot available"/>{t.unguessed}</span>
              <span><i className="legend-dot selected"/>{t.selected}</span>
              <span><i className="legend-dot guessed"/>{t.guessed}</span>
            </>}
            {active.some(item => item.marker) && <span><i className="legend-marker"/>{t.countryMarker}</span>}
          </div>
        </div>}
      </section>
      {(!learning || challenge) && <aside className="sidebar">
        {challenge && <p className="panel challenge-note">
          {t.challengeMessage(challenge.guessed, challenge.total, formatTime(challenge.seconds * 1000))}
        </p>}
        {!learning && <>
          <div className="progress-block">
            <section className="panel progress-panel" aria-label={t.gameProgress}>
              <h2>{t.overallProgress}</h2>
              <div className="score"><strong>{guessedCount}</strong><span>{t.countryTotal(active.length)}</span><b>{percent}%</b></div>
              <progress value={guessedCount} max={active.length || 1} aria-label={t.overallProgress}>{percent}%</progress>
              {!noRegions && <RegionProgress scores={regionScores} />}
            </section>
            {mode === 'explore' && <button className="reset-button progress-reset" type="button" onClick={onStart}>
              <Icon name="reset" size={17}/>{t.restartExplore}
            </button>}
          </div>
          <section className="panel play-panel" aria-label={t.answer}>
            {timed && <div className="round-stats">
              <span>{t.timeLeft} <strong role="timer">{formatTime(Math.ceil(timeLeft / 1000) * 1000)}</strong></span>
              <span>{t.lives} <strong>{lives} / {startingLives}</strong></span>
            </div>}
            {showResults ? (
              <div className="round-result-summary" role="status">
                <h2>{resultTitle}</h2>
                <p className="play-instruction">{resultReason}</p>
                <p className="play-instruction">{t.roundScore(guessedCount, active.length)}</p>
              </div>
            ) : country ? (
              <CountryForm key={`${language.locale}-${country.code}`} country={country} candidates={remaining} messages={t} normalize={normalize}
                onAnswer={correct => answer(country.code, correct)}/>
            ) : (
              <>
                {(!timed || noRegions) && <div className="answer-prompt">
                  <h2>{noRegions ? t.chooseRegions : done ? t.gameComplete : t.chooseCountry}</h2>
                  <p className="play-instruction">{noRegions ? t.selectRegionHint : done ? t.gameCompleteHint : t.selectCountryHint}</p>
                  {lastAnswer && <p className="last-answer" role="status"><Icon name="check" size={17}/>{t.correct(lastAnswer.name)}</p>}
                </div>}
                {playActive && <div className="answer-form answer-preview" data-timed={timed}>
                  <label htmlFor="answer-preview">{t.countryName}</label>
                  <div className="answer-entry">
                    <input id="answer-preview" type="text" disabled placeholder={t.chooseCountry} />
                  </div>
                </div>}
              </>
            )}
            {!showResults && country && lastAnswer && <p className="last-answer" role="status">
              <Icon name="check" size={17}/>{t.correct(lastAnswer.name)}
            </p>}
            {(waitingToStart || showResults) && <button type="button" className="primary-button round-start" onClick={onStart}>
              <Icon name="play" size={17}/>{t.startGame}
            </button>}
            {playActive && <button type="button" className="next-button" aria-label={t.nextCountry} onClick={selectNext}>
              <span>{t.nextCountry}</span> <kbd>Tab</kbd><Icon name="arrow" size={19}/>
            </button>}
            {mode === 'explore' && country && <ExploreHints key={country.code} code={country.code} language={language}/>}
          </section>
        </>}
      </aside>}
      {showResults && <dialog ref={resultsDialog} className="settings-dialog results-dialog panel"
        aria-labelledby="results-title" aria-describedby="results-reason results-score">
        <h2 id="results-title">{resultTitle}</h2>
        <p id="results-reason" className="play-instruction">{resultReason}</p>
        <div className="results-score">
          <p id="results-score">{t.roundScore(guessedCount, active.length)}</p>
          <progress value={guessedCount} max={active.length || 1} aria-label={t.overallProgress} />
        </div>
        {regionScores.length > 1 && <section className="results-regions" aria-labelledby="results-regions-title">
          <h3 id="results-regions-title">{t.regionSettings}</h3>
          <RegionProgress scores={regionScores} />
        </section>}
        <dl className="results-stats">
          {[...resultStats, ...resultSettings].map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {shareStatus === 'copied' && <p className="play-instruction" role="status">{t.resultCopied}</p>}
        {shareStatus === 'manual' && <label className="share-text">
          {t.copyResultManually}
          <textarea ref={shareTextField} readOnly rows={4} value={shareText} />
        </label>}
        <form method="dialog" className="settings-footer results-footer">
          <button className="reset-button" type="button" onClick={copyResults}>{t.copyResult}</button>
          <button className="primary-button" type="submit">{t.done}</button>
        </form>
      </dialog>}
    </div>
  )
}

function App({ challenge, invalidChallenge }: { challenge: Challenge | null; invalidChallenge: boolean }) {
  const [preferences, setPreferences] = useState<GameSettings>(() => {
    const saved = loadSettings()
    return challenge ? { ...saved, ...challenge.scope, mode: 'timed' } : saved
  })
  const { locale, selectedRegions, includeSmall, includeDisputed, nextMode, autoAdvance, projection, mode, defaultZoom } = preferences
  const language = languages.find(item => item.locale === locale) ?? defaultLanguage
  const catalog = useMemo(() => createCountryCatalog(language), [language])
  const { messages: t } = language

  useEffect(() => {
    document.documentElement.lang = language.locale
    document.documentElement.dir = language.direction
    document.title = t.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description)
  }, [language, t])

  useEffect(() => {
    if (challenge) return
    try {
      localStorage.setItem(settingsStorageKey, JSON.stringify(preferences))
    } catch {
      // Settings still apply for this session if browser storage is unavailable.
    }
  }, [challenge, preferences])

  function updateSettings(changes: Partial<GameSettings>) {
    setPreferences(current => ({ ...current, ...changes }))
  }

  const settings = useRef<HTMLDialogElement>(null)
  const modeInfo = useRef<HTMLDialogElement>(null)
  const gameMain = useRef<HTMLElement>(null)
  const [round, setRound] = useState<{ id: number; scope: RoundScope | null; startedAt: number | null; stoppedAt: number | null }>({
    id: 0, scope: null, startedAt: null, stoppedAt: null,
  })
  const roundRunning = round.startedAt !== null && round.stoppedAt === null
  const [world, setWorld] = useState<World | null>(null)
  const [failed, setFailed] = useState(false)
  const [request, setRequest] = useState(0)

  const finishTimedRound = useCallback((finishedAt: number) => {
    setRound(current => current.startedAt !== null && current.stoppedAt === null
      ? { ...current, stoppedAt: finishedAt } : current)
  }, [])

  function resetRound(startedAt: number | null) {
    setRound(current => ({ id: current.id + 1, scope: startedAt === null ? null : roundScope(preferences), startedAt, stoppedAt: null }))
  }

  function newRound() {
    const timed = mode === 'timed'
    if (timed && selectedRegions.length === 0) {
      settings.current?.showModal()
      return
    }
    resetRound(timed ? Date.now() : null)
    gameMain.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}world.geojson`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<World>
      })
      .then(setWorld)
      .catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [request])

  const modeNames = { timed: t.timedMode, explore: t.exploreMode, learn: t.learnMode }

  return (
    <>
      <header className="topbar">
        <div className="page-width topbar-inner">
          <h1 className="brand">
            <img className="brand-icon" src={`${import.meta.env.BASE_URL}map-by-heart.svg`} alt="" width={37} height={37} />
            Map by Heart
          </h1>
          <div className="topbar-actions">
            <button className="reset-button topbar-button" type="button" aria-haspopup="dialog" aria-controls="settings"
              aria-label={t.settings} title={t.settings} onClick={() => settings.current?.showModal()}>
              <Icon name="settings" size={17}/><span>{t.settings}</span>
            </button>
            <div className="topbar-mode">
              <div className="mode-symbol" aria-hidden="true"><Icon name={mode === 'timed' ? 'clock' : mode === 'learn' ? 'book' : 'globe'} size={17}/></div>
              <select className="mode-select" aria-label={t.gameMode} value={mode} disabled={roundRunning} onChange={event => {
                const nextGameMode = event.currentTarget.value as GameSettings['mode']
                updateSettings({ mode: nextGameMode })
                resetRound(null)
                if (nextGameMode === 'explore') gameMain.current?.focus({ preventScroll: true })
              }}>
                <option value="timed">{t.timedMode}</option>
                <option value="explore">{t.exploreMode}</option>
                <option value="learn">{t.learnMode}</option>
              </select>
            </div>
            {roundRunning && <button className="reset-button topbar-button" type="button" aria-label={t.endGame} title={t.endGame}
              onClick={() => finishTimedRound(Date.now())}>
              <Icon name="stop" size={17}/>
              <span>{t.endGame}</span>
            </button>}
            <button className="reset-button topbar-button info-button" type="button" aria-haspopup="dialog" aria-controls="mode-info"
              aria-label={t.modeInfo} title={t.modeInfo} onClick={() => modeInfo.current?.showModal()}>
              <Icon name="info" size={18}/>
            </button>
          </div>
        </div>
      </header>
      <main id="game-main" ref={gameMain} tabIndex={-1} className="page-width game-main">
        {invalidChallenge && <p className="panel challenge-note" role="status">{t.invalidChallengeLink}</p>}
        {world ? <Game key={round.id} world={world} {...(round.scope ?? roundScope(preferences))}
          mode={mode} nextMode={nextMode} autoAdvance={autoAdvance} projection={projection} defaultZoom={defaultZoom} language={language} catalog={catalog}
          startedAt={round.startedAt} stoppedAt={round.stoppedAt}
          challenge={challenge} onStart={newRound} onTimedFinish={finishTimedRound}/> : (
          <div className="panel loading" role="status">
            {failed ? <>{t.mapError} <button type="button" className="reset-button" onClick={() => { setFailed(false); setRequest(current => current + 1) }}>{t.retry}</button></> : t.loadingMap}
          </div>
        )}
      </main>
      <dialog className="settings-dialog panel mode-info" id="mode-info" ref={modeInfo}
        aria-labelledby="mode-info-title" aria-describedby="mode-info-description">
        <h2 id="mode-info-title">{modeNames[mode]}</h2>
        <p id="mode-info-description" className="play-instruction">{t.modeDescriptions[mode]}</p>
        <form method="dialog" className="settings-footer">
          <button className="primary-button" type="submit">{t.done}</button>
        </form>
      </dialog>
      <dialog className="settings-dialog panel" id="settings" ref={settings} aria-labelledby="settings-title" onClose={() => {
        const main = gameMain.current
        const answer = main?.querySelector<HTMLInputElement>('#country-name')
        const target = answer ?? main
        target?.focus({ preventScroll: true })
      }}>
        <h2 id="settings-title">{t.gameSettings}</h2>
        <div className="game-options">
          <label className="next-option">{t.language}
            <select value={language.locale} onChange={event => {
              const next = languages.find(item => item.locale === event.target.value)
              if (next) updateSettings({ locale: next.locale })
            }}>
              {languages.map(item => <option key={item.locale} value={item.locale} lang={item.locale}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <fieldset className="region-options" disabled={roundRunning}>
          <legend>{t.regionSettings}</legend>
          <button className="reset-button world-option" type="button" aria-pressed={selectedRegions.length === allRegions.length}
            onClick={() => updateSettings({ selectedRegions: allRegions })}><Icon name="globe" size={17}/>{language.regions.world}</button>
          <div className="region-checkboxes">
            {allRegions.map(id => (
              <label key={id}><input type="checkbox" checked={selectedRegions.includes(id)}
                onChange={event => updateSettings({ selectedRegions: event.target.checked
                  ? [...selectedRegions, id]
                  : selectedRegions.filter(region => region !== id) })} />{language.regions[id]}</label>
            ))}
          </div>
        </fieldset>
        <div className="game-options">
          <label className="small-option">{t.smallCountries}<input type="checkbox" role="switch" checked={includeSmall}
            disabled={roundRunning} onChange={event => updateSettings({ includeSmall: event.target.checked })} /></label>
          <label className="small-option">{t.disputedTerritories}<input type="checkbox" role="switch" checked={includeDisputed}
            disabled={roundRunning} onChange={event => updateSettings({ includeDisputed: event.target.checked })} /></label>
          <label className="small-option">{t.autoAdvance}<input type="checkbox" role="switch" checked={autoAdvance}
            onChange={event => updateSettings({ autoAdvance: event.target.checked })} /></label>
          <label className="next-option">{t.nextMode}
            <select value={nextMode} onChange={event => updateSettings({ nextMode: event.target.value as NextMode })}>
              <option value="random">{t.random}</option>
              <option value="nearby">{t.nearby}</option>
            </select>
          </label>
          <label className="next-option">{t.projection}
            <select value={projection} onChange={event => updateSettings({ projection: event.target.value as MapProjection })}>
              <option value="equal-earth">Equal Earth</option>
              <option value="mercator">{t.mercator}</option>
            </select>
          </label>
          <label className="next-option">{t.defaultZoom}
            <input className="zoom-setting" key={defaultZoom} type="number" min={minDefaultZoom} max={maxZoom}
              step="any" defaultValue={defaultZoom} onBlur={event => {
                const value = event.target.valueAsNumber
                const zoom = Number.isFinite(value) ? Math.max(minDefaultZoom, Math.min(maxZoom, value)) : defaultZoom
                event.target.value = String(zoom)
                updateSettings({ defaultZoom: zoom })
              }} onKeyDown={event => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                  event.preventDefault()
                  if (event.key === 'Escape') event.currentTarget.value = String(defaultZoom)
                  event.currentTarget.blur()
                }
              }} />
          </label>
        </div>
        {roundRunning && <p className="play-instruction">{t.roundSettingsHint}</p>}
        <form method="dialog" className="settings-footer">
          <button className="primary-button" type="submit">{t.done}</button>
        </form>
      </dialog>
    </>
  )
}

const root = createRoot(document.getElementById('root')!)
const hash = window.location.hash
const challenge = readChallenge(hash)
root.render(<StrictMode><App challenge={challenge} invalidChallenge={hash.startsWith('#c=') && !challenge}/></StrictMode>)
