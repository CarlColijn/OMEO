/*
  Simple dialogs.

  Defined classes:
  - SimpleDialog
*/


// ======== PUBLIC ========


class SimpleDialog {
  constructor(dialogID, EscapeHandler) {
    this.dialogElem = document.getElementById(dialogID)
    this.dialogElem.style.display = 'flex'

    this.EventListenerInfos = []

    this.firstButtonAdded = false

    this.RegisterEventHandler(window, 'keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.ExitDialog(EscapeHandler)
      }
    })
  }


  // returns this for method chaining
  HookupButton(buttonSelector, ClickHandler) {
    let buttonElem = this.dialogElem.querySelector(buttonSelector)
    if (buttonElem !== null) {
      this.RegisterEventHandler(buttonElem, 'click', () => {
        this.ExitDialog(ClickHandler)
      })

      if (!this.firstButtonAdded) {
        buttonElem.focus()
        this.firstButtonAdded = true
      }
    }

    return this
  }


  // ======== PRIVATE ========


  ExitDialog(Handler) {
    this.EventListenerInfos.forEach((eventListenerInfo) => {
      eventListenerInfo.elem.removeEventListener(eventListenerInfo.name, eventListenerInfo.Handler)
    })

    this.dialogElem.style.display = 'none'

    if (Handler !== undefined)
      Handler()
  }


  RegisterEventHandler(elem, name, Handler) {
    elem.addEventListener(name, Handler)
    this.EventListenerInfos.push({
      elem: elem,
      name: name,
      Handler: Handler
    })
  }
}
