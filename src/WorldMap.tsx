import { geoArea, geoEqualEarth, geoGraticule10, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Country } from './countries'
import type { Region } from './regions'
import type { LanguagePack } from './locales/types'
import type { Coordinates } from './country-navigation'
import { mainPolygon } from './country-navigation'
import { Icon } from './Icon'
import { maxZoom } from './settings'

export type World = FeatureCollection<Polygon | MultiPolygon, { code: string | null }>
type Land = Feature<Polygon | MultiPolygon, { code: string | null }>
type View = { x: number; y: number; scale: number }
type Point = { x: number; y: number }
type Drag = { id: number; start: Point; clientStart: Point; last: Point; origin: View; moved: boolean;
  pointerType: string; country?: Country; marker?: boolean }
type Pinch = { pointers: Map<number, Point>; distance: number; midpoint: Point; origin: View }
export type MapProjection = 'equal-earth' | 'mercator'
const width = 1000
const height = 570
const zoomStep = 1.33
const zoomRangeFactor = zoomStep ** 2
const mobileMapQuery = '(max-width: 790px)'
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
  return { project, draw, bounds, wrap, height, maxScale: maxZoom, minScale: wrap ? .5 : 1, grid: draw(graticule) ?? '' }
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
  const viewportHeight = layout.height
  if (region === 'world') {
    const home = { ...globe, y: layout.wrap ? 55 : 0 }
    return viewportHeight === height ? home : clampView({ ...home, y: home.y + (viewportHeight - height) / 2 }, layout)
  }
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
  const scale = Math.max(layout.minScale, Math.min((width - 95) / (right - left), (viewportHeight - 72) / (bottom - top)))
  return clampView({ x: (width - (left + right) * scale) / 2, y: (viewportHeight - (top + bottom) * scale) / 2, scale }, layout)
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
    y: clampAxis(view.y, view.scale, top, bottom, layout.height),
  }
}

function zoomAt(view: View, factor: number, anchor: Point, layout: Layout, destination = anchor): View {
  const scale = Math.max(layout.minScale, Math.min(layout.maxScale, view.scale * factor))
  if (scale === view.scale && destination === anchor) return view
  const ratio = scale / view.scale
  return clampView({ scale, x: destination.x - (anchor.x - view.x) * ratio, y: destination.y - (anchor.y - view.y) * ratio }, layout)
}

function pinchGeometry(points: Map<number, Point>) {
  const [first, second] = points.values()
  return {
    midpoint: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    distance: Math.hypot(first.x - second.x, first.y - second.y),
  }
}

const labelLineHeight = 1.15
const labelOffsets = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5]
type LabelGeometry = { area: number; top: number; bottom: number }

