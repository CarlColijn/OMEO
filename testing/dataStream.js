jazil.AddTestSet(omeoPage, 'DataStream', {
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
    dataStream.SaveToURL()

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

    let conflictSolver = new DataStreamConflictSolverMock(true)
    dataStream = new DataStream(false)
    jazil.ShouldBe(dataStream.Load(conflictSolver), true)
    jazil.Assert(!conflictSolver.invoked, 'Conflict solver got invoked!')

    jazil.ShouldBe(dataStream.GetSizedInt(6), 63)
    jazil.ShouldBe(dataStream.GetCount(), 47)
    jazil.ShouldBe(dataStream.GetSizedInt(3), 2)
    jazil.ShouldBe(dataStream.GetCount(), 1111)
  },

  'Restore from local storage only': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyLocalStorage('x')

    let conflictSolver = new DataStreamConflictSolverMock(true)
    let dataStream = new DataStream(false)
    jazil.ShouldBe(dataStream.Load(conflictSolver), true)
    jazil.Assert(!conflictSolver.invoked, 'Conflict solver got invoked!')

    jazil.ShouldBe(dataStream.GetSizedInt(6), 24)
  },

  'Restore from address only': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetOnlyAddress('y')

    let conflictSolver = new DataStreamConflictSolverMock(false)
    let dataStream = new DataStream(false)
    jazil.ShouldBe(dataStream.Load(conflictSolver), true)
    jazil.Assert(!conflictSolver.invoked, 'Conflict solver got invoked!')

    jazil.ShouldBe(dataStream.GetSizedInt(6), 25)
  },
  'Restore from URL before local storage': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetAll('q', 'r', 's')

    let conflictSolver = new DataStreamConflictSolverMock(false)
    let dataStream = new DataStream(false)
    jazil.ShouldBe(dataStream.Load(conflictSolver), true)
    jazil.Assert(conflictSolver.invoked, 'Conflict solver didn\'t get invoked!')

    jazil.ShouldBe(dataStream.GetSizedInt(6), 19)
  },
  'Restore from local storage before URL': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.SetAll('e', 'f', 'g')

    let conflictSolver = new DataStreamConflictSolverMock(true)
    let dataStream = new DataStream(false)
    jazil.ShouldBe(dataStream.Load(conflictSolver), true)
    jazil.Assert(conflictSolver.invoked, 'Conflict solver didn\'t get invoked!')

    jazil.ShouldBe(dataStream.GetSizedInt(6), 5)
  },

  'Restore nothing': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()

    let conflictSolver = new DataStreamConflictSolverMock(true)
    let dataStream = new DataStream(false)
    jazil.ShouldBe(dataStream.Load(conflictSolver), false)
    jazil.Assert(!conflictSolver.invoked, 'Conflict solver got invoked!')

    jazil.ShouldBe(dataStream.GetSizedInt(6), 0)
  },

  'Clear form state for follow-up tests': (jazil) => {
    let dataState = new DataStateController(jazil)
    dataState.Reset()
  },

})
