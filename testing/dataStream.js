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
  'Get just the data': (jazil) => {
    let dataStream = new DataStream(true)
    dataStream.AddSizedInt(255, 8)
    let data = dataStream.GetData()

    jazil.ShouldBe(data, '-V')
  },

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
    dataStream.AddBool(false)
    dataStream.AddCount(47)
    dataStream.AddSizedInt(2 + 16, 3) // the 16 in bit 5 will vanish
    dataStream.AddBool(true)
    dataStream.AddCount(1111)
    dataStream.SaveToLocalStorage()

    jazil.ShouldBe(dataState.GetLocalStorage(), '-fUuBuV')
  },

  'Store and restore misc data': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let dataStream = new DataStream(true)
    dataStream.AddSizedInt(255, 6)
    dataStream.AddBool(false)
    dataStream.AddCount(47)
    dataStream.AddSizedInt(2 + 16, 3)
    dataStream.AddBool(true)
    dataStream.AddCount(1111)
    dataStream.SaveToLocalStorage()

    let loadingOptions = new DataStreamLoadingOptions()
    dataStream = new DataStream(false)
    let loadedOK = dataStream.Load(loadingOptions)

    jazil.ShouldBe(loadedOK, true)
    jazil.ShouldBe(dataStream.GetSizedInt(6), 63)
    jazil.ShouldBe(dataStream.GetBool(), false)
    jazil.ShouldBe(dataStream.GetCount(), 47)
    jazil.ShouldBe(dataStream.GetSizedInt(3), 2)
    jazil.ShouldBe(dataStream.GetBool(), true)
    jazil.ShouldBe(dataStream.GetCount(), 1111)
  },

  'End of data stream signalled': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('q')

    let loadingOptions = new DataStreamLoadingOptions()
    let dataStream = new DataStream(false)
    let loadedOK = dataStream.Load(loadingOptions)

    jazil.ShouldBe(loadedOK, true)
    jazil.ShouldBe(dataStream.GetSizedInt(6), 17, 'Initial data loaded incorrectly!')
    jazil.ShouldBe(dataStream.RetrievalOK(), true, 'Stream not good anymore after initial data!')
    jazil.ShouldBe(dataStream.GetBool(), false, 'Overflow data returned incorrectly!')
    jazil.ShouldBe(dataStream.RetrievalOK(), false, 'Stream still good after overflow!')
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
