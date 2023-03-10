/*
  Wrapper for item tables (source, desired, combined).

  Prerequisites:
  - dataSets.js
  - itemRow.js
  - itemCollector.js

  Defined classes:
  - ItemTable
    - set: DataSet
    - tableElemJQ: the main table's jQuery element
*/


// ======== PUBLIC ========


class ItemTable {
  constructor(ShowCountInputError, ShowDetails, tableElemJQ, set) {
    // ==== PUBLIC ====
    this.set = set
    this.tableElemJQ = tableElemJQ

    // ==== PRIVATE ====
    this.ShowCountInputError = ShowCountInputError
    this.ShowDetails = ShowDetails

    if (this.set === g_desired) {
      let itemRowElemJQ = this.tableElemJQ.find('.item').first()
      this.itemRow = new ItemRow(this.ShowCountInputError, this.ShowDetails, itemRowElemJQ, this.set, true)
    }
    else {
      let templateRowElemJQ = this.tableElemJQ.find('.template').first()
      this.templateRow = new ItemRow(this.ShowCountInputError, this.ShowDetails, templateRowElemJQ, this.set, false)
    }
  }


  // returns ItemRow
  AddRow() {
    let newNr = this.tableElemJQ.find('.item').length
    return this.templateRow.CreateNew(newNr, undefined)
  }


  // note: for g_desired tables, only the 1st item is used.
  SetItems(items) {
    if (this.set === g_desired)
      this.itemRow.SetItem(items[0])
    else {
      this.Clear()

      for (let itemNr = 0; itemNr < items.length; ++itemNr) {
        let item = items[itemNr]
        this.templateRow.CreateNew(item.nr, item)
      }
    }
  }


  // returns ItemCollectionResult
  GetItems(itemCollector) {
    let itemRows = this.GetItemRows()

    for (let rowNr = 0; rowNr < itemRows.length; ++rowNr)
      itemCollector.ProcessRow(itemRows[rowNr])

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
      let itemRow = new ItemRow(this.ShowCountInputError, this.ShowDetails, $(rowElem), this.set, false)
      if (itemRow.IsReal())
        itemRow.Remove()
      return true
    })
  }


  UpdateRowNrs(itemRows, mergeResult) {
    for (let rowNr = 0; rowNr < mergeResult.rowsToUpdateNr.length; ++rowNr) {
      let itemRow = mergeResult.rowsToUpdateNr[rowNr]
      itemRow.SetNumber(itemRow.nr)
    }
  }


  UpdateRowCounts(itemRows, mergeResult) {
    for (let rowNr = 0; rowNr < mergeResult.rowsToUpdateCount.length; ++rowNr) {
      let itemRow = mergeResult.rowsToUpdateCount[rowNr]
      let item = mergeResult.itemsByRow.get(itemRow)
      itemRow.SetCount(item.count)
    }
  }


  RemoveMergedRows(itemRows, mergeResult) {
    for (let rowNr = 0; rowNr < mergeResult.rowsToRemove.length; ++rowNr)
      mergeResult.rowsToRemove[rowNr].Remove()
  }


  // returns ItemRow[]
  GetItemRows() {
    let itemRows = []
    this.tableElemJQ.find('.item').each((rowNr, itemRowElem) => {
      let itemRow = new ItemRow(this.ShowCountInputError, this.ShowDetails, $(itemRowElem), this.set, false)
      if (itemRow.IsReal()) {
        itemRow.nr = itemRows.length
        itemRows.push(itemRow)
      }
      return true
    })
    return itemRows
  }
}
