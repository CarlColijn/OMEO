/*
  Details on all possible enchants.

  prerequisites:
  - none

  Defined classes:
  - EnchantInfo
    - id: char
    - maxLevel: int
    - bookMultiplier: int
    - toolMultiplier: int
    - name: string

  Defined globals:
  - g_enchantInfos: array(EnchantInfo)
  - g_numDifferentEnchants: int
  - g_enchantIDsByName: Map(string -> int)
  - g_enchantInfosByID: Map(int -> EnchantInfo)
  - g_numEnchantIDBits: int
*/


// ======== PUBLIC ========

let g_enchantIDsByName = new Map()
let g_enchantInfosByID = new Map()
let g_numDifferentEnchants = 0


class EnchantInfo {
  constructor(id, maxLevel, bookMultiplier, toolMultiplier, name) {
    // ==== PUBLIC ====
    this.id = id
    this.maxLevel = maxLevel
    this.bookMultiplier = bookMultiplier
    this.toolMultiplier = toolMultiplier
    this.name = name

    // ==== PRIVATE ====
    g_enchantIDsByName.set(name, id)
    g_enchantInfosByID.set(id, this)
    ++g_numDifferentEnchants
  }
}


let g_enchantInfos = [
  new EnchantInfo( 0, 1, 2, 4, 'Aqua Affinity'),
  new EnchantInfo( 1, 5, 1, 2, 'Bane of Arthropods'),
  new EnchantInfo( 2, 4, 2, 4, 'Blast Protection'),
  new EnchantInfo( 3, 1, 4, 8, 'Channeling'),
  // Chopping: both multipliers unknown
//new EnchantInfo( 4, 3, ?, ?, 'Chopping'),
  new EnchantInfo( 5, 3, 2, 4, 'Depth Strider'),
  new EnchantInfo( 6, 5, 1, 1, 'Efficiency'),
  new EnchantInfo( 7, 4, 1, 2, 'Feather Falling'),
  new EnchantInfo( 8, 2, 2, 4, 'Fire Aspect'),
  new EnchantInfo( 9, 4, 1, 2, 'Fire Protection'),
  new EnchantInfo(10, 1, 2, 4, 'Flame'),
  new EnchantInfo(11, 3, 2, 4, 'Fortune'),
  new EnchantInfo(12, 2, 2, 4, 'Frost Walker'),
  new EnchantInfo(13, 5, 2, 4, 'Impaling'),
  new EnchantInfo(14, 1, 4, 8, 'Infinity'),
  new EnchantInfo(15, 2, 1, 2, 'Knockback'),
  new EnchantInfo(16, 3, 2, 4, 'Looting'),
  new EnchantInfo(17, 3, 1, 1, 'Loyalty'),
  new EnchantInfo(18, 3, 2, 4, 'Luck of the Sea'),
  new EnchantInfo(19, 3, 2, 4, 'Lure'),
  new EnchantInfo(20, 1, 2, 4, 'Mending'),
  new EnchantInfo(21, 1, 2, 4, 'Multishot'),
  new EnchantInfo(22, 4, 1, 1, 'Piercing'),
  new EnchantInfo(23, 5, 1, 1, 'Power'),
  new EnchantInfo(24, 4, 1, 2, 'Projectile Protection'),
  new EnchantInfo(25, 4, 1, 1, 'Protection'),
  new EnchantInfo(26, 2, 2, 4, 'Punch'),
  new EnchantInfo(27, 3, 1, 2, 'Quick Charge'),
  new EnchantInfo(28, 3, 2, 4, 'Respiration'),
  new EnchantInfo(29, 3, 2, 4, 'Riptide'),
  new EnchantInfo(30, 5, 1, 1, 'Sharpness'),
  new EnchantInfo(31, 1, 4, 8, 'Silk Touch'),
  new EnchantInfo(32, 5, 1, 2, 'Smite'),
  new EnchantInfo(33, 3, 4, 8, 'Soul Speed'),
  // Bedrock: Sweeping Edge doesn't exist
  new EnchantInfo(34, 3, 2, 4, 'Sweeping Edge'),
  new EnchantInfo(35, 3, 4, 8, 'Thorns'),
  new EnchantInfo(36, 3, 1, 2, 'Unbreaking')
]


let g_numEnchantIDBits = g_numDifferentEnchants.toString(2).length
