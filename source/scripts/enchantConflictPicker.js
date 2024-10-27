/*
  Enchant conflict picker.

  Prerequisites:
  - itemInfo.js
  - templateElement.js

  Defined classes:
  - EnchantConflictPicker
*/


// ======== PUBLIC ========


class EnchantConflictPicker {
  constructor(dialogElemJQ, itemInfo) {
    let ids = [...itemInfo.nonConflictingEnchantIDs]
    let names = ids.reduce((names, id) => {
      return names + (names.length == 0 ? '' : ' &#x2022; ') + g_enchantInfosByID.get(id).name
    }, '')
    dialogElemJQ.find('.nonConflictEnchants').html(names)

    let conflictTemplateElem = new TemplateElement(dialogElemJQ, 'conflictEnchants')

    conflictTemplateElem.RemoveCreatedElements()
    this.selectElemJQs = []

    itemInfo.conflictingEnchantIDSetsList.forEach((idSets) => {
      let conflictElemJQ = conflictTemplateElem.CreateExtraElement()
      let selectElemJQ = conflictElemJQ.find('select')
      this.selectElemJQs.push(selectElemJQ)

      let optionOptions = idSets.map((idSet) => {
        let ids = [...idSet]
        let idWithNames = ids.map((id) => {
          return {
            id: id,
            name: g_enchantInfosByID.get(id).name
          }
        }).sort((idWithName1, idWithName2) => {
          return (
            idWithName1.name < idWithName2.name ?
            -1 :
            idWithName1.name > idWithName2.name ?
            +1 :
            0
          )
        })
        return {
          idsText: idWithNames.reduce((idsText, idWithName, idNr) => {
            return idsText + (idNr == 0 ? '' : ',') + idWithName.id
          }, ''),
          names: idWithNames.reduce((names, idWithName, idNr) => {
            return names + (idNr == 0 ? '' : ', ') + idWithName.name
          }, '')
        }
      })

      optionOptions.sort((optionOption1, optionOption2) => {
        return (
          optionOption1.names < optionOption2.names ?
          -1 :
          optionOption1.names > optionOption2.names ?
          +1 :
          0
        )
      })

      optionOptions.forEach((optionOption) => {
        $(`<option value="${optionOption.idsText}">${optionOption.names}</option>`).appendTo(selectElemJQ)
      })
    })
  }


  GetChosenIDs() {
    let chosenIDsText = this.selectElemJQs.reduce((idsText, selectElemJQ, selectElemNr) => {
        return idsText + (selectElemNr == 0 ? '' : ',') + selectElemJQ.val()
    }, '')

    return chosenIDsText.split(',').map((idText) => {
      return parseInt(idText)
    })
  }
}
