/*
  Web worker for doing the actual item combining.

  Startup message data:
  - desiredItem: Item (dehydrated}
  - sourceItems: Item[] (dehydrated)
  - renameToo: bool
  - feedbackIntervalMS: int
  - numItemsToTake: int

  Feedback messages:
  - progress:
    - type: 0
    - progress: int
    - maxProgress: int
    - timeInMS: int
  - finalizing:
    - type: 1
  - done:
    - type: 2
    - filteredCombinedItems: FilteredCombinedItems (dehydrated)
    - maxProgress: int
    - timeInMS: int
*/


importScripts('script.js?v=d7da996f')


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


  TellDone(filteredCombinedItems, maxProgress) {
    postMessage({
      type: 2,
      filteredCombinedItems: filteredCombinedItems,
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
  let numItemsToTake = e.data.numItemsToTake

  let feedbackHandler = new FeedbackHandler(feedbackIntervalMS)

  let itemCombiner = new ItemCombiner()
  let combineResult = itemCombiner.GetAllItemCombinations(sourceItems, desiredItem, renameToo, feedbackHandler)

  feedbackHandler.TellFinalizing()
  let combineResultFilter = new CombineResultFilter(desiredItem, renameToo)
  let filteredCombinedItems = combineResultFilter.FilterItems(combineResult.combinedItems, numItemsToTake)

  feedbackHandler.TellDone(filteredCombinedItems, combineResult.maxProgress)
}
