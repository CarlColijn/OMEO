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


  RegisterItemCombinations(tester, item1, item2, desiredItem, itemList) {
    let combinedItem1 = this.CombineItems(tester, item1, item2, desiredItem)

    // In case of identical items, we do not need to reverse the combination.
    let combinedItem2 =
      item1 === item2 ?
      undefined :
      this.CombineItems(tester, item2, item1, desiredItem)

    if (
      combinedItem1 !== undefined && combinedItem2 !== undefined &&
      combinedItem1.Hash(true) == combinedItem2.Hash(true)
    ) {
      if (combinedItem1.cost < combinedItem2.cost)
        combinedItem2 = undefined
      else
        combinedItem1 = undefined
    }

    if (combinedItem1 !== undefined)
      itemList.AddCombinedItem(combinedItem1)
    if (combinedItem2 !== undefined)
      itemList.AddCombinedItem(combinedItem2)
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

      this.RegisterItemCombinations(tester, nextItems.item1, nextItems.item2, desiredItem, itemList)
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
