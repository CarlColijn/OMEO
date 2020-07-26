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
  - g_enchantIDsByName: map[string -> char]
  - g_enchantDetailsByID: map[char -> EnchantDetails]
*/
function EnchantDetails(id, maxLevel, rarity, bookMultiplier, toolMultiplier, name) {
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


// map name -> id
let g_enchantIDsByName = {}

// map id -> object
let g_enchantDetailsByID = {}


// all known enchant details
let g_numEnchants = 0
let g_enchantDetails = [
  new EnchantDetails('a', 1,  2, 2, 4, 'Aqua affinity'),
  new EnchantDetails('b', 5,  5, 1, 2, 'Bane of arthropods'),
  new EnchantDetails('c', 4,  2, 2, 4, 'Blast protection'),
  new EnchantDetails('d', 1,  1, 4, 8, 'Channeling'),
  // Chopping: rarity & both multipliers unknown
//new EnchantDetails('e', 3, -1, -1, -1, 'Chopping'),
  new EnchantDetails('f', 3,  2, 2, 4, 'Depth strider'),
  new EnchantDetails('g', 5, 10, 1, 1, 'Efficiency'),
  new EnchantDetails('h', 4,  5, 1, 2, 'Feather falling'),
  new EnchantDetails('i', 2,  2, 2, 4, 'Fire aspect'),
  new EnchantDetails('j', 4,  5, 1, 2, 'Fire protection'),
  new EnchantDetails('k', 1,  2, 2, 4, 'Flame'),
  new EnchantDetails('l', 3,  2, 2, 4, 'Fortune'),
  new EnchantDetails('m', 2,  2, 2, 4, 'Frost walker'),
  new EnchantDetails('n', 5,  2, 2, 4, 'Impaling'),
  new EnchantDetails('o', 1,  1, 4, 8, 'Infinity'),
  new EnchantDetails('p', 2,  5, 1, 2, 'Knockback'),
  new EnchantDetails('q', 3,  2, 2, 4, 'Looting'),
  new EnchantDetails('r', 3,  5, 1, 1, 'Loyalty'),
  new EnchantDetails('s', 3,  2, 2, 4, 'Luck of the sea'),
  new EnchantDetails('t', 3,  2, 2, 4, 'Lure'),
  new EnchantDetails('u', 1,  2, 2, 4, 'Mending'),
  new EnchantDetails('v', 1,  2, 2, 4, 'Multishot'),
  new EnchantDetails('w', 4, 10, 1, 1, 'Piercing'),
  new EnchantDetails('x', 5, 10, 1, 1, 'Power'),
  new EnchantDetails('y', 4,  5, 1, 2, 'Projectile protection'),
  new EnchantDetails('z', 4, 10, 1, 1, 'Protection'),
  new EnchantDetails('A', 2,  2, 2, 4, 'Punch'),
  new EnchantDetails('B', 3,  5, 1, 2, 'Quick charge'),
  new EnchantDetails('C', 3,  2, 2, 4, 'Respiration'),
  new EnchantDetails('D', 3,  2, 2, 4, 'Riptide'),
  new EnchantDetails('E', 5, 10, 1, 1, 'Sharpness'),
  new EnchantDetails('F', 1,  1, 4, 8, 'Silk touch'),
  new EnchantDetails('G', 5,  5, 1, 2, 'Smite'),
  new EnchantDetails('H', 3,  1, 4, 8, 'Soul speed'),
  // Bedrock: Sweeping edge doesn't exist
  new EnchantDetails('I', 3,  2, 2, 4, 'Sweeping edge'),
  new EnchantDetails('J', 3,  1, 4, 8, 'Thorns'),
  new EnchantDetails('K', 3,  5, 1, 2, 'Unbreaking')
]
