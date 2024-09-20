function GetStripElementJQ() {
  return $('#buttonStrip')
}


function SetUpButtonStrip(cleanFirst=true) {
  let stripElemJQ = GetStripElementJQ()
  if (cleanFirst)
    stripElemJQ.empty()
  return new ButtonStrip(stripElemJQ)
}




jazil.AddTestSet(mainPage, 'ButtonStrip', {
  'Uninitialized strip has no physical content': (jazil) => {
    let strip = SetUpButtonStrip()
    jazil.ShouldBe(GetStripElementJQ().children().length, 0)
  },

  'Uninitialized strip has no selection': (jazil) => {
    let strip = SetUpButtonStrip()
    jazil.ShouldBe(strip.GetSelectionNr(), undefined)
  },

  'Uninitialized strip cannot set selection': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetSelectionNr(3)
    jazil.ShouldBe(strip.GetSelectionNr(), undefined)
  },

  'Uninitialized strip with selection still has no content': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetSelectionNr(3)
    jazil.ShouldBe(GetStripElementJQ().children().length, 0)
  },

  'Initialized strip has physical content': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['a', 'b', 'c'], 1)
    jazil.ShouldNotBe(GetStripElementJQ().children().length, 0)
  },

  'Initialized strip without preselected selection has no selection': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['d', 'e', 'f'], undefined)
    jazil.ShouldBe(strip.GetSelectionNr(), undefined)
  },

  'Initialized strip with preselected selection has that selection': (jazil) => {
    for (let selectionNr = 0; selectionNr < 3; ++selectionNr) {
      let strip = SetUpButtonStrip()
      strip.SetOptions(['g', 'h', 'i'], selectionNr)
      jazil.ShouldBe(strip.GetSelectionNr(), selectionNr, `wrong preselect for ${selectionNr}`)
    }
  },

  'Set selection is returned': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['j', 'k', 'l'], undefined)
    for (let selectionNr = 0; selectionNr < 3; ++selectionNr) {
      strip.SetSelectionNr(selectionNr)
      jazil.ShouldBe(strip.GetSelectionNr(), selectionNr, `wrong result for ${selectionNr}`)
    }
  },

  'Initialized strip with invalid preselected selection has no selection': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['m', 'n', 'o'], -3)
    jazil.ShouldBe(strip.GetSelectionNr(), undefined, 'wrong preselect for underflow')

    strip = SetUpButtonStrip()
    strip.SetOptions(['m', 'n', 'o'], 4)
    jazil.ShouldBe(strip.GetSelectionNr(), undefined, 'wrong preselect for overflow')
  },

  'Setting unused selection results in no selection': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['p', 'q', 'r'], 1)
    strip.SetSelectionNr(9)
    jazil.ShouldBe(strip.GetSelectionNr(), undefined, 'wrong result for underflow')
    strip.SetSelectionNr(-4)
    jazil.ShouldBe(strip.GetSelectionNr(), undefined, 'wrong result for overflow')
  },

  'Re-attaching to previously set up options retun those options': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['s', 't', 'u'], 2)
    jazil.ShouldBe(strip.GetSelectionNr(), 2, 'wrong initial result')
    strip = SetUpButtonStrip(false)
    jazil.ShouldBe(strip.GetSelectionNr(), 2, 'wrong re-attached result')
  },

  'Set options get reflected in content': (jazil) => {
    let strip = SetUpButtonStrip()
    strip.SetOptions(['vwxyz', 13579, 1.2345, undefined], undefined)
    let shownText = GetStripElementJQ().text()
    jazil.ShouldBe(shownText.includes('vwxyz'), true, 'text option not found')
    jazil.ShouldBe(shownText.includes('13579'), true, 'integer option not found')
    jazil.ShouldBe(shownText.includes('1.2345'), true, 'float option not found')
    jazil.ShouldBe(shownText.includes('undefined'), true, 'undefined option not found')
  },
})
