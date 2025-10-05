'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { dataset, type Item } from '@/lib/data'
import { motion } from 'framer-motion'
import { useGamepad } from '@/hooks/useGamepad'
import { Apple, Hammer, Shield, Sword, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
const cols = 5

function tileSymbol(it: Item) {
  // Lightweight iconography without external assets
  if (it.type === 'weapon') return <Sword size={20} />
  if (it.type === 'shield') return <Shield size={20} />
  if (it.type === 'tool') return <Hammer size={20} />
  return <Apple size={20} />
}

export default function InventoryGrid() {
  const router = useRouter()
  const [cat, setCat] = useState<string>('all')
  const allItems = dataset.items
  const types = useMemo(() => Array.from(new Set(allItems.map(i => i.type))).sort(), [allItems])
  const items = useMemo(
    () => allItems.filter((i) => (cat === 'all' ? true : i.type === cat)),
    [allItems, cat]
  )
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState<Set<string>>(new Set())
  const gridRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { setIndex(0) }, [cat])

  const move = (dx: number, dy: number) => {
    const rows = Math.ceil(items.length / cols)
    const x = index % cols
    const y = Math.floor(index / cols)
    let nx = Math.max(0, Math.min(cols - 1, x + dx))
    let ny = Math.max(0, Math.min(rows - 1, y + dy))
    let ni = ny * cols + nx
    if (ni >= items.length) {
      // clamp to last item in that row
      ni = items.length - 1
    }
    setIndex(ni)
  }

  const toggleHold = () => {
    const it = items[index]
    if (!it) return
    setHeld((prev) => {
      const next = new Set(prev)
      if (next.has(it.id)) next.delete(it.id)
      else if (next.size < 5) next.add(it.id)
      return next
    })
  }

  const nextCat = () => {
    const order: string[] = ['all', ...types]
    setCat((c) => order[(order.indexOf(c) + 1) % order.length])
  }
  const prevCat = () => {
    const order: string[] = ['all', ...types]
    setCat((c) => order[(order.indexOf(c) - 1 + order.length) % order.length])
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'input') return
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': move(-1, 0); break
        case 'ArrowRight': case 'd': case 'D': move(1, 0); break
        case 'ArrowUp': case 'w': case 'W': move(0, -1); break
        case 'ArrowDown': case 's': case 'S': move(0, 1); break
        case 'Enter': case ' ': toggleHold(); break
        case '1': setCat('all'); break
        case '2': setCat(types[0] || 'all'); break
        case '3': setCat(types[1] || 'all'); break
        case '4': setCat(types[2] || 'all'); break
        case '5': setCat(types[3] || (types[0]||'all')); break
        case '6': setCat(types[4] || (types[0]||'all')); break
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) prevCat(); else nextCat();
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, items.length])

  // Gamepad D-pad navigation and confirm/back
  useGamepad((a) => {
    if (a === 'left') move(-1, 0)
    else if (a === 'right') move(1, 0)
    else if (a === 'up') move(0, -1)
    else if (a === 'down') move(0, 1)
    else if (a === 'confirm') toggleHold()
    else if (a === 'back') setHeld(new Set())
  })

  const selected = items[index]
  const formatRev = (rev: string) => {
    const m = /rev\s*([a-z])/i.exec(rev)
    return m ? `rev ${m[1]}` : (rev?.toLowerCase?.() || String(rev))
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Left: Category tabs + grid */}
      <div className='lg:col-span-2'>
        <div className='glass px-3 py-2 flex items-center gap-2 mb-3 flex-wrap'>
          <button onClick={() => setCat('all')} className={`card px-3 py-1 ${cat==='all'?'ring-2 ring-gold':''}`}>All</button>
          {types.map(t => (
            <button key={t} onClick={() => setCat(t)} className={`card px-3 py-1 flex items-center gap-1 ${cat===t?'ring-2 ring-gold':''}`}>
              {t === 'weapon' ? <Sword size={16}/> : t === 'shield' ? <Shield size={16}/> : t === 'tool' ? <Hammer size={16}/> : <Apple size={16}/>} {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
          <span className='ml-auto text-sm opacity-80'>Can hold {held.size} / 5</span>
          <span className='text-xs opacity-70'>Tab to switch</span>
        </div>
        <div id='inventory-grid' ref={gridRef} className='glass p-3 grid grid-cols-5 gap-3 relative'>
          {index % cols === 0 && items.length > 0 && (
            <ChevronLeft className='absolute left-1 top-1/2 -translate-y-1/2 opacity-60' />
          )}
          {index % cols === cols-1 && items.length > 0 && (
            <ChevronRight className='absolute right-1 top-1/2 -translate-y-1/2 opacity-60' />
          )}
          {items.map((it, i) => {
            const active = i === index
            const isHeld = held.has(it.id)
            return (
              <motion.button
                key={it.id}
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => setIndex(i)}
                onClick={toggleHold}
                className={`tile text-center ${active ? 'ring-2 ring-rune shadow-soft' : ''}`}
              >
                <div className='opacity-90'>{tileSymbol(it)}</div>
                <div className='absolute bottom-1 right-1 text-xs bg-temple/60 px-1 rounded'>x1</div>
                {/* Hearts as durability */}
                <div className='absolute top-1 left-1 flex gap-0.5 opacity-90'>
                  {Array.from({ length: Math.max(1, Math.round((it.health_pct||0)/20)) }).map((_,h) => (
                    <Heart key={h} size={10} className='fill-gold text-gold' />
                  ))}
                </div>
                {/* Bracket corners */}
                {active && (
                  <>
                    <span className='corner tl'></span>
                    <span className='corner tr'></span>
                    <span className='corner bl'></span>
                    <span className='corner br'></span>
                  </>
                )}
                {isHeld && (
                  <div className='absolute inset-1 border-2 border-gold rounded pointer-events-none' />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Right: Details panel */}
      <div id='inventory-details' className='glass p-4'>
        {selected ? (
          <div>
            <h3 className='font-display text-2xl'>{selected.name}</h3>
            <p className='mt-2 opacity-90'>{selected.description}</p>
            <div className='mt-3 text-sm opacity-80'>Type: {selected.type} • {formatRev(selected.revision)}</div>
            <div className='mt-2 text-sm opacity-80'>Supplier: {selected.supplier} • Cost: {selected.cost}</div>
            <div className='mt-3 h-2 bg-white/10 rounded-full overflow-hidden'>
              <div className='h-full bg-rune' style={{ width: `${selected.health_pct}%` }} />
            </div>
            <div className='mt-4'>
              <div className='text-sm opacity-80 mb-2'>Holding {held.size} / 5</div>
              <div className='flex flex-wrap gap-2 text-sm'>
                <button onClick={toggleHold} className='card px-3 py-1'>Add</button>
                <button onClick={() => setHeld(new Set())} className='card px-3 py-1'>Stop holding</button>
                <button className='card px-3 py-1' onClick={() => router.push(`/forge?base=${encodeURIComponent(selected.id)}`)}>
                  Open in ECO
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className='opacity-80'>Select an item…</p>
        )}
        <div className='mt-6 border-t border-white/10 pt-3 text-xs opacity-80'>
          Hints: Enter/A Add • B/Backspace Clear • 1‑4 tabs • Tab next tab • Arrows/WASD/D‑pad move
        </div>
      </div>
    </div>
  )
}
