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
    result: undefined,
    stoppedResponding: false
  }

  // Note: the path should be relative to the html document loading us!
  let combineWorker = new Worker('../source/scripts/itemCombineWorker.js')

  let lastFeedback = Date.now()
  let promise = new Promise((resolve, reject) => {
    combineWorker.onmessage = (e) => {
      switch (e.data.type) {
        case 0:
          status.progressCalled = true
          lastFeedback = Date.now()
          if (progressCallback !== undefined)
            progressCallback(combineWorker, e.data.progress, e.data.maxProgress)
          break
        case 1:
          status.finalizeCalled = true
          break
        case 2:
          status.doneCalled = true
          status.result = e.data.result
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


jazil.AddTestSet(omeoPage, 'ItemCombineWorker', {
  'Worker goes through the motions with no items': async (jazil) => {
    let sourceItems = [
    ]
    let desiredItem = BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
    ]

    let status = await TestWorker(sourceItems, desiredItem)

    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'combined', g_combined)
  },

  'Worker combines basic items': async (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:1 }] }),
      BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }] }),
    ]
    let desiredItem = BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
      BuildItem({ name:'Sword', priorWork:1, cost:2, count:1, enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    ]

    let status = await TestWorker(sourceItems, desiredItem)

    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'combined', g_combined)
  },

  'Progress always increases': async (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:1 }] }),
      BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }] }),
    ]
    let desiredItem = BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
      BuildItem({ name:'Sword', priorWork:1, cost:2, count:1, enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    ]

    let prevProgress = -1
    let prevMaxProgress = -1
    let progressIncreases = true
    let maxProgressIncreases = true
    let progressCallback = (combineWorker, progress, maxProgress) => {
      // Note: >= and not >, since progress should always increase.
      if (prevProgress >= progress)
        progressIncreases = false
      prevProgress = progress

      if (prevMaxProgress > maxProgress)
        maxProgressIncreases = false
      prevMaxProgress = maxProgress
    }

    let status = await TestWorker(sourceItems, desiredItem, progressCallback)

    jazil.Assert(progressIncreases, 'progress is not increasing!')
    jazil.Assert(maxProgressIncreases, 'maxProgress is not increasing!')
    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.stoppedResponding, false, 'stopped responding!')
    jazil.ShouldBe(status.finalizeCalled, true, 'finalize not called!')
    jazil.ShouldBe(status.doneCalled, true, 'done not called!')
    jazil.ShouldNotBe(status.result, undefined, 'result is not returned!')
    TestItemListsMatch(jazil, expectedItems, 'expected', status.result.items, 'combined', g_combined)
  },

  'Worker can be cancelled': async (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:1 }] }),
      BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }] }),
    ]
    let desiredItem = BuildItem({ name:'Sword', enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    let expectedItems = [
      BuildItem({ name:'Sword', priorWork:1, cost:2, count:1, enchants:[{ name:'Unbreaking', level:1 }, { name:'Smite', level:1 }] })
    ]

    let progressCallback = (combineWorker, progress, maxProgress) => {
      if (progress > 3)
        combineWorker.terminate()
    }

    let status = await TestWorker(sourceItems, desiredItem, progressCallback)
    jazil.ShouldBe(status.progressCalled, true, 'progress not called!')
    jazil.ShouldBe(status.finalizeCalled, false, 'finalize called!')
    jazil.ShouldBe(status.doneCalled, false, 'done called!')
    jazil.ShouldBe(status.result, undefined, 'result is returned!')
    jazil.ShouldBe(status.stoppedResponding, true, 'didn\'t stop responding!')
  },

})
