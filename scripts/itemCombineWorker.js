/*
  Web worker for doing the actual item combining.

  Input:
  object with:
  - sourceItems: Item[]
  - desiredItem: Item
  - renameToo: bool

  Output:
  cleanedUpItemsResult:

  Instruction messages:
  - start;
    - sourceItems: Item[] (dehydrated)
    - desiredItem: Item (dehydrated}
    - renameToo: bool
    - feedbackIntervalMS: int
  Feedback messages:
  - type: 0 = progress; extra data items:
    - progress: int
    - maxProgress: int
  - type: 1 = finalizing; no extra data items
  - type: 2 = done; extra data items:
    - result: Item[] (dehydrated)
*/


importScripts('dataSets.js')
importScripts('enchantInfo.js')
importScripts('enchantConflicts.js')
importScripts('enchant.js')
importScripts('enchantCombiner.js')
importScripts('itemInfo.js')
importScripts('itemOrigins.js')
importScripts('item.js')
importScripts('itemCombineList.js')
importScripts('itemCombineTester.js')
importScripts('itemCombiner.js')
importScripts('combineResultFilter.js')


// ======== PUBLIC ========


class FeedbackHandler {
  constructor(feedbackIntervalMS) {
    this.feedbackIntervalMS = feedbackIntervalMS

    // Set the previous feedback time waaay into the past
    // so that feedback will already be given the first
    // time round.
    this.prevFeedbackTimeMS = 0

    this.startTimeMS = Date.now()
  }


  TimeForFeedback() {
    let nowMS = Date.now()
    let itsTime = nowMS - this.prevFeedbackTimeMS > this.feedbackIntervalMS
    if (itsTime)
      this.prevFeedbackTimeMS = nowMS
    return itsTime
  }


  TellProgress(progress, maxProgress) {
    postMessage({
      type: 0,
      progress: progress,
      maxProgress: maxProgress,
      timeInMS: Date.now() - this.startTimeMS
    })
  }


  TellFinalizing() {
    postMessage({
      type: 1
    })
  }


  TellDone(cleanedUpItemsResult, maxProgress) {
    postMessage({
      type: 2,
      result: cleanedUpItemsResult,
      maxProgress: maxProgress,
      timeInMS: Date.now() - this.startTimeMS
    })
  }
}


onmessage = (e) => {
  let sourceItems = e.data.sourceItems
  RehydrateItems(sourceItems)
  let desiredItem = e.data.desiredItem
  Item.Rehydrate(desiredItem)
  let renameToo = e.data.renameToo
  let feedbackIntervalMS = e.data.feedbackIntervalMS

  let feedbackHandler = new FeedbackHandler(feedbackIntervalMS)

  let itemCombiner = new ItemCombiner()
  let combineResult = itemCombiner.GetAllItemCombinations(sourceItems, desiredItem, renameToo, feedbackHandler)

  feedbackHandler.TellFinalizing()
  let combineResultFilter = new CombineResultFilter(desiredItem)
  let cleanedUpItemsResult = combineResultFilter.GetCleanedUpItemList(sourceItems, combineResult.combinedItems)

  feedbackHandler.TellDone(cleanedUpItemsResult, combineResult.maxProgress)
}
