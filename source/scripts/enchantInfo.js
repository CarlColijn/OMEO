/*
  Details on all possible enchants.

  prerequisites:
  - none

  Defined funtions:
  - GetRomanNumeralForLevel

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


// returns string
function GetRomanNumeralForLevel(level) {
  return ['-', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][level]
}


class EnchantInfo {
  // returns one of the static EnchantInfo globals
  static GetRehydrated(info) {
    return g_enchantInfosByID.get(info.id)
  }


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
  new EnchantInfo( 0, 4, 1, 1, 'Protection'),
  new EnchantInfo( 1, 4, 1, 2, 'Fire Protection'),
  new EnchantInfo( 2, 4, 1, 2, 'Feather Falling'),
  new EnchantInfo( 3, 4, 2, 4, 'Blast Protection'),
  new EnchantInfo( 4, 4, 1, 2, 'Projectile Protection'),
  new EnchantInfo( 5, 3, 4, 8, 'Thorns'),
  new EnchantInfo( 6, 3, 2, 4, 'Respiration'),
  new EnchantInfo( 7, 3, 2, 4, 'Depth Strider'),
  new EnchantInfo( 8, 1, 2, 4, 'Aqua Affinity'),
  new EnchantInfo( 9, 5, 1, 1, 'Sharpness'),
  new EnchantInfo(10, 5, 1, 2, 'Smite'),
  new EnchantInfo(11, 5, 1, 2, 'Bane of Arthropods'),
  new EnchantInfo(12, 2, 1, 2, 'Knockback'),
  new EnchantInfo(13, 2, 2, 4, 'Fire Aspect'),
  new EnchantInfo(14, 3, 2, 4, 'Looting'),
  new EnchantInfo(15, 5, 1, 1, 'Efficiency'),
  new EnchantInfo(16, 1, 4, 8, 'Silk Touch'),
  new EnchantInfo(17, 3, 1, 2, 'Unbreaking'),
  new EnchantInfo(18, 3, 2, 4, 'Fortune'),
  new EnchantInfo(19, 5, 1, 1, 'Power'),
  new EnchantInfo(20, 2, 2, 4, 'Punch'),
  new EnchantInfo(21, 1, 2, 4, 'Flame'),
  new EnchantInfo(22, 1, 4, 8, 'Infinity'),
  new EnchantInfo(23, 3, 2, 4, 'Luck of the Sea'),
  new EnchantInfo(24, 3, 2, 4, 'Lure'),
  new EnchantInfo(25, 2, 2, 4, 'Frost Walker'),
  new EnchantInfo(26, 1, 2, 4, 'Mending'),
  new EnchantInfo(27, 1, 4, 8, 'Curse of Binding'),
  new EnchantInfo(28, 1, 4, 8, 'Curse of Vanishing'),
  // Bedrock: multipliers are 1 & 2 instead of 2 & 4
  new EnchantInfo(29, 5, 2, 4, 'Impaling'),
  new EnchantInfo(30, 3, 2, 4, 'Riptide'),
  new EnchantInfo(31, 3, 1, 1, 'Loyalty'),
  new EnchantInfo(32, 1, 4, 8, 'Channeling'),
  new EnchantInfo(33, 1, 2, 4, 'Multishot'),
  new EnchantInfo(34, 4, 1, 1, 'Piercing'),
  new EnchantInfo(35, 3, 1, 2, 'Quick Charge'),
  new EnchantInfo(36, 3, 4, 8, 'Soul Speed'),
  new EnchantInfo(37, 3, 4, 8, 'Swift Sneak'),
  // Bedrock: Sweeping Edge doesn't exist
  new EnchantInfo(38, 3, 2, 4, 'Sweeping Edge'),
  new EnchantInfo(39, 4, 2, 4, 'Breach'),
  new EnchantInfo(40, 5, 1, 2, 'Density'),
  new EnchantInfo(41, 3, 2, 4, 'Wind Burst')
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numEnchantIDBits = g_numDifferentEnchants.toString(2).length
