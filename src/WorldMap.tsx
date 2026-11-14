import { geoEqualEarth, geoGraticule10, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import type { Country } from './countries'
import type { Region } from './regions'
import type { LanguagePack } from './locales/types'
import type { Coordinates } from './country-navigation'
import { mainPolygon } from './country-navigation'
import { Icon } from './Icon'
import { maxZoom as maxScale } from './settings'

export type World = FeatureCollection<Polygon | MultiPolygon, { code: string | null }>
type Land = Feature<Polygon | MultiPolygon, { code: string | null }>
type View = { x: number; y: number; scale: number }
type Point = { x: number; y: number }
export type MapProjection = 'equal-earth' | 'mercator'
const width = 1000
const height = 570
const zoomStep = 1.33
const zoomRangeFactor = zoomStep ** 2
const globe: View = { x: 0, y: 0, scale: 1 }
const sphere = { type: 'Sphere' } as const
const graticule = geoGraticule10()
const equalEarth = geoEqualEarth().fitExtent([[20, 22], [980, 544]], sphere)
const equalEarthPacific = geoEqualEarth().rotate([-145, 0]).fitExtent([[20, 22], [980, 544]], sphere)
const mercator = geoMercator().scale(width / (2 * Math.PI)).translate([width / 2, height / 2])
const mercatorTop = mercator([0, 85])![1]
const mercatorBottom = mercator([0, -85])![1]
mercator.clipExtent([[0, mercatorTop], [width, mercatorBottom]])

function mapLayout(project: typeof equalEarth, wrap: boolean) {
  const draw = geoPath(project).digits(2)
  const bounds = draw.bounds(sphere)
  return { project, draw, bounds, wrap, minScale: wrap ? .5 : 1, grid: draw(graticule) ?? '' }
}

const layouts = {
  equalEarth: mapLayout(equalEarth, false),
  pacific: mapLayout(equalEarthPacific, false),
  mercator: mapLayout(mercator, true),
}
type Layout = ReturnType<typeof mapLayout>

const frames: Record<Exclude<Region, 'world'>, [number, number, number, number]> = {
  europe: [-74, 32, 57, 81],
  americas: [-171, -57, -32, 82],
  africa: [-27, -37, 58, 39],
  'middle-east-central-asia': [24, 11, 89, 57],
  'asia-oceania': [64, -49, 209, 54],
}

function mapHome(region: Region, layout: Layout): View {
  if (region === 'world') return layout.wrap ? { ...globe, y: 55 } : globe
  const [west, south, east, north] = frames[region]
  const points = [south, (south + north) / 2, north].flatMap(lat =>
    [west, (west + east) / 2, east].map(lon => {
      const point = layout.project([lon, lat])!
      if (layout.wrap) point[0] += Math.round((width * (lon + 180) / 360 - point[0]) / width) * width
      return point
    }))
  const xs = points.map(point => point[0])
  const ys = points.map(point => point[1])
  const [left, right] = [Math.min(...xs), Math.max(...xs)]
  const [top, bottom] = [Math.min(...ys), Math.max(...ys)]
  const scale = Math.max(layout.minScale, Math.min((width - 95) / (right - left), (height - 72) / (bottom - top)))
  return clampView({ x: (width - (left + right) * scale) / 2, y: (height - (top + bottom) * scale) / 2, scale }, layout)
}

function clampAxis(offset: number, scale: number, min: number, max: number, viewport: number) {
  const lower = viewport - max * scale
  const upper = -min * scale
  return lower > upper ? (lower + upper) / 2 : Math.max(lower, Math.min(upper, offset))
}

function wrapX(x: number, period: number) {
  return ((x % period) + period) % period
}

function clampView(view: View, layout: Layout): View {
  const [[left, top], [right, bottom]] = layout.bounds
  return {
    scale: view.scale,
    x: layout.wrap ? -wrapX(-view.x, width * view.scale) : clampAxis(view.x, view.scale, left, right, width),
    y: clampAxis(view.y, view.scale, top, bottom, height),
  }
}

function zoomAt(view: View, factor: number, anchor: Point, layout: Layout): View {
  const scale = Math.max(layout.minScale, Math.min(maxScale, view.scale * factor))
  if (scale === view.scale) return view
  const ratio = scale / view.scale
  return clampView({ scale, x: anchor.x - (anchor.x - view.x) * ratio, y: anchor.y - (anchor.y - view.y) * ratio }, layout)
}

const center = { x: width / 2, y: height / 2 }

function revealOffset(start: number, end: number, extent: number, padding: number, focus: number, recenter: boolean) {
  const min = Math.max(padding - start, extent * .25 - focus)
  const max = Math.min(extent - padding - end, extent * .75 - focus)
  if (min > max) return extent / 2 - focus
  return Math.max(min, Math.min(max, recenter ? extent / 2 - focus : 0))
}

function automaticZoom(current: number, defaultZoom: number, fitsAt: number, minScale: number) {
  if (fitsAt < defaultZoom) return Math.max(minScale, Math.min(current, fitsAt))
  const inRange = current >= defaultZoom / zoomRangeFactor && current <= defaultZoom * zoomRangeFactor
  return Math.min(inRange ? current : defaultZoom, fitsAt)
}

function countryView(
  current: View, feature: Land, location: Coordinates, marker: Coordinates | undefined, layout: Layout, pixelsPerUnit: number,
  defaultZoom: number, { recenter = false, useDefaultZoom = false } = {},
) {
  const [projectedX, projectedY] = layout.project(location)!
  // Measure across the Mercator seam as one continuous outline.
  const measure = layout.wrap
    ? geoPath(geoMercator().scale(mercator.scale()).translate(mercator.translate())
      .rotate([-location[0], 0]).clipExtent(mercator.clipExtent()))
    : layout.draw
  const polygon = mainPolygon(feature.geometry)
  const [[x0Bounds, y0Bounds], [x1Bounds, y1Bounds]] = measure.bounds(polygon)
  const hasOutline = Number.isFinite(x0Bounds + y0Bounds + x1Bounds + y1Bounds)
  const padding = Math.min(16 / pixelsPerUnit, height * .1)
  const fitsAt = hasOutline
    ? Math.min((width - 2 * padding) / (x1Bounds - x0Bounds), (height - 2 * padding) / (y1Bounds - y0Bounds))
    : Infinity
  const offset = layout.wrap ? projectedX - center.x : 0
  let left = marker || !hasOutline ? projectedX : x0Bounds + offset
  let right = marker || !hasOutline ? projectedX : x1Bounds + offset
  const top = marker || !hasOutline ? projectedY : y0Bounds
  const bottom = marker || !hasOutline ? projectedY : y1Bounds
  let focusX = (left + right) / 2
  const focusY = (top + bottom) / 2
  if (layout.wrap) {
    const copy = Math.round(((center.x - current.x) / current.scale - focusX) / width)
    left += copy * width
    right += copy * width
    focusX += copy * width
  }

  const x0 = current.x + left * current.scale
  const x1 = current.x + right * current.scale
  const y0 = current.y + top * current.scale
  const y1 = current.y + bottom * current.scale
  const scale = useDefaultZoom
    ? Math.max(layout.minScale, Math.min(defaultZoom, fitsAt))
    : automaticZoom(current.scale, defaultZoom, fitsAt, layout.minScale)
  const x = current.x + focusX * (current.scale - scale)
  const y = current.y + focusY * (current.scale - scale)
  const paddingX = scale === current.scale && x0 >= 0 && x1 <= width ? 0 : padding
  const paddingY = scale === current.scale && y0 >= 0 && y1 <= height ? 0 : padding
  const dx = revealOffset(x + left * scale, x + right * scale, width, paddingX, x + focusX * scale, recenter)
  const dy = revealOffset(y + top * scale, y + bottom * scale, height, paddingY, y + focusY * scale, recenter)
  if (scale === current.scale && dx === 0 && dy === 0) return current
  return clampView({
    scale,
    x: x + dx,
    y: y + dy,
  }, layout)
}

type Props = {
  world: World
  region: Region
  projection: MapProjection
  defaultZoom: number
  messages: LanguagePack['messages']
  selectedLocation?: Coordinates
  active: Country[]
  guessed: Set<string>
  selected: string | null
  selectionDisabled: boolean
  jumpTarget: { code: string; recenter?: boolean } | null
  onSelect: (code: string) => void
}

export function WorldMap({ world, region, projection, defaultZoom, messages: t, selectedLocation, active, guessed, selected, selectionDisabled, jumpTarget, onSelect }: Props) {
  const layout = projection === 'mercator' ? layouts.mercator : region === 'asia-oceania' ? layouts.pacific : layouts.equalEarth
  const { project, draw, grid, wrap } = layout
  const [view, setView] = useState(() => {
    const home = mapHome(region, layout)
    if (!selectedLocation) return home
    const [x, y] = project(selectedLocation)!
    return clampView({ ...home, x: center.x - x * home.scale, y: center.y - y * home.scale }, layout)
  })
  const currentView = useRef(view)
  const animation = useRef<number | null>(null)
  const [tooltip, setTooltip] = useState<(Point & { code: string }) | null>(null)
  const [dragging, setDragging] = useState(false)
  const svg = useRef<SVGSVGElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; start: Point; origin: View; moved: boolean } | null>(null)
  const ignoreClick = useRef(false)
  const activeByCode = new Map(active.map(country => [country.code, country]))
  const tooltipName = tooltip ? activeByCode.get(tooltip.code)?.name : undefined
  const [land] = useState(() => world.features.map(feature => ({
    feature,
    outline: draw(feature) ?? '',
  })))
  const copies = wrap ? Math.ceil(1 / view.scale) + 1 : 1
  const jumpFeature = jumpTarget && land.find(({ feature }) => feature.properties.code === jumpTarget.code)?.feature
  const jumpMarker = jumpTarget ? activeByCode.get(jumpTarget.code)?.marker : undefined

  const updateView = useCallback((next: View) => {
    currentView.current = next
    setView(next)
  }, [])

  const stopAnimation = useCallback(() => {
    if (animation.current === null) return
    cancelAnimationFrame(animation.current)
    animation.current = null
  }, [])

  const animateView = useCallback((target: View) => {
    stopAnimation()
    const start = currentView.current
    if (start.x === target.x && start.y === target.y && start.scale === target.scale) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateView(target)
      return
    }

    // Interpolate the map coordinates at the center of the viewport.
    const startX = (center.x - start.x) / start.scale
    const targetX = (center.x - target.x) / target.scale
    const startY = (center.y - start.y) / start.scale
    const targetY = (center.y - target.y) / target.scale
    const dx = targetX - startX
    const travelX = layout.wrap ? dx - Math.round(dx / width) * width : dx
    const started = performance.now()
    function frame(now: number) {
      const progress = Math.min(1, (now - started) / 280)
      if (progress === 1) {
        animation.current = null
        updateView(target)
        return
      }
      const eased = progress * progress * (3 - 2 * progress)
      const scale = start.scale * (target.scale / start.scale) ** eased
      updateView(clampView({
        scale,
        x: center.x - (startX + travelX * eased) * scale,
        y: center.y - (startY + (targetY - startY) * eased) * scale,
      }, layout))
      animation.current = requestAnimationFrame(frame)
    }
    animation.current = requestAnimationFrame(frame)
  }, [layout, stopAnimation, updateView])

  useEffect(() => stopAnimation, [stopAnimation])

  const navigateToCountry = useEffectEvent((feature: Land, location: Coordinates, pixelsPerUnit: number) => {
    setTooltip(null)
    animateView(countryView(currentView.current, feature, location, jumpMarker, layout, pixelsPerUnit, defaultZoom, {
      recenter: jumpTarget?.recenter,
    }))
  })

  useEffect(() => {
    const pixelsPerUnit = svg.current?.getScreenCTM()?.a
    if (!jumpFeature || !selectedLocation || !pixelsPerUnit) return
    navigateToCountry(jumpFeature, selectedLocation, pixelsPerUnit)
  }, [jumpTarget, jumpFeature, selectedLocation])

  function svgPoint(clientX: number, clientY: number): Point {
    const matrix = svg.current?.getScreenCTM()
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : center
  }

  useEffect(() => {
    const element = svg.current
    if (!element) return
    const mapElement = element
    function onWheel(event: WheelEvent) {
      event.preventDefault()
      stopAnimation()
      const current = currentView.current
      const anchor = svgPoint(event.clientX, event.clientY)
      setTooltip(null)
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? 90 : 1
      const horizontal = (event.deltaX || (event.shiftKey ? event.deltaY : 0)) * unit
      if (horizontal && (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))) {
        const cssToMap = 1 / (mapElement.getScreenCTM()?.a || 1)
        updateView(clampView({ ...current, x: current.x - horizontal * cssToMap }, layout))
        return
      }
      const distance = event.deltaY * unit
      updateView(zoomAt(current, Math.exp(-Math.max(-240, Math.min(240, distance)) * .0028), anchor, layout))
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [layout, stopAnimation, updateView])

  function beginDrag(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || !event.isPrimary) return
    event.preventDefault()
    stopAnimation()
    ignoreClick.current = false
    drag.current = { id: event.pointerId, start: svgPoint(event.clientX, event.clientY), origin: currentView.current, moved: false }
  }

  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    const point = svgPoint(event.clientX, event.clientY)
    const dx = point.x - gesture.start.x
    const dy = point.y - gesture.start.y
    if (!gesture.moved) {
      if (Math.hypot(dx, dy) < 5) return
      gesture.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
      setTooltip(null)
    }
    updateView(clampView({ ...gesture.origin, x: gesture.origin.x + dx, y: gesture.origin.y + dy }, layout))
  }

  function endDrag(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.id !== event.pointerId) return
    ignoreClick.current = drag.current.moved
    drag.current = null
    setDragging(false)
  }

  function showTooltip(event: MouseEvent<SVGElement>, country: Country) {
    if (!guessed.has(country.code) || drag.current?.moved || !stage.current) return
    const bounds = stage.current.getBoundingClientRect()
    setTooltip({ code: country.code, x: Math.min(Math.max(110, event.clientX - bounds.left), bounds.width - 110), y: Math.max(46, event.clientY - bounds.top) })
  }

  function interactions(country: Country | undefined, marker = false) {
    if (!country) return {}
    const { code, marker: coordinates } = country
    const solved = guessed.has(code)
    function select() {
      if (solved || selectionDisabled) return
      if (marker && coordinates && view.scale < 2.6) {
        const [x, y] = project(coordinates)!
        animateView(clampView({ scale: 2.6, x: center.x - x * 2.6, y: center.y - y * 2.6 }, layout))
      }
      onSelect(code)
    }
    return {
      onClick: () => { if (!ignoreClick.current) select() },
      onMouseMove: (event: MouseEvent<SVGElement>) => showTooltip(event, country),
      onMouseLeave: () => setTooltip(null),
    }
  }

  function landClass(feature: Land) {
    const code = feature.properties.code
    if (!code || !activeByCode.has(code)) return 'outside'
    if (guessed.has(code)) return 'guessed'
    return selected === code ? 'selected' : 'available'
  }

  function changeZoom(factor: number) {
    setTooltip(null)
    stopAnimation()
    updateView(zoomAt(currentView.current, factor, center, layout))
  }

  function recenter() {
    const feature = selected && land.find(item => item.feature.properties.code === selected)?.feature
    const pixelsPerUnit = svg.current?.getScreenCTM()?.a
    if (!selected || !feature || !selectedLocation || !pixelsPerUnit) return
    setTooltip(null)
    const marker = activeByCode.get(selected)?.marker
    animateView(countryView(currentView.current, feature, selectedLocation, marker, layout, pixelsPerUnit, defaultZoom, {
      recenter: true, useDefaultZoom: true,
    }))
  }

  return (
    <div className="map-stage" ref={stage}>
      <svg ref={svg} viewBox={`0 0 ${width} ${height}`} className={`world-map ${dragging ? 'dragging' : ''} ${selectionDisabled ? 'selection-disabled' : ''}`}
        role="img" aria-label={t.politicalMap}
        onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
        onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={event => {
          if (!drag.current?.moved) endDrag(event)
          setTooltip(null)
        }}>
        {Array.from({ length: copies }, (_, copy) => <g key={copy}
          transform={`translate(${view.x + copy * width * view.scale} ${view.y}) scale(${view.scale})`}>
          <path className="map-grid" d={grid} />
          {land.map(({ feature, outline }) => {
            const country = activeByCode.get(feature.properties.code ?? '')
            const state = landClass(feature)
            return <path key={feature.id} d={outline} className={`country ${state}`} {...interactions(country)}
              data-code={feature.properties.code ?? undefined} />
          })}
          {active.filter(country => country.marker).map(country => {
            const [x, y] = project(country.marker!)!
            const state = guessed.has(country.code) ? 'guessed' : selected === country.code ? 'selected' : 'available'
            return (
              <g key={country.code} className={`micro-marker ${state}`} data-marker={country.code}
                transform={`translate(${x} ${y}) scale(${1 / view.scale})`} {...interactions(country, true)}>
                <circle r="7.5" fill="transparent" />
                <circle r="4" className="marker-dot" />
              </g>
            )
          })}
        </g>)}
      </svg>
      {tooltip && tooltipName && <span className="map-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltipName}</span>}
      <div className="map-controls" aria-label={t.mapZoom} onMouseDown={event => {
        if (event.button === 0 && document.activeElement?.id === 'country-name') event.preventDefault()
      }}>
        <button type="button" aria-label={t.zoomIn} title={t.zoomIn} onClick={() => changeZoom(zoomStep)} disabled={view.scale >= maxScale}><Icon name="plus" size={19}/></button>
        <button type="button" aria-label={t.zoomOut} title={t.zoomOut} onClick={() => changeZoom(1 / zoomStep)} disabled={view.scale <= layout.minScale}><Icon name="minus" size={19}/></button>
        <button type="button" aria-label={t.recenter} title={t.recenter} onClick={recenter} disabled={!selectedLocation}><Icon name="target" size={17}/></button>
        <button type="button" aria-label={t.resetView} title={t.resetView} onClick={() => { setTooltip(null); animateView(mapHome(region, layout)) }}><Icon name="fit" size={17}/></button>
        <span className="map-zoom-value" aria-label={`${t.mapZoom}: ${view.scale.toFixed(2)}×`}>{view.scale.toFixed(2)}×</span>
      </div>
    </div>
  )
}
