/*
  Details on all possible item types.

  Prerequisites:
  - enchantDetails.js

  Defined classes:
  - ItemDetails
    - name: string
    - id: char
    - isBook: bool
    - enchantsAllowedByID: map(id -> bool)

  Defined globals:
  - g_itemDetailsByID: map(id -> ItemDetails)
  - g_numItems: int
  - g_numItemIDBits: int
*/
class ItemDetails {
  constructor(id, name, enchantNames) {
    // note the data
    this.id = id
    this.isBook = name == 'Book'
    this.name = name

    // denote which enchants we can have
    this.enchantsAllowedByID = {}
    if (this.isBook) {
      for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr)
        this.enchantsAllowedByID[g_enchantDetails[enchantNr].id] = true
    }
    else {
      for (let enchantNameNr = 0; enchantNameNr < enchantNames.length; ++enchantNameNr) {
        let enchantName = enchantNames[enchantNameNr]
        let enchantID = g_enchantIDsByName[enchantName]
        this.enchantsAllowedByID[enchantID] = true
      }
    }

    // and make us known
    g_itemDetailsByID[id] = this
    ++g_numItems
  }
}


// map id -> object
let g_itemDetailsByID = {}


// all known item details
let g_numItems = 0
let g_itemDetails = [
  new ItemDetails(0, 'Book', []),
  new ItemDetails(1, 'Axe', ['Bane of arthropods'/*, 'Chopping'*/, 'Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk touch', 'Smite', 'Unbreaking']),
  new ItemDetails(2, 'Shovel', ['Efficiency','Fortune','Mending','Silk touch','Unbreaking']),
  new ItemDetails(3, 'Pickaxe', ['Efficiency','Fortune','Mending','Silk touch','Unbreaking']),
  new ItemDetails(4, 'Hoe', ['Efficiency','Fortune','Mending','Silk touch','Unbreaking']),
  new ItemDetails(5, 'Fishing rod', ['Luck of the sea','Lure','Mending','Unbreaking']),
  new ItemDetails(6, 'Flint & steel', ['Mending','Unbreaking']),
  new ItemDetails(7, 'Shears', ['Efficiency','Mending','Unbreaking']),
  new ItemDetails(8, 'Elytra', ['Mending','Unbreaking']),
  new ItemDetails(9, 'Bow', ['Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemDetails(10, 'Crossbow', ['Mending','Multishot','Piercing','Quick charge','Unbreaking']),
  new ItemDetails(11, 'Sword', ['Bane of arthropods','Fire aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping edge','Unbreaking']),
  new ItemDetails(12, 'Trident', ['Channeling','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemDetails(13, 'Boots', ['Blast protection','Depth strider','Feather falling','Fire protection','Frost walker','Mending','Projectile protection','Protection','Soul speed','Thorns','Unbreaking']),
  new ItemDetails(14, 'Leggings', ['Blast protection','Fire protection','Mending','Projectile protection','Protection','Thorns','Unbreaking']),
  new ItemDetails(15, 'Chestplate', ['Blast protection','Fire protection','Mending','Projectile protection','Protection','Thorns','Unbreaking']),
  new ItemDetails(16, 'Helmet', ['Aqua affinity','Blast protection','Fire protection','Mending','Projectile protection','Protection','Respiration','Unbreaking']),
  new ItemDetails(17, 'Turtle shell', ['Aqua affinity','Blast protection','Fire protection','Mending','Projectile protection','Protection','Respiration','Unbreaking']),
  new ItemDetails(18, 'Shield', ['Mending','Unbreaking'])
]

// bit size of a single item ID
g_numItemIDBits = g_numItems.toString(2).length
