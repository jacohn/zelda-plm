import Link from 'next/link'
import { Swords } from 'lucide-react'
export default function Home(){
  return (
    <section className='mt-8'>
      <div className='text-center'>
        <Swords className='mx-auto mb-6' size={64}/>
        <h1 className='font-display text-5xl title-shadow'>Forge & Field</h1>
        <p className='mt-3 opacity-90'>A controller-first, Zelda-inspired PLM workspace</p>
      </div>

      <div className='mt-8 grid md:grid-cols-2 gap-6'>
        <div id='explore-card' className='card p-4'>
          <h2 className='font-display text-2xl mb-3'>Explore</h2>
          <ul className='space-y-2'>
            <li><Link className='card block px-4 py-2' href='/inventory'>Inventory (Items)</Link></li>
            <li><Link className='card block px-4 py-2' href='/quests'>Quest Board (Requests)</Link></li>
            <li><Link className='card block px-4 py-2' href='/forge'>Forge (Changes)</Link></li>
            <li><Link className='card block px-4 py-2' href='/log'>Adventure Log (Audit)</Link></li>
          </ul>
          <div className='mt-4'>
            <Link id='plm-tutorial-button' className='card inline-block px-4 py-2' href='/?tour=plm&step=1'>PLM Tutorial</Link>
          </div>
        </div>

        <div className='card p-4'>
          <h2 className='font-display text-2xl mb-3'>Basic Controls</h2>
          <p className='opacity-80'>Controller-first navigation supported. Press Home/Start or Esc to return here. WASD / D‑Pad to move; Enter/A to select, Backspace/B to go back.</p>
          <ul className='mt-4 grid grid-cols-2 gap-2 text-sm'>
            <li className='card p-2'>Inventory — L / I</li><li className='card p-2'>Quest Board — R / Q</li>
            <li className='card p-2'>Forge — ZR / F</li><li className='card p-2'>Log — - / Ctrl+S</li>
          </ul>
          <div className='mt-4'>
            <Link className='card inline-block px-4 py-2' href='/controls'>View Controller Diagram</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
