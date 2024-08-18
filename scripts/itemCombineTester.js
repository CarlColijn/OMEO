/*
  Performs all sorts of tests for item combining.

  Prerequisites:
  - none

  Defined classes:
  - ItemCombineTester
*/


// ======== PUBLIC ========


class ItemCombineTester {
  constructor() {
  }


  // returns bool
  TargetIsRelevant(targetItem, desiredItem) {
    return (
      targetItem.info.isBook ||
      targetItem.info === desiredItem.info
    )
  }


  // returns bool
  ItemsCompatible (targetItem, sacrificeItem) {
    return (
      targetItem.info.isBook ? (
        sacrificeItem.info.isBook // we can only add books to books
      ) : (
        sacrificeItem.info.isBook || // we can always add books to anything
        sacrificeItem.info === targetItem.info // or combine items of the same type
      )
    )
  }


  // returns bool
  CombineIsWasteful(targetItem, targetUsed, sacrificeItem, sacrificeUsed) {
    if (!targetItem.info.isBook && sacrificeItem.info.isBook)
      // ... book-on-tool: we only care if the book's enchants got used;
      // if the tool's enchants went unused we just singlehandedly upgraded
      // all enchants on the tool, which is perfectly fine
      return !sacrificeUsed
    else if (targetItem.info.isBook == sacrificeItem.info.isBook)
      // ... tool-on-tool or book-on-book; if either didn't get used it's
      // just a waste of that item (book or tool)
      return !targetUsed || !sacrificeUsed
    else
      // ... tool-on-book wtf situation; just bail out
      return true
  }


  // returns bool
  UnenchantedSourcePresent(sourceItems, desiredItem) {
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr) {
      let sourceItem = sourceItems[itemNr]
      if (
        sourceItem.info === desiredItem.info &&
        sourceItem.enchantsByID.size == 0
      )
        return true
    }

    return false
  }


  // returns bool
  EnchantConflictsForItem(enchantInfo, targetItem) {
    let conflicts = false
    targetItem.enchantsByID.forEach((enchant, id) => {
      if (EnchantIDsConflict(enchantInfo.id, id))
        conflicts = true
    })

    return conflicts
  }
}
