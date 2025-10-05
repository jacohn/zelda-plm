"use client"
export default function ControlsDiagram(){
  return (
    <div className='card p-4 text-sm'>
      <p>Primary controls mirror a modern gamepad:</p>
      <ul className='list-disc ml-6 mt-2'>
        <li>Home: + / Esc</li>
        <li>Inventory: L / I</li>
        <li>Quest Board: R / Q</li>
        <li>Forge: ZR / F</li>
        <li>Confirm: A / Enter • Back: B / Backspace</li>
      </ul>
    </div>
  )
}
