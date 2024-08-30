function CompareItemsEqual(jazil, item1, item2, itemDescription) {
  jazil.ShouldBe(item1.nr, item2.nr, `${itemDescription} nr not equal!`)
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

  jazil.ShouldBe(item1.targetItem === undefined, item2.targetItem === undefined, `${itemDescription} targetItem is not present equal!`)
  jazil.ShouldBe(item1.sacrificeItem === undefined, item2.sacrificeItem === undefined, `${itemDescription} sacrificeItem is not present equal!`)

  if (item1.targetItem !== undefined) {
    CompareItemsEqual(jazil, item1.targetItem, item2.targetItem, itemDescription + '.target')
    CompareItemsEqual(jazil, item1.sacrificeItem, item2.sacrificeItem, itemDescription + '.sacrifice')
  }
}


jazil.AddTestSet(recipePage, 'RecipeFormData', {
  'Initialized correctly': (jazil) => {
    let data = new RecipeFormData

    jazil.ShouldBe(data.item, undefined, 'Item already present on new form data!')
  },

  'Item gets set': (jazil) => {
    let data = new RecipeFormData

    let axe = BuildItem({ set:g_source, name:'Axe' })
    data.SetItem(axe)

    jazil.ShouldBe(data.item, axe, 'Initial item not set correctly!')

    let sword = BuildItem({ set:g_source, name:'Sword' })
    data.SetItem(sword)

    jazil.ShouldBe(data.item, sword, 'Updated item not set correctly!')
  },

  'Simple item get serialized/deserialized OK': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let item = BuildItem({ set:g_source, name:'Pickaxe', count:11, nr:5, priorWork:0, cost:4, totalCost:55 })

    let storedData = new RecipeFormData
    storedData.SetItem(item)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'cixlcGSWZh')

    let loadingOptions = new DataStreamLoadingOptions()
    let restoreStream = new DataStream(false)
    restoreStream.Load(loadingOptions)

    let restoredData = new RecipeFormData
    restoredData.Deserialize(restoreStream)

    jazil.ShouldNotBe(restoredData.item, undefined, 'Item is not restored!')
    CompareItemsEqual(jazil, item, restoredData.item, 'item')
  },

  'Enchanted item get serialized/deserialized OK': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let item = BuildItem({ set:g_combined, name:'Sword', count:11, priorWork:1, cost:66, totalCost:11, enchants:[{ name:'Sharpness', level:4 }] })

    let storedData = new RecipeFormData
    storedData.SetItem(item)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'ciBRMGdRlL_')

    let loadingOptions = new DataStreamLoadingOptions()
    let restoreStream = new DataStream(false)
    restoreStream.Load(loadingOptions)

    let restoredData = new RecipeFormData
    restoredData.Deserialize(restoreStream)

    jazil.ShouldNotBe(restoredData.item, undefined, 'Item not restored!')
    CompareItemsEqual(jazil, item, restoredData.item, 'item')
  },

  'Complex item tree gets serialized/deserialized OK': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let itemF = BuildItem({ set:g_combined, name:'Sword', count:11, priorWork:1, cost:22, totalCost:90, enchants:[{ name:'Looting', level:2 }] })
    let itemL = BuildItem({ set:g_source, name:'Axe', count:22, nr:7, priorWork:2, cost:66, totalCost:9, enchants:[{ name:'Mending' }] })
    let itemLL = BuildItem({ set:g_desired, name:'Pumpkin', count:12, priorWork:0, cost:22, totalCost:12, enchants:[{ name:'Curse of Binding' }] })
    let itemLR = BuildItem({ set:g_combined, name:'Chestplate', count:22, priorWork:2, cost:7, totalCost:4, enchants:[{ name:'Protection', level:3 }, { name:'Thorns'}] })
    let itemR = BuildItem({ set:g_extra, name:'Book', count:33, priorWork:4, cost:1, totalCost:11 })

    itemL.targetItem = itemLL
    itemL.sacrificeItem = itemLR
    itemF.targetItem = itemL
    itemF.sacrificeItem = itemR

    let storedData = new RecipeFormData
    storedData.SetItem(itemF)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'ciBRKRDZfBOA_tDdrq7mNXx0aAdVmRH1MNEgapcehZnbaJRh')

    let loadingOptions = new DataStreamLoadingOptions()
    let restoreStream = new DataStream(false)
    restoreStream.Load(loadingOptions)

    let restoredData = new RecipeFormData
    restoredData.Deserialize(restoreStream)

    jazil.ShouldNotBe(restoredData.item, undefined, 'Item not restored!')
    CompareItemsEqual(jazil, itemF, restoredData.item, 'item')
  },

  'No bookmark data gives error': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('') // truncated data

    let loadingOptions = new DataStreamLoadingOptions()
    let restoreStream = new DataStream(false)
    restoreStream.Load(loadingOptions)

    let restoredData = new RecipeFormData
    let deserializedOK = restoredData.Deserialize(restoreStream)
    jazil.ShouldBe(deserializedOK, false, 'Could deserialize non-existing data!')
    jazil.ShouldBe(restoredData.item, undefined, 'Faulty item restored!')
  },

  'Truncated form data gives error when deserializing': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let sword = BuildItem({ set:g_source, name:'Sword', count:11, nr:9, priorWork:1, cost:22, totalCost:12, enchants:[{ name:'Looting' }] })

    let storedData = new RecipeFormData
    storedData.SetItem(sword)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'cixRKRsbrfBp')
    dataState.SetOnlyLocalStorage('cixRKRs') // we truncate after the s

    let loadingOptions = new DataStreamLoadingOptions()
    let restoreStream = new DataStream(false)
    restoreStream.Load(loadingOptions)

    let restoredData = new RecipeFormData
    let deserializedOK = restoredData.Deserialize(restoreStream)
    jazil.ShouldBe(deserializedOK, false, 'Could deserialize corrupt data!')
    jazil.ShouldBe(restoredData.item, undefined, 'Faulty item restored!')
  },

  'Malformed form data gives error when deserializing': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let sword = BuildItem({ set:g_combined, name:'Sword', count:11, priorWork:1, cost:9, totalCost:33 })
    GiveItemBrokenEnchant(sword)

    let storedData = new RecipeFormData
    storedData.SetItem(sword)

    let storeStream = new DataStream(true)
    storedData.Serialize(storeStream)
    storeStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), 'ciBRJJZhE4_') // malformed data

    let loadingOptions = new DataStreamLoadingOptions()
    let restoreStream = new DataStream(false)
    restoreStream.Load(loadingOptions)

    let restoredData = new RecipeFormData
    let deserializedOK = restoredData.Deserialize(restoreStream)
    jazil.ShouldBe(deserializedOK, false, 'Could deserialize corrupt data!')
    jazil.ShouldBe(restoredData.item, undefined, 'Faulty item restored!')
  },

  'Reset form state for upcoming tests': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()
  },

})
