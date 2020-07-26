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
  GetItems() {
    // scrape all items
    let items = []
    let form = this.form
    this.tableElemJQ.find('.item').each((rowNr, itemRowElem) =>{
      // look if this is a real data row
      let itemRow = new ItemRow(form, $(itemRowElem), g_source)
      if (itemRow.IsReal()) {
        // yes -> get the source item
        let sourceItem = itemRow.GetItem()

        // and we got another one
        items.push(sourceItem)
      }
      return true
    })

    // and return the found items
    return items
  }
}
