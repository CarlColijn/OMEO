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


  TellNoCombinesPossible() {
    alert('All possible combinations are too expensive or wasteful!')
  }


  TellCombiningDone() {
    alert('The divination is complete!')
  }
}




let g_form = new Form(new FormHandler())
