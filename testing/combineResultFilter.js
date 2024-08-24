// Passed in options should be: {
//   desiredItem: Item,
//   sourceItems: Item[],
//   combinedItems: Item[],
//   numResultItems: int (default:1e9),
//   groups: {
//     expectedTags: string[],
//     hasSource: bool,
//   }[4] // index equal to the g_xxxMatch constants
// }
function CheckItemFilterResultOK(jazil, options) {
  let filter = new CombineResultFilter(options.desiredItem)
  let ratedItemGroups = filter.FilterItems(options.sourceItems, options.combinedItems, options.numResultItems ?? 1e9)

  options.groups.forEach((ownGroup, match) => {
    let groupDescription = DescribeRatedItemGroup(match)

    let ratedItemGroup = ratedItemGroups[match]
    jazil.ShouldBe(ratedItemGroup.ratedItems.length, ownGroup.expectedTags.length, `wrong number of items returned in ${groupDescription} group!`)
    jazil.ShouldBe(ratedItemGroup.hasSources, ownGroup.hasSources, `wrong hasSources returned in ${groupDescription} group!`)

    ownGroup.expectedTags.forEach((expectedTag, itemNr) => {
      jazil.ShouldBe(ratedItemGroup.ratedItems[itemNr].item.tag, expectedTag, `wrong item #${itemNr} got returned in ${groupDescription} group!`)
    })
  })
}




