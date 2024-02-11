jazil.AddTestSet(omeoPage, 'ItemNrGenerator', {
  'Start at 1 when no sources': (jazil) => {
    let generator = new ItemNrGenerator([])

    jazil.ShouldBe(generator.Next(), 1)
  },

  'Series increases nicely': (jazil) => {
    let generator = new ItemNrGenerator([])

    for (let expectedNr = 1; expectedNr < 10; ++expectedNr)
      jazil.ShouldBe(generator.Next(), expectedNr)
  },

  'Series starts after sources - simple': (jazil) => {
    let generator = new ItemNrGenerator([
      BuildItem({ name:'Pickaxe', nr:1}),
    ])

    jazil.ShouldBe(generator.Next(), 2)
  },

  'Series starts after sources - complex': (jazil) => {
    let generator = new ItemNrGenerator([
      BuildItem({ name:'Pickaxe', nr:4}),
      BuildItem({ name:'Pickaxe', nr:2}),
      BuildItem({ name:'Pickaxe', nr:7}),
      BuildItem({ name:'Pickaxe', nr:3}),
    ])

    jazil.ShouldBe(generator.Next(), 8)
  },

})
