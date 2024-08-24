/*
  Details on all possible item types.

  Prerequisites:
  - enchantInfo.js

  Defined classes:
  - ItemInfo
    - name: string
    - id: int
    - iconPosX: int
    - iconPosY: int
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


  constructor(id, name, iconXPos, iconYPos, enchantNames) {
    // ==== PUBLIC ====
    this.id = id
    this.iconXPos = iconXPos
    this.iconYPos = iconYPos
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
  new ItemInfo(0, 'Book', 4,0, []),
  new ItemInfo(1, 'Axe', 2,2, ['Bane of Arthropods'/*, 'Chopping'*/, 'Curse of Vanishing','Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk Touch', 'Smite', 'Unbreaking']),
  new ItemInfo(2, 'Shovel', 4,2, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(3, 'Pickaxe', 1,2, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(4, 'Hoe', 4,2, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(5, 'Fishing Rod', 5,2, ['Curse of Vanishing','Luck of the Sea','Lure','Mending','Unbreaking']),
  new ItemInfo(6, 'Flint & Steel', 6,2, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(7, 'Shears', 7,2, ['Curse of Vanishing','Efficiency','Mending','Unbreaking']),
  new ItemInfo(8, 'Elytra', 8,2, ['Curse of Binding','Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(9, 'Bow', 1,0, ['Curse of Vanishing','Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemInfo(10, 'Crossbow', 2,0, ['Curse of Vanishing','Mending','Multishot','Piercing','Quick Charge','Unbreaking']),
  new ItemInfo(11, 'Sword', 0,2, ['Bane of Arthropods','Curse of Vanishing','Fire Aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping Edge','Unbreaking']),
  new ItemInfo(12, 'Trident', 2,1, ['Channeling','Curse of Vanishing','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemInfo(13, 'Boots', 8,1, ['Blast Protection','Curse of Binding','Curse of Vanishing','Depth Strider','Feather Falling','Fire Protection','Frost Walker','Mending','Projectile Protection','Protection','Soul Speed','Thorns','Unbreaking']),
  new ItemInfo(14, 'Leggings', 7,1, ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Swift Sneak','Thorns','Unbreaking']),
  new ItemInfo(15, 'Chestplate', 6,1, ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(16, 'Helmet', 5,1, ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(17, 'Turtle Shell', 0,0, ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(18, 'Shield', 4,1, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(19, 'Carrot on a Stick', 0,1, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(20, 'Warped Fungus on a Stick', 1,1, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(21, 'Pumpkin', 5,0, ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(22, 'Head', 6,0, ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(23, 'Brush', 8,0, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(24, 'Mace', 3,1, ['Bane of Arthropods','Breach','Curse of Vanishing','Density','Fire Aspect','Mending','Smite','Unbreaking','Wind Burst'])
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numItemIDBits = g_numDifferentItems.toString(2).length
