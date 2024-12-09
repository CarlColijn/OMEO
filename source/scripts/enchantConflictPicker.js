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
  constructor(dialogElem, itemInfo) {
    let ids = [...itemInfo.nonConflictingNormalEnchantIDs]
    let names = ids.reduce((names, id) => {
      return names + (names.length == 0 ? '' : ' &#x2022; ') + g_enchantInfosByID.get(id).name
    }, '')
    dialogElem.querySelector('.nonConflictEnchants').innerHTML = names

    let conflictTemplateElem = new TemplateElement(dialogElem, 'conflictEnchants')

    conflictTemplateElem.RemoveCreatedElements()
    this.selectElems = []

    itemInfo.conflictingEnchantIDSetsList.forEach((idSets) => {
      let conflictElem = conflictTemplateElem.CreateExtraElement()
      let selectElem = conflictElem.querySelector('select')
      this.selectElems.push(selectElem)

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
        let optionElem = document.createElement('option')
        optionElem.value = optionOption.idsText
        optionElem.textContent = optionOption.names
        selectElem.appendChild(optionElem)
      })
    })
  }


  GetChosenIDs() {
    let chosenIDsText = this.selectElems.reduce((idsText, selectElem, selectElemNr) => {
        return idsText + (selectElemNr == 0 ? '' : ',') + selectElem.value
    }, '')

    return chosenIDsText.split(',').map((idText) => {
      return parseInt(idText)
    })
  }
}
