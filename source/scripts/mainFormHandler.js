/*
  Main page javascript module.

  Prerequisites:
  - simpleDialog.js

  Defined classes:
  - MainFormHandler
*/


class MainFormHandler {
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
    new SimpleDialog('#dataInErrorForLoad').HookupButton('.exit')
  }


  TellFailedToSaveOnRequest() {
    new SimpleDialog('#dataInErrorForSave').HookupButton('.exit')
  }


  TellDataInErrorForDivine() {
    new SimpleDialog('#dataInErrorForDivine').HookupButton('.exit')
  }


  TellDataInErrorForFillSources() {
    new SimpleDialog('#dataInErrorForFillSources').HookupButton('.exit')
  }


  TellItemsMerged(OnExit) {
    new SimpleDialog('#itemsMerged', OnExit).HookupButton('.exit', OnExit)
  }


  AskMayOverwriteSources(OnYesClicked) {
    new SimpleDialog('#mayOverwriteSources').HookupButton('.no').HookupButton('.yes', OnYesClicked)
  }


  TellCombineStarting(OnCancel) {
    $('#divineTitle').html('Divination is in progress')
    $('#divineProgress').html('Starting up...')
    $('#divining .exit').html('Stop')

    new SimpleDialog('#divining', OnCancel).HookupButton('.exit', OnCancel)
  }


  TellCombineFinalizing() {
    $('#divineProgress').html('Finalizing...')
  }


  TellCombineProgress(progress, maxProgress, timeInMilliseconds) {
    $('#divineProgress').html(this.GetProgressMessage(progress, maxProgress, timeInMilliseconds))
  }


  TellCombineDone(filteredCombinedItems, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)
    let hasExactMatches = filteredCombinedItems.ratedItemsByMatch[g_exactMatch].length > 0
    let hasBetterMatches = filteredCombinedItems.ratedItemsByMatch[g_betterMatch].length > 0
    let hasLesserMatches = filteredCombinedItems.ratedItemsByMatch[g_lesserMatch].length > 0
    let hasMixedMatches = filteredCombinedItems.ratedItemsByMatch[g_mixedMatch].length > 0

    let title = 'Divination is compete!'
    let message = `${this.GetProgressMessage(maxProgress, maxProgress, timeInMilliseconds)}<br><br>`
    if (filteredCombinedItems.exactOnlyWithoutRename)
      message += 'An exact match cannot be made when renaming; it would be too costly.<br><br>Consider not renaming the item to see what is possible.'

    if (!hasExactMatches && !hasBetterMatches && !hasLesserMatches && !hasMixedMatches) {
      title = 'Divination is unsuccessful'
      if (!filteredCombinedItems.exactOnlyWithoutRename)
        message += 'Sorry, I couldn\'t come up with your desired item at all.<br><br>Please look at your source items and desired item and make sure there is some sort of match.'
    }
    else if (hasExactMatches) {
      if (hasBetterMatches)
        message += 'I could also create combinations with even more enchantments.<br><br>I\'ll also show these combinations.'
      else
        message += 'I\'ll show how to get at your desired item.'
    }
    else {
      if (!filteredCombinedItems.exactOnlyWithoutRename)
        message += 'An exact match cannot be made.'

      if (hasBetterMatches)
        message += '<br><br>I could create other combinations with even more enchantments; I\'ll show these instead.'
      else
        message += '<br><br>I\'ll show you what can be made.'
    }

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
