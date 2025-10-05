"use client"
import { dataset, type Request } from '@/lib/data'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useGamepad } from '@/hooks/useGamepad'

const STEPS = [
  'Investigate',
  'Root cause',
  'Design change',
  'Approve ECO',
  'Implement',
  'Verify',
  'Close',
]

function progressFor(status: string) {
  if (status.toLowerCase() === 'closed') return STEPS.length
  // Conservative default: first 2 steps done for an active request
  return 2
}

type Pt = { x: number; y: number }

function polyline(points: Pt[]) {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

export default function QuestMap({ quest, width = 1200, height = 600 }: { quest: Request; width?: number; height?: number }) {
  const prog = progressFor(quest.status)
  const nextIdx = Math.min(prog, STEPS.length - 1)
  const itemName = useMemo(() => {
    const nm = dataset.items.find(i => i.id === quest.linked_item)?.name
    return nm || 'item'
  }, [quest.linked_item])

  // Seeded RNG so each quest has a distinct, stable region
  function hashSeed(s: string): number {
    let h = 2166136261 >>> 0
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }
  function mulberry32(a: number) {
    return function() {
      let t = (a += 0x6D2B79F5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  const rng = mulberry32(hashSeed(quest.id || quest.title))

  // Define a sub-rectangle covering 50–75% of map extents, placed deterministically
  const margin = 40
  const availW = Math.max(0, width - margin * 2)
  const availH = Math.max(0, height - margin * 2)
  const fracW = 0.5 + rng() * 0.25 // 50%..75%
  const fracH = 0.5 + rng() * 0.25 // 50%..75%
  const rectW = availW * fracW
  const rectH = availH * fracH
  const offsetX = margin + rng() * (availW - rectW)
  const offsetY = margin + rng() * (availH - rectH)

  // Path characteristics within the sub-rectangle
  const slope = (rng() - 0.5) * 0.6 // gentle diagonal drift
  const wave = 0.7 + rng() * 0.6 // wave frequency
  const amplitude = Math.max(40, Math.min(90, rectH * 0.25))

  const pts: Pt[] = Array.from({ length: STEPS.length }, (_, j) => {
    const t = j / (STEPS.length - 1)
    const x = offsetX + t * rectW
    const baseY = offsetY + rectH * 0.5 + (t - 0.5) * slope * rectH
    const y = baseY + Math.sin(j * wave) * amplitude * (j % 2 ? 0.6 : 0.9)
    return { x, y }
  })
  const [active, setActive] = useState<number>(nextIdx)

  useEffect(() => { setActive(nextIdx) }, [nextIdx])

  // Keyboard navigation over stages
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'input') return
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setActive((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setActive((i) => Math.min(STEPS.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Gamepad navigation
  useGamepad((a) => {
    if (a === 'left') setActive((i) => Math.max(0, i - 1))
    else if (a === 'right') setActive((i) => Math.min(STEPS.length - 1, i + 1))
  })

  const { expl, tasks } = useMemo(() => {
    const stage = STEPS[active]
    const table: Record<string, { expl: string; tasks: string[] }> = {
      Investigate: {
        expl: `Confirm the issue and gather evidence on ${itemName}.`,
        tasks: [
          'Interview origin; collect logs/screenshots',
          'Reproduce; note expected vs actual behavior',
          'Capture severity, frequency, environment',
        ],
      },
      'Root cause': {
        expl: 'Trace defect to source and document findings.',
        tasks: [
          'Inspect design/BOM and recent diffs',
          'Review supplier data and revisions',
          'Create 5‑Whys or fault tree summary',
        ],
      },
      'Design change': {
        expl: 'Define the fix and update specs.',
        tasks: [
          'Propose design/BOM updates',
          'Update acceptance criteria & tests',
          'Estimate cost/impact & risks',
        ],
      },
      'Approve ECO': {
        expl: 'Formalize approval for the change.',
        tasks: [
          'Open ECO and attach artifacts',
          'Route reviewers; collect sign‑offs',
          'Link affected items and revisions',
        ],
      },
      Implement: {
        expl: 'Apply the change across artifacts and processes.',
        tasks: [
          'Update CAD/docs; bump revision',
          'Notify suppliers/manufacturing',
          'Migrate inventory/processes if needed',
        ],
      },
      Verify: {
        expl: 'Prove the fix resolves the issue.',
        tasks: [
          'Execute acceptance tests; record results',
          'Run regression on related items',
          'Field validation where applicable',
        ],
      },
      Close: {
        expl: 'Finish and document completion.',
        tasks: [
          'Update audit log and links',
          'Communicate release notes',
          'Close request and ECO',
        ],
      },
    }
    return table[stage]
  }, [active, quest.linked_item])

  // Simple word-wrap into lines to keep text within box
  function wrapLine(text: string, max = 44): string[] {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > max) {
        if (cur) lines.push(cur)
        cur = w
      } else {
        cur = (cur ? cur + ' ' : '') + w
      }
    }
    if (cur) lines.push(cur)
    return lines
  }

  return (
    <svg width='100%' height={height} viewBox={`0 0 ${width} ${height}`} className='block'>
      <defs>
        <linearGradient id='pathGrad' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='#8bd4e2' stopOpacity='1' />
          <stop offset='100%' stopColor='#ffd65e' stopOpacity='1' />
        </linearGradient>
        <filter id='glow'>
          <feGaussianBlur stdDeviation='3' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <linearGradient id='riverGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#78b7c3' stopOpacity='0.35'/>
          <stop offset='100%' stopColor='#2f6d7a' stopOpacity='0.35'/>
        </linearGradient>
        <linearGradient id='mountGrad' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='rgba(233, 226, 206, 0.35)'/>
          <stop offset='100%' stopColor='rgba(107, 86, 64, 0.35)'/>
        </linearGradient>
      </defs>

      {/* Background world: rivers, mountains, forests, contours */}
      <g>
        {/* Rivers */}
        <path
          d={`M ${width*0.03},${height*0.15} C ${width*0.20},${height*0.00} ${width*0.35},${height*0.35} ${width*0.50},${height*0.28}
              S ${width*0.80},${height*0.10} ${width*0.95},${height*0.35}`}
          fill='none'
          stroke='url(#riverGrad)'
          strokeWidth={18}
          strokeLinecap='round'
          opacity={0.5}
        />
        <path
          d={`M ${width*0.40},${height*0.05} C ${width*0.45},${height*0.18} ${width*0.55},${height*0.22} ${width*0.62},${height*0.40}`}
          fill='none'
          stroke='url(#riverGrad)'
          strokeWidth={10}
          strokeLinecap='round'
          opacity={0.45}
        />

        {/* Lake */}
        <ellipse cx={width*0.72} cy={height*0.62} rx={80} ry={40} fill='url(#riverGrad)' stroke='#78b7c3' strokeOpacity='0.35' />

        {/* Mountains */}
        {[
          {x: width*0.18, y: height*0.58, s: 1.1},
          {x: width*0.26, y: height*0.55, s: 0.9},
          {x: width*0.34, y: height*0.60, s: 1.2},
          {x: width*0.60, y: height*0.18, s: 1.0},
          {x: width*0.68, y: height*0.16, s: 0.8},
          {x: width*0.80, y: height*0.20, s: 1.1},
        ].map((m, i) => (
          <g key={i} opacity={0.6}>
            <polygon
              points={`${m.x},${m.y-60*m.s} ${m.x-50*m.s},${m.y+20*m.s} ${m.x+50*m.s},${m.y+20*m.s}`}
              fill='url(#mountGrad)'
              stroke='rgba(233, 226, 206, 0.25)'
            />
            <polyline
              points={`${m.x-20*m.s},${m.y} ${m.x},${m.y-35*m.s} ${m.x+18*m.s},${m.y}`}
              fill='none'
              stroke='rgba(233, 226, 206, 0.35)'
              strokeWidth={2}
            />
          </g>
        ))}

        {/* Forest patches */}
        <g opacity={0.35} fill='#3c7a63'>
          {Array.from({length: 24}).map((_,i)=>{
            const fx = (i%8)/8
            const fy = Math.floor(i/8)/3
            const cx = width*0.08 + fx*width*0.25 + (i%2?12:-6)
            const cy = height*0.65 + fy*30 + (i%3?10:-8)
            const r = 8 + (i%5)
            return <circle key={i} cx={cx} cy={cy} r={r} />
          })}
        </g>

        {/* Contour lines */}
        {Array.from({length: 8}).map((_,i)=> (
          <path key={i}
                d={`M 10 ${40+i*60} C ${width*0.25} ${20+i*55}, ${width*0.55} ${60+i*45}, ${width-10} ${30+i*50}`}
                stroke='rgba(232,221,199,0.06)'
                fill='none'
          />
        ))}
      </g>

      <polyline
        points={polyline(pts)}
        fill='none'
        stroke='url(#pathGrad)'
        strokeOpacity='0.9'
        strokeWidth={5}
        filter='url(#glow)'
      />

      {pts.map((p, j) => {
        const done = j < prog
        const isNext = j === nextIdx && quest.status.toLowerCase() !== 'closed'
        const fill = done ? '#ffd65e' : isNext ? '#8bd4e2' : 'transparent'
        const stroke = done || isNext ? '#ffffff' : 'rgba(255,255,255,0.7)'
        return (
          <g key={`${quest.id}-${j}`} onMouseEnter={() => setActive(j)}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={active === j ? 14 : 12}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.03 * j }}
              fill={fill}
              stroke={stroke}
              strokeWidth={active === j ? 3.5 : 2.5}
              filter='url(#glow)'
            />
            <text x={p.x + 16} y={p.y + 5} fill='#fffce6' stroke='#00000066' strokeWidth={0.6} paintOrder='stroke' fontSize='13'>
              {STEPS[j]}
            </text>
          </g>
        )
      })}

      {/* title */}
      <text x={pts[0].x} y={pts[0].y - 24} fill='#fff9db' stroke='#00000066' strokeWidth={0.8} paintOrder='stroke' fontSize='18' className='font-display'>
        {quest.title}
      </text>

      {/* Tooltip for active stage with word-wrapped lines and task bullets */}
      {(() => {
        const p = pts[active]
        const stage = STEPS[active]
        const bodyLines: string[] = [
          ...wrapLine(expl, 44),
          ...tasks.flatMap((t) => wrapLine(`• ${t}`, 44)),
        ]
        const paddingX = 14
        const paddingY = 14
        const lineH = 16
        const headerMainH = 20
        const subHeaderH = 14
        const contentH = bodyLines.length * lineH
        const boxW = 360
        const boxH = paddingY * 2 + headerMainH + subHeaderH + 6 + contentH
        const bx = Math.min(Math.max(20, p.x + 20), width - boxW - 20)
        const by = Math.min(Math.max(20, p.y - boxH - 10), height - boxH - 20)
        return (
          <g>
            <rect
              x={bx}
              y={by}
              width={boxW}
              height={boxH}
              rx={12}
              ry={12}
              fill='rgba(30,52,64,0.85)'
              stroke='rgba(120,183,195,0.6)'
              strokeWidth={1}
            />
            {/* Request title */}
            <text x={bx + paddingX} y={by + paddingY + 6} fill='#c9a227' fontSize='14' className='font-display'>
              {quest.title}
            </text>
            {/* Stage name */}
            <text x={bx + paddingX} y={by + paddingY + headerMainH} fill='#78b7c3' fontSize='12'>
              Stage: {stage}
            </text>
            {bodyLines.map((ln, i) => (
              <text key={i}
                    x={bx + paddingX}
                    y={by + paddingY + headerMainH + subHeaderH + 6 + i * lineH}
                    fill='#e8ddc7'
                    fontSize='12'>
                {ln}
              </text>
            ))}
          </g>
        )
      })()}
    </svg>
  )
}
