'use client'
import { dataset } from '@/lib/data'; import { motion } from 'framer-motion'
export default function QuestBoard(){
  return (<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
    {dataset.requests.map(r => (
      <motion.div key={r.id} whileHover={{scale:1.02}} className='card p-4'>
        <h3 className='font-display text-xl'>{r.title}</h3>
        <p className='text-sm opacity-80 mt-1'>{r.description}</p>
        <div className='mt-2 text-xs'>Origin: {r.origin} • Priority: {r.priority}</div>
        <div className='mt-4 flex gap-2'>
          <button className='card px-3 py-1 text-sm'>Accept</button>
          <button className='card px-3 py-1 text-sm'>Route</button>
          <button className='card px-3 py-1 text-sm'>Convert → Change</button>
        </div>
      </motion.div>
    ))}
  </div>)
}
