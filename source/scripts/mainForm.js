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

    window.addEventListener('load', () => {
      this.StartUp()
    })

    window.addEventListener('unload', () => {
      this.ShutDown()
    })
  }


  // ======== PRIVATE ========


  StartUp() {
    this.InitializeSubObjects()

    this.HookUpGUI()

    this.InitializeNotesSection()

    this.StartLoading()
  }


  ShutDown() {
    this.Save(false)
  }


  ShowRecipePage(item) {
    let recipeStream = new DataStream(true)

    let clone = new ItemCostTreeFinalizer(item).UpdateCostsForRename()

    let recipeFormData = new RecipeFormData()
    recipeFormData.SetItem(clone)
    recipeFormData.Serialize(recipeStream)

    let ourStream = new DataStream(true)
    let extraData =
      this.SaveToStream(ourStream, false) ?
      '&data=' + ourStream.GetData() :
      ''

    let baseURL = new URL('recipe.html', document.baseURI)
    let recipeUrl = recipeStream.GetAsURL(baseURL) + extraData
    window.open(recipeUrl)
  }


  InitializeSubObjects() {
    this.sourceItemTable = new SourceItemTable(document.querySelector('#sources table'), document.getElementById('addSourceItem'))
    this.desiredItemSection = new DesiredItemSection(document.querySelector('#desired .item'), (maxEnchantsCallbackInfo) => { return this.AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo) })
    this.renameTooElem = document.getElementById('renameToo')

    let ShowDetailsCallback = (item) => {
      this.ShowRecipePage(item)
    }
    this.combineItemTable = new CombinedItemTable(document.querySelector('#combined table'), ShowDetailsCallback)
  }


  HookUpGUI() {
    document.querySelector('#autoFillSources').addEventListener('click', () => {
      this.AutoFillSources()
    })

    document.querySelector('#divine').addEventListener('click', () => {
      this.PerformDivine()
    })

    document.querySelector('#makeBookmark').addEventListener('click', () => {
      if (!this.Save(true))
        this.formHandler.TellFailedToSaveOnRequest()
    })
  }


  AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo) {
    this.formHandler.AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo)
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
    let notesElem = document.getElementById('notes')
    let hideNotesElem = document.getElementById('hideNotes')
    let showNotesElem = document.getElementById('showNotes')

    let notesHeight = notesElem.clientHeight

    let SetNotesVisibility = (mustShow, interactive) => {
      hideNotesElem.style.display = mustShow ? 'inline-block' : 'none'
      showNotesElem.style.display = mustShow ? 'none' : 'inline-block'
      if (!interactive)
        notesElem.style.display = mustShow ? 'block' : 'none'
      else {
        if (mustShow)
          hideNotesElem.focus()
        else
          showNotesElem.focus()
        AnimateElementVisibility(notesElem, mustShow, 'block', g_mfSettings.showHideSpeedMS)
      }
    }

    let mustShowNotes = localStorage.getItem('hideNotes') == null
    SetNotesVisibility(mustShowNotes, false)

    hideNotesElem.addEventListener('click', () => {
      SetNotesVisibility(false, true)
      localStorage.setItem('hideNotes', '1')
    })
    showNotesElem.addEventListener('click', () => {
      SetNotesVisibility(true, true)
      localStorage.removeItem('hideNotes')
    })
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
        withCountErrors: false
      }
    else
      sourceItemsResult = this.sourceItemTable.ExtractItems(new SourceItemCollector(mergeSourceItems))
    let desiredItem = this.desiredItemSection.GetItem()
    let renameToo = this.renameTooElem.checked

    let data = new MainFormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItem)
    data.SetRenameToo(renameToo)

    return {
      data: data,
      withCountErrors: sourceItemsResult.withCountErrors,
      mergedSourceItems: sourceItemsResult.mergedItems
    }
  }


  SetData(data) {
    this.ClearResult()
    this.sourceItemTable.SetItems(data.sourceItems)
    this.desiredItemSection.SetItem(data.desiredItem)
    this.renameTooElem.checked = data.renameToo
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
  SaveToStream(stream, ignoreCountErrors) {
    let dataInContext = this.GetData(false, false)
    if (dataInContext.withCountErrors && !ignoreCountErrors)
      return false

    dataInContext.data.Serialize(stream)
    return true
  }


  // returns bool (if saving was successful)
  Save(toURL) {
    let stream = new DataStream(true)
    if (!this.SaveToStream(stream, !toURL))
      return false

    if (toURL)
      stream.SaveToBookmarkLink()
    else
      stream.SaveToLocalStorage()

    return true
  }
}
