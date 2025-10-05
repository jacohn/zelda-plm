'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useGamepad } from '@/hooks/useGamepad'

function isEditable(el: EventTarget | null) {
  const target = el as HTMLElement | null
  if (!target) return false
  const tag = target.tagName?.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    (target as any).isContentEditable === true
  )
}

export default function InputRouter(){
  const router = useRouter()
  const pathname = usePathname()

  const go = (path: string) => {
    if (pathname !== path) router.push(path)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return
      if (e.repeat) return

      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        go('/log')
        return
      }

      switch (e.key) {
        case 'Escape':
          go('/'); break
        case 'i': case 'I':
          go('/inventory'); break
        case 'q': case 'Q':
          go('/quests'); break
        case 'f': case 'F':
          go('/forge'); break
        case '-':
          go('/log'); break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pathname])

  // Gamepad actions → routes
  useGamepad((action) => {
    switch (action) {
      case 'system': go('/'); break
      case 'inventory': go('/inventory'); break
      case 'quests': go('/quests'); break
      case 'forge': go('/forge'); break
      case 'log': go('/log'); break
      // 'confirm' and 'back' are handled by UI components as needed
    }
  })

  return null
}
