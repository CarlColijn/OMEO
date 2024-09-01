/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - tableRow.js
  - dataSets.js
  - enchantInfo.js
  - enchantRow.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - SourceItemRow
    - nr: int
*/


// ======== PUBLIC ========


class SourceItemRow extends TableRow {
  constructor(rowElemJQ, hookUpGUI) {
    super(rowElemJQ)

    // ==== PUBLIC ====
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    let enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    this.enchantTemplateRow = new EnchantRow(enchantTemplateRowElemJQ)

    this.countElemJQ = rowElemJQ.find('input[name="count"]')
    this.iconElemJQ = rowElemJQ.find('.icon')
    this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
    this.priorWorkElemJQ = rowElemJQ.find('select[name="priorWork"]')

    // only once set up the item options in the template row;
    // all created rows will inherit the options.
    if (!this.IsReal()) {
      this.SetupItemOptions()
      this.SetupPriorWorkOptions()
    }

    if (hookUpGUI) {
      let item = undefined
      if (this.IsReal()) {
        item = this.EnsureAppropriateItemUsed(item)
        this.SetItem(item)
      }
      this.HookUpGUI(item)
    }
  }


  // returns SourceItemRow
  CreateNew(nr, item, giveFocus, focusElemJQWhenAllGone) {
    let newRowElemJQ = super.MakeExtraRealRow()
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


  Remove() {
    let focusRowElemJQ = this.rowElemJQ.next()
    if (focusRowElemJQ.length == 0)
      focusRowElemJQ = this.rowElemJQ.prev()

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
    this.rowElemJQ.attr('data-nr', nr)
    this.rowElemJQ.find('.nr').text(nr)
  }


  SetCount(newCount) {
    this.countElemJQ.val(newCount)
  }


  AddEnchant(enchant) {
    let RemoveEnchantCallback = () => {
      let hasEnchants = this.rowElemJQ.find('.enchant[data-real="1"]').length > 0
      SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
    }

    this.enchantTemplateRow.CreateNew(enchant, this.itemID, true, this.addEnchantElemJQ, RemoveEnchantCallback)
  }


  RemoveEnchants() {
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
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

    let item = new Item(
      countResult.count,
      g_source,
      parseInt(this.idElemJQ.val()),
      parseInt(this.priorWorkElemJQ.val())
    )
    let enchantResult = this.AddItemEnchants(item)
    item.nr = parseInt(this.rowElemJQ.attr('data-nr'))

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
    this.priorWorkElemJQ.val(item.priorWork)

    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)

    this.SetEnchants(item.enchantsByID)
  }


  // ======== PRIVATE ========


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


  SetupItemOptions() {
    let itemSelectElemJQs = this.rowElemJQ.find('select[name="itemID"]')
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      itemSelectElemJQs.append(`<option value="${itemInfo.id}">${itemInfo.name}</option>`)
    }
  }


  SetupPriorWorkOptions() {
    let priorWorkSelectElemJQs = this.rowElemJQ.find('select[name="priorWork"]')
    for (let priorWork = 0; priorWork <= 6; ++priorWork)
      priorWorkSelectElemJQs.append(`<option value="${priorWork}">${priorWork}</option>`)
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
    this.rowElemJQ.find('button[name="removeItem"]').click(() => {
      let tbodyElemJQ = this.rowElemJQ.parent()

      this.Remove()

      this.RenumberAllRows(tbodyElemJQ)
    })

    this.idElemJQ.change(() => {
      this.itemID = parseInt(this.idElemJQ.val())
      SetIcon(this.iconElemJQ, this.itemID, false)
      this.SyncEnchantOptions()
    })

    this.addEnchantElemJQ = this.rowElemJQ.find('button[name="addEnchant"]')
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
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
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
    this.RemoveEnchants()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.AddEnchant(enchant)
    }
  }
}
