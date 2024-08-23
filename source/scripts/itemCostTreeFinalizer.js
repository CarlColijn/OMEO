/*
  Finalizes an item cost tree.

  Prerequisites:
  - item.js

  Defined classes:
  - ItemCostTreeFinalizer
*/


// ======== PUBLIC ========


class ItemCostTreeFinalizer {
  constructor(item) {
    // ==== PRIVATE ====
    this.item = item
  }


  // returns Item (the corrected clone)
  UpdateCostsForRename() {
    let clone = this.item.Clone()

    let allItems = clone.CollapseTree()

    let costIncreaseItem = this.SelectRenameItem(allItems)

    this.UpdateCostThroughTree(allItems, costIncreaseItem)

    return clone
  }


  // ======== PRIVATE ========


  // returns Item or undefined
  SelectRenameItem(items) {
    let leastCostlyRenameItem = undefined

    items.forEach((item) => {
      if (item.renamePoint === true) {
        if (leastCostlyRenameItem === undefined)
          leastCostlyRenameItem = item
        else if (leastCostlyRenameItem.cost > item.cost) {
          leastCostlyRenameItem.renamePoint = false
          leastCostlyRenameItem = item
        }
        else
          item.renamePoint = false
      }
    })

    return leastCostlyRenameItem
  }


  UpdateCostThroughTree(items, renameItem) {
    while (renameItem !== undefined) {
      renameItem.cost += 1
      renameItem.totalCost += 1

      renameItem = items.find((otherItem) => {
        return (
          otherItem.targetItem === renameItem ||
          otherItem.sacrificeItem === renameItem
        )
      })
    }
  }
}
