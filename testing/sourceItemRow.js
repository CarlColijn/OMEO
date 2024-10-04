function GetSourceItemTemplateRow() {
  return new SourceItemRowTemplate($('#sourceItemRow .template.item'), false)
}


function CreateSourceItemRow(templateRow, item, nr) {
  return templateRow.CreateNew(nr ?? 1, item, false, undefined)
}


function GetSourceItemRowDetails(itemRowElemJQ) {
  let MakeNumberSafe = (numberElemJQ) => {
    let value = numberElemJQ.text()
    return value === '' ? undefined : parseInt(value)
  }

  let nr = MakeNumberSafe(itemRowElemJQ.find('.nr'))

  let countElemJQ = itemRowElemJQ.find('[name=count]')
  let count = parseInt(countElemJQ.val())

  let typeElemJQ = itemRowElemJQ.find('[name=itemID]')
  let typeID = typeElemJQ.val()
  typeID = typeID === undefined ? undefined : parseInt(typeID)
  let type = g_itemInfosByID.get(typeID).name

  let priorWorkElemJQ = itemRowElemJQ.find('.priorWorkInput .selectedButton')
  let priorWork = parseInt(priorWorkElemJQ.val())

  let enchantNames = ''
  itemRowElemJQ.find('[name=enchantID]').each((inputNr, inputElem) => {
    let inputElemJQ = $(inputElem)
    let rowElemJQ = inputElemJQ.parent().parent()
    if (rowElemJQ.attr('data-real') != 0) {
      let enchantID = parseInt(inputElemJQ.val())
      if (enchantNames != '')
        enchantNames += '/'
      enchantNames += g_enchantInfosByID.get(enchantID).name
    }
  })

  let enchantLevels = ''
  itemRowElemJQ.find('.levelInput .selectedButton').each((inputNr, inputElem) => {
    let inputElemJQ = $(inputElem)
    let rowElemJQ = inputElemJQ.parent().parent()
    if (rowElemJQ.attr('data-real') != 0) {
      if (enchantLevels != '')
        enchantLevels += '/'
      enchantLevels += parseInt(inputElemJQ.val()) + 1
    }
  })

  return {
    'nr': nr,
    'count': count,
    'type': type,
    'priorWork': priorWork,
    'enchantNames': enchantNames,
    'enchantLevels': enchantLevels
  }
}