jazil.AddTestSet(mainPage, 'CombineResultFilter', {
  'No items gives no result': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:
        undefined,
      sourceItems:[
      ],
      combinedItems:[
      ],
      groups:[
        { expectedTags:[], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Only non-matching plain items gives no result': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:
        BuildItem({ set:g_desired, name:'Helmet' }),
      sourceItems:[
        BuildItem({ set:g_extra, tag:1, name:'Sword' }),
        BuildItem({ set:g_source, tag:2, name:'Axe' }),
      ],
      combinedItems:[
        BuildItem({ set:g_combined, tag:3, name:'Book' }),
        BuildItem({ set:g_combined, tag:4, name:'Chestplate' }),
      ],
      groups:[
        { expectedTags:[], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Only non-matching enchanted items gives no result': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:
        BuildItem({ set:g_desired, name:'Axe', enchants:[{ name:'Efficiency' }] }),
      sourceItems:[
        BuildItem({ set:g_extra, tag:1, name:'Sword', enchants:[{ name:'Smite', level:2 }, { name:'Mending' }] }),
        BuildItem({ set:g_source, tag:2, name:'Book', enchants:[{ name:'Aqua Affinity' }] }),
      ],
      combinedItems:[
        BuildItem({ set:g_combined, tag:3, name:'Helmet', enchants:[{ name:'Unbreaking', level:3 }] }),
        BuildItem({ set:g_combined, tag:4, name:'Chestplate', enchants:[{ name:'Protection', level:3 }] }),
      ],
      groups:[
        { expectedTags:[], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Items correctly grouped': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:
        BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
      sourceItems:[
      ],
      combinedItems:[
        BuildItem({ set:g_combined, tag:1, name:'Helmet', enchants:[{ name:'Protection', level:1 }] }),
        BuildItem({ set:g_combined, tag:2, name:'Helmet', enchants:[{ name:'Protection', level:2 }] }),
        BuildItem({ set:g_combined, tag:3, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
        BuildItem({ set:g_combined, tag:4, name:'Helmet', enchants:[{ name:'Protection', level:4 }] }),
        BuildItem({ set:g_combined, tag:5, name:'Helmet', enchants:[{ name:'Protection', level:1 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:6, name:'Helmet', enchants:[{ name:'Protection', level:2 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:7, name:'Helmet', enchants:[{ name:'Protection', level:3 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:8, name:'Helmet', enchants:[{ name:'Protection', level:4 }, { name:'Mending' }] }),
      ],
      groups:[
        { expectedTags:[3], hasSources:false }, // exacts
        { expectedTags:[8,7,4], hasSources:false }, // betters
        { expectedTags:[2,1], hasSources:false }, // lessers
        { expectedTags:[6,5], hasSources:false } // mixeds
      ]
    })
  },

  'Extra items filtered out': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:
        BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
      sourceItems:[
        BuildItem({ set:g_combined, tag:1, name:'Helmet', enchants:[{ name:'Protection', level:1 }] }),
        BuildItem({ set:g_combined, tag:2, name:'Helmet', enchants:[{ name:'Protection', level:2 }] }),
        BuildItem({ set:g_extra, tag:3, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
        BuildItem({ set:g_combined, tag:4, name:'Helmet', enchants:[{ name:'Protection', level:4 }] }),
        BuildItem({ set:g_extra, tag:5, name:'Helmet', enchants:[{ name:'Protection', level:1 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:6, name:'Helmet', enchants:[{ name:'Protection', level:2 }, { name:'Mending' }] }),
        BuildItem({ set:g_extra, tag:7, name:'Helmet', enchants:[{ name:'Protection', level:3 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:8, name:'Helmet', enchants:[{ name:'Protection', level:4 }, { name:'Mending' }] }),
      ],
      combinedItems:[
      ],
      groups:[
        { expectedTags:[], hasSources:false }, // exacts
        { expectedTags:[8,4], hasSources:false }, // betters
        { expectedTags:[2,1], hasSources:false }, // lessers
        { expectedTags:[6], hasSources:false } // mixeds
      ]
    })
  },

  'Source items detected OK': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:
        BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
      sourceItems:[
        BuildItem({ set:g_source, tag:1, name:'Helmet', enchants:[{ name:'Protection', level:1 }] }),
        BuildItem({ set:g_combined, tag:2, name:'Helmet', enchants:[{ name:'Protection', level:2 }] }),
        BuildItem({ set:g_source, tag:3, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
        BuildItem({ set:g_source, tag:4, name:'Helmet', enchants:[{ name:'Protection', level:4 }] }),
        BuildItem({ set:g_source, tag:5, name:'Helmet', enchants:[{ name:'Protection', level:1 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:6, name:'Helmet', enchants:[{ name:'Protection', level:2 }, { name:'Mending' }] }),
        BuildItem({ set:g_source, tag:7, name:'Helmet', enchants:[{ name:'Protection', level:3 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:8, name:'Helmet', enchants:[{ name:'Protection', level:4 }, { name:'Mending' }] }),
      ],
      combinedItems:[
      ],
      groups:[
        { expectedTags:[3], hasSources:true }, // exacts
        { expectedTags:[8,7,4], hasSources:true }, // betters
        { expectedTags:[2,1], hasSources:true }, // lessers
        { expectedTags:[6,5], hasSources:true } // mixeds
      ]
    })
  },

  'Only first of matching identical plain items returned': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, name:'Axe' }),
      sourceItems:[],
      combinedItems:[
        BuildItem({ set:g_combined, tag:1, name:'Book' }),
        BuildItem({ set:g_combined, tag:2, name:'Axe' }),
        BuildItem({ set:g_combined, tag:3, name:'Helmet' }),
        BuildItem({ set:g_combined, tag:4, name:'Axe' }),
      ],
      groups:[
        { expectedTags:[2], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Only first of matching identical enchanted items returned': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Unbreaking', level:3 }] }),
      sourceItems:[],
      combinedItems:[
        BuildItem({ set:g_combined, tag:1, name:'Helmet', enchants:[{ name:'Unbreaking', level:3 }] }),
        BuildItem({ set:g_combined, tag:2, name:'Book' }),
        BuildItem({ set:g_combined, tag:3, name:'Axe' }),
        BuildItem({ set:g_combined, tag:4, name:'Helmet', enchants:[{ name:'Unbreaking', level:3 }] }),
      ],
      groups:[
        { expectedTags:[1], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Correct lowest selection of mixed prior work and total cost': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, tag:0, name:'Helmet' }),
      sourceItems:[],
      combinedItems:[
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
      groups:[
        { expectedTags:[3,10,6], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Sorting OK for enchant level': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
      sourceItems:[],
      combinedItems:[
        BuildItem({ set:g_combined, tag:1, name:'Helmet', enchants:[{ name:'Protection', level:2 }] }),
        BuildItem({ set:g_combined, tag:2, name:'Helmet', enchants:[{ name:'Protection', level:0 }] }),
        BuildItem({ set:g_combined, tag:3, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
        BuildItem({ set:g_combined, tag:4, name:'Helmet', enchants:[{ name:'Protection', level:5 }] }),
        BuildItem({ set:g_combined, tag:5, name:'Helmet', enchants:[{ name:'Protection', level:1 }] }),
        BuildItem({ set:g_combined, tag:6, name:'Helmet', enchants:[{ name:'Protection', level:4 }] }),
      ],
      groups:[
        { expectedTags:[3], hasSources:false }, // exacts
        { expectedTags:[4,6], hasSources:false }, // betters
        { expectedTags:[1,5,2], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Sorting OK for prior work': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, tag:0, name:'Helmet' }),
      sourceItems:[],
      combinedItems:[
        // Note: we need to also give a reverse-sorted totalCost, otherwise the filter
        // will just deduplicate the options and give the lowest priorWork one.
        // We keep the totalCost extremely low though to not interfere with the sorting.
        BuildItem({ set:g_combined, tag:1, name:'Helmet', priorWork:2, totalCost:4e-9 }),
        BuildItem({ set:g_combined, tag:2, name:'Helmet', priorWork:1, totalCost:5e-9 }),
        BuildItem({ set:g_combined, tag:3, name:'Helmet', priorWork:5, totalCost:1e-9 }),
        BuildItem({ set:g_combined, tag:4, name:'Helmet', priorWork:3, totalCost:3e-9 }),
        BuildItem({ set:g_combined, tag:5, name:'Helmet', priorWork:4, totalCost:2e-9 }),
        BuildItem({ set:g_combined, tag:6, name:'Helmet', priorWork:0, totalCost:6e-9 }),
      ],
      groups:[
        { expectedTags:[6,2,1,4,5,3], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Sorting OK for total cost': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, tag:0, name:'Helmet' }),
      sourceItems:[],
      combinedItems:[
        // Note: we need to also give a reverse-sorted priorWork, otherwise the filter
        // will just deduplicate the options and give the lowest totalCost one.
        // We keep the priorWork extremely low though to not interfere with the sorting.
        BuildItem({ set:g_combined, tag:1, name:'Helmet', priorWork:2e-9, totalCost:22 }),
        BuildItem({ set:g_combined, tag:2, name:'Helmet', priorWork:3e-9, totalCost:21 }),
        BuildItem({ set:g_combined, tag:3, name:'Helmet', priorWork:1e-9, totalCost:23 }),
        BuildItem({ set:g_combined, tag:4, name:'Helmet', priorWork:8e-9, totalCost:2  }),
        BuildItem({ set:g_combined, tag:5, name:'Helmet', priorWork:9e-9, totalCost:1  }),
        BuildItem({ set:g_combined, tag:6, name:'Helmet', priorWork:7e-9, totalCost:3  }),
        BuildItem({ set:g_combined, tag:7, name:'Helmet', priorWork:5e-9, totalCost:12 }),
        BuildItem({ set:g_combined, tag:8, name:'Helmet', priorWork:6e-9, totalCost:11 }),
        BuildItem({ set:g_combined, tag:9, name:'Helmet', priorWork:4e-9, totalCost:13 }),
      ],
      groups:[
        { expectedTags:[5,4,6,8,7,9,2,1,3], hasSources:false }, // exacts
        { expectedTags:[], hasSources:false }, // betters
        { expectedTags:[], hasSources:false }, // lessers
        { expectedTags:[], hasSources:false } // mixeds
      ]
    })
  },

  'Result limited to given nr. of entries': (jazil) => {
    CheckItemFilterResultOK(jazil, {
      desiredItem:BuildItem({ set:g_desired, tag:0, name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
      sourceItems:[],
      combinedItems:[
        // lesser
        BuildItem({ set:g_combined, tag:1,  name:'Helmet', enchants:[{ name:'Protection', level:1 }] }),
        BuildItem({ set:g_combined, tag:2,  name:'Helmet', enchants:[{ name:'Protection', level:2 }] }),
        // exact
        BuildItem({ set:g_combined, tag:3,  name:'Helmet', enchants:[{ name:'Protection', level:3 }] }),
        // better
        BuildItem({ set:g_combined, tag:4,  name:'Helmet', enchants:[{ name:'Protection', level:4 }] }),
        BuildItem({ set:g_combined, tag:5,  name:'Helmet', enchants:[{ name:'Protection', level:5 }] }),
        // mixed
        BuildItem({ set:g_combined, tag:6,  name:'Helmet', enchants:[{ name:'Protection', level:1 }, { name:'Mending' }] }),
        BuildItem({ set:g_combined, tag:7,  name:'Helmet', enchants:[{ name:'Protection', level:2 }, { name:'Mending' }] }),
      ],
      numResultItems:1,
      groups:[
        { expectedTags:[3], hasSources:false }, // exacts
        { expectedTags:[5], hasSources:false }, // betters
        { expectedTags:[2], hasSources:false }, // lessers
        { expectedTags:[7], hasSources:false } // mixeds
      ]
    })
  },

})
