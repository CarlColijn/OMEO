/*
  Combines all given items to get all possible item combinations.

  Prerequisites:
  - dataSets.js
  - enchantConflicts.js
  - enchantInfo.js
  - item.js
  - enchant.js
  - itemOrigins.js
  - enchantCombiner.js
  - itemCombineList.js
  - itemCombineTester.js

  Defined classes:
  - ItemCombiner
*/


// ======== PRIVATE ========


class CombineResult {
  constructor() {
    this.targetUsed = false
    this.sacrificeUsed = false
    this.enchantsByID = new Map()
    this.cost = 0
  }
}


// ======== PUBLIC ========


class ItemCombiner {
  // returns object; { combinedItems: Item[], maxProgress: int }
  GetAllItemCombinations(sourceItems, desiredItem, renameToo, feedbackHandler) {
    this.maxCost = renameToo ? 38 : 39

    let tester = new ItemCombineTester()

    let filteredSourceItems = this.DropNonMatchingSourceItems(tester, sourceItems, desiredItem)

    this.DropUnusedEnchantsFromItems(filteredSourceItems, desiredItem)

    this.InsertExtraUnenchantedItem(tester, filteredSourceItems, desiredItem)

    this.SetupItemOrigins(filteredSourceItems)

    let itemList = new ItemCombineList(filteredSourceItems)

    this.MakeAllCombinations(tester, itemList, desiredItem, feedbackHandler)

    return {
      combinedItems: itemList.GetCombinedItems(),
      maxProgress: itemList.GetMaxProgress()
    }
  }


  // ======== PRIVATE ========


  DropNonMatchingSourceItems(tester, sourceItems, desiredItem) {
    let filteredSourceItems = []
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr) {
      let sourceItem = sourceItems[itemNr]
      if (tester.TargetIsRelevant(sourceItem, desiredItem))
        filteredSourceItems.push(sourceItem)
    }

    return filteredSourceItems
  }


  DropUnusedEnchantsFromItems(sourceItems, desiredItem) {
    desiredItem.DropUnusedEnchants()
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr)
      sourceItems[itemNr].DropUnusedEnchants()
  }


  SetupItemOrigins(sourceItems) {
    let zeroOrigin = new ZeroOrigin(sourceItems)

    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr) {
      let item = sourceItems[itemNr]
      item.origin = zeroOrigin.CreateOrigin(itemNr, item.count)
    }
  }


  // Grades the given combined items; returns:
  // -1: previousItem is constructed better
  // +1: newItem is constructed better
  //  0: it's a mixed bag
  //
  // Used to optimize adding items: if one item is identical to
  // something we already have in both type and enchants, then
  // we can dedupe these and toss the one that:
  // - has the same or a superset of the same origins, and
  // - has the same or a higher priorWork, and
  // - has the same or higher totalCost
  GradeCombinedItems(previousItem, newItem) {
    if (
      previousItem.totalCost <= newItem.totalCost &&
      previousItem.priorWork <= newItem.priorWork &&
      previousItem.origin.IsSubsetOf(newItem.origin)
    )
      return -1
    else if (
      newItem.totalCost <= previousItem.totalCost &&
      newItem.priorWork <= previousItem.priorWork &&
      newItem.origin.IsSubsetOf(previousItem.origin)
    )
      return +1
    else
      return 0
  }


  ProcessItemCombination(tester, item1, item2, desiredItem, itemList) {
    let combinedItem = this.CombineItems(tester, item1, item2, desiredItem)

    itemList.ProcessItem(combinedItem, this.GradeCombinedItems)
  }


  MakeAllCombinations(tester, itemList, desiredItem, feedbackHandler) {
    let nextItems = {}
    while (itemList.GetNextItems(nextItems)) {
      if (feedbackHandler.TimeForFeedback())
        feedbackHandler.TellProgress(
          itemList.GetCurrentProgress(),
          itemList.GetMaxProgress()
        )

      this.ProcessItemCombination(tester, nextItems.item1, nextItems.item2, desiredItem, itemList)
      if (nextItems.item1 !== nextItems.item2)
        // Optimization: no need reversing the same item onto itself
        this.ProcessItemCombination(tester, nextItems.item2, nextItems.item1, desiredItem, itemList)
    }
  }


  InsertExtraUnenchantedItem(tester, sourceItems, desiredItem) {
    let hasEnchants = desiredItem.enchantsByID.size > 0
    if (
      !desiredItem.info.isBook &&
      hasEnchants &&
      !tester.UnenchantedSourcePresent(sourceItems, desiredItem)
    ) {
      let extraItem = new Item(
        1,
        g_extra,
        desiredItem.info.id,
        0
      )
      sourceItems.push(extraItem)
    }
  }


  CombineEnchants(tester, targetItem, sacrificeItem, combineResult) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      let enchantCombiner = new EnchantCombiner(targetItem, sacrificeItem, enchantInfo)
      if (
        targetItem.info.CanHaveEnchant(enchantInfo.id) &&
        enchantCombiner.isRelevant
      ) {
        if (tester.EnchantConflictsForItem(enchantInfo, targetItem))
          // Java: conflicts cost nonetheless
          // Bedrock: no penalty on conflicts
          ++combineResult.cost
        else {
          let enchantCombineResult = enchantCombiner.Combine()

          if (enchantCombineResult.targetUsed)
            combineResult.targetUsed = true
          if (enchantCombineResult.sacrificeUsed)
            combineResult.sacrificeUsed = true
          combineResult.enchantsByID.set(enchantInfo.id, new Enchant(enchantInfo.id, enchantCombineResult.combinedLevel))
          combineResult.cost += enchantCombineResult.cost
        }
      }
    }
  }


  // returns int
  PriorWorkToCost(priorWork) {
    return (1 << priorWork) - 1
  }


  // returns Item (the combined item, or undefined if they couldn't be combined)
  CombineItems(tester, targetItem, sacrificeItem, desiredItem) {
    let combinedItem = undefined

    if (
      tester.TargetIsRelevant(targetItem, desiredItem) &&
      tester.ItemsCompatible(targetItem, sacrificeItem)
    ) {
      let combineResult = new CombineResult()
      let numCombines = targetItem.origin.DetermineMaxCombineCount(sacrificeItem.origin)
      if (numCombines > 0) {
        this.CombineEnchants(tester, targetItem, sacrificeItem, combineResult)

        combineResult.cost +=
          this.PriorWorkToCost(targetItem.priorWork) +
          this.PriorWorkToCost(sacrificeItem.priorWork)

        if (
          !tester.CombineIsWasteful(targetItem, combineResult.targetUsed, sacrificeItem, combineResult.sacrificeUsed) &&
          combineResult.cost <= this.maxCost
        ) {
          let combinedPriorWork = Math.max(targetItem.priorWork, sacrificeItem.priorWork) + 1

          combinedItem = new Item(
            numCombines,
            g_combined,
            targetItem.info.id,
            combinedPriorWork
          )

          combinedItem.enchantsByID = combineResult.enchantsByID
          combinedItem.targetItem = targetItem
          combinedItem.sacrificeItem = sacrificeItem
          combinedItem.origin = targetItem.origin.Combine(sacrificeItem.origin)
          combinedItem.cost = combineResult.cost
          combinedItem.totalCost = combineResult.cost
          if (targetItem.set === g_combined)
            combinedItem.totalCost += targetItem.totalCost
          if (sacrificeItem.set === g_combined)
            combinedItem.totalCost += sacrificeItem.totalCost
        }
      }
    }

    return combinedItem
  }
}
