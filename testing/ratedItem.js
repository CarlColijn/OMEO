jazil.AddTestSet(mainPage, 'RatedItem', {
  'Set items get preserved': (jazil) => {
    let item = BuildItem({ set:g_extra, name:'Chestplate' })
    let desiredItem = BuildItem({ set:g_desired, name:'Sword' })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.item, item, 'item is not preserved!')
  },

  'Source items get detected': (jazil) => {
    [g_source, g_combined, g_desired, g_extra].forEach((set) => {
      let item = BuildItem({ set:set, name:'Sword' })
      let desiredItem = BuildItem({ set:g_desired, name:'Sword' })

      let ratedItem = new RatedItem(item, desiredItem)

      jazil.ShouldBe(ratedItem.isSource, set === g_source, `isSource is invalid for ${set.desc}!`)
    })
  },

  'Lacking enchant match in levels is detected': (jazil) => {
    let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Unbreaking', level:1 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.enchantMatch, g_lesserMatch, 'enchantMatch is invalid!')
    jazil.ShouldBeBetween(ratedItem.enchantRating, 1e-9, 1e9, 'enchantRating is invalid!')
  },

  'Lacking enchant match in whole enchants is detected': (jazil) => {
    let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Protection', level:3 }] })
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.enchantMatch, g_lesserMatch, 'enchantMatch is invalid!')
    jazil.ShouldBeBetween(ratedItem.enchantRating, 1e-9, 1e9, 'enchantRating is invalid!')
  },

  'Exact enchant match is detected': (jazil) => {
    let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.enchantMatch, g_exactMatch, 'enchantMatch is invalid!')
    jazil.ShouldBe(ratedItem.enchantRating, 0.0, 'enchantRating is invalid!')
  },

  'Extra enchant match in levels is detected': (jazil) => {
    let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:4 }] })
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.enchantMatch, g_betterMatch, 'enchantMatch is invalid!')
    jazil.ShouldBeBetween(ratedItem.enchantRating, -1e9, -1e-9, 'enchantRating is invalid!')
  },

  'Extra enchant match in whole enchants is detected': (jazil) => {
    let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Protection', level:3 }] })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.enchantMatch, g_betterMatch, 'enchantMatch is invalid!')
    jazil.ShouldBeBetween(ratedItem.enchantRating, -1e9, -1e-9, 'enchantRating is invalid!')
  },

  'Mix of lacking + extra enchant match is detected': (jazil) => {
    let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Unbreaking', level:2 }, { name:'Aqua Affinity', level:1 }, { name:'Protection', level:3 }] })
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:3 }, { name:'Protection', level:3 }] })

    let ratedItem = new RatedItem(item, desiredItem)

    jazil.ShouldBe(ratedItem.enchantMatch, g_mixedMatch, 'enchantMatch is invalid!')
    jazil.ShouldBeBetween(ratedItem.enchantRating, -1e9, 1e9, 'enchantRating is invalid!')
  },

  'Enchant rating progresses correctly for extra enchants': (jazil) => {
    let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Protection', level:0 }] })
    let prevEnchantRating = 0
    for (let enchantLevel = 0; enchantLevel <= 5; ++enchantLevel) {
      let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Protection', level:enchantLevel }] })
      let ratedItem = new RatedItem(item, desiredItem)

      if (enchantLevel == 0)
        jazil.ShouldBe(ratedItem.enchantRating, 0, `enchantRating is invalid for enchant level ${enchantLevel}!`)
      else
        jazil.ShouldBeBetween(ratedItem.enchantRating, -1e9, prevEnchantRating, `enchantRating is invalid for enchant level ${enchantLevel}!`)
      prevEnchantRating = ratedItem.enchantRating
    }
  },

  'Enchant rating progresses correctly for lacking enchants': (jazil) => {
    let prevEnchantRating = 0
    for (let enchantLevel = 5; enchantLevel >= 0; --enchantLevel) {
      let item = BuildItem({ set:g_combined, name:'Helmet', enchants:[{ name:'Protection', level:enchantLevel }] })
      let desiredItem = BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Protection', level:5 }] })

      let ratedItem = new RatedItem(item, desiredItem)

      if (enchantLevel == 5)
        jazil.ShouldBe(ratedItem.enchantRating, 0, `enchantRating is invalid for enchant level ${enchantLevel}!`)
      else
        jazil.ShouldBeBetween(ratedItem.enchantRating, prevEnchantRating, 1e9, `enchantRating is invalid for enchant level ${enchantLevel}!`)
      prevEnchantRating = ratedItem.enchantRating
    }
  },

  'Prior work rating progresses correctly': (jazil) => {
    let prevPriorWorkRating = 0
    for (let priorWork = 0; priorWork <= 6; ++priorWork) {
      let item = BuildItem({ set:g_combined, name:'Helmet', priorWork:priorWork })
      let desiredItem = BuildItem({ set:g_desired, name:'Helmet', priorWork:priorWork })

      let ratedItem = new RatedItem(item, desiredItem)

      if (priorWork == 0)
        jazil.ShouldBe(ratedItem.priorWorkRating, 0, `priorWorkRating is invalid for prior work ${priorWork}!`)
      else
        jazil.ShouldBeBetween(ratedItem.priorWorkRating, prevPriorWorkRating, 1e9, `priorWorkRating is invalid for prior work ${priorWork}!`)
      prevPriorWorkRating = ratedItem.priorWorkRating
    }
  },

  'Total cost rating progresses correctly': (jazil) => {
    let prevTotalCostRating = 0
    for (let totalCost = 0; totalCost <= 100; totalCost += 10) {
      let item = BuildItem({ set:g_combined, name:'Helmet', totalCost:totalCost })
      let desiredItem = BuildItem({ set:g_desired, name:'Helmet', totalCost:totalCost })

      let ratedItem = new RatedItem(item, desiredItem)

      if (totalCost == 0)
        jazil.ShouldBe(ratedItem.totalCostRating, 0, `totalCostRating is invalid for total cost ${totalCost}!`)
      else
        jazil.ShouldBeBetween(ratedItem.totalCostRating, prevTotalCostRating, 1e9, `totalCostRating is invalid for total cost ${totalCost}!`)
      prevTotalCostRating = ratedItem.totalCostRating
    }
  },
})
