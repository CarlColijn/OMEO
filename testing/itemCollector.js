// returns ItemRow[]
function CreateItemRows(templateRowDetails, items, jumpNrs) {
  let itemRows = []
  for (let itemNr = 0; itemNr < items.length; ++itemNr) {
    let rowNr = 1 + (jumpNrs ? itemNr * 2 : itemNr)
    itemRows.push(CreateItemRow(templateRowDetails, items[itemNr], rowNr))
  }

  return itemRows
}


// returns ItemCollectorResult
function ProcessItemRows(itemRows, mergeRows) {
  let collector = new ItemCollector(mergeRows)
  for (let itemNr = 0; itemNr < itemRows.length; ++itemNr)
    collector.ProcessRow(itemRows[itemNr])
  return collector.Finalize()
}


jazil.AddTestSet(omeoPage, 'ItemCollector', {
  'Processing rows without issues goes OK': (jazil) => {
    let templateRowDetails = GetItemTemplateRow('collectingItemRow', g_source)

    let testItems = [
      BuildItem({ name:'Chestplate', count:12, priorWork:1 }),
      BuildItem({ name:'Sword', count:13, priorWork:2, enchants:[{ name:'Smite', level:2 }, { name:'Looting', level:3 }] }),
      BuildItem({ name:'Leggings', count:14, priorWork:3 }),
    ]

    let itemRows = CreateItemRows(templateRowDetails, testItems, false)
    let result = ProcessItemRows(itemRows, false)

    jazil.ShouldBe(result.withCountErrors, false, 'collector says there were count errors!')
    jazil.ShouldBe(result.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(result.mergedItems, false, 'Items marked as merged!')
    jazil.ShouldBe(result.rowsToUpdateNr.length, 0, 'Wrong number of rows marked to update nr!')
    jazil.ShouldBe(result.rowsToUpdateCount.length, 0, 'Wrong number of rows marked to update count!')
    jazil.ShouldBe(result.rowsToRemove.length, 0, 'Wrong number of rows marked to remove!')
    jazil.ShouldBe(result.itemsByRow.size, 0, 'Wrong number of rows-to-items returned!')
  },

  'Faulty row numbers get corrected': (jazil) => {
    let templateRowDetails = GetItemTemplateRow('collectingItemRow', g_source)

    let testItems = [
      BuildItem({ name:'Hoe', count:3, priorWork:1 }),
      BuildItem({ name:'Axe', count:4, priorWork:2, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] }),
      BuildItem({ name:'Shield', count:5, priorWork:3 }),
    ]

    let itemRows = CreateItemRows(templateRowDetails, testItems, true)
    let result = ProcessItemRows(itemRows, false)

    jazil.ShouldBe(result.withCountErrors, false, 'collector says there were count errors!')
    jazil.ShouldBe(result.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(result.mergedItems, false, 'Items marked as merged!')
    jazil.ShouldBe(result.rowsToUpdateNr.length, 2, 'Wrong number of rows marked to update nr!')
    jazil.ShouldBe(result.rowsToUpdateCount.length, 0, 'Wrong number of rows marked to update count!')
    jazil.ShouldBe(result.rowsToRemove.length, 0, 'Wrong number of rows marked to remove!')
    jazil.ShouldBe(result.itemsByRow.size, 2, 'Wrong number of rows-to-items returned!')

    jazil.ShouldBe(result.rowsToUpdateNr[0], itemRows[1], 'Wrong updated row for 2nd row!')
    jazil.ShouldBe(result.rowsToUpdateNr[0].nr, 2, 'Wrong updated row nr for 2nd row!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateNr[0]).HashTypeAndPriorWork(), testItems[1].HashTypeAndPriorWork(), 'Wrong updated item for 2nd row!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateNr[0]).nr, 2, 'Wrong updated item nr for 2nd row!')
    jazil.ShouldBe(result.rowsToUpdateNr[1], itemRows[2], 'Wrong updated row for 3rd row!')
    jazil.ShouldBe(result.rowsToUpdateNr[1].nr, 3, 'Wrong updated row nr for 3rd row!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateNr[1]).HashTypeAndPriorWork(), testItems[2].HashTypeAndPriorWork(), 'Wrong updated item for 3rd row!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateNr[1]).nr, 3, 'Wrong updated item nr for 3rd row!')
  },

  'Merging items works': (jazil) => {
    let templateRowDetails = GetItemTemplateRow('collectingItemRow', g_source)

    let testItems = [
      BuildItem({ name:'Book', tag:1, count:1, priorWork:2 }),
      BuildItem({ name:'Book', tag:2, count:5, priorWork:3, enchants:[{ name:'Smite', level:2 }, { name:'Looting', level:3 }] }),
      // 3 to be merged with 1
      BuildItem({ name:'Book', tag:3, count:10, priorWork:2 }),
      BuildItem({ name:'Book', tag:4, count:50, priorWork:1 }),
      // 5 to be merged with 2; reversed enchant order as extra test
      BuildItem({ name:'Book', tag:5, count:100, priorWork:3, enchants:[{ name:'Looting', level:3 }, { name:'Smite', level:2 }] }),
    ]

    let itemRows = CreateItemRows(templateRowDetails, testItems, false)

    // mimick what the merge has done to compare the result
    testItems[0].count += testItems[2].count
    testItems[1].count += testItems[4].count
    testItems[3].tag = 3
    mergedTestItems = [
      testItems[0],
      testItems[1],
      testItems[3]
    ]

    let result = ProcessItemRows(itemRows, true)

    jazil.ShouldBe(result.withCountErrors, false, 'collector says there were count errors!')
    jazil.ShouldBe(result.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(result.mergedItems, true, 'Items not marked as merged!')
    jazil.ShouldBe(result.rowsToUpdateNr.length, 1, 'Wrong number of rows marked to update nr!')
    jazil.ShouldBe(result.rowsToUpdateCount.length, 2, 'Wrong number of rows marked to update count!')
    jazil.ShouldBe(result.rowsToRemove.length, 2, 'Wrong number of rows marked to remove!')
    jazil.ShouldBe(result.itemsByRow.size, 5, 'Wrong number of rows-to-items returned!')

    jazil.ShouldBe(result.rowsToUpdateNr[0], itemRows[3], 'Wrong updated row for 3rd row!')
    jazil.ShouldBe(result.rowsToUpdateNr[0].nr, 3, 'Wrong updated row nr for 3rd row!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateNr[0]).HashTypeAndPriorWork(), mergedTestItems[2].HashTypeAndPriorWork(), 'Wrong updated item for 3rd row!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateNr[0]).nr, 3, 'Wrong updated item nr for 3rd row!')

    jazil.ShouldBe(result.rowsToUpdateCount[0], itemRows[0], 'Wrong 1st item row marked to update!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateCount[0]).HashTypeAndPriorWork(), result.items[0].HashTypeAndPriorWork(), 'Wrong 1st item marked to update!')
    jazil.ShouldBe(result.items[0].count, mergedTestItems[0].count, 'Wrong 1st merged item count!')
    jazil.ShouldBe(result.rowsToUpdateCount[1], itemRows[1], 'Wrong 2nd item row marked to update!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToUpdateCount[1]).HashTypeAndPriorWork(), result.items[1].HashTypeAndPriorWork(), 'Wrong 2nd item marked to update!')
    jazil.ShouldBe(result.items[1].count, mergedTestItems[1].count, 'Wrong 2nd merged item count!')

    jazil.ShouldBe(result.rowsToRemove[0], itemRows[2], 'Wrong 1st item row marked to remove!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToRemove[0]).HashTypeAndPriorWork(), testItems[2].HashTypeAndPriorWork(), 'Wrong 1st item marked to remove!')
    jazil.ShouldBe(result.rowsToRemove[1], itemRows[4], 'Wrong 2nd item row marked to remove!')
    jazil.ShouldBe(result.itemsByRow.get(result.rowsToRemove[1]).HashTypeAndPriorWork(), testItems[4].HashTypeAndPriorWork(), 'Wrong 2nd item marked to remove!')

    TestItemListsMatch(jazil, mergedTestItems, 'test', result.items, 'retrieved', g_source)
  },

  'Explicitly not merging items works': (jazil) => {
    let templateRowDetails = GetItemTemplateRow('collectingItemRow', g_source)

    let testItems = [
      BuildItem({ name:'Sword', tag:1, count:1, priorWork:2 }),
      BuildItem({ name:'Sword', tag:2, count:5, priorWork:3, enchants:[{ name:'Smite', level:1 }, { name:'Mending', level:1 }] }),
      // 3 can be merged with 1
      BuildItem({ name:'Sword', tag:3, count:10, priorWork:2 }),
      BuildItem({ name:'Sword', tag:4, count:50, priorWork:1 }),
      // 5 can be merged with 2; reversed enchant order as extra test
      BuildItem({ name:'Sword', tag:5, count:5, priorWork:3, enchants:[{ name:'Mending', level:1 }, { name:'Smite', level:1 }] }),
    ]

    let itemRows = CreateItemRows(templateRowDetails, testItems, false)
    let result = ProcessItemRows(itemRows, false)

    jazil.ShouldBe(result.withCountErrors, false, 'collector says there were count errors!')
    jazil.ShouldBe(result.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(result.mergedItems, false, 'Items marked as merged!')
    jazil.ShouldBe(result.rowsToUpdateNr.length, 0, 'Wrong number of rows marked to update nr!')
    jazil.ShouldBe(result.rowsToUpdateCount.length, 0, 'Wrong number of rows marked to update!')
    jazil.ShouldBe(result.rowsToRemove.length, 0, 'Wrong number of rows marked to remove!')
    jazil.ShouldBe(result.itemsByRow.size, 0, 'Wrong number of rows-to-items returned!')

    jazil.ShouldBe(result.items[0].count, testItems[0].count, 'Wrong 1st merged item row count!')
    jazil.ShouldBe(result.items[1].count, testItems[1].count, 'Wrong 2nd merged item row count!')

    TestItemListsMatch(jazil, testItems, 'test', result.items, 'retrieved', g_source)
  },

  'Errors in counts get returned': (jazil) => {
    let templateRowDetails = GetItemTemplateRow('collectingItemRow', g_source)

    let testItems = [
      BuildItem({ name:'Boots', tag:1, count:1, priorWork:1 }),
      BuildItem({ name:'Boots', tag:2, count:2, priorWork:1, enchants:[{ name:'Protection', level:3 }, { name:'Feather Falling', level:1 }] }),
      BuildItem({ name:'Boots', tag:3, count:5, priorWork:1 }),
    ]

    let itemRows = CreateItemRows(templateRowDetails, testItems, false)

    // Update the middle item row's count to something non-numeric.
    // Just empty is the most cross-browser way to do so.
    // (note: index 0 is the template row)
    $(itemRows[1].rowElemJQ.find('[name=count]')).val('')

    // Update the test item to reflect the expected value for count.
    testItems[1].count = NaN

    let result = ProcessItemRows(itemRows, false)

    jazil.ShouldBe(result.withCountErrors, true, 'collector says there were no count errors!')
    jazil.ShouldBe(result.countErrorElemJQs.length, 1, 'incorrect count error elements are reported!')
    jazil.ShouldBe(result.mergedItems, false, 'Items marked as merged!')
    jazil.ShouldBe(result.rowsToUpdateNr.length, 0, 'Wrong number of rows marked to update nr!')
    jazil.ShouldBe(result.rowsToUpdateCount.length, 0, 'Wrong number of rows marked to update!')
    jazil.ShouldBe(result.rowsToRemove.length, 0, 'Wrong number of rows marked to remove!')

    TestItemListsMatch(jazil, testItems, 'test', result.items, 'retrieved', g_source)
  },

})
