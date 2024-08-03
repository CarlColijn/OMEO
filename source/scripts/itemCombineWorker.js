/*
  Web worker for doing the actual item combining.

  Input:
  object with:
  - sourceItems: Item[]
  - desiredItem: Item

  Output:
  cleanedUpItemsResult:

  Instruction messages:
  - start;
    - desiredItem: Item (dehydrated}
    - sourceItems: Item[] (dehydrated)
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
      maxProgress: maxProgress
    })
  }


  TellFinalizing() {
    postMessage({
      type: 1
    })
  }


  TellDone(cleanedUpItemsResult) {
    postMessage({
      type: 2,
      result: cleanedUpItemsResult
    })
  }
}


onmessage = (e) => {
  let desiredItem = e.data.desiredItem
  Item.Rehydrate(desiredItem)
  let sourceItems = e.data.sourceItems
  RehydrateItems(sourceItems)
  let feedbackIntervalMS = e.data.feedbackIntervalMS

  let feedbackHandler = new FeedbackHandler(feedbackIntervalMS)

  let itemCombiner = new ItemCombiner()
  let combinedItems = itemCombiner.GetAllItemCombinations(sourceItems, desiredItem, feedbackHandler)

  feedbackHandler.TellFinalizing()
  let combineResultFilter = new CombineResultFilter(desiredItem)
  let cleanedUpItemsResult = combineResultFilter.GetCleanedUpItemList(sourceItems, combinedItems)

  feedbackHandler.TellDone(cleanedUpItemsResult)
}
