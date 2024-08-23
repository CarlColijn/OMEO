jazil.AddTestSet(mainPage, 'ItemCombineTester', {

  // TargetIsRelevant

  'Identical items are relevant': (jazil) => {
    let pickaxe1 = BuildItem({ name:'Pickaxe' })
    let pickaxe2 = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.TargetIsRelevant(pickaxe1, pickaxe2),
      true
    )
  },

  'Different items are irrelevant': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe' })
    let sword = BuildItem({ name:'Sword' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.TargetIsRelevant(pickaxe, sword),
      false
    )
  },

  'Book-on-tool is relevant': (jazil) => {
    let book = BuildItem({ name:'Book' })
    let sword = BuildItem({ name:'Sword' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.TargetIsRelevant(book, sword),
      true
    )
  },

  'Book-on-book is relevant': (jazil) => {
    let book1 = BuildItem({ name:'Book' })
    let book2 = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.TargetIsRelevant(book1, book2),
      true
    )
  },

  'Tool-on-book is irrelevant': (jazil) => {
    let sword = BuildItem({ name:'Sword' })
    let book = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.TargetIsRelevant(sword, book),
      false
    )
  },

  // ItemsCompatible

  'Identical items are compatible': (jazil) => {
    let pickaxe1 = BuildItem({ name:'Pickaxe' })
    let pickaxe2 = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.ItemsCompatible(pickaxe1, pickaxe2),
      true
    )
  },

  'Different items are not compatible': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe' })
    let sword = BuildItem({ name:'Sword' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.ItemsCompatible(pickaxe, sword),
      false
    )
  },

  'Book-on-tool is compatible': (jazil) => {
    let sword = BuildItem({ name:'Sword' })
    let book = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.ItemsCompatible(sword, book),
      true
    )
  },

  'Book-on-book is compatible': (jazil) => {
    let book1 = BuildItem({ name:'Book' })
    let book2 = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.ItemsCompatible(book1, book2),
      true
    )
  },

  'Tool-on-book is not compatible': (jazil) => {
    let book = BuildItem({ name:'Book' })
    let sword = BuildItem({ name:'Sword' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.ItemsCompatible(book, sword),
      false
    )
  },

  // CombineIsWasteful

  'Tool-on-tool is not wasteful if both get used': (jazil) => {
    let pickaxe1 = BuildItem({ name:'Pickaxe' })
    let pickaxe2 = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe1, true, pickaxe2, true),
      false
    )
  },

  'Tool-on-tool is wasteful if sacrifice tool not used': (jazil) => {
    let pickaxe1 = BuildItem({ name:'Pickaxe' })
    let pickaxe2 = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe1, true, pickaxe2, false),
      true
    )
  },

  'Tool-on-tool is wasteful if target tool not used': (jazil) => {
    let pickaxe1 = BuildItem({ name:'Pickaxe' })
    let pickaxe2 = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe1, false, pickaxe2, true),
      true
    )
  },

  'Tool-on-tool is wasteful if both not used': (jazil) => {
    let pickaxe1 = BuildItem({ name:'Pickaxe' })
    let pickaxe2 = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe1, false, pickaxe2, false),
      true,
      'both tools not used is not wasteful!'
    )
  },

  'Book-on-tool is not wasteful if book is used': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe' })
    let book = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe, true, book, true),
      false
    )
  },

  'Book-on-tool is wasteful if book is not used': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe' })
    let book = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe, true, book, false),
      true
    )
  },

  'Book-on-tool is not wasteful if tool is not used': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe' })
    let book = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe, false, book, true),
      false
    )
  },

  'Book-on-tool is wasteful only if both not used': (jazil) => {
    let pickaxe = BuildItem({ name:'Pickaxe' })
    let book = BuildItem({ name:'Book' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.CombineIsWasteful(pickaxe, false, book, false),
      true
    )
  },

  // BareSourcePresent

  'Empty source list doesn\'t contain bare item': (jazil) => {
    let barePickaxe = BuildItem({ name:'Pickaxe' })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.BareSourcePresent([], barePickaxe),
      false
    )
  },

  'Source list without relevant tools doesn\'t contain bare item': (jazil) => {
    let barePickaxe = BuildItem({ name:'Pickaxe' })
    let bareBook = BuildItem({ name:'Book' })
    let enchantedBook = BuildItem({ name:'Book', enchants:[{ name:'Smite' }] })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.BareSourcePresent([bareBook, enchantedBook], barePickaxe),
      false
    )
  },

  'Source list with only enchanted relevant tools doesn\'t contain bare item': (jazil) => {
    let barePickaxe = BuildItem({ name:'Pickaxe' })
    let enchantedPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Mending' }] })
    let enchantedBook = BuildItem({ name:'Book', enchants:[{ name:'Smite' }] })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.BareSourcePresent([enchantedPickaxe, enchantedBook], barePickaxe),
      false
    )
  },

  'Source list with only prioWorked relevant tools doesn\'t contain bare item': (jazil) => {
    let barePickaxe = BuildItem({ name:'Pickaxe' })
    let priorWorkPickaxe = BuildItem({ name:'Pickaxe', priorWork:3 })
    let enchantedBook = BuildItem({ name:'Book', enchants:[{ name:'Smite' }] })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.BareSourcePresent([priorWorkPickaxe, enchantedBook], barePickaxe),
      false
    )
  },

  'Source list with only prioWorked + enchanted relevant tools doesn\'t contain bare item': (jazil) => {
    let barePickaxe = BuildItem({ name:'Pickaxe' })
    let enchantedPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Mending' }] })
    let priorWorkPickaxe = BuildItem({ name:'Pickaxe', priorWork:3 })
    let enchantedBook = BuildItem({ name:'Book', enchants:[{ name:'Smite' }] })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.BareSourcePresent([enchantedPickaxe, priorWorkPickaxe, enchantedBook], barePickaxe),
      false
    )
  },

  'Source list with bare relevant tool contains bare item': (jazil) => {
    let barePickaxe = BuildItem({ name:'Pickaxe' })
    let enchantedPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Mending' }] })

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.BareSourcePresent([enchantedPickaxe, barePickaxe], barePickaxe),
      true
    )
  },

  // EnchantConflictsForItem

  'Vanilla item doesn\'t conflict with enchant': (jazil) => {
    let vanillaPickaxe = BuildItem({ name:'Pickaxe' })
    let mending = g_enchantInfosByID.get(g_enchantIDsByName.get('Mending'))

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.EnchantConflictsForItem(mending, vanillaPickaxe),
      false
    )
  },

  'Enchanted item doesn\'t conflict with same enchant': (jazil) => {
    let mendingFirstPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Mending' }, { name:'Unbreaking' }] })
    let mendingLastPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Unbreaking' }, { name:'Mending' }] })
    let mending = g_enchantInfosByID.get(g_enchantIDsByName.get('Mending'))

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.EnchantConflictsForItem(mending, mendingFirstPickaxe),
      false,
      'mending first conflicts!'
    )
    jazil.ShouldBe(
      tester.EnchantConflictsForItem(mending, mendingLastPickaxe),
      false,
      'mending last conflicts!'
    )
  },

  'Enchanted item conflicts with incompatible enchant': (jazil) => {
    let mendingFirstPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Mending' }, { name:'Unbreaking' }] })
    let mendingLastPickaxe = BuildItem({ name:'Pickaxe', enchants:[{ name:'Unbreaking' }, { name:'Mending' }] })
    let infinity = g_enchantInfosByID.get(g_enchantIDsByName.get('Infinity'))

    let tester = new ItemCombineTester()
    jazil.ShouldBe(
      tester.EnchantConflictsForItem(infinity, mendingFirstPickaxe),
      true,
      'mending first doesn\'t conflict!'
    )
    jazil.ShouldBe(
      tester.EnchantConflictsForItem(infinity, mendingLastPickaxe),
      true,
      'mending last doesn\'t conflict!'
    )
  },

})
