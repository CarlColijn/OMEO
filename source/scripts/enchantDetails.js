/*
  Details on all possible enchants.

  Prerequisites:
  - none

  Defined classes:
  - EnchantDetails
    - id: char
    - maxLevel: int
    - rarity: int
    - bookMultiplier: int
    - toolMultiplier: int
    - name: string

  Defined globals:
  - g_enchantDetails: array(enchantDetail)
  - g_numEnchants: int
  - g_numEnchantIDBits: int
  - g_enchantIDsByName: map[string -> char]
  - g_enchantDetailsByID: map[char -> EnchantDetails]
*/
class EnchantDetails {
  constructor(id, maxLevel, rarity, bookMultiplier, toolMultiplier, name) {
    // set our data
    this.id = id
    this.maxLevel = maxLevel
    this.rarity = rarity
    this.bookMultiplier = bookMultiplier
    this.toolMultiplier = toolMultiplier
    this.name = name

    // and make us known
    g_enchantIDsByName[name] = id
    g_enchantDetailsByID[id] = this
    ++g_numEnchants
  }
}


// map name -> id
let g_enchantIDsByName = {}

// map id -> object
let g_enchantDetailsByID = {}


// all known enchant details
let g_numEnchants = 0
let g_enchantDetails = [
  new EnchantDetails(0, 1,  2, 2, 4, 'Aqua affinity'),
  new EnchantDetails(1, 5,  5, 1, 2, 'Bane of arthropods'),
  new EnchantDetails(2, 4,  2, 2, 4, 'Blast protection'),
  new EnchantDetails(3, 1,  1, 4, 8, 'Channeling'),
  // Chopping: rarity & both multipliers unknown
//new EnchantDetails(4, 3, -1, -1, -1, 'Chopping'),
  new EnchantDetails(5, 3,  2, 2, 4, 'Depth strider'),
  new EnchantDetails(6, 5, 10, 1, 1, 'Efficiency'),
  new EnchantDetails(7, 4,  5, 1, 2, 'Feather falling'),
  new EnchantDetails(8, 2,  2, 2, 4, 'Fire aspect'),
  new EnchantDetails(9, 4,  5, 1, 2, 'Fire protection'),
  new EnchantDetails(10, 1,  2, 2, 4, 'Flame'),
  new EnchantDetails(11, 3,  2, 2, 4, 'Fortune'),
  new EnchantDetails(12, 2,  2, 2, 4, 'Frost walker'),
  new EnchantDetails(13, 5,  2, 2, 4, 'Impaling'),
  new EnchantDetails(14, 1,  1, 4, 8, 'Infinity'),
  new EnchantDetails(15, 2,  5, 1, 2, 'Knockback'),
  new EnchantDetails(16, 3,  2, 2, 4, 'Looting'),
  new EnchantDetails(17, 3,  5, 1, 1, 'Loyalty'),
  new EnchantDetails(18, 3,  2, 2, 4, 'Luck of the sea'),
  new EnchantDetails(19, 3,  2, 2, 4, 'Lure'),
  new EnchantDetails(20, 1,  2, 2, 4, 'Mending'),
  new EnchantDetails(21, 1,  2, 2, 4, 'Multishot'),
  new EnchantDetails(22, 4, 10, 1, 1, 'Piercing'),
  new EnchantDetails(23, 5, 10, 1, 1, 'Power'),
  new EnchantDetails(24, 4,  5, 1, 2, 'Projectile protection'),
  new EnchantDetails(25, 4, 10, 1, 1, 'Protection'),
  new EnchantDetails(26, 2,  2, 2, 4, 'Punch'),
  new EnchantDetails(27, 3,  5, 1, 2, 'Quick charge'),
  new EnchantDetails(28, 3,  2, 2, 4, 'Respiration'),
  new EnchantDetails(29, 3,  2, 2, 4, 'Riptide'),
  new EnchantDetails(30, 5, 10, 1, 1, 'Sharpness'),
  new EnchantDetails(31, 1,  1, 4, 8, 'Silk touch'),
  new EnchantDetails(32, 5,  5, 1, 2, 'Smite'),
  new EnchantDetails(33, 3,  1, 4, 8, 'Soul speed'),
  // Bedrock: Sweeping edge doesn't exist
  new EnchantDetails(34, 3,  2, 2, 4, 'Sweeping edge'),
  new EnchantDetails(35, 3,  1, 4, 8, 'Thorns'),
  new EnchantDetails(36, 3,  5, 1, 2, 'Unbreaking')
]

// bit size of a single enchant ID
let g_numEnchantIDBits = g_numEnchants.toString(2).length
