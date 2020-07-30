/*
  Single item (source, desired, combined or extra).

  Prerequisites:
  - dataSets.js
  - itemDetails.js

  Defined classes:
  - Item
    all items:
    - count: int
    - set: char (s=source/e=extra/c=combined/d=desired)
    - id: char
    - nr: int
    - details: itemDetails
    - enchantsByID: map(id -> enchant)
    - priorWork: int
    - cost: int
    - totalCost: int
    combined items only:
    - targetItem: item
    - sacrificeItem: item
    all items except desired items:
    - origin: effectively an array(bool)
*/
class Item {
  constructor(count, set, id, nr, priorWork) {
    // note our details
    this.count = count
    this.id = id
    this.set = set
    this.nr = nr
    this.priorWork = priorWork

    // fetch further details
    this.details = g_itemDetailsByID[id]

    // and start the derived data
    this.enchantsByID = {}
    this.cost = 0
    this.totalCost = 0
  }


  // gets a hash of our state
  Hash() {
    // add out type and prior work
    let allData = `${this.id}|${this.priorWork}`

    // add our enchants in a standard order
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      let enchant = this.enchantsByID[g_enchantDetails[enchantNr].id]
      if (enchant !== undefined)
        allData += `|${enchant.id}|${enchant.level}`
    }

    // and that'll do
    return allData
  }


  // drops any unused enchants
  DropUnusedEnchants() {
    // find all unused enchants
    let enchantIDsToDrop = []
    for (let enchantID in this.enchantsByID) {
      let enchant = this.enchantsByID[enchantID]
      if (enchant.level == 0)
        enchantIDsToDrop.push(enchantID)
    }

    // and drop all unused enchants
    for (let enchantIDNr = 0; enchantIDNr < enchantIDsToDrop.length; ++enchantIDNr)
      delete this.enchantsByID[enchantIDsToDrop[enchantIDNr]]
  }
}
