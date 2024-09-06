/*
  Combined items result filtering and grouping.
  Used to filter, group, grade, sort and pick-best resulting combined items
  for display to the user.  Non-relevant items (wrong type) and extra items
  (added for combining) are filtered out.

  Prerequisites:
  - ratedItem.js

  Defined classes:
  - FilteredCombinedItems: {
      exactOnlyWithoutRename: bool,
      ratedItemsByMatch: RatedItem[][] // 1st index is one of the g_xxxMatch consts
    }

  - CombineResultFilter
*/


// ======== PUBLIC ========


class CombineResultFilter {
  // ======== PUBLIC ========


  constructor(desiredItem, renameToo) {
    this.desiredItem = desiredItem
    this.renameToo = renameToo
  }


  // returns FilteredCombinedItems
  FilterItems(combinedItems, numItemsToTake) {
    let relevantItems = this.GetRelevantItems(combinedItems)

    let ratedItems = this.RateItems(relevantItems)

    let foundUnrenamedExact = this.HasUnrenamedExact(ratedItems)

    ratedItems = this.RemoveRenameMismatches(ratedItems)

    ratedItems = this.GetLowestPrioAndCostItems(ratedItems)

    let filteredCombinedItems = this.GroupRatedItems(ratedItems, foundUnrenamedExact)

    this.SortGroups(filteredCombinedItems)

    this.KeepBestInGroup(filteredCombinedItems, numItemsToTake)

    return filteredCombinedItems
  }


  // ======== PRIVATE ========


  // returns Item[]
  GetRelevantItems(items) {
    return items.filter((item) => {
      return item.info === this.desiredItem.info
    })
  }


  // returns RatedItem[]
  RateItems(items) {
    return items.map((item) => {
      return new RatedItem(item, this.desiredItem)
    })
  }


  // returns bool
  HasUnrenamedExact(ratedItems) {
    if (!this.renameToo)
      return false

    return ratedItems.some((ratedItem) => {
      return (
        ratedItem.enchantMatch == g_exactMatch &&
        !ratedItem.item.includesRename
      )
    })
  }


  // return RatedItem[]
  RemoveRenameMismatches(ratedItems) {
    if (!this.renameToo)
      return ratedItems

    return ratedItems.filter((ratedItem) => {
      return ratedItem.item.includesRename
    })
  }


  AddLowestPrioAndCostItemsFromGroup(ratedItems, ratedItemsToKeep) {
    /*
      Strategy:
      - For each priorWork and totalCost, decide which item has the lowest
        other property value.  This way we get an optimum for each value in
        each category.
      - Afterwards we find the items which score best on both accounts from
        these optimized lists.  If we e.g. know the item with the lowest
        priorWork for a particular totalCost, then we're only interested in
        that item if there isn't any lower totalCost item for that priorWork.
        We also check if there aren't any other items with both lower priorWork
        and totalCost.
    */

    let minTotalCostItemByPriorWork = new Map()
    let minPriorWorkItemByTotalCost = new Map()
    ratedItems.forEach((ratedItem) => {
      if ((minTotalCostItemByPriorWork.get(ratedItem.item.priorWork)?.item.totalCost ?? 9e9) > ratedItem.item.totalCost)
        minTotalCostItemByPriorWork.set(ratedItem.item.priorWork, ratedItem)
      if ((minPriorWorkItemByTotalCost.get(ratedItem.item.totalCost)?.item.priorWork ?? 9e9) > ratedItem.item.priorWork)
        minPriorWorkItemByTotalCost.set(ratedItem.item.totalCost, ratedItem)
    })

    let CheckNoBetterItemPresent = (ratedItem, ratedItemsByKey) => {
      let noBetterItemPresent = true
      ratedItemsByKey.forEach((otherRatedItem) => {
        if (
          otherRatedItem.item.priorWork < ratedItem.item.priorWork &&
          otherRatedItem.item.totalCost < ratedItem.item.totalCost
        )
          noBetterItemPresent = false
        return noBetterItemPresent
      })
      return noBetterItemPresent
    }

    let selectedRatedItems = new Set()
    minTotalCostItemByPriorWork.forEach((ratedItem) => {
      if (
        minPriorWorkItemByTotalCost.get(ratedItem.item.totalCost) === ratedItem &&
        CheckNoBetterItemPresent(ratedItem, minTotalCostItemByPriorWork)
      ) {
        ratedItemsToKeep.push(ratedItem)
        selectedRatedItems.add(ratedItem)
      }
    })
    minPriorWorkItemByTotalCost.forEach((ratedItem) => {
      if (
        !selectedRatedItems.has(ratedItem) &&
        minTotalCostItemByPriorWork.get(ratedItem.item.priorWork) === ratedItem &&
        CheckNoBetterItemPresent(ratedItem, minPriorWorkItemByTotalCost)
      )
        ratedItemsToKeep.push(ratedItem)
    })
  }


  // returns Item[]
  GetLowestPrioAndCostItems(ratedItems) {
    let ratedItemsToKeep = []

    let ratedItemsByType = new Map()
    ratedItems.forEach((ratedItem) => {
      let itemHash = ratedItem.item.HashType()
      if (ratedItemsByType.has(itemHash))
        ratedItemsByType.get(itemHash).push(ratedItem)
      else
        ratedItemsByType.set(itemHash, [ratedItem])
    })

    ratedItemsByType.forEach((ratedItems) => {
      this.AddLowestPrioAndCostItemsFromGroup(ratedItems, ratedItemsToKeep)
    })

    return ratedItemsToKeep
  }


  // returns FilteredCombinedItems
  GroupRatedItems(ratedItems, foundUnrenamedExact) {
    let exacts = []
    let betters = []
    let lessers = []
    let mixeds = []

    ratedItems.forEach((ratedItem) => {
      if (!this.renameToo || ratedItem.item.includesRename) {
        switch (ratedItem.enchantMatch) {
          case g_exactMatch:
            exacts.push(ratedItem)
            break
          case g_betterMatch:
            betters.push(ratedItem)
            break
          case g_lesserMatch:
            lessers.push(ratedItem)
            break
          case g_mixedMatch:
            mixeds.push(ratedItem)
            break
        }
      }
    })

    return {
      exactOnlyWithoutRename: foundUnrenamedExact && exacts.length == 0,
      ratedItemsByMatch: [exacts, betters, lessers, mixeds]
    }
  }


  SortGroups(filteredCombinedItems) {
    filteredCombinedItems.ratedItemsByMatch.forEach((ratedItems) => {
      ratedItems.sort((ratedItem1, ratedItem2) => {
        // note: lower is better, so the - order is inverted
        return ratedItem1.totalRating - ratedItem2.totalRating
      })
    })
  }


  KeepBestInGroup(filteredCombinedItems, numItemsToTake) {
    filteredCombinedItems.ratedItemsByMatch.forEach((ratedItems) => {
      ratedItems.splice(numItemsToTake, Infinity)
    })
  }
}
