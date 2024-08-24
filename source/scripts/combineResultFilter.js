/*
  Combined items result filtering.
  Used to filter, grade and sort resulting combined items for display to
  the user.

  Prerequisites:
  - item.js

  Defined classes:
  - CombineResultFilter

  Defined globals:
  - g_onlyPerfectCombines
  - g_perfectAndPerfectWithExtrasCombines
  - g_onlyPerfectWithExtrasCombines
  - g_onlyImperfectCombines
  - g_noCombines

  Desired match sorting order:
  - Put the single most fit perfect match (item + enchants) first.
  - Add all unique perfect matches with extra enchantments,
    picking the most fit of each set and sorting by decreasing fitness.
  - If none of the above are present, pick all unique imperfect items
    that are at least of the correct type, sorted decreasing by fitness.
*/


// ======== PUBLIC ========


class CombineResultLevel {
  // returns one of the predefined CombineResultLevel globals
  static GetRehydrated(level) {
    switch (level.id) {
      case 'p': return g_onlyPerfectCombines
      case 'pe': return g_perfectAndPerfectWithExtrasCombines
      case 'e': return g_onlyPerfectWithExtrasCombines
      case 'i': return g_onlyImperfectCombines
      case 'n': return g_noCombines
    }
    return undefined
  }


  constructor(id) {
    this.id = id
  }
}
g_onlyPerfectCombines = new CombineResultLevel('p')
g_perfectAndPerfectWithExtrasCombines = new CombineResultLevel('pe')
g_onlyPerfectWithExtrasCombines = new CombineResultLevel('e')
g_onlyImperfectCombines = new CombineResultLevel('i')
g_noCombines = new CombineResultLevel('n')




class CombineResultFilter {
  // ======== PUBLIC ========


  constructor(desiredItem) {
    this.desiredItem = desiredItem
  }


  // returns object;
  // - level: CombineResultLevel
  // - items: Item[]
  // - hasSources: bool
  GetCleanedUpItemList(sourceItems, combinedItems) {
    let itemGroups = this.SortItemsInGroups([...sourceItems, ...combinedItems])

    this.SortItemGroupsByFitness(itemGroups)

    // Note: perfects always hold the same items, so if we pick the 1st
    // then we have the one with best overall fitness.

    let hasPerfects = itemGroups.perfects.length > 0
    let hasPerfectsWithExtras = itemGroups.perfectsWithExtras.length > 0

    let level
    let items
    if (hasPerfects && !hasPerfectsWithExtras) {
      level = g_onlyPerfectCombines
      items = this.PickBestUniqueItems(itemGroups.perfects)
    }
    else if (hasPerfects && hasPerfectsWithExtras) {
      level = g_perfectAndPerfectWithExtrasCombines
      items = [
        ...this.PickBestUniqueItems(itemGroups.perfects),
        ...this.PickBestUniqueItems(itemGroups.perfectsWithExtras)
      ]
    }
    else if (!hasPerfects && hasPerfectsWithExtras) {
      level = g_onlyPerfectWithExtrasCombines
      items = this.PickBestUniqueItems(itemGroups.perfectsWithExtras)
    }
    else if (itemGroups.imperfects.length > 0) {
      level = g_onlyImperfectCombines
      items = this.PickBestUniqueItems(itemGroups.imperfects)
    }
    else {
      level = g_noCombines
      items = []
    }

    return {
      level: level,
      items: items,
      hasSources: this.ItemListContainsSources(items)
    }
  }


  // ======== PRIVATE ========


  // returns object;
  // - matchesType: bool
  // - matchesPerfect: bool
  // - hasExtraEnchants: bool
  // - rating: float
  CheckItemMatch(combinedItem) {
    let matchesType = combinedItem.info === this.desiredItem.info
    let matchesPerfect = matchesType
    let hasExtraEnchants = false
    let rating = 0.0

    if (matchesType) {
      // all enchants on desired, missing or not on combined
      this.desiredItem.enchantsByID.forEach((desiredEnchant, id) => {
        let combinedLevel
        if (!combinedItem.enchantsByID.has(id)) {
          combinedLevel = 0
          matchesPerfect = false
        }
        else {
          let combinedEnchant = combinedItem.enchantsByID.get(id)
          combinedLevel = combinedEnchant.level

          if (combinedLevel < desiredEnchant.level)
            matchesPerfect = false
          else if (combinedLevel > desiredEnchant.level)
            hasExtraEnchants = true
        }

        rating += Math.abs(combinedLevel - desiredEnchant.level)
      })

      // all enchants missing on desired
      combinedItem.enchantsByID.forEach((combinedEnchant, id) => {
        if (!this.desiredItem.enchantsByID.has(id)) {
          hasExtraEnchants = true

          rating += combinedEnchant.level
        }
      })
    }

    return {
      matchesType: matchesType,
      matchesPerfect: matchesPerfect,
      hasExtraEnchants: hasExtraEnchants,
      rating: rating
    }
  }


