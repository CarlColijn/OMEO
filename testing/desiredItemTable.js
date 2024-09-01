function GetDesiredItemTable() {
  return new DesiredItemTable($('#desiredItemTable'))
}




jazil.AddTestSet(mainPage, 'DesiredItemTable', {
  'Table is initialized correctly': (jazil) => {
    let table = GetDesiredItemTable()

    jazil.ShouldBe(table.tableElemJQ.find('tr.template.item').length, 0, 'template row found!')
    jazil.ShouldBe(table.tableElemJQ.find('tr.item').length, 1, 'wrong number of rows by default!')
  },

  'Setting items works': (jazil) => {
    let table = GetDesiredItemTable()

    let testItem = BuildItem({ set:g_desired, name:'Shield', count:2, priorWork:3 })

    let numRowsPre = table.tableElemJQ.find('tr.item').length
    table.SetItem(testItem)
    let numRowsPost = table.tableElemJQ.find('tr.item').length

    jazil.ShouldBe(numRowsPost - numRowsPre, 0, 'rows got added!')

    jazil.ShouldBe(DesiredItemRowInTable('desiredItemTable', testItem), true, 'New shield not in table!')

    let rowElemJQ = $(table.tableElemJQ.find('tr.item')[0])
    let itemRow = new DesiredItemRow(rowElemJQ)
    let retrievedItem = itemRow.GetItem().item

    // augment the retrieved item's data since g_desired item tables only
    // return a subset of the data
    retrievedItem.count = testItem.count
    retrievedItem.priorWork = testItem.priorWork

    TestItemListsMatch(jazil, [testItem], 'test', [retrievedItem], 'retrieved')
  },

  'Getting items back works': (jazil) => {
    let table = GetDesiredItemTable()

    let testItem = BuildItem({ set:g_desired, name:'Chestplate' })

    table.SetItem(testItem)
    let collectedItemDetails = table.GetItem(new ItemCollector(false))
    jazil.ShouldBe(collectedItemDetails.withCountErrors, false, 'table says there were count errors!')
    jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 0, 'count error elements are reported!')
    jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')

    let retrievedItem = collectedItemDetails.items[0]
    TestItemListsMatch(jazil, [testItem], 'test', [retrievedItem], 'retrieved')
  },

})
