// Note: make it long-ish with some substantial wiggle room; the javascript
// engine is quite busy already, so using small-ish intervals will result in
// missed testing opportunities.
let g_animationTime = 500
let g_duringAnimationEndTime = 400
let g_afterAnimationEndTime = 1500


function AddAnimationInfo(elemID, mustShow, displayStyle, showAtStart, animationInfos) {
  elem = document.getElementById(elemID)
  elem.style.display =
    showAtStart ?
    displayStyle :
    'none'

  animationInfos.push({
    elem: elem,
    mustShow: mustShow,
    displayStyle: displayStyle,
    willAnimate: mustShow != showAtStart
  })
}


async function TestElementsVisibility(jazil, animationInfos) {
  willAnimate = false
  animationInfos.forEach((info) => {
    info.startStyle = info.elem.style.display
    info.endStyle =
      info.mustShow ?
      info.displayStyle :
      'none'
    if (info.willAnimate)
      willAnimate = true
  })

  let startCalled = false
  let startDisplayStyle = undefined
  let startCalledDuringAnimation = false
  let intervalDisplayStyleInfos = []
  let stopCalled = false
  let stopDisplayStyle = undefined
  let stopCalledAfterAnimation = false

  let StartStopCallback = (started) => {
    if (started) {
      startCalled = true
      animationInfos.forEach((info) => {
        info.startDisplayStyle = info.elem.style.display
      })
    }
    else {
      stopCalled = true
      animationInfos.forEach((info) => {
        info.stopDisplayStyle = info.elem.style.display
      })
    }
  }

  let startTime = performance.now()

  let duringAnimationStatsNoted = false
  let promise = new Promise((resolve, reject) => {
    let testCode = (currentTime) => {
      animationTime = currentTime - startTime
      let duringAnimation = animationTime < g_duringAnimationEndTime
      let afterAnimation = animationTime > g_afterAnimationEndTime

      if (duringAnimation && startCalled && !duringAnimationStatsNoted) {
        startCalledDuringAnimation = true

        animationInfos.forEach((info) => {
          info.duringAnimationStats = {
            displayStyle: info.elem.style.display,
            expectedDisplayStyle: info.willAnimate ? info.displayStyle : info.endStyle
          }
        })

        duringAnimationStatsNoted = true;
      }
      else if (afterAnimation) {
        stopCalledAfterAnimation = stopCalled

        animationInfos.forEach((info) => {
          info.afterAnimationStats = {
            displayStyle: info.elem.style.display,
            expectedDisplayStyle: info.endStyle
          }
        })
      }

      if (afterAnimation)
        resolve()
      else
        requestAnimationFrame(testCode)
    }

    requestAnimationFrame(testCode)
  })

  if (animationInfos.length == 1) {
    animationInfo = animationInfos[0]
    AnimateElementVisibility(animationInfo.elem, animationInfo.mustShow, animationInfo.displayStyle, g_animationTime, StartStopCallback)
  }
  else
    AnimateElementsVisibility(animationInfos, g_animationTime, StartStopCallback)

  try {
    await promise
  }
  catch (exception) {
    throw exception
  }

  jazil.ShouldBe(startCalled, willAnimate, 'Start callback not called correctly!')
  if (willAnimate) {
    jazil.Assert(startCalledDuringAnimation, 'Start callback not called before/during animation!')
    animationInfos.forEach((info, infoNr) => {
      jazil.ShouldBe(info.startDisplayStyle, info.startStyle, `Element ${infoNr} visibility is off at start callback!`)
    })
  }

  if (willAnimate) {
    jazil.Assert(duringAnimationStatsNoted, 'Stats not fetched during animation!')
    animationInfos.forEach((info, infoNr) => {
      jazil.ShouldBe(info.duringAnimationStats.displayStyle, info.duringAnimationStats.expectedDisplayStyle, `Element ${infoNr} visibility is off during animation!`)
    })
  }

  jazil.ShouldBe(stopCalled, willAnimate, 'Stop callback not called correctly!')
  if (willAnimate) {
    jazil.Assert(stopCalledAfterAnimation, 'Stop callback not called after animation!')
    animationInfos.forEach((info, infoNr) => {
    jazil.ShouldBe(info.stopDisplayStyle, info.endStyle, `Element ${infoNr} visibility is off at stop callback!`)
    })
    animationInfos.forEach((info, infoNr) => {
      jazil.ShouldBe(info.afterAnimationStats.displayStyle, info.afterAnimationStats.expectedDisplayStyle, `Element ${infoNr} visibility is off after animation!`)
    })
  }
}


jazil.AddTestSet(mainPage, 'guiHelpers', {
  'AnimateElementVisibility: hiding 1 shown block element': async (jazil) => {
    let infos = []
    AddAnimationInfo('hide1Shown', false, 'block', true, infos)
    await TestElementsVisibility(jazil, infos)
  },

  'AnimateElementVisibility: hiding 1 hidden block element': async (jazil) => {
    let infos = []
    AddAnimationInfo('hide1Hidden', false, 'block', false, infos)
    await TestElementsVisibility(jazil, infos)
  },

  'AnimateElementVisibility: showing 1 hidden inline-block element': async (jazil) => {
    let infos = []
    AddAnimationInfo('show1Hidden', true, 'inline-block', false, infos)
    await TestElementsVisibility(jazil, infos)
  },

  'AnimateElementVisibility: showing 1 shown inline-block element': async (jazil) => {
    let infos = []
    AddAnimationInfo('show1Shown', true, 'inline-block', true, infos)
    await TestElementsVisibility(jazil, infos)
  },

  'AnimateElementsVisibility: hiding 3 inline-block elements': async (jazil) => {
    let infos = []
    AddAnimationInfo('hide31Shown', false, 'inline-block', true, infos)
    AddAnimationInfo('hide32Hidden', false, 'inline-block', false, infos)
    AddAnimationInfo('hide33Shown', false, 'inline-block', true, infos)
    await TestElementsVisibility(jazil, infos)
  },

  'AnimateElementsVisibility: showing 3 block elements': async (jazil) => {
    let infos = []
    AddAnimationInfo('show31Hidden', true, 'block', false, infos)
    AddAnimationInfo('show32Shown', true, 'block', true, infos)
    AddAnimationInfo('show33Hidden', true, 'block', false, infos)
    await TestElementsVisibility(jazil, infos)
  },

})
