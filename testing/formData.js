function CheckRestoredItemCostDefaults(jazil, item, itemDescription) {
  jazil.ShouldBe(item.cost, 0, `${itemDescription} cost is not 0!`)
  jazil.ShouldBe(item.totalCost, 0, `${itemDescription} totalCost is not 0!`)
}


function CompareItemsEqual(jazil, item1, item2, itemDescription) {
  jazil.ShouldBe(item1.count, item2.count, `${itemDescription} count not equal!`)
  jazil.ShouldBe(item1.set, item2.set, `${itemDescription} set not equal!`)
  jazil.ShouldBe(item1.id, item2.id, `${itemDescription} id not equal!`)
  jazil.ShouldBe(item1.info, item2.info, `${itemDescription} info not equal!`)
  jazil.ShouldBe(item1.priorWork, item2.priorWork, `${itemDescription} priorWork not equal!`)
  jazil.ShouldBe(item1.cost, item2.cost, `${itemDescription} cost is not equal!`)
  jazil.ShouldBe(item1.totalCost, item2.totalCost, `${itemDescription} totalCost is not equal!`)

  item1.enchantsByID.forEach((enchant1, id) => {
    let enchant2 = item2.enchantsByID.get(id)
    jazil.ShouldNotBe(enchant1, undefined, `${itemDescription} enchant ${id} not found on item1!`)
    jazil.ShouldNotBe(enchant2, undefined, `${itemDescription} enchant ${id} not found on item2!`)
    jazil.ShouldBe(enchant1.id, enchant2.id, `${itemDescription} enchant ${id} IDs not the same!`)
    jazil.ShouldBe(enchant1.info, enchant2.info, `${itemDescription} enchant ${id} infos not the same!`)
    jazil.ShouldBe(enchant1.level, enchant2.level, `${itemDescription} enchant ${id} levels not the same!`)
  })
}


