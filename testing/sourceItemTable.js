function GetSourceItemTable() {
  let CallbackHandlerMock = {
    click: () => {}
  }

  return new SourceItemTable($('#sourceItemTable'), CallbackHandlerMock)
}




jazil.AddTestSet(mainPage, 'SourceItemTable', {
  'Table is initialized correctly': (jazil) => {
    let table = GetSourceItemTable()

    jazil.ShouldBe(table.HasItems(), false, 'table is not empty!')
    jazil.ShouldBe(table.tableElemJQ.find('tr.template.item').length, 1, 'no template row found!')
    jazil.ShouldBe(table.tableElemJQ.find('tr.item').length, 1, 'wrong number of rows by default!')
  },

  'Adding an empty row works': (jazil) => {
    let table = GetSourceItemTable()

    let numRowsPre = table.tableElemJQ.find('tr.item').length
    let newRow = table.AddRow()
    let numRowsPost = table.tableElemJQ.find('tr.item').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 1, 'wrong number of rows added!')
    jazil.ShouldBe(table.HasItems(), true, 'table is empty!')

    let newRowDetails = GetSourceItemRowDetails(newRow.elemJQ, g_source)
    jazil.ShouldBe(newRowDetails.nr, 1, 'wrong row nrs assigned!')
  },

  'Setting items works': (jazil) => {
    let table = GetSourceItemTable()

    let testItem1 = BuildItem({ set:g_source, name:'Shield', count:2, priorWork:3 })
    let testItem2 = BuildItem({ set:g_source, name:'Helmet', count:3, priorWork:4, enchants:[{ name:'Aqua Affinity', level:1 }, { name:'Unbreaking', level:3 }] })
    let testItem3 = BuildItem({ set:g_source, name:'Boots', count:4, priorWork:5 })
    let testItems = [
      testItem1,
      testItem2,
      testItem3,
    ]

    let numRowsPre = table.tableElemJQ.find('tr.item').length
    table.SetItems(testItems)
    let numRowsPost = table.tableElemJQ.find('tr.item').length

    // Note: the previous test left 1 row in there
    jazil.ShouldBe(numRowsPost - numRowsPre, 3 - 1, 'wrong number of rows added!')
    jazil.ShouldBe(table.HasItems(), true, 'table is empty!')

    jazil.ShouldBe(SourceItemRowInTable('sourceItemTable', testItem1), true, 'New shield not in table!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemTable', testItem2), true, 'New helmet not in table!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemTable', testItem3), true, 'New boots not in table!')

    retrievedItems = []
    table.tableElemJQ.find('tr.item').each((rowNr, rowElem) => {
      let rowElemJQ = $(rowElem)
      if (!rowElemJQ.hasClass('template')) {
        let itemRow = new SourceItemRow(rowElemJQ, false)
        retrievedItems.push(itemRow.GetItem().item)
      }
    })

    TestItemListsMatch(jazil, testItems, 'test', retrievedItems, 'retrieved')
  },

  'Clearing items works': (jazil) => {
    let table = GetSourceItemTable()

    let testItem1 = BuildItem({ set:g_source, name:'Shield', count:2, priorWork:3 })
    let testItem2 = BuildItem({ set:g_source, name:'Helmet', count:3, priorWork:4, enchants:[{ name:'Aqua Affinity', level:1 }, { name:'Unbreaking', level:3 }] })
    let testItems = [
      testItem1,
      testItem2
    ]

    let numRowsPre = table.tableElemJQ.find('tr.item').length
    table.SetItems(testItems)
    table.SetItems([])
    let numRowsPost = table.tableElemJQ.find('tr.item').length

    // Note: the previous test left 3 rows in there
    jazil.ShouldBe(numRowsPost - numRowsPre, 0 - 3, 'rows are still present!')
    jazil.ShouldBe(table.HasItems(), false, 'table is not empty!')

    jazil.ShouldBe(SourceItemRowInTable('sourceItemTable', testItem1), false, 'New shield still in table!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemTable', testItem2), false, 'New helmet still in table!')
  },

  'Getting items back works': (jazil) => {
    let table = GetSourceItemTable()

    let testItems = [
      BuildItem({ set:g_source, name:'Chestplate', count:12, priorWork:1 }),
      BuildItem({ set:g_source, name:'Sword', count:13, priorWork:2, enchants:[{ name:'Smite', level:2 }, { name:'Looting', level:3 }] }),
      BuildItem({ set:g_source, name:'Leggings', count:14, priorWork:3 }),
    ]

    table.SetItems(testItems)
    let collectedItemDetails = table.ExtractItems(new ItemCollector(false))

    jazil.ShouldBe(collectedItemDetails.withCountErrors, false, 'table says there were count errors!')
    jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')
    TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved')
  },

  'Merging items when retrieving works': (jazil) => {
    let table = GetSourceItemTable()

    let testItems = [
      BuildItem({ set:g_source, name:'Book', count:1, priorWork:2 }),
      BuildItem({ set:g_source, name:'Book', count:5, priorWork:3, enchants:[{ name:'Smite', level:2 }, { name:'Looting', level:3 }] }),
      // 3 to be merged with 1
      BuildItem({ set:g_source, name:'Book', count:10, priorWork:2 }),
      BuildItem({ set:g_source, name:'Book', count:50, priorWork:1 }),
      // 5 to be merged with 2; reversed enchant order as extra test
      BuildItem({ set:g_source, name:'Book', count:5, priorWork:3, enchants:[{ name:'Looting', level:3 }, { name:'Smite', level:2 }] }),
    ]

    table.SetItems(testItems)
    let collectedItemDetails = table.ExtractItems(new ItemCollector(true))

    jazil.ShouldBe(collectedItemDetails.withCountErrors, false, 'table says there were count errors!')
    jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(collectedItemDetails.mergedItems, true, 'Items not marked as merged!')

    // merge the mergeable items ourselves first to compare them properly
    // 2 <= 5
    testItems[1].count += testItems[4].count
    testItems.splice(4, 1)
    // 1 <= 3
    testItems[0].count += testItems[2].count
    testItems.splice(2, 1)

    TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved')
  },

  'Explicitly not merging items when retrieving works': (jazil) => {
    let table = GetSourceItemTable()

    let testItems = [
      BuildItem({ set:g_source, name:'Sword', count:1, priorWork:2 }),
      BuildItem({ set:g_source, name:'Sword', count:5, priorWork:3, enchants:[{ name:'Smite', level:1 }, { name:'Mending', level:1 }] }),
      // 3 can be merged with 1
      BuildItem({ set:g_source, name:'Sword', count:10, priorWork:2 }),
      BuildItem({ set:g_source, name:'Sword', count:50, priorWork:1 }),
      // 5 can be merged with 2; reversed enchant order as extra test
      BuildItem({ set:g_source, name:'Sword', count:5, priorWork:3, enchants:[{ name:'Mending', level:1 }, { name:'Smite', level:1 }] }),
    ]

    table.SetItems(testItems)
    let collectedItemDetails = table.ExtractItems(new ItemCollector(false))

    jazil.ShouldBe(collectedItemDetails.withCountErrors, false, 'table says there were count errors!')
    jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')

    TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved')
  },

  'Errors in counts get returned when retrieving items': (jazil) => {
    let table = GetSourceItemTable()

    let testItems = [
      BuildItem({ set:g_source, name:'Boots', count:1, priorWork:1 }),
      BuildItem({ set:g_source, name:'Boots', count:2, priorWork:1, enchants:[{ name:'Protection', level:3 }, { name:'Feather Falling', level:1 }] }),
      BuildItem({ set:g_source, name:'Boots', count:5, priorWork:1 }),
    ]

    table.SetItems(testItems)

    // Update the middle item row's count to something non-numeric.
    // Just empty is the most cross-browser way to do so.
    // (note: the template row comes only after the real rows, so index is ok)
    $(table.tableElemJQ.find('[name=count]')[1]).val('')
    let collectedItemDetails = table.ExtractItems(new ItemCollector(false))

    jazil.ShouldBe(collectedItemDetails.withCountErrors, true, 'table says there were no count errors!')
    jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 1, 'incorrect count error elements are reported!')
    jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')

    // Update the test item to reflect the NaN state.
    testItems[1].count = NaN

    TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved')
  },

})
