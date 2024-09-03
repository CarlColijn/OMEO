/*
  Wrapper for desired item tables.

  Prerequisites:
  - dataSets.js
  - desiredItemRow.js
  - itemCollector.js

  Defined classes:
  - DesiredItemTable
    - tableElemJQ: the main table's jQuery element
*/


// ======== PUBLIC ========


class DesiredItemTable {
  constructor(tableElemJQ) {
    // ==== PUBLIC ====
    this.tableElemJQ = tableElemJQ

    // ==== PRIVATE ====
    let itemRowElemJQ = this.tableElemJQ.find('.item').first()
    this.itemRow = new DesiredItemRow(itemRowElemJQ)
  }


  SetItem(item) {
    this.itemRow.SetItem(item)
  }


  // returns ItemCollectionResult
  GetItem(itemCollector) {
    itemCollector.ProcessRow(this.itemRow)
    return itemCollector.Finalize()
  }
}
