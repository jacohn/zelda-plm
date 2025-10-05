"use client"
import { dataset, type Item, type Change, type LogEntry } from '@/lib/data'
import { recipeRules, rulesMatchingText } from '@/lib/recipes'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGamepad } from '@/hooks/useGamepad'
import { useRouter, useSearchParams } from 'next/navigation'

type PotState = {
  items: Item[]
  forging: boolean
  result?: Item
}

function bumpRev(r: string) {
  const m = /Rev\s+([A-Z])/i.exec(r)
  if (!m) return 'Rev B'
  const code = m[1].toUpperCase().charCodeAt(0)
  const next = String.fromCharCode(Math.min('Z'.charCodeAt(0), code + 1))
  return `Rev ${next}`
}

function combine(items: Item[]): Item {
  const base = items[0]
  const ings = items.slice(1)
  const adjectives = new Set<string>()
  const addIf = (cond: boolean, adj: string) => { if (cond) adjectives.add(adj) }
  const ingText = (ings.map(i => `${i.name} ${i.description}`)).join(' ').toLowerCase()
  addIf(/dragon/.test(ingText), 'Dragon')
  addIf(/leather/.test(ingText), 'Leather')
  addIf(/blessed|sacred|sanctified/.test(ingText), 'Blessed')
  addIf(/reinforc|strap/.test(ingText), 'Reinforced')
  addIf(/spring|alloy/.test(ingText), 'Alloyed')
  addIf(/light|swift/.test(ingText), 'Swift')

  const adj = Array.from(adjectives)
  let name = adj.length ? `${adj.join(' ')} ${base.name}` : `${base.name} Mk II`
  const revision = bumpRev(base.revision)
  let cost = Math.round(base.cost + ings.reduce((s, i) => s + i.cost, 0) * 0.3)
  let health_pct = Math.min(100, Math.max(20, base.health_pct + ings.length * 12))

  // Data-driven recipe rules
  const baseText = `${base.name} ${base.description} ${base.type}`.toLowerCase()
  const allText = `${baseText} ${ingText}`
  const hit = rulesMatchingText(allText)[0]
  if (hit) {
    name = hit.name.replace('{base}', base.name)
    if (hit.healthAdd) health_pct = Math.min(100, health_pct + hit.healthAdd)
    if (hit.costMul) cost = Math.round(cost * hit.costMul)
  }

  return {
    ...base,
    id: `${base.id}-VAR-${ings.length}`,
    name,
    revision,
    supplier: 'Sacred Forge',
    description: `Forged from ${base.name} with ${ings.map(i => i.name).join(', ')}.`,
    cost,
    health_pct,
    notes: 'Variant preview (not persisted)'
  }
}

