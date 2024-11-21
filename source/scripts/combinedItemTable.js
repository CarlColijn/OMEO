/*
  Wrapper for combined item tables.

  Prerequisites:
  - combinedItemRow.js

  Defined classes:
  - CombinedItemTable
    - tableElem: the main table's element
*/


// ======== PUBLIC ========


class CombinedItemTable {
  constructor(tableElem, ShowDetails) {
    // ==== PUBLIC ====
    this.tableElem = tableElem

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.itemTemplateGroup = new CombinedItemGroupTemplate(this.tableElem, 'group', ShowDetails)
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
