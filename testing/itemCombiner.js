class FeedbackHandlerMock {
  constructor() {
    this.timeForFeedbackCalled = false
    this.tellProgressCalled = false
  }


  TimeForFeedback() {
    this.timeForFeedbackCalled = true
    return true
  }


  TellProgress(progress, maxProgress) {
    this.tellProgressCalled = true
  }
}


function TestCombineResult(jazil, sourceItems, canCombine, desiredItem, expectedItems) {
  let feedbackHandler = new FeedbackHandlerMock()
  let combiner = new ItemCombiner()
  let combinedItems = combiner.GetAllItemCombinations(sourceItems, desiredItem, feedbackHandler)

  jazil.ShouldBe(feedbackHandler.timeForFeedbackCalled, canCombine, 'TimeForFeedback not called properly!')
  jazil.ShouldBe(feedbackHandler.tellProgressCalled, canCombine, 'TellProgress not called properly!')

  TestItemListsMatch(jazil, expectedItems, 'expected', combinedItems, 'combined', g_combined)
}




jazil.AddTestSet(omeoPage, 'ItemCombiner', {
  'No sources => 0 combines': (jazil) => {
    let sourceItems = [
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, false, desiredItem, expectedItems)
  },

  'Too few unenchanted sources + matching desired => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe' }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Too few enchanted sources + matching desired => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }] }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking' }] })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Only loose wasteful unenchanted combines => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe' }),
      BuildItem({ tag:1, name:'Pickaxe' }),
      BuildItem({ tag:2, name:'Pickaxe' }),
      BuildItem({ tag:3, name:'Pickaxe' }),
      BuildItem({ tag:4, name:'Pickaxe' }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Only stacked wasteful unenchanted combines => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:10 }),
      BuildItem({ tag:1, name:'Pickaxe' }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Only loose wasteful enchanted combines => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Unbreaking', level:2 }]}),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two incompatible sources + desired => 0 combines': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe' }),
      BuildItem({ tag:1, name:'Sword' }),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Only stacked unenchanted sources + non-matching desired => 0 combines': (jazil) => {
    // reason: flat out irrelevant source get dropped before combining
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:4 }),
    ]
    let desiredItem = BuildItem({ name:'Sword', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, false, desiredItem, expectedItems)
  },

  'Only stacked enchanted sources + non-matching desired => 0 combines': (jazil) => {
    // reason: flat out irrelevant source get dropped before combining
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:4, enchants:[{ name:'Unbreaking' }]}),
    ]
    let desiredItem = BuildItem({ name:'Sword', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, false, desiredItem, expectedItems)
  },

  'Only loose enchanted sources + non-matching desired => no combines': (jazil) => {
    // reason: flat out irrelevant source get dropped before combining
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Sword', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:2, name:'Hoe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:3, name:'Shovel', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:4, name:'Axe', enchants:[{ name:'Unbreaking' }]}),
    ]
    let desiredItem = BuildItem({ name:'Helmet', set:g_desired })
    let expectedItems = [
    ]

    TestCombineResult(jazil, sourceItems, false, desiredItem, expectedItems)
  },

  'Two matching loose enchanted sources + unenchanted desired => higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1 = 1+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:2, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two matching stacked enchanted sources + unenchanted desired => higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
      // 2=0+0
      //   prior work: 0+0
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:1, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two matching loose enchanted sources + matching desired => higher-level enchant combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us with
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1 = 1+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:2, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two stacked enchanted sources + matching desired => higher-level enchant combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 1=0+0
      //   prior work: 0+0
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:1, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two stacked enchanted sources + semi-matching desired => still higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Mending' }]})
    let expectedItems = [
      // 1=0+0
      //   prior work: 0+0
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:1, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Lots of books combine in all possible ways': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe' }),
      BuildItem({ tag:1, name:'Book', count:4, enchants:[{ name:'Unbreaking' }]}),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:3 }]})
    let expectedItems = [
      // 2=1+0
      //   prior work: 0+0
      //   enchants 1+0: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ tag:2, name:'Pickaxe', count:1, cost:1, totalCost:1, priorWork:1, enchants:[{ name:'Unbreaking', level:1 }]}),
      // 3=1+1
      //   prior work: 0+0
      //   enchants 1+1: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ tag:3, name:'Book', count:2, cost:2, totalCost:2, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 4=2+1
      //   prior work: 1+0
      //   enchants 2+1: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ tag:4, name:'Pickaxe', count:1, cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 5=3+0
      //   prior work: 1+0
      //   enchants 0+3: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ tag:5, name:'Pickaxe', count:1, cost:3, totalCost:5, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 6=3+2 -- this wastes a book
      //   prior work: 1+1
      //   enchants 2+3: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ tag:6, name:'Pickaxe', count:1, cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 7=3+3
      //   prior work: 1+1
      //   enchants 3+3: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ tag:7, name:'Book', count:1, cost:5, totalCost:9, priorWork:2, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 8=4+3
      //   prior work: 3+1
      //   enchants 4+3: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ tag:8, name:'Pickaxe', count:1, cost:7, totalCost:13, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 9=5+3
      //   prior work: 3+1
      //   enchants 5+3: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ tag:9, name:'Pickaxe', count:1, cost:7, totalCost:14, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 10=6+3: won't work, since we wasted a book making 6
      // 10=7+0
      //   prior work: 3+0
      //   enchants 0+7: 3
      //     unbreaking lvl 3 * mult 1 (book)
      BuildItem({ tag:10, name:'Pickaxe', count:1, cost:6, totalCost:15, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Prior work is taken up in cost and result - stacked version => 1 combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 1=0+0
      //   prior work: 15+15
      //   enchants 0+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:1, name:'Pickaxe', cost:34, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Prior work is taken up in cost and result - loose version => 1 combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+15
      //   enchants 0+1 = 1+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:2, name:'Pickaxe', cost:19, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Merging enchants where order matters for cost => correct combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 1+0: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 0+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:2, name:'Pickaxe', cost:2, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Merging enchants where order matters for cost + one-sided prior work => correct combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 15+0
      //   enchants 1+0: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 0+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:2, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Conflicting enchants have their cost & order matters => 2 combines + spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Boots', enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Frost Walker' }, { name:'Unbreaking' }]}),
      // note: an implicit unenchanted boots is added for us
    ]
    let desiredItem = BuildItem({ name:'Boots', set:g_desired, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1: 2
      //     frost walker: dropped 1
      //     unbreaking lvl 1 & mult 1 (book)
      BuildItem({ tag:2, name:'Boots', cost:2, priorWork:1, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
      // 3=1+extra
      //   prior work: 0+0
      //   enchants extra+1: 3
      //     frost walker lvl 1 & mult 2 (book)
      //     unbreaking lvl 1 & mult 1 (book)
      BuildItem({ tag:3, name:'Boots', cost:3, priorWork:1, enchants:[{ name:'Frost Walker' }, { name:'Unbreaking' }]}),
      // 4=0+3
      //   prior work: 0+1
      //   prev steps: 3
      //   enchants 0+3: 3
      //     frost walker: dropped 1
      //     unbreaking lvl 1 & mult 2 (tool)
      BuildItem({ tag:4, name:'Boots', cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
      // 5=3+0
      //   prior work: 1+0
      //   prev steps: 3
      //   enchants 3+0: 5
      //     depth strider: dropped 1
      //     Feather Falling lvl 1 & mult 2 (tool)
      BuildItem({ tag:5, name:'Boots', cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Frost Walker' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Merging appropriate + inappropriate enchants => correct combine + extra spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Protection', level:3 }, { name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //     protection: ignored
      BuildItem({ tag:2, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 3=1+extra
      //   prior work: 0+0
      //   enchants extra+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //     protection: ignored
      BuildItem({ tag:3, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 4=0+3
      //   prior work: 0+1
      //   prev steps: 0+1
      //   enchants 0+3: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 3+0: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:4, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Incompatibly enchanted source item + compatibly enchanted source book => correct combine via added extra + extra spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:1 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ tag:2, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 3=1+extra
      //   prior work: 0+0
      //   enchants extra+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ tag:3, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 4=0+3
      //   prior work: 0+1
      //   prev steps: 0+1
      //   enchants 0+3: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 3+0: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:4, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine #1, order 1': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      BuildItem({ tag:1, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Looting', level:3 }]}),
      // note: an implicit unenchanted sword is added for us
    ]
    let desiredItem = BuildItem({ name:'Sword', set:g_desired, enchants:[{ name:'Sharpness', level:3 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1: 16
      //     sharpness lvl 4 * mult 1 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   enchants 1+0: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      BuildItem({ tag:2, name:'Sword', cost:16, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine #1, order 2': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Looting', level:3 }]}),
      BuildItem({ tag:1, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      // note: an implicit unenchanted sword is added for us
    ]
    let desiredItem = BuildItem({ name:'Sword', set:g_desired, enchants:[{ name:'Sharpness', level:3 }]})
    let expectedItems = [
      // 2=0+1
      //   prior work: 0+0
      //   enchants 0+1: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   enchants 1+0: 16
      //     sharpness lvl 4 * mult 1 (tool)
      //     looting lvl 3 * mult 4 (tool)
      BuildItem({ tag:2, name:'Sword', cost:16, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine with many permutations': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:2, name:'Book', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // 3=0+1
      //   prior work: 15+0
      //   enchants 1+0: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 0+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:3, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4=0+2
      //   prior work: 15+0
      //   enchants 0+2: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ tag:4, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 5=1+2
      //   prior work: 0+0
      //   enchants 1+2: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ tag:5, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 6=2+extra
      //   prior work: 0+0
      //   enchants extra+2: 1
      //     unbreaking lvl 1 * mult 1 (book)
      BuildItem({ tag:6, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 7=0+5
      //   prior work: 15+1
      //   prev steps: 0+1
      //   enchants 0+5: 4
      //     mending lvl 1 * mult 4 (tool)
      //   enchants 5+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:7, name:'Pickaxe', cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 8=0+6
      //   prior work: 15+1
      //   prev steps: 0+1
      //   enchants 0+6 = 6+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      BuildItem({ tag:8, name:'Pickaxe', cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 9=1+4
      //   prior work: 0+31
      //   prev steps: 0+17
      //   enchants 1+4: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 4+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:9, name:'Pickaxe', cost:35, totalCost:52, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 10=1+6
      //   prior work: 0+1
      //   prev steps: 0+1
      //   enchants 1+6: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   enchants 6+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:10, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 11=2+3
      //   prior work: 0+31
      //   prev steps: 0+17
      //   enchants 3+2: 2
      //     unbreaking lvl 2 * mult 1 (book)
      BuildItem({ tag:11, name:'Pickaxe', cost:33, totalCost:50, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 12=3+6
      //   prior work: 31+1
      //   prev steps: 17+1
      //   enchants 3+6: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 6+3: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:12, name:'Pickaxe', cost:36, totalCost:54, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 13=0+10
      //   prior work: 15+3
      //   prev steps: 0+4
      //   enchants 10+0: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 0+10: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:13, name:'Pickaxe', cost:22, totalCost:26, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 14=1+8
      //   prior work: 0+31
      //   prev steps: 0+21
      //   enchants 1+8: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   enchants 8+1: 4
      //     mending lvl 1 * mult 4 (tool)
      BuildItem({ tag:14, name:'Pickaxe', cost:35, totalCost:56, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

})