export default function ForgeRitual(){
  const inventory = dataset.items
  const router = useRouter()
  const search = useSearchParams()
  const [pot, setPot] = useState<PotState>({ items: [], forging: false })
  const [changes, setChanges] = useState<Change[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [toast, setToast] = useState<string|undefined>()
  const successRef = useRef<HTMLAudioElement|null>(null)
  const selectRef = useRef<HTMLAudioElement|null>(null)
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all'|string>('all')
  const types = useMemo(() => Array.from(new Set(inventory.map(i=>i.type))).sort(), [inventory])
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return inventory.filter(it =>
      (typeFilter==='all' || it.type===typeFilter) &&
      (needle==='' || (`${it.name} ${it.description} ${it.notes}`.toLowerCase().includes(needle)))
    )
  }, [inventory, q, typeFilter])

  const canAdd = pot.items.length < 6
  const canForge = pot.items.length >= 2

  const resultPreview = useMemo(() => pot.items.length >= 2 ? combine(pot.items) : undefined, [pot.items])
  const recipeHints = useMemo(() => {
    if (!pot.items.length) return [] as { id: string; name: string; ready: boolean; notes?: string }[]
    const base = pot.items[0]
    const baseText = `${base.name} ${base.description} ${base.type}`.toLowerCase()
    const ingText = pot.items.slice(1).map(i => `${i.name} ${i.description}`).join(' ').toLowerCase()
    const combined = `${baseText} ${ingText}`
    const matches = rulesMatchingText(combined)
    return matches.slice(0,4).map(r => ({
      id: r.id,
      name: r.name.replace('{base}', base.name),
      ready: r.when.every(k => combined.includes(k)),
      notes: r.notes,
    }))
  }, [pot.items])

  const addToPot = (it: Item) => {
    if (!canAdd) return
    selectRef.current?.play().catch(()=>{})
    setPot(ps => ({ ...ps, items: [...ps.items, it] }))
  }
  const removeFromPot = (idx: number) => setPot(ps => ({ ...ps, items: ps.items.filter((_, i) => i !== idx) }))

  const startForge = async () => {
    if (!canForge) return
    setPot(ps => ({ ...ps, forging: true, result: undefined }))
    await new Promise(r => setTimeout(r, 1200))
    const made = combine(pot.items)
    successRef.current?.play().catch(()=>{})
    setPot(ps => ({ items: [], forging: false, result: made }))
    // persist to local Changes and Log
    persistChange(made, pot.items[0]?.id || made.id, changes, setChanges, logs, setLogs)
    // toast recipe discovered if any
    try {
      const base = pot.items[0]
      const baseText = `${base.name} ${base.description} ${base.type}`.toLowerCase()
      const ingText = pot.items.slice(1).map(i => `${i.name} ${i.description}`).join(' ').toLowerCase()
      const combined = `${baseText} ${ingText}`
      const hit = rulesMatchingText(combined)[0]
      if (hit) {
        const msg = `Recipe discovered: ${hit.name.replace('{base}', base.name)}`
        setToast(msg)
        setTimeout(()=>setToast(undefined), 2500)
      }
    } catch {}
  }

  // Drag & drop support
  // Framer Motion and different input paths can make the event type ambiguous; accept any and cast.
  const onDragStartItem = (e: any, it: Item) => {
    const ev = e as React.DragEvent
    try { ev.dataTransfer?.setData('text/plain', it.id) } catch {}
  }
  const onDropIntoSlot = (e: any) => {
    const ev = e as React.DragEvent
    ev.preventDefault?.()
    const id = ev.dataTransfer?.getData?.('text/plain')
    const it = inventory.find(i => i.id === id)
    if (it) addToPot(it)
  }
  const onDragOver = (e: any) => { e.preventDefault?.() }

  // Gamepad focus and actions
  type FocusArea = 'inventory' | 'pot' | 'forge'
  const [focusArea, setFocusArea] = useState<FocusArea>('inventory')
  const [focusIdx, setFocusIdx] = useState(0)
  const invCount = filtered.length
  const potCount = 6
  useGamepad((a) => {
    if (a === 'left') {
      setFocusIdx(i => Math.max(0, i - 1))
    } else if (a === 'right') {
      const max = focusArea === 'inventory' ? invCount - 1 : potCount - 1
      setFocusIdx(i => Math.min(max, i + 1))
    } else if (a === 'up') {
      setFocusArea(p => p === 'inventory' ? 'forge' : p === 'forge' ? 'pot' : 'inventory')
      setFocusIdx(0)
    } else if (a === 'down') {
      setFocusArea(p => p === 'inventory' ? 'pot' : p === 'pot' ? 'forge' : 'inventory')
      setFocusIdx(0)
    } else if (a === 'confirm') {
      if (focusArea === 'inventory') addToPot(filtered[focusIdx])
      else if (focusArea === 'pot') removeFromPot(focusIdx)
      else if (focusArea === 'forge') startForge()
    } else if (a === 'back') {
      if (focusArea === 'pot' && pot.items[focusIdx]) removeFromPot(focusIdx)
    }
  })

  // Load persisted changes and log
  useEffect(() => {
    try {
      const cs = JSON.parse(localStorage.getItem('ff_changes') || '[]') as Change[]
      const ls = JSON.parse(localStorage.getItem('ff_log') || '[]') as LogEntry[]
      setChanges(cs)
      setLogs(ls)
    } catch {}
  }, [])
  // If navigated with ?base=ID, preload that item into the pot
  useEffect(() => {
    const baseId = search.get('base')
    if (!baseId) return
    const it = inventory.find(i => i.id === baseId)
    if (it) {
      setPot(ps => (ps.items.length ? ps : { ...ps, items: [it] }))
    }
    // Clean the URL to avoid re-adding on refresh
    router.replace('/forge')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Clamp focus index when filtering
  useEffect(() => {
    if (focusArea==='inventory') setFocusIdx(i => Math.min(Math.max(0, i), Math.max(0, invCount-1)))
  }, [invCount, focusArea])

  return (
    <div className='card p-4'>
      <audio ref={successRef} src='/sfx/success.wav' preload='auto' />
      <audio ref={selectRef} src='/sfx/select.wav' preload='auto' />
      <h3 className='font-display text-2xl'>Forge Ritual</h3>

      <div className='mt-4 grid lg:grid-cols-3 gap-4'>
        {/* Inventory */}
        <div className='glass p-3 rounded-2xl'>
          <div className='flex items-center justify-between'>
            <h4 className='font-display text-xl'>Inventory</h4>
            <div className='text-sm opacity-70'>{filtered.length}/{inventory.length} items</div>
          </div>
          <div className='mt-2 flex gap-2'>
            <input
              className='card px-3 py-2 w-full'
              placeholder='Search name, description, notes'
              value={q}
              onChange={e=>setQ(e.target.value)}
            />
            <select className='card px-2 py-2 min-w-[8rem]' value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
              <option value='all'>All types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className='mt-2 grid sm:grid-cols-2 gap-2'>
            {filtered.map((it, idx) => (
              <motion.button
                key={it.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => addToPot(it)}
                className={`card p-2 text-left ${focusArea==='inventory' && focusIdx===idx ? 'ring-2 ring-gold' : ''}`}
                draggable
                onDragStart={(e)=>onDragStartItem(e,it)}
                disabled={!canAdd}
              >
                <div className='text-sm opacity-70'>{it.type} • {it.revision}</div>
                <div className='font-semibold'>{it.name}</div>
                <div className='text-xs opacity-80 line-clamp-2'>{it.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cauldron / Forge */}
        <div className='col-span-2'>
          <div className='glass p-4 rounded-2xl'>
            <h4 className='font-display text-xl mb-2'>Combine Components</h4>
            <div id='combine-area' className='relative rounded-2xl p-6 border border-white/10 overflow-hidden' style={{
              background: 'radial-gradient(120px 80px at 50% 60%, rgba(201,162,39,0.15), transparent 70%), linear-gradient(180deg, rgba(10,20,28,0.7), rgba(10,20,28,0.9))'
            }}>
              {/* Slots */}
              <div className='grid grid-cols-2 gap-2'>
                {Array.from({ length: 6 }).map((_, i) => {
                  const it = pot.items[i]
                  return (
                    <div
                      key={i}
                      className={`tile tile-rect px-2 py-2 ${focusArea==='pot' && focusIdx===i ? 'ring-2 ring-gold' : ''}`}
                      onDragOver={onDragOver}
                      onDrop={onDropIntoSlot}
                    >
                      <div className='corner tl'></div>
                      <div className='corner tr'></div>
                      <div className='corner bl'></div>
                      <div className='corner br'></div>
                      {it ? (
                        <button onClick={() => removeFromPot(i)} className='text-center w-full'>
                          <div className='text-xs opacity-70 truncate'>{it.type} • {it.revision}</div>
                          <div className='font-semibold text-sm leading-tight line-clamp-2 break-words px-1'>
                            {it.name}
                          </div>
                        </button>
                      ) : (
                        <div className='opacity-40 text-sm'>Empty</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Forge button and animation overlay */}
              <div className='mt-4 flex items-center gap-2'>
                <motion.button
                  whileHover={{ scale: canForge ? 1.03 : 1 }}
                  whileTap={{ scale: canForge ? 0.98 : 1 }}
                  onClick={startForge}
                  disabled={!canForge || pot.forging}
                  className={`card px-4 py-2 ${focusArea==='forge' ? 'ring-2 ring-gold' : ''} ${!canForge || pot.forging ? 'opacity-60' : ''}`}
                >
                  {pot.forging ? 'Forging…' : 'Start Forge'}
                </motion.button>
                <div className='text-sm opacity-70'>Add 2–6 items, then forge</div>
              </div>

              {/* Recipe hints */}
              <div className='mt-3 text-sm'>
                <div className='opacity-70 mb-1'>Recipe hints</div>
                {pot.items.length === 0 ? (
                  <div className='opacity-70'>Select a base item to see relevant recipes.</div>
                ) : recipeHints.length ? (
                  <ul className='grid sm:grid-cols-2 gap-2'>
                    {recipeHints.map(h => (
                      <li key={h.id} className={`card p-2 ${h.ready ? 'ring-2 ring-gold' : ''}`}>
                        <div className='font-semibold'>{h.name}</div>
                        {h.notes && <div className='opacity-80'>{h.notes}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='opacity-70'>No matching recipes yet — try different materials.</div>
                )}
              </div>

              <AnimatePresence>
                {pot.forging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='pointer-events-none absolute inset-0 flex items-end justify-center'
                  >
                    {/* bubbling orbs */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -120 - i * 6, opacity: [0, 1, 0] }}
                        transition={{ duration: 1.1 + i * 0.05, repeat: Infinity, delay: i * 0.06 }}
                        style={{
                          width: 10 + (i % 3) * 4,
                          height: 10 + (i % 3) * 4,
                          margin: '0 6px',
                          borderRadius: 9999,
                          background: i % 2 ? 'rgba(120,183,195,0.5)' : 'rgba(201,162,39,0.5)',
                          boxShadow: '0 0 12px rgba(201,162,39,0.6)'
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className='absolute left-1/2 -translate-x-1/2 top-3 card px-3 py-1 text-sm'
                  >
                    {toast}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Result preview */}
          <div className='mt-4 grid md:grid-cols-2 gap-4'>
            <div className='card p-3'>
              <h4 className='font-display'>Preview</h4>
              {resultPreview ? (
                <ul className='text-sm mt-2'>
                  <li><span className='opacity-70'>Name:</span> {resultPreview.name}</li>
                  <li><span className='opacity-70'>Revision:</span> {resultPreview.revision}</li>
                  <li><span className='opacity-70'>Cost:</span> {resultPreview.cost}</li>
                  <li><span className='opacity-70'>Health:</span> {resultPreview.health_pct}%</li>
                  <li className='opacity-80 line-clamp-2'>{resultPreview.description}</li>
                </ul>
              ) : (
                <div className='text-sm opacity-70 mt-2'>Add items to see a preview</div>
              )}
            </div>
            <div className='card p-3'>
              <h4 className='font-display'>Result</h4>
              {pot.result ? (
                <div className='mt-2'>
                  <div className='text-sm opacity-70'>{pot.result.type} • {pot.result.revision}</div>
                  <div className='font-semibold'>{pot.result.name}</div>
                  <div className='text-sm opacity-80'>{pot.result.description}</div>
                </div>
              ) : (
                <div className='text-sm opacity-70 mt-2'>Forge to create a variant</div>
              )}
            </div>
          </div>

          {/* Persisted Changes */}
          <div className='mt-4 card p-3'>
            <h4 className='font-display'>Changes</h4>
            {changes.length ? (
              <ul className='mt-2 text-sm space-y-1'>
                {changes.map(c => (
                  <li key={c.id} className='bg-white/60 text-temple rounded p-2'>
                    <span className='font-semibold'>{c.title}</span> → {c.to_rev}
                    <span className='opacity-70'> • Affected: {dataset.items.find(i=>i.id===c.affected_item)?.name || c.affected_item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='text-sm opacity-70 mt-2'>No local changes yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Recipe rules and persistence helpers
function matchKeywords(text: string, kws: string[]) {
  const t = text.toLowerCase()
  return kws.every(k => t.includes(k.toLowerCase()))
}

function persistChange(made: Item, baseId: string, existing: Change[], setChanges: (c: Change[]) => void, logs: LogEntry[], setLogs: (l: LogEntry[]) => void) {
  const id = `V${Date.now().toString().slice(-6)}`
  const change: Change = {
    id,
    type: 'Variant',
    title: made.name,
    description: made.description,
    affected_item: baseId,
    from_rev: '—',
    to_rev: made.revision,
    rationale: 'Forged in ritual',
    status: 'Completed'
  }
  const next = [change, ...existing]
  setChanges(next)
  try { localStorage.setItem('ff_changes', JSON.stringify(next)) } catch {}

  const lastYear = Math.max(0, ...dataset.adventure_log.map(e => e.year), ...logs.map(e => e.year))
  const log: LogEntry = { year: lastYear + 1, entry: `Forged ${made.name} → ${made.revision}.` }
  const logNext = [...logs, log]
  setLogs(logNext)
  try { localStorage.setItem('ff_log', JSON.stringify(logNext)) } catch {}
}
