jazil.AddTestSet(omeoPage, 'Item', {
  'Pickaxe gets created with passed details': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe', nr:22, count:44, priorWork:11 })

    let pickaxeInfo = GetItemInfo('Pickaxe')

    jazil.ShouldBe(pickaxe.count, 44, 'count')
    jazil.ShouldBe(pickaxe.set, g_source, 'set')
    jazil.ShouldBe(pickaxe.id, pickaxeInfo.id, 'id')
    jazil.ShouldBe(pickaxe.nr, 22, 'nr')
    jazil.ShouldBe(pickaxe.info, pickaxeInfo, 'info')
    jazil.ShouldBe(pickaxe.priorWork, 11, 'priorWork')
    jazil.ShouldBe(pickaxe.cost, 0, 'cost')
    jazil.ShouldBe(pickaxe.totalCost, 0, 'totalCost')
    jazil.ShouldBe(pickaxe.enchantsByID.size, 0, 'newly created pickaxe already has an enchant!')
  },

  'Like items (id & prior work) get same hash': (jazil) => {
    let pickaxe1_a = BuildItem({ name:'Pickaxe', nr:22, count:11, priorWork:77, set:g_source })
    let pickaxe1_b = BuildItem({ name:'Pickaxe', nr:33, count:22, priorWork:77, set:g_extra })
    let pickaxe2_a = BuildItem({ name:'Pickaxe', nr:44, count:33, priorWork:88, set:g_combined })
    let pickaxe2_b = BuildItem({ name:'Pickaxe', nr:55, count:44, priorWork:88, set:g_desired })

    jazil.ShouldBe(pickaxe1_a.Hash(true), pickaxe1_b.Hash(true), 'like items have different hash!')
    jazil.ShouldBe(pickaxe2_a.Hash(true), pickaxe2_b.Hash(true), 'like items have different hash!')
    jazil.ShouldNotBe(pickaxe2_a.Hash(true), pickaxe1_a.Hash(true), 'unlike items have same hash!')
    jazil.ShouldNotBe(pickaxe2_b.Hash(true), pickaxe1_b.Hash(true), 'unlike items have same hash!')
  },

  'Set enchants get set': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe', nr:22, enchants:[{ name:'Smite', level:40 }, { name:'Sharpness', level:0 }, { name:'Mending', level:10 }, { name:'Flame', level:0 }] })

    let smiteInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Smite'))
    let foundSmite = false
    let sharpnessInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Sharpness'))
    let foundSharpness = false
    let mendingInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Mending'))
    let foundMending = false
    let flameInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Flame'))
    let foundFlame = false
    let numEnchantsSet = 0
    pickaxe.enchantsByID.forEach((enchant) => {
      ++numEnchantsSet
      if (enchant.id === smiteInfo.id)
        foundSmite = true
      if (enchant.id === sharpnessInfo.id)
        foundSharpness = true
      if (enchant.id === mendingInfo.id)
        foundMending = true
      if (enchant.id === flameInfo.id)
        foundFlame = true
    })

    jazil.ShouldBe(numEnchantsSet, 4, 'Wrong number of enchants set!')
    jazil.Assert(foundSmite, 'Smite disappeared!')
    jazil.Assert(foundSharpness, 'Sharpness disappeared!')
    jazil.Assert(foundMending, 'Mending disappeared!')
    jazil.Assert(foundFlame, 'Flame disappeared!')
  },

  'Unused enchants (lvl 0) get dropped': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe', nr:22, enchants:[{ name:'Smite', level:40 }, { name:'Sharpness', level:0 }, { name:'Mending', level:10 }, { name:'Flame', level:0 }] })

    pickaxe.DropUnusedEnchants()

    let smiteInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Smite'))
    let foundSmite = false
    let sharpnessInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Sharpness'))
    let foundSharpness = false
    let mendingInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Mending'))
    let foundMending = false
    let flameInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Flame'))
    let foundFlame = false
    let numEnchantsLeft = 0
    pickaxe.enchantsByID.forEach((enchant) => {
      ++numEnchantsLeft
      if (enchant.id === smiteInfo.id)
        foundSmite = true
      if (enchant.id === sharpnessInfo.id)
        foundSharpness = true
      if (enchant.id === mendingInfo.id)
        foundMending = true
      if (enchant.id === flameInfo.id)
        foundFlame = true
    })

    jazil.Assert(foundSmite, 'Smite disappeared!')
    jazil.Assert(!foundSharpness, 'Sharpness is still here!')
    jazil.Assert(foundMending, 'Mending disappeared!')
    jazil.Assert(!foundFlame, 'Flame is still here!')
    jazil.ShouldBe(numEnchantsLeft, 2, 'Wrong number of enchants left!')
  },

})
