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

  'Setting rated item groups works': (jazil) => {
    let table = GetCombinedItemTable()

    let matches = [g_exactMatch, g_betterMatch, g_lesserMatch, g_mixedMatch]

    let itemInfos = []
    let filteredCombinedItems = {
      ratedItemsByMatch: matches.map((match) => {
        let firstItemID = match * 5
        let items = [
          BuildItem({ set:g_combined, name:g_itemInfosByID.get(firstItemID+0).name, count:2, cost:20-match, priorWork:0+match }),
          BuildItem({ set:g_combined, name:g_itemInfosByID.get(firstItemID+1).name, count:3, cost:19-match, priorWork:1+match, enchants:[{ name:'Unbreaking', level:3 }] }),
          BuildItem({ set:g_source, name:g_itemInfosByID.get(firstItemID+2).name, nr:5+match, cost:18-match, priorWork:2+match })
        ]
        items.forEach((item) => {
          itemInfos.push({
            name: item.info.name,
            set: item.set,
            nr: item.nr
          })
        })

        return items.map((item) => {
          return new RatedItem(item, item)
        })
      })
    }

    let numGroupsPre = table.tableElemJQ.find('tbody.group').length
    let numRowsPre = table.tableElemJQ.find('tr.item').length
    table.SetCombinedItems(filteredCombinedItems)
    let numGroupsPost = table.tableElemJQ.find('tbody.group').length
    let numRowsPost = table.tableElemJQ.find('tr.item').length

    // 3 groups, plus 1 for the template
    jazil.ShouldBe(numGroupsPost - numGroupsPre, 4, 'wrong number of groups added!')
    // 3 per group, plus 1 for the template
    jazil.ShouldBe(numRowsPost - numRowsPre, 16, 'wrong number of rows added!')
    itemInfos.forEach((itemInfo) => {
      jazil.ShouldBe(CombinedItemRowInTable('combinedItemTable', itemInfo.name), true, `New ${itemInfo.name} not in table!`)
    })
  },

})
