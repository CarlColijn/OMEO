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
    this.SetUpItemsByHash()

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


  ProcessItem(combinedItem, GradeCombinedItems) {
    // Optimization: if the new item is identical to something we already
    // have in both type and enchants, then we can dedupe these and toss
    // the one that:
    // - has the same or a superset of the same origins, and
    // - has the same or a higher priorWork, and
    // - has the same or higher totalCost
    // If not all conditions are met it's a toss-up which one will turn out
    // to be the better one, so we need to take both.

    if (combinedItem === undefined)
      // No item; nothing to do.
      return

    let combinedItemHash = combinedItem.Hash(false, false)

    let keepItem
    if (!this.allItemsByHash.has(combinedItemHash))
      // Haven't seen items of this kind yet, so keep it.
      keepItem = true
    else {
      // Let GradeCombinedItems decide what should happen by holding it
      // against all previous items.
      let previousCombinedItems = this.allItemsByHash.get(combinedItemHash)
      keepItem = previousCombinedItems.every((previousItem) => {
        let grade = GradeCombinedItems(previousItem, combinedItem)
        if (grade == -1)
          // This previous item is constructed better, so we can discard
          // the new one.  We can also stop checking, since other previous
          // items will not be worse than the new one either.
          return false

        if (grade == +1) {
          // The new item is constructed better; we can discard the previous
          // one and all it's decendants.
          // TO IMPLEMENT
        }

        // New is undecided or better than all, so keep it.
        return true
      })
    }

    if (keepItem) {
      this.allItems.push(combinedItem)
      this.AddItemToAllItemsByHash(combinedItem, combinedItemHash)
      this.combinedItems.push(combinedItem)
    }
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


  // ======== PRIVATE ========


  Progress(value) {
    return value * (value + 1) / 2
  }


  AddItemToAllItemsByHash(item, itemHash) {
    if (this.allItemsByHash.has(itemHash))
      this.allItemsByHash.get(itemHash).push(item)
    else
      this.allItemsByHash.set(itemHash, [item])
  }


  SetUpItemsByHash() {
    this.allItemsByHash = new Map()
    this.allItems.forEach((item) => {
      this.AddItemToAllItemsByHash(item, item.Hash(false, false))
    })
  }
}
