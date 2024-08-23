let jazilOptions = {
  'resultElementSpec': '#testResults',
  'iframeElementSpec': '#testPage',
  'passColor': '#c0ffc0',
  'failColor': '#ffd0d0',
  'textColor': '#ffffff',
  'showPassedTests': false
}
let jazil = new Jazillionth(jazilOptions)


let recipeURL = '../source/recipe.html?form=cixlcGSWZh'
let recipeAccessObjectNames = [
  'DataStream',
  'DataStreamLoadingOptions',
  'Enchant',
  'Item',
  'RecipeFormData',
  'RecipeTable',
  'g_combined',
  'g_dataSetsByID',
  'g_desired',
  'g_enchantIDsByName',
  'g_enchantInfos',
  'g_extra',
  'g_itemInfosByID',
  'g_source'
]
let recipeTrackObjectNames = [
]
let recipePage = jazil.AddPageToTest('Recipe', recipeURL, recipeAccessObjectNames, recipeTrackObjectNames)


let mainURL = '../source/index.html'
let mainAccessObjectNames = [
  'EnchantIDsConflict',
  'BitRestorer',
  'BitStorer',
  'CombineResultFilter',
  'DataStream',
  'DataStreamLoadingOptions',
  'Enchant',
  'EnchantCombiner',
  'EnchantRow',
  'Item',
  'ItemCollector',
  'ItemCombineList',
  'ItemCombiner',
  'ItemCombineTester',
  'ItemRow',
  'ItemTable',
  'MainFormData',
  'RehydrateItems',
  'ZeroOrigin',
  'g_combined',
  'g_dataSetsByID',
  'g_desired',
  'g_enchantIDsByName',
  'g_enchantInfos',
  'g_enchantInfosByID',
  'g_extra',
  'g_itemInfos',
  'g_itemInfosByID',
  'g_noCombines',
  'g_onlyImperfectCombines',
  'g_onlyPerfectCombines',
  'g_onlyPerfectWithExtrasCombines',
  'g_perfectAndPerfectWithExtrasCombines',
  'g_source'
]
let mainTrackObjectNames = [
  'g_numDifferentEnchants',
  'g_numEnchantIDBits',
  'g_numDifferentItems',
  'g_numItemIDBits'
]
let mainPage = jazil.AddPageToTest('Main', mainURL, mainAccessObjectNames, mainTrackObjectNames)




function GetItemInfo(name) {
  let foundInfo = undefined
  g_itemInfosByID.forEach((info) => {
    if (info.name == name)
      foundInfo = info
  })

  return foundInfo
}




// level is optional (default: 1)
function BuildEnchant(name, level) {
  let enchantID = g_enchantIDsByName.get(name)
  let info = g_enchantInfosByID.get(enchantID)
  return new Enchant(enchantID, level === undefined ? 1 : level)
}




// info should be a hasmap with:
// - tag (for testing)
// - name
// - count (default: 1)
// - cost (default: 0)
// - nr (for g_source only, no default)
// - totalCost (default: cost)
// - priorWork (default: 0)
// - set (default: g_source)
// - enchants: array of enchantInfo (default: [])
// enchantInfo should be a hashmap with:
// - name
// - level (default: 1)
function BuildItem(info) {
  let itemInfo = GetItemInfo(info.name)
  if (itemInfo === undefined)
    throw Error(`Unknown item name: ${info.name}`)

  let set = info.set ?? g_source
  let item = new Item(
    info.count ?? 1,
    set,
    itemInfo.id,
    info.priorWork ?? 0
  )
  item.tag = info.tag
  if (set === g_source)
    item.nr = info.nr
  item.cost = info.cost ?? 0
  item.totalCost = info.totalCost ?? item.cost

  let enchantInfos = info.enchants ?? []
  for (let enchantNr = 0; enchantNr < enchantInfos.length; ++enchantNr) {
    let enchantInfo = enchantInfos[enchantNr]
    let enchant = new Enchant(
      g_enchantIDsByName.get(enchantInfo.name),
      enchantInfo.level ?? 1
    )
    if (enchant.info === undefined)
      throw Error(`Unknown enchant name: ${enchantInfo.name}`)
    item.SetEnchant(enchant)
  }

  return item
}


