/*
  Oracle for divining up all possible item combinations.

  Prerequisites:
  - dataSets.js
  - enchantConflicts.js
  - enchantDetails.js
  - item.js
  - enchant.js
  - itemOrigins.js

  Defined classes:
  - Oracle
*/
class Oracle {
  // optionally inserts an extra unenchanted version of the desired item
  InsertExtraItem(sourceItems, desiredItem) {
    // look if the desired item is an enchanted tool
    if (!desiredItem.details.isBook && Object.keys(desiredItem.enchantsByID).length > 0) {
      // yes -> look if an unenchanted version is present
      let unenchantedItemPresent = false
      for (let itemNr = 0; itemNr < sourceItems.length && !unenchantedVersionPresent; ++itemNr) {
        let sourceItem = sourceItems[itemNr]
        unenchantedVersionPresent =
          sourceItem.details === desiredItem.details &&
          Object.keys(sourceItem.enchantsByID).length == 0
      }
      if (!unenchantedVersionPresent) {
        // no -> add one now
        let extraItem = new Item(
          g_extra,
          desiredItem.details.id,
          sourceItems.length + 1,
          0
        )
        sourceItems.push(extraItem)
      }
    }
  }


  // tells whether the given enchant conflicts with the given target item's enchants
  EnchantsConflict(enchantID, targetItem) {
    // check if any of the target's existing enchants conflicts
    for (let targetEnchantID in targetItem.enchantsByID)
      if (g_enchantIDConflicts[enchantID][targetEnchantID])
        // yep -> we're done
        return true

    // and it's not a conflict if we came this far
    return false
  }


  // combines the enchants of the given items
  // returns an object with the outcome;
  // .enchantLevels: the combined enchant levels
  // .targetUsed: whether the target's enchants got used
  // .sacrificeUsed: whether the sacrifice's enchants got used
  // .cost: the enchant combine cost
  CombineEnchants(targetItem, sacrificeItem) {
    // start the result
    let enchantsByID = {}
    let result = {
      'targetUsed': false,
      'sacrificeUsed': false,
      'enchantsByID': enchantsByID,
      'cost': 0
    }

    // process all enchants
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      // look if the enchant is even an option here
      let enchantDetails = g_enchantDetails[enchantNr]
      if (targetItem.details.enchantsAllowedByID[enchantDetails.id] !== undefined) {
        // yes -> look if this enchant is relevant
        let targetEnchant = targetItem.enchantsByID[enchantDetails.id]
        let onTarget = targetEnchant !== undefined
        let sacrificeEnchant = sacrificeItem.enchantsByID[enchantDetails.id]
        let onSacrifice = sacrificeEnchant !== undefined
        if (onTarget || onSacrifice) {
          // yes -> look what situation we're in
          if (this.EnchantsConflict(enchantDetails.id, targetItem))
            // it's a conflict -> someone's gotta pay for that
            // Bedrock: no penalty on conflicts
            ++result.cost
          else {
            // it's combinable -> get the usage stats of this enchant
            let targetLevel = onTarget ? targetEnchant.level : 0
            let sacrificeLevel = onSacrifice ? sacrificeEnchant.level : 0

            // look what final level it's going to have and what got used in the process
            let enchantLevel = 0
            let multiplierItem = undefined
            if (targetLevel < sacrificeLevel) {
              enchantLevel = sacrificeLevel
              result.sacrificeUsed = true
              multiplierItem = sacrificeItem
            }
            else if (targetLevel > sacrificeLevel) {
              enchantLevel = targetLevel
              result.targetUsed = true
              multiplierItem = targetItem
            }
            else {
              enchantLevel = Math.min(targetLevel + 1, enchantDetails.maxLevel)
              result.targetUsed = enchantLevel > targetLevel
              result.sacrificeUsed = enchantLevel > sacrificeLevel
              multiplierItem = targetItem
            }

            // create the combined enchant
            let enchant = new Enchant(enchantDetails.id, enchantLevel)
            result.enchantsByID[enchant.id] = enchant

            // and denote what the combine has cost
            let multiplier =
              multiplierItem.details.isBook ?
              enchantDetails.bookMultiplier :
              enchantDetails.toolMultiplier
            // Bedrock: do not multiply with the final level, but with
            // the level increase on the target item instead
            result.cost += enchant.level * multiplier
          }
        }
      }
    }

