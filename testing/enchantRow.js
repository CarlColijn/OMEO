function GetEnchantTemplateRow() {
  return new EnchantRow($('#enchantRow .template'))
}


function CreateEnchantRow(templateRow, enchantName, enchantLevel, itemName) {
  return templateRow.CreateNew(
    BuildEnchant(enchantName, enchantLevel),
    GetItemInfo(itemName).id,
    false, undefined
  )
}


function GetEnchantRowDetails(enchantRowElemJQ) {
  let enchantIDText = enchantRowElemJQ.find('[name=enchantID]').val()
  let enchantID = enchantIDText === null ? 0 : parseInt(enchantIDText)
  let levelElemJQ = enchantRowElemJQ.find('[name=level]')
  let level = parseInt(levelElemJQ.val())
  return {
    'name': g_enchantInfosByID.get(enchantID).name,
    'level': level
  }
}


function EnchantRowInTable(enchantName) {
  let foundRow = false
  $('#enchantRow tr').each((rowNr, enchantRowElem) => {
    let enchantRowElemJQ = $(enchantRowElem)
    let details = GetEnchantRowDetails(enchantRowElemJQ)
    if (details.name == enchantName) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




jazil.AddTestSet(mainPage, 'EnchantRow', {
  'Template row is not real': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    jazil.ShouldBe(templateRow.IsReal(), false)
  },

  'New row is real': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let enchantRow = CreateEnchantRow(templateRow, 'Fortune', 2, 'Book')
    jazil.ShouldBe(enchantRow.IsReal(), true)
  },

  'Create new row from template': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let enchantRow = CreateEnchantRow(templateRow, 'Unbreaking', 3, 'Axe')
    let details = GetEnchantRowDetails(enchantRow.rowElemJQ)
    jazil.ShouldBe(details.name, 'Unbreaking', 'name is off!')
    jazil.ShouldBe(details.level, 3, 'level is off!')
    jazil.ShouldBe(EnchantRowInTable('Unbreaking'), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let numRowsPre = $('#enchantRow tr').length
    let enchantRow1 = CreateEnchantRow(templateRow, 'Smite', 1, 'Sword')
    let enchantRow2 = CreateEnchantRow(templateRow, 'Aqua Affinity', 1, 'Book')
    let enchantRow3 = CreateEnchantRow(templateRow, 'Blast Protection', 2, 'Leggings')
    let numRowsPost = $('#enchantRow tr').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

  'Rows can be removed': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let enchantRow1 = CreateEnchantRow(templateRow, 'Protection', 2, 'Chestplate')
    let enchantRow2 = CreateEnchantRow(templateRow, 'Mending', 1, 'Book')
    let enchantRow3 = CreateEnchantRow(templateRow, 'Infinity', 1, 'Bow')
    let numRowsPre = $('#enchantRow tr').length
    enchantRow2.Remove()
    let numRowsPost = $('#enchantRow tr').length
    jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
    jazil.ShouldBe(EnchantRowInTable('Mending'), false, 'removed row is still present!')
  },

  'Enchant can be changed': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let enchantRow = CreateEnchantRow(templateRow, 'Feather Falling', 2, 'Boots')
    enchantRow.SetEnchant(BuildEnchant('Depth Strider', 1))
    let details = GetEnchantRowDetails(enchantRow.rowElemJQ)
    jazil.ShouldBe(details.name, 'Depth Strider', 'name is off!')
    jazil.ShouldBe(details.level, 1, 'level is off!')
    jazil.ShouldBe(EnchantRowInTable('Depth Strider'), true, 'added row is not present!')
  },

})