function GiveItemBrokenEnchant(item) {
    // Note: we can't fake it using new EnchantInfo, since that will
    // also register the invalid data with g_enchantIDsByName and such.

    let brokenEnchantInfo = {
      id: 63,
      maxLevel: 3,
      bookMultiplier: 2,
      toolMultiplier: 4,
      name: 'Broken'
    }

    let brokenEnchant = {
      id: 63,
      level: 1,
      info: brokenEnchantInfo
    }

    item.enchantsByID.set(63, brokenEnchant)
}


function GetEnchantsDescription(enchantsByID) {
  let enchantsDescription = ''
  let hasEnchants = false
  g_enchantInfos.forEach((enchantInfo) => {
    let enchant = enchantsByID.get(enchantInfo.id)
    if (enchant !== undefined) {
      if (hasEnchants)
        enchantsDescription += ','
      enchantsDescription += `${enchant.level}-${enchantInfo.name}`
      hasEnchants = true
    }
  })

  if (hasEnchants)
    return enchantsDescription
  else
    return '-'
}


function GetOriginDescription(origin) {
  if (origin === undefined)
    return '-'

  let originDescription = ''
  origin.itemUses.forEach((itemUse, originNr) => {
    if (originNr > 0)
      originDescription += ','
    originDescription += itemUse
  })
  return originDescription
}


function GetAbbrItemDesciption(item) {
  if (item === undefined)
    return '<undefined>'
  else
    return `na:${item.info.name}|en:${GetEnchantsDescription(item.enchantsByID)}|se:${item.set.desc}|pw:${item.priorWork}|sc:${item.cost}|tc:${item.totalCost}|cn:${item.count}|or:${GetOriginDescription(item.origin)}`
}




function IndexItemsByHash(items) {
  let itemsByHash = new Map()

  for (let itemNr = 0; itemNr < items.length; ++itemNr) {
    let item = items[itemNr]
    let hash = item.HashAll()
    if (itemsByHash.has(hash))
      itemsByHash.get(hash).items.push(item)
    else
      itemsByHash.set(hash, { items: [item] })
  }

  return itemsByHash
}


function ItemTagOrNr(item) {
  if (item.tag !== undefined)
    return `^${item.tag}`
  else
    return `#${item.nr}`
}


function TestItemListsMatch(jazil, items1, item1Description, items2, item2Description, item2Set) {
  let items1ByHash = IndexItemsByHash(items1)
  let items2ByHash = IndexItemsByHash(items2)

  let hash1
  let hash2

  items1ByHash.forEach((items1, hash1) => {
    if (items2ByHash.has(hash1))
      jazil.ShouldBe(items1.length, items2ByHash.get(hash1).length, `unequal number of items found in ${item1Description} vs. ${item1Description}!`)
    else {
      let item1 = items1.items[0]
      jazil.Fail(`${ItemTagOrNr(item1)} - ${GetAbbrItemDesciption(item1)} : ${item1Description} item not found in ${item2Description}!`)
    }
  })

  items2ByHash.forEach((items2, hash2) => {
    if (items1ByHash.has(hash2))
      jazil.ShouldBe(items2.length, items1ByHash.get(hash2).length, `unequal number of items found in ${item2Description} vs. ${item1Description}!`)
    else {
      let item2 = items2.items[0]
      jazil.Fail(`${ItemTagOrNr(item2)} - ${GetAbbrItemDesciption(item2)} : ${item2Description} item not found in ${item1Description}!`)
    }
  })

  items2ByHash.forEach((items2, hash2) => {
    for (let item2Nr = 0; item2Nr < items2.length; ++item2Nr) {
      let item2 = items2[item2Nr]
      jazil.ShouldBe(item2.set, item2Set, `${item2Description} item with wrong set!`)
      jazil.ShouldBe(items2.length, items1ByHash.get(hash2).length, `unequal number of items found in ${item1Description} vs. ${item2Description}!`)
    }
  })
}




function GetSet(setLetter) {
  switch (setLetter) {
    case 's': return g_source
    case 'd': return g_desired
    case 'c': return g_combined
    case 'e': return g_extra
  }
}