function wrapCountryLabel(name: string) {
  const lines: string[] = []
  let line = ''
  for (const word of name.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (line && [...next].length > 16) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  return [...lines, line]
}

function placeCountryLabels(
  countries: Country[], locations: Map<string, Coordinates>, project: Layout['project'],
  scale: number, wrap: boolean, selected: string | null, geometry: Map<string, LabelGeometry>, fontSize: number,
) {
  const labels: { key: string; lines: string[]; x: number; y: number; anchorY: number;
    halfWidth: number; halfHeight: number }[] = []
  const offsets = scale >= 12 ? labelOffsets : labelOffsets.slice(0, scale >= 3 ? 5 : 1)
  const areaOrder = scale >= 12 ? 1 : -1
  const period = width * scale
  const ordered = [...countries].sort((a, b) => Number(b.code === selected) - Number(a.code === selected) ||
    areaOrder * ((geometry.get(a.code)?.area ?? 0) - (geometry.get(b.code)?.area ?? 0)))
  for (const country of ordered) {
    const location = locations.get(country.code)
    const point = location && project(location)
    const outline = geometry.get(country.code)
    if (!point || !point.every(Number.isFinite) || !outline) continue
    const lines = wrapCountryLabel(country.name)
    const halfHeight = lines.length * fontSize * labelLineHeight / 2
    const minY = outline.top * scale
    const maxY = outline.bottom * scale
    const x = point[0] * scale
    const anchorY = point[1] * scale
    const preferredY = anchorY - (country.marker ? halfHeight + fontSize / 2 : 0)
    const halfWidth = (Math.max(...lines.map(line => [...line].length)) * .34 + .35) * fontSize
    const positions = [
      { y: preferredY, shifted: false },
      ...(country.marker ? [{ y: anchorY + halfHeight + fontSize / 2, shifted: false }] : []),
      ...offsets.slice(1).map(offset => ({ y: preferredY + offset * (halfHeight + fontSize * .7), shifted: true })),
    ]
    for (const { y, shifted } of positions) {
      if (shifted && (y < minY || y > maxY)) continue
      const overlaps = labels.some(label => {
        if (Math.abs(label.y - y) >= label.halfHeight + halfHeight + fontSize * .15) return false
        const dx = label.x - x
        const distance = Math.abs(wrap ? dx - Math.round(dx / period) * period : dx)
        return distance < label.halfWidth + halfWidth
      })
      if (overlaps) continue
      labels.push({ key: country.code, lines, x, y, anchorY, halfWidth, halfHeight })
      break
    }
  }
  return labels
}

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
  const { height } = layout
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
  const offset = layout.wrap ? projectedX - width / 2 : 0
  let left = marker || !hasOutline ? projectedX : x0Bounds + offset
  let right = marker || !hasOutline ? projectedX : x1Bounds + offset
  const top = marker || !hasOutline ? projectedY : y0Bounds
  const bottom = marker || !hasOutline ? projectedY : y1Bounds
  let focusX = (left + right) / 2
  const focusY = (top + bottom) / 2
  if (layout.wrap) {
    const copy = Math.round(((width / 2 - current.x) / current.scale - focusX) / width)
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
  labelLocations?: Map<string, Coordinates>
  active: Country[]
  guessed: Set<string>
  selected: string | null
  selectionDisabled: boolean
  jumpTarget: { code: string; recenter?: boolean } | null
  onSelect: (code: string) => void
}

export function WorldMap({ world, region, projection, defaultZoom, messages: t, selectedLocation, labelLocations, active, guessed, selected, selectionDisabled, jumpTarget, onSelect }: Props) {
  const baseLayout = projection === 'mercator' ? layouts.mercator : region === 'asia-oceania' ? layouts.pacific : layouts.equalEarth
  const showLabels = labelLocations !== undefined
  const [expandedHeight, setExpandedHeight] = useState(height)
  const [mobile, setMobile] = useState(() => window.matchMedia(mobileMapQuery).matches)
  const viewportHeight = showLabels ? expandedHeight : height
  const layout = useMemo(() => ({ ...baseLayout, height: viewportHeight, maxScale: mobile ? maxZoom * zoomRangeFactor : maxZoom }),
    [baseLayout, viewportHeight, mobile])
  const center = useMemo(() => ({ x: width / 2, y: layout.height / 2 }), [layout.height])
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
  const [pixelsPerUnit, setPixelsPerUnit] = useState(1)
  const drag = useRef<Drag | null>(null)
  const pinch = useRef<Pinch | null>(null)
  const activeByCode = new Map(active.map(country => [country.code, country]))
  const tooltipName = tooltip ? activeByCode.get(tooltip.code)?.name : undefined
  const [land] = useState(() => world.features.map(feature => ({
    feature,
    outline: draw(feature) ?? '',
  })))
  const copies = wrap ? Math.ceil(1 / view.scale) + 1 : 1
  const labelGeometry = useMemo(() => {
    const geometry = new Map<string, LabelGeometry>()
    if (!showLabels) return geometry
    for (const feature of world.features) {
      const code = feature.properties.code
      if (!code) continue
      const [[, top], [, bottom]] = draw.bounds(mainPolygon(feature.geometry))
      if (Number.isFinite(top) && Number.isFinite(bottom)) {
        geometry.set(code, { area: geoArea(feature), top, bottom })
      }
    }
    return geometry
  }, [showLabels, world, draw])
  const labelFontSize = 12 / pixelsPerUnit
  const { scale } = view
  const placedLabels = useMemo(() => labelLocations
    ? placeCountryLabels(active, labelLocations, project, scale, wrap, selected, labelGeometry, labelFontSize)
    : [], [active, labelLocations, project, scale, wrap, selected, labelGeometry, labelFontSize])
  // Panning only moves the layer and clips labels at the viewport edges.
  const labels = placedLabels.flatMap(label => {
    const screenY = label.y + view.y
    const extent = label.halfHeight + labelFontSize / 8
    if (screenY + extent <= 0 || screenY - extent >= layout.height) return []
    const visibleCopies = []
    // Labels can extend past the edge of a map copy.
    for (let copy = wrap ? -1 : 0; copy < (wrap ? copies + 1 : 1); copy++) {
      const x = label.x + copy * width * scale
      const screenX = x + view.x
      if (screenX + label.halfWidth > 0 && screenX - label.halfWidth < width) {
        visibleCopies.push({ ...label, key: `${label.key}-${copy}`, x })
      }
    }
    return visibleCopies
  })
  const jumpFeature = jumpTarget && land.find(({ feature }) => feature.properties.code === jumpTarget.code)?.feature
  const jumpMarker = jumpTarget ? activeByCode.get(jumpTarget.code)?.marker : undefined

  useEffect(() => {
    const element = svg.current
    if (!showLabels || !element) return
    function measure() {
      const bounds = element?.getBoundingClientRect()
      if (!bounds?.width || !bounds.height) return
      setPixelsPerUnit(bounds.width / width)
      setExpandedHeight(bounds.height * width / bounds.width)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [showLabels])

  const updateView = useCallback((next: View) => {
    currentView.current = next
    setView(next)
  }, [])

  const stopAnimation = useCallback(() => {
    if (animation.current === null) return
    cancelAnimationFrame(animation.current)
    animation.current = null
  }, [])

  useEffect(() => {
    const media = window.matchMedia(mobileMapQuery)
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [])

  const previousHeight = useRef(layout.height)
  useEffect(() => {
    const delta = layout.height - previousHeight.current
    previousHeight.current = layout.height
    const current = currentView.current
    if (!delta && current.scale <= layout.maxScale) return
    stopAnimation()
    const resized = { ...current, y: current.y + delta / 2 }
    updateView(clampView(zoomAt(resized, 1, center, layout), layout))
  }, [center, layout, stopAnimation, updateView])

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
  }, [center, layout, stopAnimation, updateView])

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
  }, [center, layout, stopAnimation, updateView])

  function beginDrag(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || pinch.current) return
    const client = { x: event.clientX, y: event.clientY }
    const point = svgPoint(client.x, client.y)
    const previous = drag.current
    if (previous) {
      if (previous.pointerType !== 'touch' || event.pointerType !== 'touch') return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const pointers = new Map([[previous.id, previous.last], [event.pointerId, point]])
      pinch.current = { pointers, ...pinchGeometry(pointers), origin: currentView.current }
      drag.current = null
      setDragging(true)
      setTooltip(null)
      return
    }
    if (!event.isPrimary) return
    event.preventDefault()
    if (event.pointerType !== 'mouse') setTooltip(null)
    stopAnimation()
    const target = (event.target as Element).closest('[data-marker], [data-code]')
    const markerCode = target?.getAttribute('data-marker')
    const code = markerCode ?? target?.getAttribute('data-code')
    drag.current = {
      id: event.pointerId, start: point, last: point, clientStart: client, pointerType: event.pointerType,
      origin: currentView.current, moved: false, country: code ? activeByCode.get(code) : undefined, marker: !!markerCode,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    const zoom = pinch.current
    if (zoom) {
      if (!zoom.pointers.has(event.pointerId)) return
      zoom.pointers.set(event.pointerId, svgPoint(event.clientX, event.clientY))
      const { midpoint, distance } = pinchGeometry(zoom.pointers)
      if (!zoom.distance) {
        zoom.distance = distance
        zoom.midpoint = midpoint
        return
      }
      updateView(zoomAt(zoom.origin, distance / zoom.distance, zoom.midpoint, layout, midpoint))
      return
    }
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    const point = svgPoint(event.clientX, event.clientY)
    gesture.last = point
    const dx = point.x - gesture.start.x
    const dy = point.y - gesture.start.y
    if (!gesture.moved) {
      if (Math.hypot(event.clientX - gesture.clientStart.x, event.clientY - gesture.clientStart.y) < 5) return
      gesture.moved = true
      setDragging(true)
      setTooltip(null)
    }
    updateView(clampView({ ...gesture.origin, x: gesture.origin.x + dx, y: gesture.origin.y + dy }, layout))
  }

  function endDrag(event: PointerEvent<SVGSVGElement>) {
    const zoom = pinch.current
    if (zoom) {
      if (!zoom.pointers.delete(event.pointerId)) return
      pinch.current = null
      const [id, point] = [...zoom.pointers][0]
      drag.current = { id, start: point, last: point, clientStart: point, origin: currentView.current,
        moved: true, pointerType: 'touch' }
      return
    }
    const gesture = drag.current
    if (gesture?.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    if (event.type !== 'pointerup' || gesture.moved ||
      Math.hypot(event.clientX - gesture.clientStart.x, event.clientY - gesture.clientStart.y) >= 5) return
    const country = gesture.country
    if (!country) return
    if (guessed.has(country.code)) {
      if (gesture.pointerType === 'touch') positionTooltip(country, event.clientX, event.clientY)
      return
    }
    if (selectionDisabled) return
    if (gesture.marker && country.marker && view.scale < 2.6) {
      const [x, y] = project(country.marker)!
      animateView(clampView({ scale: 2.6, x: center.x - x * 2.6, y: center.y - y * 2.6 }, layout))
    }
    onSelect(country.code)
  }

  function showTooltip(event: PointerEvent<SVGElement>, country: Country) {
    if (event.pointerType !== 'mouse' || (!showLabels && !guessed.has(country.code)) ||
      pinch.current || drag.current?.moved) return
    positionTooltip(country, event.clientX, event.clientY)
  }

  function positionTooltip(country: Country, clientX: number, clientY: number) {
    if (!stage.current) return
    const bounds = stage.current.getBoundingClientRect()
    const inset = Math.min(110, bounds.width / 2)
    setTooltip({ code: country.code, x: Math.min(Math.max(inset, clientX - bounds.left), bounds.width - inset),
      y: Math.max(46, clientY - bounds.top) })
  }

  function hideHoverTooltip(event: PointerEvent<SVGElement>) {
    if (event.pointerType === 'mouse') setTooltip(null)
  }

  function tooltipEvents(country: Country | undefined) {
    if (!country) return {}
    return {
      onPointerMove: (event: PointerEvent<SVGElement>) => showTooltip(event, country),
      onPointerLeave: hideHoverTooltip,
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
      <svg ref={svg} viewBox={`0 0 ${width} ${layout.height}`} className={`world-map ${dragging ? 'dragging' : ''} ${selectionDisabled ? 'selection-disabled' : ''}`}
        role="img" aria-label={t.politicalMap}
        onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
        onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={hideHoverTooltip}>
        {Array.from({ length: copies }, (_, copy) => <g key={copy}
          transform={`translate(${view.x + copy * width * view.scale} ${view.y}) scale(${view.scale})`}>
          <path className="map-grid" d={grid} />
          {land.map(({ feature, outline }) => {
            const country = activeByCode.get(feature.properties.code ?? '')
            const state = landClass(feature)
            return <path key={feature.id} d={outline} className={`country ${state}`} {...tooltipEvents(country)}
              data-code={feature.properties.code ?? undefined} />
          })}
          {active.filter(country => country.marker).map(country => {
            const [x, y] = project(country.marker!)!
            const state = guessed.has(country.code) ? 'guessed' : selected === country.code ? 'selected' : 'available'
            return (
              <g key={country.code} className={`micro-marker ${state}`} data-marker={country.code}
                transform={`translate(${x} ${y}) scale(${1 / view.scale})`} {...tooltipEvents(country)}>
                <circle r="7.5" fill="transparent" />
                <circle r="4" className="marker-dot" />
              </g>
            )
          })}
        </g>)}
        {showLabels && <g className="country-labels" aria-hidden="true" fontSize={labelFontSize} strokeWidth={labelFontSize / 4}
          transform={`translate(${view.x} ${view.y})`}>
          {labels.map(({ key, x, y, anchorY, halfHeight }) => {
            const dy = anchorY - y
            if (Math.abs(dy) - halfHeight <= labelFontSize * 1.2) return null
            return <line key={key} className="country-label-leader" x1={x} y1={anchorY}
              x2={x} y2={y + Math.sign(dy) * halfHeight} />
          })}
          {labels.map(({ key, lines, x, y }) => <text key={key}>
            {lines.map((line, index) => <tspan key={index} x={x}
              y={y + (index - (lines.length - 1) / 2) * labelLineHeight * labelFontSize}>{line}</tspan>)}
          </text>)}
        </g>}
      </svg>
      {tooltip && tooltipName && <span className="map-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltipName}</span>}
      <div className="map-controls" aria-label={t.mapZoom} onMouseDown={event => {
        if (event.button === 0 && document.activeElement?.id === 'country-name') event.preventDefault()
      }}>
        <button type="button" aria-label={t.zoomIn} title={t.zoomIn} onClick={() => changeZoom(zoomStep)} disabled={view.scale >= layout.maxScale}><Icon name="plus" size={19}/></button>
        <button type="button" aria-label={t.zoomOut} title={t.zoomOut} onClick={() => changeZoom(1 / zoomStep)} disabled={view.scale <= layout.minScale}><Icon name="minus" size={19}/></button>
        <button type="button" aria-label={t.recenter} title={t.recenter} onClick={recenter} disabled={!selectedLocation}><Icon name="target" size={17}/></button>
        <button type="button" aria-label={t.resetView} title={t.resetView} onClick={() => { setTooltip(null); animateView(mapHome(region, layout)) }}><Icon name="fit" size={17}/></button>
        <span className="map-zoom-value" aria-label={`${t.mapZoom}: ${view.scale.toFixed(2)}×`}>{view.scale.toFixed(2)}×</span>
      </div>
    </div>
  )
}
