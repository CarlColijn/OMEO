/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchantSection.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - SourceItemRowTemplate
  - SourceItemRow
    - nr: int
*/


// ======== PUBLIC ========


class SourceItemRowTemplate extends TemplateElement {
  constructor(parentElemJQ, elementClass) {
    super(parentElemJQ, elementClass)

    this.SetupItemOptions()
  }


  // returns SourceItemRow
  CreateNew(nr, item, allRows, giveFocus, focusElemJQWhenAllGone) {
    let newRowElemJQ = super.CreateExtraElement()
    let newItemRow = new SourceItemRow(newRowElemJQ, allRows)

    newItemRow.SetNumber(nr)

    item = newItemRow.EnsureAppropriateItemUsed(item)
    newItemRow.SetItem(item)

    newItemRow.HookUpGUI(item)

    newItemRow.focusElemJQWhenAllGone = focusElemJQWhenAllGone
    if (giveFocus)
      newItemRow.idElemJQ[0].focus()

    return newItemRow
  }


  // ======== PRIVATE ========


  SetupItemOptions() {
    let itemSelectElemJQs = this.elemJQ.find('select[name="itemID"]')
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      itemSelectElemJQs.append(`<option value="${itemInfo.id}">${itemInfo.name}</option>`)
    }
  }
}




class SourceItemRow extends RealElement {
  constructor(rowElemJQ, allRows) {
    super(rowElemJQ)

    // ==== PUBLIC ====
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    this.nrElemJQ = rowElemJQ.find('.nr')
    this.countElemJQ = rowElemJQ.find('input[name="count"]')
    this.iconElemJQ = rowElemJQ.find('.icon')
    this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
    this.priorWorkElem = new ButtonStrip(rowElemJQ.find('.priorWorkInput'))

    this.allRows = allRows

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElemJQ = this.elemJQ.find('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElemJQ, this.elemJQ, EnchantStateChangedHandler)
  }


  Remove() {
    let focusRowElemJQ = this.elemJQ.next()
    if (focusRowElemJQ.length == 0)
      focusRowElemJQ = this.elemJQ.prev()

    let focusElemJQ
    if (focusRowElemJQ.length > 0 && new DOMElement(focusRowElemJQ).IsReal())
      focusElemJQ = focusRowElemJQ.find('button[name="removeItem"]')
    else
      focusElemJQ = this.focusElemJQWhenAllGone

    if (focusElemJQ?.length > 0)
      focusElemJQ[0].focus()

    this.enchantSection.RemoveEnchants()
    super.Remove()

    let nextRowNr = this.nr
    this.allRows.splice(nextRowNr - 1, 1)

    for (; nextRowNr <= this.allRows.length; ++nextRowNr)
      this.allRows[nextRowNr - 1].SetNumber(nextRowNr)
  }


  SetNumber(nr) {
    this.nr = nr
    this.elemJQ.attr('data-nr', nr)
    this.nrElemJQ.text(nr)
  }


  SetCount(newCount) {
    this.countElemJQ.val(newCount)
  }


  // returns object:
  // - item: Item
  // - withCountError: bool
  // - countErrorElemJQ: JQuery-wrapped input element, if applicable
  GetItem() {
    let countResult = this.GetValidatedCount()
    let itemID = parseInt(this.idElemJQ.val())
    let priorWork = this.priorWorkElem.GetSelectionNr()

    let item = new Item(countResult.count, g_source, itemID, priorWork)
    this.enchantSection.AddEnchantsToItem(item)

    item.nr = parseInt(this.elemJQ.attr('data-nr'))

    return {
      item: item,
      withCountError: countResult.inError,
      countErrorElemJQ: countResult.errorElemJQ
    }
  }


  SetItem(item) {
    this.itemID = item.id

    this.countElemJQ.val(item.count)
    this.idElemJQ.val(item.id)
    this.SetupPriorWorkOptions()
    this.priorWorkElem.SetSelectionNr(item.priorWork)

    this.enchantSection.ChangeItem(item)
  }


  // ======== PRIVATE ========


  // returns Item
  SyncCurrentItemWithoutEnchants() {
    this.itemID = parseInt(this.idElemJQ.val())
    return new Item(
      1,
      g_source,
      parseInt(this.itemID),
      0
    )
  }


  SetupPriorWorkOptions() {
    this.priorWorkElem.SetOptions([0,1,2,3,4,5,6], undefined)
  }


  // returns Item
  EnsureAppropriateItemUsed(item) {
    if (item === undefined) {
      item = new Item(
        1,
        g_source,
        parseInt(this.idElemJQ.val()),
        0
      )
    }

    return item
  }


  HookUpGUI(item) {
    this.elemJQ.find('button[name="removeItem"]').click(() => {
      this.Remove()
    })

    this.idElemJQ.change(() => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
  }


  // returns object:
  // - count: int / NaN
  // - inError: bool
  // - errorElemJQ: JQuery-wrapped input element, if applicable
  GetValidatedCount() {
    let count = parseInt(this.countElemJQ.val())
    let inError = isNaN(count)

    return {
      count: count,
      inError: inError,
      errorElemJQ:
        inError ?
        this.countElemJQ :
        undefined
    }
  }
}