jazil.AddTestSet(omeoPage, 'FormData', {
  'Initialized correctly': (jazil) => {
    let data = new FormData

    jazil.ShouldBe(data.desiredItem, undefined, 'Desired item already present on new form data!')
    jazil.ShouldBe(data.sourceItems.length, 0, 'Source items already present on new form data!')
  },

  'Desired item gets set': (jazil) => {
    let data = new FormData

    let axe = BuildItem({ name:'Axe', set:g_desired })
    data.SetDesiredItem(axe)

    jazil.ShouldBe(data.desiredItem, axe, 'Initial desired item not set correctly!')

    let sword = BuildItem({ name:'Sword', set:g_desired })
    data.SetDesiredItem(sword)

    jazil.ShouldBe(data.desiredItem, sword, 'Updated desired item not set correctly!')
  },

  'Source items get added individually': (jazil) => {
    let data = new FormData

    for (let swordNr = 0; swordNr < 10; ++swordNr) {
      let sword = BuildItem({ name:'Sword', count:44 })
      data.AddSourceItem(sword)

      jazil.ShouldBe(data.sourceItems.length, swordNr + 1, `Item ${swordNr} not added to source items!`)
      jazil.ShouldBe(data.sourceItems[swordNr], sword, `Added source item ${swordNr} not set correctly!`)
    }
  },

  'Source items get added in bulk': (jazil) => {
    let data = new FormData

    let swords = []
    let numSwords = 10
    for (let swordNr = 0; swordNr < numSwords; ++swordNr)
      swords.push(BuildItem({ name:'Sword', count:44 }))

    data.AddSourceItems(swords)

    jazil.ShouldBe(data.sourceItems.length, numSwords, 'Not all items added to source items!')
    for (let swordNr = 0; swordNr < numSwords; ++swordNr)
      jazil.ShouldBe(data.sourceItems[swordNr], swords[swordNr], `Added source item ${swordNr} not set correctly!`)
  },

  'Simple items get serialized/deserialized OK': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let pickaxe = BuildItem({ name:'Pickaxe', count:11, set:g_desired, priorWork:0 })
    let axe = BuildItem({ name:'Axe', count:22, set:g_source, priorWork:1 })
    let sword = BuildItem({ name:'Sword', count:33, set:g_source, priorWork:2 })
    let helmet = BuildItem({ name:'Helmet', count:44, set:g_source, priorWork:3 })

    let storedData = new FormData
    storedData.SetDesiredItem(pickaxe)
    storedData.AddSourceItem(axe)
    storedData.AddSourceItem(sword)
    storedData.AddSourceItem(helmet)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'ceKRdGfGvFIvpxqkf_F')

    let restoreStream = new DataStream(false)
    let conflictSolver = new DataStreamConflictSolverMock(true)
    restoreStream.Load(conflictSolver)

    let restoredData = new FormData
    restoredData.Deserialize(restoreStream)

    jazil.ShouldBe(restoredData.sourceItems.length, 3, 'Incorrect number of source items restored!')
    CheckRestoredItemCostDefaults(jazil, restoredData.desiredItem, 'desired item')
    CompareItemsEqual(jazil, storedData.desiredItem, restoredData.desiredItem, 'desired item')
    for (let itemNr = 0; itemNr < restoredData.sourceItems.length; ++itemNr) {
      CheckRestoredItemCostDefaults(jazil, restoredData.sourceItems[itemNr], `source item ${itemNr}`)
      CompareItemsEqual(jazil, storedData.sourceItems[itemNr], restoredData.sourceItems[itemNr], `source item ${itemNr}`)
    }
  },

  'Enchanted items get serialized/deserialized OK': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let sword = BuildItem({ name:'Sword', count:11, set:g_desired, priorWork:1, enchants:[{ name:'Looting' }] })
    let book = BuildItem({ name:'Book', count:33, set:g_source, priorWork:3, enchants:[{ name:'Fortune', level:3 }, { name:'Smite', level:1 }, { name:'Efficiency', level:2 }] })
    let axe = BuildItem({ name:'Axe', count:22, set:g_source, priorWork:2, enchants:[{ name:'Fortune', level:3 }] })

    let storedData = new FormData
    storedData.SetDesiredItem(sword)
    storedData.AddSourceItem(book)
    storedData.AddSourceItem(axe)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'cefG_Wzsji5kxjcrykvpYH')

    let restoreStream = new DataStream(false)
    let conflictSolver = new DataStreamConflictSolverMock(true)
    restoreStream.Load(conflictSolver)

    let restoredData = new FormData
    restoredData.Deserialize(restoreStream)

    jazil.ShouldBe(restoredData.sourceItems.length, 2, 'Incorrect number of source items restored!')
    CheckRestoredItemCostDefaults(jazil, restoredData.desiredItem, 'desired item')
    CompareItemsEqual(jazil, storedData.desiredItem, restoredData.desiredItem, 'desired item')
    for (let itemNr = 0; itemNr < restoredData.sourceItems.length; ++itemNr) {
      CheckRestoredItemCostDefaults(jazil, restoredData.sourceItems[itemNr], `source item ${itemNr}`)
      CompareItemsEqual(jazil, storedData.sourceItems[itemNr], restoredData.sourceItems[itemNr], `source item ${itemNr}`)
    }
  },

  'Malformed form data gives error when deserializing': (jazil) => {
    /*
    let sword = BuildItem({ name:'Sword', count:11, set:g_desired, priorWork:1, enchants:[{ name:'Looting' }] })
    let book = BuildItem({ name:'Book', count:33, set:g_source, priorWork:3, enchants:[{ name:'Fortune', level:3 }] })

    // gives serialized data state ccmbaGKRKQhza_
    */

    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('ccmbaGKRKQ') // truncated data

    let restoreStream = new DataStream(false)
    let conflictSolver = new DataStreamConflictSolverMock(true)
    restoreStream.Load(conflictSolver)

    let restoredData = new FormData
    let deserializedOK = restoredData.Deserialize(restoreStream)
    jazil.ShouldBe(deserializedOK, false, 'Could deserialize corrupt data!')
    jazil.ShouldBe(restoredData.sourceItems.length, 0, 'Faulty source items restored!')
    jazil.ShouldBe(restoredData.desiredItem, undefined, 'Faulty desired item restored!')
  },

  'Reset form state for upcoming tests': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()
  },

})
