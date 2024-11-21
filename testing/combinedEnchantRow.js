function GetCombinedEnchantTemplateRow() {
  return new CombinedEnchantRowTemplate(document.getElementById('combinedEnchantRow'), 'enchant')
}


function CreateCombinedEnchantRow(templateRow, enchantName, enchantLevel) {
  return templateRow.CreateNew(
    BuildEnchant(enchantName, enchantLevel)
  )
}


function GetCombinedEnchantRowDetails(enchantRowElem) {
  return {
    'name': enchantRowElem.querySelector('.name').textContent,
    'level': GetEnchantLevelFromGUIText(enchantRowElem.querySelector('.level').textContent)
  }
}


function CombinedEnchantRowInTable(enchantName) {
  let foundRow = false
  document.querySelectorAll('#combinedEnchantRow tr').forEach((enchantRowElem) => {
    let details = GetCombinedEnchantRowDetails(enchantRowElem)
    if (details.name == enchantName) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




jazil.AddTestSet(mainPage, 'CombinedEnchantRow', {
  'Template row is not real': (jazil) => {
    let templateRow = GetCombinedEnchantTemplateRow()
    jazil.ShouldBe(templateRow.IsReal(), false)
  },

  'New row is real': (jazil) => {
    let templateRow = GetCombinedEnchantTemplateRow()
    let enchantRow = CreateCombinedEnchantRow(templateRow, 'Fortune', 2)
    jazil.ShouldBe(enchantRow.IsReal(), true)
  },

  'Create new row from template': (jazil) => {
    let templateRow = GetCombinedEnchantTemplateRow()
    let enchantRow = CreateCombinedEnchantRow(templateRow, 'Unbreaking', 3)
    let details = GetCombinedEnchantRowDetails(enchantRow.elem)
    jazil.ShouldBe(details.name, 'Unbreaking', 'name is off!')
    jazil.ShouldBe(details.level, 3, 'level is off!')
    jazil.ShouldBe(CombinedEnchantRowInTable('Unbreaking'), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetCombinedEnchantTemplateRow()
    let numRowsPre = document.querySelectorAll('#combinedEnchantRow tr').length
    let enchantRow1 = CreateCombinedEnchantRow(templateRow, 'Smite', 1)
    let enchantRow2 = CreateCombinedEnchantRow(templateRow, 'Aqua Affinity', 1)
    let enchantRow3 = CreateCombinedEnchantRow(templateRow, 'Blast Protection', 2)
    let numRowsPost = document.querySelectorAll('#combinedEnchantRow tr').length
    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

})
