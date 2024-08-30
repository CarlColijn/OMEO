function CheckItemFilterResultOK(id, jazil, desiredItem, sourceItems, combinedItems, expectedLevel, expectedTags, expectedHasSources) {
  let filter = new CombineResultFilter(desiredItem)
  let filterResult = filter.GetCleanedUpItemList(sourceItems, combinedItems)

  jazil.ShouldBe(filterResult.level.id, expectedLevel.id, 'wrong level returned!')

  jazil.ShouldBe(filterResult.items.length, expectedTags.length, 'wrong number of items returned!')
  jazil.ShouldBe(filterResult.hasSources, expectedHasSources, 'wrong hasSources returned!')

  expectedTags.forEach((expectedTag, itemNr) => {
    jazil.ShouldBe(filterResult.items[itemNr].tag, expectedTag, `wrong item ${itemNr} got returned (${expectedTag})!`)
  })
}


let g_expectedTotalCosts = [3, 4, 4]
let g_expectedPriorWork = [4, 3, 4]


class ItemCreatorForFilter {
  constructor(name, enchants) {
    this.name = name
    this.enchants = enchants

    this.nextTag = 1
  }

  GetDesired() {
    return BuildItem({ set:g_desired, tag:0, name:this.name, enchants:this.enchants })
  }

  // valid override options:
  // - name
  // - enchants
  // returns Item[3], where the created item is made with
  // mid, hight and low fitness variants
  GetCombineds(options) {
    let buildOptions = {}

    buildOptions.name =
      options?.name !== undefined ?
      options.name :
      this.name

    buildOptions.set = g_combined

    buildOptions.enchants =
      options?.enchants !== undefined ?
      options.enchants :
      this.enchants

    let items = []

    // mid fitness
    buildOptions.tag = this.nextTag++
    buildOptions.totalCost = g_expectedTotalCosts[0]
    buildOptions.priorWork = g_expectedPriorWork[0]
    items.push(BuildItem(buildOptions))
    // high fitness
    buildOptions.tag = this.nextTag++
    buildOptions.totalCost = g_expectedTotalCosts[1]
    buildOptions.priorWork = g_expectedPriorWork[1]
    items.push(BuildItem(buildOptions))
    // low fitness
    buildOptions.tag = this.nextTag++
    buildOptions.totalCost = g_expectedTotalCosts[2]
    buildOptions.priorWork = g_expectedPriorWork[2]
    items.push(BuildItem(buildOptions))

    return items
  }
}




