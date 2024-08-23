/*
  Single item (source, desired, combined or extra).

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - itemInfo.js

  Defined classes:
  - Item
    all items:
    - count: int
    - set: DataSet
    - id: int
    - info: ItemInfo
    - enchantsByID: Map(int -> Enchant)
    - priorWork: int
    - cost: int
    - totalCost: int
    source and desired items only:
    - nr: int
    combined items only:
    - targetItem: Item
    - sacrificeItem: Item
    all items except desired items:
    - origin: effectively an array(bool)
*/


// ======== PUBLIC ========


function RehydrateItems(items) {
  items.forEach((item) => {
    Item.Rehydrate(item)
  })
}


class Item {
  static Rehydrate(item) {
    Object.setPrototypeOf(item, Item.prototype);
    item.set = DataSet.GetRehydrated(item.set)
    item.info = ItemInfo.GetRehydrated(item.info)
    item.enchantsByID.forEach((enchant) => {
      Enchant.Rehydrate(enchant)
    })
    if (item.origin !== undefined)
      ItemOrigin.Rehydrate(item.origin)
    if (item.targetItem !== undefined)
      Item.Rehydrate(item.targetItem)
    if (item.sacrificeItem !== undefined)
      Item.Rehydrate(item.sacrificeItem)
  }


  constructor(count, set, id, priorWork, cost=0, totalCost=0) {
    // ==== PUBLIC ====
    this.count = count
    this.set = set
    this.id = id
    this.info = g_itemInfosByID.get(id)
    this.enchantsByID = new Map()
    this.priorWork = priorWork
    this.cost = cost
    this.totalCost = totalCost
  }


  // returns Item
  // Only clones the items themselves (item + target/sacrifice);
  // all other properties are shalow copies.
  Clone() {
    let clone = new Item(
      this.count,
      this.set,
      this.id,
      this.priorWork,
      this.cost,
      this.totalCost
    )
    clone.enchantsByID = this.enchantsByID

    if (this.set === g_source || this.set === g_desired) {
      clone.nr = this.nr
    }
    else if (this.set === g_combined) {
      clone.renamePoint = this.renamePoint

      if (this.targetItem === undefined) {
        clone.targetItem = undefined
        clone.sacrificeItem = undefined
      }
      else {
        clone.targetItem = this.targetItem.Clone()
        clone.sacrificeItem = this.sacrificeItem.Clone()
      }
    }

    return clone
  }


  // returns Item[]
  CollapseTree() {
    let targetItems =
      this.targetItem === undefined ?
      [] :
      this.targetItem.CollapseTree()

    let sacrificeItems =
      this.sacrificeItem === undefined ?
      [] :
      this.sacrificeItem.CollapseTree()

    return [this, ...targetItems, ...sacrificeItems]
  }


  SetEnchant(enchant) {
    this.enchantsByID.set(enchant.info.id, enchant)
  }


  // returns string
  HashType() {
    return this.Hash(false, false, false)
  }


  // returns string
  HashTypeAndPriorWork() {
    return this.Hash(true, false, false)
  }


  // returns string
  HashTypeAndPriorWorkAndCost() {
    return this.Hash(true, true, false)
  }


  // returns string
  HashAll() {
    return this.Hash(true, true, true)
  }


  // returns string
  Hash(withPriorWork, withCost, withCount) {
    // note: no fancy stuff for now with bit fiddling, just a big 'ol string concat

    let allData = this.id

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = this.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        allData += `|${enchant.id}|${enchant.level}`
    }

    if (withPriorWork)
      allData += `|${this.priorWork}`

    if (withCost)
      allData += `|${this.cost}|${this.totalCost}`

    if (withCount)
      allData += `|${this.count}`

    return allData
  }


  DropUnusedEnchants() {
    let enchantIDsToDrop = []

    this.enchantsByID.forEach((enchant, id) => {
      if (enchant.level == 0)
        enchantIDsToDrop.push(id)
    })

    for (let enchantIDNr = 0; enchantIDNr < enchantIDsToDrop.length; ++enchantIDNr)
      this.enchantsByID.delete(enchantIDsToDrop[enchantIDNr])
  }
}
