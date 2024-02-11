function TestCombineResult(jazil, sourceItems, desiredItem, expectedItems) {
  let combiner = new ItemCombiner()
  let combinedItems = combiner.GetAllItemCombinations(sourceItems, desiredItem)
  TestItemListsMatch(jazil, expectedItems, 'expected', combinedItems, 'combined', g_combined)
}




jazil.AddTestSet(omeoPage, 'ItemCombiner', {
  'No sources => 0 combines': (jazil) => {
    let sourceItems = [
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1})
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Too few unenchanted sources + matching desired => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0 }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Too few enchanted sources + matching desired => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Unbreaking' }] }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking' }] })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Only loose wasteful unenchanted combines => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0 }),
      BuildItem({ name:'Pickaxe', nr:1 }),
      BuildItem({ name:'Pickaxe', nr:2 }),
      BuildItem({ name:'Pickaxe', nr:3 }),
      BuildItem({ name:'Pickaxe', nr:4 }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Only stacked wasteful unenchanted combines => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:10 }),
      BuildItem({ name:'Pickaxe', nr:1 }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Only loose wasteful enchanted combines => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Two incompatible sources + desired => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0 }),
      BuildItem({ name:'Sword', nr:1 }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Only stacked unenchanted sources + non-matching desired => 0 combines': (jazil) => {
    // reason: flat out irrelevant source get dropped before combining
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:4 }),
    ]
    let desiredItem = BuildItem({ name:'Sword', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Only stacked enchanted sources + non-matching desired => 0 combines': (jazil) => {
    // reason: flat out irrelevant source get dropped before combining
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:4, enchants:[{ name:'Unbreaking' }]}),
    ]
    let desiredItem = BuildItem({ name:'Sword', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Only loose enchanted sources + non-matching desired => no combines': (jazil) => {
    // reason: flat out irrelevant source get dropped before combining
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Sword', nr:1, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Hoe', nr:2, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Shovel', nr:3, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Axe', nr:4, enchants:[{ name:'Unbreaking' }]}),
    ]
    let desiredItem = BuildItem({ name:'Helmet', nr:-1 })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Two matching loose enchanted sources + unenchanted desired => higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1 })
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1 = 1+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:3, cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Two matching stacked enchanted sources + unenchanted desired => higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 1
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1 })
    let expectedItems = [
      // 2=0+0
      //   prior work: 0+0
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:1, cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Two matching loose enchanted sources + matching desired => higher-level enchant combine': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1 = 1+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:3, cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Two stacked enchanted sources + matching desired => higher-level enchant combine': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 1
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2=0+0
      //   prior work: 0+0
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:2, cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Two stacked enchanted sources + semi-matching desired => still higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 1
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Mending' }]})
    let expectedItems = [
      // 2=0+0
      //   prior work: 0+0
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:2, cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Lots of books combine in all possible ways': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0 }),
      BuildItem({ name:'Book', nr:1, count:4, enchants:[{ name:'Unbreaking' }]}),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:3 }]})
    let expectedItems = [
      // 2=1+0
      //   prior work: 0+0
      //   enchants 1+0: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:2, count:1, cost:1, totalCost:1, priorWork:1, enchants:[{ name:'Unbreaking', level:1 }]}),
      // 3=1+1
      //   prior work: 0+0
      //   enchants 1+1: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ name:'Book', nr:3, count:2, cost:2, totalCost:2, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 4=2+1
      //   prior work: 1+0
      //   enchants 2+1: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:4, count:1, cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 5=3+0
      //   prior work: 1+0
      //   enchants 0+3: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:5, count:1, cost:3, totalCost:5, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 6=3+2 -- this wastes a book
      //   prior work: 1+1
      //   enchants 2+3: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:6, count:1, cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 7=3+3
      //   prior work: 1+1
      //   enchants 3+3: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ name:'Book', nr:7, count:1, cost:5, totalCost:9, priorWork:2, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 8=4+3
      //   prior work: 3+1
      //   enchants 4+3: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:8, count:1, cost:7, totalCost:13, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 9=5+3
      //   prior work: 3+1
      //   enchants 5+3: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:9, count:1, cost:7, totalCost:14, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 10=6+3: won't work, since we wasted a book making 6
      // 10=7+0
      //   prior work: 3+0
      //   enchants 0+7: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:10, count:1, cost:6, totalCost:15, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Prior work is taken up in cost and result - stacked version => 1 combine': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, count:2, priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 1
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2=0+0
      //   prior work: 15+15
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:2, cost:34, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Prior work is taken up in cost and result - loose version => 1 combine': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, priorWork:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+15
      //   enchants 0+1 = 1+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:3, cost:19, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Merging enchants where order matters for cost => correct combine': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, enchants:[{ name:'Mending' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 1+0: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 0+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:3, cost:2, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Merging enchants where order matters for cost + one-sided prior work => correct combine': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, enchants:[{ name:'Mending' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 15+0
      //   enchants 1+0: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 0+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:3, cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Conflicting enchants have their cost & order matters => 2 combines + spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Boots', nr:0, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }]}),
      BuildItem({ name:'Book', nr:1, enchants:[{ name:'Frost Walker' }, { name:'Unbreaking' }]}),
      // note: an implicit unenchanted boots is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Boots', nr:-1, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1: 2
      //     frost walker: dropped 1
      //     unbreaking lvl 1 & mult 1 (book)
      BuildItem({ name:'Boots', nr:3, cost:2, priorWork:1, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
      // 4=1+2
      //   prior work: 0+0
      //   enchants 2+1: 3
      //     frost walker lvl 1 & mult 2 (book)
      //     unbreaking lvl 1 & mult 1 (book)
      BuildItem({ name:'Boots', nr:4, cost:3, priorWork:1, enchants:[{ name:'Frost Walker' }, { name:'Unbreaking' }]}),
      // 5=0+4
      //   prior work: 0+1
      //   prev steps: 3
      //   enchants 0+4: 3
      //     frost walker: dropped 1
      //     unbreaking lvl 1 & mult 2 (tool)
      BuildItem({ name:'Boots', nr:5, cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
      // 6=4+0
      //   prior work: 1+0
      //   prev steps: 3
      //   enchants 4+0: 5
      //     depth strider: dropped 1
      //     Feather Falling lvl 1 & mult 2 (tool)
      BuildItem({ name:'Boots', nr:6, cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Frost Walker' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Merging appropriate + inappropriate enchants => correct combine + extra spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Mending' }]}),
      BuildItem({ name:'Book', nr:1, enchants:[{ name:'Protection', level:3 }, { name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //     protection: ignored
      BuildItem({ name:'Pickaxe', nr:3, cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4=1+2
      //   prior work: 0+0
      //   enchants 2+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //     protection: ignored
      BuildItem({ name:'Pickaxe', nr:4, cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 5=0+4
      //   prior work: 0+1
      //   prev steps: 0+1
      //   enchants 0+4: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 4+0: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:5, cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Incompatibly enchanted source item + compatibly enchanted source book => correct combine via added extra + extra spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, enchants:[{ name:'Mending' }]}),
      BuildItem({ name:'Book', nr:1, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:1 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:3, cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4=1+2
      //   prior work: 0+0
      //   enchants 2+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:4, cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 5=0+4
      //   prior work: 0+1
      //   prev steps: 0+1
      //   enchants 0+4: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 4+0: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:5, cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Complex combine #1, order 1': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Sword', nr:0, enchants:[{ name:'Sharpness', level:3 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      BuildItem({ name:'Sword', nr:1, enchants:[{ name:'Sharpness', level:3 }, { name:'Looting', level:3 }]}),
      // note: an implicit unenchanted sword is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Sword', nr:-1, enchants:[{ name:'Sharpness', level:3 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1: 16
      //     sharpness lvl 4 * mult 1 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   enchants 1+0: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      BuildItem({ name:'Sword', nr:3, cost:16, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Complex combine #1, order 2': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Sword', nr:0, enchants:[{ name:'Sharpness', level:3 }, { name:'Looting', level:3 }]}),
      BuildItem({ name:'Sword', nr:1, enchants:[{ name:'Sharpness', level:3 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      // note: an implicit unenchanted sword is added for us with nr 2
    ]
    let desiredItem = BuildItem({ name:'Sword', nr:-1, enchants:[{ name:'Sharpness', level:3 }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 0+0
      //   enchants 0+1: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   enchants 1+0: 16
      //     sharpness lvl 4 * mult 1 (tool)
      //     looting lvl 3 * mult 4 (tool)
      BuildItem({ name:'Sword', nr:3, cost:16, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

  'Complex combine with many permutations': (jazil) => {
    let sourceItems = [
      BuildItem({ name:'Pickaxe', nr:0, priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ name:'Pickaxe', nr:1, enchants:[{ name:'Mending' }]}),
      BuildItem({ name:'Book', nr:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with nr 3
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', nr:-1, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // 4=0+1
      //   prior work: 15+0
      //   enchants 1+0: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 0+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:4, cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 5=0+2
      //   prior work: 15+0
      //   enchants 0+2: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:5, cost:17, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 6=1+2
      //   prior work: 0+0
      //   enchants 1+2: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:6, cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 7=2+3
      //   prior work: 0+0
      //   enchants 3+2: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:7, cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 8=0+6
      //   prior work: 15+1
      //   prev steps: 0+1
      //   enchants 0+6: 4
      //     mending lvl 1 * mult 4 (tool)
      //   enchants 6+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:8, cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 9=0+7
      //   prior work: 15+1
      //   prev steps: 0+1
      //   enchants 0+7 = 7+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ name:'Pickaxe', nr:9, cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 10=1+5
      //   prior work: 0+31
      //   prev steps: 0+17
      //   enchants 1+5: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 5+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:10, cost:35, totalCost:52, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 11=1+7
      //   prior work: 0+1
      //   prev steps: 0+1
      //   enchants 1+7: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 7+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:11, cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 12=2+4
      //   prior work: 0+31
      //   prev steps: 0+17
      //   enchants 4+2: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ name:'Pickaxe', nr:12, cost:33, totalCost:50, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 13=4+7
      //   prior work: 31+1
      //   prev steps: 17+1
      //   enchants 4+7: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 7+4: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:13, cost:36, totalCost:54, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 14=0+11
      //   prior work: 15+3
      //   prev steps: 0+4
      //   enchants 11+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 0+11: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:14, cost:22, totalCost:26, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 15=1+9
      //   prior work: 0+31
      //   prev steps: 0+21
      //   enchants 1+9: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 9+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ name:'Pickaxe', nr:15, cost:35, totalCost:56, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, desiredItem, expectedItems)
  },

})
