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
  constructor(rowElemJQ, hookUpGUI) {
    super(rowElemJQ)

    this.SetupItemOptions()
  }


  // returns SourceItemRow
  CreateNew(nr, item, giveFocus, focusElemJQWhenAllGone) {
    let newRowElemJQ = super.CreateExtraElement()
    let newItemRow = new SourceItemRow(newRowElemJQ, false)

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
  constructor(rowElemJQ, hookUpGUI) {
    super(rowElemJQ)

    // ==== PUBLIC ====
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    let enchantTemplateRowElemJQ = this.elemJQ.find('.template').first()
    this.enchantTemplateRow = new EnchantRowTemplate(enchantTemplateRowElemJQ)

    this.countElemJQ = rowElemJQ.find('input[name="count"]')
    this.iconElemJQ = rowElemJQ.find('.icon')
    this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
    this.priorWorkElem = new ButtonStrip(rowElemJQ.find('.priorWorkInput'))

    if (hookUpGUI) {
      let item = undefined
      if (this.IsReal()) {
        item = this.EnsureAppropriateItemUsed(item)
        this.SetItem(item)
      }
      this.HookUpGUI(item)
    }
  }


  Remove() {
    let focusRowElemJQ = this.elemJQ.next()
    if (focusRowElemJQ.length == 0)
      focusRowElemJQ = this.elemJQ.prev()

    let focusElemJQ
    if (focusRowElemJQ.length > 0 && focusRowElemJQ.attr('data-real') != 0)
      focusElemJQ = focusRowElemJQ.find('button[name="removeItem"]')
    else
      focusElemJQ = this.focusElemJQWhenAllGone

    if (focusElemJQ?.length > 0)
      focusElemJQ[0].focus()

    super.Remove()
  }


  SetNumber(nr) {
    this.nr = nr
    this.elemJQ.attr('data-nr', nr)
    this.elemJQ.find('.nr').text(nr)
  }


  SetCount(newCount) {
    this.countElemJQ.val(newCount)
  }


  AddEnchant(enchant) {
    let RemoveEnchantCallback = () => {
      let hasEnchants = this.elemJQ.find('.enchant[data-real="1"]').length > 0
      SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
    }

    this.enchantTemplateRow.CreateNew(enchant, this.itemID, true, this.addEnchantElemJQ, RemoveEnchantCallback)
  }


  RemoveEnchants() {
    this.elemJQ.find('.enchant').each((rowNr, enchantRowElem) => {
      let enchantRow = new EnchantRow($(enchantRowElem))
      if (enchantRow.IsReal())
        enchantRow.Remove()
      return true
    })
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


  RenumberAllRows(tbodyElemJQ) {
    tbodyElemJQ.find('.item').each((rowNr, rowElem) => {
      new SourceItemRow($(rowElem), false).SetNumber(rowNr)
    })
  }


  SyncEnchantOptions() {
    this.RemoveEnchants()

    this.enchantTemplateRow.UpdateEnchantOptions(this.itemID)
  }


  HookUpGUI(item) {
    this.elemJQ.find('button[name="removeItem"]').click(() => {
      let tbodyElemJQ = this.elemJQ.parent()

      this.Remove()

      this.RenumberAllRows(tbodyElemJQ)
    })

    this.idElemJQ.change(() => {
      this.itemID = parseInt(this.idElemJQ.val())
      SetIcon(this.iconElemJQ, this.itemID, false)
      this.SyncEnchantOptions()
    })

    this.addEnchantElemJQ = this.elemJQ.find('button[name="addEnchant"]')
    this.addEnchantElemJQ.click(() => {
      SetIcon(this.iconElemJQ, this.itemID, true)
      this.AddEnchant(undefined)
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
    this.elemJQ.find('.enchant').each((rowNr, enchantRowElem) => {
      let enchantRowElemJQ = $(enchantRowElem)
      let enchantRow = new EnchantRow(enchantRowElemJQ)
      if (enchantRow.IsReal()) {
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
      }
      return !result.withConflict
    })

    return result
  }


  SetEnchants(enchantsByID) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.AddEnchant(enchant)
    }
  }
}