jazil.AddTestSet(mainPage, 'CombineResultFilter helpers', {
  'Own creator returns correct plain desired item': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', undefined)
    let item = creator.GetDesired()

    jazil.ShouldBe(item.set, g_desired, 'wrong set returned!')
    jazil.ShouldBe(item.info.name, 'Pickaxe', 'wrong item returned!')
    jazil.ShouldBe(item.enchantsByID.size, 0, 'enchants returned!')
  },

  'Own creator returns correct enchanted desired item': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', [{ name:'Mending' }, { name:'Unbreaking', level:2 }])
    let item = creator.GetDesired()

    jazil.ShouldBe(item.set, g_desired, 'wrong set returned!')
    jazil.ShouldBe(item.info.name, 'Pickaxe', 'wrong item returned!')
    jazil.ShouldBe(item.enchantsByID.size, 2, 'wrong number of enchants returned!')
    jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Mending')).level, 1, 'mending at wrong level!')
    jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Unbreaking')).level, 2, 'unbreaking at wrong level!')
  },

  'Own creator returns correct defaulted plain combined item': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', undefined)
    let items = creator.GetCombineds()

    jazil.ShouldBe(items.length, 3, 'wrong number of items returned!')
    for (let itemNr = 0; itemNr < 3; ++itemNr) {
      let item = items[itemNr]
      jazil.ShouldBe(item.set, g_combined, `${itemNr}: wrong set returned!`)
      jazil.ShouldBe(item.info.name, 'Pickaxe', `${itemNr}: wrong item returned!`)
      jazil.ShouldBe(item.tag, itemNr + 1, `${itemNr}: wrong tag returned!`)
      jazil.ShouldBe(item.totalCost, g_expectedTotalCosts[itemNr], `${itemNr}: wrong totalCost returned!`)
      jazil.ShouldBe(item.priorWork, g_expectedPriorWork[itemNr], `${itemNr}: wrong priorWork returned!`)
      jazil.ShouldBe(item.enchantsByID.size, 0, `${itemNr}: enchants returned!`)
    }
  },

  'Own creator returns correct defaulted enchanted combined item': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', [{ name:'Mending' }, { name:'Unbreaking', level:2 }])
    let items = creator.GetCombineds()

    jazil.ShouldBe(items.length, 3, 'wrong number of items returned!')
    for (let itemNr = 0; itemNr < 3; ++itemNr) {
      let item = items[itemNr]
      jazil.ShouldBe(item.set, g_combined, `${itemNr}: wrong set returned!`)
      jazil.ShouldBe(item.info.name, 'Pickaxe', `${itemNr}: wrong item returned!`)
      jazil.ShouldBe(item.tag, itemNr + 1, `${itemNr}: wrong tag returned!`)
      jazil.ShouldBe(item.totalCost, g_expectedTotalCosts[itemNr], `${itemNr}: wrong totalCost returned!`)
      jazil.ShouldBe(item.priorWork, g_expectedPriorWork[itemNr], `${itemNr}: wrong priorWork returned!`)
      jazil.ShouldBe(item.enchantsByID.size, 2, `${itemNr}: wrong number of enchants returned!`)
      jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Mending')).level, 1, `${itemNr}: mending at wrong level!`)
      jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Unbreaking')).level, 2, `${itemNr}: unbreaking at wrong level!`)
    }
  },

  'Own creator returns correctly numbered defaulted combined items': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', undefined)
    let items1 = creator.GetCombineds()
    let items2 = creator.GetCombineds()
    let items3 = creator.GetCombineds()

    jazil.ShouldBe(items1[0].tag, 1, 'wrong 1st tag returned!')
    jazil.ShouldBe(items2[1].tag, 5, 'wrong 2nd tag returned!')
    jazil.ShouldBe(items3[2].tag, 9, 'wrong 3rd tag returned!')
  },

  'Own creator returns correctly name-tweaked combined item': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', [{ name:'Mending' }, { name:'Unbreaking', level:2 }])
    let item = creator.GetCombineds({ name:'Axe' })[0]

    jazil.ShouldBe(item.set, g_combined, 'wrong set returned!')
    jazil.ShouldBe(item.info.name, 'Axe', 'wrong item returned!')
    jazil.ShouldBe(item.tag, 1, 'wrong tag returned!')
    jazil.ShouldBe(item.totalCost, g_expectedTotalCosts[0], 'wrong totalCost returned!')
    jazil.ShouldBe(item.priorWork, g_expectedPriorWork[0], 'wrong priorWork returned!')
    jazil.ShouldBe(item.enchantsByID.size, 2, 'wrong number of enchants returned!')
    jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Mending')).level, 1, 'mending at wrong level!')
    jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Unbreaking')).level, 2, 'unbreaking at wrong level!')
  },

  'Own creator returns correctly enchanted-tweaked combined item': (jazil) => {
    let creator = new ItemCreatorForFilter('Pickaxe', [{ name:'Mending' }, { name:'Unbreaking', level:2 }])
    let item = creator.GetCombineds({ enchants:[{ name:'Fortune', level:3 }] })[0]

    jazil.ShouldBe(item.set, g_combined, 'wrong set returned!')
    jazil.ShouldBe(item.info.name, 'Pickaxe', 'wrong item returned!')
    jazil.ShouldBe(item.tag, 1, 'wrong tag returned!')
    jazil.ShouldBe(item.totalCost, g_expectedTotalCosts[0], 'wrong totalCost returned!')
    jazil.ShouldBe(item.priorWork, g_expectedPriorWork[0], 'wrong priorWork returned!')
    jazil.ShouldBe(item.enchantsByID.size, 1, 'wrong number of enchants returned!')
    jazil.ShouldBe(item.enchantsByID.get(g_enchantIDsByName.get('Fortune')).level, 3, 'fortune at wrong level!')
  },

})