function GetSetName(set) {
  switch (set) {
    case g_source: return 'Source'
    case g_desired: return 'Desired'
    case g_combined: return 'Combined'
    case g_extra: return 'Extra'
  }
}




class TemplateRowDetails {
  constructor() {
    this.row = undefined // ItemRow; to be filled in later
    this.ShowDetails = MakeCallbackFunctionMock()
  }
}


// returns TemplateRowDetails
function GetItemTemplateRow(testContainerID, set) {
  let templateRowElemJQ = $(`#${testContainerID} .template.item`)
  let details = new TemplateRowDetails()
  details.row = new ItemRow(details.ShowDetails, templateRowElemJQ, set, false)
  return details
}


function CreateItemRow(templateRowDetails, item, nr) {
  return templateRowDetails.row.CreateNew(nr ?? 1, item, false, undefined)
}




function GetGUITextForEnchantLevel(enchant) {
  let text = ['-','I','II','III','IV','V','VI','VII','VII','VIII','IX','X'][enchant.level]
  if (text === undefined)
    text = '!ERR!'
  return text
}


function GetEnchantLevelFromGUIText(guiText) {
  let level = {
    'I':    1,
    'II':   2,
    'III':  3,
    'IV':   4,
    'V':    5,
    'VI':   6,
    'VII':  7,
    'VIII': 8,
    'IX':   9,
    'X':    10
  }[guiText.toUpperCase()]
  if (level === undefined)
    level = '!ERR!'
  return level
}


function GetDescriptionForItemInTable(set, item) {
  let name = item.info.name
  if (set === g_combined) {
    if (item.set === g_source)
      name += ` (source nr. ${item.nr})`
    else if (item.set === g_extra)
      name += ` (extra)`
  }
  return name
}


function GetItemRowDetails(itemRowElemJQ, set) {
  let MakeNumberSafe = (numberElemJQ) => {
    let value = numberElemJQ.text()
    return value === '' ? undefined : parseInt(value)
  }

  let MakeTextSafe = (textElemJQ) => {
    let value = textElemJQ.text()
    return value === '' ? undefined : value
  }

  let nr = MakeNumberSafe(itemRowElemJQ.find('.nr'))
  let cost
  switch (set) {
    case g_source:
    case g_desired:
      cost = undefined
      break
    case g_combined:
      cost = MakeNumberSafe(itemRowElemJQ.find('.cost'))
      break
  }
  let count
  switch (set) {
    case g_source:
      let countElemJQ = itemRowElemJQ.find('[name=count]')
      count = parseInt(countElemJQ.val())
      break
    case g_desired:
      count = undefined
      break
    case g_combined:
      count = MakeNumberSafe(itemRowElemJQ.find('.count'))
      break
  }
  let type
  switch (set) {
    case g_source:
    case g_desired:
      let typeElemJQ = itemRowElemJQ.find('[name=itemID]')
      let typeID = typeElemJQ.val()
      typeID = typeID === undefined ? undefined : parseInt(typeID)
      type = g_itemInfosByID.get(typeID).name
      break
    case g_combined:
      type = MakeTextSafe(itemRowElemJQ.find('.type'))
      break
  }
  let priorWork
  switch (set) {
    case g_source:
      let priorWorkElemJQ = itemRowElemJQ.find('[name=priorWork]')
      priorWork = parseInt(priorWorkElemJQ.val())
      break
    case g_desired:
      priorWork = undefined
      break
    case g_combined:
      priorWork = MakeNumberSafe(itemRowElemJQ.find('.priorWork'))
      break
  }
  let enchantNames
  switch (set) {
    case g_source:
    case g_desired:
      enchantNames = ''
      itemRowElemJQ.find('[name=enchantID]').each((inputNr, inputElem) => {
        let inputElemJQ = $(inputElem)
        let rowElemJQ = inputElemJQ.parent().parent()
        if (rowElemJQ.attr('data-real') != 0) {
          let enchantID = parseInt(inputElemJQ.val())
          if (enchantNames != '')
            enchantNames += '/'
          enchantNames += g_enchantInfosByID.get(enchantID).name
        }
      })
      break
    case g_combined:
      enchantNames = ''
      itemRowElemJQ.find('.enchant .name').each((enchantNr, nameElem) => {
        let nameElemJQ = $(nameElem)
        let rowElemJQ = nameElemJQ.parent().parent()
        if (rowElemJQ.attr('data-real') != 0) {
          if (enchantNames != '')
            enchantNames += '/'
          enchantNames += MakeTextSafe(nameElemJQ)
        }
      })
      break
  }
  let enchantLevels
  switch (set) {
    case g_source:
    case g_desired:
      enchantLevels = ''
      itemRowElemJQ.find('[name=level]').each((inputNr, inputElem) => {
        let inputElemJQ = $(inputElem)
        let rowElemJQ = inputElemJQ.parent().parent()
        if (rowElemJQ.attr('data-real') != 0) {
          if (enchantLevels != '')
            enchantLevels += '/'
          enchantLevels += inputElemJQ.val()
        }
      })
      break
    case g_combined:
      enchantLevels = ''
      itemRowElemJQ.find('.enchant .level').each((enchantNr, levelElem) => {
        let levelElemJQ = $(levelElem)
        let rowElemJQ = levelElemJQ.parent().parent()
        if (rowElemJQ.attr('data-real') != 0) {
          if (enchantLevels != '')
            enchantLevels += '/'
          enchantLevels += GetEnchantLevelFromGUIText(MakeTextSafe(levelElemJQ))
        }
      })
      break
  }

  return {
    'nr': nr,
    'cost': cost,
    'count': count,
    'type': type,
    'priorWork': priorWork,
    'enchantNames': enchantNames,
    'enchantLevels': enchantLevels
  }
}


