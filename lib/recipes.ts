export type RecipeRule = {
  id: string
  when: string[]
  name: string // use {base} to interpolate base item name
  healthAdd?: number
  costMul?: number
  notes?: string
}

export const recipeRules: RecipeRule[] = [
  { id: 'dragon-leather-shield', when: ['dragon','leather','shield'], name: 'Dragon-Leather {base}', healthAdd: 20, costMul: 1.25, notes: 'Thick dragon hide reinforcement' },
  { id: 'blessed-steel-sword', when: ['blessed','steel','sword'], name: 'Blessed {base}', healthAdd: 25, costMul: 1.20, notes: 'Sanctified alloy improves edge retention' },
  { id: 'sanctified-alloy-sword', when: ['sanctified','alloy','sword'], name: 'Sanctified {base}', healthAdd: 25, costMul: 1.20, notes: 'Consecrated alloy for keen edges' },
  { id: 'alloy-spring-hookshot', when: ['alloy','spring','hookshot'], name: 'Alloy-Spring {base}', healthAdd: 15, costMul: 1.10, notes: 'Upgraded recoil springs' },
  { id: 'swift-light-shield', when: ['swift','light','shield'], name: 'Swift {base}', healthAdd: 10, costMul: 1.05, notes: 'Lighter fittings for faster guard' },

  { id: 'flame-sword', when: ['fire','crystal','sword'], name: 'Flame-Touched {base}', healthAdd: 18, costMul: 1.2, notes: 'Fire crystal infusion' },
  { id: 'frost-shield', when: ['frost','crystal','shield'], name: 'Frostguard {base}', healthAdd: 16, costMul: 1.15, notes: 'Cold-hardened plating' },
  { id: 'shock-hook', when: ['thunder','core','hookshot'], name: 'Stormwire {base}', healthAdd: 14, costMul: 1.1, notes: 'Conductive core upgrade' },
  { id: 'sun-armor', when: ['sunshard','leather','armor'], name: 'Sunleather {base}', healthAdd: 22, costMul: 1.2, notes: 'Radiant tanning process' },
  { id: 'night-bow', when: ['nightshade','resin','bow'], name: 'Nightveil {base}', healthAdd: 12, costMul: 1.08, notes: 'Resin-damped limbs' },
  { id: 'wind-bow', when: ['wind','gem','bow'], name: 'Gale {base}', healthAdd: 15, costMul: 1.12, notes: 'Aerodynamic fletching kit' },
  { id: 'mithril-sword', when: ['mithril','ingot','sword'], name: 'Mithril {base}', healthAdd: 28, costMul: 1.3, notes: 'Light, resilient metal' },
  { id: 'obsidian-shield', when: ['obsidian','shield'], name: 'Obsidian-Plate {base}', healthAdd: 14, costMul: 1.1, notes: 'Vitrified deflection surface' },
  { id: 'phoenix-blade', when: ['phoenix','ash','sword'], name: 'Phoenix {base}', healthAdd: 24, costMul: 1.25, notes: 'Rebirth-tempered edge' },
  { id: 'water-hook', when: ['water','pearl','hookshot'], name: 'Hydraline {base}', healthAdd: 12, costMul: 1.08, notes: 'Corrosion-resistant line' },
  { id: 'rune-tool', when: ['rune','capacitor','tool'], name: 'Runic {base}', healthAdd: 10, costMul: 1.07, notes: 'Arcane assist' },

  // Additional variety for frequent bases
  { id: 'silk-bow', when: ['silk','string','bow'], name: 'Silkstring {base}', healthAdd: 10, costMul: 1.06, notes: 'Smooth draw and release' },
  { id: 'hardwood-bow', when: ['hardwood','grip','bow'], name: 'Hardgrip {base}', healthAdd: 8, costMul: 1.05, notes: 'Stable off-hand control' },
  { id: 'quenched-sword', when: ['quenching','oil','sword'], name: 'Quenched {base}', healthAdd: 14, costMul: 1.08, notes: 'Deep oil quench finish' },
  { id: 'tempered-shield', when: ['tempered','rivet','shield'], name: 'Tempered {base}', healthAdd: 12, costMul: 1.07, notes: 'Re-riveted bracework' },
  { id: 'mirror-shield', when: ['mirror','polish','shield'], name: 'Mirror-Polished {base}', healthAdd: 9, costMul: 1.05, notes: 'Specular parry surface' },
  { id: 'resonance-staff', when: ['resonance','crystal','staff'], name: 'Harmonic {base}', healthAdd: 16, costMul: 1.12, notes: 'Synchronised channeling focus' },
]

export function rulesMatchingText(text: string): RecipeRule[] {
  const t = text.toLowerCase()
  return recipeRules.filter(r => r.when.every(k => t.includes(k)))
}
