function GetCombinedItemTemplateRow() {
  let CallbackHandlerMock = {
    click: () => {}
  }

  let templateRowElemJQ = $('#combinedItemRow .template.item')
  return new CombinedItemRowTemplate(CallbackHandlerMock, templateRowElemJQ)
}


function CreateCombinedItemRow(templateRow, item) {
  return templateRow.CreateNew(item)
}


function GetCombinedItemRowDetails(itemRowElemJQ) {
  let MakeNumberSafe = (numberElemJQ) => {
    let value = numberElemJQ.text()
    return value === '' ? undefined : parseInt(value)
  }

  let nr = MakeNumberSafe(itemRowElemJQ.find('.nr'))
  let cost = MakeNumberSafe(itemRowElemJQ.find('.cost'))
  let count = MakeNumberSafe(itemRowElemJQ.find('.count'))
  let typeDetails
  let type = itemRowElemJQ.find('.type').text()
  let detailsStart = type.indexOf(' (')
  if (detailsStart == -1)
    typeDetails = ''
  else {
    typeDetails = type.slice(detailsStart + 2, -1)
    type = type.slice(0, detailsStart)
  }
  let priorWork = MakeNumberSafe(itemRowElemJQ.find('.priorWork'))
  enchantNames = ''
  itemRowElemJQ.find('.enchant .name').each((enchantNr, nameElem) => {
    let nameElemJQ = $(nameElem)
    let rowElemJQ = nameElemJQ.parent().parent()
    if (rowElemJQ.attr('data-real') != 0) {
      if (enchantNames != '')
        enchantNames += '/'
      enchantNames += nameElemJQ.text()
    }
  })
  enchantLevels = ''
  itemRowElemJQ.find('.enchant .level').each((enchantNr, levelElem) => {
    let levelElemJQ = $(levelElem)
    let rowElemJQ = levelElemJQ.parent().parent()
    if (rowElemJQ.attr('data-real') != 0) {
      if (enchantLevels != '')
        enchantLevels += '/'
      enchantLevels += GetEnchantLevelFromGUIText(levelElemJQ.text())
    }
  })

  return {
    'nr': nr,
    'cost': cost,
    'count': count,
    'type': type,
    'typeDetails': typeDetails,
    'priorWork': priorWork,
    'enchantNames': enchantNames,
    'enchantLevels': enchantLevels
  }
}


function CombinedItemRowInTable(testContainerID, type, typeDetails) {
  let foundRow = false
  $(`#${testContainerID} tr.item`).each((rowNr, itemRowElem) => {
    let itemRowElemJQ = $(itemRowElem)
    let details = GetCombinedItemRowDetails(itemRowElemJQ)
    if (details.type == type && details.typeDetails == typeDetails) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}


// returns { type, typeDetails }
function GetCombinedTypeAndDetailsForItemInTable(item) {
  let type = item.info.name
  let typeDetails
  if (item.set === g_source)
    typeDetails = `source nr. ${item.nr}`
  else if (item.set === g_extra)
    typeDetails = 'extra'
  else
    typeDetails = ''

  return {
    type: type,
    typeDetails: typeDetails
  }
}




jazil.AddTestSet(mainPage, 'CombinedItemRow', {
  'Template row is not real': (jazil) => {
    let templateRow = GetCombinedItemTemplateRow()

    jazil.ShouldBe(templateRow.IsReal(), false)
  },

  'New row is real': (jazil) => {
    let templateRow = GetCombinedItemTemplateRow()
    let item = BuildItem({ set:g_combined, name:'Book', count:1, priorWork:4, cost:5 })
    let itemRow = CreateCombinedItemRow(templateRow, item)

    jazil.ShouldBe(itemRow.IsReal(), true)
  },

  'Create new row with item from template': (jazil) => {
    let templateRow = GetCombinedItemTemplateRow()
    let item = BuildItem({ set:g_combined, name:'Pickaxe', count:9, priorWork:2, cost:15 })
    let itemRow = CreateCombinedItemRow(templateRow, item)

    let details = GetCombinedItemRowDetails(itemRow.elemJQ)
    let { type, typeDetails } = GetCombinedTypeAndDetailsForItemInTable(item)

    jazil.ShouldBe(details.cost, 15, 'cost is off!')
    jazil.ShouldBe(details.count, 9, 'count is off!')
    jazil.ShouldBe(details.type, type, 'type is off!')
    jazil.ShouldBe(details.typeDetails, typeDetails, 'typeDetails is off!')
    jazil.ShouldBe(details.priorWork, 2, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemRow', type, typeDetails), true, 'added row is not present!')
  },

  'Create new row with item+enchants from template': (jazil) => {
    let templateRow = GetCombinedItemTemplateRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_combined, name:'Turtle Shell', count:1, priorWork:4, cost:9, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] })
    let itemRow = CreateCombinedItemRow(templateRow, item, 15)

    let details = GetCombinedItemRowDetails(itemRow.elemJQ)
    let { type, typeDetails } = GetCombinedTypeAndDetailsForItemInTable(item)

    jazil.ShouldBe(details.cost, 9, 'cost is off!')
    jazil.ShouldBe(details.count, 1, 'count is off!')
    jazil.ShouldBe(details.type, type, 'type is off!')
    jazil.ShouldBe(details.typeDetails, typeDetails, 'typeDetails is off!')
    jazil.ShouldBe(details.priorWork, 4, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, 'Mending/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/3', 'enchant levels are off!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemRow', type, typeDetails), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetCombinedItemTemplateRow()
    let numRowsPre = $('#combinedItemRow tr.item').length
    let item1 = BuildItem({ set:g_combined, name:'Chestplate', count:14, priorWork:4, cost:3 })
    let item2 = BuildItem({ set:g_combined, name:'Shovel', count:15, priorWork:5, cost:4 })
    let item3 = BuildItem({ set:g_combined, name:'Bow', count:16, priorWork:6, cost:5 })
    let itemRow1 = CreateCombinedItemRow(templateRow, item1)
    let itemRow2 = CreateCombinedItemRow(templateRow, item2)
    let itemRow3 = CreateCombinedItemRow(templateRow, item3)
    let numRowsPost = $('#combinedItemRow tr.item').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

  'Rows can be removed': (jazil) => {
    let templateRow = GetCombinedItemTemplateRow()
    let item1 = BuildItem({ set:g_combined, name:'Elytra', count:19, priorWork:3, cost:13 })
    let item2 = BuildItem({ set:g_combined, name:'Trident', count:18, priorWork:2, cost:14 })
    let item3 = BuildItem({ set:g_combined, name:'Shield', count:17, priorWork:1, cost:15 })
    let itemRow1 = CreateCombinedItemRow(templateRow, item1)
    let itemRow2 = CreateCombinedItemRow(templateRow, item2)
    let itemRow3 = CreateCombinedItemRow(templateRow, item3)
    let numRowsPre = $('#combinedItemRow tr.item').length
    itemRow2.Remove()
    let numRowsPost = $('#combinedItemRow tr.item').length

    let { type, typeDetails } = GetCombinedTypeAndDetailsForItemInTable(item2)

    jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemRow', type, typeDetails), false, 'removed row is still present!')
  },

})
