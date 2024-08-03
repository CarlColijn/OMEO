/*
  Tracks lists and progress for combining items.

  Strategy: we process all items, combining them with all items that
  come before them.  New items are added at the back so that they
  in turn will automatically be picked up too in time.  The process
  stops out of itself once no new items can be added anymore, which
  should happen since at some point all low-level combinations have
  already been made and new combinations are just too costly due to
  the prior work penalty.

  Prerequisites:
  - item.js

  Defined classes:
  - ItemCombineList
*/


class ItemCombineList {
  constructor(sourceItems) {
    this.allItems = sourceItems.slice()
    this.combinedItems = []

    this.item1Nr = 0
    this.item2Nr = 0
  }


  // Returns if there are next items.
  // Items will have its .item1 and .item2 set to the items.
  GetNextItems(items) {
    if (this.item1Nr >= this.allItems.length)
      return false

    items.item1 = this.allItems[this.item1Nr]
    items.item2 = this.allItems[this.item2Nr]

    ++this.item2Nr
    if (this.item2Nr > this.item1Nr) {
      ++this.item1Nr
      this.item2Nr = 0
    }

    return true
  }


  GetCombinedItems() {
    return this.combinedItems
  }


  GetCurrentProgress() {
    return this.Progress(this.item1Nr) + this.item2Nr
  }


  GetMaxProgress() {
    return this.Progress(this.allItems.length)
  }


  AddCombinedItem(combinedItem) {
    this.allItems.push(combinedItem)
    this.combinedItems.push(combinedItem)
  }


  // ======== PRIVATE ========


  Progress(value) {
    return value * (value + 1) / 2
  }
}
