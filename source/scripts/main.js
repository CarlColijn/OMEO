/*
  Main javascript module.

  Prerequisites:
  - form.js

  Defined classes:
  - FormHandler

  Defined globals:
  - g_form: Form
*/


class FormHandler {
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


  ClearCountErrors() {
    $('.error').remove()
  }


  NoteCountError(inputElemJQ) {
    inputElemJQ.after('<div class="error">This is not a number</div>')
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


  TellCombineProgress(progress, maxProgress) {
    $('#divineProgress').html(`Working on combination ${Math.round(progress / 1000)}K of ${Math.round(maxProgress / 1000)}K...`)
  }


  TellCombineDone(level, hasSources) {
    let title = 'Divination is compete!'
    let message

    if (level === g_noCombines) {
      title = 'Divination is unsuccessful'
      message = 'Sorry, I couldn\'t come up with your desired item at all.<br><br>Please look at your source items and desired item and make sure there is some sort of match.'
    }
    else if (level === g_onlyImperfectCombines)
      message = 'An exact match cannot be made.<br>I\'ll show you what can be made.'
    else if (level === g_onlyPerfectWithExtrasCombines)
      message = 'An exact match cannot be made, but I could create combinations with even more enchantments.<br>I\'ll show these instead.'
    else if (level === g_perfectAndPerfectWithExtrasCombines)
      message = 'I could also create combinations with even more enchantments.<br>I\'ll also show these combinations.'
    else if (level === g_onlyPerfectCombines)
      message = 'I listed how to get at your desired item.'

    if (hasSources)
      message += '<br><br>Some of your source item(s) are however also nice matches for what you requested.<br>I\'ve also listed these and marked them for you.'

    $('#divineTitle').html(title)
    $('#divineProgress').html(message)
    $('#divining .exit').html('OK')
  }
}




let g_form = new Form(new FormHandler())
