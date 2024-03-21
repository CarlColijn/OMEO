function CheckItemInTable(jazil, item, tableElemJQ) {
  let itemFound = false
  tableElemJQ.find('tr').each((rowNr, rowElem) => {
    let rowElemJQ = $(rowElem)
    if (!rowElemJQ.hasClass('template')) {
      let listedDescription = $(rowElemJQ.find('.description')).text()
      let listedEnchants = $(rowElemJQ.find('.enchants')).text()
      let listedCost = $(rowElemJQ.find('.cost')).text()
      let listedPriorWork = $(rowElemJQ.find('.priorWork')).text()

      let neededDescription = `${GetSetName(item.set)} ${item.info.name}`
      if (item.set == g_source)
        neededDescription += ` nr. ${item.nr}`
      let neededEnchants = ''
      item.enchantsByID.forEach((enchant) => {
        neededEnchants += `${enchant.info.name} ${enchant.level}`
      })
      let neededCost
      if (item.set !== g_combined)
        neededCost = '-'
      else {
        neededCost = `${item.cost}`
        if (item.totalCost != item.cost)
          neededCost += ` (${item.totalCost} in total)`
      }
      let neededPriorWork = `${item.priorWork}`

      if (
        listedDescription.includes(neededDescription) &&
        listedEnchants == neededEnchants &&
        listedCost == neededCost &&
        listedPriorWork == neededPriorWork
      )
        itemFound = true
    }
    return !itemFound
  })

  jazil.Assert(itemFound, `Item ${GetAbbrItemDesciption(item, true)} not found in table!`)
}


jazil.AddTestSet(omeoPage, 'DetailsTable - common', {
  'Clearing an empty table has no effect': (jazil) => {
    let tableElemJQ = $('#detailsTable')
    let numRowsBefore = tableElemJQ.find('tr').length
    let table = new DetailsTable(tableElemJQ)
    table.Clear()
    let numRowsAfter = tableElemJQ.find('tr').length
    let numRowsDiff = numRowsAfter - numRowsBefore

    jazil.ShouldBe(numRowsDiff, 0, 'row count has updated!')
  },

  'Showing a single item results in 1 row': (jazil) => {
    let tableElemJQ = $('#detailsTable')
    let numRowsBefore = tableElemJQ.find('tr').length
    let table = new DetailsTable(tableElemJQ)
    let item = BuildItem({ name:'Sword', nr:1, count:4, cost:2, totalCost:3, priorWork:4, set:g_source, enchants:[{ name:'Looting' }, { name:'Unbreaking', level:2 }]})
    table.ShowItem(item)
    let numRowsAfter = tableElemJQ.find('tr').length
    let numRowsDiff = numRowsAfter - numRowsBefore

    jazil.ShouldBe(numRowsDiff, 1, 'row count has not updated correctly!')
  },

  'Re-showing a new item clears the old content': (jazil) => {
    let tableElemJQ = $('#detailsTable')
    let numRowsBefore = tableElemJQ.find('tr').length
    let table = new DetailsTable(tableElemJQ)
    let item = BuildItem({ name:'Pickaxe', count:4, cost:2, totalCost:7, priorWork:2, set:g_extra })
    table.ShowItem(item)
    let numRowsAfter = tableElemJQ.find('tr').length
    let numRowsDiff = numRowsAfter - numRowsBefore

    jazil.ShouldBe(numRowsDiff, 0, 'row count has not updated correctly!')
  },

})


