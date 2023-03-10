/*
  Generates a series of monotonically increasing item nrs,
  starting the series after the highest used source item nr.

  Prerequisites:
  - none

  Defined classes:
  - ItemNrGenerator
*/


// ======== PUBLIC ========


class ItemNrGenerator {
  constructor(sourceItems) {
    // ==== PRIVATE ====
    this.nextNr = 0
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr)
      this.nextNr = Math.max(this.nextNr, sourceItems[itemNr].nr)

    ++this.nextNr
  }


  Next() {
    return this.nextNr++
  }
}
