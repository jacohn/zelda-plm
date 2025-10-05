'use client'
import { useMemo, useState } from 'react'
import { dataset, type Request } from '@/lib/data'
import QuestMap from '@/components/QuestMap'
import { motion } from 'framer-motion'

export default function QuestScreen(){
  const quests = dataset.requests
  const [selectedId, setSelectedId] = useState<string>(quests[0]?.id || '')
  const selected = useMemo<Request|undefined>(() => quests.find(q=>q.id===selectedId), [quests, selectedId])

  return (
    <div className='relative'>
      {/* Big map background */}
      <div id='quest-map' className='map-bg rounded-2xl overflow-hidden min-h-[65vh] flex items-stretch'>
        <div className='relative w-full'>
          {selected && (
            <QuestMap quest={selected} />
          )}
        </div>
      </div>

      {/* Left selector panel */}
      <div className='glass p-3 rounded-2xl mt-4'>
        <h3 className='font-display text-2xl mb-2'>Select a Quest</h3>
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-2'>
          {quests.map(q => (
            <motion.button
              key={q.id}
              whileHover={{scale:1.02}}
              onClick={()=>setSelectedId(q.id)}
              className={`card text-left p-3 ${selectedId===q.id?'ring-2 ring-gold':''}`}
            >
              <div className='text-sm opacity-70'>Linked: {dataset.items.find(i=>i.id===q.linked_item)?.name || 'Unknown'} • {q.priority}</div>
              <div className='font-semibold'>{q.title}</div>
              <div className='text-sm opacity-80 line-clamp-2'>{q.description}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
