/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchantInfo.js
  - enchantRow.js
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
    this.enchantRowTemplate = new EnchantRowTemplate(this.elemJQ, 'enchant')
    this.enchantRows = []

    this.nrElemJQ = rowElemJQ.find('.nr')
    this.countElemJQ = rowElemJQ.find('input[name="count"]')
    this.iconElemJQ = rowElemJQ.find('.icon')
    this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
    this.priorWorkElem = new ButtonStrip(rowElemJQ.find('.priorWorkInput'))

    this.allRows = allRows
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


  AddEnchant(enchant, giveFocus) {
    let RemoveEnchantCallback = () => {
      let hasEnchants = this.enchantRowTemplate.ElementsPresent()
      SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
    }

    let enchantRow = this.enchantRowTemplate.CreateNew(enchant, this.itemID, giveFocus, this.addEnchantElemJQ, RemoveEnchantCallback)
    this.enchantRows.push(enchantRow)
  }


  RemoveEnchants() {
    this.enchantRowTemplate.RemoveCreatedElements()
    this.enchantRows.splice(0, Infinity)
  }


  // returns object:
  // - item: Item
  // - withCountError: bool
  // - countErrorElemJQ: JQuery-wrapped input element, if applicable
  // - withEnchantConflict: bool
  // - enchantConflictInfo: {
  //     conflictingEnchantName: string,
  //     inputElemJQ: JQuery-wrapped input element
  //   }
  // - withEnchantDupe: bool
  // - enchantDupeElemJQ: JQuery-wrapped input element, if applicable
  GetItem() {
    let countResult = this.GetValidatedCount()
    let itemID = parseInt(this.idElemJQ.val())
    let priorWork = this.priorWorkElem.GetSelectionNr()

    let item = new Item(countResult.count, g_source, itemID, priorWork)
    let enchantResult = this.AddItemEnchants(item)

    item.nr = parseInt(this.elemJQ.attr('data-nr'))

    return {
      item: item,
      withCountError: countResult.inError,
      countErrorElemJQ: countResult.errorElemJQ,
      withEnchantConflict: enchantResult.withConflict,
      enchantConflictInfo: enchantResult.conflictInfo,
      withEnchantDupe: enchantResult.withDupe,
      enchantDupeElemJQ: enchantResult.dupeElemJQ
    }
  }


  SetItem(item) {
    if (item !== undefined)
      this.itemID = item.id

    this.countElemJQ.val(item.count)
    this.idElemJQ.val(item.id)
    this.SetupPriorWorkOptions()
    this.priorWorkElem.SetSelectionNr(item.priorWork)

    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)

    this.SyncEnchantOptions()

    this.SetEnchants(item.enchantsByID)
  }


  // ======== PRIVATE ========


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


  SyncEnchantOptions() {
    this.RemoveEnchants()

    this.enchantRowTemplate.UpdateEnchantOptions(this.itemID)
  }


  HookUpGUI(item) {
    this.elemJQ.find('button[name="removeItem"]').click(() => {
      this.Remove()
    })

    this.idElemJQ.change(() => {
      this.itemID = parseInt(this.idElemJQ.val())
      SetIcon(this.iconElemJQ, this.itemID, false)
      this.SyncEnchantOptions()
    })

    this.addEnchantElemJQ = this.elemJQ.find('button[name="addEnchant"]')
    this.addEnchantElemJQ.click(() => {
      SetIcon(this.iconElemJQ, this.itemID, true)
      this.AddEnchant(undefined, true)
    })
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


  // returns object:
  // - withConflict: bool
  // - conflictInfo: {
  //     conflictingEnchantName: string
  //     inputElemJQ: JQuery-wrapped input element, if applicable
  //   }
  // - withDupe: bool
  // - dupeElemJQ: JQuery-wrapped input element, if applicable
  AddItemEnchants(item) {
    let result = {
      withConflict: false,
      conflictInfo: {},
      withDupe: false,
      dupeElemJQ: undefined
    }

    let foundEnchants = []
    this.enchantRows.forEach((enchantRow) => {
      let enchant = enchantRow.GetEnchant()

      foundEnchants.forEach((previousEnchant) => {
        if (EnchantIDsConflict(previousEnchant.info.id, enchant.info.id)) {
          result.withConflict = true
          result.conflictInfo.conflictingEnchantName = previousEnchant.info.name
          result.conflictInfo.inputElemJQ = enchantRow.GetIDElemJQ()
        }
        if (previousEnchant.info.id == enchant.info.id) {
          result.withDupe = true
          result.dupeElemJQ = enchantRow.GetIDElemJQ()
        }
      })

      foundEnchants.push(enchant)

      item.SetEnchant(enchant)
    })

    return result
  }


  SetEnchants(enchantsByID) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.AddEnchant(enchant, false)
    }
  }
}
