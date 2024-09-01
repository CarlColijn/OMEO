function GetTableTemplateRow() {
  let templateRowElemJQ = $('#tableRow .template')
  return new TableRow(templateRowElemJQ)
}


function CreateTableRow(templateRow, description) {
  let tableRow = new TableRow(templateRow.MakeExtraRealRow())
  tableRow.rowElemJQ.find('.description').text(description)
  return tableRow
}


function GetTableRowDescription(tableRow) {
  return tableRow.rowElemJQ.find('.description').text()
}


function TableRowInTable(description) {
  let foundRow = false
  $('#tableRow tr').each((rowNr, tableRowElem) => {
    let tableRow = new TableRow($(tableRowElem))
    if (description == GetTableRowDescription(tableRow)) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




jazil.AddTestSet(mainPage, 'TableRow', {
  'Template row is not real': (jazil) => {
    let templateRow = GetTableTemplateRow()
    jazil.ShouldBe(templateRow.IsReal(), false)
  },

  'New row is real': (jazil) => {
    let templateRow = GetTableTemplateRow()
    let tableRow = CreateTableRow(templateRow, 'test 1')
    jazil.ShouldBe(tableRow.IsReal(), true)
  },

  'Create new row from template': (jazil) => {
    let templateRow = GetTableTemplateRow()
    let tableRow = CreateTableRow(templateRow, 'test 2')
    let description = GetTableRowDescription(tableRow)
    jazil.ShouldBe(description, 'test 2', 'description is off!')
    jazil.ShouldBe(TableRowInTable('test 2'), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetTableTemplateRow()
    let numRowsPre = $('#tableRow tr').length
    let tableRow1 = CreateTableRow(templateRow, 'test 3')
    let tableRow2 = CreateTableRow(templateRow, 'test 4')
    let tableRow3 = CreateTableRow(templateRow, 'test 5')
    let numRowsPost = $('#tableRow tr').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

  'Rows can be removed': (jazil) => {
    let templateRow = GetTableTemplateRow()
    let tableRow1 = CreateTableRow(templateRow, 'test 6')
    let tableRow2 = CreateTableRow(templateRow, 'test 7')
    let tableRow3 = CreateTableRow(templateRow, 'test 8')
    let numRowsPre = $('#tableRow tr').length
    tableRow2.Remove()
    let numRowsPost = $('#tableRow tr').length
    jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
    jazil.ShouldBe(TableRowInTable('test 7'), false, 'removed row is still present!')
  },

})
