jazil.AddTestSet(mainPage, 'DataStreamLoadingOptions', {
  'Loading when nothing set': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let loadingOptions = new DataStreamLoadingOptions()

    jazil.ShouldBe(loadingOptions.inConflict, false, 'Marked in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, '', 'Wrong result returned!')
  },

  'Loading when only local storage set': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('localstorage')

    let loadingOptions = new DataStreamLoadingOptions()

    jazil.ShouldBe(loadingOptions.inConflict, false, 'Marked in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, 'localstorage', 'Wrong result returned!')
  },

  'Loading when only url set': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyAddress('url')

    let loadingOptions = new DataStreamLoadingOptions()

    jazil.ShouldBe(loadingOptions.inConflict, false, 'Marked in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, 'url', 'Wrong result returned!')
  },

  'Loading when local storage and url identical': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetAll('lsAndURL', '', 'lsAndURL')

    let loadingOptions = new DataStreamLoadingOptions()

    jazil.ShouldBe(loadingOptions.inConflict, false, 'Marked in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, 'lsAndURL', 'Wrong result returned!')
  },

  'Loading when local storage and url different': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetAll('localstorage', '', 'url')

    let loadingOptions = new DataStreamLoadingOptions()

    jazil.ShouldBe(loadingOptions.inConflict, true, 'Marked not in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, '', 'Wrong result returned!')
  },

  'Choosing local storage works': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetAll('localstorage', '', 'url')

    let loadingOptions = new DataStreamLoadingOptions()
    loadingOptions.ChooseLocalStorage()

    jazil.ShouldBe(loadingOptions.inConflict, false, 'Marked in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, 'localstorage', 'Wrong result returned!')
    jazil.ShouldBe(dataState.GetAddress(), '', 'Address still set!')
  },

  'Choosing url works': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetAll('localstorage', '', 'url')

    let loadingOptions = new DataStreamLoadingOptions()
    loadingOptions.ChooseURL()

    jazil.ShouldBe(loadingOptions.inConflict, false, 'Marked in conflict!')
    jazil.ShouldBe(loadingOptions.serialized, 'url', 'Wrong result returned!')
    jazil.ShouldBe(dataState.GetAddress(), 'url', 'Address not set anymore!')
  },

})


jazil.AddTestSet(mainPage, 'DataStream', {
  'Store to local storage': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('abc')

    let dataStream = new DataStream(true)
    dataStream.AddSizedInt(255, 8)
    dataStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), '-V')
  },
  'Store to bookmark': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyBookmark('abc')

    let dataStream = new DataStream(true)
    dataStream.AddSizedInt(255, 8)
    dataStream.SaveToBookmarkLink()

    jazil.ShouldBe(dataState.GetBookmark(), '-V')
  },

  'Store misc data': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let dataStream = new DataStream(true)
    dataStream.AddSizedInt(255, 6) // bits 7 & 8 will vanish
    dataStream.AddCount(47)
    dataStream.AddSizedInt(2 + 16, 3) // the 16 in bit 5 will vanish
    dataStream.AddCount(1111)
    dataStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), '-mDKWw_')
  },

  'Store and restore misc data': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let dataStream = new DataStream(true)
    dataStream.AddSizedInt(255, 6)
    dataStream.AddCount(47)
    dataStream.AddSizedInt(2 + 16, 3)
    dataStream.AddCount(1111)
    dataStream.SaveToLocalStorage()

    let loadingOptions = new DataStreamLoadingOptions()
    dataStream = new DataStream(false)
    let loadedOK = dataStream.Load(loadingOptions)

    jazil.ShouldBe(loadedOK, true)
    jazil.ShouldBe(dataStream.GetSizedInt(6), 63)
    jazil.ShouldBe(dataStream.GetCount(), 47)
    jazil.ShouldBe(dataStream.GetSizedInt(3), 2)
    jazil.ShouldBe(dataStream.GetCount(), 1111)
  },

  'Restore from local storage only': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('x')

    let loadingOptions = new DataStreamLoadingOptions()
    let dataStream = new DataStream(false)
    let loadedOK = dataStream.Load(loadingOptions)

    jazil.ShouldBe(loadedOK, true)
    jazil.ShouldBe(dataStream.GetSizedInt(6), 24)
  },

  'Restore from address only': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyAddress('y')

    let loadingOptions = new DataStreamLoadingOptions()
    let dataStream = new DataStream(false)
    let loadedOK = dataStream.Load(loadingOptions)

    jazil.ShouldBe(loadedOK, true)
    jazil.ShouldBe(dataStream.GetSizedInt(6), 25)
  },

  'Restore nothing': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let loadingOptions = new DataStreamLoadingOptions()
    let dataStream = new DataStream(false)
    let loadedOK = dataStream.Load(loadingOptions)

    jazil.ShouldBe(loadedOK, false)
    jazil.ShouldBe(dataStream.GetSizedInt(6), 0)
  },

  'Clear form state for follow-up tests': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()
  },

})
