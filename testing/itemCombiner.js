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
  let combinedItems = combiner.GetAllItemCombinations(sourceItems, desiredItem, feedbackHandler).combinedItems

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
      // 6 = 0+4; same as 3 but with lower cost and less ingredients
      //   origin uses: 1,1,1
      //   parent cost: 0+3
      //   prior work cost: 0+1
      //   enchant cost: 3
      //     frost walker: dropped = 1
      //     unbreaking lvl 1 & mult 2 (tool)
      //   total cost: 7
      //BuildItem({ tag:6, name:'Boots', cost:4, totalCost:7, priorWork:2, enchants:[{ name:'Depth Strider' }, { name:'Feather Falling' }, { name:'Unbreaking' }]}),
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
      // 3 = 1+0; later superseded by 4
      //   origin uses: 1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 20
      //     sharpness lvl 4 * mult 1 (tool)
      //     knockback lvl 2 * mult 2 (tool)
      //     looting lvl 3 * mult 4 (tool)
      //   total cost: 20
      //BuildItem({ tag:3, name:'Sword', cost:20, priorWork:1, enchants:[{ name:'Sharpness', level:4 }, { name:'Knockback', level:2 }, { name:'Looting', level:3 }]}),
      // 4 = 0+1; same as 3 but less costly so taken
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

  'Complex combine with many permutations #1': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:4, enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:1, name:'Pickaxe', enchants:[{ name:'Mending' }]}),
      BuildItem({ tag:2, name:'Book', enchants:[{ name:'Unbreaking' }]}),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:3, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]})
    let expectedItems = [
      // - = 0+0; not enough uses
      // 4 = 1+0
      //   origin uses: 1,1,0,0
      //   parent cost: 0+0
      //   prior work cost: 0+15
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 17
      BuildItem({ tag:4, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // - = 0+1; same as 4 but more costly
      //   origin uses: 1,1,0,0
      //   parent cost: 0+0
      //   prior work cost: 15+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 19
      // - = 1+1; not enough uses
      // - = 2+0; illegal
      // 5 = 0+2
      //   origin uses: 1,0,1,0
      //   parent cost: 0+0
      //   prior work cost: 15+0
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 17
      BuildItem({ tag:5, name:'Pickaxe', cost:17, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }]}),
      // - = 2+1; illegal
      // 6 = 1+2
      //   origin uses: 0,1,1,0
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:6, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Mending' }]}),
      // - = 2+2; not enough uses
      // - = 3+0; useless
      // - = 0+3; useless
      // - = 3+1; useless
      // - = 1+3; useless
      // 7 = 3+2
      //   origin uses: 0,0,1,1
      //   parent cost: 0+0
      //   prior work cost: 0+0
      //   enchant cost: 1
      //     unbreaking lvl 1 * mult 1 (book)
      //   total cost: 1
      BuildItem({ tag:7, name:'Pickaxe', cost:1, priorWork:1, enchants:[{ name:'Unbreaking' }]}),
      // - = 2+3; illegal
      // - = 3+3; useless
      // - = 4+0; not enough uses
      // - = 0+4; not enough uses
      // - = 4+1; not enough uses
      // - = 1+4; not enough uses
      // 8 = 4+2; later overruled by 10
      //   origin uses: 1,1,1,0
      //   parent cost: 17+0
      //   prior work cost: 31+0
      //   enchant cost: 2
      //     unbreaking lvl 2 * mult 1 (book)
      //   total cost: 50
      //BuildItem({ tag:8, name:'Pickaxe', cost:33, totalCost:50, priorWork:6, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // - = 2+4; illegal
      // - = 4+3; useless
      // - = 3+4; useless
      // - = 4+4; not enough uses
      // - = 5+0; not enough uses
      // - = 0+5; not enough uses
      // - = 5+1; worse than 8
      //   origin uses: 1,1,1,0
      //   parent cost: 17+0
      //   prior work cost: 31+0
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 52
      // - = 1+5; same as 9 in all ways
      //   origin uses: 1,1,1,0
      //   parent cost: 0+17
      //   prior work cost: 0+31
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 52
      // - = 5+2; not enough uses
      // - = 2+5; not enough uses
      // - = 5+3; useless
      // - = 3+5; useless
      // - = 5+4; not enough uses
      // - = 4+5; not enough uses
      // - = 5+5; not enough uses
      // 9 = 6+0; replaces 8
      //   origin uses: 1,1,1,0
      //   parent cost: 1+0
      //   prior work cost: 1+15
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 21
      BuildItem({ tag:9, name:'Pickaxe', cost:20, totalCost:21, priorWork:5, enchants:[{ name:'Unbreaking', level:2 }, { name:'Mending' }]}),
      // - = 0+6; more costly than 9
      //   origin uses: 1,1,1,0
      //   parent cost: 0+1
      //   prior work cost: 15+1
      //   enchant cost: 8
      //     unbreaking lvl 2 * mult 2 (tool)
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 25
      // - = 1+6; same as 10 in all aspects
      //   origin uses: 1,1,1,0
      //   parent cost: 0+1
      //   prior work cost: 15+1
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 21
      // - = 6+1; not enough uses
      // - = 1+6; not enough uses
      // - = 6+2; not enough uses
      // - = 2+6; not enough uses
      // - = 6+3; useless
      // - = 3+6; useless
      // - = 6+4; not enough uses
      // - = 4+6; not enough uses
      // - = 6+5; not enough uses
      // - = 5+6; not enough uses
      // - = 6+6; not enough uses
      // - = 7+0; same as 6 but with higher cost and more ingredients
      //   origin uses: 1,0,1,1
      //   parent cost: 0+1
      //   prior work cost: 15+1
      //   enchant cost: 4
      //     unbreaking lvl 2 * mult 2 (tool)
      //   total cost: 21
      // - = 0+7; same as 7+0
      // - = 7+1; same as 6 but more costly and with more ingredients
      //   origin uses: 0,1,1,1
      //   parent cost: 1+0
      //   prior work cost: 0+1
      //   enchant cost: 4
      //     mending lvl 1 * mult 4 (tool)
      //   total cost: 6
      // - = 1+7; same as 6 but more costly and with more ingredients
      //   origin uses: 0,1,1,1
      //   parent cost: 0+1
      //   prior work cost: 0+1
      //   enchant cost: 2
      //     unbreaking lvl 1 * mult 2 (tool)
      //   total cost: 4
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

  'Complex combine with many permutations #2': (jazil) => {
    let sourceItems = [
      BuildItem({ tag:0, name:'Pickaxe', priorWork:2, enchants:[{ name:'Efficiency' }]}),
      BuildItem({ tag:1, name:'Book', enchants:[{ name:'Fortune', level:2 }], count:10 }),
      BuildItem({ tag:2, name:'Book', enchants:[{ name:'Unbreaking' }]}),
      BuildItem({ tag:3, name:'Book', priorWork:1, enchants:[{ name:'Unbreaking' }, { name:'Efficiency' }], count:4 }),
      // note: an implicit unenchanted pick is added for us
      //BuildItem({ tag:4, name:'Pickaxe'),
    ]
    let desiredItem = BuildItem({ name:'Pickaxe', set:g_desired, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:5 }, { name:'Mending' }]})
    let expectedItems = [
      // Note: too many combinations to list all their details.  This list
      // was generated by the output of the combine algorithm, and curated
      // by hand afterwards for correctness.
      // 5 = 0+1 - 1/1,1/10,0/1,0/4,0/1
      BuildItem({ tag:5, count:1, name:'Pickaxe', cost:7, totalCost:7, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }]}),
      // 6 = 1+1 - 0/1,2/10,0/1,0/4,0/1
      BuildItem({ tag:6, count:5, name:'Book', cost:6, totalCost:6, priorWork:1, enchants:[{ name:'Fortune', level:3 }]}),
      // 7 = 0+2 - 1/1,0/10,1/1,0/4,0/1
      BuildItem({ tag:7, count:1, name:'Pickaxe', cost:4, totalCost:4, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Unbreaking', level:1 }]}),
      // 8 = 2+1 - 0/1,1/10,1/1,0/4,0/1; superceded by 9
      //BuildItem({ tag:8, count:1, name:'Book', cost:4, totalCost:4, priorWork:1, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 9 = 1+2 - 0/1,1/10,1/1,0/4,0/1; supercedes 8
      BuildItem({ tag:9, count:1, name:'Book', cost:1, totalCost:1, priorWork:1, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 10 = 0+3 - 1/1,0/10,0/1,1/4,0/1
      BuildItem({ tag:10, count:1, name:'Pickaxe', cost:7, totalCost:7, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 11 = 3+1 - 0/1,1/10,0/1,1/4,0/1; superceded by 12
      //BuildItem({ tag:11, count:4, name:'Book', cost:5, totalCost:5, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 12 = 1+3 - 0/1,1/10,0/1,1/4,0/1; supercedes 11
      BuildItem({ tag:12, count:4, name:'Book', cost:3, totalCost:3, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 13 = 3+2 - 0/1,0/10,1/1,1/4,0/1
      BuildItem({ tag:13, count:1, name:'Book', cost:3, totalCost:3, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Unbreaking', level:2 }]}),
      // - = 2+3; worse than 13
      // 14 = 3+3 - 0/1,0/10,0/1,2/4,0/1
      BuildItem({ tag:14, count:2, name:'Book', cost:6, totalCost:6, priorWork:2, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 15 = 4+1 - 0/1,1/10,0/1,0/4,1/1
      BuildItem({ tag:15, count:1, name:'Pickaxe', cost:4, totalCost:4, priorWork:1, enchants:[{ name:'Fortune', level:2 }]}),
      // 16 = 4+2 - 0/1,0/10,1/1,0/4,1/1
      BuildItem({ tag:16, count:1, name:'Pickaxe', cost:1, totalCost:1, priorWork:1, enchants:[{ name:'Unbreaking', level:1 }]}),
      // 17 = 4+3 - 0/1,0/10,0/1,1/4,1/1
      BuildItem({ tag:17, count:1, name:'Pickaxe', cost:3, totalCost:3, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Unbreaking', level:1 }]}),
      // 18 = 5+1 - 1/1,2/10,0/1,0/4,0/1; superceded by 21
      //BuildItem({ tag:18, count:1, name:'Pickaxe', cost:13, totalCost:20, priorWork:4, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }]}),
      // 19 = 5+2 - 1/1,1/10,1/1,0/4,0/1; superceded by 27
      //BuildItem({ tag:19, count:1, name:'Pickaxe', cost:8, totalCost:15, priorWork:4, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 20 = 5+3 - 1/1,1/10,0/1,1/4,0/1; superceded by 34
      //BuildItem({ tag:20, count:1, name:'Pickaxe', cost:11, totalCost:18, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 21 = 0+6 - 1/1,2/10,0/1,0/4,0/1; supercedes 18
      BuildItem({ tag:21, count:1, name:'Pickaxe', cost:10, totalCost:16, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }]}),
      // 22 = 6+2 - 0/1,2/10,1/1,0/4,0/1
      BuildItem({ tag:22, count:1, name:'Book', cost:2, totalCost:8, priorWork:2, enchants:[{ name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // - = 2+6; worse than 22
      // 23 = 6+3 - 0/1,2/10,0/1,1/4,0/1
      BuildItem({ tag:23, count:4, name:'Book', cost:4, totalCost:10, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // - = 3+6; worse than 23
      // 24 = 4+6 - 0/1,2/10,0/1,0/4,1/1; superceded by 49
      //BuildItem({ tag:24, count:1, name:'Pickaxe', cost:7, totalCost:13, priorWork:2, enchants:[{ name:'Fortune', level:3 }]}),
      // - = 5+6; worse than 21
      // - = 7+1; worse than 19
      // 25 = 7+3 - 1/1,0/10,1/1,1/4,0/1; superceded by 40
      //BuildItem({ tag:25, count:1, name:'Pickaxe', cost:12, totalCost:16, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 26 = 7+6 - 1/1,2/10,1/1,0/4,0/1; superceded by 30
      //BuildItem({ tag:26, count:1, name:'Pickaxe', cost:14, totalCost:24, priorWork:4, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // 27 = 0+9 - 1/1,1/10,1/1,0/4,0/1; supercedes 19
      BuildItem({ tag:27, count:1, name:'Pickaxe', cost:9, totalCost:10, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // - = 9+1; worse than 22
      // - = 1+9; worse than 22
      // 28 = 9+3 - 0/1,1/10,1/1,1/4,0/1
      BuildItem({ tag:28, count:1, name:'Book', cost:5, totalCost:6, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 3+9; worse than 28
      // 29 = 4+9 - 0/1,1/10,1/1,0/4,1/1; superceded by 50
      //BuildItem({ tag:29, count:1, name:'Pickaxe', cost:6, totalCost:7, priorWork:2, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 30 = 5+9 - 1/1,2/10,1/1,0/4,0/1; supercedes 26; superceded by 60
      //BuildItem({ tag:30, count:1, name:'Pickaxe', cost:15, totalCost:23, priorWork:4, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // - = 9+6; worse than 22
      // - = 6+9; worse than 22
      // - = 10+1; worse than 20
      // - = 10+2; worse than 25
      // 31 = 10+3 - 1/1,0/10,0/1,2/4,0/1; superceded by 42
      //BuildItem({ tag:31, count:1, name:'Pickaxe', cost:12, totalCost:19, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 32 = 10+6 - 1/1,2/10,0/1,1/4,0/1; superceded by 63
      //BuildItem({ tag:32, count:1, name:'Pickaxe', cost:14, totalCost:27, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // 33 = 10+9 - 1/1,1/10,1/1,1/4,0/1; superceded by 67
      //BuildItem({ tag:33, count:1, name:'Pickaxe', cost:14, totalCost:22, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 34 = 0+12 - 1/1,1/10,0/1,1/4,0/1; supercedes 20
      BuildItem({ tag:34, count:1, name:'Pickaxe', cost:13, totalCost:16, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // - = 12+1; worse than 23
      // - = 1+12; worse than 23
      // - = 12+2; worse than 28
      // - = 2+12; worse than 28
      // 35 = 12+3 - 0/1,1/10,0/1,2/4,0/1
      BuildItem({ tag:35, count:2, name:'Book', cost:8, totalCost:11, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 3+12; worse than 35
      // 36 = 4+12 - 0/1,1/10,0/1,1/4,1/1; superceded by 51
      //BuildItem({ tag:36, count:1, name:'Pickaxe', cost:9, totalCost:12, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // - = 5+12; worse than 32
      // - = 12+6; worse than 23
      // - = 6+12; worse than 23
      // - = 7+12; worse than 33
      // 37 = 12+9 - 0/1,2/10,1/1,1/4,0/1; superceded by 61
      //BuildItem({ tag:37, count:1, name:'Book', cost:12, totalCost:16, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 9+12; worse than 37
      // 38 = 10+12 - 1/1,1/10,0/1,2/4,0/1; superceded by 44
      //BuildItem({ tag:38, count:1, name:'Pickaxe', cost:18, totalCost:28, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 39 = 12+12 - 0/1,2/10,0/1,2/4,0/1; superceded by 45
      //BuildItem({ tag:39, count:2, name:'Book', cost:16, totalCost:22, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // 40 = 0+13 - 1/1,0/10,1/1,1/4,0/1; supercedes 25
      BuildItem({ tag:40, count:1, name:'Pickaxe', cost:10, totalCost:13, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 13+1; worse than 28
      // - = 1+13; worse than 28
      // - = 13+3; worse than 14
      // - = 3+13; worse than 14
      // 41 = 4+13 - 0/1,0/10,1/1,1/4,1/1; superceded by 56
      //BuildItem({ tag:41, count:1, name:'Pickaxe', cost:6, totalCost:9, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Unbreaking', level:2 }]}),
      // - = 5+13; worse than 33
      // - = 13+6; worse than 37
      // - = 6+13; worse than 37
      // - = 10+13; worse than 31
      // - = 13+12; worse than 35
      // - = 12+13; worse than 35
      // 42 = 0+14 - 1/1,0/10,0/1,2/4,0/1; supercedes 31
      BuildItem({ tag:42, count:1, name:'Pickaxe', cost:10, totalCost:16, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 14+1; worse than 35
      // - = 1+14; worse than 35
      // 43 = 4+14 - 0/1,0/10,0/1,2/4,1/1; superceded by 57
      //BuildItem({ tag:43, count:1, name:'Pickaxe', cost:7, totalCost:13, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 44 = 5+14 - 1/1,1/10,0/1,2/4,0/1; supercedes 38
      BuildItem({ tag:44, count:1, name:'Pickaxe', cost:14, totalCost:27, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 14+6; worse than 39
      // 45 = 6+14 - 0/1,2/10,0/1,2/4,0/1; supercedes 39; superceded by 64
      //BuildItem({ tag:45, count:2, name:'Book', cost:8, totalCost:20, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 7+14; worse than 40
      // - = 14+9; worse than 35
      // - = 9+14; worse than 35
      // 46 = 10+14 - 1/1,0/10,0/1,3/4,0/1
      BuildItem({ tag:46, count:1, name:'Pickaxe', cost:15, totalCost:28, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 14+12; worse than 35
      // - = 12+14; worse than 35
      // 47 = 14+13 - 0/1,0/10,1/1,3/4,0/1
      BuildItem({ tag:47, count:1, name:'Book', cost:11, totalCost:20, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 13+14; worse than 47
      // 48 = 14+14 - 0/1,0/10,0/1,4/4,0/1
      BuildItem({ tag:48, count:1, name:'Book', cost:12, totalCost:24, priorWork:3, enchants:[{ name:'Efficiency', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 15+0; worse than 5
      // - = 0+15; worse than 5
      // 49 = 15+1 - 0/1,2/10,0/1,0/4,1/1; supercedes 24
      BuildItem({ tag:49, count:1, name:'Pickaxe', cost:7, totalCost:11, priorWork:2, enchants:[{ name:'Fortune', level:3 }]}),
      // 50 = 15+2 - 0/1,1/10,1/1,0/4,1/1; supercedes 29
      BuildItem({ tag:50, count:1, name:'Pickaxe', cost:2, totalCost:6, priorWork:2, enchants:[{ name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // 51 = 15+3 - 0/1,1/10,0/1,1/4,1/1; supercedes 36
      BuildItem({ tag:51, count:1, name:'Pickaxe', cost:4, totalCost:8, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:1 }]}),
      // - = 15+5; worse than 21
      // - = 5+15; worse than 21
      // - = 15+6; worse than 49
      // - = 15+7; worse than 27
      // - = 7+15; worse than 27
      // 52 = 15+9 - 0/1,2/10,1/1,0/4,1/1
      BuildItem({ tag:52, count:1, name:'Pickaxe', cost:9, totalCost:14, priorWork:2, enchants:[{ name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // - = 15+10; worse than 34
      // - = 10+15; worse than 34
      // 53 = 15+12 - 0/1,2/10,0/1,1/4,1/1; superceded by 90
      //BuildItem({ tag:53, count:1, name:'Pickaxe', cost:12, totalCost:19, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // 54 = 15+13 - 0/1,1/10,1/1,1/4,1/1; superceded by 94
      //BuildItem({ tag:54, count:1, name:'Pickaxe', cost:7, totalCost:14, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // 55 = 15+14 - 0/1,1/10,0/1,2/4,1/1; superceded by 95
      //BuildItem({ tag:55, count:1, name:'Pickaxe', cost:8, totalCost:18, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 16+0; worse than 7
      // - = 0+16; worse than 7
      // - = 16+1; worse than 50
      // 56 = 16+3 - 0/1,0/10,1/1,1/4,1/1; supercedes 41
      BuildItem({ tag:56, count:1, name:'Pickaxe', cost:5, totalCost:6, priorWork:2, enchants:[{ name:'Efficiency', level:1 }, { name:'Unbreaking', level:2 }]}),
      // - = 16+5; worse than 27
      // - = 5+16; worse than 27
      // - = 16+6; worse than 52
      // - = 16+10; worse than 40
      // - = 10+16; worse than 40
      // - = 16+12; worse than 54
      // - = 16+14; worse than 43
      // - = 17+0; worse than 10
      // - = 0+17; worse than 10
      // - = 17+1; worse than 51
      // - = 17+2; worse than 56
      // 57 = 17+3 - 0/1,0/10,0/1,2/4,1/1; supercedes 43
      BuildItem({ tag:57, count:1, name:'Pickaxe', cost:8, totalCost:11, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 17+5; worse than 34
      // - = 5+17; worse than 34
      // - = 17+6; worse than 53
      // - = 17+7; worse than 40
      // - = 7+17; worse than 40
      // - = 17+9; worse than 54
      // - = 17+10; worse than 42
      // - = 10+17; worse than 42
      // - = 17+12; worse than 55
      // - = 17+13; worse than 57
      // - = 17+14; worse than 57
      // - = 21+2; worse than 30
      // - = 21+3; worse than 32
      // - = 21+9; worse than 30
      // - = 21+12; worse than 32
      // 58 = 21+13 - 1/1,2/10,1/1,1/4,0/1
      BuildItem({ tag:58, count:1, name:'Pickaxe', cost:14, totalCost:33, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // 59 = 21+14 - 1/1,2/10,0/1,2/4,0/1
      BuildItem({ tag:59, count:1, name:'Pickaxe', cost:14, totalCost:36, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 21+16; worse than 30
      // - = 16+21; worse than 30
      // - = 21+17; worse than 32
      // - = 17+21; worse than 32
      // 60 = 0+22 - 1/1,2/10,1/1,0/4,0/1; supercedes 30
      BuildItem({ tag:60, count:1, name:'Pickaxe', cost:13, totalCost:21, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // 61 = 22+3 - 0/1,2/10,1/1,1/4,0/1; supercedes 37
      BuildItem({ tag:61, count:1, name:'Book', cost:7, totalCost:15, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 3+22; worse than 61
      // - = 4+22; worse than 52
      // - = 5+22; worse than 60
      // - = 10+22; worse than 58
      // - = 22+12; worse than 61
      // - = 12+22; worse than 61
      // - = 22+14; worse than 45
      // - = 14+22; worse than 45
      // - = 15+22; worse than 52
      // 62 = 17+22 - 0/1,2/10,1/1,1/4,1/1; superceded by 65
      //BuildItem({ tag:62, count:1, name:'Pickaxe', cost:14, totalCost:25, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 21+22; worse than 60
      // 63 = 0+23 - 1/1,2/10,0/1,1/4,0/1; supercedes 32
      BuildItem({ tag:63, count:1, name:'Pickaxe', cost:15, totalCost:25, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // - = 23+2; worse than 61
      // - = 2+23; worse than 61
      // 64 = 23+3 - 0/1,2/10,0/1,2/4,0/1; supercedes 45
      BuildItem({ tag:64, count:2, name:'Book', cost:8, totalCost:18, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 3+23; worse than 64
      // - = 4+23; worse than 53
      // - = 5+23; worse than 63
      // - = 7+23; worse than 58
      // - = 23+9; worse than 61
      // - = 9+23; worse than 61
      // - = 10+23; worse than 59
      // - = 23+12; worse than 64
      // - = 12+23; worse than 64
      // - = 23+13; worse than 64
      // - = 13+23; worse than 64
      // - = 23+14; worse than 64
      // - = 14+23; worse than 64
      // - = 15+23; worse than 53
      // 65 = 16+23 - 0/1,2/10,1/1,1/4,1/1; supercedes 62; superceded by 69
      //BuildItem({ tag:65, count:1, name:'Pickaxe', cost:13, totalCost:24, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // 66 = 17+23 - 0/1,2/10,0/1,2/4,1/1; superceded by 91
      //BuildItem({ tag:66, count:1, name:'Pickaxe', cost:16, totalCost:29, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 21+23; worse than 63
      // - = 23+22; worse than 61
      // - = 22+23; worse than 61
      // - = 23+23; worse than 64
      // - = 27+1; worse than 60
      // - = 27+3; worse than 33
      // - = 27+6; worse than 60
      // - = 27+12; worse than 58
      // - = 27+14; worse than 33
      // - = 27+15; worse than 60
      // - = 15+27; worse than 60
      // - = 27+17; worse than 33
      // - = 17+27; worse than 33
      // - = 27+23; worse than 58
      // 67 = 0+28 - 1/1,1/10,1/1,1/4,0/1; supercedes 33
      BuildItem({ tag:67, count:1, name:'Pickaxe', cost:14, totalCost:20, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 28+1; worse than 61
      // - = 1+28; worse than 61
      // - = 28+3; worse than 35
      // - = 3+28; worse than 35
      // - = 4+28; worse than 54
      // - = 5+28; worse than 58
      // - = 28+6; worse than 61
      // - = 6+28; worse than 61
      // - = 10+28; worse than 44
      // - = 28+12; worse than 64
      // - = 12+28; worse than 64
      // 68 = 28+14 - 0/1,1/10,1/1,3/4,0/1
      BuildItem({ tag:68, count:1, name:'Book', cost:11, totalCost:23, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 14+28; worse than 68
      // 69 = 15+28 - 0/1,2/10,1/1,1/4,1/1; supercedes 65; superceded by 96
      //BuildItem({ tag:69, count:1, name:'Pickaxe', cost:13, totalCost:23, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 17+28; worse than 55
      // - = 21+28; worse than 58
      // - = 28+23; worse than 64
      // - = 23+28; worse than 64
      // - = 34+1; worse than 63
      // - = 34+2; worse than 67
      // - = 34+3; worse than 44
      // - = 34+6; worse than 63
      // - = 34+9; worse than 58
      // - = 34+12; worse than 59
      // - = 34+13; worse than 44
      // 70 = 34+14 - 1/1,1/10,0/1,3/4,0/1
      BuildItem({ tag:70, count:1, name:'Pickaxe', cost:15, totalCost:37, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 34+15; worse than 63
      // - = 15+34; worse than 63
      // - = 34+16; worse than 67
      // - = 16+34; worse than 67
      // - = 34+17; worse than 44
      // - = 17+34; worse than 44
      // - = 34+22; worse than 58
      // - = 34+23; worse than 59
      // - = 34+28; worse than 58
      // - = 0+35; worse than 44
      // - = 35+1; worse than 64
      // - = 1+35; worse than 64
      // - = 4+35; worse than 55
      // - = 5+35; worse than 59
      // - = 35+6; worse than 64
      // - = 6+35; worse than 64
      // - = 7+35; worse than 44
      // - = 35+9; worse than 64
      // - = 9+35; worse than 64
      // - = 10+35; worse than 70
      // - = 35+12; worse than 64
      // - = 12+35; worse than 64
      // - = 35+13; worse than 68
      // - = 13+35; worse than 68
      // 71 = 35+14 - 0/1,1/10,0/1,4/4,0/1
      BuildItem({ tag:71, count:1, name:'Book', cost:16, totalCost:33, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 14+35; worse than 71
      // - = 15+35; worse than 66
      // - = 16+35; worse than 55
      // - = 17+35; worse than 55
      // - = 21+35; worse than 59
      // - = 35+22; worse than 64
      // - = 22+35; worse than 64
      // - = 35+23; worse than 64
      // - = 23+35; worse than 64
      // - = 27+35; worse than 58
      // 72 = 35+28 - 0/1,2/10,1/1,3/4,0/1; superceded by 101
      //BuildItem({ tag:72, count:1, name:'Book', cost:21, totalCost:38, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 28+35; worse than 72
      // 73 = 34+35 - 1/1,2/10,0/1,3/4,0/1; superceded by 102
      //BuildItem({ tag:73, count:1, name:'Pickaxe', cost:25, totalCost:52, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // 74 = 35+35 - 0/1,2/10,0/1,4/4,0/1; superceded by 87
      //BuildItem({ tag:74, count:1, name:'Book', cost:26, totalCost:48, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 40+1; worse than 67
      // - = 40+6; worse than 58
      // - = 40+12; worse than 44
      // 75 = 40+14 - 1/1,0/10,1/1,3/4,0/1
      BuildItem({ tag:75, count:1, name:'Pickaxe', cost:16, totalCost:35, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 40+15; worse than 67
      // - = 15+40; worse than 67
      // - = 40+23; worse than 58
      // 76 = 40+35 - 1/1,1/10,1/1,3/4,0/1; superceded by 106
      //BuildItem({ tag:76, count:1, name:'Pickaxe', cost:24, totalCost:48, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 42+1; worse than 44
      // - = 42+6; worse than 59
      // - = 42+9; worse than 44
      // - = 42+12; worse than 44
      // 77 = 42+13 - 1/1,0/10,1/1,3/4,0/1
      BuildItem({ tag:77, count:1, name:'Pickaxe', cost:15, totalCost:34, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:3 }]}),
      // 78 = 42+14 - 1/1,0/10,0/1,4/4,0/1
      BuildItem({ tag:78, count:1, name:'Pickaxe', cost:16, totalCost:38, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 42+15; worse than 44
      // - = 15+42; worse than 44
      // - = 42+22; worse than 58
      // - = 42+23; worse than 59
      // 79 = 42+28 - 1/1,1/10,1/1,3/4,0/1
      BuildItem({ tag:79, count:1, name:'Pickaxe', cost:19, totalCost:41, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // 80 = 42+35 - 1/1,1/10,0/1,4/4,0/1
      BuildItem({ tag:80, count:1, name:'Pickaxe', cost:24, totalCost:51, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 44+1; worse than 59
      // - = 44+6; worse than 59
      // - = 44+9; worse than 58
      // - = 44+12; worse than 59
      // - = 44+13; worse than 79
      // - = 44+14; worse than 80
      // - = 44+15; worse than 59
      // - = 15+44; worse than 59
      // - = 44+22; worse than 58
      // - = 44+23; worse than 59
      // 81 = 44+28 - 1/1,2/10,1/1,3/4,0/1; superceded by 85
      //BuildItem({ tag:81, count:1, name:'Pickaxe', cost:29, totalCost:62, priorWork:5, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // 82 = 44+35 - 1/1,2/10,0/1,4/4,0/1; superceded by 89
      //BuildItem({ tag:82, count:1, name:'Pickaxe', cost:34, totalCost:72, priorWork:5, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 46+1; worse than 70
      // - = 46+6; worse than 73
      // - = 46+9; worse than 70
      // - = 46+12; worse than 70
      // - = 46+13; worse than 75
      // - = 46+15; worse than 70
      // - = 15+46; worse than 70
      // - = 46+22; worse than 73
      // - = 46+23; worse than 73
      // - = 46+28; worse than 76
      // - = 0+47; worse than 77
      // - = 47+1; worse than 68
      // - = 1+47; worse than 68
      // 83 = 4+47 - 0/1,0/10,1/1,3/4,1/1; superceded by 97
      //BuildItem({ tag:83, count:1, name:'Pickaxe', cost:12, totalCost:32, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 5+47; worse than 79
      // - = 47+6; worse than 72
      // - = 6+47; worse than 72
      // - = 10+47; worse than 75
      // - = 47+12; worse than 68
      // - = 12+47; worse than 68
      // 84 = 15+47 - 0/1,1/10,1/1,3/4,1/1; superceded by 98
      //BuildItem({ tag:84, count:1, name:'Pickaxe', cost:13, totalCost:37, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 17+47; worse than 83
      // 85 = 21+47 - 1/1,2/10,1/1,3/4,0/1; supercedes 81
      BuildItem({ tag:85, count:1, name:'Pickaxe', cost:19, totalCost:55, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 47+23; worse than 72
      // - = 23+47; worse than 72
      // - = 34+47; worse than 76
      // - = 0+48; worse than 78
      // - = 48+1; worse than 71
      // - = 1+48; worse than 71
      // 86 = 4+48 - 0/1,0/10,0/1,4/4,1/1; superceded by 99
      //BuildItem({ tag:86, count:1, name:'Pickaxe', cost:13, totalCost:37, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 5+48; worse than 80
      // 87 = 48+6 - 0/1,2/10,0/1,4/4,0/1; supercedes 74; superceded by 103
      //BuildItem({ tag:87, count:1, name:'Book', cost:14, totalCost:44, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 6+48; worse than 87
      // - = 7+48; worse than 75
      // - = 48+9; worse than 71
      // - = 9+48; worse than 71
      // 88 = 15+48 - 0/1,1/10,0/1,4/4,1/1; superceded by 109
      //BuildItem({ tag:88, count:1, name:'Pickaxe', cost:14, totalCost:42, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 16+48; worse than 86
      // 89 = 21+48 - 1/1,2/10,0/1,4/4,0/1; supercedes 82
      BuildItem({ tag:89, count:1, name:'Pickaxe', cost:20, totalCost:60, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 48+22; worse than 87
      // - = 22+48; worse than 87
      // - = 27+48; worse than 76
      // - = 49+0; worse than 21
      // - = 0+49; worse than 21
      // - = 49+2; worse than 52
      // 90 = 49+3 - 0/1,2/10,0/1,1/4,1/1; supercedes 53
      BuildItem({ tag:90, count:1, name:'Pickaxe', cost:6, totalCost:17, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:1 }]}),
      // - = 49+5; worse than 21
      // - = 5+49; worse than 21
      // - = 49+7; worse than 60
      // - = 7+49; worse than 60
      // - = 49+9; worse than 52
      // - = 49+10; worse than 63
      // - = 10+49; worse than 63
      // - = 49+12; worse than 90
      // - = 49+13; worse than 69
      // 91 = 49+14 - 0/1,2/10,0/1,2/4,1/1; supercedes 66
      BuildItem({ tag:91, count:1, name:'Pickaxe', cost:10, totalCost:27, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 49+22; worse than 52
      // - = 49+23; worse than 90
      // - = 49+27; worse than 60
      // - = 27+49; worse than 60
      // - = 49+28; worse than 69
      // - = 49+34; worse than 63
      // - = 34+49; worse than 63
      // - = 49+35; worse than 91
      // - = 49+40; worse than 58
      // - = 40+49; worse than 58
      // - = 49+42; worse than 59
      // - = 42+49; worse than 59
      // - = 49+44; worse than 59
      // - = 44+49; worse than 59
      // - = 49+46; worse than 73
      // - = 46+49; worse than 73
      // 92 = 49+47 - 0/1,2/10,1/1,3/4,1/1; superceded by 105
      //BuildItem({ tag:92, count:1, name:'Pickaxe', cost:15, totalCost:46, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // 93 = 49+48 - 0/1,2/10,0/1,4/4,1/1; superceded by 107
      //BuildItem({ tag:93, count:1, name:'Pickaxe', cost:16, totalCost:51, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 50+0; worse than 27
      // - = 0+50; worse than 27
      // - = 50+1; worse than 52
      // 94 = 50+3 - 0/1,1/10,1/1,1/4,1/1; supercedes 54
      BuildItem({ tag:94, count:1, name:'Pickaxe', cost:7, totalCost:13, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 50+5; worse than 60
      // - = 5+50; worse than 60
      // - = 50+6; worse than 52
      // - = 50+10; worse than 67
      // - = 10+50; worse than 67
      // - = 50+12; worse than 69
      // - = 50+14; worse than 55
      // - = 50+21; worse than 60
      // - = 21+50; worse than 60
      // - = 50+23; worse than 69
      // - = 50+34; worse than 58
      // - = 34+50; worse than 58
      // - = 50+35; worse than 91
      // - = 50+42; worse than 44
      // - = 42+50; worse than 44
      // - = 50+44; worse than 58
      // - = 44+50; worse than 58
      // - = 50+46; worse than 70
      // - = 46+50; worse than 70
      // - = 50+48; worse than 88
      // - = 51+0; worse than 34
      // - = 0+51; worse than 34
      // - = 51+1; worse than 90
      // - = 51+2; worse than 94
      // 95 = 51+3 - 0/1,1/10,0/1,2/4,1/1; supercedes 55
      BuildItem({ tag:95, count:1, name:'Pickaxe', cost:8, totalCost:16, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:2 }]}),
      // - = 51+5; worse than 63
      // - = 5+51; worse than 63
      // - = 51+6; worse than 90
      // - = 51+7; worse than 67
      // - = 7+51; worse than 67
      // 96 = 51+9 - 0/1,2/10,1/1,1/4,1/1; supercedes 69
      BuildItem({ tag:96, count:1, name:'Pickaxe', cost:12, totalCost:21, priorWork:3, enchants:[{ name:'Efficiency', level:1 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 51+10; worse than 44
      // - = 10+51; worse than 44
      // - = 51+12; worse than 91
      // - = 51+13; worse than 95
      // - = 51+14; worse than 95
      // - = 51+21; worse than 63
      // - = 21+51; worse than 63
      // - = 51+22; worse than 96
      // - = 51+23; worse than 91
      // - = 51+27; worse than 58
      // - = 27+51; worse than 58
      // - = 51+28; worse than 91
      // - = 51+34; worse than 59
      // - = 34+51; worse than 59
      // - = 51+35; worse than 91
      // - = 51+40; worse than 44
      // - = 40+51; worse than 44
      // - = 51+42; worse than 44
      // - = 42+51; worse than 44
      // - = 51+44; worse than 59
      // - = 44+51; worse than 59
      // - = 51+46; worse than 70
      // - = 46+51; worse than 70
      // - = 51+47; worse than 84
      // - = 52+0; worse than 60
      // - = 0+52; worse than 60
      // - = 52+3; worse than 96
      // - = 52+5; worse than 60
      // - = 5+52; worse than 60
      // - = 52+10; worse than 58
      // - = 10+52; worse than 58
      // - = 52+12; worse than 96
      // - = 52+14; worse than 91
      // - = 52+21; worse than 60
      // - = 21+52; worse than 60
      // - = 52+23; worse than 96
      // - = 52+34; worse than 58
      // - = 34+52; worse than 58
      // - = 52+35; worse than 91
      // - = 52+42; worse than 58
      // - = 42+52; worse than 58
      // - = 52+44; worse than 58
      // - = 44+52; worse than 58
      // - = 52+46; worse than 73
      // - = 46+52; worse than 73
      // - = 52+48; worse than 93
      // - = 56+0; worse than 40
      // - = 0+56; worse than 40
      // - = 56+1; worse than 94
      // - = 56+3; worse than 57
      // - = 56+5; worse than 67
      // - = 5+56; worse than 67
      // - = 56+6; worse than 96
      // - = 56+10; worse than 40
      // - = 10+56; worse than 40
      // - = 56+12; worse than 95
      // 97 = 56+14 - 0/1,0/10,1/1,3/4,1/1; supercedes 83
      BuildItem({ tag:97, count:1, name:'Pickaxe', cost:11, totalCost:23, priorWork:3, enchants:[{ name:'Efficiency', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 56+21; worse than 58
      // - = 21+56; worse than 58
      // - = 56+23; worse than 91
      // - = 56+34; worse than 44
      // - = 34+56; worse than 44
      // 98 = 56+35 - 0/1,1/10,1/1,3/4,1/1; supercedes 84; superceded by 108
      //BuildItem({ tag:98, count:1, name:'Pickaxe', cost:19, totalCost:36, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 56+42; worse than 77
      // - = 42+56; worse than 77
      // - = 56+44; worse than 79
      // - = 44+56; worse than 79
      // - = 56+46; worse than 75
      // - = 46+56; worse than 75
      // - = 57+1; worse than 95
      // - = 57+5; worse than 44
      // - = 5+57; worse than 44
      // - = 57+6; worse than 91
      // - = 57+9; worse than 95
      // - = 57+10; worse than 46
      // - = 10+57; worse than 46
      // - = 57+12; worse than 95
      // - = 57+13; worse than 97
      // 99 = 57+14 - 0/1,0/10,0/1,4/4,1/1; supercedes 86
      BuildItem({ tag:99, count:1, name:'Pickaxe', cost:16, totalCost:33, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 57+21; worse than 59
      // - = 21+57; worse than 59
      // - = 57+22; worse than 91
      // - = 57+23; worse than 91
      // - = 57+27; worse than 44
      // - = 27+57; worse than 44
      // - = 57+28; worse than 98
      // - = 57+34; worse than 70
      // - = 34+57; worse than 70
      // - = 57+35; worse than 88
      // - = 57+40; worse than 75
      // - = 40+57; worse than 75
      // - = 57+42; worse than 78
      // - = 42+57; worse than 78
      // - = 57+44; worse than 80
      // - = 44+57; worse than 80
      // 100 = 58+14 - 1/1,2/10,1/1,3/4,0/1; superceded by 104
      //BuildItem({ tag:100, count:1, name:'Pickaxe', cost:24, totalCost:63, priorWork:5, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 58+35; worse than 100
      // - = 58+57; worse than 100
      // - = 59+13; worse than 85
      // - = 59+14; worse than 89
      // - = 59+28; worse than 85
      // - = 59+35; worse than 89
      // - = 59+56; worse than 85
      // - = 56+59; worse than 85
      // - = 59+57; worse than 89
      // - = 60+3; worse than 58
      // - = 60+12; worse than 58
      // - = 60+14; worse than 58
      // - = 60+17; worse than 58
      // - = 17+60; worse than 58
      // - = 60+23; worse than 58
      // - = 60+35; worse than 58
      // - = 60+48; worse than 89
      // - = 60+51; worse than 58
      // - = 51+60; worse than 58
      // - = 60+57; worse than 58
      // - = 57+60; worse than 58
      // - = 0+61; worse than 58
      // - = 61+3; worse than 64
      // - = 3+61; worse than 64
      // - = 4+61; worse than 96
      // - = 5+61; worse than 58
      // - = 10+61; worse than 58
      // - = 61+12; worse than 64
      // - = 12+61; worse than 64
      // 101 = 61+14 - 0/1,2/10,1/1,3/4,0/1; supercedes 72
      BuildItem({ tag:101, count:1, name:'Book', cost:15, totalCost:36, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 14+61; worse than 101
      // - = 15+61; worse than 96
      // - = 17+61; worse than 91
      // - = 21+61; worse than 58
      // - = 61+23; worse than 64
      // - = 23+61; worse than 64
      // - = 34+61; worse than 58
      // - = 61+35; worse than 101
      // - = 35+61; worse than 101
      // - = 42+61; worse than 85
      // - = 44+61; worse than 85
      // - = 46+61; worse than 89
      // - = 49+61; worse than 96
      // - = 51+61; worse than 91
      // - = 57+61; worse than 92
      // - = 59+61; worse than 85
      // - = 63+2; worse than 58
      // - = 63+3; worse than 59
      // - = 63+9; worse than 58
      // - = 63+12; worse than 59
      // - = 63+13; worse than 58
      // 102 = 63+14 - 1/1,2/10,0/1,3/4,0/1; supercedes 73
      BuildItem({ tag:102, count:1, name:'Pickaxe', cost:15, totalCost:46, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:2 }]}),
      // - = 63+16; worse than 58
      // - = 16+63; worse than 58
      // - = 63+17; worse than 59
      // - = 17+63; worse than 59
      // - = 63+22; worse than 58
      // - = 63+23; worse than 59
      // - = 63+28; worse than 58
      // - = 63+35; worse than 102
      // - = 63+47; worse than 89
      // - = 63+50; worse than 58
      // - = 50+63; worse than 58
      // - = 63+51; worse than 59
      // - = 51+63; worse than 59
      // - = 63+52; worse than 58
      // - = 52+63; worse than 58
      // - = 63+56; worse than 58
      // - = 56+63; worse than 58
      // - = 63+57; worse than 102
      // - = 57+63; worse than 102
      // - = 63+61; worse than 58
      // - = 0+64; worse than 59
      // - = 4+64; worse than 91
      // - = 5+64; worse than 59
      // - = 7+64; worse than 58
      // - = 10+64; worse than 102
      // - = 64+13; worse than 101
      // - = 13+64; worse than 101
      // 103 = 64+14 - 0/1,2/10,0/1,4/4,0/1; supercedes 87
      BuildItem({ tag:103, count:1, name:'Book', cost:16, totalCost:40, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 14+64; worse than 103
      // - = 15+64; worse than 91
      // - = 16+64; worse than 91
      // - = 17+64; worse than 91
      // - = 21+64; worse than 59
      // - = 27+64; worse than 58
      // - = 64+28; worse than 101
      // - = 28+64; worse than 101
      // - = 34+64; worse than 102
      // - = 64+35; worse than 103
      // - = 35+64; worse than 103
      // 104 = 40+64 - 1/1,2/10,1/1,3/4,0/1; supercedes 100
      BuildItem({ tag:104, count:1, name:'Pickaxe', cost:26, totalCost:57, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 42+64; worse than 89
      // - = 44+64; worse than 89
      // - = 49+64; worse than 91
      // - = 50+64; worse than 91
      // - = 51+64; worse than 91
      // - = 52+64; worse than 91
      // 105 = 56+64 - 0/1,2/10,1/1,3/4,1/1; supercedes 92; superceded by 110
      //BuildItem({ tag:105, count:1, name:'Pickaxe', cost:21, totalCost:45, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 57+64; worse than 93
      // - = 58+64; worse than 104
      // - = 59+64; worse than 89
      // - = 60+64; worse than 58
      // - = 64+61; worse than 101
      // - = 61+64; worse than 101
      // - = 63+64; worse than 102
      // - = 64+64; worse than 103
      // - = 67+1; worse than 58
      // - = 67+6; worse than 58
      // - = 67+12; worse than 58
      // 106 = 67+14 - 1/1,1/10,1/1,3/4,0/1; supercedes 76
      BuildItem({ tag:106, count:1, name:'Pickaxe', cost:16, totalCost:42, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 67+15; worse than 58
      // - = 15+67; worse than 58
      // - = 67+23; worse than 58
      // - = 67+35; worse than 104
      // - = 67+49; worse than 58
      // - = 49+67; worse than 58
      // - = 67+51; worse than 58
      // - = 51+67; worse than 58
      // - = 67+57; worse than 106
      // - = 57+67; worse than 106
      // - = 67+64; worse than 104
      // - = 0+68; worse than 79
      // - = 68+1; worse than 101
      // - = 1+68; worse than 101
      // - = 4+68; worse than 98
      // - = 5+68; worse than 85
      // - = 68+6; worse than 101
      // - = 6+68; worse than 101
      // - = 10+68; worse than 80
      // - = 68+12; worse than 101
      // - = 12+68; worse than 101
      // - = 15+68; worse than 105
      // - = 17+68; worse than 98
      // - = 21+68; worse than 85
      // - = 68+23; worse than 101
      // - = 23+68; worse than 101
      // - = 34+68; worse than 89
      // - = 49+68; worse than 105
      // - = 51+68; worse than 105
      // - = 63+68; worse than 89
      // - = 70+1; worse than 102
      // - = 70+6; worse than 102
      // - = 70+9; worse than 102
      // - = 70+12; worse than 102
      // - = 70+13; worse than 80
      // - = 70+15; worse than 102
      // - = 15+70; worse than 102
      // - = 70+22; worse than 102
      // - = 70+23; worse than 102
      // - = 70+28; worse than 89
      // - = 70+49; worse than 102
      // - = 49+70; worse than 102
      // - = 70+50; worse than 102
      // - = 50+70; worse than 102
      // - = 70+51; worse than 102
      // - = 51+70; worse than 102
      // - = 70+52; worse than 102
      // - = 52+70; worse than 102
      // - = 70+56; worse than 80
      // - = 56+70; worse than 80
      // - = 70+61; worse than 89
      // - = 0+71; worse than 80
      // - = 71+1; worse than 103
      // - = 1+71; worse than 103
      // - = 4+71; worse than 88
      // - = 5+71; worse than 89
      // - = 71+6; worse than 103
      // - = 6+71; worse than 103
      // - = 7+71; worse than 80
      // - = 71+9; worse than 103
      // - = 9+71; worse than 103
      // - = 15+71; worse than 93
      // - = 16+71; worse than 88
      // - = 21+71; worse than 89
      // - = 71+22; worse than 103
      // - = 22+71; worse than 103
      // - = 27+71; worse than 89
      // - = 49+71; worse than 93
      // - = 50+71; worse than 93
      // - = 52+71; worse than 93
      // - = 60+71; worse than 89
      // - = 75+1; worse than 106
      // - = 75+6; worse than 104
      // - = 75+12; worse than 80
      // - = 75+15; worse than 106
      // - = 15+75; worse than 106
      // - = 75+23; worse than 89
      // - = 75+49; worse than 104
      // - = 49+75; worse than 104
      // - = 75+51; worse than 80
      // - = 51+75; worse than 80
      // - = 77+1; worse than 79
      // - = 77+6; worse than 85
      // - = 77+12; worse than 79
      // - = 77+15; worse than 79
      // - = 15+77; worse than 79
      // - = 77+23; worse than 85
      // - = 77+49; worse than 85
      // - = 49+77; worse than 85
      // - = 77+51; worse than 79
      // - = 51+77; worse than 79
      // - = 78+1; worse than 80
      // - = 78+6; worse than 89
      // - = 78+9; worse than 80
      // - = 78+15; worse than 80
      // - = 15+78; worse than 80
      // - = 78+22; worse than 89
      // - = 78+49; worse than 89
      // - = 49+78; worse than 89
      // - = 78+50; worse than 80
      // - = 50+78; worse than 80
      // - = 78+52; worse than 89
      // - = 52+78; worse than 89
      // - = 79+1; worse than 85
      // - = 79+6; worse than 85
      // - = 79+12; worse than 85
      // - = 79+15; worse than 85
      // - = 15+79; worse than 85
      // - = 79+23; worse than 85
      // - = 79+49; worse than 85
      // - = 49+79; worse than 85
      // - = 79+51; worse than 85
      // - = 51+79; worse than 85
      // - = 80+1; worse than 89
      // - = 80+6; worse than 89
      // - = 80+9; worse than 89
      // - = 80+15; worse than 89
      // - = 15+80; worse than 89
      // - = 80+22; worse than 89
      // - = 80+49; worse than 89
      // - = 49+80; worse than 89
      // - = 80+50; worse than 89
      // - = 50+80; worse than 89
      // - = 80+52; worse than 89
      // - = 52+80; worse than 89
      // - = 88+1; worse than 93
      // - = 88+5; worse than 89
      // - = 88+6; worse than 93
      // - = 88+9; worse than 93
      // - = 88+21; worse than 89
      // - = 88+22; worse than 93
      // - = 90+0; worse than 63
      // - = 0+90; worse than 63
      // - = 90+2; worse than 96
      // - = 90+3; worse than 91
      // - = 90+5; worse than 63
      // - = 5+90; worse than 63
      // - = 90+7; worse than 58
      // - = 7+90; worse than 58
      // - = 90+9; worse than 96
      // - = 90+10; worse than 59
      // - = 10+90; worse than 59
      // - = 90+12; worse than 91
      // - = 90+13; worse than 91
      // - = 90+14; worse than 91
      // - = 90+21; worse than 63
      // - = 21+90; worse than 63
      // - = 90+22; worse than 96
      // - = 90+23; worse than 91
      // - = 90+27; worse than 58
      // - = 27+90; worse than 58
      // - = 90+28; worse than 91
      // - = 90+34; worse than 59
      // - = 34+90; worse than 59
      // - = 90+35; worse than 91
      // - = 90+40; worse than 58
      // - = 40+90; worse than 58
      // - = 90+42; worse than 59
      // - = 42+90; worse than 59
      // - = 90+46; worse than 102
      // - = 90+47; worse than 105
      // - = 90+60; worse than 58
      // - = 60+90; worse than 58
      // - = 90+61; worse than 91
      // - = 90+63; worse than 59
      // - = 63+90; worse than 59
      // - = 90+64; worse than 91
      // - = 90+67; worse than 58
      // - = 67+90; worse than 58
      // - = 90+68; worse than 105
      // - = 90+75; worse than 89
      // - = 90+77; worse than 85
      // - = 91+10; worse than 102
      // - = 10+91; worse than 102
      // - = 91+13; worse than 105
      // 107 = 91+14 - 0/1,2/10,0/1,4/4,1/1; supercedes 93
      BuildItem({ tag:107, count:1, name:'Pickaxe', cost:16, totalCost:49, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 91+28; worse than 105
      // - = 91+34; worse than 102
      // - = 34+91; worse than 102
      // - = 91+35; worse than 107
      // - = 91+40; worse than 104
      // - = 40+91; worse than 104
      // - = 91+42; worse than 89
      // - = 42+91; worse than 89
      // - = 91+61; worse than 105
      // - = 91+63; worse than 102
      // - = 63+91; worse than 102
      // - = 91+64; worse than 107
      // - = 91+67; worse than 104
      // - = 67+91; worse than 104
      // - = 94+0; worse than 67
      // - = 0+94; worse than 67
      // - = 94+1; worse than 96
      // - = 94+3; worse than 95
      // - = 94+5; worse than 58
      // - = 5+94; worse than 58
      // - = 94+6; worse than 96
      // - = 94+10; worse than 44
      // - = 10+94; worse than 44
      // - = 94+12; worse than 91
      // 108 = 94+14 - 0/1,1/10,1/1,3/4,1/1; supercedes 98
      BuildItem({ tag:108, count:1, name:'Pickaxe', cost:15, totalCost:34, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 94+21; worse than 58
      // - = 21+94; worse than 58
      // - = 94+23; worse than 91
      // - = 94+34; worse than 58
      // - = 34+94; worse than 58
      // - = 94+35; worse than 105
      // - = 94+42; worse than 79
      // - = 42+94; worse than 79
      // - = 94+46; worse than 80
      // - = 46+94; worse than 80
      // - = 94+63; worse than 58
      // - = 63+94; worse than 58
      // - = 94+64; worse than 105
      // - = 95+1; worse than 91
      // - = 95+5; worse than 59
      // - = 5+95; worse than 59
      // - = 95+6; worse than 91
      // - = 95+9; worse than 91
      // - = 95+10; worse than 70
      // - = 10+95; worse than 70
      // - = 95+12; worse than 91
      // - = 95+13; worse than 108
      // 109 = 95+14 - 0/1,1/10,0/1,4/4,1/1; supercedes 88
      BuildItem({ tag:109, count:1, name:'Pickaxe', cost:16, totalCost:38, priorWork:4, enchants:[{ name:'Efficiency', level:3 }, { name:'Fortune', level:2 }, { name:'Unbreaking', level:3 }]}),
      // - = 95+21; worse than 59
      // - = 21+95; worse than 59
      // - = 95+22; worse than 91
      // - = 95+23; worse than 91
      // - = 95+27; worse than 58
      // - = 27+95; worse than 58
      // 110 = 95+28 - 0/1,2/10,1/1,3/4,1/1; supercedes 105; superceded by 111
      //BuildItem({ tag:110, count:1, name:'Pickaxe', cost:21, totalCost:43, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 95+34; worse than 102
      // - = 34+95; worse than 102
      // - = 95+35; worse than 107
      // - = 95+40; worse than 106
      // - = 40+95; worse than 106
      // - = 95+42; worse than 80
      // - = 42+95; worse than 80
      // - = 95+60; worse than 58
      // - = 60+95; worse than 58
      // - = 95+61; worse than 110
      // - = 95+63; worse than 102
      // - = 63+95; worse than 102
      // - = 95+64; worse than 107
      // - = 95+67; worse than 104
      // - = 67+95; worse than 104
      // - = 96+0; worse than 58
      // - = 0+96; worse than 58
      // - = 96+3; worse than 91
      // - = 96+5; worse than 58
      // - = 5+96; worse than 58
      // - = 96+10; worse than 58
      // - = 10+96; worse than 58
      // - = 96+12; worse than 91
      // 111 = 96+14 - 0/1,2/10,1/1,3/4,1/1; supercedes 110
      BuildItem({ tag:111, count:1, name:'Pickaxe', cost:15, totalCost:42, priorWork:4, enchants:[{ name:'Efficiency', level:2 }, { name:'Fortune', level:3 }, { name:'Unbreaking', level:3 }]}),
      // - = 96+21; worse than 58
      // - = 21+96; worse than 58
      // - = 96+23; worse than 91
      // - = 96+34; worse than 58
      // - = 34+96; worse than 58
      // - = 96+35; worse than 111
      // - = 96+42; worse than 85
      // - = 42+96; worse than 85
      // - = 96+46; worse than 89
      // - = 96+63; worse than 58
      // - = 63+96; worse than 58
      // - = 96+64; worse than 111
      // - = 97+1; worse than 108
      // - = 97+5; worse than 79
      // - = 5+97; worse than 79
      // - = 97+6; worse than 111
      // - = 97+10; worse than 75
      // - = 10+97; worse than 75
      // - = 97+12; worse than 108
      // - = 97+21; worse than 85
      // - = 21+97; worse than 85
      // - = 97+23; worse than 111
      // - = 97+34; worse than 80
      // - = 34+97; worse than 80
      // - = 97+63; worse than 89
      // - = 63+97; worse than 89
      // - = 99+1; worse than 109
      // - = 99+5; worse than 80
      // - = 5+99; worse than 80
      // - = 99+6; worse than 107
      // - = 99+9; worse than 109
      // - = 99+21; worse than 89
      // - = 21+99; worse than 89
      // - = 99+22; worse than 107
      // - = 99+27; worse than 80
      // - = 27+99; worse than 80
      // - = 60+99; worse than 89
      // - = 0+101; worse than 85
      // - = 4+101; worse than 111
      // - = 5+101; worse than 85
      // - = 10+101; worse than 89
      // - = 15+101; worse than 111
      // - = 17+101; worse than 111
      // - = 21+101; worse than 85
      // - = 34+101; worse than 89
      // - = 49+101; worse than 111
      // - = 51+101; worse than 111
      // - = 63+101; worse than 89
      // - = 90+101; worse than 111
      // - = 102+13; worse than 89
      // - = 102+28; worse than 89
      // - = 102+56; worse than 89
      // - = 56+102; worse than 89
      // - = 102+61; worse than 89
      // - = 0+103; worse than 89
      // - = 4+103; worse than 107
      // - = 5+103; worse than 89
      // - = 7+103; worse than 89
      // - = 15+103; worse than 107
      // - = 16+103; worse than 107
      // - = 21+103; worse than 89
      // - = 27+103; worse than 89
      // - = 49+103; worse than 107
      // - = 50+103; worse than 107
      // - = 52+103; worse than 107
      // - = 60+103; worse than 89
      // - = 106+1; worse than 104
      // - = 106+6; worse than 104
      // - = 106+12; worse than 89
      // - = 106+15; worse than 104
      // - = 15+106; worse than 104
      // - = 106+23; worse than 89
      // - = 106+49; worse than 104
      // - = 49+106; worse than 104
      // - = 106+51; worse than 89
      // - = 51+106; worse than 89
      // - = 108+1; worse than 111
      // - = 108+5; worse than 85
      // - = 108+6; worse than 111
      // - = 108+10; worse than 80
      // - = 10+108; worse than 80
      // - = 108+12; worse than 111
      // - = 108+21; worse than 85
      // - = 108+23; worse than 111
      // - = 109+1; worse than 107
      // - = 109+5; worse than 89
      // - = 109+6; worse than 107
      // - = 109+9; worse than 107
      // - = 109+21; worse than 89
      // - = 109+22; worse than 107
      // - = 111+10; worse than 89
    ]

    TestCombineResult(jazil, sourceItems, true, desiredItem, expectedItems)
  },

})
