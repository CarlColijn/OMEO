// We need to wrap the single recipe table on our page for testing,
// since RecipeTable itself will not clear out any previous data.
class RecipeTableTester {
  constructor() {
    this.tableElemJQ = $('#recipeTable')
    this.tableElemJQ.find('tr.item:not(.template)').remove()
    this.numRowsBefore = this.tableElemJQ.find('.item').length
    this.table = new RecipeTable(this.tableElemJQ)
  }


  Finalize() {
    this.numRowsAfter = this.tableElemJQ.find('.item').length
    this.numRowsDiff = this.numRowsAfter - this.numRowsBefore
  }
}


function CheckItemInTable(jazil, item, tester, neededPlacement) {
  let itemFound = false
  tester.tableElemJQ.find('tr.item').each((rowNr, rowElem) => {
    let rowElemJQ = $(rowElem)
    if (!rowElemJQ.hasClass('template')) {
      let listedPlacement = $(rowElemJQ.find('.placement')).text()
      let listedDescription = $(rowElemJQ.find('.description')).text()
      let listedEnchants = ''
      $(rowElemJQ.find('.enchant:not(.template)')).each(function(rowNr, rowElem) {
        let rowElemJQ = $(rowElem)
        listedEnchants += rowElemJQ.find('.name').text() + ' ' + rowElemJQ.find('.level').text()
      })
      let listedRenameInstructions = $(rowElemJQ.find('.renameInstructions:not(.hidden)')).length > 0
      let listedCost = $(rowElemJQ.find('.cost')).text().replace(/\s/, '')
      let listedPriorWork = $(rowElemJQ.find('.priorWork')).text()

      let neededDescription = `${GetSetName(item.set)} ${item.info.name}`
      if (item.set === g_source)
        neededDescription += ` nr. ${item.nr}`
      let neededEnchants = ''
      item.enchantsByID.forEach((enchant) => {
        neededEnchants += `${enchant.info.name} ${GetGUITextForEnchantLevel(enchant)}`
      })
      let neededRenameInstructions = item.renamePoint === undefined ? false : item.renamePoint
      let neededCost
      if (item.set !== g_combined)
        neededCost = '-'
      else {
        neededCost = `${item.cost}`
        if (item.totalCost != item.cost)
          neededCost += `${item.totalCost}total`
      }
      let neededPriorWork = `${item.priorWork}`

      if (
        listedPlacement == neededPlacement &&
        listedDescription.includes(neededDescription) &&
        listedEnchants == neededEnchants &&
        listedRenameInstructions == neededRenameInstructions &&
        listedCost == neededCost &&
        listedPriorWork == neededPriorWork
      )
        itemFound = true
    }
    return !itemFound
  })

  jazil.Assert(itemFound, `Item ${GetAbbrItemDesciption(item)} not found in table!`)
}


jazil.AddTestSet(recipePage, 'RecipeTable - common', {
  'Clearing an empty table has no effect': (jazil) => {
    let tester = new RecipeTableTester()
    tester.Finalize()

    jazil.ShouldBe(tester.numRowsDiff, 0, 'row count has updated!')
  },

  'Showing a single item results in 1 row': (jazil) => {
    let tester = new RecipeTableTester()
    let item = BuildItem({ set:g_source, name:'Sword', nr:1, count:4, cost:2, totalCost:3, priorWork:4, enchants:[{ name:'Looting' }, { name:'Unbreaking', level:2 }]})
    tester.table.SetItem(item)
    tester.Finalize()

    jazil.ShouldBe(tester.numRowsDiff, 1, 'row count has not updated correctly!')
  },

})