function SourceItemRowInTable(testContainerID, item) {
  let foundRow = false
  $(`#${testContainerID} tr.item`).each((rowNr, itemRowElem) => {
    let itemRowElemJQ = $(itemRowElem)
    let details = GetSourceItemRowDetails(itemRowElemJQ)
    if (details.type == item.info.name) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




jazil.AddTestSet(mainPage, 'SourceItemRow', {
  'Template row is not real': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()

    jazil.ShouldBe(templateRow.IsReal(), false)
  },

  'New row is real': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Book', count:1, priorWork:4, cost:5 })
    let itemRow = CreateSourceItemRow(templateRow, item)

    jazil.ShouldBe(itemRow.IsReal(), true)
  },

  'Create new row without item from template': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let itemRow = CreateSourceItemRow(templateRow, undefined, 6)

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 6, 'nr is off!')
    jazil.ShouldBe(details.count, 1, 'count is off!')
    jazil.ShouldBe(details.type, 'Axe', 'name is off!')
    jazil.ShouldBe(details.priorWork, 0, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
  },

  'Create new row with item from template': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Pickaxe', count:9, priorWork:2, cost:15 })
    let itemRow = CreateSourceItemRow(templateRow, item, 5)

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 5, 'nr is off!')
    jazil.ShouldBe(details.count, 9, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 2, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'added row is not present!')
  },

  'Create new row with item+enchants from template': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_source, name:'Turtle Shell', count:1, priorWork:4, cost:9, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] })
    let itemRow = CreateSourceItemRow(templateRow, item, 15)

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 15, 'nr is off!')
    jazil.ShouldBe(details.count, 1, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 4, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, 'Mending/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/3', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'added row is not present!')
  },

  'Retrieve item from row': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_source, name:'Shears', count:2, priorWork:5, cost:3, enchants:[{ name:'Unbreaking', level:1 }, { name:'Efficiency', level:2 }] })
    let itemRow = CreateSourceItemRow(templateRow, item, 31)

    let itemDetails = itemRow.GetItem()
    let retrievedItem = itemDetails.item
    let enchantNames = ''
    let enchantLevels = ''
    retrievedItem.enchantsByID.forEach((enchant) => {
      if (enchant !== undefined) {
        if (enchantNames != '') {
          enchantNames += '/'
          enchantLevels += '/'
        }
        enchantNames += enchant.info.name
        enchantLevels += enchant.level
      }
    })

    jazil.ShouldBe(itemDetails.withCountError, false, 'row says there were count errors!')
    jazil.ShouldBe(itemDetails.withEnchantConflict, false, 'row says there were enchant conflicts!')
    jazil.ShouldBe(itemDetails.withEnchantDupe, false, 'row says there were enchant dupes!')
    jazil.ShouldBe(itemDetails.countErrorElemJQ, undefined, 'row reports a DOM element in error!')
    jazil.ShouldBe(retrievedItem.set, g_source, 'set is off!')
    jazil.ShouldBe(retrievedItem.nr, 31, 'nr is off!')
    jazil.ShouldBe(retrievedItem.cost, 0, 'cost is set!')
    jazil.ShouldBe(retrievedItem.count, item.count, 'count is off!')
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(retrievedItem.priorWork, item.priorWork, 'priorWork is off!')
    jazil.ShouldBe(enchantNames, 'Efficiency/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '2/1', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'added row is not present!')
  },

  'Count input errors get registered': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Book', count:23, priorWork:5, cost:3, enchants:[{ name:'Projectile Protection', level:1 }] })
    let itemRow = CreateSourceItemRow(templateRow, item, 25)

    // Update the item row's count to something non-numeric.
    // Just empty is the most cross-browser way to do so.
    itemRow.elemJQ.find('[name=count]').val('')

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

    jazil.ShouldBe(itemDetails.withCountError, true, 'row says there were no count errors!')
    jazil.ShouldNotBe(itemDetails.countErrorElemJQ, undefined, 'row reports no DOM element in error!')
    jazil.ShouldBe(retrievedItem.set, g_source, 'set is off!')
    jazil.ShouldBe(retrievedItem.nr, 25, 'nr is off!')
    jazil.ShouldBe(retrievedItem.cost, 0, 'cost is set!')
    jazil.ShouldBe(retrievedItem.count, NaN, 'count is off!')
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(retrievedItem.priorWork, item.priorWork, 'priorWork is off!')
    jazil.ShouldBe(enchantNames, 'Projectile Protection', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '1', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'added row is not present!')
  },

  'Enchant conflicts get registered': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Leggings', count:23, priorWork:5, cost:3, enchants:[{ name:'Fire Protection', level:1 }, { name:'Blast Protection', level:1 }] })
    let itemRow = CreateSourceItemRow(templateRow, item, 63)

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

    jazil.ShouldBe(itemDetails.withEnchantConflict, true, 'row says there were no enchant conflicts!')
    jazil.ShouldNotBe(itemDetails.enchantConflictInfo?.inputElemJQ, undefined, 'row reports no DOM element in error!')
    jazil.ShouldBe(retrievedItem.set, g_source, 'set is off!')
    jazil.ShouldBe(retrievedItem.nr, 63, 'nr is off!')
    jazil.ShouldBe(retrievedItem.cost, 0, 'cost is set!')
    jazil.ShouldBe(retrievedItem.count, item.count, 'count is off!')
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(retrievedItem.priorWork, item.priorWork, 'priorWork is off!')
    jazil.ShouldBe(enchantNames, 'Blast ProtectionFire Protection', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '11', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'added row is not present!')
  },

  'Enchant dupes get registered': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Pumpkin', count:23, priorWork:5, cost:3, enchants:[] })
    let itemRow = CreateSourceItemRow(templateRow, item, 46)
    let enchant = new Enchant(g_enchantIDsByName.get('Curse of Vanishing'), 1)
    itemRow.AddEnchant(enchant)
    itemRow.AddEnchant(enchant)

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

    jazil.ShouldBe(itemDetails.withEnchantDupe, true, 'row says there were no enchant dupes!')
    jazil.ShouldNotBe(itemDetails.enchantDupeElemJQ, undefined, 'row reports no DOM element in error!')
    jazil.ShouldBe(retrievedItem.set, g_source, 'set is off!')
    jazil.ShouldBe(retrievedItem.nr, 46, 'nr is off!')
    jazil.ShouldBe(retrievedItem.cost, 0, 'cost is set!')
    jazil.ShouldBe(retrievedItem.count, item.count, 'count is off!')
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(retrievedItem.priorWork, item.priorWork, 'priorWork is off!')
    jazil.ShouldBe(enchantNames, 'Curse of Vanishing', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '1', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let numRowsPre = $('#sourceItemRow tr.item').length
    let item1 = BuildItem({ set:g_source, name:'Chestplate', count:14, priorWork:4, cost:3 })
    let item2 = BuildItem({ set:g_source, name:'Shovel', count:15, priorWork:5, cost:4 })
    let item3 = BuildItem({ set:g_source, name:'Bow', count:16, priorWork:6, cost:5 })
    let itemRow1 = CreateSourceItemRow(templateRow, item1)
    let itemRow2 = CreateSourceItemRow(templateRow, item2)
    let itemRow3 = CreateSourceItemRow(templateRow, item3)
    let numRowsPost = $('#sourceItemRow tr.item').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

  'Rows can be removed': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item1 = BuildItem({ set:g_source, name:'Elytra', count:19, priorWork:3, cost:13 })
    let item2 = BuildItem({ set:g_source, name:'Trident', count:18, priorWork:2, cost:14 })
    let item3 = BuildItem({ set:g_source, name:'Shield', count:17, priorWork:1, cost:15 })
    let itemRow1 = CreateSourceItemRow(templateRow, item1)
    let itemRow2 = CreateSourceItemRow(templateRow, item2)
    let itemRow3 = CreateSourceItemRow(templateRow, item3)
    let numRowsPre = $('#sourceItemRow tr.item').length
    itemRow2.Remove()
    let numRowsPost = $('#sourceItemRow tr.item').length

    jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item2), false, 'removed row is still present!')
  },

  'Item nr can be changed': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_source, name:'Chestplate', count:4, priorWork:5, cost:3, enchants:[{ name:'Protection', level:2 }, { name:'Thorns', level:3 }] })
    let itemRow = CreateSourceItemRow(templateRow, item, 1)
    itemRow.SetNumber(8)

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 8, 'nr is off!')
    jazil.ShouldBe(details.count, 4, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 5, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, 'Protection/Thorns', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '2/3', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'changed row is not present anymore!')
  },

  'Item count can be changed': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_source, name:'Crossbow', count:1, priorWork:3, cost:6 })
    let itemRow = CreateSourceItemRow(templateRow, item, 31)
    itemRow.SetCount(5)

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 31, 'nr is off!')
    jazil.ShouldBe(details.count, 5, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 3, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'changed row is not present anymore!')
  },

  'Item can get extra enchants': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Flint & Steel', count:1, priorWork:0, cost:8 })
    let itemRow = CreateSourceItemRow(templateRow, item, 28)
    // Note: enchantments are ordered in addition order
    itemRow.AddEnchant(BuildEnchant('Unbreaking', 2))
    itemRow.AddEnchant(BuildEnchant('Mending', 1))

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 28, 'nr is off!')
    jazil.ShouldBe(details.count, 1, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 0, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, 'Unbreaking/Mending', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '2/1', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'changed row is not present anymore!')
  },

  'Item enchants can be removed': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Fishing Rod', count:3, priorWork:2, cost:1 })
    let itemRow = CreateSourceItemRow(templateRow, item, 26)
    // Note: enchantments are ordered in addition order
    itemRow.AddEnchant(BuildEnchant('Unbreaking', 2))
    itemRow.AddEnchant(BuildEnchant('Lure', 3))
    itemRow.RemoveEnchants()

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.nr, 26, 'nr is off!')
    jazil.ShouldBe(details.count, 3, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 2, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', item), true, 'changed row is not present anymore!')
  },

  'Item can be changed': (jazil) => {
    let templateRow = GetSourceItemTemplateRow()
    let item = BuildItem({ set:g_source, name:'Hoe', count:2, priorWork:1, cost:7, enchants:[{ name:'Unbreaking', level:2 }, { name:'Fortune', level:3 }] })
    let itemRow = CreateSourceItemRow(templateRow, item, 3)
    // Note: enchantments are re-ordered in alphabetical order
    let updatedItem = BuildItem({ set:g_source, name:'Helmet', count:6, priorWork:4, cost:5, enchants:[{ name:'Blast Protection', level:4 }, { name:'Aqua Affinity', level:1 }] })
    itemRow.SetItem(updatedItem)

    let details = GetSourceItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.count, 6, 'count is off!')
    jazil.ShouldBe(details.type, updatedItem.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, 4, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, 'Aqua Affinity/Blast Protection', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/4', 'enchant levels are off!')
    jazil.ShouldBe(SourceItemRowInTable('sourceItemRow', updatedItem), true, 'changed row is not present anymore!')
  },

})