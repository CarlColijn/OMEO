jazil.AddTestSet(omeoPage, 'EnchantInfo', {
  'All enchants are counted': (jazil) => {
    jazil.ShouldBe(g_numDifferentEnchants(), g_enchantInfos.length)
  },

  'Enchant bit count is reasonable': (jazil) => {
    jazil.ShouldBe(g_numEnchantIDBits(), 6, 'g_numEnchantIDBits')
  },

  'Infos by ID line up': (jazil) => {
    let numInfos = 0
    g_enchantInfosByID.forEach((info, id) => {
      ++numInfos
      jazil.ShouldBe(info.id, parseInt(id), 'g_enchantInfosByID id->info mismatch!')
    })
    jazil.ShouldBe(numInfos, g_enchantInfos.length, 'g_enchantInfosByID size mismatch!')
  },

  'IDs by name line up': (jazil) => {
    let numInfos = 0
    g_enchantIDsByName.forEach((id, name) => {
      ++numInfos
      jazil.ShouldBe(g_enchantInfosByID.get(id).name, name, 'g_enchantIDsByName name->id mismatch!')
    })
    jazil.ShouldBe(numInfos, g_enchantInfos.length, 'g_enchantIDsByName size mismatch!')
  },

  'g_enchantIDsByName works': (jazil) => {
    let id = g_enchantIDsByName.get('Aqua Affinity')
    jazil.ShouldBe(id, 0, 'Aqua Affinity\'s id is wrong!')
    id = g_enchantIDsByName.get('Smite')
    jazil.ShouldBe(id, 32, 'Smite\'s id is wrong!')
    id = g_enchantIDsByName.get('Unbreaking')
    jazil.ShouldBe(id, 36, 'Unbreaking\'s id is wrong!')
    id = g_enchantIDsByName.get('XYZ')
    jazil.ShouldBe(id, undefined, 'got an ID for XYZ!')
  },

  'Helper GetEnchantInfo works': (jazil) => {
    let info = g_enchantInfosByID.get(g_enchantIDsByName.get('Aqua Affinity'))
    jazil.ShouldBe(info.id, 0, 'Aqua Affinity\'s id is wrong!')
    info = g_enchantInfosByID.get(g_enchantIDsByName.get('Smite'))
    jazil.ShouldBe(info.id, 32, 'Smite\'s id is wrong!')
    info = g_enchantInfosByID.get(g_enchantIDsByName.get('Unbreaking'))
    jazil.ShouldBe(info.id, 36, 'Unbreaking\'s id is wrong!')
    info = g_enchantInfosByID.get('XYZ')
    jazil.ShouldBe(info, undefined, 'got an info for XYZ!')
  },

  // We're not creating an actual info here, since that would add it to all
  // system lists.  We're using 'Fire protection' here since that one has
  // different values for all properties.

  'Object has given data on creation': (jazil) => {
    let testInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Fire Protection'))

    jazil.ShouldBe(testInfo.id, 9, 'id')
    jazil.ShouldBe(testInfo.maxLevel, 4, 'maxLevel')
    jazil.ShouldBe(testInfo.bookMultiplier, 1, 'bookMultiplier')
    jazil.ShouldBe(testInfo.toolMultiplier, 2, 'toolMultiplier')
    jazil.ShouldBe(testInfo.name, 'Fire Protection', 'name')
  },

})
