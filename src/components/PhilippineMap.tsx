import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Maximize, Minus, Plus } from 'lucide-react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import type { FeatureCollection, MultiPolygon } from 'geojson'
import philippinesRegions from '../geodata/philippines-regions.topo.json'
import type { RegionStat } from '../types'

type RegionFeature = FeatureCollection<MultiPolygon, { adm1_en: string }>

type MetricKey = 'total' | 'completionPct' | 'avgDays' | 'onTimePct'

const number = new Intl.NumberFormat('en-PH')

const METRICS: Record<MetricKey, { label: string; format: (s: RegionStat) => string }> = {
  total: { label: 'Total requests', format: (s) => number.format(s.total) },
  completionPct: {
    label: 'Completion rate',
    format: (s) => `${s.total ? Math.round((s.completed / s.total) * 100) : 0}%`,
  },
  avgDays: { label: 'Avg. processing', format: (s) => `${s.avgDays.toFixed(1)} days` },
  onTimePct: { label: 'Completed on time', format: (s) => `${s.onTimePct}%` },
}
const METRIC_KEYS = Object.keys(METRICS) as MetricKey[]

function metricValue(stat: RegionStat, key: MetricKey): number {
  switch (key) {
    case 'total': return stat.total
    case 'completionPct': return stat.total ? (stat.completed / stat.total) * 100 : 0
    case 'avgDays': return stat.avgDays
    case 'onTimePct': return stat.onTimePct
  }
}

const LOW = [0xea, 0xf0, 0xff]
const HIGH = [0x17, 0x49, 0xc6]

function toColor(t: number): string {
  const v = Math.max(0, Math.min(1, t))
  const r = Math.round(LOW[0] + (HIGH[0] - LOW[0]) * v)
  const g = Math.round(LOW[1] + (HIGH[1] - LOW[1]) * v)
  const b = Math.round(LOW[2] + (HIGH[2] - LOW[2]) * v)
  return `rgb(${r},${g},${b})`
}

const SHORT_NAMES: Record<string, string> = {
  'Region I (Ilocos Region)': 'Ilocos',
  'Region II (Cagayan Valley)': 'Cagayan Valley',
  'Region III (Central Luzon)': 'Central Luzon',
  'Region IV-A (CALABARZON)': 'CALABARZON',
  'Region V (Bicol Region)': 'Bicol',
  'Region VI (Western Visayas)': 'W. Visayas',
  'Region VII (Central Visayas)': 'C. Visayas',
  'Region VIII (Eastern Visayas)': 'E. Visayas',
  'Region IX (Zamboanga Peninsula)': 'Zamboanga',
  'Region X (Northern Mindanao)': 'N. Mindanao',
  'Region XI (Davao Region)': 'Davao',
  'Region XII (SOCCSKSARGEN)': 'SOCCSKSARGEN',
  'National Capital Region (NCR)': 'NCR',
  'Cordillera Administrative Region (CAR)': 'CAR',
  'Region XIII (Caraga)': 'Caraga',
  'MIMAROPA Region': 'MIMAROPA',
  'Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)': 'BARMM',
}

const VIEW_W = 560
const VIEW_H = 960
const MIN_SCALE = 1
const MAX_SCALE = 10

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function clampView(v: { scale: number; tx: number; ty: number }) {
  const scale = clamp(v.scale, MIN_SCALE, MAX_SCALE)
  return {
    scale,
    tx: clamp(v.tx, -(scale - 1) * VIEW_W * 0.6, (scale - 1) * VIEW_W * 0.6),
    ty: clamp(v.ty, -(scale - 1) * VIEW_H * 0.6, (scale - 1) * VIEW_H * 0.6),
  }
}

