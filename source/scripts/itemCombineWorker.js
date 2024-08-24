/*
  Web worker for doing the actual item combining.

  Startup message data:
  - desiredItem: Item (dehydrated}
  - sourceItems: Item[] (dehydrated)
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
    - ratedItemGroups: RatedItemGroups (dehydrated)
    - maxProgress: int
    - timeInMS: int
*/


// scripts
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
importScripts('ratedItem.js')
importScripts('combineResultFilter.js')
// /scripts


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


  TellDone(ratedItemGroups, maxProgress) {
    postMessage({
      type: 2,
      ratedItemGroups: ratedItemGroups,
      maxProgress: maxProgress,
      timeInMS: Date.now() - this.startTimeMS
    })
  }
}


onmessage = (e) => {
  let desiredItem = e.data.desiredItem
  Item.Rehydrate(desiredItem)
  let sourceItems = e.data.sourceItems
  RehydrateItems(sourceItems)
  let feedbackIntervalMS = e.data.feedbackIntervalMS
  let numItemsToTake = e.data.numItemsToTake

  let feedbackHandler = new FeedbackHandler(feedbackIntervalMS)

  let itemCombiner = new ItemCombiner()
  let combineResult = itemCombiner.GetAllItemCombinations(sourceItems, desiredItem, feedbackHandler)

  feedbackHandler.TellFinalizing()
  let combineResultFilter = new CombineResultFilter(desiredItem)
  let ratedItemGroups = combineResultFilter.FilterItems(sourceItems, combineResult.combinedItems, numItemsToTake)

  feedbackHandler.TellDone(ratedItemGroups, combineResult.maxProgress)
}
