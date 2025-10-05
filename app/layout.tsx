import './globals.css'
import InputRouter from '@/components/InputRouter'
import Shell from '@/components/Shell'
export const metadata = { title: 'Forge & Field', description: 'Zelda-inspired PLM demo' }
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang='en'>
      <body style={{ ['--map-images' as any]: `url(${BASE}/images/quest-map.jpg) center/cover no-repeat, url(${BASE}/images/quest-map.svg) center/cover no-repeat` }}>
        <InputRouter/>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}