export default function PhilippineMap({
  stats,
  selected = null,
  onSelect,
}: {
  stats: RegionStat[]
  selected?: string | null
  onSelect?: (region: string) => void
}) {
  const [metric, setMetric] = useState<MetricKey>('total')
  const [hover, setHover] = useState<{ stat: RegionStat; x: number; y: number } | null>(null)
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 })
  const [dragging, setDragging] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const pinch = useRef<{ distance: number; scale: number; cx: number; cy: number } | null>(null)
  const suppressClick = useRef(false)

  const geo = useMemo<RegionFeature>(() => {
    const topology = philippinesRegions as unknown as Topology
    const object = topology.objects['PH_Adm1_Regions.shp'] as unknown as GeometryCollection
    return feature(topology, object) as unknown as RegionFeature
  }, [])

  const paths = useMemo(() => {
    const projection = geoMercator().fitExtent([[16, 16], [VIEW_W - 16, VIEW_H - 16]], geo)
    const path = geoPath(projection)
    return geo.features.map((item) => {
      const [cx, cy] = path.centroid(item)
      return { name: item.properties.adm1_en, d: path(item) ?? '', cx, cy }
    })
  }, [geo])

  const byRegion = useMemo(() => new Map(stats.map((s) => [s.region, s])), [stats])

  const { min, max } = useMemo(() => {
    const items = stats.map((s) => metricValue(s, metric))
    return { min: items.length ? Math.min(...items) : 0, max: items.length ? Math.max(...items) : 0 }
  }, [stats, metric])
  const span = max - min || 1

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    setView((v) => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE)
      const k = scale / v.scale
      return clampView({ scale, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k })
    })
  }, [])
  const zoomBy = (factor: number) => zoomAt(VIEW_W / 2, VIEW_H / 2, factor)
  const resetView = () => setView({ scale: 1, tx: 0, ty: 0 })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const rect = svg.getBoundingClientRect()
      const factor = e.deltaY > 0 ? 1 / 1.25 : 1.25
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor)
    }
    svg.addEventListener('wheel', handler, { passive: false })
    return () => svg.removeEventListener('wheel', handler)
  }, [zoomAt])

  const updateHover = (e: React.MouseEvent, stat?: RegionStat) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || !stat) return
    setHover({ stat, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    suppressClick.current = false
    dragStart.current = { x: e.clientX, y: e.clientY }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = {
        distance: Math.hypot(b.x - a.x, b.y - a.y),
        scale: view.scale,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      }
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const distance = Math.hypot(b.x - a.x, b.y - a.y)
      const factor = pinch.current.distance ? distance / pinch.current.distance : 1
      const scale = clamp(pinch.current.scale * factor, MIN_SCALE, MAX_SCALE)
      const k = scale / pinch.current.scale
      const rect = e.currentTarget.getBoundingClientRect()
      const cx = pinch.current.cx - rect.left
      const cy = pinch.current.cy - rect.top
      setView(clampView({ scale, tx: cx - (cx - view.tx) * k, ty: cy - (cy - view.ty) * k }))
      setDragging(true)
      return
    }
    const start = dragStart.current
    if (!start || pointers.current.size !== 1) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.hypot(dx, dy) > 4) suppressClick.current = true
    if (dx !== 0 || dy !== 0) {
      dragStart.current = { x: e.clientX, y: e.clientY }
      setDragging(true)
      setView((v) => clampView({ ...v, tx: v.tx + dx, ty: v.ty + dy }))
    }
  }

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const hadTwo = pointers.current.size >= 2
    pointers.current.delete(e.pointerId)
    pinch.current = null
    dragStart.current = null
    setDragging(false)
    const wasTap = !suppressClick.current && !hadTwo && pointers.current.size === 0
    if (wasTap) {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const name = el?.getAttribute('data-region')
      if (name) onSelect?.(name)
    }
  }

  const onDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, 2)
  }

  const showLabels = view.scale >= 1.5

  return (
    <div className="ph-map" ref={wrapRef}>
      <div className="ph-map-metrics" role="tablist" aria-label="Map metric">
        {METRIC_KEYS.map((key) => (
          <button
            key={key}
            className={metric === key ? 'active' : ''}
            aria-selected={metric === key}
            onClick={() => setMetric(key)}
          >
            {METRICS[key].label}
          </button>
        ))}
      </div>
      <div className={`ph-map-canvas ${dragging ? 'is-dragging' : ''}`}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          className={selected ? 'has-selection' : ''}
          aria-label="Philippines map coloured by selected metric"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
        >
          <g transform={`translate(${view.tx} ${view.ty}) scale(${view.scale})`}>
            {paths.map((item) => {
              const stat = byRegion.get(item.name)
              const fill = stat ? toColor((metricValue(stat, metric) - min) / span) : 'none'
              const isSelected = item.name === selected
              return (
                <path
                  key={item.name}
                  d={item.d}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2.2 : 0.7}
                  vectorEffect="non-scaling-stroke"
                  data-region={item.name}
                  className={`ph-region ${stat ? '' : 'is-empty'} ${isSelected ? 'is-selected' : ''}`}
                  onMouseEnter={(e) => updateHover(e, stat)}
                  onMouseMove={(e) => updateHover(e, stat)}
                  onMouseLeave={() => setHover(null)}
                />
              )
            })}
            {showLabels &&
              paths.map((item) => (
                <text
                  key={`label-${item.name}`}
                  x={item.cx}
                  y={item.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`ph-region-label ${item.name === selected ? 'is-selected' : ''}`}
                >
                  {SHORT_NAMES[item.name] ?? item.name}
                </text>
              ))}
          </g>
        </svg>
      </div>
      <div className="ph-map-zoom" role="group" aria-label="Map zoom controls">
        <button onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out">
          <Minus />
        </button>
        <button onClick={() => zoomBy(1.4)} aria-label="Zoom in">
          <Plus />
        </button>
        <button onClick={resetView} aria-label="Reset view">
          <Maximize />
        </button>
      </div>
      <div className="ph-map-legend">
        <span>{number.format(Math.round(min))}</span>
        <i style={{ background: `linear-gradient(90deg, ${toColor(0)}, ${toColor(1)})` }} />
        <span>{number.format(Math.round(max))}</span>
      </div>
      <div className="ph-map-hint">Scroll to zoom · drag to pan · double-click to zoom in</div>
      {hover && (
        <div className="ph-map-tooltip" style={{ left: hover.x, top: hover.y }}>
          <strong>{hover.stat.region}</strong>
          <span>{METRICS[metric].label}: {METRICS[metric].format(hover.stat)}</span>
          <small>{number.format(hover.stat.completed)} of {number.format(hover.stat.total)} completed</small>
        </div>
      )}
    </div>
  )
}