jazil.AddTestSet(mainPage, 'CombineResultFilter', {
  'No items': (jazil) => {
    CheckItemFilterResultOK('No items',
      jazil,
      undefined,
      [],
      [],
      g_noCombines,
      [],
      false
    )
  },

  'Only non-matching plain items': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', undefined)

    CheckItemFilterResultOK('Only non-matching plain item',
      jazil,
      creator.GetDesired(),
      [],
      [
        // non-matching
        ...creator.GetCombineds({ name:'Axe' }),
        // non-matching
        ...creator.GetCombineds({ name:'Sword' }),
        // non-matching
        ...creator.GetCombineds({ name:'Book' }),
      ],
      g_noCombines,
      [],
      false
    )
  },

  'Only non-matching enchanted items': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', [{ name:'Unbreaking', level:3 }, { name:'Protection', level:2 }])

    CheckItemFilterResultOK('Only non-matching enchanted item',
      jazil,
      creator.GetDesired(),
      [],
      [
        // non-matching with other enchants
        ...creator.GetCombineds({ name:'Axe', enchants:[{ name:'Aqua Affinity' }] }),
        // non-matching with same enchants
        ...creator.GetCombineds({ name:'Sword' }),
        // non-matching with no enchants
        ...creator.GetCombineds({ name:'Book', enchants:[] }),
      ],
      g_noCombines,
      [],
      false
    )
  },

  'Minimal permutations of prior work and total cost': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', undefined)

    CheckItemFilterResultOK('Minimal permutations of prior work and total cost',
      jazil,
      BuildItem({ set:g_desired, tag:0, name:'Helmet' }),
      [],
      [
        BuildItem({ set:g_combined, tag:1,  name:'Helmet', priorWork:1, totalCost:22 }),
        BuildItem({ set:g_combined, tag:2,  name:'Helmet', priorWork:2, totalCost:21 }),
        BuildItem({ set:g_combined, tag:3,  name:'Helmet', priorWork:1, totalCost:21 }),
        BuildItem({ set:g_combined, tag:4,  name:'Helmet', priorWork:1, totalCost:23 }),
        BuildItem({ set:g_combined, tag:5,  name:'Helmet', priorWork:5, totalCost:2  }),
        BuildItem({ set:g_combined, tag:6,  name:'Helmet', priorWork:5, totalCost:1  }),
        BuildItem({ set:g_combined, tag:7,  name:'Helmet', priorWork:5, totalCost:3  }),
        BuildItem({ set:g_combined, tag:8,  name:'Helmet', priorWork:3, totalCost:12 }),
        BuildItem({ set:g_combined, tag:9,  name:'Helmet', priorWork:4, totalCost:11 }),
        BuildItem({ set:g_combined, tag:10, name:'Helmet', priorWork:3, totalCost:11 }),
        BuildItem({ set:g_combined, tag:11, name:'Helmet', priorWork:3, totalCost:13 }),
      ],
      g_onlyPerfectCombines,
      [3, 10, 6],
      false
    )
  },

  'Only perfect matching plain item': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', undefined)

    CheckItemFilterResultOK('Only perfect matching plain items',
      jazil,
      creator.GetDesired(),
      [],
      [
        // perfect
        ...creator.GetCombineds(),
        // non-matching
        ...creator.GetCombineds({ name:'Sword' }),
        // imperfect: not able to create these
        // perfect
        ...creator.GetCombineds(),
      ],
      g_onlyPerfectCombines,
      // 2nd+1st of 1st set
      [2,1],
      false
    )
  },

  'Only perfect matching enchanted items': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', [{ name:'Unbreaking', level:3 }, { name:'Protection', level:2 }])

    CheckItemFilterResultOK('Only perfect matching enchanted item',
      jazil,
      creator.GetDesired(),
      [],
      [
        // perfect
        ...creator.GetCombineds(),
        // non-matching, same enchants
        ...creator.GetCombineds({ name:'Chestplate' }),
        // perfect
        ...creator.GetCombineds(),
        // imperfect
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:1 }, { name:'Protection', level:2 }, { name:'Mending', level:1 }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Sword', enchants:[{ name:'Mending' }] }),
      ],
      g_onlyPerfectCombines,
      // 2nd+1st of 1st set
      [2,1],
      false
    )
  },

  'Only perfect+extra matching plain item': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', undefined)

    CheckItemFilterResultOK('Only perfect+extra matching cost/work diffing plain items',
      jazil,
      creator.GetDesired(),
      [],
      [
        // extra, mid fit @ 3
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*3*/ }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Chestplate' }),
        // extra, most fit @ 1
        ...creator.GetCombineds({ enchants:[{ name:'Protection', level:1 /*1*/ }] }),
        // imperfect: not able to create these
        // extra, least fit @ 4
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*3*/ }, { name:'Protection', level:1 /*1*/ }] }),
      ],
      g_onlyPerfectWithExtrasCombines,
      // 2nd+1st of 3rd set, 1st set, 4th set
      [8,7, 2,1, 11,10],
      false
    )
  },

  'Only perfect+extra matching enchanted item': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', [{ name:'Unbreaking', level:2 }, { name:'Protection', level:2 }])

    CheckItemFilterResultOK('Only perfect+extra matching enchanted item',
      jazil,
      creator.GetDesired(),
      [],
      [
        // extra, most fit @ 1
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:2 /*0*/ }, { name:'Protection', level:3 /*1*/ }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Chestplate' }),
        // extra, mid fit @ 2
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*1*/ }, { name:'Protection', level:3 /*1*/ }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Sword' }),
        // imperfect
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:1 }, { name:'Protection', level:2 }, { name:'Mending', level:1 }] }),
        // extra, least fit @ 3
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*1*/ }, { name:'Protection', level:3 /*0*/ }, { name:'Mending', level:1 /*1*/ }] }),
      ],
      g_onlyPerfectWithExtrasCombines,
      // 2nd+1st of 1st set, 3rd set, 6th set
      [2,1, 8,7, 17,16],
      false
    )
  },

  'Perfect and perfect+extra plain item': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', undefined)

    CheckItemFilterResultOK('Perfect and perfect+extra matching cost/work diffing plain items',
      jazil,
      creator.GetDesired(),
      [],
      [
        // extra, most fit @ 3
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:1 /*1*/ }, { name:'Protection', level:2 /*2*/ }] }),
        // perfect
        ...creator.GetCombineds({ name:'Helmet' }),
        // extra, mid fit @ 5
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*3*/ }, { name:'Protection', level:2 /*2*/ }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Sword' }),
        // imperfect: not able to create these
        // extra, least fit @ 6
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*3*/ }, { name:'Protection', level:2 /*2*/ }, { name:'Mending', level:1 /*1*/ }] }),
      ],
      g_perfectAndPerfectWithExtrasCombines,
      // 2nd+1st of 2nd set, 2nd+1st of 1st set, 3rd set, 5th set
      [5,4, 2,1, 8,7, 14,13],
      false
    )
  },

  'Perfect and perfect+extra matching enchanted item': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', [{ name:'Unbreaking', level:3 }, { name:'Protection', level:2 }])

    CheckItemFilterResultOK('Perfect and perfect+extra matching cost/work diffing enchanted items',
      jazil,
      creator.GetDesired(),
      [],
      [
        // extra, least fit @ 3
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*0*/ }, { name:'Protection', level:4 /*2*/ }, { name:'Mending', level:1 /*1*/ }] }),
        // perfect
        ...creator.GetCombineds({ name:'Helmet' }),
        // extra, most fit @ 1
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*0*/ }, { name:'Protection', level:3 /*1*/ }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Sword' }),
        // imperfect
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:1 }, { name:'Protection', level:2 }, { name:'Mending', level:1 }] }),
        // extra, mid fit @ 2
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*0*/ }, { name:'Protection', level:4 /*2*/ }] }),
      ],
      g_perfectAndPerfectWithExtrasCombines,
      // 2nd+1st of 2nd set, 2nd+1st of 3rd set, 6th set, 1st set
      [5,4, 8,7, 17,16, 2,1],
      false
    )
  },

  // 'Imperfect matching plain item': not able to create these

  'Imperfect matching enchanted item': (jazil) => {
    let creator = new ItemCreatorForFilter('Helmet', [{ name:'Unbreaking', level:3 }, { name:'Protection', level:2 }])

    CheckItemFilterResultOK('Imperfect matching cost/work diffing enchanted items',
      jazil,
      creator.GetDesired(),
      [],
      [
        // imperfect, mid fit @ 3
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:1 /*2*/ }, { name:'Protection', level:2 /*0*/ }, { name:'Mending', level:1 /*1*/ }] }),
        // imperfect, most fit @ 1
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:3 /*0*/ }, { name:'Protection', level:1 /*1*/ }] }),
        // non-matching
        ...creator.GetCombineds({ name:'Sword' }),
        // imperfect, least fit @ 4
        ...creator.GetCombineds({ enchants:[{ name:'Unbreaking', level:2 /*1*/ }, /* missing protection: 2 */ { name:'Mending', level:1 /*1*/ }] }),
      ],
      g_onlyImperfectCombines,
      // 2nd+1st of 2nd set, 1st set, 4th set
      [5,4, 2,1, 11,10],
      false
    )
  },

})
