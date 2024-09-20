/*
  Button strip GUI element management.

  Prerequisites:
  - none

  Defined classes:
  - ButtonStrip
*/


// ======== PUBLIC ========


class ButtonStrip {
  constructor(elemJQ) {
    // ==== PRIVATE ====
    this.elemJQ = elemJQ
  }


  // note: options should be an array of any
  SetOptions(options, selectedOptionNr) {
    this.elemJQ.empty()

    let maxOptionNr = options.length - 1
    for (let optionNr = 0; optionNr <= maxOptionNr; ++optionNr) {
      let option = options[optionNr]
      let orderClass =
        optionNr == 0 && optionNr == maxOptionNr ?
        ' onlyButton' :
        optionNr == 0 ?
        ' firstButton' :
        optionNr == maxOptionNr ?
        ' lastButton' :
        ' middleButton'
      let selectedClass =
        optionNr === selectedOptionNr ?
        ' selectedButton' :
        ''

      let buttonElemJQ = $(`<button type="button" class="buttonBox${orderClass}${selectedClass}" value="${optionNr}"><div>${option}</div></button>`)
      this.elemJQ.append(buttonElemJQ)

      let elemJQ = this.elemJQ
      buttonElemJQ.on('click', function() {
        elemJQ.find('button').removeClass('selectedButton')
        $(this).addClass('selectedButton')
      })
    }
  }


  // returns int
  // returns undefined when no selection is made
  GetSelectionNr() {
    let optionNr = parseInt(this.elemJQ.find('.selectedButton').val())
    if (isNaN(optionNr))
      return undefined
    else
      return optionNr
  }


  SetSelectionNr(optionNr) {
    this.elemJQ.find('button').removeClass('selectedButton')
    this.elemJQ.find(`button[value=${optionNr}]`).addClass('selectedButton')
  }
}
