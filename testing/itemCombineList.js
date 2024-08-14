/*
  Note: ItemCombineList doesn't do anything with the objects it
  manages for us, except for calling its .Hash().  We make good
  use of that by not even setting up proper items but test with
  some mocks instead.
*/


class ItemMock {
  constructor(type, desc) {
    this.type = type
    this.desc = desc
  }


  HashType() {
    return this.type
  }
}


function NeverInserter(previousItem, newItem) {
  return -1
}


function AlwaysInserter(previousItem, newItem) {
  return 0
}


function AlwaysReplacer(previousItem, newItem) {
  return +1
}


function TestIteration(jazil, itemList, shouldHaveItems, item1, item2, currentProgress, maxProgress) {
  let items = {}
  jazil.ShouldBe(itemList.GetNextItems(items), shouldHaveItems, `#${currentProgress}: got items!`)
  if (shouldHaveItems) {
    jazil.ShouldBe(items.item1.desc, item1.desc, `#${currentProgress}: wrong item1!`)
    jazil.ShouldBe(items.item2.desc, item2.desc, `#${currentProgress}: wrong item2!`)
  }
  jazil.ShouldBe(itemList.GetCurrentProgress(), currentProgress, `#${currentProgress}: wrong Current!`)
  jazil.ShouldBe(itemList.GetMaxProgress(), maxProgress, `#${currentProgress}: wrong Max!`)
}


function TestResult(jazil, itemList, desiredItems) {
  actualItems = itemList.GetCombinedItems()
  jazil.ShouldBe(actualItems.length, desiredItems.length, 'Unequal number of desired vs. actual items!')
  for (let itemNr = 0; itemNr < actualItems.length; ++itemNr)
    jazil.ShouldBe(actualItems[itemNr].desc, desiredItems[itemNr].desc, `Wrong item returned at index ${itemNr}!`)
}


