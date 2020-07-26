/*
  Single item (source, desired, combined or extra).

  Prerequisites:
  - dataSets.js
  - itemDetails.js

  Defined classes:
  - Item
    all items:
    - set: char (s=source/e=extra/c=combined/d=desired)
    - id: char
    - nr: int
    - details: itemDetails
    - enchantsByID: map(id -> enchant)
    - priorWork:
      - string for freshly form-grabbed items
      - int for computed and validated items
    - priorWorkElemJQ: jQuery elem (only on form-grabbed items)
    - cost: int
    - totalCost: int
    combined items only:
    - targetItem: item
    - sacrificeItem: item
    all items except desired items:
    - origin: effectively an array(bool)
*/
class Item {
  constructor(set, id, nr, priorWork, priorWorkElemJQ) {
    // note our details
    this.id = id
    this.set = set
    this.nr = nr
    this.priorWork = priorWork
    this.priorWorkElemJQ = priorWorkElemJQ

    // fetch further details
    this.details = g_itemDetailsByID[id]

    // and start the derived data
    this.enchantsByID = {}
    this.cost = 0
    this.totalCost = 0
  }


  // gets a hash of our state
  Hash() {
    // add out type
    let allData = `${this.id}`

    // add our enchants in a standard order
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      let enchant = this.enchantsByID[g_enchantDetails[enchantNr].id]
      if (enchant !== undefined)
        allData += `|${enchant.id}|${enchant.level}`
    }
  }


  // validates the item
  // returns if the item is valid
  Validate(form) {
    // validate our own data
    let allOK = true
    this.priorWork = parseInt(this.priorWork)
    if (this.set == g_source && isNaN(this.priorWork)) {
      // prior work in error -> tell
      form.NoteError(this.priorWorkElemJQ, 'This is not a number')
      allOK = false
    }
    else {
      // done -> validate all our enchants too
      for (let enchantID in this.enchantsByID) {
        let enchant = this.enchantsByID[enchantID]
        if (!enchant.Validate())
          // failed -> note
          allOK = false
      }
    }

    // and return the verdict
    return allOK
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
