"use client"
import { useState } from 'react'
import HeaderBar from '@/components/HeaderBar'
import SideNav from '@/components/SideNav'
import Tour from '@/components/Tour'

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <HeaderBar onMenuClick={() => setOpen(true)} />
      <SideNav open={open} onClose={() => setOpen(false)} />
      <Tour/>
      <main className='max-w-6xl mx-auto p-6'>{children}</main>
    </>
  )
}
