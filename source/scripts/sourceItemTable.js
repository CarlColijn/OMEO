/*
  Wrapper for source item tables.

  Prerequisites:
  - dataSets.js
  - sourceItemRow.js
  - sourceItemCollector.js

  Defined classes:
  - SourceItemTable
    - tableElem: the main table's element
*/


// ======== PUBLIC ========


class SourceItemTable {
  constructor(tableElem, addItemElem) {
    // ==== PUBLIC ====
    this.tableElem = tableElem

    // ==== PRIVATE ====
    this.addItemElem = addItemElem
    addItemElem.addEventListener('click', () => {
      this.AddRow()
    })

    this.templateRow = new SourceItemRowTemplate(this.tableElem, 'item')
    this.rows = []
  }


  // returns ItemRow
  AddRow() {
    let newNr = this.rows.length + 1
    let newRow = this.templateRow.CreateNew(newNr, undefined, this.rows, true, this.addItemElem)
    this.rows.push(newRow)
    return newRow
  }


  SetItems(items) {
    this.Clear()

    items.forEach((item, itemNr) => {
      let newRow = this.templateRow.CreateNew(itemNr + 1, item, this.rows, false, this.addItemElem)
      this.rows.push(newRow)
    })
  }


  // returns bool
  HasItems() {
    return this.rows.length > 0
  }


  // returns Item[]
  GetItems() {
    return this.rows.map((row) => {
      return row.GetItem().item
    })
  }


  // returns SourceItemCollectionResult
  ExtractItems(itemCollector) {
    this.rows.forEach((row) => {
      itemCollector.ProcessRow(row)
    })

    let result = itemCollector.Finalize()

    if (result.mergedItems) {
      this.RemoveMergedRows(result)
      this.UpdateRowCounts(result)
    }

    return result
  }


  // ======== PRIVATE ========


  Clear() {
    this.templateRow.RemoveCreatedElements()
    this.rows.splice(0, Infinity)

    this.addItemElem.focus()
  }


  RemoveMergedRows(mergeResult) {
    mergeResult.rowsToRemove.forEach((row) => {
      row.Remove()
    })
  }


  UpdateRowCounts(mergeResult) {
    mergeResult.rowsToUpdateCount.forEach((row) => {
      let item = mergeResult.itemsByRow.get(row)
      row.SetCount(item.count)
    })
  }
}
