function GetEnchantTemplateRow() {
  return new EnchantRowTemplate($('#enchantRow'), 'enchant')
}


function CreateEnchantRow(templateRow, enchantName, enchantLevel, itemName, allRows) {
  let itemID = GetItemInfo(itemName).id

  let enchant =
    enchantName === undefined ?
    undefined :
    BuildEnchant(enchantName, enchantLevel)

  return templateRow.CreateNew(
    itemID, enchant, allRows,
    false, undefined, undefined
  )
}


function GetEnchantRowDetails(enchantRowElemJQ) {
  let idElemJQ = enchantRowElemJQ.find('[name=enchantID]')
  let idText = idElemJQ.val()
  let id = idText === null ? 0 : parseInt(idText)
  let levelElemJQ = enchantRowElemJQ.find('.levelInput .selectedButton')
  let level = parseInt(levelElemJQ.val()) + 1
  let enabledByID = new Map()
  idElemJQ.find('option').each(function() {
    let optionElemJQ = $(this)
    let optionID = parseInt(optionElemJQ.val())
    let enabled = optionElemJQ.attr('disabled') !== 'disabled'
    enabledByID.set(optionID, enabled)
  })
  return {
    id: id,
    name: g_enchantInfosByID.get(id).name,
    level: level,
    enabledByID: enabledByID
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
    let allRows = []

    let enchantRow = CreateEnchantRow(templateRow, 'Fortune', 2, 'Book', allRows)

    jazil.ShouldBe(enchantRow.IsReal(), true)
  },

  'New unspecified row has correct default enchant': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let enchantRow = CreateEnchantRow(templateRow, undefined, undefined, 'Axe', allRows)
    let details = GetEnchantRowDetails(enchantRow.elemJQ)

    jazil.ShouldBe(enchantRow.IsReal(), true, 'IsReal is off!')
    jazil.ShouldBe(enchantRow.GetEnchantID(), details.id, 'id is off!')
    jazil.ShouldBe(details.name, 'Bane of Arthropods', 'name is off!')
    jazil.ShouldBe(details.level, 1, 'level is off!')
    jazil.ShouldBe(EnchantRowInTable('Bane of Arthropods'), true, 'added row is not present!')
  },

  '2nd unspecified row has correct default enchant': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let enchantRow1 = CreateEnchantRow(templateRow, undefined, undefined, 'Axe', allRows)
    let enchantRow2 = CreateEnchantRow(templateRow, undefined, undefined, 'Axe', allRows)
    let details = GetEnchantRowDetails(enchantRow2.elemJQ)

    jazil.ShouldBe(enchantRow2.IsReal(), true, 'IsReal is off!')
    jazil.ShouldBe(enchantRow2.GetEnchantID(), details.id, 'id is off!')
    jazil.ShouldBe(details.name, 'Curse of Vanishing', 'name is off!')
    jazil.ShouldBe(details.level, 1, 'level is off!')
    jazil.ShouldBe(EnchantRowInTable('Curse of Vanishing'), true, 'added row is not present!')
  },

  'Create new row from template': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let enchantRow = CreateEnchantRow(templateRow, 'Unbreaking', 3, 'Axe', allRows)
    let details = GetEnchantRowDetails(enchantRow.elemJQ)

    jazil.ShouldBe(enchantRow.GetEnchantID(), details.id, 'id is off!')
    jazil.ShouldBe(details.name, 'Unbreaking', 'name is off!')
    jazil.ShouldBe(details.level, 3, 'level is off!')
    jazil.ShouldBe(EnchantRowInTable('Unbreaking'), true, 'added row is not present!')
  },

  'Added row count is OK': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let numRowsPre = $('#enchantRow tr').length
    let enchantRow1 = CreateEnchantRow(templateRow, 'Respiration', 1, 'Helmet', allRows)
    let enchantRow2 = CreateEnchantRow(templateRow, 'Aqua Affinity', 1, 'Helmet', allRows)
    let enchantRow3 = CreateEnchantRow(templateRow, 'Blast Protection', 2, 'Helmet', allRows)
    let numRowsPost = $('#enchantRow tr').length

    jazil.ShouldBe(numRowsPost - numRowsPre, 3, 'amount of rows added is off!')
  },

  'Rows can be removed': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let enchantRow1 = CreateEnchantRow(templateRow, 'Protection', 2, 'Chestplate', allRows)
    let enchantRow2 = CreateEnchantRow(templateRow, 'Mending', 1, 'Chestplate', allRows)
    let enchantRow3 = CreateEnchantRow(templateRow, 'Thorns', 1, 'Chestplate', allRows)
    let numRowsPre = $('#enchantRow tr').length
    enchantRow2.Remove()
    let numRowsPost = $('#enchantRow tr').length

    jazil.ShouldBe(numRowsPost - numRowsPre, -1, 'amount of rows removed is off!')
    jazil.ShouldBe(EnchantRowInTable('Mending'), false, 'removed row is still present!')
  },

  'Enchant can be changed': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let enchantRow = CreateEnchantRow(templateRow, 'Feather Falling', 2, 'Boots', allRows)
    enchantRow.SetEnchant(BuildEnchant('Depth Strider', 1))
    let details = GetEnchantRowDetails(enchantRow.elemJQ)

    jazil.ShouldBe(enchantRow.GetEnchantID(), details.id, 'id is off!')
    jazil.ShouldBe(details.name, 'Depth Strider', 'name is off!')
    jazil.ShouldBe(details.level, 1, 'level is off!')
    jazil.ShouldBe(EnchantRowInTable('Depth Strider'), true, 'added row is not present!')
  },

  'Row options are mutually exclusive': (jazil) => {
    let templateRow = GetEnchantTemplateRow()
    let allRows = []

    let thornsRow = CreateEnchantRow(templateRow, 'Thorns', 2, 'Book', allRows)
    let smiteRow = CreateEnchantRow(templateRow, 'Smite', 1, 'Book', allRows)
    let infinityRow = CreateEnchantRow(templateRow, 'Infinity', 1, 'Book', allRows)

    let thorns = BuildEnchant('Thorns', 2)
    let smite = BuildEnchant('Smite', 1)
    let density = BuildEnchant('Density', 1) // conflict=combo with smite
    let infinity = BuildEnchant('Infinity', 1)
    let looting = BuildEnchant('Looting', 1) // unrelated

    let thornsDetails = GetEnchantRowDetails(thornsRow.elemJQ)
    let smiteDetails = GetEnchantRowDetails(smiteRow.elemJQ)
    let infinityDetails = GetEnchantRowDetails(infinityRow.elemJQ)

    let tests = [
      {
        details: thornsDetails,
        main: thorns,
        enabled: [thorns, looting],
        disabled: [smite, density, infinity]
      },
      {
        details: smiteDetails,
        main: smite,
        enabled: [smite, density, looting],
        disabled: [thorns, infinity]
      },
      {
        details: infinityDetails,
        main: infinity,
        enabled: [infinity, looting],
        disabled: [thorns, smite, density]
      },
    ]

    tests.forEach((test) => {
      test.enabled.forEach((enabled) => {
        jazil.Assert(test.details.enabledByID.get(enabled.id), `${enabled.info.name} is disabled for ${test.main.info.name}!`)
      })
      test.disabled.forEach((disabled) => {
        jazil.Assert(!test.details.enabledByID.get(disabled.id), `${disabled.info.name} is enabled for ${test.main.info.name}!`)
      })
    })
  },

})
