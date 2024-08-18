function GetEnchantTemplateRow(testContainerID, set) {
  let templateRowElemJQ = $(`#${testContainerID} .template`)
  return new EnchantRow(templateRowElemJQ, set)
}


function CreateEnchantRow(templateRow, enchantName, enchantLevel, itemName) {
  return templateRow.CreateNew(
    BuildEnchant(enchantName, enchantLevel),
    GetItemInfo(itemName).id,
    false, undefined
  )
}


function GetEnchantRowDetails(enchantRowElemJQ, set) {
  if (set != g_combined) {
    let enchantIDText = enchantRowElemJQ.find('[name=enchantID]').val()
    let enchantID = enchantIDText === null ? 0 : parseInt(enchantIDText)
    let levelElemJQ = enchantRowElemJQ.find('[name=level]')
    let level = parseInt(levelElemJQ.val())
    return {
      'name': g_enchantInfosByID.get(enchantID).name,
      'level': level
    }
  }
  else
    return {
      'name': enchantRowElemJQ.find('.name').text(),
      'level': GetEnchantLevelFromGUIText(enchantRowElemJQ.find('.level').text())
    }
}


function EnchantRowInTable(testContainerID, enchantName, set) {
  let foundRow = false
  $(`#${testContainerID} tr`).each((rowNr, enchantRowElem) => {
    let enchantRowElemJQ = $(enchantRowElem)
    let details = GetEnchantRowDetails(enchantRowElemJQ, set)
    if (details.name == enchantName) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




function CreateTestSet(setDescription, testContainerID, setLetter) {
  jazil.AddTestSet(mainPage, `EnchantRow - ${setDescription} style`, {
    'Template row is not real': (jazil) => {
      let set = GetSet(setLetter)
      let templateRow = GetEnchantTemplateRow(testContainerID, set)
      jazil.ShouldBe(templateRow.IsReal(), false)
    },

    'New row is real': (jazil) => {
      let set = GetSet(setLetter)
      let templateRow = GetEnchantTemplateRow(testContainerID, set)
      let enchantRow = CreateEnchantRow(templateRow, 'Fortune', 2, 'Book')
      jazil.ShouldBe(enchantRow.IsReal(), true)
    },

    'Create new row from template': (jazil) => {
      let set = GetSet(setLetter)
      let templateRow = GetEnchantTemplateRow(testContainerID, set)
      let enchantRow = CreateEnchantRow(templateRow, 'Unbreaking', 3, 'Axe')
      let details = GetEnchantRowDetails(enchantRow.rowElemJQ, set)
      jazil.ShouldBe(enchantRow.set, set, 'set is off!')
      jazil.ShouldBe(details.name, 'Unbreaking', 'name is off!')
      jazil.ShouldBe(details.level, 3, 'level is off!')
      jazil.ShouldBe(EnchantRowInTable(testContainerID, 'Unbreaking', set), true, 'added row is not present!')
    },

    'Added row count is OK': (jazil) => {
      let set = GetSet(setLetter)
      let templateRow = GetEnchantTemplateRow(testContainerID, set)
      let numRowsPre = $(`#${testContainerID} tr`).length
      let enchantRow1 = CreateEnchantRow(templateRow, 'Smite', 1, 'Sword')
      let enchantRow2 = CreateEnchantRow(templateRow, 'Aqua Affinity', 1, 'Book')
      let enchantRow3 = CreateEnchantRow(templateRow, 'Blast Protection', 2, 'Leggings')
      let numRowsPost = $(`#${testContainerID} tr`).length
      jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
    },

    'Rows can be removed': (jazil) => {
      let set = GetSet(setLetter)
      let templateRow = GetEnchantTemplateRow(testContainerID, set)
      let enchantRow1 = CreateEnchantRow(templateRow, 'Protection', 2, 'Chestplate')
      let enchantRow2 = CreateEnchantRow(templateRow, 'Mending', 1, 'Book')
      let enchantRow3 = CreateEnchantRow(templateRow, 'Infinity', 1, 'Bow')
      let numRowsPre = $(`#${testContainerID} tr`).length
      enchantRow2.Remove()
      let numRowsPost = $(`#${testContainerID} tr`).length
      jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
      jazil.ShouldBe(EnchantRowInTable(testContainerID, 'Mending', set), false, 'removed row is still present!')
    },

    'Enchant can be changed': (jazil) => {
      let set = GetSet(setLetter)
      let templateRow = GetEnchantTemplateRow(testContainerID, set)
      let enchantRow = CreateEnchantRow(templateRow, 'Feather Falling', 2, 'Boots')
      enchantRow.SetEnchant(BuildEnchant('Depth Strider', 1))
      let details = GetEnchantRowDetails(enchantRow.rowElemJQ, set)
      jazil.ShouldBe(enchantRow.set, set, 'set is off!')
      jazil.ShouldBe(details.name, 'Depth Strider', 'name is off!')
      jazil.ShouldBe(details.level, 1, 'level is off!')
      jazil.ShouldBe(EnchantRowInTable(testContainerID, 'Depth Strider', set), true, 'added row is not present!')
    },

  })
}


CreateTestSet('source', 'sourceEnchantRow', 's')
CreateTestSet('desired', 'desiredEnchantRow', 'd')
CreateTestSet('combine', 'combinesEnchantRow', 'c')
