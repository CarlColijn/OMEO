/*
  Simple dialogs.

  Defined classes:
  - SimpleDialog
*/


// ======== PUBLIC ========


class SimpleDialog {
  constructor(dialogID, EscapeHandler) {
    this.dialogElemJQ = $(dialogID)
    this.dialogElemJQ.css('display', 'flex')

    this.firstButtonAdded = false

    this.keyboardListener = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.ExitDialog(EscapeHandler)
      }
    }

    window.addEventListener('keydown', this.keyboardListener)
  }


  // returns this for method chaining
  HookupButton(buttonID, ClickHandler) {
    let buttonElemJQ = this.dialogElemJQ.find(buttonID)

    buttonElemJQ.unbind('click')
    buttonElemJQ.click(() => {
      this.ExitDialog(ClickHandler)
    })

    if (!this.firstButtonAdded) {
      buttonElemJQ[0].focus()
      this.firstButtonAdded = true
    }

    return this
  }


  // ======== PRIVATE ========


  ExitDialog(Handler) {
    window.removeEventListener('keydown', this.keyboardListener)

    this.dialogElemJQ.hide()

    if (Handler !== undefined)
      Handler()
  }
}