  // returns object
  // - perfect: Item[]
  // - perfectsWithExtras: Item[]
  // - imperfects: Item[]
  SortItemsInGroups(items) {
    let groups = {
      perfects: [],
      perfectsWithExtras: [],
      imperfects: []
    }

    items.forEach((item) => {
      let matchResult = this.CheckItemMatch(item)

      if (matchResult.matchesType) {
        if (matchResult.matchesPerfect && !matchResult.hasExtraEnchants)
          groups.perfects.push(item)
        else if (matchResult.matchesPerfect && matchResult.hasExtraEnchants)
          groups.perfectsWithExtras.push(item)
        else
          groups.imperfects.push(item)
      }
    })

    return groups
  }


  // returns which item is the 1) best, 2) lowest priorWork and 3) cheapest match
  CompareRatedItemsByFitness(ratedItem1, ratedItem2) {
    if (ratedItem1.rating < ratedItem2.rating)
      return -1
    if (ratedItem1.rating > ratedItem2.rating)
      return +1

    if (ratedItem1.item.priorWork < ratedItem2.item.priorWork)
      return -1
    if (ratedItem1.item.priorWork > ratedItem2.item.priorWork)
      return +1

    if (ratedItem1.item.totalCost < ratedItem2.item.totalCost)
      return -1
    if (ratedItem1.item.totalCost > ratedItem2.item.totalCost)
      return +1

    return 0
  }


  // returns float
  RateItem(combinedItem) {
    let rating = 0.0

    // all enchants on desired, missing or not on combined
    this.desiredItem.enchantsByID.forEach((desiredEnchant, id) => {
      if (combinedItem.enchantsByID.has(id)) {
        let combinedEnchant = combinedItem.enchantsByID.get(id)
        rating += Math.abs(combinedEnchant.level - desiredEnchant.level)
      }
      else
        rating += desiredEnchant.level
    })

    // all enchants missing on desired
    combinedItem.enchantsByID.forEach((combinedEnchant, id) => {
      if (!this.desiredItem.enchantsByID.has(id))
        rating += combinedEnchant.level
    })

    return rating
  }


  // returns RatedItem[];
  // - item: Item
  // - rating: float // note: lower is better
  RateItems(items) {
    return items.map((item) => {
      return {
        item: item,
        rating: this.RateItem(item)
      }
    })
  }


  // returns Item[]
  SortItemsByFitness(items) {
    let ratedItems = this.RateItems(items)

    ratedItems.sort(this.CompareRatedItemsByFitness)

    return ratedItems.map((ratedItem) => {
      return ratedItem.item
    })
  }


  SortItemGroupsByFitness(itemGroups) {
    itemGroups.perfects = this.SortItemsByFitness(itemGroups.perfects)
    itemGroups.perfectsWithExtras = this.SortItemsByFitness(itemGroups.perfectsWithExtras)
    itemGroups.imperfects = this.SortItemsByFitness(itemGroups.imperfects)
  }


  // returns Map(hash(type) -> Item[])
  GroupItemsByType(items) {
    let itemsByType = new Map()
    items.forEach((item) => {
      let typeHash = item.HashType()
      if (!itemsByType.has(typeHash))
        itemsByType.set(typeHash, [])
      itemsByType.get(typeHash).push(item)
    })

    return itemsByType
  }


  AddLowestPrioAndCostItems(items, itemsToKeep) {
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

    if (items.length == 1)
      itemsToKeep.add(items[0])
    else {
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

      minTotalCostItemByPriorWork.forEach((item) => {
        if (
          minPriorWorkItemByTotalCost.get(item.totalCost) === item &&
          CheckNoBetterItemPresent(item, minTotalCostItemByPriorWork)
        )
          itemsToKeep.add(item)
      })
      minPriorWorkItemByTotalCost.forEach((item) => {
        if (
          minTotalCostItemByPriorWork.get(item.priorWork) === item &&
          CheckNoBetterItemPresent(item, minPriorWorkItemByTotalCost)
        )
          itemsToKeep.add(item)
      })
    }
  }


  PickBestUniqueItems(items) {
    let itemsByType = this.GroupItemsByType(items)

    let itemsToKeep = new Set()
    itemsByType.forEach((items) => {
      this.AddLowestPrioAndCostItems(items, itemsToKeep)
    })

    return items.filter((item) => {
      return itemsToKeep.has(item)
    })
  }


  ItemListContainsSources(items) {
    return items.some((item) => {
      return item.set === g_source
    })
  }
}
