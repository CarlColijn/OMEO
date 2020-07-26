/*
  Form (page I/O) management.  Links all buttons to action handlers, and
  populates form element values/options.

  Prerequisites:
  - dataSets.js
  - enchantDetails.js
  - itemDetails.js
  - itemTable.js
  - itemRow.js
  - detailsTable.js
  - formData.js
  - dataStream.js

  Defined classes:
  - Form
*/
class Form {
  // initializes the form
  Initialize(oracle) {
    // set up our elements
    this.sourceItemTable = new ItemTable(this, $('#sources'), g_source)
    this.combineItemTable = new ItemTable(this, $('#combines'), g_combined)
    this.desiredItemRow = new ItemRow(this, $('#desired .item'), g_desired)
    this.detailsTable = new DetailsTable($('#details'))

    // link up the buttons
    $('#addSourceItem').click(() => {
      this.sourceItemTable.AddRow()
    })
    this.desiredItemRow.rowElemJQ.find('button[name="addEnchant"]').click(() => {
      this.desiredItemRow.AddEnchant()
    })
    $('#divine').click(() => {
      // clear any divination result
      this.ClearErrors()
      this.ClearResult()

      // get the form data
      let data = this.GetData()

      // validate them all
      let allOK = data.desiredItem.Validate(this)
      for (let itemNr = 0; itemNr < data.sourceItems.length; ++itemNr) {
        // access this source item
        let sourceItem = data.sourceItems[itemNr]

        // and look if this item is usable
        if (!sourceItem.Validate(this))
          // no -> note
          allOK = false
      }
      let errorText = ''
      let combinedItems = []
      if (!allOK)
        // error -> note
        errorText = 'There are errors in your data.'
      else {
        // do the divination with it
        combinedItems = oracle.Divine(data)

        // and show the created items
        this.ShowCombinedItems(combinedItems)
      }

      // and show our status
      if (errorText.length != 0)
        alert(errorText)
      else if (combinedItems.length == 0)
        alert('All possible combinations are too expensive or wasteful!')
      else
        alert('The divination is complete!')
    })
    $('#load').click(() => {
      this.Load()
    })
    $('#save').click(() => {
      this.Save()
    })

    // fill in the item options
    let itemSelectElemJQs = $('select[name="itemID"]')
    for (let itemNr = 0; itemNr < g_numItems; ++itemNr) {
      let itemDetails = g_itemDetails[itemNr]
      itemSelectElemJQs.append(`<option value="${itemDetails.id}">${itemDetails.name}</option>`)
    }

    // and fill in the enchant options
    let enchantSelectElemJQs = $('select[name="enchantID"]')
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      let enchantDetails = g_enchantDetails[enchantNr]
      enchantSelectElemJQs.append(`<option value="${enchantDetails.id}">${enchantDetails.name}</option>`)
    }
  }


  // notes an error for the given input element
  NoteError(inputElemJQ, errorText) {
    inputElemJQ.after(`<span class="error"><br>${errorText}</span>`)
  }


  // clears all errors
  ClearErrors() {
    $('.error').remove()
  }


  // clears the result items
  ClearResult() {
    this.combineItemTable.Clear()
    this.detailsTable.Clear()
  }


  // shows the given combined items
  ShowCombinedItems(combinedItems) {
    // and show all combined items
    for (let itemNr = 0; itemNr < combinedItems.length; ++itemNr) {
      // get the item
      let combinedItem = combinedItems[itemNr]

      // and add the row for it
      this.combineItemTable.AddRow(combinedItem)
    }
  }


  // gets the data in the form
  GetData() {
    // start the data
    let data = new FormData()

    // collect all source items
    let sourceItems = this.sourceItemTable.GetItems()
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr)
      data.AddSourceItem(sourceItems[itemNr])

    // collect the desired item
    data.SetDesiredItem(this.desiredItemRow.GetItem())

    // and return the found data
    return data
  }


  // sets the data in the form
  SetData(data) {
    // clear any previous result
    this.ClearResult()

    // throw away any old data
    this.sourceItemTable.Clear()
    this.desiredItemRow.RemoveEnchants()

    // restore the source items
    for (let sourceNr = 0; sourceNr < data.sourceItems.length; ++sourceNr) {
      // get the item
      let sourceItem = data.sourceItems[sourceNr]

      // and add the row for it
      this.sourceItemTable.AddRow(sourceItem)
    }

    // and restore the desired item
    this.desiredItemRow.SetItem(data.desiredItem)
  }


  // loads the form state
  Load() {
    // ask if the user is sure
    if (true || window.confirm("Are you sure you want to load new data? Any unsaved changes will be lost!")) {
      // start the stream
      let stream = new DataStream()
      stream.Load()

      // deserialize the data
      let data = new FormData()
      data.Deserialize(stream)

      // and restore the form with the data
      this.SetData(data)
    }
  }


  // saves data
  Save() {
    // get the form data
    let data = this.GetData()

    // serialize the data
    let stream = new DataStream()
    data.Serialize(stream)

    // and store the complete data set
    stream.Save()
  }


  // shows the details for the given item
  ShowDetails(item) {
    this.detailsTable.ShowItem(item)
  }
}
