jazil.AddTestSet(mainPage, 'ItemInfo', {
  'All item types are counted': (jazil) => {
    jazil.ShouldBe(g_numDifferentItems(), g_itemInfos.length)
  },

  'Item bit count is reasonable': (jazil) => {
    jazil.ShouldBe(g_numItemIDBits(), 5, 'g_numItemIDBits')
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

  // We're not creating actual infos, since that would add them to all
  // system lists.  We're using 'Pickaxe' and 'Book' here since those
  // have enough interesting properties.

  'Pickaxe has correct details': (jazil) => {
    let pickaxeInfo = GetItemInfo('Pickaxe')

    jazil.ShouldBe(pickaxeInfo.id, 3, 'id')
    jazil.ShouldBe(pickaxeInfo.isBook, false, 'isBook')
    jazil.ShouldBe(pickaxeInfo.name, 'Pickaxe', 'name')
  },

  'Pickaxe has correct enchants': (jazil) => {
    let pickaxeInfo = GetItemInfo('Pickaxe')

    jazil.Assert(pickaxeInfo.CanHaveEnchant(g_enchantIDsByName.get('Fortune')), 'doesn\'t have Fortune enchant!')
    jazil.Assert(pickaxeInfo.CanHaveEnchant(g_enchantIDsByName.get('Silk Touch')), 'doesn\'t have Silk Touch enchant!')
    jazil.Assert(!pickaxeInfo.CanHaveEnchant(g_enchantIDsByName.get('Smite')), 'has Smite enchant!')
    jazil.Assert(!pickaxeInfo.CanHaveEnchant(g_enchantIDsByName.get('Channeling')), 'has Channeling enchant!')
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

})
