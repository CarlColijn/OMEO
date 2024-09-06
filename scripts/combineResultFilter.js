/*
  Combined items result filtering and grouping.
  Used to filter, group, grade, sort and pick-best resulting combined items
  for display to the user.  Non-relevant items (wrong type) and extra items
  (added for combining) are filtered out.

  Prerequisites:
  - ratedItem.js

  Defined classes:
  - RatedItemGroup: RatedItem[]

  - RatedItemGroups: RatedItemGroup[] // index is one of the g_xxxMatch consts

  - CombineResultFilter
*/


// ======== PUBLIC ========


class CombineResultFilter {
  // ======== PUBLIC ========


  constructor(desiredItem) {
    this.desiredItem = desiredItem
  }


  // returns RatedItemGroups
  FilterItems(combinedItems, numItemsToTake) {
    let relevantItems = this.GetRelevantItems(combinedItems)
    relevantItems = this.GetLowestPrioAndCostItems(relevantItems)

    let ratedItems = this.RateItems(relevantItems)

    let ratedItemGroups = this.GroupRatedItems(ratedItems)

    this.SortGroups(ratedItemGroups)

    this.KeepBestInGroup(ratedItemGroups, numItemsToTake)

    return ratedItemGroups
  }


  // ======== PRIVATE ========


  // returns Item[]
  GetRelevantItems(items) {
    return items.filter((item) => {
      return item.info === this.desiredItem.info
    })
  }


  AddLowestPrioAndCostItemsFromGroup(items, itemsToKeep) {
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
    items.forEach((item) => {
      if ((minTotalCostItemByPriorWork.get(item.priorWork)?.totalCost ?? 9e9) > item.totalCost)
        minTotalCostItemByPriorWork.set(item.priorWork, item)
      if ((minPriorWorkItemByTotalCost.get(item.totalCost)?.priorWork ?? 9e9) > item.priorWork)
        minPriorWorkItemByTotalCost.set(item.totalCost, item)
    })

    let CheckNoBetterItemPresent = (item, itemsByKey) => {
      let noBetterItemPresent = true
      itemsByKey.forEach((otherItem) => {
        if (
          otherItem.priorWork < item.priorWork &&
          otherItem.totalCost < item.totalCost
        )
          noBetterItemPresent = false
        return noBetterItemPresent
      })
      return noBetterItemPresent
    }

    let selectedItems = new Set()
    minTotalCostItemByPriorWork.forEach((item) => {
      if (
        minPriorWorkItemByTotalCost.get(item.totalCost) === item &&
        CheckNoBetterItemPresent(item, minTotalCostItemByPriorWork)
      ) {
        itemsToKeep.push(item)
        selectedItems.add(item)
      }
    })
    minPriorWorkItemByTotalCost.forEach((item) => {
      if (
        !selectedItems.has(item) &&
        minTotalCostItemByPriorWork.get(item.priorWork) === item &&
        CheckNoBetterItemPresent(item, minPriorWorkItemByTotalCost)
      )
        itemsToKeep.push(item)
    })
  }


  // returns Item[]
  GetLowestPrioAndCostItems(items) {
    let itemsToKeep = []

    let itemsByType = new Map()
    items.forEach((item) => {
      let itemHash = item.HashType()
      if (itemsByType.has(itemHash))
        itemsByType.get(itemHash).push(item)
      else
        itemsByType.set(itemHash, [item])
    })

    itemsByType.forEach((items) => {
      this.AddLowestPrioAndCostItemsFromGroup(items, itemsToKeep)
    })

    return itemsToKeep
  }


  // returns RatedItem[]
  RateItems(items) {
    return items.map((item) => {
      return new RatedItem(item, this.desiredItem)
    })
  }


  // returns RatedItemGroups
  GroupRatedItems(ratedItems) {
    let exacts = []
    let betters = []
    let lessers = []
    let mixeds = []

    ratedItems.forEach((ratedItem) => {
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
    })

    return [exacts, betters, lessers, mixeds]
  }


  SortGroups(ratedItemGroups) {
    ratedItemGroups.forEach((group) => {
      group.sort((ratedItem1, ratedItem2) => {
        // note: lower is better, so the - order is inverted
        return ratedItem1.totalRating - ratedItem2.totalRating
      })
    })
  }


  KeepBestInGroup(ratedItemGroups, numItemsToTake) {
    ratedItemGroups.forEach((group) => {
      group.splice(numItemsToTake, Infinity)
    })
  }
}
