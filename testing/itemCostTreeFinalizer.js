// returns Item
function CreateTestTree() {
  // Note: ItemCostTreeFinalizer doesn't do anything with any of item's
  // properties except for set, cost and totalCost. We therefore don't
  // bother adding these either.

  let BuildOurItem = (intermediate, cost, totalCost) => {
    return BuildItem({ name:'Sword', set:intermediate?g_combined:g_source, cost:cost, totalCost:totalCost, rename:'' })
  }

  let item = BuildOurItem(true, 12, 6)
    let itemT = BuildOurItem(true, 5, 3)
    item.targetItem = itemT
      let itemTT = BuildOurItem(true, 7, 22)
      itemT.targetItem = itemTT
        let itemTTT = BuildOurItem(false, 6, 51)
        itemTT.targetItem = itemTTT
        let itemTTS = BuildOurItem(false, 21, 27)
        itemTT.sacrificeItem = itemTTS
      let itemTS = BuildOurItem(true, 3, 33)
      itemT.sacrificeItem = itemTS
        let itemTST = BuildOurItem(false, 1, 11)
        itemTS.targetItem = itemTST
        let itemTSS = BuildOurItem(false, 12, 33)
        itemTS.sacrificeItem = itemTSS
    let itemS = BuildOurItem(true, 6, 2)
    item.sacrificeItem = itemS
      let itemST = BuildOurItem(true, 38, 101)
      itemS.targetItem = itemST
        let itemSTT = BuildOurItem(false, 17, 23)
        itemST.targetItem = itemSTT
        let itemSTS = BuildOurItem(false, 12, 33)
        itemST.sacrificeItem = itemSTS
      let itemSS = BuildOurItem(false, 12, 33)
      itemS.sacrificeItem = itemSS

  return item
}


function CompareItemCosts(jazil, item, clone, renameItem, description) {
  jazil.ShouldBe(clone.cost, item.cost, `${description} cost not correct!`)
  jazil.ShouldBe(clone.totalCost, item.totalCost, `${description} totalCost not correct!`)
  if (item.set === g_combined)
    jazil.ShouldBe(clone.renamePoint, item === renameItem ? true : false, `${description} renamePoint not correct!`)
}


function CompareItemTreeCosts(jazil, item, clone, renameItem, description) {
  CompareItemCosts(jazil, item, clone, renameItem, description)
  if (item.targetItem !== undefined)
    CompareItemTreeCosts(jazil, item.targetItem, clone.targetItem, renameItem, description + 'T')
  if (item.sacrificeItem !== undefined)
    CompareItemTreeCosts(jazil, item.sacrificeItem, clone.sacrificeItem, renameItem, description + 'S')
}


function MarkRenamePoint(itemPath) {
  itemPath.forEach((item) => {
    item.includesRename = true
  })
  itemPath[0].renamePoint = true
}


function CorrectCost(itemPath) {
  itemPath.forEach((item) => {
    item.cost += 1
    item.totalCost += 1
  })
}


jazil.AddTestSet(mainPage, 'ItemCostTreeFinalizer', {
  'Initialized correctly': (jazil) => {
    let item = BuildItem({ name:'Axe' })
    let finalizer = new ItemCostTreeFinalizer(item)

    jazil.ShouldBe(finalizer.item, item, 'Incorrect item present on new finalizer!')
  },

  'Item tree without rename gets finalized OK': (jazil) => {
    let item = CreateTestTree()
    let finalizer = new ItemCostTreeFinalizer(item)
    let cloneR = finalizer.UpdateCostsForRename()

    CompareItemTreeCosts(jazil, item, cloneR, undefined, 'item')
  },

  'Item tree with one renamePoint gets finalized OK, #1': (jazil) => {
    let item = CreateTestTree()
    let renamePath = [item.targetItem.targetItem, item.targetItem, item]
    MarkRenamePoint(renamePath)
    let finalizer = new ItemCostTreeFinalizer(item)
    let cloneR = finalizer.UpdateCostsForRename()

    CorrectCost(renamePath)
    CompareItemTreeCosts(jazil, item, cloneR, renamePath[0], 'item')
  },

  'Item tree with one renamePoint gets finalized OK, #2': (jazil) => {
    let item = CreateTestTree()
    let renamePath = [item.sacrificeItem, item]
    MarkRenamePoint(renamePath)
    let finalizer = new ItemCostTreeFinalizer(item)
    let cloneR = finalizer.UpdateCostsForRename()

    CorrectCost(renamePath)
    CompareItemTreeCosts(jazil, item, cloneR, renamePath[0], 'item')
  },

  'Item tree with all set to renamePoint gets finalized OK': (jazil) => {
    let item = CreateTestTree()
    // this is the cheapest one
    let lowestCostRenamePath = [item.targetItem.sacrificeItem, item.targetItem, item]
    let allRenamePaths = [
      [item],
      [item, item.targetItem],
      [item, item.targetItem, item.targetItem.targetItem],
      lowestCostRenamePath,
      [item, item.sacrificeItem],
      [item, item.sacrificeItem, item.targetItem]
    ]
    allRenamePaths.forEach((renamePath) => {
      MarkRenamePoint(renamePath)
    })
    let finalizer = new ItemCostTreeFinalizer(item)
    let cloneR = finalizer.UpdateCostsForRename()

    CorrectCost(lowestCostRenamePath)
    CompareItemTreeCosts(jazil, item, cloneR, lowestCostRenamePath[0], 'item')
  },

})
