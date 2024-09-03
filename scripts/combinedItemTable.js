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

    let templateRowElemJQ = this.tableElemJQ.find('.template').first()
    this.templateRow = new CombinedItemRow(this.ShowDetails, templateRowElemJQ)
  }


  Clear() {
    this.tableElemJQ.find('.item').each((rowNr, rowElem) => {
      let rowElemJQ = $(rowElem)
      if (rowElemJQ.attr('data-real') != 0)
        rowElemJQ.remove()
      return true
    })
  }


  SetItems(items) {
    this.Clear()

    items.forEach((item) => {
      this.templateRow.CreateNew(item)
    })
  }
}
