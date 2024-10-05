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

    this.itemTemplateGroup = new CombinedItemGroupTemplate(this.tableElemJQ, 'group', ShowDetails)
  }


  Clear() {
    this.itemTemplateGroup.RemoveCreatedElements()
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
