function GetPicker(itemName) {
  let dialogElem = document.getElementById('enchantConflictPicker')
  let itemInfo = GetItemInfo(itemName)
  return new EnchantConflictPicker(dialogElem, itemInfo)
}


function GetCanonicalReducedStringList(seperator, stringList) {
  return stringList.toSorted().reduce((serialized, string) => {
    return serialized + (serialized.length == 0 ? '' : seperator) + string
  }, '')
}


function GetShownEnchantNames() {
  let dialogElem = document.getElementById('enchantConflictPicker')
  let nonConflictingNames = GetCanonicalReducedStringList(
    ',',
    dialogElem.querySelector('.nonConflictEnchants').textContent.split('\u2022').map((name) => {
      return name.trim()
    }).toSorted()
  )

  let conflictingNameSets = []
  dialogElem.querySelectorAll('.conflictEnchants:not(.template) select').forEach((selectElem) => {
    let names = []
    selectElem.querySelectorAll('option').forEach((optionElem) => {
      let name = optionElem.textContent.replace(', ', '+')
      names.push(name)
    })
    conflictingNameSets.push(GetCanonicalReducedStringList(',', names))
  })
  let conflictingNames = GetCanonicalReducedStringList('|', conflictingNameSets)

  return {
    nonConflictingNames: nonConflictingNames,
    conflictingNames: conflictingNames
  }
}


function GetNamesForItem(itemName) {
  let itemInfo = GetItemInfo(itemName)

  let nonConflictingNames = GetCanonicalReducedStringList(
    ',',
    [...itemInfo.nonConflictingNormalEnchantIDs].map((id) => {
      return g_enchantInfosByID.get(id).name
    })
  )

  let conflictingNameSets = itemInfo.conflictingEnchantIDSetsList.map((idSets) => {
    return GetCanonicalReducedStringList(
      ',',
      idSets.map((idSet) => {
        return GetCanonicalReducedStringList(
          '+',
          [...idSet].map((id) => {
            return g_enchantInfosByID.get(id).name
          })
        )
      })
    )
  })
  let conflictingNames = conflictingNameSets.toSorted().reduce((serialized, names) => {
    return serialized + (serialized.length == 0 ? '' : '|') + names
  }, '')

  return {
    nonConflictingNames: nonConflictingNames,
    conflictingNames: conflictingNames
  }
}


jazil.AddTestSet(mainPage, 'EnchantConflictPicker', {
  'Shown enchants are OK for Axe': (jazil) => {
    let picker = GetPicker('Axe')

    let shownNames = GetShownEnchantNames()
    let names = GetNamesForItem('Axe')

    jazil.ShouldBe(shownNames.nonConflictingNames, names.nonConflictingNames, 'non-conflicting names are off!')
    jazil.ShouldBe(shownNames.conflictingNames, names.conflictingNames, 'conflicting names are off!')
  },

  'Shown enchants are OK for Book': (jazil) => {
    let picker = GetPicker('Book')

    let shownNames = GetShownEnchantNames()
    let names = GetNamesForItem('Book')

    jazil.ShouldBe(shownNames.nonConflictingNames, names.nonConflictingNames, 'non-conflicting names are off!')
    jazil.ShouldBe(shownNames.conflictingNames, names.conflictingNames, 'conflicting names are off!')
  },

  'Shown enchants are OK for Brush': (jazil) => {
    let picker = GetPicker('Brush')

    let shownNames = GetShownEnchantNames()
    let names = GetNamesForItem('Brush')

    jazil.ShouldBe(shownNames.nonConflictingNames, names.nonConflictingNames, 'non-conflicting names are off!')
    jazil.ShouldBe(shownNames.conflictingNames, names.conflictingNames, 'conflicting names are off!')
  },

  'Returns correct ID selection': (jazil) => {
    let picker = GetPicker('Book')

    let selectElems = document.querySelectorAll('#enchantConflictPicker .conflictEnchants:not(.template) select')
    selectElems.forEach((selectElem) => {
      let optionElems = selectElem.querySelectorAll('option')
      selectElem.value = optionElems[optionElems.length - 2].value
    })

    let chosenIDs = picker.GetChosenIDs()
    let chosenNames = chosenIDs.map((id) => {
      return g_enchantInfosByID.get(id).name
    })
    let chosenNamesText = GetCanonicalReducedStringList(',', chosenNames)

    jazil.ShouldBe(chosenNamesText, 'Channeling,Depth Strider,Fortune,Infinity,Loyalty,Multishot,Projectile Protection,Sharpness', 'returned chosen IDs is off!')
  },

})
