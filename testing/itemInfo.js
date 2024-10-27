function EnchantNameSetsListToIDSetsList(nameSetsList) {
  return nameSetsList.map((nameSets) => {
    return nameSets.map((nameSet) => {
      return new Set(nameSet.map((name) => {
        return g_enchantIDsByName.get(name)
      }))
    })
  })
}


jazil.AddTestSet(mainPage, 'ItemInfo', {
  'All item types are counted': (jazil) => {
    jazil.ShouldBe(g_numDifferentItems(), g_itemInfos.length)
  },

  'Item bit count is reasonable': (jazil) => {
    jazil.ShouldBe(g_numItemIDBits(), 5)
  },

  'Book info ID is known': (jazil) => {
    jazil.ShouldBe(g_bookID, 0, 'Book\'s ID is off!')
  },

  'Infos by ID line up': (jazil) => {
    let numInfos = 0
    g_itemInfosByID.forEach((info, id) => {
      ++numInfos
      jazil.ShouldBe(info.id, id, 'g_itemInfosByID id->info mismatch!')
    })
    jazil.ShouldBe(numInfos, g_itemInfos.length, 'g_itemInfosByID size mismatch!')
  },

  'Helper GetItemInfo works': (jazil) => {
    let info = GetItemInfo('Book')
    jazil.ShouldBe(info.id, 0, 'Book\'s id is wrong!')
    info = GetItemInfo('Bow')
    jazil.ShouldBe(info.id, 9, 'Bow\'s id is wrong!')
    info = GetItemInfo('Shield')
    jazil.ShouldBe(info.id, 18, 'Shield\'s id is wrong!')
    info = GetItemInfo('XYZ')
    jazil.ShouldBe(info, undefined, 'got an info for XYZ!')
  },

  'Pickaxe has correct details': (jazil) => {
    let pickaxeInfo = GetItemInfo('Pickaxe')

    jazil.ShouldBe(pickaxeInfo.id, 3, 'id')
    jazil.ShouldBe(pickaxeInfo.isBook, false, 'isBook')
    jazil.ShouldBe(pickaxeInfo.name, 'Pickaxe', 'name')
  },

  'Pickaxe has correct enchants': (jazil) => {
    let pickaxeInfo = GetItemInfo('Pickaxe')

    let allowedEnchantNames = new Set(['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking'])
    let enchantDetails = g_enchantInfos.map((info) => {
      return {
        info: info,
        allowed: allowedEnchantNames.has(info.name)
      }
    })

    enchantDetails.forEach((detail) => {
      jazil.ShouldBe(pickaxeInfo.CanHaveEnchant(detail.info.id), detail.allowed, `${detail.info.name}'s allowed state is off!`)
    })
  },

  'Book has correct details': (jazil) => {
    let bookInfo = GetItemInfo('Book')

    jazil.ShouldBe(bookInfo.id, 0, 'id')
    jazil.ShouldBe(bookInfo.isBook, true, 'isBook')
    jazil.ShouldBe(bookInfo.name, 'Book', 'name')
  },

  'Book can have all enchants': (jazil) => {
    let bookInfo = GetItemInfo('Book')

    g_enchantInfosByID.forEach((info, id) => {
      jazil.Assert(bookInfo.CanHaveEnchant(id), `doesn't have ${info.name} enchant!`)
    })
  },

  'Book has all conflict enchant ID sets': (jazil) => {
    let bookInfo = GetItemInfo('Book')

    TestConflictingSetsListsMatch(jazil, bookInfo.conflictingEnchantIDSetsList, g_conflictingEnchantIDSetsList)
  },

  'Book\'s non-conflicting enchant IDs match up': (jazil) => {
    let bookInfo = GetItemInfo('Book')

    let conflictingIDs = new Set()
    bookInfo.conflictingEnchantIDSetsList.forEach((idSets) => {
      idSets.forEach((idSet) => {
        idSet.forEach((id) => {
          conflictingIDs.add(id)
        })
      })
    })

    jazil.ShouldBe(bookInfo.nonConflictingEnchantIDs.size, g_enchantInfosByID.size - conflictingIDs.size, 'number of non-conflicting enchants is off!')
    g_enchantInfosByID.forEach((info, id) => {
      if (!conflictingIDs.has(id))
        jazil.Assert(bookInfo.nonConflictingEnchantIDs.has(id), `${info.name} not marked as non-conflicting!`)
    })
  },

  'Pickaxe\'s non-conflicting enchant IDs match up': (jazil) => {
    let pickaxeInfo = GetItemInfo('Pickaxe')

    let conflictingIDs = new Set()
    pickaxeInfo.conflictingEnchantIDSetsList.forEach((idSets) => {
      idSets.forEach((idSet) => {
        idSet.forEach((id) => {
          conflictingIDs.add(id)
        })
      })
    })

    jazil.ShouldBe(pickaxeInfo.nonConflictingEnchantIDs.size, pickaxeInfo.allowedEnchantIDs.size - conflictingIDs.size, 'number of non-conflicting enchants is off!')
    pickaxeInfo.allowedEnchantIDs.forEach((id) => {
      if (!conflictingIDs.has(id)) {
        let info = g_enchantInfosByID.get(id)
        jazil.Assert(pickaxeInfo.nonConflictingEnchantIDs.has(id), `${info.name} not marked as non-conflicting!`)
      }
    })
  },

  'Trident has the correct conflict enchant ID sets': (jazil) => {
    let tridentInfo = GetItemInfo('Trident')
    let expectedIDSetsList = EnchantNameSetsListToIDSetsList([
      //[['Infinity'], ['Mending']] => skipped because only Mending is allowed
      [['Riptide'], ['Loyalty', 'Channeling']]
    ])

    TestConflictingSetsListsMatch(jazil, tridentInfo.conflictingEnchantIDSetsList, expectedIDSetsList)
  },

  'Sword has the correct conflict enchant ID sets': (jazil) => {
    let swordInfo = GetItemInfo('Sword')
    let expectedIDSetsList = EnchantNameSetsListToIDSetsList([
      [['Sharpness'], ['Smite'], ['Bane of Arthropods']]
      //[['Infinity'], ['Mending']] => skipped because only Mending is allowed
    ])

    TestConflictingSetsListsMatch(jazil, swordInfo.conflictingEnchantIDSetsList, expectedIDSetsList)
  },

  'Boots has the correct conflict enchant ID sets': (jazil) => {
    let bootsInfo = GetItemInfo('Boots')
    let expectedIDSetsList = EnchantNameSetsListToIDSetsList([
      [['Protection'], ['Blast Protection'], ['Fire Protection'], ['Projectile Protection']],
      [['Depth Strider'], ['Frost Walker']]
      //[['Infinity'], ['Mending']] => skipped because only Mending is allowed
    ])

    TestConflictingSetsListsMatch(jazil, bootsInfo.conflictingEnchantIDSetsList, expectedIDSetsList)
  },

})