function CreateTestSet(setDescription, setLetter) {
  jazil.AddTestSet(recipePage, `RecipeTable - ${setDescription}`, {
    'Simple item without enchants is shown OK': (jazil) => {
      let tester = new RecipeTableTester()
      let set = GetSet(setLetter)
      let item = BuildItem({ set:set, name:'Axe', nr:3, count:2, cost:4, totalCost:10, priorWork:3 })
      tester.table.SetItem(item)
      tester.Finalize()

      CheckItemInTable(jazil, item, tester, 'Result')
    },

    'Simple item with enchants is shown OK': (jazil) => {
      let tester = new RecipeTableTester()
      let set = GetSet(setLetter)
      let item = BuildItem({ set:set, name:'Boots', nr:2, count:5, cost:2, totalCost:21, priorWork:1, enchants:[{ name:'Mending' }, { name:'Protection', level:3 }]})
      tester.table.SetItem(item)
      tester.Finalize()

      CheckItemInTable(jazil, item, tester, 'Result')
    },

    'Simple item with no extra costs is shown OK': (jazil) => {
      let tester = new RecipeTableTester()
      let set = GetSet(setLetter)
      let item = BuildItem({ set:set, name:'Leggings', nr:8, count:2, cost:5, totalCost:5, priorWork:4 })
      tester.table.SetItem(item)
      tester.Finalize()

      CheckItemInTable(jazil, item, tester, 'Result')
    },

    'Simple item with renamePoint is shown OK': (jazil) => {
      let tester = new RecipeTableTester()
      let set = GetSet(setLetter)
      if (set !== g_combined)
        jazil.SkipTest()
      let item = BuildItem({ set:set, name:'Leggings', count:2, cost:4, totalCost:15, priorWork:2, rename:'r' })
      tester.table.SetItem(item)
      tester.Finalize()

      CheckItemInTable(jazil, item, tester, 'Result')
    },

  })
}


CreateTestSet('source', 's')
CreateTestSet('extra', 'e')
CreateTestSet('combined', 'c')


jazil.AddTestSet(recipePage, 'RecipeTable - complex combined listings', {
  'Complex item tree is shown OK - v1': (jazil) => {
    let tester = new RecipeTableTester()
    let item0_s_t = BuildItem({ set:g_source, name:'Book', nr:1, count:4, cost:0, totalCost:0, priorWork:0, enchants:[{ name:'Unbreaking', level:3 }] })
    let item0_s_s = BuildItem({ set:g_source, name:'Book', nr:2, count:2, cost:0, totalCost:0, priorWork:0, enchants:[{ name:'Mending' }] })
    let item0_s = BuildItem({ set:g_combined, name:'Shovel', count:6, cost:3, totalCost:12, priorWork:3, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }] })
    item0_s.targetItem = item0_s_t
    item0_s.sacrificeItem = item0_s_s
    let item0_t = BuildItem({ set:g_extra, name:'Shovel', count:1, cost:0, totalCost:0, priorWork:0 })
    let item0 = BuildItem({ set:g_combined, name:'Shovel', count:8, cost:6, totalCost:22, priorWork:4, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }]})
    item0.targetItem = item0_t
    item0.sacrificeItem = item0_s

    tester.table.SetItem(item0)
    tester.Finalize()

    CheckItemInTable(jazil, item0, tester, 'Result')
    CheckItemInTable(jazil, item0_t, tester, 'Left')
    CheckItemInTable(jazil, item0_s, tester, 'Right')
    CheckItemInTable(jazil, item0_s_t, tester, 'Left')
    CheckItemInTable(jazil, item0_s_s, tester, 'Right')
  },

  'Complex item tree is shown OK - v2': (jazil) => {
    let tester = new RecipeTableTester()
    let item0_t_t = BuildItem({ set:g_source, name:'Book', nr:1, count:4, cost:0, totalCost:0, priorWork:0, enchants:[{ name:'Unbreaking', level:3 }] })
    let item0_t_s = BuildItem({ set:g_source, name:'Book', nr:2, count:2, cost:0, totalCost:0, priorWork:0, enchants:[{ name:'Mending' }] })
    let item0_t = BuildItem({ set:g_combined, name:'Shovel', count:1, cost:3, totalCost:12, priorWork:0, rename:'r', enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }] })
    item0_t.targetItem = item0_t_t
    item0_t.sacrificeItem = item0_t_s
    let item0_s = BuildItem({ set:g_extra, name:'Shovel', count:6, cost:0, totalCost:0, priorWork:3 })
    let item0 = BuildItem({ set:g_combined, name:'Shovel', count:8, cost:6, totalCost:22, priorWork:4, enchants:[{ name:'Mending' }, { name:'Unbreaking', level:3 }]})
    item0.targetItem = item0_t
    item0.sacrificeItem = item0_s

    tester.table.SetItem(item0)
    tester.Finalize()

    CheckItemInTable(jazil, item0, tester, 'Result')
    CheckItemInTable(jazil, item0_t, tester, 'Left')
    CheckItemInTable(jazil, item0_t_t, tester, 'Left')
    CheckItemInTable(jazil, item0_t_s, tester, 'Right')
    CheckItemInTable(jazil, item0_s, tester, 'Right')
  },

})
