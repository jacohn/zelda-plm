"use client"
import Link from 'next/link'

export default function HeaderBar({ onMenuClick }: { onMenuClick?: () => void }){
  return (
    <header className='sticky top-0 z-40 bg-temple/70 backdrop-blur border-b border-white/10'>
      <div className='max-w-6xl mx-auto px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button id='nav-menu-button' aria-label='Open navigation' onClick={onMenuClick} className='card px-2 py-1'>
            ☰
          </button>
          <Link href='/' className='font-display text-xl title-shadow hover:opacity-90'>
            Forge & Field
          </Link>
        </div>
        {/* Right side intentionally empty; title already links Home */}
      </div>
    </header>
  )
}
