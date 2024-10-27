// returns object {
//   section: EnchantSection
//   hasEnchants: bool
// }
// .hasEnchants will be updated by actions on .section
function CreateEnchantSection(item) {
  let parentElemJQ = $('#enchantSection')
  let addEnchantElemJQ = parentElemJQ.find('button[name="addEnchant"]')
  let result = {
    hasEnchants: undefined,
    addEnchantElemJQ: addEnchantElemJQ
  }
  let ChangeHandlerMock = (hasEnchants) => {
    result.hasEnchants = hasEnchants
  }
  result.section = new EnchantSection(item, addEnchantElemJQ, parentElemJQ, ChangeHandlerMock)
  return result
}


function ItemHasSameEnchants(jazil, originalItem, testItem) {
  for (let enchantID = 0; enchantID < g_numDifferentEnchants; ++enchantID) {
    let originalEnchant = originalItem.enchantsByID.get(enchantID)
    let testEnchant = testItem.enchantsByID.get(enchantID)
    jazil.ShouldBe(originalEnchant !== undefined, testEnchant !== undefined, `enchant ${enchantID} presence different!`)
    if (originalEnchant !== undefined)
      jazil.ShouldBe(originalEnchant.level, testEnchant.level, `enchant ${enchantID} level different!`)
  }
}


jazil.AddTestSet(mainPage, 'EnchantSection', {
  'New section has no enchants': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0 })
    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), false, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, false, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'initial disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, originalItem, testItem)
  },

  'Enchants get retrieved from initially set item': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0, enchants:[{ name:'Smite', level:2 }, { name:'Unbreaking', level:3 }] })
    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'initial disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, originalItem, testItem)
  },

  'Remove enchants results in no enchants': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0, enchants:[{ name:'Smite', level:2 }, { name:'Unbreaking', level:3 }] })
    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'initial disabled state is off!')

    let emptyItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.RemoveEnchants()
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), false, 'updated self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, false, 'updated deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'updated disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, emptyItem, testItem)
  },

  'Changed item\'s enchants get returned': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0, enchants:[{ name:'Smite', level:2 }, { name:'Unbreaking', level:3 }] })
    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'initial disabled state is off!')

    let changedItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0, enchants:[{ name:'Mending', level:1 }, { name:'Protection', level:4 }] })
    sectionInfo.section.ChangeItem(changedItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'updated self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'updated deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'updated disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, changedItem, testItem)
  },

  'Newly set enchants get returned': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0, enchants:[{ name:'Smite', level:2 }, { name:'Unbreaking', level:3 }] })
    let sectionInfo = CreateEnchantSection(originalItem)

    let changedItem = BuildItem({ set:g_source, name:'Book', count:1, priorWork:0, cost:0, enchants:[{ name:'Smite', level:3 }, { name:'Luck of the Sea', level:1 }, { name:'Lure', level:1 }] })
    let changedEnchants = []
    changedItem.enchantsByID.forEach((enchant, id) => {
      changedEnchants.push(enchant)
    })
    sectionInfo.section.SetEnchants(changedEnchants)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'updated self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'updated deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'updated disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, changedItem, testItem)
  },

  'Full set of enchants disables add button': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Shears', count:1, priorWork:0, cost:0, enchants:[{ name:'Efficiency', level:2 }, { name:'Mending', level:1 }] })

    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'initial disabled state is off!')

    let changedItem = BuildItem({ set:g_source, name:'Shears', count:1, priorWork:0, cost:0, enchants:[{ name:'Curse of Vanishing', level:1 }, { name:'Efficiency', level:2 }, { name:'Mending', level:1 }, { name:'Unbreaking', level:1 }] })
    sectionInfo.section.ChangeItem(changedItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'updated self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'updated deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), true, 'updated disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, changedItem, testItem)
  },

  'Removing all enchants re-enables add button': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Shears', count:1, priorWork:0, cost:0, enchants:[{ name:'Curse of Vanishing', level:1 }, { name:'Efficiency', level:2 }, { name:'Mending', level:1 }, { name:'Unbreaking', level:1 }] })

    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), true, 'initial disabled state is off!')

    let emptyItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.RemoveEnchants()
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), false, 'updated self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, false, 'updated deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'updated disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, emptyItem, testItem)
  },

  'Updating to item with room for enchants re-enables add button': (jazil) => {
    let originalItem = BuildItem({ set:g_source, name:'Shears', count:1, priorWork:0, cost:0, enchants:[{ name:'Curse of Vanishing', level:1 }, { name:'Efficiency', level:2 }, { name:'Mending', level:1 }, { name:'Unbreaking', level:1 }] })

    let sectionInfo = CreateEnchantSection(originalItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'initial self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'initial deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), true, 'initial disabled state is off!')

    let changedItem = BuildItem({ set:g_source, name:'Shears', count:1, priorWork:0, cost:0, enchants:[{ name:'Efficiency', level:2 }, { name:'Mending', level:1 }] })
    sectionInfo.section.ChangeItem(changedItem)
    jazil.ShouldBe(sectionInfo.section.HasEnchants(), true, 'updated self-reported HasEnchants is off!')
    jazil.ShouldBe(sectionInfo.hasEnchants, true, 'updated deduced hasEnchants is off!')
    jazil.ShouldBe(sectionInfo.addEnchantElemJQ.prop('disabled'), false, 'updated disabled state is off!')

    let testItem = new Item(1, g_source, 0, 0)
    sectionInfo.section.AddEnchantsToItem(testItem)
    ItemHasSameEnchants(jazil, changedItem, testItem)
  },

})