function CreateTestSet(setDescription, setLetter) {
  jazil.AddTestSet(omeoPage, `DetailsTable - ${setDescription}`, {
    'Simple item without enchants is shown OK': (jazil) => {
      let set = GetSet(setLetter)
      let tableElemJQ = $('#detailsTable')
      let table = new DetailsTable(tableElemJQ)
      let item = BuildItem({ name:'Axe', nr:3, count:2, cost:4, totalCost:10, priorWork:3, set:set })
      table.ShowItem(item)

      CheckItemInTable(jazil, item, tableElemJQ)
    },

    'Simple item with enchants is shown OK': (jazil) => {
      let set = GetSet(setLetter)
      let tableElemJQ = $('#detailsTable')
      let table = new DetailsTable(tableElemJQ)
      let item = BuildItem({ name:'Boots', nr:2, count:5, cost:2, totalCost:21, priorWork:1, set:set, enchants:[{ name:'Mending' }, { name:'Protection', level:3 }]})
      table.ShowItem(item)

      CheckItemInTable(jazil, item, tableElemJQ)
    },

    'Simple item with no extra costs is shown OK': (jazil) => {
      let set = GetSet(setLetter)
      let tableElemJQ = $('#detailsTable')
      let table = new DetailsTable(tableElemJQ)
      let item = BuildItem({ name:'Leggings', nr:8, count:2, cost:5, totalCost:5, priorWork:4, set:set })
      table.ShowItem(item)

      CheckItemInTable(jazil, item, tableElemJQ)
    },

  })
}


CreateTestSet('source', 's')
CreateTestSet('extra', 'e')
CreateTestSet('combined', 'c')


jazil.AddTestSet(omeoPage, 'DetailsTable - complex combined listings', {
  'Complex item tree is shown OK - v1': (jazil) => {
    let tableElemJQ = $('#detailsTable')
    let table = new DetailsTable(tableElemJQ)
    let item0_s_t = BuildItem({ name:'Book', nr:1, count:4, cost:0, totalCost:0, priorWork:0, set:g_source, enchants:[{ name:'Unbreaking', level:3 }] })
    let item0_s_s = BuildItem({ name:'Book', nr:2, count:2, cost:0, totalCost:0, priorWork:0, set:g_source, enchants:[{ name:'Mending' }] })
    let item0_s = BuildItem({ name:'Shovel', count:6, cost:3, totalCost:12, priorWork:3, set:g_combined, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }] })
    item0_s.targetItem = item0_s_t
    item0_s.sacrificeItem = item0_s_s
    let item0_t = BuildItem({ name:'Shovel', count:1, cost:0, totalCost:0, priorWork:0, set:g_extra })
    let item0 = BuildItem({ name:'Shovel', count:8, cost:6, totalCost:22, priorWork:4, set:g_combined, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }]})
    item0.targetItem = item0_t
    item0.sacrificeItem = item0_s

    table.ShowItem(item0)

    CheckItemInTable(jazil, item0, tableElemJQ)
    CheckItemInTable(jazil, item0_t, tableElemJQ)
    CheckItemInTable(jazil, item0_s, tableElemJQ)
    CheckItemInTable(jazil, item0_s_t, tableElemJQ)
    CheckItemInTable(jazil, item0_s_s, tableElemJQ)
  },

  'Complex item tree is shown OK - v2': (jazil) => {
    let tableElemJQ = $('#detailsTable')
    let table = new DetailsTable(tableElemJQ)
    let item0_t_t = BuildItem({ name:'Book', nr:1, count:4, cost:0, totalCost:0, priorWork:0, set:g_source, enchants:[{ name:'Unbreaking', level:3 }] })
    let item0_t_s = BuildItem({ name:'Book', nr:2, count:2, cost:0, totalCost:0, priorWork:0, set:g_source, enchants:[{ name:'Mending' }] })
    let item0_t = BuildItem({ name:'Shovel', count:1, cost:3, totalCost:12, priorWork:0, set:g_combined, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }] })
    item0_t.targetItem = item0_t_t
    item0_t.sacrificeItem = item0_t_s
    let item0_s = BuildItem({ name:'Shovel', count:6, cost:0, totalCost:0, priorWork:3, set:g_extra })
    let item0 = BuildItem({ name:'Shovel', count:8, cost:6, totalCost:22, priorWork:4, set:g_combined, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }]})
    item0.targetItem = item0_t
    item0.sacrificeItem = item0_s

    table.ShowItem(item0)

    CheckItemInTable(jazil, item0, tableElemJQ)
    CheckItemInTable(jazil, item0_t, tableElemJQ)
    CheckItemInTable(jazil, item0_t_t, tableElemJQ)
    CheckItemInTable(jazil, item0_t_s, tableElemJQ)
    CheckItemInTable(jazil, item0_s, tableElemJQ)
  },

})
