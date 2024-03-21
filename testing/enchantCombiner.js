// passing combiners themselves is optional
function TestCombineResultEqual(jazil, combineResult1, combineResult2, combiner1, combiner2) {
  if (combiner1 !== undefined)
    jazil.ShouldBe(combiner1.isRelevant, combiner2.isRelevant, 'Combine result relevancy not equal!')
  jazil.ShouldBe(combineResult1.targetUsed, combineResult2.targetUsed, 'Target used not equal!')
  jazil.ShouldBe(combineResult1.sacrificeUsed, combineResult2.sacrificeUsed, 'Sacrifice used not equal!')
  jazil.ShouldBe(combineResult1.combinedLevel, combineResult2.combinedLevel, 'Resulting enchant level not equal!')
  jazil.ShouldBe(combineResult1.cost, combineResult2.cost, 'Resulting cost not equal!')
}




jazil.AddTestSet(omeoPage, 'EnchantCombiner', {
  'Same lvl 1 enchants combine': (jazil) => {
    let smite = BuildEnchant('Smite')

    let sword1 = BuildItem({ name:'Sword', enchants:[{ name:'Smite' }] })
    let sword2 = BuildItem({ name:'Sword', enchants:[{ name:'Smite' }] })

    let combiner = new EnchantCombiner(sword1, sword2, smite.info)
    let combineResult = combiner.Combine()

    jazil.ShouldBe(combiner.isRelevant, true, 'Combine result wasn\'t marked as relevant!')
    jazil.ShouldBe(combineResult.targetUsed, true, 'Target wasn\'t used!')
    jazil.ShouldBe(combineResult.sacrificeUsed, true, 'Sacrifice wasn\'t used!')
    jazil.ShouldBe(combineResult.combinedLevel, 2, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(combineResult.cost, 4, 'Resulting cost not correct!')
  },

  'Set doesn\'t matter': (jazil) => {
    let smite = BuildEnchant('Smite')

    let sword1 = BuildItem({ name:'Sword', set:g_source, enchants:[{ name:'Smite' }] })
    let sword2 = BuildItem({ name:'Sword', set:g_desired, enchants:[{ name:'Smite' }] })
    let sword3 = BuildItem({ name:'Sword', set:g_combined, enchants:[{ name:'Smite' }] })
    let sword4 = BuildItem({ name:'Sword', set:g_extra, enchants:[{ name:'Smite' }] })
    let swords = [sword1, sword2, sword3, sword4]

    let combines = []
    for (let sword1Nr = 0; sword1Nr < 3; ++sword1Nr)
      for (let sword2Nr = sword1Nr + 1; sword2Nr < 4; ++sword2Nr)
        combines.push(new EnchantCombiner(swords[sword1Nr], swords[sword2Nr], smite.info).Combine())

    jazil.ShouldBe(combines.length, 6, 'Wrong number of combines made!')
    let combineRef = combines[0]
    for (let combineNr = 1; combineNr < combines.length; ++combineNr) {
      let combineComp = combines[combineNr]
      TestCombineResultEqual(jazil, combineRef, combineComp)
    }
  },

  'Symmetric combines are equal': (jazil) => {
    let smite = BuildEnchant('Smite')

    let sword1 = BuildItem({ name:'Sword', set:g_source, enchants:[{ name:'Smite' }] })
    let sword2 = BuildItem({ name:'Sword', set:g_source, enchants:[{ name:'Smite' }] })

    let combiner1 = new EnchantCombiner(sword1, sword2, smite.info)
    let combiner2 = new EnchantCombiner(sword2, sword1, smite.info)

    TestCombineResultEqual(jazil, combiner1.Combine(), combiner2.Combine(), combiner1, combiner2)
  },

  'Asymmetric level combine have same resulting levels': (jazil) => {
    let tridentInfo = GetItemInfo('Trident')
    let bookInfo = GetItemInfo('Book')
    let impaling = BuildEnchant('Impaling')

    let trident1 = BuildItem({ name:'Trident', enchants:[{ name:'Impaling', level:1 }] })
    let trident2 = BuildItem({ name:'Trident', enchants:[{ name:'Impaling', level:2 }] })
    let book1 = BuildItem({ name:'Book', enchants:[{ name:'Impaling', level:1 }] })
    let book2 = BuildItem({ name:'Book', enchants:[{ name:'Impaling', level:2 }] })

    let combiner1 = new EnchantCombiner(trident1, book2, impaling.info)
    let combiner2 = new EnchantCombiner(trident2, book1, impaling.info)

    jazil.ShouldBe(combiner1.Combine().combinedLevel, 2, 'Resulting book-on-tool level not correct!')
    jazil.ShouldBe(combiner2.Combine().combinedLevel, 2, 'Resulting tool-on-book level not correct!')
  },

  'Order doesn\'t matter for cost wrt prior work': (jazil) => {
    let impaling = BuildEnchant('Impaling')

    let trident1 = BuildItem({ name:'Trident', priorWork:1, enchants:[{ name:'Impaling' }] })
    let trident2 = BuildItem({ name:'Trident', priorWork:2, enchants:[{ name:'Impaling' }] })
    let trident3 = BuildItem({ name:'Trident', priorWork:3, enchants:[{ name:'Impaling' }] })

    let combiner1 = new EnchantCombiner(trident1, trident2, impaling.info)
    let combiner2 = new EnchantCombiner(trident1, trident3, impaling.info)
    let combiner3 = new EnchantCombiner(trident2, trident3, impaling.info)

    jazil.ShouldBe(combiner1.Combine().cost, 8, 'Resulting 1-on-2 cost not correct!')
    jazil.ShouldBe(combiner2.Combine().cost, 8, 'Resulting 1-on-3 cost not correct!')
    jazil.ShouldBe(combiner3.Combine().cost, 8, 'Resulting 2-on-3 cost not correct!')
  },

  'Enchant level combines correctly': (jazil) => {
    let smite = BuildEnchant('Smite')

    let sword1a = BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:1 }] })
    let sword1b = BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:1 }] })
    let sword2a = BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:2 }] })
    let sword2b = BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:2 }] })
    let sword5a = BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:5 }] })
    let sword5b = BuildItem({ name:'Sword', enchants:[{ name:'Smite', level:5 }] })

    jazil.ShouldBe(new EnchantCombiner(sword1a, sword1b, smite.info).Combine().combinedLevel, 2, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(new EnchantCombiner(sword1a, sword2a, smite.info).Combine().combinedLevel, 2, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(new EnchantCombiner(sword2a, sword1a, smite.info).Combine().combinedLevel, 2, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(new EnchantCombiner(sword2a, sword2b, smite.info).Combine().combinedLevel, 3, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(new EnchantCombiner(sword2a, sword5a, smite.info).Combine().combinedLevel, 5, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(new EnchantCombiner(sword5a, sword2a, smite.info).Combine().combinedLevel, 5, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(new EnchantCombiner(sword5a, sword5b, smite.info).Combine().combinedLevel, 5, 'Resulting enchant passed max level!')
  },

  'Books vs. items have correct cost': (jazil) => {
    let impaling = BuildEnchant('Impaling')

    let trident1 = BuildItem({ name:'Trident', enchants:[{ name:'Impaling', level:1 }] })
    let trident2 = BuildItem({ name:'Trident', enchants:[{ name:'Impaling', level:2 }] })
    let book1 = BuildItem({ name:'Book', enchants:[{ name:'Impaling', level:1 }] })
    let book2 = BuildItem({ name:'Book', enchants:[{ name:'Impaling', level:2 }] })

    let combiner1 = new EnchantCombiner(trident1, book2, impaling.info)
    let combiner2 = new EnchantCombiner(book1, trident2, impaling.info)

    jazil.ShouldBe(combiner1.Combine().cost, 4, 'Resulting book-on-tool cost not correct!')
    jazil.ShouldBe(combiner2.Combine().cost, 8, 'Resulting tool-on-book cost not correct!')
  },

  'Different enchants don\'t combine': (jazil) => {
    let smite = BuildEnchant('Smite')

    let sword1 = BuildItem({ name:'Sword', enchants:[{ name:'Smite' }] })
    let sword2 = BuildItem({ name:'Sword', enchants:[{ name:'Sharpness' }] })

    let combiner = new EnchantCombiner(sword1, sword2, smite.info)
    let combineResult = combiner.Combine()

    jazil.ShouldBe(combiner.isRelevant, true, 'Combine result wasn\'t marked as relevant!')
    jazil.ShouldBe(combineResult.targetUsed, true, 'Target wasn\'t used!')
    jazil.ShouldBe(combineResult.sacrificeUsed, false, 'Sacrifice was used!')
    jazil.ShouldBe(combineResult.combinedLevel, 1, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(combineResult.cost, 0, 'Resulting cost not correct!')
  },

  'Target and sacrifice only sources marked correctly': (jazil) => {
    let smite = BuildEnchant('Smite')
    let sharpness = BuildEnchant('Sharpness')

    let sword1 = BuildItem({ name:'Sword', enchants:[{ name:'Smite' }] })
    let sword2 = BuildItem({ name:'Sword', enchants:[{ name:'Sharpness' }] })

    let combiner1 = new EnchantCombiner(sword1, sword2, smite.info)
    let combineResult1 = combiner1.Combine()
    let combiner2 = new EnchantCombiner(sword1, sword2, sharpness.info)
    let combineResult2 = combiner2.Combine()

    jazil.ShouldBe(combiner1.isRelevant, true, 'Combine result wasn\'t marked as relevant!')
    jazil.ShouldBe(combineResult1.targetUsed, true, 'Target wasn\'t used!')
    jazil.ShouldBe(combineResult1.sacrificeUsed, false, 'Sacrifice was used!')
    jazil.ShouldBe(combiner2.isRelevant, true, 'Combine result wasn\'t marked as relevant!')
    jazil.ShouldBe(combineResult2.targetUsed, false, 'Target was used!')
    jazil.ShouldBe(combineResult2.sacrificeUsed, true, 'Sacrifice wasn\'t used!')
  },

  'Irrelevant enchants get skipped': (jazil) => {
    let flame = BuildEnchant('Flame')

    let sword1 = BuildItem({ name:'Sword', enchants:[{ name:'Smite' }] })
    let sword2 = BuildItem({ name:'Sword', enchants:[{ name:'Sharpness' }] })

    let combiner = new EnchantCombiner(sword1, sword2, flame.info)
    let combineResult = combiner.Combine()

    jazil.ShouldBe(combiner.isRelevant, false, 'Combine result was marked as relevant!')
    jazil.ShouldBe(combineResult.targetUsed, false, 'Target was used!')
    jazil.ShouldBe(combineResult.sacrificeUsed, false, 'Sacrifice was used!')
    jazil.ShouldBe(combineResult.combinedLevel, 0, 'Resulting enchant of wrong level!')
    jazil.ShouldBe(combineResult.cost, 0, 'Resulting cost not correct!')
  },

})
