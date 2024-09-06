/*
  Wrapper for combined item tables.

  Prerequisites:
  - combinedItemRow.js

  Defined classes:
  - CombinedItemTable
    - tableElemJQ: the main table's jQuery element
*/


// ======== PUBLIC ========


class CombinedItemTable {
  constructor(tableElemJQ, ShowDetails) {
    // ==== PUBLIC ====
    this.tableElemJQ = tableElemJQ

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    let templateGroupElemJQ = this.tableElemJQ.find('.template').first()
    this.itemTemplateGroup = new CombinedItemGroupTemplate(templateGroupElemJQ, ShowDetails)
  }


  Clear() {
    this.tableElemJQ.find('.group').each((groupNr, groupElem) => {
      let groupElemJQ = $(groupElem)
      if (groupElemJQ.attr('data-real') != 0)
        groupElemJQ.remove()
      return true
    })
  }


  SetRatedItemGroup(filteredCombinedItems, match) {
    let ratedItems = filteredCombinedItems.ratedItemsByMatch[match]
    if (ratedItems.length > 0) {
      let itemGroup = this.itemTemplateGroup.CreateNew(match)

      ratedItems.forEach((ratedItem) => {
        itemGroup.AddItem(ratedItem)
      })
    }
  }


  SetCombinedItems(filteredCombinedItems) {
    this.Clear()

    this.SetRatedItemGroup(filteredCombinedItems, g_exactMatch)
    this.SetRatedItemGroup(filteredCombinedItems, g_betterMatch)
    this.SetRatedItemGroup(filteredCombinedItems, g_mixedMatch)
    this.SetRatedItemGroup(filteredCombinedItems, g_lesserMatch)
  }
}
