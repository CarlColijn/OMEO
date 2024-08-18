function CreateTestSet(setDescription, testContainerID, setLetter) {
  jazil.AddTestSet(mainPage, `ItemTable - ${setDescription} style`, {
    'Table is initialized correctly': (jazil) => {
      let set = GetSet(setLetter)
      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let numExpectedRowsTotal = 1
      let numExpectedTemplateRows = set === g_desired ? 0 : 1

      jazil.ShouldBe(table.set, set, 'wrong set assigned!')
      jazil.ShouldBe(table.tableElemJQ.find('tr.template.item').length, numExpectedTemplateRows, 'no template row found!')
      jazil.ShouldBe(table.tableElemJQ.find('tr.item').length, numExpectedRowsTotal, 'wrong number of rows by default!')
    },

    'Adding a row works': (jazil) => {
      let set = GetSet(setLetter)
      if (set === g_desired)
        jazil.SkipTest()

      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let numRowsPre = table.tableElemJQ.find('tr.item').length
      let newRow = table.AddRow()
      let numRowsPost = table.tableElemJQ.find('tr.item').length
      jazil.ShouldBe(numRowsPost - numRowsPre, 1, 'wrong number of rows added!')

      if (set != g_combined) {
        let newRowDetails = GetItemRowDetails(newRow.rowElemJQ, set)
        jazil.ShouldBe(newRowDetails.nr, 1, 'wrong row nrs assigned!')
      }
    },

    'Setting items works': (jazil) => {
      let set = GetSet(setLetter)
      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let testItems = [
        BuildItem({ name:'Shield', count:2, priorWork:3, set:set }),
        BuildItem({ name:'Helmet', count:3, priorWork:4, set:set, enchants:[{ name:'Aqua Affinity', level:1 }, { name:'Unbreaking', level:3 }] }),
        BuildItem({ name:'Boots', count:4, priorWork:5, set:set }),
      ]

      let numRowsPre = table.tableElemJQ.find('tr.item').length
      table.SetItems(testItems)
      let numRowsPost = table.tableElemJQ.find('tr.item').length

      // Note: the previous test left a single unset row in there;
      let numRowsToAdd = 3
      let numItemRowsInTable = 3
      if (set !== g_desired)
        numRowsPre -= 1
      else {
        numRowsToAdd = 0
        numItemRowsInTable = 1
      }
      jazil.ShouldBe(numRowsPost - numRowsPre, numRowsToAdd, 'wrong number of rows added!')

      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Shield', set), true, 'New shield not in table!')
      if (set !== g_desired) {
        jazil.ShouldBe(ItemRowInTable(testContainerID, 'Helmet', set), true, 'New helmet not in table!')
        jazil.ShouldBe(ItemRowInTable(testContainerID, 'Boots', set), true, 'New boots not in table!')
      }

      if (set === g_source) {
        retrievedItems = []
        tableDetails.tableElemJQ.find('tr.item').each((rowNr, rowElem) => {
          let rowElemJQ = $(rowElem)
          if (!rowElemJQ.hasClass('template')) {
            let itemRow = new ItemRow(undefined, rowElemJQ, set, false)
            retrievedItems.push(itemRow.GetItem().item)
          }
        })

        TestItemListsMatch(jazil, testItems, 'test', retrievedItems, 'retrieved', set)
      }
      else if (set === g_desired) {
        let rowElemJQ = $(tableDetails.tableElemJQ.find('tr.item')[0])
        let itemRow = new ItemRow(undefined, rowElemJQ, set, false)
        let retrievedItem = itemRow.GetItem().item
        let testItem = testItems[0]

        // augment the retrieved item's data since g_desired item tables only
        // return a subset of the data
        retrievedItem.count = testItem.count
        retrievedItem.priorWork = testItem.priorWork

        TestItemListsMatch(jazil, [testItem], 'test', [retrievedItem], 'retrieved', set)
      }
    },

    'Getting items back works': (jazil) => {
      let set = GetSet(setLetter)
      if (set === g_combined)
        jazil.SkipTest()

      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let testItems = [
        BuildItem({ name:'Chestplate', count:12, priorWork:1, set:set }),
        BuildItem({ name:'Sword', count:13, priorWork:2, set:set, enchants:[{ name:'Smite', level:2 }, { name:'Looting', level:3 }] }),
        BuildItem({ name:'Leggings', count:14, priorWork:3, set:set }),
      ]

      table.SetItems(testItems)
      let collectedItemDetails = table.GetItems(new ItemCollector(false))
      jazil.ShouldBe(collectedItemDetails.withCountErrors, false, 'table says there were count errors!')
      jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 0, 'count error elements are reported!')
      jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')

      if (set === g_source)
        TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved', set)
      else if (set === g_desired) {
        // augment the retrieved item's data since g_desired item tables only
        // return a subset of the data
        let retrievedItem = collectedItemDetails.items[0]
        let testItem = testItems[0]
        retrievedItem.count = testItem.count
        retrievedItem.priorWork = testItem.priorWork

        TestItemListsMatch(jazil, [testItem], 'test', [retrievedItem], 'retrieved', set)
      }
    },

    'Merging items when retrieving works': (jazil) => {
      let set = GetSet(setLetter)
      if (set !== g_source)
        jazil.SkipTest()

      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let testItems = [
        BuildItem({ name:'Book', count:1, priorWork:2, set:set }),
        BuildItem({ name:'Book', count:5, priorWork:3, set:set, enchants:[{ name:'Smite', level:2 }, { name:'Looting', level:3 }] }),
        // 3 to be merged with 1
        BuildItem({ name:'Book', count:10, priorWork:2, set:set }),
        BuildItem({ name:'Book', count:50, priorWork:1, set:set }),
        // 5 to be merged with 2; reversed enchant order as extra test
        BuildItem({ name:'Book', count:5, priorWork:3, set:set, enchants:[{ name:'Looting', level:3 }, { name:'Smite', level:2 }] }),
      ]

      table.SetItems(testItems)
      let collectedItemDetails = table.GetItems(new ItemCollector(true))
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

      TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved', set)
    },

    'Explicitly not merging items when retrieving works': (jazil) => {
      let set = GetSet(setLetter)
      if (set !== g_source)
        jazil.SkipTest()

      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let testItems = [
        BuildItem({ name:'Sword', count:1, priorWork:2, set:set }),
        BuildItem({ name:'Sword', count:5, priorWork:3, set:set, enchants:[{ name:'Smite', level:1 }, { name:'Mending', level:1 }] }),
        // 3 can be merged with 1
        BuildItem({ name:'Sword', count:10, priorWork:2, set:set }),
        BuildItem({ name:'Sword', count:50, priorWork:1, set:set }),
        // 5 can be merged with 2; reversed enchant order as extra test
        BuildItem({ name:'Sword', count:5, priorWork:3, set:set, enchants:[{ name:'Mending', level:1 }, { name:'Smite', level:1 }] }),
      ]

      table.SetItems(testItems)
      let collectedItemDetails = table.GetItems(new ItemCollector(false))
      jazil.ShouldBe(collectedItemDetails.withCountErrors, false, 'table says there were count errors!')
      jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 0, 'count error elements are reported!')
      jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')

      TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved', set)
    },

    'Errors in counts get returned when retrieving items': (jazil) => {
      let set = GetSet(setLetter)
      if (set !== g_source)
        jazil.SkipTest()

      let tableDetails = GetItemTable(testContainerID, set)
      let table = tableDetails.table

      let testItems = [
        BuildItem({ name:'Boots', count:1, priorWork:1, set:set }),
        BuildItem({ name:'Boots', count:2, priorWork:1, set:set, enchants:[{ name:'Protection', level:3 }, { name:'Feather Falling', level:1 }] }),
        BuildItem({ name:'Boots', count:5, priorWork:1, set:set }),
      ]

      table.SetItems(testItems)
      // Update the middle item row's count to something non-numeric.
      // Just empty is the most cross-browser way to do so.
      // (note: index 0 is the template row)
      $(tableDetails.tableElemJQ.find('[name=count]')[2]).val('')
      let collectedItemDetails = table.GetItems(new ItemCollector(false))
      jazil.ShouldBe(collectedItemDetails.withCountErrors, true, 'table says there were no count errors!')
      jazil.ShouldBe(collectedItemDetails.countErrorElemJQs.length, 1, 'incorrect count error elements are reported!')
      jazil.ShouldBe(collectedItemDetails.mergedItems, false, 'Items marked as merged!')

      // Update the test item to reflect the NaN state.
      testItems[1].count = NaN

      TestItemListsMatch(jazil, testItems, 'test', collectedItemDetails.items, 'retrieved', set)
    },

  })
}


CreateTestSet('source', 'sourceItemTable', 's')
CreateTestSet('desired', 'desiredItemTable', 'd')
CreateTestSet('combined', 'combinesItemTable', 'c')
