/*
  Details on all possible item types.

  Prerequisites:
  - enchantInfo.js
  - enchantConflicts.js

  Defined classes:
  - ItemInfo
    - name: string
    - id: int
    - iconIndexNormal: int
    - iconIndexEnchanted: int
    - isBook: bool
    - allowedEnchantIDs: Set(int)
    - conflictingEnchantIDSetsList: Array(Array(Set(int)))
    - nonConflictingEnchantIDs: Set(int)
    - CanHaveEnchant(enchantID: int) -> bool

  Defined globals:
  - g_itemInfosByID: Map(int -> ItemInfo)
  - g_bookID: int
  - g_numDifferentItems: int
  - g_numItemIDBits: int
*/


// ======== PUBLIC ========


class ItemInfo {
  // returns one of the static ItemInfo globals
  static GetRehydrated(info) {
    return g_itemInfosByID.get(info.id)
  }


  constructor(id, name, iconIndexNormal, iconIndexEnchanted, enchantNames) {
    // ==== PUBLIC ====
    this.id = id
    this.iconIndexNormal = iconIndexNormal
    this.iconIndexEnchanted = iconIndexEnchanted
    this.isBook = name == 'Book'
    this.name = name
    this.allowedEnchantIDs = this.GetAllowedEnchantIDs(enchantNames)
    this.conflictingEnchantIDSetsList = GetConflictingEnchantIDSetsListForIDs(this.allowedEnchantIDs)
    this.nonConflictingEnchantIDs = this.GetNonConflictingEnchantIDs(this.allowedEnchantIDs, this.conflictingEnchantIDSetsList)

    // ==== PRIVATE ====
    if (this.isBook)
      g_bookID = this.id
    g_itemInfosByID.set(id, this)
    ++g_numDifferentItems
  }


  // returns bool
  CanHaveEnchant(enchantID) {
    return this.allowedEnchantIDs.has(enchantID)
  }


  // ==== PRIVATE ====


  // returns Set(int)
  GetAllowedEnchantIDs(enchantNames) {
    return new Set(
      this.isBook ?
      g_enchantInfos.map((enchantInfo) => { return enchantInfo.id }) :
      enchantNames.map((enchantName) => { return g_enchantIDsByName.get(enchantName) })
    )
  }


  // returns Set(int)
  GetNonConflictingEnchantIDs(allowedEnchantIDs, conflictingEnchantIDSetsList) {
    return new Set([...allowedEnchantIDs].filter((id) => {
      return conflictingEnchantIDSetsList.every((idSets) => {
        return idSets.every((idSet) => {
          return !idSet.has(id)
        })
      })
    }))
  }
}


let g_itemInfosByID = new Map()


let g_numDifferentItems = 0
let g_bookID = -1
let g_itemInfos = [
  new ItemInfo(0, 'Book', 0,1, []),
  new ItemInfo(1, 'Axe', 2,2, ['Bane of Arthropods'/*, 'Chopping'*/, 'Curse of Vanishing','Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk Touch', 'Smite', 'Unbreaking']),
  new ItemInfo(2, 'Shovel', 3,3, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(3, 'Pickaxe', 4,4, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(4, 'Hoe', 5,5, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(5, 'Fishing Rod', 6,6, ['Curse of Vanishing','Luck of the Sea','Lure','Mending','Unbreaking']),
  new ItemInfo(6, 'Flint & Steel', 7,7, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(7, 'Shears', 8,8, ['Curse of Vanishing','Efficiency','Mending','Unbreaking']),
  new ItemInfo(8, 'Elytra', 9,9, ['Curse of Binding','Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(9, 'Bow', 10,10, ['Curse of Vanishing','Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemInfo(10, 'Crossbow', 11,11, ['Curse of Vanishing','Mending','Multishot','Piercing','Quick Charge','Unbreaking']),
  new ItemInfo(11, 'Sword', 12,12, ['Bane of Arthropods','Curse of Vanishing','Fire Aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping Edge','Unbreaking']),
  new ItemInfo(12, 'Trident', 13,13, ['Channeling','Curse of Vanishing','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemInfo(13, 'Boots', 14,14, ['Blast Protection','Curse of Binding','Curse of Vanishing','Depth Strider','Feather Falling','Fire Protection','Frost Walker','Mending','Projectile Protection','Protection','Soul Speed','Thorns','Unbreaking']),
  new ItemInfo(14, 'Leggings', 15,15, ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Swift Sneak','Thorns','Unbreaking']),
  new ItemInfo(15, 'Chestplate', 16,16, ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(16, 'Helmet', 17,17, ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(17, 'Turtle Shell', 18,18, ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(18, 'Shield', 19,19, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(19, 'Carrot on a Stick', 20,20, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(20, 'Warped Fungus on a Stick', 21,21, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(21, 'Pumpkin', 22,22, ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(22, 'Head', 23,23, ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(23, 'Brush', 24,24, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(24, 'Mace', 25,25, ['Bane of Arthropods','Breach','Curse of Vanishing','Density','Fire Aspect','Mending','Smite','Unbreaking','Wind Burst'])
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numItemIDBits = g_numDifferentItems.toString(2).length
