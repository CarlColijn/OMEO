/*
  Form (page I/O) management.  Links all buttons to action handlers, and
  populates form element values/options.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - itemTable.js
  - itemRow.js
  - detailsTable.js
  - formData.js
  - dataStream.js

  Defined classes:
  - Form
*/


// ======== PUBLIC ========


class Form {
  constructor(formHandler) {
    this.formHandler = formHandler

    $(() => {
      // only execute once the DOM is fully loaded
      this.StartUp()
    })

    $(window).on('beforeunload', (event) => {
      this.ShutDown(event)
    })
  }


  // ======== PRIVATE ========


  StartUp() {
    this.InitializeSubObjects()

    this.HookUpGUI()

    this.InitializeNotesSection()

    if (!this.Load())
      this.formHandler.FailedToLoad()
  }


  ShutDown(event) {
    if (!this.Save(false))
      this.formHandler.FailedToSaveOnUnload(event)
  }


  InitializeSubObjects() {
    let ShowDetails = (item) => {
      this.detailsTable.ShowItem(item)
    }

    this.sourceItemTable = new ItemTable(this.formHandler.NoteCountError, undefined, $('#sources table'), g_source)
    this.desiredItemTable = new ItemTable(undefined, undefined, $('#desired table'), g_desired)
    this.combineItemTable = new ItemTable(undefined, ShowDetails, $('#combines table'), g_combined)
    this.detailsTable = new DetailsTable($('#details table'))
  }


  HookUpGUI() {
    $('#addSourceItem').click(() => {
      this.sourceItemTable.AddRow()
    })

    $('#divine').click(() => {
      this.PerformDivine()
    })

    $('#makeBookmark').click(() => {
      if (!this.Save(true))
        this.formHandler.FailedToSaveOnRequest()
    })
  }


  PerformDivine() {
    this.ClearErrors()
    this.ClearResult()

    let dataInContext = this.GetData(true)
    if (dataInContext.withErrors)
      this.formHandler.TellDataInError()
    else {
      if (dataInContext.mergedSourceItems)
        this.formHandler.TellItemsGotMerged()

      let itemCombiner = new ItemCombiner()
      let combinedItems = itemCombiner.GetAllItemCombinations(dataInContext.data.sourceItems, dataInContext.data.desiredItem)

      this.ShowCombinedItems(combinedItems)

      if (combinedItems.length == 0)
        this.formHandler.TellNoCombinesPossible()
      else
        this.formHandler.TellCombiningDone()
    }
  }


  InitializeNotesSection() {
    let notesElemJQ = $('#notes')
    let hideNotesElemJQ = $('#hideNotes')
    let showNotesElemJQ = $('#showNotes')

    let hideNotes = localStorage.getItem('hideNotes') != null
    if (hideNotes) {
      notesElemJQ.hide()
      showNotesElemJQ.show()
    }

    let showHideOptions = {
      'duration': 400
    }
    hideNotesElemJQ.click(() => {
      notesElemJQ.hide(showHideOptions)
      showNotesElemJQ.show(showHideOptions)
      localStorage.setItem('hideNotes', '1')
    })
    showNotesElemJQ.click(() => {
      notesElemJQ.show(showHideOptions)
      showNotesElemJQ.hide(showHideOptions)
      localStorage.removeItem('hideNotes')
    })
  }


  ClearErrors() {
    $('.error').remove()
  }


  ClearResult() {
    this.combineItemTable.Clear()
    this.detailsTable.Clear()
  }


  ShowCombinedItems(combinedItems) {
    this.combineItemTable.SetItems(combinedItems)
  }


  // returns object;
  // - data: FormData
  // - withErrors: bool
  // - mergedSourceItems: bool
  GetData(mergeSourceItems) {
    let sourceItemsResult = this.sourceItemTable.GetItems(new ItemCollector(mergeSourceItems))
    let desiredItemResult = this.desiredItemTable.GetItems(new ItemCollector(false))

    let data = new FormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItemResult.items[0])

    let withErrors =
      sourceItemsResult.withErrors ||
      desiredItemResult.withErrors

    return {
      'data': data,
      'withErrors': withErrors,
      'mergedSourceItems': sourceItemsResult.mergedItems
    }
  }


  SetData(data) {
    this.ClearResult()
    this.sourceItemTable.SetItems(data.sourceItems)
    this.desiredItemTable.SetItems([data.desiredItem])
  }


  // returns bool (if loading was successful)
  Load() {
    let allOK = true
    let stream = new DataStream(false)
    let conflictSolver = new DataStreamConflictSolver()
    if (stream.Load(conflictSolver)) {
      let data = new FormData()
      allOK = data.Deserialize(stream)
      if (allOK)
        this.SetData(data)
    }

    return allOK
  }


  // returns bool (if saving was successful)
  Save(toURL) {
    this.ClearErrors()

    let dataInContext = this.GetData(false)
    if (!dataInContext.withErrors) {
      let stream = new DataStream(true)
      dataInContext.data.Serialize(stream)

      if (toURL)
        stream.SaveToURL()
      else
        stream.SaveToLocalStorage()
    }

    return !dataInContext.withErrors
  }
}
