jazil.AddTestSet(omeoPage, 'Enchant', {
  'Enchant is built using correct info': (jazil) => {
    let enchant = BuildEnchant('Blast Protection', 3)

    jazil.ShouldBe(enchant.id, enchant.id, 'Enchant got wrong ID!')
    jazil.ShouldBe(enchant.info, enchant.info, 'Enchant got wrong info linked!')
    jazil.ShouldBe(enchant.id, enchant.info.id, 'Enchant and linked info got different ids!')
    jazil.ShouldBe(enchant.level, 3, 'Enchant got wrong level!')
  },
})
