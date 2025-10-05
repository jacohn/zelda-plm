"use client"
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useGamepad } from '@/hooks/useGamepad'
type Step = { path: string; title: string; body: string[]; selector?: string }

const steps: Step[] = [
  { path: '/', title: 'Welcome to PLM', selector: '#explore-card', body: [
    'I love how The Legend of Zelda: Breath of the Wild teaches the engineering principles of planning and iteration through play.',
    'This demo borrows that spirit to make PLM basics clear and fun.',
    'PLM (Product Lifecycle Management) keeps items, changes, and history in sync from idea → release.',
  ]},
  {
    path: '/inventory',
    title: 'Inventory = Items & Revisions', selector: '#inventory-grid',
    body: [
      'Browse parts like swords, shields, and tools — each with a revision (Rev A, Rev B…).',
      'Track suppliers, cost, and health, so teams use the right revision.',
    ],
  },
  {
    path: '/quests',
    title: 'Requests = Incoming Work', selector: '#quest-map',
    body: [
      'Requests collect issues and improvements. Prioritize them and link to affected items.',
      'Progress moves through investigate → fix → verify → close.',
    ],
  },
  {
    path: '/forge',
    title: 'Forge = Changes (ECOs)', selector: '#combine-area',
    body: [
      'Craft variants and propose changes (ECOs) when ready.',
      'Combine components, preview impact, and “forge” an updated design.',
    ],
  },
  {
    path: '/log',
    title: 'Adventure Log = Audit', selector: '#adventure-log',
    body: [
      'Every change leaves breadcrumbs — helpful for compliance and storytelling.',
      'Record results, share release notes, and keep teams aligned.',
    ],
  },
  {
    path: '/', title: "You're all set!", selector: '#nav-menu-button',
    body: [
      'Explore freely. Use the header ☰ to jump anywhere. Have fun!',
    ],
  },
]

export default function Tour() {
  const pathname = usePathname()
  const router = useRouter()
  const search = useSearchParams()
  const isActive = search.get('tour') === 'plm'
  const stepIdx = Math.max(0, Math.min(steps.length - 1, parseInt(search.get('step') || '1', 10) - 1))
  const step = steps[stepIdx]
  const selector = step.selector
  const [measureKey, setMeasureKey] = useState(0)

  // Spotlight target element
  const rect = useMemo(() => {
    if (!isActive || !selector) return null as DOMRect | null
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return null
    const r = el.getBoundingClientRect()
    // auto-scroll into view once per step
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    return r
  }, [isActive, selector, pathname, stepIdx, measureKey])

  // Re-measure on resize/scroll
  useEffect(() => {
    if (!isActive) return
    const onEvt = () => setMeasureKey((k) => k + 1)
    window.addEventListener('resize', onEvt)
    window.addEventListener('scroll', onEvt, true)
    return () => { window.removeEventListener('resize', onEvt); window.removeEventListener('scroll', onEvt, true) }
  }, [isActive])

  // Ensure we are on the right page for the current step
  useEffect(() => {
    if (!isActive) return
    if (pathname !== step.path) {
      router.push(`${step.path}?tour=plm&step=${stepIdx + 1}`)
    }
  }, [isActive, pathname, step.path, stepIdx, router])

  const go = (idx: number) => {
    const safe = Math.max(0, Math.min(steps.length - 1, idx))
    const s = steps[safe]
    router.push(`${s.path}?tour=plm&step=${safe + 1}`)
  }
  const end = () => {
    try { localStorage.setItem('ff_tour_done', '1') } catch {}
    router.push(pathname)
  }

  // Keyboard shortcuts for tour
  useEffect(() => {
    if (!isActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') end()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') go(stepIdx + 1)
      else if (e.key === 'ArrowLeft' || e.key === 'Backspace') go(stepIdx - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, stepIdx])

  // Gamepad shortcuts for tour
  useGamepad((a) => {
    if (!isActive) return
    if (a === 'right' || a === 'confirm') go(stepIdx + 1)
    else if (a === 'left' || a === 'back') go(stepIdx - 1)
  })

  if (!isActive) return null

  return (
    <div className='fixed inset-0 z-[60] pointer-events-none'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/30' />

      {/* Spotlight highlight */}
      {rect && (
        <div
          className='absolute border-2 border-gold rounded-xl shadow-soft'
          style={{ left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16, pointerEvents: 'none' }}
        />
      )}

      {/* Panel */}
      <div className='pointer-events-auto absolute left-1/2 top-6 -translate-x-1/2 w-[min(720px,92vw)]'>
        <div className='glass p-4 rounded-2xl'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='font-display text-xl mb-1'>{step.title}</h3>
              <ul className='list-disc ml-5 space-y-1 text-sm'>
                {step.body.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            <button onClick={end} className='card px-2 py-1 text-sm'>Skip</button>
          </div>
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='text-xs opacity-70'>Step {stepIdx + 1} / {steps.length}</div>
              <div className='flex gap-1'>
                {steps.map((_, i) => (
                  <span key={i} className={`inline-block w-2 h-2 rounded-full ${i===stepIdx?'bg-gold':'bg-white/40'}`}></span>
                ))}
              </div>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => go(stepIdx - 1)}
                disabled={stepIdx === 0}
                className={`card px-3 py-1 text-sm ${stepIdx === 0 ? 'opacity-50' : ''}`}
              >
                Back
              </button>
              {stepIdx < steps.length - 1 ? (
                <button onClick={() => go(stepIdx + 1)} className='card px-3 py-1 text-sm'>Next</button>
              ) : (
                <button onClick={end} className='card px-3 py-1 text-sm'>Finish</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
