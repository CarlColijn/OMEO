/*
  Main form (page I/O) management.  Links all buttons to action handlers, and
  populates form element values/options.

  Prerequisites:
  - settings.js
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - sourceItemTable.js
  - desiredItemTable.js
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
    this.desiredItemTable = new DesiredItemTable($('#desired table'))
    this.renameTooElemJQ = $('#desired #renameToo')

    let ShowDetailsCallback = (item) => {
      this.ShowRecipePage(item)
    }
    this.combineItemTable = new CombinedItemTable($('#combined table'), ShowDetailsCallback)
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
    this.combineWorker = new Worker(`scripts/itemCombineWorker.js?v=${g_mfSettings.webWorkerURLVersion}`)

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
  // - withEnchantConflicts: bool
  // - withEnchantDupes: bool
  // - mergedSourceItems: bool
  GetData(mergeSourceItems) {
    let sourceItemsResult = this.sourceItemTable.GetItems(new ItemCollector(mergeSourceItems))
    let desiredItemResult = this.desiredItemTable.GetItem(new ItemCollector(false))
    let renameToo = this.renameTooElemJQ.prop('checked')

    let data = new MainFormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItemResult.items[0])
    data.SetRenameToo(renameToo)

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
    this.desiredItemTable.SetItem(data.desiredItem)
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
    let dataInContext = this.GetData(false)
    if (dataInContext.withCountErrors || dataInContext.withEnchantDupes)
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