function ItemRowInTable(testContainerID, itemName, set) {
  let foundRow = false
  $(`#${testContainerID} tr.item`).each((rowNr, itemRowElem) => {
    let itemRowElemJQ = $(itemRowElem)
    let details = GetItemRowDetails(itemRowElemJQ, set)
    if (details.type == itemName) {
      foundRow = true
      return false
    }
    return true
  })

  return foundRow
}




function MakeCallbackFunctionMock() {
  let functor = () => {
    functor.called = true
  }
  functor.called = false
  return functor
}




class ItemTableDetails {
  constructor() {
    this.table = undefined // ItemTable; to be filled in later
    this.ShowDetails = MakeCallbackFunctionMock()
  }
}


// returns ItemTableDetails
function GetItemTable(testContainerID, set) {
  let tableElemJQ = $(`#${testContainerID}`)
  let details = new ItemTableDetails()
  details.tableElemJQ = tableElemJQ
  details.table = new ItemTable(details.ShowDetails, tableElemJQ, undefined, set)
  return details
}




class DataStateController {
  constructor(jazil) {
    this.jazil = jazil
    this.bookmarkElement = $(this.jazil.testDocument).find('#bookmark a')
  }


  GetLocalStorage() {
    return this.jazil.testWindow.localStorage.getItem('form')
  }


  GetBookmark() {
    return this.ExtractFromURL(this.bookmarkElement.attr('href'))
  }


  GetAddress() {
    return this.ExtractFromURL(this.jazil.testWindow.location.href)
  }


  Reset() {
    this.SetAll(undefined, undefined, undefined)
  }


  SetOnlyLocalStorage(localStorageData) {
    this.SetAll(localStorageData, undefined, undefined)
  }


  SetOnlyBookmark(bookmarkData) {
    this.SetAll(undefined, bookmarkData, undefined)
  }


  SetOnlyAddress(addressData) {
    this.SetAll(undefined, undefined, addressData)
  }


  SetAll(localStorageData, bookmarkData, addressData) {
    if (localStorageData === undefined)
      this.jazil.testWindow.localStorage.setItem('form', '')
    else
      this.jazil.testWindow.localStorage.setItem('form', localStorageData)

    if (bookmarkData === undefined)
      this.bookmarkElement.attr('href', '')
    else
      this.bookmarkElement.attr('href', this.GetURL(bookmarkData))

    if (addressData === undefined)
      this.jazil.testWindow.history.replaceState(null, '', this.GetURL())
    else
      this.jazil.testWindow.history.replaceState(null, '', this.GetURL(addressData))
  }


