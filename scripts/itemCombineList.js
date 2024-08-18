/*
  Tracks lists and progress for combining items.

  Strategy: we process all items, combining them with all items that
  come before them.  New items are added at the back so that they
  in turn will automatically be picked up too in time.  The process
  stops out of itself once no new items can be added anymore, which
  should happen since at some point all low-level combinations have
  already been made and new combinations are just too costly due to
  the prior work penalty.
  To make the process more efficient, we want to be able to remove
  inferior items.  For that we keep track of 3 lists;
  - allItems: Item[]
    Contains all items, incl. source items.
  - allItemsByTypeHash: Map(string -> Item)
    Groups same-typed items together to enable quick retrieval for
    comparison on fitness.
  - itemListInfosByItem: Map(Item -> ItemListInfo)
    Stores extra list indexing information for each item, to make
    managing our internal lists more efficient.
  Each ItemListInfo in turn tracks three things;
  - index: int
    The index the item has in the allItems list.
  - typeHash: string
    The type hash of the item, and thus also the index the item has
    in the allItemsByTypeHash list.
  - derivedItems: [Item]
    All items that are derived from the item (whose targetItem or
    sacrificeItem is set to that item).

  Prerequisites:
  - item.js

  Defined classes:
  - ItemCombineList
*/


class ItemCombineList {
  constructor(sourceItems) {
    this.allItems = []
    this.allItemsByTypeHash = new Map()
    this.itemListInfosByItem = new Map()

    this.numSourceItems = sourceItems.length
    sourceItems.forEach((item) => {
      this.AddItem(item, item.HashType())
    })

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

    let combinedItemTypeHash = combinedItem.HashType()

    // Note: we keep the item by default; if there is no itemsByHashType
    // for this item we haven't seen items of this kind yet, so keep it.
    // If there already are like items, we let GradeCombinedItems decide
    // what should happen by holding it against all other items.  And in
    // case that list has become empty, .every returns true for empty
    // arrays, which is what we want too.
    let keepItem = true
    let removeItems = []
    if (this.allItemsByTypeHash.has(combinedItemTypeHash)) {
      let otherSameTypedItems = this.allItemsByTypeHash.get(combinedItemTypeHash)
      keepItem = otherSameTypedItems.every((otherItem) => {
        let grade = GradeCombinedItems(otherItem, combinedItem)
        if (grade == -1)
          // This other item is constructed better, so we can discard the
          // new one.  We can also stop checking, since all other items
          // will not be worse than the new one either.
          return false

        if (grade == +1)
          // The new item is constructed better; we can discard the other
          // one and all it's decendants.
          removeItems.push(otherItem)

        // The new one's grade is a toss-up or better than all, so keep it.
        return true
      })
    }

    if (keepItem)
      this.AddItem(combinedItem, combinedItemTypeHash)

    if (removeItems.length > 0)
      this.RemoveItems(removeItems)
  }


  GetCombinedItems() {
    return this.allItems.slice(this.numSourceItems, this.allItems.length)
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


  AddItem(item, itemTypeHash) {
    let itemIndex = this.allItems.length
    let itemListInfo = {
      index: itemIndex,
      typeHash: itemTypeHash,
      derivedItems: []
    }

    this.allItems.push(item)

    this.itemListInfosByItem.set(item, itemListInfo)
    if (item.set === g_combined) {
      this.itemListInfosByItem.get(item.targetItem).derivedItems.push(item)
      this.itemListInfosByItem.get(item.sacrificeItem).derivedItems.push(item)
    }

    if (this.allItemsByTypeHash.has(itemTypeHash))
      this.allItemsByTypeHash.get(itemTypeHash).push(item)
    else
      this.allItemsByTypeHash.set(itemTypeHash, [item])
  }


  RemoveFromParentLists(item, parentItem) {
    // Note: if we already removed the parent item, it's
    // itemListInfo will also be gone by now.  That's OK
    // though; no need then to patch it up either.
    let parentListInfo = this.itemListInfosByItem.get(parentItem)
    if (parentListInfo !== undefined) {
      let index = parentListInfo.derivedItems.indexOf(item)
      parentListInfo.derivedItems.splice(index, 1)
    }
  }


  RemoveItems(items) {
    for (let itemIndex = 0; itemIndex < items.length; ++itemIndex) {
      let item = items[itemIndex]
      let listInfo = this.itemListInfosByItem.get(item)

      this.allItems.splice(listInfo.index, 1)
      for (let higherItemIndex = listInfo.index; higherItemIndex < this.allItems.length; ++higherItemIndex) {
        let higherItem = this.allItems[higherItemIndex]
        let higherListInfo = this.itemListInfosByItem.get(higherItem)
        --higherListInfo.index
      }
      if (listInfo.index < this.numSourceItems)
        --this.numSourceItems

      if (this.item1Nr == listInfo.index)
        this.item2Nr = 0
      else {
        if (this.item1Nr > listInfo.index)
          --this.item1Nr
        if (this.item2Nr > listInfo.index)
          --this.item2Nr
      }

      this.itemListInfosByItem.delete(item)
      if (item.set === g_combined) {
        this.RemoveFromParentLists(item, item.targetItem)
        this.RemoveFromParentLists(item, item.sacrificeItem)
      }

      let otherSameTypedItems = this.allItemsByTypeHash.get(listInfo.typeHash)
      let otherItemIndex = otherSameTypedItems.indexOf(item)
      otherSameTypedItems.splice(otherItemIndex, 1)

      if (listInfo.derivedItems.length > 0)
        items.push(...listInfo.derivedItems)
    }
  }
}