jazil.AddTestSet(omeoPage, 'ItemCombineList', {
  'No items given': (jazil) => {
    let itemList = new ItemCombineList([])

    TestIteration(jazil, itemList, false, undefined, undefined, 0, 0)
    TestResult(jazil, itemList, [])
  },

  'One item given': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let itemList = new ItemCombineList([mock1])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 1)
    TestIteration(jazil, itemList, false, undefined, undefined, 1, 1)
    TestResult(jazil, itemList, [])
  },

  'Two items given': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let mock2 = new ItemMock(2, '2')
    let itemList = new ItemCombineList([mock1, mock2])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 3)
    TestIteration(jazil, itemList, true, mock2, mock1, 2, 3)
    TestIteration(jazil, itemList, true, mock2, mock2, 3, 3)
    TestIteration(jazil, itemList, false, undefined, undefined, 3, 3)
    TestResult(jazil, itemList, [])
  },

  'Three items given': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let mock2 = new ItemMock(2, '2')
    let mock3 = new ItemMock(3, '3')
    let itemList = new ItemCombineList([mock1, mock2, mock3])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 6)
    TestIteration(jazil, itemList, true, mock2, mock1, 2, 6)
    TestIteration(jazil, itemList, true, mock2, mock2, 3, 6)
    TestIteration(jazil, itemList, true, mock3, mock1, 4, 6)
    TestIteration(jazil, itemList, true, mock3, mock2, 5, 6)
    TestIteration(jazil, itemList, true, mock3, mock3, 6, 6)
    TestIteration(jazil, itemList, false, undefined, undefined, 6, 6)
    TestResult(jazil, itemList, [])
  },

  'Adding non-interesting items mid-way': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let mock1x = new ItemMock(1, '1-')
    let mock2 = new ItemMock(2, '2')
    let mock2x = new ItemMock(2, '2-')
    let mock3 = new ItemMock(3, '3')
    let itemList = new ItemCombineList([mock1, mock2, mock3])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 6)
    TestIteration(jazil, itemList, true, mock2, mock1, 2, 6)
    itemList.ProcessItem(mock2x, NeverInserter)
    TestIteration(jazil, itemList, true, mock2, mock2, 3, 6)
    TestIteration(jazil, itemList, true, mock3, mock1, 4, 6)
    TestIteration(jazil, itemList, true, mock3, mock2, 5, 6)
    itemList.ProcessItem(mock1x, NeverInserter)
    TestIteration(jazil, itemList, true, mock3, mock3, 6, 6)
    TestIteration(jazil, itemList, false, undefined, undefined, 6, 6)
    TestResult(jazil, itemList, [])
  },

  'Adding extra items mid-way': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let mock2 = new ItemMock(2, '2')
    let mock2p = new ItemMock(2, '2+')
    let mock3 = new ItemMock(3, '3')
    let mock4 = new ItemMock(4, '4+')
    let mock5 = new ItemMock(5, '5+')
    let itemList = new ItemCombineList([mock1, mock2, mock3])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 6)
    TestIteration(jazil, itemList, true, mock2, mock1, 2, 6)
    TestIteration(jazil, itemList, true, mock2, mock2, 3, 6)
    TestIteration(jazil, itemList, true, mock3, mock1, 4, 6)
    TestIteration(jazil, itemList, true, mock3, mock2, 5, 6)
    itemList.ProcessItem(mock4, AlwaysInserter)
    TestIteration(jazil, itemList, true, mock3, mock3, 6, 10)
    TestIteration(jazil, itemList, true, mock4, mock1, 7, 10)
    TestIteration(jazil, itemList, true, mock4, mock2, 8, 10)
    itemList.ProcessItem(mock5, AlwaysInserter)
    TestIteration(jazil, itemList, true, mock4, mock3, 9, 15)
    TestIteration(jazil, itemList, true, mock4, mock4, 10, 15)
    TestIteration(jazil, itemList, true, mock5, mock1, 11, 15)
    itemList.ProcessItem(mock2p, AlwaysInserter)
    TestIteration(jazil, itemList, true, mock5, mock2, 12, 21)
    TestIteration(jazil, itemList, true, mock5, mock3, 13, 21)
    TestIteration(jazil, itemList, true, mock5, mock4, 14, 21)
    TestIteration(jazil, itemList, true, mock5, mock5, 15, 21)
    TestIteration(jazil, itemList, true, mock2p, mock1, 16, 21)
    TestIteration(jazil, itemList, true, mock2p, mock2, 17, 21)
    TestIteration(jazil, itemList, true, mock2p, mock3, 18, 21)
    TestIteration(jazil, itemList, true, mock2p, mock4, 19, 21)
    TestIteration(jazil, itemList, true, mock2p, mock5, 20, 21)
    TestIteration(jazil, itemList, true, mock2p, mock2p, 21, 21)
    TestIteration(jazil, itemList, false, undefined, undefined, 21, 21)
    TestResult(jazil, itemList, [mock4, mock5, mock2p])
  },

  'Replacing items mid-way': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let mock2 = new ItemMock(2, '2')
    let mock2r = new ItemMock(2, '2r')
    let mock3 = new ItemMock(3, '3')
    let mock3r = new ItemMock(3, '3r')
    let itemList = new ItemCombineList([mock1, mock2, mock3])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 6)
    TestIteration(jazil, itemList, true, mock2, mock1, 2, 6)
    TestIteration(jazil, itemList, true, mock2, mock2, 3, 6)
    TestIteration(jazil, itemList, true, mock3, mock1, 4, 6)
    itemList.ProcessItem(mock3r, AlwaysReplacer)
    // 5's mock3+... is gone
    // 6's mock3+... is gone
    TestIteration(jazil, itemList, true, mock3r, mock1, 4, 6)
    TestIteration(jazil, itemList, true, mock3r, mock2, 5, 6)
    // 9's ...+mock3 is gone
    TestIteration(jazil, itemList, true, mock3r, mock3r, 6, 6)
    itemList.ProcessItem(mock2r, AlwaysReplacer)
    TestIteration(jazil, itemList, true, mock2r, mock1, 4, 6)
    // 12's ...+mock2 is gone
    // 13's ...+mock3 is gone
    TestIteration(jazil, itemList, true, mock2r, mock3r, 5, 6)
    TestIteration(jazil, itemList, true, mock2r, mock2r, 6, 6)
    TestIteration(jazil, itemList, false, undefined, undefined, 6, 6)
    TestResult(jazil, itemList, [mock3r, mock2r])
  },

  'Replacing already replaced items': (jazil) => {
    let mock1 = new ItemMock(1, '1')
    let mock2 = new ItemMock(2, '2')
    let mock3 = new ItemMock(3, '3')
    let mock2r = new ItemMock(2, '2r')
    let mock2rr = new ItemMock(2, '2rr')
    let mock4 = new ItemMock(4, '4')
    let mock4r = new ItemMock(4, '4r')
    let itemList = new ItemCombineList([mock1, mock2, mock3])

    TestIteration(jazil, itemList, true, mock1, mock1, 1, 6)
    TestIteration(jazil, itemList, true, mock2, mock1, 2, 6)
    TestIteration(jazil, itemList, true, mock2, mock2, 3, 6)
    TestIteration(jazil, itemList, true, mock3, mock1, 4, 6)
    itemList.ProcessItem(mock2r, AlwaysReplacer)
    // 5's ...+mock2 is gone
    TestIteration(jazil, itemList, true, mock3, mock3, 3, 6)
    TestIteration(jazil, itemList, true, mock2r, mock1, 4, 6)
    // 8's ...+mock2 is gone
    TestIteration(jazil, itemList, true, mock2r, mock3, 5, 6)
    itemList.ProcessItem(mock2rr, AlwaysReplacer)
    // 10's mock2r+mock2r is gone
    TestIteration(jazil, itemList, true, mock2rr, mock1, 4, 6)
    // 12's ...+mock2 is gone
    TestIteration(jazil, itemList, true, mock2rr, mock3, 5, 6)
    itemList.ProcessItem(mock4, AlwaysInserter)
    // 14's ...+mock2r is gone
    TestIteration(jazil, itemList, true, mock2rr, mock2rr, 6, 10)
    TestIteration(jazil, itemList, true, mock4, mock1, 7, 10)
    itemList.ProcessItem(mock4r, AlwaysReplacer)
    // 17-21's mock4+... is gone
    TestIteration(jazil, itemList, true, mock4r, mock1, 7, 10)
    // 23's ...+mock2 is gone
    TestIteration(jazil, itemList, true, mock4r, mock3, 8, 10)
    // 25's ...+mock2r is gone
    TestIteration(jazil, itemList, true, mock4r, mock2rr, 9, 10)
    // 27's ...+mock4 is gone
    TestIteration(jazil, itemList, true, mock4r, mock4r, 10, 10)
    TestIteration(jazil, itemList, false, undefined, undefined, 10, 10)
    TestResult(jazil, itemList, [mock2rr, mock4r])
  },

})
