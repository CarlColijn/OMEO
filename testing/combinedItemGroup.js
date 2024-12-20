function GetCombinedItemGroupTemplate() {
  let CallbackHandlerMock = {
    click: () => {}
  }

  return new CombinedItemGroupTemplate(document.getElementById('combinedItemGroup'), 'group', CallbackHandlerMock)
}


function CreateCombinedItemGroup(templateGroup, match) {
  return templateGroup.CreateNew(match)
}


function GetDescriptionForMatch(match) {
  switch (match) {
    case g_exactMatch: return 'exact'
    case g_betterMatch: return 'better'
    case g_lesserMatch: return 'lesser'
    case g_mixedMatch: return 'mixed'
  }
  return '???'
}


function GetCombinedItemGroupDescription(itemGroupElem) {
  let headingElem = itemGroupElem.querySelector('.heading span:not(.template)')
  return headingElem.textContent
}


function CombinedItemGroupInTable(testContainerID, description) {
  let foundGroup = false
  document.querySelectorAll(`#${testContainerID} tbody.group:not(.template)`).forEach((itemGroupElem) => {
    if (description == GetCombinedItemGroupDescription(itemGroupElem)) {
      foundGroup = true
      return false
    }
    return true
  })

  return foundGroup
}


function ClearPreviousItemGroups() {
  new GetCombinedItemGroupTemplate().RemoveCreatedElements()
}




jazil.AddTestSet(mainPage, 'CombinedItemGroup', {
  'Template group is not real': (jazil) => {
    ClearPreviousItemGroups()

    let templateGroup = GetCombinedItemGroupTemplate()

    jazil.ShouldBe(templateGroup.IsReal(), false)
  },

  'New group is real': (jazil) => {
    ClearPreviousItemGroups()

    let templateGroup = GetCombinedItemGroupTemplate()
    let itemGroup = CreateCombinedItemGroup(templateGroup, g_exactMatch)

    jazil.ShouldBe(itemGroup.IsReal(), true)
  },

  'Create new group with match from template': (jazil) => {
    ClearPreviousItemGroups()

    let templateGroup = GetCombinedItemGroupTemplate()
    let itemGroup = CreateCombinedItemGroup(templateGroup, g_exactMatch)

    let neededDescription = GetDescriptionForMatch(g_exactMatch)
    let foundDescription = GetCombinedItemGroupDescription(itemGroup.elem)

    jazil.ShouldBe(foundDescription, neededDescription, 'description is off!')
    jazil.ShouldBe(CombinedItemGroupInTable('combinedItemGroup', neededDescription), true, 'added group is not present!')
  },

  'Create all matches adds all groups': (jazil) => {
    ClearPreviousItemGroups()

    let templateGroup = GetCombinedItemGroupTemplate()

    let matches = [g_lesserMatch, g_exactMatch, g_mixedMatch, g_betterMatch]
    matches.forEach((match) => {
      let itemGroup = CreateCombinedItemGroup(templateGroup, match)

      let neededDescription = GetDescriptionForMatch(match)
      let foundDescription = GetCombinedItemGroupDescription(itemGroup.elem)

      jazil.ShouldBe(foundDescription, neededDescription, `description is off for ${foundDescription}!`)
      jazil.ShouldBe(CombinedItemGroupInTable('combinedItemGroup', neededDescription), true, `added group is not present for ${foundDescription}!`)
    })
  },

  'Groups can be removed': (jazil) => {
    ClearPreviousItemGroups()

    let templateGroup = GetCombinedItemGroupTemplate()
    let itemGroup1 = CreateCombinedItemGroup(templateGroup, g_lesserMatch)
    let itemGroup2 = CreateCombinedItemGroup(templateGroup, g_betterMatch)
    let itemGroup3 = CreateCombinedItemGroup(templateGroup, g_mixedMatch)
    let numGroupsPre = document.querySelectorAll('#combinedItemGroup .group').length
    itemGroup2.Remove()
    let numGroupsPost = document.querySelectorAll('#combinedItemGroup .group').length

    let neededDescription = GetDescriptionForMatch(g_betterMatch)

    // +1 for the template group
    jazil.ShouldBe(numGroupsPre, 4, 'amount of initial groups is off!')
    jazil.ShouldBe(numGroupsPost, 3, 'amount of remaining groups is off!')
    jazil.ShouldBe(CombinedItemGroupInTable('combinedItemGroup', neededDescription), false, 'removed group is still present!')
  },

})
