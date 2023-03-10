/*
  Details on all possible item types.

  Prerequisites:
  - enchantInfo.js

  Defined classes:
  - ItemInfo
    - name: string
    - id: int
    - isBook: bool
    - CanHaveEnchant(enchantID: int) -> bool

  Defined globals:
  - g_itemInfosByID: Map(int -> ItemInfo)
  - g_numDifferentItems: int
  - g_numItemIDBits: int
*/


// ======== PUBLIC ========


class ItemInfo {
  constructor(id, name, enchantNames) {
    // ==== PUBLIC ====
    this.id = id
    this.isBook = name == 'Book'
    this.name = name

    // ==== PRIVATE ====
    this.enchantsAllowedByID = new Set()

    if (this.isBook) {
      for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr)
        this.enchantsAllowedByID.add(g_enchantInfos[enchantNr].id)
    }
    else {
      for (let enchantNameNr = 0; enchantNameNr < enchantNames.length; ++enchantNameNr) {
        let enchantName = enchantNames[enchantNameNr]
        let enchantID = g_enchantIDsByName.get(enchantName)
        this.enchantsAllowedByID.add(enchantID)
      }
    }

    g_itemInfosByID.set(id, this)
    ++g_numDifferentItems
  }


  // returns bool
  CanHaveEnchant(enchantID) {
    return this.enchantsAllowedByID.has(enchantID)
  }
}


let g_itemInfosByID = new Map()


let g_numDifferentItems = 0
let g_itemInfos = [
  new ItemInfo(0, 'Book', []),
  new ItemInfo(1, 'Axe', ['Bane of Arthropods'/*, 'Chopping'*/, 'Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk Touch', 'Smite', 'Unbreaking']),
  new ItemInfo(2, 'Shovel', ['Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(3, 'Pickaxe', ['Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(4, 'Hoe', ['Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(5, 'Fishing Rod', ['Luck of the Sea','Lure','Mending','Unbreaking']),
  new ItemInfo(6, 'Flint & Steel', ['Mending','Unbreaking']),
  new ItemInfo(7, 'Shears', ['Efficiency','Mending','Unbreaking']),
  new ItemInfo(8, 'Elytra', ['Mending','Unbreaking']),
  new ItemInfo(9, 'Bow', ['Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemInfo(10, 'Crossbow', ['Mending','Multishot','Piercing','Quick Charge','Unbreaking']),
  new ItemInfo(11, 'Sword', ['Bane of Arthropods','Fire Aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping Edge','Unbreaking']),
  new ItemInfo(12, 'Trident', ['Channeling','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemInfo(13, 'Boots', ['Blast Protection','Depth Strider','Feather Falling','Fire Protection','Frost Walker','Mending','Projectile Protection','Protection','Soul Speed','Thorns','Unbreaking']),
  new ItemInfo(14, 'Leggings', ['Blast Protection','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(15, 'Chestplate', ['Blast Protection','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(16, 'Helmet', ['Aqua Affinity','Blast Protection','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Unbreaking']),
  new ItemInfo(17, 'Turtle Shell', ['Aqua Affinity','Blast Protection','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Unbreaking']),
  new ItemInfo(18, 'Shield', ['Mending','Unbreaking'])
]


let g_numItemIDBits = g_numDifferentItems.toString(2).length