    // and we're done with it
    return result
  }


  // gets the cost associated with the given prior work penalty
  PriorWorkToCost(work) {
    return (1 << work) - 1
  }


  // combines the given items
  // returns the combined item, or undefined if the items are not compatible
  CombineItems(targetItem, sacrificeItem, desiredItem, newItemNr) {
    // look if the target item is compatible with the desired item
    let combinedItem = undefined
    let canCombine =
      targetItem.details.isBook ||
      targetItem.details === desiredItem.details
    if (canCombine) {
      // yes -> look if the target and sacrifice items are compatible
      canCombine =
        targetItem.details.isBook ? (
          sacrificeItem.details.isBook // we can only add books to books
        ) : (
          sacrificeItem.details.isBook || // we can always add books to anything
          sacrificeItem.details === targetItem.details // or combine items of the same type
        );
      if (canCombine) {
        // yes -> look if the items have an origin conflict
        canCombine = !targetItem.origin.ConflictsWith(sacrificeItem.origin)
        if (canCombine) {
          // no -> combine their enchants
          let enchantCombine = this.CombineEnchants(targetItem, sacrificeItem)

          // look if that was wastefull
          let wastefull = true
          if (!targetItem.details.isBook && sacrificeItem.details.isBook)
            // ... book-on-tool: we only care if the book's enchants got used;
            // if the tool's enchants went unused we just replaced all enchants
            // on the tool, which is perfectly fine
            wastefull = !enchantCombine.sacrificeUsed
          else
            // ... tool-on-tool or book-on-book; if either didn't get used it's
            // just a waste of that item (book or tool)
            wastefull = !enchantCombine.targetUsed || !enchantCombine.sacrificeUsed
          canCombine = !wastefull
          if (canCombine) {
            // no -> look if this item is too expensive
            let cost =
              enchantCombine.cost +
              this.PriorWorkToCost(targetItem.priorWork) +
              this.PriorWorkToCost(sacrificeItem.priorWork)
            canCombine = cost <= 39
            if (canCombine) {
              // no -> build the combine item
              let priorWork = Math.max(targetItem.priorWork, sacrificeItem.priorWork) + 1
              combinedItem = new Item(
                g_combined,
                targetItem.details.id,
                newItemNr,
                priorWork
              )
              combinedItem.enchantsByID = enchantCombine.enchantsByID
              combinedItem.targetItem = targetItem
              combinedItem.sacrificeItem = sacrificeItem
              combinedItem.origin = targetItem.origin.Combine(sacrificeItem.origin)
              combinedItem.cost = cost
              combinedItem.totalCost = cost
              if (targetItem.set == g_combined)
                combinedItem.totalCost += targetItem.totalCost
              if (sacrificeItem.set == g_combined)
                combinedItem.totalCost += sacrificeItem.totalCost
            }
          }
        }
      }
    }

    // and return the combined item
    return canCombine ? combinedItem : undefined
  }


  // divines all possible item combinations from the given data
  // returns the new combined items
  Divine(data) {
    // drop all unused enchants from all items
    data.desiredItem.DropUnusedEnchants()
    for (let itemNr = 0; itemNr < data.sourceItems.length; ++itemNr) {
      let item = data.sourceItems[itemNr]
      item.DropUnusedEnchants()
    }

    // set up the zero origin
    let zeroOrigin = new ZeroOrigin(data.sourceItems.length)

    // mark their origins
    for (let itemNr = 0; itemNr < data.sourceItems.length; ++itemNr) {
      let item = data.sourceItems[itemNr]
      item.origin = zeroOrigin.CreateOrigin(itemNr)
    }

    // start the combined items
    let combinedItems = []
    let nextCombinedItemNr = data.sourceItems.length + 1

    // start with the source items as the first pool
    let allItems = data.sourceItems.slice()
    let prevItems = data.sourceItems

    // determine all combinations
    let addedCombinedItem = true
    for (let createPoolNr = 1; createPoolNr < 10 && addedCombinedItem; ++createPoolNr) {
      // make a start with this pool's new items
      let newItems = []

      // combine all of the previous pool's items with all other items in existance
      for (let prevItemNr = 0; prevItemNr < prevItems.length; ++prevItemNr) {
        // get this item
        let prevItem = prevItems[prevItemNr]

        // and combine it to all other existing items
        for (let allItemNr = 0; allItemNr < allItems.length; ++allItemNr) {
          // get this old item
          let allItem = allItems[allItemNr]

          // and combine them
          let newItem = this.CombineItems(prevItem, allItem, data.desiredItem, nextCombinedItemNr)
          if (newItem !== undefined) {
            // done -> use it
            newItems.push(newItem)
            combinedItems.push(newItem)
            ++nextCombinedItemNr
          }
        }
      }

      // add the new items now that we processed all items
      for (let itemNr = 0; itemNr < newItems.length; ++itemNr)
        allItems.push(newItems[itemNr])

      // and note which items we just created
      prevItems = newItems
    }

    // and return all combined items
    return combinedItems
  }
}
