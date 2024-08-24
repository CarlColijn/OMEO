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
  constructor(ShowDetails, tableElemJQ, addItemElemJQ, set) {
    // ==== PUBLIC ====
    this.set = set
    this.tableElemJQ = tableElemJQ

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.addItemElemJQ = addItemElemJQ
    if (this.addItemElemJQ !== undefined) {
      addItemElemJQ.click(() => {
        this.AddRow()
      })
    }

    if (this.set === g_desired) {
      let itemRowElemJQ = this.tableElemJQ.find('.item').first()
      this.itemRow = new ItemRow(this.ShowDetails, itemRowElemJQ, this.set, true)
    }
    else {
      let templateRowElemJQ = this.tableElemJQ.find('.template').first()
      this.templateRow = new ItemRow(this.ShowDetails, templateRowElemJQ, this.set, false)
    }
  }


  // returns ItemRow
  AddRow() {
    let newNr = this.tableElemJQ.find('.item').length
    return this.templateRow.CreateNew(newNr, undefined, true, this.addItemElemJQ)
  }


  // note: for g_desired tables, only the 1st item is used.
  SetItems(items) {
    if (this.set === g_desired)
      this.itemRow.SetItem(items[0])
    else {
      this.Clear()

      items.forEach((item, itemNr) => {
        this.templateRow.CreateNew(itemNr + 1, item, false, this.addItemElemJQ)
      })
    }
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
      let itemRow = new ItemRow(this.ShowDetails, $(rowElem), this.set, false)
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


  // returns ItemRow[]
  GetItemRows() {
    let itemRows = []
    this.tableElemJQ.find('.item').each((rowNr, itemRowElem) => {
      let itemRow = new ItemRow(this.ShowDetails, $(itemRowElem), this.set, false)
      if (itemRow.IsReal()) {
        itemRow.nr = itemRows.length
        itemRows.push(itemRow)
      }
      return true
    })
    return itemRows
  }
}
