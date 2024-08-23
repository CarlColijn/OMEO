jazil.AddTestSet(mainPage, 'Item', {
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

  'Identical items get the same hash': (jazil) => {
    let items = [
      BuildItem({ name:'Pickaxe', count:11, priorWork:77, cost:1, set:g_source }),
      BuildItem({ name:'Pickaxe', count:22, priorWork:77, cost:1, set:g_extra }),
      BuildItem({ name:'Pickaxe', count:33, priorWork:88, cost:2, set:g_combined }),
      BuildItem({ name:'Pickaxe', count:44, priorWork:88, cost:3, set:g_desired }),
      BuildItem({ name:'Pickaxe', count:44, priorWork:88, cost:3, set:g_source, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }] }),
      BuildItem({ name:'Pickaxe', count:44, priorWork:88, cost:3, set:g_desired, enchants:[{ name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }] }),
      BuildItem({ name:'Pickaxe', count:44, priorWork:88, cost:4, set:g_combined, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }] })
    ]

    let sameCombosWithoutCost = new Set()
    sameCombosWithoutCost.add('0,1')
    sameCombosWithoutCost.add('2,3')
    sameCombosWithoutCost.add('4,6')
    let sameCombosWithCost = new Set()
    sameCombosWithCost.add('0,1')

    for (let item1Nr = 0; item1Nr < items.length - 1; ++item1Nr) {
      let item1 = items[item1Nr]
      // note: we start from item1Nr onwards; this way we get an extra
      // check on item === item for free.
      for (let item2Nr = item1Nr; item2Nr < items.length; ++item2Nr) {
        let item2 = items[item2Nr]

        let itemIndexCombo = `${item1Nr},${item2Nr}`

        let sameHashWithoutCost = item1.HashTypeAndPriorWork() == item2.HashTypeAndPriorWork()
        if (item1Nr == item2Nr || sameCombosWithoutCost.has(itemIndexCombo))
          jazil.Assert(sameHashWithoutCost, `like items without cost ${itemIndexCombo} have different hash!`)
        else
          jazil.Assert(!sameHashWithoutCost, `unlike items without cost ${itemIndexCombo} have same hash!`)

        let sameHashWithCost = item1.HashTypeAndPriorWorkAndCost() == item2.HashTypeAndPriorWorkAndCost()
        if (item1Nr == item2Nr || sameCombosWithCost.has(itemIndexCombo))
          jazil.Assert(sameHashWithCost, `like items with cost ${itemIndexCombo} have different hash!`)
        else
          jazil.Assert(!sameHashWithCost, `unlike items with cost ${itemIndexCombo} have same hash!`)
      }
    }
  },

  'Set enchants get set': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Smite', level:40 }, { name:'Sharpness', level:0 }, { name:'Mending', level:10 }, { name:'Flame', level:0 }] })

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
    let pickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Smite', level:40 }, { name:'Sharpness', level:0 }, { name:'Mending', level:10 }, { name:'Flame', level:0 }] })

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