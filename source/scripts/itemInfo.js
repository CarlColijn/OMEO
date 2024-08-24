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
  // returns one of the static ItemInfo globals
  static GetRehydrated(info) {
    return g_itemInfosByID.get(info.id)
  }


  constructor(id, name, enchantNames) {
    // ==== PUBLIC ====
    this.id = id
    this.isBook = name == 'Book'
    this.name = name

    // ==== PRIVATE ====
    this.enchantsAllowedByID = new Set()

    if (this.isBook) {
      g_enchantInfos.forEach((enchantInfo) => {
        this.enchantsAllowedByID.add(enchantInfo.id)
      })
    }
    else {
      enchantNames.forEach((enchantName) => {
        let enchantID = g_enchantIDsByName.get(enchantName)
        this.enchantsAllowedByID.add(enchantID)
      })
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
  new ItemInfo(1, 'Axe', ['Bane of Arthropods'/*, 'Chopping'*/, 'Curse of Vanishing','Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk Touch', 'Smite', 'Unbreaking']),
  new ItemInfo(2, 'Shovel', ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(3, 'Pickaxe', ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(4, 'Hoe', ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(5, 'Fishing Rod', ['Curse of Vanishing','Luck of the Sea','Lure','Mending','Unbreaking']),
  new ItemInfo(6, 'Flint & Steel', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(7, 'Shears', ['Curse of Vanishing','Efficiency','Mending','Unbreaking']),
  new ItemInfo(8, 'Elytra', ['Curse of Binding','Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(9, 'Bow', ['Curse of Vanishing','Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemInfo(10, 'Crossbow', ['Curse of Vanishing','Mending','Multishot','Piercing','Quick Charge','Unbreaking']),
  new ItemInfo(11, 'Sword', ['Bane of Arthropods','Curse of Vanishing','Fire Aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping Edge','Unbreaking']),
  new ItemInfo(12, 'Trident', ['Channeling','Curse of Vanishing','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemInfo(13, 'Boots', ['Blast Protection','Curse of Binding','Curse of Vanishing','Depth Strider','Feather Falling','Fire Protection','Frost Walker','Mending','Projectile Protection','Protection','Soul Speed','Thorns','Unbreaking']),
  new ItemInfo(14, 'Leggings', ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Swift Sneak','Thorns','Unbreaking']),
  new ItemInfo(15, 'Chestplate', ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(16, 'Helmet', ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(17, 'Turtle Shell', ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(18, 'Shield', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(19, 'Carrot on a Stick', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(20, 'Warped Fungus on a Stick', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(21, 'Pumpkin', ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(22, 'Head', ['Curse of Binding','Curse of Vanishing'])
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numItemIDBits = g_numDifferentItems.toString(2).length
