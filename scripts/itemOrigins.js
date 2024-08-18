/*
  Trackers for item ancestry, used to prevent duplicate item use conflicts.
  ZeroOrigin is a convenient starting point for creating true ItemOrigins.

  Prerequisites:
  - item.js

  Defined classes:
  - ZeroOrigin
    used as a fast initial base for creating ItemOrigins
  - ItemOrigin
    keeps track of the origins of each item
*/


// ======== PUBLIC ========
class ZeroOrigin {
  static Rehydrate(origin) {
    Object.setPrototypeOf(origin, ZeroOrigin.prototype);
  }


  constructor(items) {
    // ==== PRIVATE ====
    let numItems = items.length

    this.maxUses = new Array(numItems)
    this.itemUses = new Array(numItems)

    for (let itemNr = 0; itemNr < numItems; ++itemNr) {
      let item = items[itemNr]
      this.maxUses[itemNr] = item.count
      this.itemUses[itemNr] = 0
    }
  }


  // returns ItemOrigin
  CreateOrigin(itemNr) {
    return new ItemOrigin(this, itemNr)
  }
}




class ItemOrigin {
  static Rehydrate(origin) {
    Object.setPrototypeOf(origin, ItemOrigin.prototype);
  }


  constructor(otherOrigin, itemNr) {
    this.maxUses = otherOrigin.maxUses // noone is modifying it; by ref is fine
    this.itemUses = otherOrigin.itemUses.slice()

    if (itemNr !== undefined) {
      if (itemNr >= this.itemUses.length)
        throw 'Illegal item nr used for origin.'

      this.itemUses[itemNr] += 1
    }
  }


  Combine(otherOrigin) {
    let combinedOrigin = new ItemOrigin(this)

    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      combinedOrigin.itemUses[itemNr] += otherOrigin.itemUses[itemNr]

    return combinedOrigin
  }


  DetermineMaxCombineCount(otherOrigin) {
    let numCombines = 9e9 // should be enough

    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr) {
      let combinedItemUses = this.itemUses[itemNr] + otherOrigin.itemUses[itemNr]
      if (combinedItemUses > 0) {
        let thisItemNumCombines = Math.trunc(this.maxUses[itemNr] / combinedItemUses)
        if (numCombines > thisItemNumCombines)
          numCombines = thisItemNumCombines
      }
    }

    return numCombines
  }


  IsSubsetOf(otherOrigin) {
    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      if (this.itemUses[itemNr] > otherOrigin.itemUses[itemNr])
        return false

    return true
  }
}
