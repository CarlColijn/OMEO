/*
  Trackers for item ancestry, used to prevent duplicate item use conflicts.
  Since we'll have oodles of these (one for each item), and since we don't
  want to blow up the user's memory, we internally uses bit fiddling instead
  of arrays, maps or strings to keep track of the item nrs used.

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
  constructor(numItems) {
    // set up the parts
    this.numParts = Math.ceil(numItems / 32) // max 32 bits per part
    this.parts = Array(this.numParts)
    for (let partNr = 0; partNr < this.numParts; ++partNr)
      this.parts[partNr] = 0|0 // 0 as real int
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
    this.numParts = otherOrigin.numParts
    this.finalPartSize = otherOrigin.finalPartSize
    this.parts = otherOrigin.parts.slice()

    // and mark our item, if possible
    if (itemNr !== undefined) {
      let partNr = Math.floor(itemNr / 32)
      let bitNr = itemNr - partNr * 32
      this.parts[partNr] |= 1 << bitNr
    }
  }


  // combines two origins
  Combine(otherOrigin) {
    // base a new origin on us
    let combinedOrigin = new ItemOrigin(this)

    // mark the parts from the other origin as well
    for (let partNr = 0; partNr < this.numParts; ++partNr)
      combinedOrigin.parts[partNr] |= otherOrigin.parts[partNr]

    // and we combined them
    return combinedOrigin
  }


  // checks for conflicts between origins
  ConflictsWith(otherOrigin) {
    let conflicts = false
    for (let partNr = 0; partNr < this.numParts && !conflicts; ++partNr)
      conflicts = (this.parts[partNr] & otherOrigin.parts[partNr]) != 0
    return conflicts
  }
}
