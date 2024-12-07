function SetIcon(iconElem, itemID, hasEnchants) {
  let itemInfo = g_itemInfosByID.get(itemID)
  let iconIndex = hasEnchants ? itemInfo.iconIndexEnchanted : itemInfo.iconIndexNormal
  iconElem.style.setProperty('--iconIndex', iconIndex)

  iconElem.querySelector('.glint').style.display = hasEnchants ? 'inline-block' : 'none'
}


function AnimateElementVisibility(elem, mustShow, displayStyle, speed, StartStopCallback) {
  let elemInfos = [{
    elem: elem,
    mustShow: mustShow,
    displayStyle: displayStyle
  }]
  AnimateElementsVisibility(elemInfos, speed, StartStopCallback)
}


// elemInfos = [ElemInfo], with ElemInfo: {
//   elem: DOM element
//   mustShow: bool
// }
function AnimateElementsVisibility(elemInfos, speed, StartStopCallback) {
  elemInfosToAnimate = elemInfos.filter((elemInfo) => {
    let isShown = elemInfo.elem.style.display != 'none'
    return isShown != elemInfo.mustShow
  })

  if (elemInfosToAnimate.length == 0)
    return

  if (StartStopCallback !== undefined)
    StartStopCallback(true)

  elemInfosToAnimate.forEach((elemInfo) => {
    elemInfo.elem.style.height = 'auto'
    elemInfo.elem.style.display = elemInfo.displayStyle
    elemInfo.elem.style.overflow = 'unset'
    let computedCSSHeight = document.defaultView.getComputedStyle(elemInfo.elem).height
    elemInfo.originalHeight = parseFloat(computedCSSHeight.replace('px', ''))

    elemInfo.elem.style.overflow = 'hidden'
    if (elemInfo.mustShow)
      elemInfo.elem.style.height = '0px'
  })

  let startTime = document.timeline.currentTime

  let Animate = (animationTime) => {
    let progress = (animationTime - startTime) / speed
    let animationDone = progress > 1.0

    if (animationDone) {
      elemInfosToAnimate.forEach((elemInfo) => {
        if (elemInfo.mustShow) {
          elemInfo.elem.style.height = 'auto'
          elemInfo.elem.style.overflow = 'unset'
          elemInfo.elem.style.opacity = 1.0
        }
        else
          elemInfo.elem.style.display = 'none'
      })

      if (StartStopCallback !== undefined)
        StartStopCallback(false)
    }
    else {
      progress = (Math.cos(progress * Math.PI) + 1.0) / 2.0
      elemInfosToAnimate.forEach((elemInfo) => {
        let animationProgress =
          elemInfo.mustShow ?
          (1.0 - progress) :
          progress
        elemInfo.elem.style.height = `${elemInfo.originalHeight * animationProgress}px`
        elemInfo.elem.style.opacity = animationProgress
      })
      window.requestAnimationFrame(Animate)
    }
  }

  Animate(startTime)
}
