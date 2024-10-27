function GetPicker(itemName) {
  let dialogElemJQ = $('#enchantConflictPicker')
  let itemInfo = GetItemInfo(itemName)
  return new EnchantConflictPicker(dialogElemJQ, itemInfo)
}


function GetCanonicalReducedStringList(seperator, stringList) {
  return stringList.toSorted().reduce((serialized, string) => {
    return serialized + (serialized.length == 0 ? '' : seperator) + string
  }, '')
}


function GetShownEnchantNames() {
  let dialogElemJQ = $('#enchantConflictPicker')
  let nonConflictingNames = GetCanonicalReducedStringList(
    ',',
    dialogElemJQ.find('.nonConflictEnchants').text().split('\u2022').map((name) => {
      return name.trim()
    }).toSorted()
  )

  let conflictingNameSets = []
  dialogElemJQ.find('.conflictEnchants:not(.template) select').each(function() {
    let names = []
    let selectElemJQ = $(this)
    selectElemJQ.find('option').each(function() {
      let optionElemJQ = $(this)
      let name = optionElemJQ.text().replace(', ', '+')
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
    [...itemInfo.nonConflictingEnchantIDs].map((id) => {
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

    let selectElemJQs = $('#enchantConflictPicker select:not(.template)')
    selectElemJQs.each(function() {
      let selectElemJQ = $(this)
      let optionElemJQs = selectElemJQ.find('option')
      selectElemJQ.val($(optionElemJQs[optionElemJQs.length - 2]).val())
    })

    let chosenIDs = picker.GetChosenIDs()
    let chosenNames = chosenIDs.map((id) => {
      return g_enchantInfosByID.get(id).name
    })
    let chosenNamesText = GetCanonicalReducedStringList(',', chosenNames)

    jazil.ShouldBe(chosenNamesText, 'Channeling,Depth Strider,Fortune,Infinity,Loyalty,Multishot,Projectile Protection,Sharpness', 'returned chosen IDs is off!')
  },

})
