// returns CombinedItemTable
function GetCombinedItemTable() {
  return new CombinedItemTable($('#combinedItemTable'), undefined)
}




jazil.AddTestSet(mainPage, 'CombinedItemTable', {
  'Table is initialized correctly': (jazil) => {
    let table = GetCombinedItemTable()

    jazil.ShouldBe(table.tableElemJQ.find('tr.template.item').length, 1, 'no template row found!')
    jazil.ShouldBe(table.tableElemJQ.find('tr.item').length, 1, 'wrong number of rows by default!')
  },

  'Setting items works': (jazil) => {
    let table = GetCombinedItemTable()

    let testItems = [
      BuildItem({ set:g_combined, name:'Shield', count:2, priorWork:3 }),
      BuildItem({ set:g_combined, name:'Helmet', count:3, priorWork:4, enchants:[{ name:'Aqua Affinity', level:1 }, { name:'Unbreaking', level:3 }] }),
      BuildItem({ set:g_source, name:'Boots', nr:7, count:4, priorWork:5 }),
    ]

    let numRowsPre = table.tableElemJQ.find('tr.item').length
    table.SetItems(testItems)
    let numRowsPost = table.tableElemJQ.find('tr.item').length

    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'wrong number of rows added!')

    jazil.ShouldBe(CombinedItemRowInTable('combinedItemTable', 'Shield', ''), true, 'New shield not in table!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemTable', 'Helmet', ''), true, 'New helmet not in table!')
    jazil.ShouldBe(CombinedItemRowInTable('combinedItemTable', 'Boots', 'source nr. 7'), true, 'New boots not in table!')
  },

})
