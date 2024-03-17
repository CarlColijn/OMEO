/*
  Combines all given items to get all possible item combinations.

  Prerequisites:
  - dataSets.js
  - enchantConflicts.js
  - enchantInfo.js
  - item.js
  - itemNrGenerator.js
  - enchant.js
  - itemOrigins.js
  - enchantCombiner.js
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
  GetAllItemCombinations(sourceItems, desiredItem) {
    let tester = new ItemCombineTester()

    let itemNrGenerator = new ItemNrGenerator(sourceItems)

    let filteredSourceItems = this.DropNonMatchingSourceItems(tester, sourceItems, desiredItem)

    this.DropUnusedEnchantsFromItems(filteredSourceItems, desiredItem)

    this.InsertExtraUnenchantedItem(tester, filteredSourceItems, desiredItem, itemNrGenerator)

    this.SetupItemOrigins(filteredSourceItems)

    return this.MakeAllCombinations(tester, filteredSourceItems, desiredItem, itemNrGenerator)
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


  // returns object;
  // - item1: Item (or undefined)
  // - item2: Item (or undefined)
  PickBestItemCombinations(item1, item2) {
    if (item1 !== undefined && item2 !== undefined) {
      if (item1.Hash(true) == item2.Hash(true)) {
        if (item1.cost < item2.cost)
          item2 = undefined
        else
          item1 = undefined
      }
    }

    return {
      item1: item1,
      item2: item2
    }
  }


  RegisterItemCombinations(tester, item1, item2, desiredItem, allItems, combinedItems, itemNrGenerator) {
    let combination1 = this.CombineItems(tester, item1, item2, desiredItem)
    let combination2 =
      item1 === item2?
      undefined: // no need reversing the same item onto itself
      this.CombineItems(tester, item2, item1, desiredItem)
    let newItems = this.PickBestItemCombinations(combination1, combination2)

    if (newItems.item1 !== undefined) {
      newItems.item1.nr = itemNrGenerator.Next()
      allItems.push(newItems.item1)
      combinedItems.push(newItems.item1)
    }
    if (newItems.item2 !== undefined) {
      newItems.item2.nr = itemNrGenerator.Next()
      allItems.push(newItems.item2)
      combinedItems.push(newItems.item2)
    }
  }


  // returns Item[] (the combined items)
  MakeAllCombinations(tester, sourceItems, desiredItem, itemNrGenerator) {
    /*
      Strategy: we process all items, combining them with all items that
      come before them.  New items are added at the back so that they
      in turn will automatically be picked up too in time.  The process
      stops out of itself once no new items can be added anymore, which
      should happen since at some point all low-level combinations have
      already been made and new combinations are just too costly due to
      the prior work penalty.
    */
    let allItems = sourceItems.slice()
    let combinedItems = []

    for (let item1Nr = 0; item1Nr < allItems.length; ++item1Nr) {
      let item1 = allItems[item1Nr]

      for (let item2Nr = 0; item2Nr <= item1Nr; ++item2Nr) {
        let item2 = allItems[item2Nr]

        this.RegisterItemCombinations(tester, item1, item2, desiredItem, allItems, combinedItems, itemNrGenerator)
      }
    }

    return combinedItems
  }


  InsertExtraUnenchantedItem(tester, sourceItems, desiredItem, itemNrGenerator) {
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
        itemNrGenerator.Next(),
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
            -1, // nr to be determined later
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
