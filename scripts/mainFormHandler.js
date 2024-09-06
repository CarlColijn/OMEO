/*
  Main page javascript module.

  Defined classes:
  - MainFormHandler
*/


class MainFormHandler {
  MakeDialogKeyboardCloseable(dialogElemJQ, exitButtonElemJQ, OnClose) {
    let keyboardListener = (event) => {
      if (
        event.key === 'Escape' ||
        event.key === ' ' ||
        event.key === 'Enter'
      ) {
        event.preventDefault()
        ExitDialog()
      }
    }

    window.addEventListener('keydown', keyboardListener)

    let ExitDialog = () => {
      window.removeEventListener('keydown', keyboardListener)

      dialogElemJQ.hide()

      if (OnClose !== undefined)
        OnClose()
    }

    exitButtonElemJQ.click(() => {
      ExitDialog()
    })
  }


  ShowSimpleDialog(dialogID, ContinueCallback) {
    let dialogElemJQ = $(dialogID)
    dialogElemJQ.css('display', 'flex')

    let exitButtonJQ = dialogElemJQ.find('.exit')
    exitButtonJQ[0].focus()

    this.MakeDialogKeyboardCloseable(dialogElemJQ, exitButtonJQ, ContinueCallback)
  }


  ClearErrors() {
    $('.error').remove()
  }


  NoteCountError(inputElemJQ) {
    inputElemJQ.after('<div class="error">This is not a number</div>')
  }


  NoteEnchantConflict(conflictInfo) {
    conflictInfo.inputElemJQ.after(`<div class="error">This enchantment conflicts<br>with ${conflictInfo.conflictingEnchantName}</div>`)
  }


  NoteEnchantDupe(inputElemJQ) {
    inputElemJQ.after('<div class="error">Duplicate enchantment</div>')
  }


  AskLoadFromURLOrLocalStorage(OnLocalStorage, OnURL) {
    let dialogElemJQ = $('#urlVsLocalStorageConflict')
    dialogElemJQ.css('display', 'flex')

    dialogElemJQ.find('.useURL').click(() => {
      dialogElemJQ.hide()

      OnURL()
    })

    dialogElemJQ.find('.useLocalStorage').click(() => {
      dialogElemJQ.hide()

      OnLocalStorage()
    })
  }


  FailedToLoad() {
    this.ShowSimpleDialog('#dataInErrorForLoad', undefined)
  }


  FailedToSaveOnUnload(unloadEvent) {
    unloadEvent.preventDefault()
    unloadEvent.returnValue = 'Your data has issues and could not be saved.\n\nAre you sure you want to leave now?  Any unsaved changes will be lost!'
  }


  TellFailedToSaveOnRequest() {
    this.ShowSimpleDialog('#dataInErrorForSave', undefined)
  }


  TellDataInError() {
    this.ShowSimpleDialog('#dataInErrorForDivine', undefined)
  }


  TellItemsMerged(OnExit) {
    this.ShowSimpleDialog('#itemsMerged', OnExit)
  }


  TellCombineStarting(OnCancel) {
    let dialogElemJQ = $('#divining')
    dialogElemJQ.css('display', 'flex')
    let exitButtonElemJQ = $('#divining .exit')

    $('#divineTitle').html('Divination is in progress')
    $('#divineProgress').html('Starting up...')
    exitButtonElemJQ.html('Stop')

    exitButtonElemJQ[0].focus()
    this.MakeDialogKeyboardCloseable(dialogElemJQ, exitButtonElemJQ, OnCancel)
  }


  TellCombineFinalizing() {
    $('#divineProgress').html('Finalizing...')
  }


  TellCombineProgress(progress, maxProgress, timeInMilliseconds) {
    $('#divineProgress').html(this.GetProgressMessage(progress, maxProgress, timeInMilliseconds))
  }


  TellCombineDone(ratedItemGroups, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)
    let hasExactMatches = ratedItemGroups[g_exactMatch].ratedItems.length > 0
    let hasBetterMatches = ratedItemGroups[g_betterMatch].ratedItems.length > 0
    let hasLesserMatches = ratedItemGroups[g_lesserMatch].ratedItems.length > 0
    let hasMixedMatches = ratedItemGroups[g_mixedMatch].ratedItems.length > 0
    let hasSources = ratedItemGroups.some((ratedItemGroup) => {
      return ratedItemGroup.hasSources
    })

    let title = 'Divination is compete!'
    let message = `${this.GetProgressMessage(maxProgress, maxProgress, timeInMilliseconds)}<br><br>`

    if (!hasExactMatches && !hasBetterMatches && !hasLesserMatches && !hasMixedMatches) {
      title = 'Divination is unsuccessful'
      message += 'Sorry, I couldn\'t come up with your desired item at all.<br><br>Please look at your source items and desired item and make sure there is some sort of match.'
    }
    else if (hasExactMatches) {
      if (hasBetterMatches)
        message += 'I could also create combinations with even more enchantments.<br>I\'ll also show these combinations.'
      else
        message += 'I\'ll show how to get at your desired item.'
    }
    else {
      if (hasBetterMatches)
        message += 'An exact match cannot be made, but I could create combinations with even more enchantments.<br>I\'ll show these instead.'
      else
        message += 'An exact match cannot be made.<br>I\'ll show you what can be made.'
    }

    if (hasSources)
      message += '<br><br>Some of your source item(s) are also nice matches for what you requested.<br>I\'ve also listed these and marked them for you.'

    $('#divineTitle').html(title)
    $('#divineProgress').html(message)
    $('#divining .exit').html('OK')
  }


  // returns string
  GetFormattedTime(time) {
    time = Math.round(time)
    let seconds = time % 60
    time = Math.round((time - seconds) / 60)
    let minutes = time % 60
    time = Math.round((time - minutes) / 60)
    let hours = time
    return (
      hours == 0 ?
      `${minutes}:${seconds.toString().padStart(2, '0')}` :
      `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
  }


  // returns string
  GetProgressMessage(progress, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)

    let percentageText =
      maxProgress == 0 ?
      '100.0' :
      (100 * progress / maxProgress).toFixed(1)
    let maxProgressText = maxProgress.toLocaleString('en-US')
    let maxTimeInMilliseconds =
      progress == 0 ?
      0 :
      timeInMilliseconds * maxProgress / progress
    let maxTimeInSeconds = Math.round(maxTimeInMilliseconds / 1000)

    return `Progress: ${percentageText}% of ${maxProgressText} combinations<br>Time elapsed: ${this.GetFormattedTime(timeInSeconds)} of ${this.GetFormattedTime(maxTimeInSeconds)}`
  }
}
