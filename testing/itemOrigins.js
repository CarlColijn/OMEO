// creates a list of 3 items;
// nr 0: 3x pick
// nr 1: 4x book1
// nr 2: 5x book2
function CreateZeroOrigin(jazil) {
  let items = [
    BuildItem({ name:'Pickaxe', nr:0, count:3, priorWork:6 }),
    BuildItem({ name:'Book', nr:1, count:4, priorWork:7 }),
    BuildItem({ name:'Book', nr:2, count:5, priorWork:8 })
  ]
  return new ZeroOrigin(items)
}


function TestUses(jazil, origin, combineDescription, expected0, expected1, expected2) {
  jazil.ShouldBe(origin.itemUses[0], expected0, `${combineDescription}/0`)
  jazil.ShouldBe(origin.itemUses[1], expected1, `${combineDescription}/1`)
  jazil.ShouldBe(origin.itemUses[2], expected2, `${combineDescription}/2`)
}


function CombineAndTestUses(jazil, origin1, origin2, combineDescription, expected0, expected1, expected2) {
  let combinedOrigin = origin1.Combine(origin2)
  TestUses(jazil, combinedOrigin, combineDescription, expected0, expected1, expected2)
  return combinedOrigin
}


jazil.AddTestSet(omeoPage, 'ItemOrigins', {
  'ZeroOrigin can be created': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)

    jazil.ShouldNotBe(zeroOrigin, undefined)
  },

  'ZeroOrigin can be cloned': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    let clonedOrigin = zeroOrigin.CreateOrigin()

    jazil.ShouldNotBe(clonedOrigin, undefined)
  },

  'ItemOrigin can be created': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    let item0Origin = zeroOrigin.CreateOrigin(0)
    let item1Origin = zeroOrigin.CreateOrigin(1)
    let item2Origin = zeroOrigin.CreateOrigin(2)

    jazil.ShouldNotBe(item0Origin, undefined, 'item 0')
    jazil.ShouldNotBe(item1Origin, undefined, 'item 1')
    jazil.ShouldNotBe(item2Origin, undefined, 'item 2')
  },

  'ItemOrigin throws for illegal item nr': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    jazil.ShouldThrow(
      () => {
        let item3Origin = zeroOrigin.CreateOrigin(3)
        jazil.ShouldBe(item3Origin, undefined, 'item 3')
      }
    )
  },

  'ItemOrigin\'s itemUses is correct': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    let item0Origin = zeroOrigin.CreateOrigin(0)
    let item1Origin = zeroOrigin.CreateOrigin(1)
    let item2Origin = zeroOrigin.CreateOrigin(2)

    TestUses(jazil, item0Origin, 'item0', 1, 0, 0)
    TestUses(jazil, item1Origin, 'item1', 0, 1, 0)
    TestUses(jazil, item2Origin, 'item1', 0, 0, 1)
  },

  'ItemOrigins can be combined': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    let item0Origin = zeroOrigin.CreateOrigin(0)
    let item1Origin = zeroOrigin.CreateOrigin(1)
    let item2Origin = zeroOrigin.CreateOrigin(2)

    let item01Origin = CombineAndTestUses(jazil, item0Origin, item1Origin, 'item0 + item1', 1, 1, 0)
    let item00Origin = CombineAndTestUses(jazil, item0Origin, item0Origin, 'item0 + item0', 2, 0, 0)
    let item012Origin = CombineAndTestUses(jazil, item01Origin, item2Origin, 'item0+1 + item2', 1, 1, 1)
  },

  'Derived ItemOrigins can be combined': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    let item0Origin = zeroOrigin.CreateOrigin(0)
    let item1Origin = zeroOrigin.CreateOrigin(1)
    let item2Origin = zeroOrigin.CreateOrigin(2)
    let item01221Origin = item1Origin.Combine(item0Origin).Combine(item2Origin).Combine(item2Origin).Combine(item1Origin)

    TestUses(jazil, item01221Origin, 'item1 + item0 + item2 + item2 + item1', 1, 2, 2)
  },

  'ItemOrigin tells correct max combine count': (jazil) => {
    let zeroOrigin = CreateZeroOrigin(jazil)
    // 1x item0 out of 3x
    let item0Origin = zeroOrigin.CreateOrigin(0)
    // 1x item1 out of 4x
    let item1Origin = zeroOrigin.CreateOrigin(1)
    // 1x item2 out of 5x
    let item2Origin = zeroOrigin.CreateOrigin(2)
    // 1x item0 out of 3x, 1x item2 out of 5x
    let item02Origin = item0Origin.Combine(item2Origin)
    // 2x item0 out of 3x, 2x item2 out of 5x
    let item0022Origin = item02Origin.Combine(item02Origin)

    // 1/3,0/4,0/5 + 0/3,1/4,0/5 = 1/3,1/4,0/5; limited by 0, 3x max
    jazil.ShouldBe(item0Origin.DetermineMaxCombineCount(item1Origin), 3, 'item0 vs item1')
    jazil.ShouldBe(item1Origin.DetermineMaxCombineCount(item0Origin), 3, 'item1 vs item0')
    // 0/3,1/4,0/5 + 0/3,0/4,1/5 = 0/3,1/4,1/5; limited by 1, 4x max
    jazil.ShouldBe(item1Origin.DetermineMaxCombineCount(item2Origin), 4, 'item1 vs item2')
    // 1/3,0/4,1/5 + 1/3,0/4,0/5 = 2/3,0/4,1/5; limited by 0, 1x max
    jazil.ShouldBe(item02Origin.DetermineMaxCombineCount(item0Origin), 1, 'item0+2 vs item0')
    // 1/3,0/4,1/5 + 0/3,1/4,0/5 = 1/3,1/4,1/5; limited by 0, 3x max
    jazil.ShouldBe(item02Origin.DetermineMaxCombineCount(item1Origin), 3, 'item0+2 vs item1')
    // 1/3,0/4,1/5 + 0/3,0/4,1/5 = 1/3,0/4,2/5; limited by 2, 2x max
    jazil.ShouldBe(item02Origin.DetermineMaxCombineCount(item2Origin), 2, 'item0+2 vs item2')
    // 1/3,0/4,1/5 + 1/3,0/4,1/5 = 2/3,0/4,2/5; limited by 0, 1x max
    jazil.ShouldBe(item02Origin.DetermineMaxCombineCount(item02Origin), 1, 'item0+2 vs item0+2')
    // 2/3,0/4,2/5 + 1/3,0/4,0/5 = 3/3,0/4,2/5; limited by 0, 1x max
    jazil.ShouldBe(item0022Origin.DetermineMaxCombineCount(item0Origin), 1, 'item0+0+2+2 vs item0')
    // 2/3,0/4,2/5 + 0/3,1/4,0/5 = 2/3,1/4,2/5; limited by 0, 1x max
    jazil.ShouldBe(item0022Origin.DetermineMaxCombineCount(item1Origin), 1, 'item0+0+2+2 vs item1')
    // 2/3,0/4,2/5 + 0/3,0/4,1/5 = 2/3,0/4,3/5; limited by 0 and 2, 1x max
    jazil.ShouldBe(item0022Origin.DetermineMaxCombineCount(item2Origin), 1, 'item0+0+2+2 vs item2')
  },

})
