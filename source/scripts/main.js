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
  NoteCountError(inputElemJQ) {
    inputElemJQ.after('<br><span class="error">This is not a number</span>')
  }


  FailedToLoad() {
    alert('Sorry, but there was an issue loading your data back in...')
  }


  FailedToSaveOnUnload(unloadEvent) {
    unloadEvent.preventDefault()
    unloadEvent.returnValue = 'Your data has issues and could not be saved.\n\nAre you sure you want to leave now?  Any unsaved changes will be lost!'
  }


  FailedToSaveOnRequest() {
    alert('I cannot create the bookmark; there are errors in your data.  Please fix these first.')
  }


  TellDataInError() {
    alert('I cannot combine these items; there are errors in your data.  Please fix these first.')
  }


  TellItemsGotMerged() {
    alert('I\'ve taken the liberty to merge identical source item rows.')
  }


  TellCombiningDone(level, hasSources) {
    let message
    if (level === g_noCombines)
      message = 'Sorry, I couldn\'t come up with your desired item at all.  Please look at your source items and desired item and make sure there is some sort of match.'
    else if (level === g_onlyImperfectCombines)
      message = 'The divination is complete!\n\nAn exact match cannot be made though.  I\'ll show you what can be made.'
    else if (level === g_onlyPerfectWithExtrasCombines)
      message = 'The divination is complete!\n\nAn exact match cannot be made, but I could create combinations with even more enchantments.  I\'ll show these instead.'
    else if (level === g_perfectAndPerfectWithExtrasCombines)
      message = 'The divination is complete!\n\nI could also create combinations with even more enchantments.  I\'ll also show these combinations.'
    else if (level === g_onlyPerfectCombines)
      message = 'The divination is complete!\n\nI listed how to get at your desired item.'

    if (hasSources)
      message += '\n\nSome of your source item(s) are however also nice matches for what you requested.  I\'ve also listed these and marked them for you.'

    alert(message)
  }
}




let g_form = new Form(new FormHandler())
