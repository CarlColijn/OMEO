function CreateTestSet(setDescription, testContainerID, setLetter) {
  jazil.AddTestSet(omeoPage, `ItemRow - ${setDescription} style`, {
    'Template row is not real': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)

      jazil.ShouldBe(templateRowDetails.row.IsReal(), false)
    },

    'New row is real': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let itemRow = CreateItemRow(templateRowDetails, undefined, 2)

      jazil.ShouldBe(itemRow.IsReal(), true)
    },

    'Create new row without item from template': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let itemRow = CreateItemRow(templateRowDetails, undefined, 6)

      let details = GetItemRowDetails(itemRow.rowElemJQ, set)
      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 6, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? undefined : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set === g_source ? 1 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, set !== g_combined ? 'Book' : undefined, 'type is off!')
      jazil.ShouldBe(details.priorWork, set === g_source ? 0 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, set !== g_combined ? '' : undefined, 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, set !== g_combined ? '' : undefined, 'enchant levels are off!')
    },

    'Create new row with item from template': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let item = BuildItem({ name:'Pickaxe', nr:5, count:9, priorWork:2, cost:15 })
      let itemRow = CreateItemRow(templateRowDetails, item)

      let details = GetItemRowDetails(itemRow.rowElemJQ, set)
      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 5, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 15 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 9 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Pickaxe', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 2 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, set !== g_combined ? '' : undefined, 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, set !== g_combined ? '' : undefined, 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Pickaxe', set), true, 'added row is not present!')
    },

    'Create new row with item+enchants from template': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      // Note: enchantments are re-ordered in alphabetical order
      let item = BuildItem({ name:'Turtle Shell', nr:15, count:1, priorWork:4, cost:9, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] })
      let itemRow = CreateItemRow(templateRowDetails, item)

      let details = GetItemRowDetails(itemRow.rowElemJQ, set)
      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 15, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 9 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 1 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Turtle Shell', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 4 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, 'MendingUnbreaking', 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, '13', 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Turtle Shell', set), true, 'added row is not present!')
    },

    'Retrieve item from row': (jazil) => {
      let set = GetSet(setLetter)
      if (set === g_combined)
        jazil.SkipTest()

      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      // Note: enchantments are re-ordered in alphabetical order
      let item = BuildItem({ name:'Shears', nr:31, count:2, priorWork:5, cost:3, enchants:[{ name:'Unbreaking', level:1 }, { name:'Efficiency', level:2 }] })
      let itemRow = CreateItemRow(templateRowDetails, item)

      let itemDetails = itemRow.GetItem()
      let retrievedItem = itemDetails.item
      let enchantNames = ''
      let enchantLevels = ''
      retrievedItem.enchantsByID.forEach((enchant) => {
        if (enchant !== undefined) {
          enchantNames += enchant.info.name
          enchantLevels += enchant.level
        }
      })

      jazil.ShouldBe(itemDetails.withErrors, false, 'row says there were count errors!')
      jazil.ShouldBe(templateRowDetails.ShowCountInputError.called, false, 'count error callback is called!')
      jazil.ShouldBe(retrievedItem.set, set, 'set is off!')
      jazil.ShouldBe(retrievedItem.nr, item.nr, 'nr is off!')
      jazil.ShouldBe(retrievedItem.cost, 0, 'cost is set!')
      jazil.ShouldBe(retrievedItem.count, set === g_source ? item.count : 1, 'count is off!')
      jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'type is off!')
      jazil.ShouldBe(retrievedItem.priorWork, set === g_source ? item.priorWork : 0, 'priorWork is off!')
      jazil.ShouldBe(enchantNames, 'EfficiencyUnbreaking', 'enchant names are off!')
      jazil.ShouldBe(enchantLevels, '21', 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Shears', set), true, 'added row is not present!')
    },

    'Count input errors get registered': (jazil) => {
      let set = GetSet(setLetter)
      if (set !== g_source)
        jazil.SkipTest()

      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let item = BuildItem({ name:'Book', nr:25, count:23, priorWork:5, cost:3, enchants:[{ name:'Projectile Protection', level:1 }] })
      let itemRow = CreateItemRow(templateRowDetails, item)

      // Update the item row's count to something non-numeric.
      // Just empty is the most cross-browser way to do so.
      itemRow.rowElemJQ.find('[name=count]').val('')

      let itemDetails = itemRow.GetItem()
      let retrievedItem = itemDetails.item
      let enchantNames = ''
      let enchantLevels = ''
      retrievedItem.enchantsByID.forEach((enchant) => {
        if (enchant !== undefined) {
          enchantNames += enchant.info.name
          enchantLevels += enchant.level
        }
      })

      jazil.ShouldBe(itemDetails.withErrors, true, 'row says there were no count errors!')
      jazil.ShouldBe(templateRowDetails.ShowCountInputError.called, true, 'count error callback is not called!')
      jazil.ShouldBe(retrievedItem.set, set, 'set is off!')
      jazil.ShouldBe(retrievedItem.nr, item.nr, 'nr is off!')
      jazil.ShouldBe(retrievedItem.cost, 0, 'cost is set!')
      jazil.ShouldBe(retrievedItem.count, set === g_source ? NaN : 1, 'count is off!')
      jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'type is off!')
      jazil.ShouldBe(retrievedItem.priorWork, set === g_source ? item.priorWork : 0, 'priorWork is off!')
      jazil.ShouldBe(enchantNames, 'Projectile Protection', 'enchant names are off!')
      jazil.ShouldBe(enchantLevels, '1', 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Book', set), true, 'added row is not present!')
    },

    'Added row count is OK': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let numRowsPre = $(`#${testContainerID} tr.item`).length
      let item1 = BuildItem({ name:'Chestplate', nr:10, count:14, priorWork:4, cost:3 })
      let item2 = BuildItem({ name:'Shovel', nr:11, count:15, priorWork:5, cost:4 })
      let item3 = BuildItem({ name:'Bow', nr:12, count:16, priorWork:6, cost:5 })
      let itemRow1 = CreateItemRow(templateRowDetails, item1)
      let itemRow2 = CreateItemRow(templateRowDetails, item2)
      let itemRow3 = CreateItemRow(templateRowDetails, item3)
      let numRowsPost = $(`#${testContainerID} tr.item`).length
      jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
    },

    'Rows can be removed': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let item1 = BuildItem({ name:'Elytra', nr:20, count:19, priorWork:3, cost:13 })
      let item2 = BuildItem({ name:'Trident', nr:21, count:18, priorWork:2, cost:14 })
      let item3 = BuildItem({ name:'Shield', nr:22, count:17, priorWork:1, cost:15 })
      let itemRow1 = CreateItemRow(templateRowDetails, item1)
      let itemRow2 = CreateItemRow(templateRowDetails, item2)
      let itemRow3 = CreateItemRow(templateRowDetails, item3)
      let numRowsPre = $(`#${testContainerID} tr.item`).length
      itemRow2.Remove()
      let numRowsPost = $(`#${testContainerID} tr.item`).length

      jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Trident', set), false, 'removed row is still present!')
    },

    'Item nr can be changed': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      // Note: enchantments are re-ordered in alphabetical order
      let item = BuildItem({ name:'Chestplate', nr:1, count:4, priorWork:5, cost:3, enchants:[{ name:'Protection', level:2 }, { name:'Thorns', level:3 }] })
      let itemRow = CreateItemRow(templateRowDetails, item)
      itemRow.SetNumber(8)
      let details = GetItemRowDetails(itemRow.rowElemJQ, set)

      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 8, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 3 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 4 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Chestplate', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 5 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, 'ProtectionThorns', 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, '23', 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Chestplate', set), true, 'changed row is not present anymore!')
    },

    'Item count can be changed': (jazil) => {
      let set = GetSet(setLetter)
      if (set !== g_source)
        jazil.SkipTest()

      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      // Note: enchantments are re-ordered in alphabetical order
      let item = BuildItem({ name:'Crossbow', nr:31, count:1, priorWork:3, cost:6 })
      let itemRow = CreateItemRow(templateRowDetails, item)
      itemRow.SetCount(5)
      let details = GetItemRowDetails(itemRow.rowElemJQ, set)

      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 31, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 6 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 5 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Crossbow', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 3 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, set !== g_combined ? '' : undefined, 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, set !== g_combined ? '' : undefined, 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Crossbow', set), true, 'changed row is not present anymore!')
    },

    'Item can get extra enchants': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let item = BuildItem({ name:'Flint & Steel', nr:28, count:1, priorWork:0, cost:8 })
      let itemRow = CreateItemRow(templateRowDetails, item)
      // Note: enchantments are ordered in addition order
      itemRow.AddEnchant(BuildEnchant('Unbreaking', 2))
      itemRow.AddEnchant(BuildEnchant('Mending', 1))
      let details = GetItemRowDetails(itemRow.rowElemJQ, set)

      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 28, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 8 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 1 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Flint & Steel', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 0 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, 'UnbreakingMending', 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, '21', 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Flint & Steel', set), true, 'changed row is not present anymore!')
    },

    'Item enchants can be removed': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let item = BuildItem({ name:'Fishing Rod', nr:26, count:3, priorWork:2, cost:1 })
      let itemRow = CreateItemRow(templateRowDetails, item)
      // Note: enchantments are ordered in addition order
      itemRow.AddEnchant(BuildEnchant('Unbreaking', 2))
      itemRow.AddEnchant(BuildEnchant('Lure', 3))
      itemRow.RemoveEnchants()
      let details = GetItemRowDetails(itemRow.rowElemJQ, set)

      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 26, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 1 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 3 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Fishing Rod', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 2 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, set !== g_combined ? '' : undefined, 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, set !== g_combined ? '' : undefined, 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Fishing Rod', set), true, 'changed row is not present anymore!')
    },

    'Item can be changed': (jazil) => {
      let set = GetSet(setLetter)
      let templateRowDetails = GetItemTemplateRow(testContainerID, set)
      let item = BuildItem({ name:'Hoe', nr:3, count:2, priorWork:1, cost:7, enchants:[{ name:'Unbreaking', level:2 }, { name:'Fortune', level:3 }] })
      let itemRow = CreateItemRow(templateRowDetails, item)
      // Note: enchantments are re-ordered in alphabetical order
      let updatedItem = BuildItem({ name:'Helmet', nr:3, count:6, priorWork:4, cost:5, enchants:[{ name:'Blast Protection', level:4 }, { name:'Aqua Affinity', level:1 }] })
      itemRow.SetItem(updatedItem)
      let details = GetItemRowDetails(itemRow.rowElemJQ, set)

      jazil.ShouldBe(itemRow.set, set, 'set is off!')
      jazil.ShouldBe(details.nr, 3, 'nr is off!')
      jazil.ShouldBe(details.cost, set === g_combined ? 5 : undefined, 'cost is off!')
      jazil.ShouldBe(details.count, set !== g_desired ? 6 : undefined, 'count is off!')
      jazil.ShouldBe(details.type, 'Helmet', 'type is off!')
      jazil.ShouldBe(details.priorWork, set !== g_desired ? 4 : undefined, 'priorWork is off!')
      jazil.ShouldBe(details.enchantNames, 'Aqua AffinityBlast Protection', 'enchant names are off!')
      jazil.ShouldBe(details.enchantLevels, '14', 'enchant levels are off!')
      jazil.ShouldBe(ItemRowInTable(testContainerID, 'Helmet', set), true, 'changed row is not present anymore!')
    },

  })
}


CreateTestSet('source', 'sourceItemRow', 's')
CreateTestSet('desired', 'desiredItemRow', 'd')
CreateTestSet('combine', 'combinesItemRow', 'c')
