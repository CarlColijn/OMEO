function GetDesiredItemSection() {
  return new DesiredItemSection($('#desiredItemSection'))
}


function SetDesiredItem(itemSection, item) {
  itemSection.SetItem(item)
}


function GetDesiredItemSectionDetails(itemSectionElemJQ) {
  let typeElemJQ = itemSectionElemJQ.find('[name=itemID]')
  let typeID = typeElemJQ.val()
  typeID = typeID === undefined ? undefined : parseInt(typeID)
  let type = g_itemInfosByID.get(typeID).name

  let enchantNames = ''
  itemSectionElemJQ.find('[name=enchantID]').each((inputNr, inputElem) => {
    let inputElemJQ = $(inputElem)
    let rowElem = new DOMElement(inputElemJQ.parent().parent())
    if (rowElem.IsReal()) {
      let enchantID = parseInt(inputElemJQ.val())
      if (enchantNames != '')
        enchantNames += '/'
      enchantNames += g_enchantInfosByID.get(enchantID).name
    }
  })

  let enchantLevels = ''
  itemSectionElemJQ.find('.levelInput .selectedButton').each((inputNr, inputElem) => {
    let inputElemJQ = $(inputElem)
    let rowElem = new DOMElement(inputElemJQ.parent().parent())
    if (rowElem.IsReal()) {
      if (enchantLevels != '')
        enchantLevels += '/'
      enchantLevels += parseInt(inputElemJQ.val()) + 1
    }
  })

  return {
    'type': type,
    'enchantNames': enchantNames,
    'enchantLevels': enchantLevels
  }
}


function DesiredItemInSection(item) {
  let itemSectionElemJQ = $('#desiredItemSection')
  let details = GetDesiredItemSectionDetails(itemSectionElemJQ)
  return details.type == item.info.name
}




jazil.AddTestSet(mainPage, 'DesiredItemSection', {
  'Initial content is correct': (jazil) => {
    let itemSection = GetDesiredItemSection()

    let details = GetDesiredItemSectionDetails(itemSection.elemJQ)

    jazil.ShouldBe(details.type, 'Axe', 'name is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
  },

  'Plain item is set correctly': (jazil) => {
    let itemSection = GetDesiredItemSection()
    let item = BuildItem({ set:g_desired, name:'Pickaxe', count:9, priorWork:2, cost:15 })
    itemSection.SetItem(item)

    let details = GetDesiredItemSectionDetails(itemSection.elemJQ)

    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, '', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemInSection(item), true, 'added row is not present!')
  },

  'Enchanted item is set correctly': (jazil) => {
    let itemSection = GetDesiredItemSection()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_desired, name:'Turtle Shell', count:1, priorWork:4, cost:9, enchants:[{ name:'Unbreaking', level:3 }, { name:'Mending', level:1 }] })
    itemSection.SetItem(item)

    let details = GetDesiredItemSectionDetails(itemSection.elemJQ)

    jazil.ShouldBe(details.type, item.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, 'Mending/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/3', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemInSection(item), true, 'added row is not present!')
  },

  'Retrieve item': (jazil) => {
    let itemSection = GetDesiredItemSection()
    // Note: enchantments are re-ordered in alphabetical order
    let item = BuildItem({ set:g_desired, name:'Shears', count:2, priorWork:5, cost:3, enchants:[{ name:'Unbreaking', level:1 }, { name:'Efficiency', level:2 }] })
    itemSection.SetItem(item)

    let itemDetails = itemSection.GetItem()
    let retrievedItem = itemDetails.item
    let enchantNames = ''
    let enchantLevels = ''
    retrievedItem.enchantsByID.forEach((enchant) => {
      if (enchant !== undefined) {
        if (enchantNames != '') {
          enchantNames += '/'
          enchantLevels += '/'
        }
        enchantNames += enchant.info.name
        enchantLevels += enchant.level
      }
    })

    jazil.ShouldBe(itemDetails.withCountError, false, 'row says there were count errors!')
    jazil.ShouldBe(itemDetails.countErrorElemJQ, undefined, 'row reports a DOM element in error!')
    jazil.ShouldBe(retrievedItem.info.name, item.info.name, 'name is off!')
    jazil.ShouldBe(enchantNames, 'Efficiency/Unbreaking', 'enchant names are off!')
    jazil.ShouldBe(enchantLevels, '2/1', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemInSection(item), true, 'added row is not present!')
  },

  'Item can be changed': (jazil) => {
    let itemSection = GetDesiredItemSection()
    let item = BuildItem({ set:g_desired, name:'Hoe', count:2, priorWork:1, cost:7, enchants:[{ name:'Unbreaking', level:2 }, { name:'Fortune', level:3 }] })
    itemSection.SetItem(item)
    // Note: enchantments are re-ordered in alphabetical order
    let updatedItem = BuildItem({ set:g_desired, name:'Helmet', count:6, priorWork:4, cost:5, enchants:[{ name:'Blast Protection', level:4 }, { name:'Aqua Affinity', level:1 }] })
    itemSection.SetItem(updatedItem)

    let details = GetDesiredItemSectionDetails(itemSection.elemJQ)

    jazil.ShouldBe(details.type, updatedItem.info.name, 'type is off!')
    jazil.ShouldBe(details.enchantNames, 'Aqua Affinity/Blast Protection', 'enchant names are off!')
    jazil.ShouldBe(details.enchantLevels, '1/4', 'enchant levels are off!')
    jazil.ShouldBe(DesiredItemInSection(updatedItem), true, 'changed row is not present anymore!')
  },

})
