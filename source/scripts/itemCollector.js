/*
  Collects Item-s from ItemRow-s, merging mergeable items/rows in the process if needed.

  Prerequisites:
  - item.js
  - itemRow.js

  Defined classes:
  - ItemCollectionResult
    - withErrors: bool
    - items: Item[]
    - mergedItems: bool
    - rowsToUpdateNr: ItemRow[]
    - rowsToUpdateCount: ItemRow[]
    - rowsToRemove: ItemRow[]
    - itemsByRow: Map(ItemRow -> Item)
      if mergedItems, maps the ItemRow-s returned in rowsToUpdateCount,
      rowsToUpdateNr and rowsToRemove to their corresponding Item-s
      returned in items.
  - ItemCollector
*/


// ======== PUBLIC ========


class ItemCollectionResult {
  constructor() {
    // ==== PUBLIC ====
    this.withErrors = false
    this.items = []
    this.mergedItems = false
    this.rowsToUpdateNr = []
    this.rowsToUpdateCount = []
    this.rowsToRemove = []
    this.itemsByRow = new Map()
  }
}




class ItemCollector {
  constructor(mergeItems) {
    // ==== PRIVATE ====
    this.mergeItems = mergeItems
    this.rowDetailsByHash = new Map()
    this.rowItemsMappedForUpdateCount = new Set()
    this.nextRowNr = 1

    this.result = new ItemCollectionResult()
  }


  ProcessRow(itemRow) {
    let itemResult = itemRow.GetItem()
    if (itemResult.withErrors)
      this.result.withErrors = true
    let item = itemResult.item
    let itemHash = item.Hash(true)

    if (item.nr != this.nextRowNr)
      item.nr = this.nextRowNr
    let rowNrUpdated = false
    if (itemRow.nr != this.nextRowNr) {
      itemRow.nr = this.nextRowNr
      rowNrUpdated = true
    }

    let mayMergeRow =
      this.mergeItems &&
      !this.result.withErrors

    let rowMerged = false
    if (mayMergeRow) {
      let prevRowDetails = this.rowDetailsByHash.get(itemHash)
      if (prevRowDetails !== undefined) {
        this.result.rowsToRemove.push(itemRow)
        this.result.itemsByRow.set(itemRow, item)

        prevRowDetails.item.count += item.count
        if (!this.rowItemsMappedForUpdateCount.has(prevRowDetails.row)) {
          this.result.rowsToUpdateCount.push(prevRowDetails.row)
          this.result.itemsByRow.set(prevRowDetails.row, prevRowDetails.item)
          this.rowItemsMappedForUpdateCount.add(prevRowDetails.row)
        }

        rowMerged = true
        this.result.mergedItems = true
      }
    }

    if (!rowMerged) {
      if (rowNrUpdated) {
        this.result.rowsToUpdateNr.push(itemRow)
        this.result.itemsByRow.set(itemRow, item)
      }

      this.result.items.push(item)
      this.rowDetailsByHash.set(itemHash, {
        'item': item,
        'row': itemRow
      })

      ++this.nextRowNr
    }
  }


  // return ItemCollectionResult
  Finalize() {
    return this.result
  }
}
