/*
  Main page javascript module.

  Prerequisites:
  - simpleDialog.js
  - enchantConflictPicker.js

  Defined classes:
  - MainFormHandler
*/


class MainFormHandler {
  AskLoadFromURLOrLocalStorage(OnLocalStorage, OnURL) {
    let dialogElem = document.getElementById('urlVsLocalStorageConflict')
    dialogElem.style.display = 'flex'

    dialogElem.querySelector('.useURL').addEventListener('click', () => {
      dialogElem.style.display = 'none'

      OnURL()
    })

    dialogElem.querySelector('.useLocalStorage').addEventListener('click', () => {
      dialogElem.style.display = 'none'

      OnLocalStorage()
    })
  }


  FailedToLoad() {
    new SimpleDialog('dataInErrorForLoad').HookupButton('.exit')
  }


  TellFailedToSaveOnRequest() {
    new SimpleDialog('dataInErrorForSave').HookupButton('.exit')
  }


  TellDataInErrorForDivine() {
    new SimpleDialog('dataInErrorForDivine').HookupButton('.exit')
  }


  TellDataInErrorForFillSources() {
    new SimpleDialog('dataInErrorForFillSources').HookupButton('.exit')
  }


  TellItemsMerged(OnExit) {
    new SimpleDialog('itemsMerged', OnExit).HookupButton('.exit', OnExit)
  }


  AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo) {
    let dialogID =
      maxEnchantsCallbackInfo.hasConflictingEnchants && maxEnchantsCallbackInfo.enchantsAlreadyPresent ?
      'maySetMaxedDesiredEnchants_askConflictAndReplace' :
      maxEnchantsCallbackInfo.hasConflictingEnchants ?
      'maySetMaxedDesiredEnchants_askConflictOnly' :
      'maySetMaxedDesiredEnchants_askReplaceOnly'

    let withEnchantConflictPicker = maxEnchantsCallbackInfo.hasConflictingEnchants
    let enchantConflictPicker =
      withEnchantConflictPicker ?
      new EnchantConflictPicker(document.getElementById(dialogID), maxEnchantsCallbackInfo.info) :
      undefined
    let OnYesClicked = () => {
      maxEnchantsCallbackInfo.OnContinue(
        maxEnchantsCallbackInfo,
        withEnchantConflictPicker ?
        enchantConflictPicker.GetChosenIDs() :
        []
      )
    }
    new SimpleDialog(dialogID).HookupButton('.no').HookupButton('.yes', OnYesClicked)
  }


  AskMayOverwriteSources(OnYesClicked) {
    new SimpleDialog('mayOverwriteSources').HookupButton('.no').HookupButton('.yes', OnYesClicked)
  }


  TellCombineStarting(OnCancel) {
    document.getElementById('divineTitle').textContent = 'Divination is in progress'
    document.getElementById('divineProgress').textContent = 'Starting up...'
    document.querySelector('#divining .exit').textContent = 'Stop'

    new SimpleDialog('divining', OnCancel).HookupButton('.exit', OnCancel)
  }


  TellCombineFinalizing() {
    document.getElementById('divineProgress').textContent = 'Finalizing...'
  }


  TellCombineProgress(progress, maxProgress, timeInMilliseconds) {
    document.getElementById('divineProgress').innerHTML = this.GetProgressMessageHTML(progress, maxProgress, timeInMilliseconds)
  }


  TellCombineDone(filteredCombinedItems, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)
    let hasExactMatches = filteredCombinedItems.ratedItemsByMatch[g_exactMatch].length > 0
    let hasBetterMatches = filteredCombinedItems.ratedItemsByMatch[g_betterMatch].length > 0
    let hasLesserMatches = filteredCombinedItems.ratedItemsByMatch[g_lesserMatch].length > 0
    let hasMixedMatches = filteredCombinedItems.ratedItemsByMatch[g_mixedMatch].length > 0

    let title = 'Divination is compete!'
    let messageHTML = `${this.GetProgressMessageHTML(maxProgress, maxProgress, timeInMilliseconds)}<br><br>`
    if (filteredCombinedItems.exactOnlyWithoutRename)
      messageHTML += 'An exact match cannot be made when renaming; it would be too costly.<br><br>Consider not renaming the item to see what is possible.'

    if (!hasExactMatches && !hasBetterMatches && !hasLesserMatches && !hasMixedMatches) {
      title = 'Divination is unsuccessful'
      if (!filteredCombinedItems.exactOnlyWithoutRename)
        messageHTML += 'Sorry, I couldn\'t come up with your desired item at all.<br><br>Please look at your source items and desired item and make sure there is some sort of match.'
    }
    else if (hasExactMatches) {
      if (hasBetterMatches)
        messageHTML += 'I could also create combinations with even more enchantments.<br><br>I\'ll also show these combinations.'
      else
        messageHTML += 'I\'ll show how to get at your desired item.'
    }
    else {
      if (!filteredCombinedItems.exactOnlyWithoutRename)
        messageHTML += 'An exact match cannot be made.'

      if (hasBetterMatches)
        messageHTML += '<br><br>I could create other combinations with even more enchantments; I\'ll show these instead.'
      else
        messageHTML += '<br><br>I\'ll show you what can be made.'
    }

    document.getElementById('divineTitle').textContent = title
    document.getElementById('divineProgress').innerHTML = messageHTML
    document.querySelector('#divining .exit').textContent = 'OK'
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
  GetProgressMessageHTML(progress, maxProgress, timeInMilliseconds) {
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
