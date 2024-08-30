// Returns object:
// - progressCalled: bool
// - finalizeCalled: bool
// - doneCalled: bool
// - result: CombineResultFilter result object
// - stoppedResponding: bool
async function TestWorker(sourceItems, desiredItem, progressCallback = undefined) {
  class WorkerStoppedResponding {}

  let status = {
    progressCalled: false,
    finalizeCalled: false,
    doneCalled: false,
    finalMaxProgress: 0,
    result: undefined,
    timeInMSReported: 0,
    timeInMSMeasured: 0,
    stoppedResponding: false
  }

  // Note: the path should be relative to the html document loading us!
  let combineWorker = new Worker('../source/scripts/itemCombineWorker.js')

  let startTimeInMS = Date.now()
  let lastFeedback = startTimeInMS
  let promise = new Promise((resolve, reject) => {
    combineWorker.onmessage = (e) => {
      switch (e.data.type) {
        case 0:
          status.progressCalled = true
          lastFeedback = Date.now()
          if (progressCallback !== undefined)
            progressCallback(combineWorker, e.data.progress, e.data.maxProgress, e.data.timeInMS)
          break
        case 1:
          status.finalizeCalled = true
          break
        case 2:
          status.doneCalled = true
          status.result = e.data.result
          status.finalMaxProgress = e.data.maxProgress
          status.timeInMSMeasured = Date.now() - startTimeInMS
          status.timeInMSReported = e.data.timeInMS
          resolve()
          break
      }
    }

    // Pass something negative as the feedback interval so that
    // every combination is reflected with a progress callback.
    combineWorker.postMessage({
      type: 0,
      sourceItems: sourceItems,
      desiredItem: desiredItem,
      feedbackIntervalMS: -1
    })

    let intervalID = setInterval(
      () => {
        if (Date.now() - lastFeedback > 1000) {
          clearInterval(intervalID)
          reject(new WorkerStoppedResponding())
        }
      },
      100
    )
  })

  try {
    await promise

    RehydrateItems(status.result.items)
  }
  catch (exception) {
    if (exception instanceof WorkerStoppedResponding)
      status.stoppedResponding = true
    else
      throw exception
  }

  return status
}


