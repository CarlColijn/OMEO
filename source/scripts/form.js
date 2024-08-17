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
  - itemCombiner.js
  - combineResultFilter.js

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

    this.StartLoading()
  }


  ShutDown(event) {
    if (!this.Save(false))
      this.formHandler.FailedToSaveOnUnload(event)
  }


  InitializeSubObjects() {
    let detailsHeaderElem = $('#details')[0]
    let ShowDetails = (item) => {
      this.detailsTable.ShowItem(item)
      detailsHeaderElem.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      })
    }

    this.sourceItemTable = new ItemTable(undefined, $('#sources table'), $('#addSourceItem'), g_source)
    this.desiredItemTable = new ItemTable(undefined, $('#desired table'), undefined, g_desired)
    this.combineItemTable = new ItemTable(ShowDetails, $('#combines table'), undefined, g_combined)
    this.detailsTable = new DetailsTable($('#details table'))
  }


  HookUpGUI() {
    $('#divine').click(() => {
      this.PerformDivine()
    })

    $('#makeBookmark').click(() => {
      if (!this.Save(true))
        this.formHandler.TellFailedToSaveOnRequest()
    })
  }


  ContinueDivine(dataInContext) {
    this.formHandler.TellCombineStarting(() => {
      this.ExitDivine()
    })

    // Note: the path should be relative to the html document loading us!
    this.combineWorker = new Worker('scripts/itemCombineWorker.js')

    this.combineWorker.onmessage = (e) => {
      switch (e.data.type) {
        case 0:
          this.formHandler.TellCombineProgress(e.data.progress, e.data.maxProgress, e.data.timeInMS)
          break
        case 1:
          this.formHandler.TellCombineFinalizing()
          break
        case 2:
          let cleanedUpItemsResult = e.data.result
          RehydrateItems(cleanedUpItemsResult.items)
          cleanedUpItemsResult.level = CombineResultLevel.GetRehydrated(cleanedUpItemsResult.level)

          this.ShowCombinedItems(cleanedUpItemsResult.items)

          this.formHandler.TellCombineDone(cleanedUpItemsResult.level, cleanedUpItemsResult.hasSources, e.data.maxProgress, e.data.timeInMS)
          break
      }
    }

    this.combineWorker.postMessage({
      type: 0,
      sourceItems: dataInContext.data.sourceItems,
      desiredItem: dataInContext.data.desiredItem,
      feedbackIntervalMS: 100
    })
  }


  PerformDivine() {
    this.ClearErrors()
    this.ClearResult()

    let dataInContext = this.GetData(true)
    if (dataInContext.withCountErrors || dataInContext.withEnchantConflicts || dataInContext.withEnchantDupes)
      this.formHandler.TellDataInError()
    else {
      let ContinueCombine = () => {
        this.ContinueDivine(dataInContext)
      }

      if (dataInContext.mergedSourceItems)
        this.formHandler.TellItemsMerged(ContinueCombine)
      else
        ContinueCombine()
    }
  }


  ExitDivine() {
    if (this.combineWorker !== undefined) {
      this.combineWorker.terminate()
      this.combineWorker = undefined
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
    this.formHandler.ClearErrors()
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
  // - withCountErrors: bool
  // - withEnchantConflicts: bool
  // - withEnchantDupes: bool
  // - mergedSourceItems: bool
  GetData(mergeSourceItems) {
    let sourceItemsResult = this.sourceItemTable.GetItems(new ItemCollector(mergeSourceItems))
    let desiredItemResult = this.desiredItemTable.GetItems(new ItemCollector(false))

    let data = new FormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItemResult.items[0])

    let withCountErrors =
      sourceItemsResult.withCountErrors ||
      desiredItemResult.withCountErrors
    if (withCountErrors) {
      let countErrorElemJQs = [...sourceItemsResult.countErrorElemJQs, ...desiredItemResult.countErrorElemJQs]
      countErrorElemJQs.forEach((countErrorElemJQ) => {
        this.formHandler.NoteCountError(countErrorElemJQ)
      })
    }

    let withEnchantConflicts =
      sourceItemsResult.withEnchantConflicts ||
      desiredItemResult.withEnchantConflicts
    if (withEnchantConflicts) {
      let enchantConflictInfos = [...sourceItemsResult.enchantConflictInfos, ...desiredItemResult.enchantConflictInfos]
      enchantConflictInfos.forEach((enchantConflictInfo) => {
        this.formHandler.NoteEnchantConflict(enchantConflictInfo)
      })
    }

    let withEnchantDupes =
      sourceItemsResult.withEnchantDupes ||
      desiredItemResult.withEnchantDupes
    if (withEnchantDupes) {
      let enchantDupeElemJQs = [...sourceItemsResult.enchantDupeElemJQs, ...desiredItemResult.enchantDupeElemJQs]
      enchantDupeElemJQs.forEach((enchantDupeElemJQ) => {
        this.formHandler.NoteEnchantDupe(enchantDupeElemJQ)
      })
    }

    return {
      data: data,
      withCountErrors: withCountErrors,
      withEnchantConflicts: withEnchantConflicts,
      withEnchantDupes: withEnchantDupes,
      mergedSourceItems: sourceItemsResult.mergedItems
    }
  }


  SetData(data) {
    this.ClearResult()
    this.sourceItemTable.SetItems(data.sourceItems)
    this.desiredItemTable.SetItems([data.desiredItem])
  }


  StartLoading() {
    let loadingOptions = new DataStreamLoadingOptions()

    let ContinueLoading = () => {
      let allOK = true
      let stream = new DataStream(false)
      if (stream.Load(loadingOptions)) {
        let data = new FormData()
        allOK = data.Deserialize(stream)
        if (allOK)
          this.SetData(data)
      }

      if (!allOK)
        this.formHandler.FailedToLoad()
    }

    if (!loadingOptions.inConflict)
      ContinueLoading()
    else {
      this.formHandler.AskLoadFromURLOrLocalStorage(() => {
        loadingOptions.ChooseLocalStorage()
        ContinueLoading()
      },
      () => {
        loadingOptions.ChooseURL()
        ContinueLoading()
      })
    }
  }


  // returns bool (if saving was successful)
  Save(toURL) {
    this.ClearErrors()

    let dataInContext = this.GetData(false)
    let dataOK = !dataInContext.withCountErrors && !dataInContext.withEnchantDupes
    if (dataOK) {
      let stream = new DataStream(true)
      dataInContext.data.Serialize(stream)

      if (toURL)
        stream.SaveToURL()
      else
        stream.SaveToLocalStorage()
    }

    return dataOK
  }
}
