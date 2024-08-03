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
  // returns Item[]
  GetAllItemCombinations(sourceItems, desiredItem, feedbackHandler) {
    let tester = new ItemCombineTester()

    let filteredSourceItems = this.DropNonMatchingSourceItems(tester, sourceItems, desiredItem)

    this.DropUnusedEnchantsFromItems(filteredSourceItems, desiredItem)

    this.InsertExtraUnenchantedItem(tester, filteredSourceItems, desiredItem)

    this.SetupItemOrigins(filteredSourceItems)

    return this.MakeAllCombinations(tester, filteredSourceItems, desiredItem, feedbackHandler)
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
  // -1: item1 is constructed better
  // +1: item2 is constructed better
  // 0: it's a mixed bag
  GradeCombinedItems(item1, item2) {
    if (
      item1.totalCost <= item2.totalCost &&
      item1.priorWork <= item2.priorWork &&
      item1.origin.IsSubsetOf(item2.origin)
    )
      return -1
    else if (
      item2.totalCost <= item1.totalCost &&
      item2.priorWork <= item1.priorWork &&
      item2.origin.IsSubsetOf(item1.origin)
    )
      return +1
    else
      return 0
  }

  // Returns bool (whether the combination is useful)
  CheckCombinationUseful(combinedItem, combinedItemHash, allItemsByHash) {
    if (!allItemsByHash.has(combinedItemHash))
      // Haven't seen this combination yet, so useful
      return true

    // Optimization: if the new item is identical to something we already
    // have in both type and enchants, then we can dedupe these and toss
    // the one that:
    // - has the same or a superset of the same origins, and
    // - has the same or a higher priorWork, and
    // - has the same or higher totalCost
    let otherCombinedItems = allItemsByHash.get(combinedItemHash)

    return otherCombinedItems.every((previousItem) => {
      let grade = this.GradeCombinedItems(previousItem, combinedItem)

      if (grade == -1)
        // This previous item is constructed better, so we can discard
        // the new one.  We can also stop checking, since other previous
        // items will not be worse than the new one either.
        return false

      if (grade == +1) {
        // We are constructed better; we can discard the previous one and all it's
        // decendants.
        // TO IMPLEMENT
      }

      return true
    })
  }


  RegisterItemCombination(tester, item1, item2, desiredItem, combineProgress) {
    let combinedItem = this.CombineItems(tester, item1, item2, desiredItem)
    if (combinedItem === undefined)
      return

    let combinedItemHash = combinedItem.Hash(false, false)
    if (this.CheckCombinationUseful(combinedItem, combinedItemHash, combineProgress.allItemsByHash))
      combineProgress.AddCombinedItem(combinedItem, combinedItemHash)
  }


  // returns Item[] (the combined items)
  MakeAllCombinations(tester, sourceItems, desiredItem, feedbackHandler) {
    let itemList = new ItemCombineList(sourceItems)

    let nextItems = {}
    while (itemList.GetNextItems(nextItems)) {
      if (feedbackHandler.TimeForFeedback())
        feedbackHandler.TellProgress(
          itemList.GetCurrentProgress(),
          itemList.GetMaxProgress()
        )

      this.RegisterItemCombination(tester, nextItems.item1, nextItems.item2, desiredItem, itemList)
      if (nextItems.item1 !== nextItems.item2)
        // Optimization: no need reversing the same item onto itself
        this.RegisterItemCombination(tester, nextItems.item2, nextItems.item1, desiredItem, itemList)
    }

    return itemList.GetCombinedItems()
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
          combineResult.cost <= 39
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
