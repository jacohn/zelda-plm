"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const routes = [
    { href: '/', label: 'Home' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/quests', label: 'Quests' },
    { href: '/forge', label: 'Forge' },
    { href: '/log', label: 'Adventure Log' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className='fixed inset-0 bg-black/40 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className='fixed left-0 top-0 bottom-0 w-72 bg-temple/95 backdrop-blur border-r border-white/10 z-50'
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
          >
            <div className='px-4 py-3 flex items-center justify-between border-b border-white/10'>
              <div className='font-display text-xl'>Navigate</div>
              <button onClick={onClose} className='card px-2 py-1 text-sm'>Close</button>
            </div>
            <nav className='p-3 space-y-2'>
              {routes.map(r => {
                const active = pathname === r.href
                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={onClose}
                    className={`block card px-3 py-2 ${active ? 'ring-2 ring-gold' : ''}`}
                  >
                    {r.label}
                  </Link>
                )
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
