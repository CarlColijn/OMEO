/*
  Note: ItemCombineList doesn't do anything with the objects it
  manages for us, except for calling its .Hash().  We make good
  use of that by not even setting up proper items but test with
  some mocks instead.
*/


class ItemMock {
  constructor(nr) {
    this.nr = nr
  }


  Hash() {
    return this.nr
  }
}


function TestIteration(jazil, itemList, iteration, shouldHaveItems, item1, item2, currentProgress, maxProgress) {
  let items = {}
  jazil.ShouldBe(itemList.GetNextItems(items), shouldHaveItems, `#${iteration}: got items!`)
  if (shouldHaveItems) {
    jazil.ShouldBe(items.item1.nr, item1, `#${iteration}: wrong item1!`)
    jazil.ShouldBe(items.item2.nr, item2, `#${iteration}: wrong item2!`)
  }
  jazil.ShouldBe(itemList.GetCurrentProgress(), currentProgress, `#${iteration}: wrong Current!`)
  jazil.ShouldBe(itemList.GetMaxProgress(), maxProgress, `#${iteration}: wrong Max!`)
}


jazil.AddTestSet(omeoPage, 'ItemCombineList', {
  'No items given': (jazil) => {
    let itemList = new ItemCombineList([])

    TestIteration(jazil, itemList, 1, false, 0, 0, 0, 0)
  },

  'One item given': (jazil) => {
    let itemList = new ItemCombineList([new ItemMock(1)])

    TestIteration(jazil, itemList, 1, true, 1, 1, 1, 1)
    TestIteration(jazil, itemList, 2, false, 0, 0, 1, 1)
  },

  'Two items given': (jazil) => {
    let itemList = new ItemCombineList([new ItemMock(1), new ItemMock(2)])

    TestIteration(jazil, itemList, 1, true, 1, 1, 1, 3)
    TestIteration(jazil, itemList, 2, true, 2, 1, 2, 3)
    TestIteration(jazil, itemList, 3, true, 2, 2, 3, 3)
    TestIteration(jazil, itemList, 4, false, 0, 0, 3, 3)
  },

  'Three items given': (jazil) => {
    let itemList = new ItemCombineList([new ItemMock(1), new ItemMock(2), new ItemMock(3)])

    TestIteration(jazil, itemList, 1, true, 1, 1, 1, 6)
    TestIteration(jazil, itemList, 2, true, 2, 1, 2, 6)
    TestIteration(jazil, itemList, 3, true, 2, 2, 3, 6)
    TestIteration(jazil, itemList, 4, true, 3, 1, 4, 6)
    TestIteration(jazil, itemList, 5, true, 3, 2, 5, 6)
    TestIteration(jazil, itemList, 6, true, 3, 3, 6, 6)
    TestIteration(jazil, itemList, 7, false, 0, 0, 6, 6)
  },

  'Adding extra items mid-way': (jazil) => {
    let itemList = new ItemCombineList([new ItemMock(1), new ItemMock(2), new ItemMock(3)])

    TestIteration(jazil, itemList, 1, true, 1, 1, 1, 6)
    TestIteration(jazil, itemList, 2, true, 2, 1, 2, 6)
    TestIteration(jazil, itemList, 3, true, 2, 2, 3, 6)
    TestIteration(jazil, itemList, 4, true, 3, 1, 4, 6)
    TestIteration(jazil, itemList, 5, true, 3, 2, 5, 6)
    itemList.AddCombinedItem(new ItemMock(4))
    TestIteration(jazil, itemList, 6, true, 3, 3, 6, 10)
    TestIteration(jazil, itemList, 7, true, 4, 1, 7, 10)
    TestIteration(jazil, itemList, 8, true, 4, 2, 8, 10)
    itemList.AddCombinedItem(new ItemMock(5))
    TestIteration(jazil, itemList, 9, true, 4, 3, 9, 15)
    TestIteration(jazil, itemList, 10, true, 4, 4, 10, 15)
    TestIteration(jazil, itemList, 11, true, 5, 1, 11, 15)
    TestIteration(jazil, itemList, 12, true, 5, 2, 12, 15)
    TestIteration(jazil, itemList, 13, true, 5, 3, 13, 15)
    TestIteration(jazil, itemList, 14, true, 5, 4, 14, 15)
    TestIteration(jazil, itemList, 15, true, 5, 5, 15, 15)
    TestIteration(jazil, itemList, 16, false, 0, 0, 15, 15)
  },

})
