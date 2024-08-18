/*
  Recipe page javascript module.

  Prerequisites:
  - recipeForm.js

  Defined classes:
  - FormHandler

  Defined globals:
  - g_form: RecipeForm
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


  FailedToLoad() {
    this.ShowSimpleDialog('#dataInErrorForLoad', undefined)
  }
}




let g_form = new RecipeForm(new FormHandler())
