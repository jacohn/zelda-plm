"use client"
import { dataset, type LogEntry } from '@/lib/data'
import { useEffect, useState } from 'react'

export default function AdventureLog(){
  const [extra, setExtra] = useState<LogEntry[]>([])
  useEffect(() => {
    try { setExtra(JSON.parse(localStorage.getItem('ff_log')||'[]')) } catch {}
  }, [])
  const ordered = [...dataset.adventure_log, ...extra].sort((a,b)=>a.year-b.year)
  return (
    <div id='adventure-log' className='card p-4'>
      <h3 className='font-display text-2xl'>Adventure Log</h3>
      <ol className='mt-4 space-y-2 list-decimal ml-5'>
        {ordered.map(e=>(<li key={`${e.year}-${e.entry.slice(0,12)}`} className='bg-white/60 text-temple rounded p-2'>Y{e.year}: {e.entry}</li>))}
      </ol>
    </div>
  )
}
