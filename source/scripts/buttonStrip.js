/*
  Button strip GUI element management.

  Prerequisites:
  - none

  Defined classes:
  - ButtonStrip
*/


// ======== PUBLIC ========


class ButtonStrip {
  constructor(elem) {
    // ==== PRIVATE ====
    this.elem = elem
  }


  // note: options should be an array of any
  SetOptions(options, selectedOptionNr) {
    while (this.elem.hasChildNodes())
      this.elem.lastChild.remove()

    let buttonElems = document.createDocumentFragment()
    let maxOptionNr = options.length - 1
    for (let optionNr = 0; optionNr <= maxOptionNr; ++optionNr) {
      let option = options[optionNr]
      let buttonElem = this.CreateButtonElem(option, optionNr, maxOptionNr, selectedOptionNr)
      buttonElems.appendChild(buttonElem)
    }

    this.elem.appendChild(buttonElems)
  }


  // returns int
  // returns undefined when no selection is made
  GetSelectionNr() {
    let selectedButtonElem = this.elem.querySelector('.selectedButton')
    if (selectedButtonElem === null)
      return undefined

    let optionNr = parseInt(selectedButtonElem.value)
    if (isNaN(optionNr))
      return undefined

    return optionNr
  }


  SetSelectionNr(optionNr) {
    this.RemoveSelection()
    let buttonElemToSelect = this.elem.querySelector(`button[value="${optionNr}"]`)
    if (buttonElemToSelect === null)
      return

    buttonElemToSelect.classList.add('selectedButton')
  }


  // ==== PRIVATE ====


  RemoveSelection() {
    let allButtonElems = this.elem.querySelectorAll('button')
    allButtonElems.forEach((buttonElem) => {
      buttonElem.classList.remove('selectedButton')
    })
  }


  // returns a DOM element for the given option
  CreateButtonElem(option, optionNr, maxOptionNr, selectedOptionNr) {
    let buttonElem = document.createElement('button')

    buttonElem.setAttribute('type', 'button')

    buttonElem.value = optionNr

    buttonElem.classList.add('buttonBox')

    if (optionNr == 0 && optionNr == maxOptionNr)
      buttonElem.classList.add('onlyButton')
    else if (optionNr == 0)
      buttonElem.classList.add('firstButton')
    else if (optionNr == maxOptionNr)
      buttonElem.classList.add('lastButton')
    else
      buttonElem.classList.add('middleButton')

    if (optionNr === selectedOptionNr)
      buttonElem.classList.add('selectedButton')

    buttonElem.addEventListener('click', () => {
      this.RemoveSelection()
      buttonElem.classList.add('selectedButton')
    })

    let divElem = document.createElement('div')
    divElem.textContent = '' + option
    buttonElem.appendChild(divElem)

    return buttonElem
  }
}