jazil.AddTestSet(mainPage, 'ItemCombineWorker', {
  'Worker goes through the motions with no items': async (jazil) => {
    let sourceItems = [
    ]
    let desiredItem = BuildItem({ set:g_desired, name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
    ]

    let status = await TestWorker(sourceItems, desiredItem)

    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldBeBetween(status.timeInMSReported, status.timeInMSMeasured - 500, status.timeInMSMeasured, 'timeInMS diverges too much!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'combined')
  },

  'Worker combines basic items': async (jazil) => {
    let sourceItems = [
      BuildItem({ set:g_source, name:'Sword', enchants:[{ name:'Smite', level:1 }] }),
      BuildItem({ set:g_source, name:'Sword', enchants:[{ name:'Unbreaking', level:1 }] }),
    ]
    let desiredItem = BuildItem({ set:g_desired, name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
      BuildItem({ set:g_combined, name:'Sword', priorWork:1, cost:2, count:1, enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    ]

    let status = await TestWorker(sourceItems, desiredItem)

    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldBeBetween(status.timeInMSReported, status.timeInMSMeasured - 500, status.timeInMSMeasured, 'timeInMS diverges too much!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'combined')
  },

  'Max cost combine works': async (jazil) => {
    let sourceItems = [
      BuildItem({ set:g_source, tag:0, name:'Sword' }),
      BuildItem({ set:g_source, tag:1, name:'Book', priorWork:5, enchants:[{ name:'Unbreaking', level:3 }, { name:'Smite', level:3 }, { name:'Mending', level:1 }]}),
    ]
    let desiredItem = BuildItem({ set:g_desired, name:'Sword', enchants:[{ name:'Unbreaking' }]})
    let expectedItems = [
      BuildItem({ set:g_combined, tag:2, name:'Sword', cost:39, priorWork:6, enchants:[{ name:'Unbreaking', level:3 }, { name:'Smite', level:3 }, { name:'Mending', level:1 }]}),
    ]

    let status = await TestWorker(sourceItems, desiredItem)

    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldBeBetween(status.timeInMSReported, status.timeInMSMeasured - 500, status.timeInMSMeasured, 'timeInMS diverges too much!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'combined')
  },

  'Too costly combine gives nothing back': async (jazil) => {
    let sourceItems = [
      BuildItem({ set:g_source, tag:0, name:'Sword' }),
      BuildItem({ set:g_source, tag:1, name:'Book', priorWork:5, enchants:[{ name:'Unbreaking', level:3 }, { name:'Smite', level:4 }, { name:'Mending', level:1 }]}),
    ]
    let desiredItem = BuildItem({ set:g_desired, name:'Sword', enchants:[{ name:'Unbreaking' }]})
    let expectedItems = [
      //BuildItem({ set:g_combined, tag:2, name:'Sword', cost:40, priorWork:6, enchants:[{ name:'Unbreaking', level:3 }, { name:'Smite', level:4 }, { name:'Mending', level:1 }]}),
      // Item list filtering will revert back to source item
      sourceItems[0]
    ]

    let status = await TestWorker(sourceItems, desiredItem)

    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldBeBetween(status.timeInMSReported, status.timeInMSMeasured - 500, status.timeInMSMeasured, 'timeInMS diverges too much!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'source')
  },

  'Progress indicators are correct': async (jazil) => {
    let sourceItems = [
      BuildItem({ set:g_source, name:'Sword', count:20, enchants:[{ name:'Smite', level:1 }] }),
      BuildItem({ set:g_source, name:'Sword', count:20, enchants:[{ name:'Unbreaking', level:1 }] }),
      BuildItem({ set:g_source, name:'Book', count:20, enchants:[{ name:'Looting', level:1 }] }),
      BuildItem({ set:g_source, name:'Book', count:20, enchants:[{ name:'Bane of Arthropods', level:1 }] }),
    ]
    let desiredItem = BuildItem({ set:g_desired, name:'Sword', enchants:[{ name:'Unbreaking', level:3 }, { name:'Smite', level:5 }, { name:'Looting', level:3}, { name:'Bane of Arthropods', level:5 }] })

    let prevProgress = -1
    let prevMaxProgress = -1
    let prevTimeInMS = -1
    let progressIncreases = true
    let maxProgressIncreases = true
    let timeInMSIncreases = true
    let progressCallback = (combineWorker, progress, maxProgress, timeInMS) => {
      // Note: >= and not >, since progress should always increase.
      if (prevProgress >= progress)
        progressIncreases = false
      prevProgress = progress

      if (prevMaxProgress > maxProgress)
        maxProgressIncreases = false
      prevMaxProgress = maxProgress

      if (prevTimeInMS > timeInMS)
        timeInMSIncreases = false
      prevTimeInMS = timeInMS
    }

    let status = await TestWorker(sourceItems, desiredItem, progressCallback)

    jazil.Assert(progressIncreases, 'progress is not increasing!')
    jazil.Assert(maxProgressIncreases, 'maxProgress is not increasing!')
    jazil.Assert(timeInMSIncreases, 'timeInMS is not increasing!')
    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.finalMaxProgress, prevMaxProgress, 'final max progress incorrect!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldBeBetween(status.timeInMSReported, status.timeInMSMeasured - 500, status.timeInMSMeasured, 'timeInMS diverges too much!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    // We won't test with TestItemListsMatch; this is covered by other unit tests
    // anyway and we want a more time consuming thus more complex combine round
    // for this test.
  },

  'Worker can be cancelled': async (jazil) => {
    let sourceItems = [
      BuildItem({ set:g_source, name:'Sword', enchants:[{ name:'Smite', level:1 }] }),
      BuildItem({ set:g_source, name:'Sword', enchants:[{ name:'Unbreaking', level:1 }] }),
    ]
    let desiredItem = BuildItem({ set:g_desired, name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
      BuildItem({ set:g_combined, name:'Sword', priorWork:1, cost:2, count:1, enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    ]

    let progressCallback = (combineWorker, progress, maxProgress) => {
      if (progress > 3)
        combineWorker.terminate()
    }

    let status = await TestWorker(sourceItems, desiredItem, progressCallback)
    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.finalizeCalled, false, 'finalize called!')
    jazil.ShouldBe(status.doneCalled, false, 'done called!')
    jazil.ShouldBeBetween(status.timeInMSReported, status.timeInMSMeasured - 500, status.timeInMSMeasured, 'timeInMS diverges too much!')
    jazil.ShouldBe(status.result, undefined, 'result is returned!')
    jazil.ShouldBe(status.stoppedResponding, true, 'didn\'t stop responding!')
  },

})
