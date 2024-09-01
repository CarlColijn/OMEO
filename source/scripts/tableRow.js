/*
  Wrapper for a single row in an item table.

  Defined classes:
  - TableRow
*/


// ======== PUBLIC ========


class TableRow {
  constructor(rowElemJQ) {
    // ==== PUBLIC ====
    this.rowElemJQ = rowElemJQ
    this.isReal = rowElemJQ.attr('data-real') != 0
  }


  IsReal() {
    return this.isReal
  }


  Remove() {
    this.rowElemJQ.remove()
  }


  // returns jQuery-wrapped <tr> object
  MakeExtraRealRow() {
    let newRowElemJQ = this.rowElemJQ.clone()
    newRowElemJQ.appendTo(this.rowElemJQ.parent())

    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', 1)

    return newRowElemJQ
  }
}
