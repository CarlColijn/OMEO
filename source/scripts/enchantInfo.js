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
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][level - 1]
}


// returns string[]
function GetRomanNumeralsUpToLevel(level) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].slice(0, level)
}


class EnchantInfo {
  // returns one of the static EnchantInfo globals
  static GetRehydrated(info) {
    return g_enchantInfosByID.get(info.id)
  }


  constructor(id, maxLevel, bookMultiplier, toolMultiplier, isCurse, name) {
    // ==== PUBLIC ====
    this.id = id
    this.maxLevel = maxLevel
    this.bookMultiplier = bookMultiplier
    this.toolMultiplier = toolMultiplier
    this.isCurse = isCurse
    this.name = name

    // ==== PRIVATE ====
    g_enchantIDsByName.set(name, id)
    g_enchantInfosByID.set(id, this)
    ++g_numDifferentEnchants
  }
}


let g_enchantInfos = [
  new EnchantInfo( 0, 4, 1, 1, false, 'Protection'),
  new EnchantInfo( 1, 4, 1, 2, false, 'Fire Protection'),
  new EnchantInfo( 2, 4, 1, 2, false, 'Feather Falling'),
  new EnchantInfo( 3, 4, 2, 4, false, 'Blast Protection'),
  new EnchantInfo( 4, 4, 1, 2, false, 'Projectile Protection'),
  new EnchantInfo( 5, 3, 4, 8, false, 'Thorns'),
  new EnchantInfo( 6, 3, 2, 4, false, 'Respiration'),
  new EnchantInfo( 7, 3, 2, 4, false, 'Depth Strider'),
  new EnchantInfo( 8, 1, 2, 4, false, 'Aqua Affinity'),
  new EnchantInfo( 9, 5, 1, 1, false, 'Sharpness'),
  new EnchantInfo(10, 5, 1, 2, false, 'Smite'),
  new EnchantInfo(11, 5, 1, 2, false, 'Bane of Arthropods'),
  new EnchantInfo(12, 2, 1, 2, false, 'Knockback'),
  new EnchantInfo(13, 2, 2, 4, false, 'Fire Aspect'),
  new EnchantInfo(14, 3, 2, 4, false, 'Looting'),
  new EnchantInfo(15, 5, 1, 1, false, 'Efficiency'),
  new EnchantInfo(16, 1, 4, 8, false, 'Silk Touch'),
  new EnchantInfo(17, 3, 1, 2, false, 'Unbreaking'),
  new EnchantInfo(18, 3, 2, 4, false, 'Fortune'),
  new EnchantInfo(19, 5, 1, 1, false, 'Power'),
  new EnchantInfo(20, 2, 2, 4, false, 'Punch'),
  new EnchantInfo(21, 1, 2, 4, false, 'Flame'),
  new EnchantInfo(22, 1, 4, 8, false, 'Infinity'),
  new EnchantInfo(23, 3, 2, 4, false, 'Luck of the Sea'),
  new EnchantInfo(24, 3, 2, 4, false, 'Lure'),
  new EnchantInfo(25, 2, 2, 4, false, 'Frost Walker'),
  new EnchantInfo(26, 1, 2, 4, false, 'Mending'),
  new EnchantInfo(27, 1, 4, 8, true,  'Curse of Binding'),
  new EnchantInfo(28, 1, 4, 8, true,  'Curse of Vanishing'),
  // Bedrock: multipliers are 1 & 2 instead of 2 & 4
  new EnchantInfo(29, 5, 2, 4, false, 'Impaling'),
  new EnchantInfo(30, 3, 2, 4, false, 'Riptide'),
  new EnchantInfo(31, 3, 1, 1, false, 'Loyalty'),
  new EnchantInfo(32, 1, 4, 8, false, 'Channeling'),
  new EnchantInfo(33, 1, 2, 4, false, 'Multishot'),
  new EnchantInfo(34, 4, 1, 1, false, 'Piercing'),
  new EnchantInfo(35, 3, 1, 2, false, 'Quick Charge'),
  new EnchantInfo(36, 3, 4, 8, false, 'Soul Speed'),
  new EnchantInfo(37, 3, 4, 8, false, 'Swift Sneak'),
  // Bedrock: Sweeping Edge doesn't exist
  new EnchantInfo(38, 3, 2, 4, false, 'Sweeping Edge'),
  new EnchantInfo(39, 4, 2, 4, false, 'Breach'),
  new EnchantInfo(40, 5, 1, 2, false, 'Density'),
  new EnchantInfo(41, 3, 2, 4, false, 'Wind Burst'),
  new EnchantInfo(42, 3, 1, 2, false, 'Lunge')
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numEnchantIDBits = g_numDifferentEnchants.toString(2).length
