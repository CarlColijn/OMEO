function GetCombinedItemRowTemplate() {
  let CallbackHandlerMock = {
    click: () => {}
  }

  return new CombinedItemRowTemplate(document.getElementById('combinedItemRow'), 'item', CallbackHandlerMock)
}


function CreateCombinedItemRow(templateRow, item) {
  let ratedItem = new RatedItem(item, item)
  return templateRow.CreateNew(ratedItem)
}


function GetCombinedItemRowDetails(itemRowElem) {
  let MakeNumberSafe = (numberElem) => {
    let value = numberElem.textContent
    return value === '' ? undefined : parseInt(value)
  }

  let cost = MakeNumberSafe(itemRowElem.querySelector('.cost'))
  let count = MakeNumberSafe(itemRowElem.querySelector('.count'))
  let type = itemRowElem.querySelector('.type').textContent
  let priorWork = MakeNumberSafe(itemRowElem.querySelector('.priorWork'))
  enchantNames = ''
  itemRowElem.querySelectorAll('.enchant .name').forEach((nameElem) => {
    let rowElem = new DOMElement(nameElem.parentElement.parentElement)
    if (rowElem.IsReal()) {
      if (enchantNames != '')
        enchantNames += '/'
      enchantNames += nameElem.textContent
    }
  })
  enchantLevels = ''
  itemRowElem.querySelectorAll('.enchant .level').forEach((levelElem) => {
    let rowElem = new DOMElement(levelElem.parentElement.parentElement)
    if (rowElem.IsReal()) {
      if (enchantLevels != '')
        enchantLevels += '/'
      enchantLevels += GetEnchantLevelFromGUIText(levelElem.textContent)
    }
  })

  return {
    'cost': cost,
    'count': count,
    'type': type,
    'priorWork': priorWork,
    'enchantNames': enchantNames,
    'enchantLevels': enchantLevels
  }
}


function CombinedItemRowInTable(testContainerID, type) {
  let foundRow = false
  document.querySelectorAll(`#${testContainerID} tr.item`).forEach((itemRowElem) => {
    let details = GetCombinedItemRowDetails(itemRowElem)
    if (details.type == type) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




jazil.AddTestSet(mainPage, 'CombinedItemRow', {
  'Template row is not real': (jazil) => {
    let templateRow = GetCombinedItemRowTemplate()

    jazil.ShouldBe(templateRow.IsReal(), false)
  },

  'New row is real': (jazil) => {
    let templateRow = GetCombinedItemRowTemplate()
    let item = BuildItem({ set:g_combined, name:'Book', count:1, priorWork:4, cost:5 })
    let itemRow = CreateCombinedItemRow(templateRow, item)

    jazil.ShouldBe(itemRow.IsReal(), true)
  },

  'Create new row with item from template': (jazil) => {
    let templateRow = GetCombinedItemRowTemplate()
    let item = BuildItem({ set:g_combined, name:'Pickaxe', count:9, priorWork:2, cost:15 })
    let itemRow = CreateCombinedItemRow(templateRow, item)

    let details = GetCombinedItemRowDetails(itemRow.elem)

    jazil.ShouldBe(details.cost, item.cost, 'cost is off!')
    jazil.ShouldBe(details.count, item.count, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, item.priorWork, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemRow', item.info.name), true, 'added row is not present!')
  },

  'Create new row with item+enchants from template': (jazil) => {
    let templateRow = GetCombinedItemRowTemplate()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_combined, name:'Turtle Shell', count:1, priorWork:4, cost:9, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] })
    let itemRow = CreateCombinedItemRow(templateRow, item, 15)

    let details = GetCombinedItemRowDetails(itemRow.elem)

    jazil.ShouldBe(details.cost, item.cost, 'cost is off!')
    jazil.ShouldBe(details.count, item.count, 'count is off!')
    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.priorWork, item.priorWork, 'priorWork is off!')
    jazil.ShouldBe(details.enchantNames, 'Mending/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/3', 'enchant levels are off!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemRow', item.info.name), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetCombinedItemRowTemplate()
    let numRowsPre = document.querySelectorAll('#combinedItemRow tr.item').length
    let item1 = BuildItem({ set:g_combined, name:'Chestplate', count:14, priorWork:4, cost:3 })
    let item2 = BuildItem({ set:g_combined, name:'Shovel', count:15, priorWork:5, cost:4 })
    let item3 = BuildItem({ set:g_combined, name:'Bow', count:16, priorWork:6, cost:5 })
    let itemRow1 = CreateCombinedItemRow(templateRow, item1)
    let itemRow2 = CreateCombinedItemRow(templateRow, item2)
    let itemRow3 = CreateCombinedItemRow(templateRow, item3)
    let numRowsPost = document.querySelectorAll('#combinedItemRow tr.item').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

  'Rows can be removed': (jazil) => {
    let templateRow = GetCombinedItemRowTemplate()
    let item1 = BuildItem({ set:g_combined, name:'Elytra', count:19, priorWork:3, cost:13 })
    let item2 = BuildItem({ set:g_combined, name:'Trident', count:18, priorWork:2, cost:14 })
    let item3 = BuildItem({ set:g_combined, name:'Shield', count:17, priorWork:1, cost:15 })
    let itemRow1 = CreateCombinedItemRow(templateRow, item1)
    let itemRow2 = CreateCombinedItemRow(templateRow, item2)
    let itemRow3 = CreateCombinedItemRow(templateRow, item3)
    let numRowsPre = document.querySelectorAll('#combinedItemRow tr.item').length
    itemRow2.Remove()
    let numRowsPost = document.querySelectorAll('#combinedItemRow tr.item').length

    jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemRow', item2.info.name), false, 'removed row is still present!')
  },

})
