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


  SetRatedItemGroup(ratedItemGroups, match) {
    let ratedItemGroup = ratedItemGroups[match]
    if (ratedItemGroup.length > 0) {
      let itemGroup = this.itemTemplateGroup.CreateNew(match)

      ratedItemGroup.forEach((ratedItem) => {
        itemGroup.AddItem(ratedItem)
      })
    }
  }


  SetRatedItemGroups(ratedItemGroups) {
    this.Clear()

    this.SetRatedItemGroup(ratedItemGroups, g_exactMatch)
    this.SetRatedItemGroup(ratedItemGroups, g_betterMatch)
    this.SetRatedItemGroup(ratedItemGroups, g_mixedMatch)
    this.SetRatedItemGroup(ratedItemGroups, g_lesserMatch)
  }
}
