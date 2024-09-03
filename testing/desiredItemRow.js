function GetDesiredItemRow() {
  return new DesiredItemRow($('#desiredItemRow .item'))
}


function SetDesiredItem(itemRow, item) {
  itemRow.SetItem(item)
}


function GetDesiredItemRowDetails(itemRowElemJQ) {
  let typeElemJQ = itemRowElemJQ.find('[name=itemID]')
  let typeID = typeElemJQ.val()
  typeID = typeID === undefined ? undefined : parseInt(typeID)
  let type = g_itemInfosByID.get(typeID).name

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
  itemRowElemJQ.find('[name=level]').each((inputNr, inputElem) => {
    let inputElemJQ = $(inputElem)
    let rowElemJQ = inputElemJQ.parent().parent()
    if (rowElemJQ.attr('data-real') != 0) {
      if (enchantLevels != '')
        enchantLevels += '/'
      enchantLevels += inputElemJQ.val()
    }
  })

  return {
    'type': type,
    'enchantNames': enchantNames,
    'enchantLevels': enchantLevels
  }
}


function DesiredItemRowInTable(testContainerID, item) {
  let foundRow = false
  $(`#${testContainerID} tr.item`).each((rowNr, itemRowElem) => {
    let itemRowElemJQ = $(itemRowElem)
    let details = GetDesiredItemRowDetails(itemRowElemJQ)
    if (details.type == item.info.name) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




jazil.AddTestSet(mainPage, 'DesiredItemRow', {
  'Initial row is correct': (jazil) => {
    let itemRow = GetDesiredItemRow()

    let details = GetDesiredItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(itemRow.IsReal(), true, 'IsReal is off!')
    jazil.ShouldBe(details.type, 'Axe', 'name is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
  },

  'Plain item is set correctly': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let item = BuildItem({ set:g_desired, name:'Pickaxe', count:9, priorWork:2, cost:15 })
    itemRow.SetItem(item)

    let details = GetDesiredItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'added row is not present!')
  },

  'Enchanted item is set correctly': (jazil) => {
    let itemRow = GetDesiredItemRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_desired, name:'Turtle Shell', count:1, priorWork:4, cost:9, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] })
    itemRow.SetItem(item)

    let details = GetDesiredItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, 'Mending/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/3', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'added row is not present!')
  },

  'Retrieve item from row': (jazil) => {
    let itemRow = GetDesiredItemRow()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_desired, name:'Shears', count:2, priorWork:5, cost:3, enchants:[{ name:'Unbreaking', level:1 }, { name:'Efficiency', level:2 }] })
    itemRow.SetItem(item)

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
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(enchantNames, 'Efficiency/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '2/1', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'added row is not present!')
  },

  'Enchant conflicts get registered': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let item = BuildItem({ set:g_desired, name:'Leggings', count:23, priorWork:5, cost:3, enchants:[{ name:'Fire Protection', level:1 }, { name:'Blast Protection', level:1 }] })
    itemRow.SetItem(item)

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
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(enchantNames, 'Blast ProtectionFire Protection', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '11', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'added row is not present!')
  },

  'Enchant dupes get registered': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let item = BuildItem({ set:g_desired, name:'Pumpkin', count:23, priorWork:5, cost:3, enchants:[] })
    itemRow.SetItem(item)
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
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(enchantNames, 'Curse of Vanishing', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '1', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'added row is not present!')
  },

  'No rows get added': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let numRowsPre = $('#desiredItemRow tr.item').length
    let item1 = BuildItem({ set:g_desired, name:'Chestplate', count:14, priorWork:4, cost:3 })
    let item2 = BuildItem({ set:g_desired, name:'Shovel', count:15, priorWork:5, cost:4 })
    let item3 = BuildItem({ set:g_desired, name:'Bow', count:16, priorWork:6, cost:5 })
    let itemRow1 = SetDesiredItem(itemRow, item1)
    let itemRow2 = SetDesiredItem(itemRow, item2)
    let itemRow3 = SetDesiredItem(itemRow, item3)
    let numRowsPost = $('#desiredItemRow tr.item').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 0, 'rows got added!')
  },

  'Item can get extra enchants': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let item = BuildItem({ set:g_desired, name:'Flint & Steel', count:1, priorWork:0, cost:8 })
    itemRow.SetItem(item)
    // Note: enchantments are ordered in addition order
    itemRow.AddEnchant(BuildEnchant('Unbreaking', 2))
    itemRow.AddEnchant(BuildEnchant('Mending', 1))

    let details = GetDesiredItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, 'Unbreaking/Mending', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '2/1', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'changed row is not present anymore!')
  },

  'Item enchants can be removed': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let item = BuildItem({ set:g_desired, name:'Fishing Rod', count:3, priorWork:2, cost:1 })
    itemRow.SetItem(item)
    // Note: enchantments are ordered in addition order
    itemRow.AddEnchant(BuildEnchant('Unbreaking', 2))
    itemRow.AddEnchant(BuildEnchant('Lure', 3))
    itemRow.RemoveEnchants()

    let details = GetDesiredItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', item), true, 'changed row is not present anymore!')
  },

  'Item can be changed': (jazil) => {
    let itemRow = GetDesiredItemRow()
    let item = BuildItem({ set:g_desired, name:'Hoe', count:2, priorWork:1, cost:7, enchants:[{ name:'Unbreaking', level:2 }, { name:'Fortune', level:3 }] })
    itemRow.SetItem(item)
    // Note: enchantments are re-ordered in alphabetical order
    let updatedItem = BuildItem({ set:g_desired, name:'Helmet', count:6, priorWork:4, cost:5, enchants:[{ name:'Blast Protection', level:4 }, { name:'Aqua Affinity', level:1 }] })
    itemRow.SetItem(updatedItem)

    let details = GetDesiredItemRowDetails(itemRow.elemJQ)

    jazil.ShouldBe(details.type, updatedItem.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, 'Aqua Affinity/Blast Protection', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/4', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemRowInTable('desiredItemRow', updatedItem), true, 'changed row is not present anymore!')
  },

})
