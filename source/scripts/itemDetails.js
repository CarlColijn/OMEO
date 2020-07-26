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
*/
function ItemDetails(id, name, enchantNames) {
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


// map id -> object
let g_itemDetailsByID = {}


// all known item details
let g_numItems = 0
let g_itemDetails = [
  new ItemDetails('a', 'Book', []),
  new ItemDetails('b', 'Axe', ['Bane of arthropods'/*, 'Chopping'*/, 'Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk touch', 'Smite', 'Unbreaking']),
  new ItemDetails('c', 'Shovel', ['Efficiency','Fortune','Mending','Silk touch','Unbreaking']),
  new ItemDetails('d', 'Pickaxe', ['Efficiency','Fortune','Mending','Silk touch','Unbreaking']),
  new ItemDetails('e', 'Hoe', ['Efficiency','Fortune','Mending','Silk touch','Unbreaking']),
  new ItemDetails('f', 'Fishing rod', ['Luck of the sea','Lure','Mending','Unbreaking']),
  new ItemDetails('g', 'Flint & steel', ['Mending','Unbreaking']),
  new ItemDetails('h', 'Shears', ['Efficiency','Mending','Unbreaking']),
  new ItemDetails('i', 'Elytra', ['Mending','Unbreaking']),
  new ItemDetails('j', 'Bow', ['Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemDetails('k', 'Crossbow', ['Mending','Multishot','Piercing','Quick charge','Unbreaking']),
  new ItemDetails('l', 'Sword', ['Bane of arthropods','Fire aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping edge','Unbreaking']),
  new ItemDetails('m', 'Trident', ['Channeling','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemDetails('n', 'Boots', ['Blast protection','Depth strider','Feather falling','Fire protection','Frost walker','Mending','Projectile protection','Protection','Soul speed','Thorns','Unbreaking']),
  new ItemDetails('o', 'Leggings', ['Blast protection','Fire protection','Mending','Projectile protection','Protection','Thorns','Unbreaking']),
  new ItemDetails('p', 'Chestplate', ['Blast protection','Fire protection','Mending','Projectile protection','Protection','Thorns','Unbreaking']),
  new ItemDetails('q', 'Helmet', ['Aqua affinity','Blast protection','Fire protection','Mending','Projectile protection','Protection','Respiration','Unbreaking']),
  new ItemDetails('r', 'Turtle shell', ['Aqua affinity','Blast protection','Fire protection','Mending','Projectile protection','Protection','Respiration','Unbreaking']),
  new ItemDetails('s', 'Shield', ['Mending','Unbreaking'])
]
