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
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
      // 3 = 1+0 = 0+1
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 4
      BuildItem({ tag:3, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two matching stacked enchanted sources + unenchanted desired => higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:1, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired })
    let expectedItems = [
      // 2 = 0+0
      //   origin uses: 2
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 4
      BuildItem({ tag:2, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two matching loose enchanted sources + matching desired => higher-level enchant combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3 = 1+0 = 0+1
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 4
      BuildItem({ tag:3, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two stacked enchanted sources + matching desired => higher-level enchant combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:1, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2 = 0+0
      //   origin uses: 2
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 4
      BuildItem({ tag:2, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Two stacked enchanted sources + semi-matching desired => still higher-level enchant combine': (jazil) => {
    // reason: we just try combining everything remotely relevant
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:1, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Mending' }]})
    let expectedItems = [
      // 2 = 0+0
      //   origin uses: 2
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 4
      BuildItem({ tag:2, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
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
      // 2 = 1+0
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:2, name:'Pickaxe', count:1, cost:1, totalCost:1, priorWork:1, enchants:[{ name:'Unbreaking', level:1 }]}),
      // 3 = 1+1
      //   origin uses: 0,2
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 2
      BuildItem({ tag:3, name:'Book', count:2, cost:2, totalCost:2, priorWork:1, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 4 = 2+1
      //   origin uses: 1,2
      //   parent cost: 1+0
      //   prior work cost: 1+0
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 4
      BuildItem({ tag:4, name:'Pickaxe', count:1, cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 5 = 3+0; same as 4 but more costly
      //   origin uses: 1,2
      //   parent cost: 2+0
      //   prior work cost: 1+0
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 5
      //BuildItem({ tag:5, name:'Pickaxe', count:1, cost:3, totalCost:5, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 6 = 3+2; same as 4 but this wastes a book
      //   origin uses: 1,3
      //   parent cost: 2+1
      //   prior work cost: 1+1
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 7
      //BuildItem({ tag:6, name:'Pickaxe', count:1, cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 7 = 3+3
      //   origin uses: 0,4
      //   parent cost: 2+2
      //   prior work cost: 1+1
      //   enchant cost: 3
      //     unbreaking lvl 3 * mult 1 (book)
      //   total cost: 9
      BuildItem({ tag:7, name:'Book', count:1, cost:5, totalCost:9, priorWork:2, enchants:[{ name:'Unbreaking', level:3 }]}),
      // 8 = 4+3
      //   origin uses: 0,4
      //   parent cost: 4+2
      //   prior work cost: 3+1
      //   enchant cost: 3
      //     unbreaking lvl 3 * mult 1 (book)
      //   total cost: 13
      BuildItem({ tag:8, name:'Pickaxe', count:1, cost:7, totalCost:13, priorWork:3, enchants:[{ name:'Unbreaking', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Prior work is taken up in cost and result - stacked version => 1 combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', count:2, priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:1, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 2 = 0+0
      //   origin uses: 2
      //   parent cost: 0+0
      //   prior work cost: 15+15
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 34
      BuildItem({ tag:2, name:'Pickaxe', cost:34, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Prior work is taken up in cost and result - loose version => 1 combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:0, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3 = 1+0 = 0+1
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+15
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 19
      BuildItem({ tag:3, name:'Pickaxe', cost:19, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Merging enchants where order matters for cost => correct combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3 = 1+0
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 2
      BuildItem({ tag:3, name:'Pickaxe', cost:2, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4 = 0+1; same as 3 but with higher cost
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 4
      //BuildItem({ tag:4, name:'Pickaxe', cost:4, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Merging enchants where order matters for cost + one-sided prior work => correct combine': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // 3 = 1+0
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 0+15
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 17
      BuildItem({ tag:3, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4 = 0+1; same as 3 but with higher cost
      //   origin uses: 1,1
      //   parent cost: 0+0
      //   prior work cost: 15+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 19
      //BuildItem({ tag:4, name:'Pickaxe', cost:19, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Conflicting enchants have their cost & order matters => 2 combines + spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Boots', enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Frost Walker' }, { name:'Unbreaking' }]}),
      // note: an implicit unenchanted boots is added for us
      //BuildItem({ tag:2, name:'Boots'),
    ]
    let desiredItem = BuildItem({ name:'Boots', set:g_desired, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]})
    let expectedItems = [
      // 3 = 0+1
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 2
      //     frost walker: dropped = 1
      //     unbreaking lvl 1 & mult 1 (book)
      //   total cost: 2
      BuildItem({ tag:3, name:'Boots', cost:2, priorWork:1, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
      // 4 = 2+1
      //   origin uses: 0,1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchants extra+1: 3
      //     frost walker lvl 1 & mult 2 (book)
      //     unbreaking lvl 1 & mult 1 (book)
      //   total cost: 3
      BuildItem({ tag:4, name:'Boots', cost:3, priorWork:1, enchants:[{ name:'Frost Walker' }, { name:'Unbreaking' }]}),
      // 5 = 4+0
      //   origin uses: 1,1,1
      //   parent cost: 3+0
      //   prior work cost: 1+0
      //   enchant cost: 3
      //     depth strider: dropped  = 1
      //     Feather Falling lvl 1 & mult 2 (tool)
      //   total cost: 7
      BuildItem({ tag:5, name:'Boots', cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Frost Walker' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
      // 6 = 0+4
      //   origin uses: 1,1,1
      //   parent cost: 0+3
      //   prior work cost: 0+1
      //   enchant cost: 3
      //     frost walker: dropped = 1
      //     unbreaking lvl 1 & mult 2 (tool)
      //   total cost: 7
      BuildItem({ tag:6, name:'Boots', cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Merging appropriate + inappropriate enchants => correct combine + extra spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Protection', level:3 }, { name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }]})
    let expectedItems = [
      // 3 = 0+1
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchants 0+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //     protection: ignored
      //   total cost: 1
      BuildItem({ tag:3, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4 = 1+2
      //   origin uses: 0,1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchants 2+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //     protection: ignored
      //   total cost: 1
      BuildItem({ tag:4, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 5 = 4+0; same as 3 but more costly
      //   origin uses: 1,1,1
      //   parent cost: 1+0
      //   prior work cost: 1+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 6
      //BuildItem({ tag:5, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 6 = 0+4; same as 3 but more costly
      //   origin uses: 1,1,1
      //   parent cost: 0+1
      //   prior work cost: 0+1
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 4
      //BuildItem({ tag:6, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Incompatibly enchanted source item + compatibly enchanted source book => correct combine via added extra + extra spin offs': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:2, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:1 }]})
    let expectedItems = [
      // 3 = 0+1
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchants 0+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:3, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 4 = 1+2
      //   origin uses: 0,1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchants 2+1: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:4, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 5 = 4+0; same as 3 but more costly
      //   origin uses: 1,1,1
      //   parent cost: 1+0
      //   prior work cost: 1+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 6
      //BuildItem({ tag:5, name:'Pickaxe', cost:3, totalCost:6, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 6 = 0+4; same as 3 but more costly
      //   origin uses: 1,1,1
      //   parent cost: 0+1
      //   prior work cost: 0+1
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 4
      //BuildItem({ tag:6, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine #1, order 1': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      BuildItem({ tag:1, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Looting', level:3 }]}),
      // note: an implicit unenchanted sword is added for us
      //BuildItem({ tag:2, name:'Sword'),
    ]
    let desiredItem = BuildItem({ name:'Sword', set:g_desired, enchants:[{ name:'Sharpness', level:3 }]})
    let expectedItems = [
      // 3 = 1+0
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   total cost: 20
      BuildItem({ tag:3, name:'Sword', cost:20, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      // 4 = 0+1; same as 3 but more less costly so also taken
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 16
      //     sharpness lvl 4 * mult 1 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   total cost: 16
      BuildItem({ tag:4, name:'Sword', cost:16, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine #1, order 2': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Looting', level:3 }]}),
      BuildItem({ tag:1, name:'Sword', enchants:[{ name:'Sharpness', level:3 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      // note: an implicit unenchanted sword is added for us
      //BuildItem({ tag:2, name:'Sword'),
    ]
    let desiredItem = BuildItem({ name:'Sword', set:g_desired, enchants:[{ name:'Sharpness', level:3 }]})
    let expectedItems = [
      // 3 = 1+0
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 16
      //     sharpness lvl 4 * mult 1 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   total cost: 16
      BuildItem({ tag:3, name:'Sword', cost:16, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      // 4 = 0+1; same as 3 but more costly
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   total cost: 20
      //BuildItem({ tag:4, name:'Sword', cost:20, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine with many permutations': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:2, name:'Book', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:3, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // 4 = 1+0
      //   origin uses: 1,1,0,0
      //   parent cost: 0+0
      //   prior work cost: 0+15
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 17
      BuildItem({ tag:4, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 5 = 0+1; same as 4 but more costly
      //   origin uses: 1,1,0,0
      //   parent cost: 0+0
      //   prior work cost: 15+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 19
      //BuildItem({ tag:5, name:'Pickaxe', cost:19, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 6 = 0+2
      //   origin uses: 1,0,1,0
      //   parent cost: 0+0
      //   prior work cost: 15+0
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 17
      BuildItem({ tag:6, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 7 = 1+2
      //   origin uses: 0,1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:7, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 8 = 3+2
      //   origin uses: 0,0,1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:8, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // 9 = 7+0
      //   origin uses: 1,1,1,0
      //   parent cost: 1+0
      //   prior work cost: 1+15
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 21
      BuildItem({ tag:9, name:'Pickaxe', cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 10 = 0+7; same as 9 in all aspects
      //   origin uses: 1,1,1,0
      //   parent cost: 0+1
      //   prior work cost: 15+1
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 21
      //BuildItem({ tag:10, name:'Pickaxe', cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 11 = 0+8 = 8+0
      //   origin uses: 1,0,1,1
      //   parent cost: 0+1
      //   prior work cost: 15+1
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 21
      BuildItem({ tag:11, name:'Pickaxe', cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // 12 = 6+1; same as 9 but more costly
      //   origin uses: 1,1,1,0
      //   parent cost: 17+0
      //   prior work cost: 31+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 52
      //BuildItem({ tag:12, name:'Pickaxe', cost:35, totalCost:52, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 13 = 1+6; same as 9 but more costly
      //   origin uses: 1,1,1,0
      //   parent cost: 0+17
      //   prior work cost: 0+31
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 52
      //BuildItem({ tag:13, name:'Pickaxe', cost:35, totalCost:52, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 14 = 8+1; same as 7 but more costly and with more ingredients
      //   origin uses: 0,1,1,1
      //   parent cost: 1+0
      //   prior work cost: 0+1
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 6
      //BuildItem({ tag:14, name:'Pickaxe', cost:3, totalCost:6, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 15 = 1+8; same as 7 but more costly and with more ingredients
      //   origin uses: 0,1,1,1
      //   parent cost: 0+1
      //   prior work cost: 0+1
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 4
      //BuildItem({ tag:15, name:'Pickaxe', cost:3, totalCost:4, priorWork:2, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // 16 = 5+2
      //   origin uses: 1,1,1,0
      //   parent cost: 0+17
      //   prior work cost: 0+31
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 50
      BuildItem({ tag:16, name:'Pickaxe', cost:33, totalCost:50, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 17 = 8+5; same as 16 but more costly and with more ingredients
      //   origin uses: 1,1,1,1
      //   parent cost: 1+17
      //   prior work cost: 1+31
      //   enchant cost: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 58
      //BuildItem({ tag:17, name:'Pickaxe', cost:40, totalCost:58, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 18 = 5+8; same as 16 but more costly and with more ingredients
      //   origin uses: 1,1,1,1
      //   parent cost: 17+1
      //   prior work cost: 31+1
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 54
      //BuildItem({ tag:18, name:'Pickaxe', cost:36, totalCost:54, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 19 = 14+0; same as 16 but more costly and with more ingredients
      //   origin uses: 1,1,1,1
      //   parent cost: 4+0
      //   prior work cost: 3+15
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 0
      //BuildItem({ tag:19, name:'Pickaxe', cost:22, totalCost:26, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 20 = 0+14; same as 16 but more costly and with more ingredients
      //   origin uses: 1,1,1,1
      //   parent cost: 0+4
      //   prior work cost: 15+3
      //   enchant cost: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 30
      //BuildItem({ tag:20, name:'Pickaxe', cost:26, totalCost:30, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 21 = 11+1; same as 16 but more costly and with more ingredients
      //   origin uses: 1,1,1,1
      //   parent cost: 21+0
      //   prior work cost: 31+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 56
      //BuildItem({ tag:21, name:'Pickaxe', cost:35, totalCost:56, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // 22 = 1+11; same as 16 but more costly and with more ingredients
      //   origin uses: 1,1,1,1
      //   parent cost: 0+21
      //   prior work cost: 0+31
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 56
      //BuildItem({ tag:22, name:'Pickaxe', cost:35, totalCost:56, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

})
