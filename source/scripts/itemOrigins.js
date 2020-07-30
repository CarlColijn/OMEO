/*
  Trackers for item ancestry, used to prevent duplicate item use conflicts.

  Prerequisites:
  - none

  Defined classes:
  - ZeroOrigin
    used as a fast initial base for creating ItemOrigins
  - ItemOrigin
    keeps track of the origins of each item
*/

// ZeroOrigins; starting point for ItemOrigins
class ZeroOrigin {
  constructor(items) {
    // set up the uses
    let numItems = items.length
    this.maxUses = new Array(numItems)
    this.itemUses = new Array(numItems)
    for (let itemNr = 0; itemNr < numItems; ++itemNr) {
      let item = items[itemNr]
      this.maxUses[itemNr] = item.count
      this.itemUses[itemNr] = 0
    }
  }


  // derives a new ItemOrigin
  CreateOrigin(itemNr) {
    // create the new origin
    return new ItemOrigin(this, itemNr)
  }
}


// single item origin
class ItemOrigin {
  constructor(otherOrigin, itemNr) {
    // use the otherOrigin as a template
    this.maxUses = otherOrigin.maxUses // noone is modifying it; by ref is fine
    this.itemUses = otherOrigin.itemUses.slice()

    // and mark the item use, if possible
    if (itemNr !== undefined)
      this.itemUses[itemNr] += 1
  }


  // combines two origins
  Combine(otherOrigin) {
    // base a new origin on us
    let combinedOrigin = new ItemOrigin(this)

    // tally up the uses
    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      combinedOrigin.itemUses[itemNr] += otherOrigin.itemUses[itemNr]

    // and we combined them
    return combinedOrigin
  }


  // determines how many times we and the given origin can be combined
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
}
