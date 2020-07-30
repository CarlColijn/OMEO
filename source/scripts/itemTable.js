/*
  Wrapper for item tables (source, desired, combined).

  Prerequisites:
  - dataSets.js
  - itemRow.js

  Defined classes:
  - ItemTable
    - set: char (s=source, d=desired, c=combined)
    - tableElemJQ: the main table's jQuery element
*/
class ItemTable {
  constructor(form, tableElemJQ, set) {
    // note our set
    this.set = set

    // note who the form is
    this.form = form

    // and get our elements
    this.tableElemJQ = tableElemJQ
  }


  // clears the table
  Clear() {
    let form = this.form
    this.tableElemJQ.find('.item').each((rowNr, rowElem) =>{
      let itemRow = new ItemRow(form, $(rowElem), g_combined)
      if (itemRow.IsReal())
        itemRow.Remove()
      return true
    })
  }


  // adds an item row to the table
  // returns the new row
  AddRow(item) {
    // look what number the row will get
    let newNr = item !== undefined ? item.nr : this.tableElemJQ.find('.item').length

    // access the template row
    let templateRowElemJQ = this.tableElemJQ.find('.template').first()
    let templateRow = new ItemRow(this.form, templateRowElemJQ, this.set)

    // and create the new item row from it
    return templateRow.CreateNew(newNr, item)
  }


  // gets all items from the table
  // returns { items, mergedItems, withErrors }
  GetItems(mergeItems, validate, form) {
    // scrape all items
    let result = {
      'items': [],
      'mergedItems': false,
      'withErrors': false
    }
    let itemRowsToRemove = []
    let itemsByHash = {}
    let sourceRowsByHash = {}
    let newRowNr = 1
    this.tableElemJQ.find('.item').each((rowNr, itemRowElem) => {
      // look if this is a real data row
      let itemRow = new ItemRow(form, $(itemRowElem), g_source)
      if (itemRow.IsReal()) {
        // yes -> look if to renumber the row
        if (newRowNr != rowNr)
          // yes -> do so first
          itemRow.Number(newRowNr)
        ++newRowNr

        // get the source item
        let itemResult = itemRow.GetItem(validate, form)
        let item = itemResult.item
        if (itemResult.withErrors)
          result.withErrors = true

        // look if we need to merge it with another item
        if (!result.withErrors && mergeItems) {
          let itemHash = item.Hash()
          let prevItem = itemsByHash[itemHash]
          if (prevItem === undefined) {
            // no -> remember this new item+row
            itemsByHash[itemHash] = item
            sourceRowsByHash[itemHash] = itemRow
          }
          else {
            // yes -> adjust the count of the other item
            prevItem.count += item.count
            sourceRowsByHash[itemHash].SetCount(prevItem.count)

            // remember to kill this row
            itemRowsToRemove.push(itemRow)

            // and let the upcoming row get a lower number
            --newRowNr
          }
        }

        // denote which row we got it from, if needed
        if (mergeItems)
          item.sourceRow = itemRow

        // and we got another one
        result.items.push(item)
      }
      return true
    })

    // remove all rows to be removed
    result.mergedItems = itemRowsToRemove.length > 0
    for (let rowNr = 0; rowNr < itemRowsToRemove.length; ++rowNr)
      itemRowsToRemove[rowNr].Remove()

    // and return the result
    return result
  }
}
