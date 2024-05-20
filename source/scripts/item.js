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
    - nr: int
    - info: ItemInfo
    - enchantsByID: Map(int -> Enchant)
    - priorWork: int
    - cost: int
    - totalCost: int
    source items retrieved from a source table only:
    - id: int
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


  constructor(count, set, id, priorWork) {
    // ==== PUBLIC ====
    this.count = count
    this.set = set
    this.id = id
    this.info = g_itemInfosByID.get(id)
    this.enchantsByID = new Map()
    this.priorWork = priorWork
    this.cost = 0
    this.totalCost = 0
  }


  SetEnchant(enchant) {
    this.enchantsByID.set(enchant.info.id, enchant)
  }


  // returns string
  Hash(withPriorWork) {
    // note: no fancy stuff for now with bit fiddling, just a big 'ol string concat

    let allData = this.id

    if (withPriorWork)
      allData += `|${this.priorWork}`

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = this.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        allData += `|${enchant.id}|${enchant.level}`
    }

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
