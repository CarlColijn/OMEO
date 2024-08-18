jazil.AddTestSet(mainPage, 'DataSets', {
  'Correct sets get returned by ID': (jazil) => {
    function TestSet(set, description) {
      jazil.ShouldBe(g_dataSetsByID[set.id], set, `${description} not mapped correctly!`)
    }

    TestSet(g_source, 'g_source')
    TestSet(g_desired, 'g_desired')
    TestSet(g_combined, 'g_combined')
    TestSet(g_extra, 'g_extra')
  },
})