  GetURL(data) {
    let testLocation = this.jazil.testWindow.location
    let newQuery = data === undefined ? '' : `?form=${data}`
    return testLocation.href.replace(testLocation.search, '') + newQuery
  }


  ExtractFromURL(url) {
    let urlDataMatches = RegExp('[?&]form=([^&#]*)').exec(url)
    return urlDataMatches ? urlDataMatches[1] : ''
  }
}




jazil.AddTestSet(mainPage, 'own DataStateController', {
  'Only local storage is consistent': (jazil) => {
    let value = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage(value)

    jazil.ShouldBe(dataState.GetLocalStorage(), value, 'LocalStorage incorrect!')
    jazil.ShouldBe(dataState.GetBookmark(), '', 'Bookmark set!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address set!')
  },

  'Only bookmark is consistent': (jazil) => {
    let value = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyBookmark(value)

    jazil.ShouldBe(dataState.GetLocalStorage(), '', 'LocalStorage set!')
    jazil.ShouldBe(dataState.GetBookmark(), value, 'Bookmark incorrect!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address set!')
  },

  'Only address is consistent': (jazil) => {
    let value = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyAddress(value)

    jazil.ShouldBe(dataState.GetLocalStorage(), '', 'LocalStorage set!')
    jazil.ShouldBe(dataState.GetBookmark(), '', 'Bookmark set!')
    jazil.ShouldBe(dataState.GetAddress(), value, 'Address incorrect!')
  },

  'Set all is consistent': (jazil) => {
    let valueLocalStorage = `ls-${Math.random()}`
    let valueBookmark = `ls-${Math.random()}`
    let valueAddress = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetAll(valueLocalStorage, valueBookmark, valueAddress)

    jazil.ShouldBe(dataState.GetLocalStorage(), valueLocalStorage, 'LocalStorage incorrect!')
    jazil.ShouldBe(dataState.GetBookmark(), valueBookmark, 'Bookmark incorrect!')
    jazil.ShouldBe(dataState.GetAddress(), valueAddress, 'Address incorrect!')
  },

  'Reset after only local storage works': (jazil) => {
    let value = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage(value)
    dataState.Reset()

    jazil.ShouldBe(dataState.GetLocalStorage(), '', 'LocalStorage still set!')
    jazil.ShouldBe(dataState.GetBookmark(), '', 'Bookmark still set!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address still set!')
  },

  'Reset after only bookmark works': (jazil) => {
    let value = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyBookmark(value)
    dataState.Reset()

    jazil.ShouldBe(dataState.GetLocalStorage(), '', 'LocalStorage still set!')
    jazil.ShouldBe(dataState.GetBookmark(), '', 'Bookmark still set!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address still set!')
  },

  'Reset after only address works': (jazil) => {
    let value = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyAddress(value)
    dataState.Reset()

    jazil.ShouldBe(dataState.GetLocalStorage(), '', 'LocalStorage still set!')
    jazil.ShouldBe(dataState.GetBookmark(), '', 'Bookmark still set!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address still set!')
  },

  'Reset after set all works': (jazil) => {
    let valueLocalStorage = `ls-${Math.random()}`
    let valueBookmark = `ls-${Math.random()}`
    let valueAddress = `ls-${Math.random()}`
    let dataState = new DataStateController(jazil)
    dataState.SetAll(valueLocalStorage, valueBookmark, valueAddress)
    dataState.Reset()

    jazil.ShouldBe(dataState.GetLocalStorage(), '', 'LocalStorage still set!')
    jazil.ShouldBe(dataState.GetBookmark(), '', 'Bookmark still set!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address still set!')
  },
})


jazil.AddTestSet(mainPage, 'own BuildEnchant', {
  'BuildEnchant returns correct enchant with defaults': (jazil) => {
    let enchant = BuildEnchant('Flame')
    let enchantInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Flame'))

    jazil.ShouldBe(enchant.info, enchantInfo, 'info is wrong!')
    jazil.ShouldBe(enchant.level, 1, 'level is wrong!')
  },

  'BuildEnchant returns correct enchant': (jazil) => {
    let enchant = BuildEnchant('Fortune', 3)
    let enchantInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Fortune'))

    jazil.ShouldBe(enchant.info, enchantInfo, 'info is wrong!')
    jazil.ShouldBe(enchant.level, 3, 'level is wrong!')
  },
})


