'use client'
import { useEffect, useRef } from 'react'

export type Action=
  | 'system' | 'inventory' | 'quests' | 'forge' | 'log'
  | 'confirm' | 'back'
  | 'up' | 'down' | 'left' | 'right'

const buttonMap: Record<number, Action> = {
  // Menu shortcuts
  9: 'system', // Start
  4: 'inventory', // L
  5: 'quests', // R
  7: 'forge', // ZR
  0: 'confirm', // A
  1: 'back', // B
  // D-pad
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
}

export function useGamepad(onAction: (a: Action) => void) {
  const raf = useRef<number>()
  const pressed = useRef<Record<number, boolean>>({})

  useEffect(() => {
    const loop = () => {
      const pads = navigator.getGamepads?.() || []
      const gp = pads[0]
      if (gp) {
        gp.buttons.forEach((b, idx) => {
          const was = pressed.current[idx] === true
          if (b.pressed && !was) {
            const a = buttonMap[idx]
            if (a) onAction(a)
          }
          pressed.current[idx] = b.pressed
        })
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current || 0)
  }, [onAction])
}
