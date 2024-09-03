/*
  Wrapper for source item tables.

  Prerequisites:
  - dataSets.js
  - sourceItemRow.js
  - itemCollector.js

  Defined classes:
  - SourceItemTable
    - tableElemJQ: the main table's jQuery element
*/


// ======== PUBLIC ========


class SourceItemTable {
  constructor(tableElemJQ, addItemElemJQ) {
    // ==== PUBLIC ====
    this.tableElemJQ = tableElemJQ

    // ==== PRIVATE ====
    this.addItemElemJQ = addItemElemJQ
    addItemElemJQ.click(() => {
      this.AddRow()
    })

    let templateRowElemJQ = this.tableElemJQ.find('.template').first()
    this.templateRow = new SourceItemRowTemplate(templateRowElemJQ, false)
  }


  // returns ItemRow
  AddRow() {
    let newNr = this.tableElemJQ.find('.item').length
    return this.templateRow.CreateNew(newNr, undefined, true, this.addItemElemJQ)
  }


  // note: for g_desired tables, only the 1st item is used.
  SetItems(items) {
    this.Clear()

    items.forEach((item, itemNr) => {
      this.templateRow.CreateNew(itemNr + 1, item, false, this.addItemElemJQ)
    })
  }


  // returns ItemCollectionResult
  GetItems(itemCollector) {
    let itemRows = this.GetItemRows()

    itemRows.forEach((itemRow) => {
      itemCollector.ProcessRow(itemRow)
    })

    let result = itemCollector.Finalize()

    if (result.mergedItems) {
      this.UpdateRowNrs(itemRows, result)
      this.UpdateRowCounts(itemRows, result)
      this.RemoveMergedRows(itemRows, result)
    }

    return result
  }


  // ======== PRIVATE ========


  Clear() {
    this.tableElemJQ.find('.item').each((rowNr, rowElem) => {
      let itemRow = new SourceItemRow($(rowElem), false)
      if (itemRow.IsReal())
        itemRow.Remove()
      return true
    })
  }


  UpdateRowNrs(itemRows, mergeResult) {
    mergeResult.rowsToUpdateNr.forEach((itemRow) => {
      itemRow.SetNumber(itemRow.nr)
    })
  }


  UpdateRowCounts(itemRows, mergeResult) {
    mergeResult.rowsToUpdateCount.forEach((itemRow) => {
      let item = mergeResult.itemsByRow.get(itemRow)
      itemRow.SetCount(item.count)
    })
  }


  RemoveMergedRows(itemRows, mergeResult) {
    mergeResult.rowsToRemove.forEach((row) => {
      row.Remove()
    })
  }


  // returns SourceItemRow[]
  GetItemRows() {
    let realItemRows = []
    this.tableElemJQ.find('.item').each((rowNr, itemRowElem) => {
      let itemRow = new SourceItemRow($(itemRowElem), false)
      if (itemRow.IsReal()) {
        itemRow.nr = realItemRows.length
        realItemRows.push(itemRow)
      }
      return true
    })
    return realItemRows
  }
}
