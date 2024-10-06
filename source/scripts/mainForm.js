/*
  Main form (page I/O) management.  Links all buttons to action handlers, and
  populates form element values/options.

  Prerequisites:
  - settings.js
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - sourceItemTable.js
  - desiredItemSection.js
  - combinedItemTable.js
  - itemRow.js
  - mainFormData.js
  - dataStream.js
  - itemCombiner.js
  - combineResultFilter.js
  - recipeFormData.js
  - itemCostTreeFinalizer.js

  Defined classes:
  - MainForm
*/


// ======== PUBLIC ========


class MainForm {
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


  ShowRecipePage(item) {
    let recipeStream = new DataStream(true)

    let clone = new ItemCostTreeFinalizer(item).UpdateCostsForRename()

    let recipeFormData = new RecipeFormData()
    recipeFormData.SetItem(clone)
    recipeFormData.Serialize(recipeStream)

    let ourStream = new DataStream(true)
    let extraData =
      this.SaveToStream(ourStream) ?
      '&data=' + ourStream.GetData() :
      ''

    let baseURL = new URL('recipe.html', document.baseURI)
    let recipeUrl = recipeStream.GetAsURL(baseURL) + extraData
    window.open(recipeUrl)
  }


  InitializeSubObjects() {
    this.sourceItemTable = new SourceItemTable($('#sources table'), $('#addSourceItem'))
    this.desiredItemSection = new DesiredItemSection($('#desired .item'))
    this.renameTooElemJQ = $('#desired #renameToo')

    let ShowDetailsCallback = (item) => {
      this.ShowRecipePage(item)
    }
    this.combineItemTable = new CombinedItemTable($('#combined table'), ShowDetailsCallback)
  }


  HookUpGUI() {
    $('#autoFillSources').click(() => {
      this.AutoFillSources()
    })

    $('#divine').click(() => {
      this.PerformDivine()
    })

    $('#makeBookmark').click(() => {
      if (!this.Save(true))
        this.formHandler.TellFailedToSaveOnRequest()
    })
  }


  ContinueFillSources() {
    let dataInContext = this.GetData(true, false)
    if (dataInContext.withCountErrors)
      this.formHandler.TellDataInErrorForFillSources()
    else {
      let desiredItem = dataInContext.data.desiredItem
      let desiredParts = desiredItem.SplitIntoParts(g_source)
      this.sourceItemTable.SetItems(desiredParts)
    }
  }


  AutoFillSources() {
    if (!this.sourceItemTable.HasItems())
      this.ContinueFillSources()
    else
      this.formHandler.AskMayOverwriteSources(() => { this.ContinueFillSources() })
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
          let filteredCombinedItems = e.data.filteredCombinedItems
          filteredCombinedItems.ratedItemsByMatch.forEach((ratedItems) => {
            RehydrateRatedItems(ratedItems)
          })

          this.ShowCombinedItems(filteredCombinedItems)

          this.formHandler.TellCombineDone(filteredCombinedItems, e.data.maxProgress, e.data.timeInMS)
          break
      }
    }

    this.combineWorker.postMessage({
      type: 0,
      sourceItems: dataInContext.data.sourceItems,
      desiredItem: dataInContext.data.desiredItem,
      renameToo: dataInContext.data.renameToo,
      feedbackIntervalMS: g_mfSettings.feedbackIntervalMS,
      numItemsToTake: g_mfSettings.numItemsPerGroup
    })
  }


  PerformDivine() {
    this.ClearErrors()
    this.ClearResult()

    let dataInContext = this.GetData(false, true)
    if (dataInContext.withCountErrors)
      this.formHandler.TellDataInErrorForDivine()
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
      'duration': g_mfSettings.showHideSpeedMS
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
  }


  ShowCombinedItems(filteredCombinedItems) {
    this.combineItemTable.SetCombinedItems(filteredCombinedItems)
  }


  // returns object;
  // - data: MainFormData
  // - withCountErrors: bool
  // - mergedSourceItems: bool
  GetData(onlyDesiredItem, mergeSourceItems) {
    let sourceItemsResult
    if (onlyDesiredItem)
      sourceItemsResult = {
        items: [],
        withCountErrors: false,
        countErrorElemJQs: []
      }
    else
      sourceItemsResult = this.sourceItemTable.ExtractItems(new ItemCollector(mergeSourceItems))
    let desiredItemResult = this.desiredItemSection.ExtractItems(new ItemCollector(false))
    let renameToo = this.renameTooElemJQ.prop('checked')

    let data = new MainFormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItemResult.items[0])
    data.SetRenameToo(renameToo)

    let withCountErrors = sourceItemsResult.withCountErrors
    if (withCountErrors) {
      sourceItemsResult.countErrorElemJQs.forEach((countErrorElemJQ) => {
        this.formHandler.NoteCountError(countErrorElemJQ)
      })
    }

    return {
      data: data,
      withCountErrors: withCountErrors,
      mergedSourceItems: sourceItemsResult.mergedItems
    }
  }


  SetData(data) {
    this.ClearResult()
    this.sourceItemTable.SetItems(data.sourceItems)
    this.desiredItemSection.SetItem(data.desiredItem)
    this.renameTooElemJQ.prop('checked', data.renameToo)
  }


  StartLoading() {
    let loadingOptions = new DataStreamLoadingOptions()

    let ContinueLoading = () => {
      let allOK = true
      let stream = new DataStream(false)
      if (stream.Load(loadingOptions)) {
        let data = new MainFormData()
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


  // returns bool
  SaveToStream(stream) {
    let dataInContext = this.GetData(false, false)
    if (dataInContext.withCountErrors)
      return false

    dataInContext.data.Serialize(stream)
    return true
  }


  // returns bool (if saving was successful)
  Save(toURL) {
    this.ClearErrors()

    let stream = new DataStream(true)
    if (!this.SaveToStream(stream))
      return false

    if (toURL)
      stream.SaveToBookmarkLink()
    else
      stream.SaveToLocalStorage()

    return true
  }
}
