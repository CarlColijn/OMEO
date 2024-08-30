jazil.AddTestSet(mainPage, 'Item', {
  'Pickaxe gets created with passed details': (jazil) => {
    let pickaxe = BuildItem({ set:g_source, name:'Pickaxe', nr:22, count:44, priorWork:11 })

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
      BuildItem({ set:g_source, name:'Pickaxe', count:11, priorWork:77, cost:1 }),
      BuildItem({ set:g_extra, name:'Pickaxe', count:22, priorWork:77, cost:1 }),
      BuildItem({ set:g_combined, name:'Pickaxe', count:33, priorWork:88, cost:2 }),
      BuildItem({ set:g_desired, name:'Pickaxe', count:44, priorWork:88, cost:3 }),
      BuildItem({ set:g_source, name:'Pickaxe', count:44, priorWork:88, cost:3, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }] }),
      BuildItem({ set:g_desired, name:'Pickaxe', count:44, priorWork:88, cost:3, enchants:[{ name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }] }),
      BuildItem({ set:g_combined, name:'Pickaxe', count:44, priorWork:88, cost:4, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }] })
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
    let pickaxe = BuildItem({ set:g_combined, name:'Pickaxe', enchants:[{ name:'Smite', level:40 }, { name:'Sharpness', level:0 }, { name:'Mending', level:10 }, { name:'Flame', level:0 }] })

    let smiteInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Smite'))
    let foundSmite = false
    let sharpnessInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Sharpness'))
    let foundSharpness = false
    let mendingInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Mending'))
    let foundMending = false
    let flameInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Flame'))
    let foundFlame = false
    let numEnchantsSet = pickaxe.enchantsByID.size
    pickaxe.enchantsByID.forEach((enchant) => {
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
    let pickaxe = BuildItem({ set:g_combined, name:'Pickaxe', enchants:[{ name:'Smite', level:40 }, { name:'Sharpness', level:0 }, { name:'Mending', level:10 }, { name:'Flame', level:0 }] })

    pickaxe.DropUnusedEnchants()

    let smiteInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Smite'))
    let foundSmite = false
    let sharpnessInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Sharpness'))
    let foundSharpness = false
    let mendingInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Mending'))
    let foundMending = false
    let flameInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Flame'))
    let foundFlame = false
    let numEnchantsLeft = pickaxe.enchantsByID.size
    pickaxe.enchantsByID.forEach((enchant) => {
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

  'CollapseTree returns all items': (jazil) => {
    let itemR = BuildItem({ set:g_combined, name:'Shield', count:19, cost:10, totalCost:12, priorWork:3, enchants:[{ name:'Mending', level:1 }] })
    let itemRT = BuildItem({ set:g_combined, name:'Shield', count:2, renamePoint:true, cost:2, totalCost:55, priorWork:1, enchants:[{ name:'Mending', level:1 }] })
    itemR.targetItem = itemRT
    let itemRTT = BuildItem({ set:g_source, nr:3, name:'Shield', count:22, priorWork:2 })
    itemRT.targetItem = itemRTT
    let itemRTS = BuildItem({ set:g_source, nr:1, name:'Book', count:15, priorWork:3, enchants:[{ name:'Mending', level:1 }] })
    itemRT.sacrificeItem = itemRTS
    let itemRS = BuildItem({ set:g_extra, name:'Book', count:6, priorWork:3 })
    itemR.sacrificeItem = itemRS

    let allItems = itemR.CollapseTree()

    jazil.ShouldBe(allItems.length, 5, 'list has incorrect number of items!')
    jazil.Assert(allItems.indexOf(itemR) != -1, 'itemR not found in list!')
    jazil.Assert(allItems.indexOf(itemRT) != -1, 'itemRT not found in list!')
    jazil.Assert(allItems.indexOf(itemRTT) != -1, 'itemRTT not found in list!')
    jazil.Assert(allItems.indexOf(itemRTS) != -1, 'itemRTS not found in list!')
    jazil.Assert(allItems.indexOf(itemRS) != -1, 'itemRS not found in list!')
  },

  'Clone returns all items as clone': (jazil) => {
    let itemR = BuildItem({ set:g_combined, name:'Shield', count:19, cost:10, totalCost:12, priorWork:3, enchants:[{ name:'Mending', level:1 }] })
    let itemRT = BuildItem({ set:g_combined, name:'Shield', count:2, renamePoint:true, cost:2, totalCost:55, priorWork:1, enchants:[{ name:'Mending', level:1 }] })
    itemR.targetItem = itemRT
    let itemRTT = BuildItem({ set:g_source, nr:3, name:'Shield', count:22, priorWork:2 })
    itemRT.targetItem = itemRTT
    let itemRTS = BuildItem({ set:g_source, nr:1, name:'Book', count:15, priorWork:3, enchants:[{ name:'Mending', level:1 }] })
    itemRT.sacrificeItem = itemRTS
    let itemRS = BuildItem({ set:g_extra, name:'Book', count:6, priorWork:3 })
    itemR.sacrificeItem = itemRS

    let cloneR = itemR.Clone()

    jazil.ShouldBe(cloneR.HashAll(), itemR.HashAll(), 'itemR not cloned correctly!')
    jazil.ShouldNotBe(cloneR.targetItem, undefined, 'cloneR has no target item!')
    jazil.ShouldBe(cloneR.targetItem.HashAll(), itemRT.HashAll(), 'itemRT not cloned correctly!')
    jazil.ShouldNotBe(cloneR.targetItem.targetItem, undefined, 'cloneRT has no target item!')
    jazil.ShouldBe(cloneR.targetItem.targetItem.HashAll(), itemRTT.HashAll(), 'itemRTT not cloned correctly!')
    jazil.ShouldNotBe(cloneR.targetItem.sacrificeItem, undefined, 'cloneRT has no sacrifice item!')
    jazil.ShouldBe(cloneR.targetItem.sacrificeItem.HashAll(), itemRTS.HashAll(), 'itemRTS not cloned correctly!')
    jazil.ShouldNotBe(cloneR.sacrificeItem, undefined, 'cloneR has no sacrifice item!')
    jazil.ShouldBe(cloneR.sacrificeItem.HashAll(), itemRS.HashAll(), 'itemRS not cloned correctly!')
  },

})