jazil.AddTestSet(mainPage, 'own GetItemInfo', {
  'GetItemInfo returns correct info': (jazil) => {
    let leggingsInfo = GetItemInfo('Leggings')
    let turtleShellInfo = GetItemInfo('Turtle Shell')

    jazil.ShouldBe(leggingsInfo.id, 14, 'leggings id is wrong!')
    jazil.ShouldBe(leggingsInfo.name, 'Leggings', 'leggings name is wrong!')
    jazil.ShouldBe(turtleShellInfo.id, 17, 'Turtle Shell id is wrong!')
    jazil.ShouldBe(turtleShellInfo.name, 'Turtle Shell', 'turtle Shell name is wrong!')
  },
})


jazil.AddTestSet(mainPage, 'own BuildItem', {
  'BuildItem returns correct item type for all items': (jazil) => {
    g_itemInfosByID.forEach((itemInfo) => {
      let item = BuildItem({ name:itemInfo.name })
      jazil.ShouldBe(item.info, itemInfo, `info for ${itemInfo.name} is wrong!`)
    })
  },

  'BuildItem returns correct item with defaults': (jazil) => {
    let leggings = BuildItem({ tag:'x', name:'Leggings', nr:3 })
    let leggingsInfo = GetItemInfo('Leggings')

    jazil.ShouldBe(leggings.info, leggingsInfo, 'info is wrong!')
    jazil.ShouldBe(leggings.tag, 'x', 'tag is wrong!')
    jazil.ShouldBe(leggings.nr, 3, 'nr is wrong!')
    jazil.ShouldBe(leggings.count, 1, 'default count is wrong!')
    jazil.ShouldBe(leggings.cost, 0, 'default cost is wrong!')
    jazil.ShouldBe(leggings.totalCost, 0, 'default totalCost is wrong!')
    jazil.ShouldBe(leggings.priorWork, 0, 'default priorWork is wrong!')
    jazil.ShouldBe(leggings.set, g_source, 'default set is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.size, 0, 'default enchants is wrong!')
  },

  'BuildItem returns correct item': (jazil) => {
    let leggings = BuildItem({ tag:'t', name:'Leggings', nr:4, count:5, cost:7, priorWork:9, set:g_extra })
    let leggingsInfo = GetItemInfo('Leggings')

    jazil.ShouldBe(leggings.info, leggingsInfo, 'info is wrong!')
    jazil.ShouldBe(leggings.tag, 't', 'tag is wrong!')
    jazil.ShouldBe(leggings.nr, undefined, 'nr is set!')
    jazil.ShouldBe(leggings.count, 5, 'count is wrong!')
    jazil.ShouldBe(leggings.cost, 7, 'cost is wrong!')
    jazil.ShouldBe(leggings.totalCost, 7, 'totalCost is wrong!')
    jazil.ShouldBe(leggings.priorWork, 9, 'priorWork is wrong!')
    jazil.ShouldBe(leggings.set, g_extra, 'set is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.size, 0, 'default enchants is wrong!')
  },

  'BuildItem returns correct item with enchants with defaults': (jazil) => {
    let leggings = BuildItem({ name:'Leggings', enchants:[{ name:'Protection', level:3 }, { name:'Unbreaking' }] })
    let leggingsInfo = GetItemInfo('Leggings')
    let protectionInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Protection'))
    let unbreakingInfo = g_enchantInfosByID.get(g_enchantIDsByName.get('Unbreaking'))

    jazil.ShouldBe(leggings.info, leggingsInfo, 'info is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.size, 2, 'number of enchants is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.get(protectionInfo.id).info, protectionInfo, 'protection info is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.get(protectionInfo.id).level, 3, 'protection level is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.get(unbreakingInfo.id).info, unbreakingInfo, 'unbreaking info is wrong!')
    jazil.ShouldBe(leggings.enchantsByID.get(unbreakingInfo.id).level, 1, 'unbreaking default level is wrong!')
  },
})
