/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - enchantRow.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - ItemRow
    - set: DataSet
    - nr: int
*/


// ======== PUBLIC ========


class ItemRow {
  constructor(ShowDetails, rowElemJQ, set, hookUpGUI) {
    // ==== PUBLIC ====
    this.set = set
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.rowElemJQ = rowElemJQ
    this.isReal = rowElemJQ.attr('data-real') != 0

    let enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    this.enchantTemplateRow = new EnchantRow(enchantTemplateRowElemJQ, this.set)

    switch (set) {
      case g_source:
        this.countElemJQ = rowElemJQ.find('input[name="count"]')
        this.iconElemJQ = rowElemJQ.find('.icon')
        this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
        this.priorWorkElemJQ = rowElemJQ.find('select[name="priorWork"]')

        // only once set up the item options in the template row;
        // all created rows will inherit the options.
        if (!this.isReal) {
          this.SetupItemOptions()
          this.SetupPriorWorkOptions()
        }
        break
      case g_desired:
        this.iconElemJQ = rowElemJQ.find('.icon')
        this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
        this.SetupItemOptions()
        break
      case g_combined:
        this.countElemJQ = rowElemJQ.find('.count')
        this.iconElemJQ = rowElemJQ.find('.icon')
        this.typeElemJQ = rowElemJQ.find('.type')
        this.priorWorkElemJQ = rowElemJQ.find('.priorWork')
        this.costElemJQ = rowElemJQ.find('.cost')
        this.showDetailsElemJQ = rowElemJQ.find('[name=show]')
        break
    }

    if (hookUpGUI) {
      let item = undefined
      if (this.isReal) {
        item = this.EnsureAppropriateItemUsed(item)
        this.SetItem(item)
      }
      this.HookUpGUI(item)
    }
  }


  // returns ItemRow
  CreateNew(nr, item, giveFocus, focusElemJQWhenAllGone) {
    let newItemRow = this.MakeExtraRealRow()

    newItemRow.SetNumber(nr)

    item = newItemRow.EnsureAppropriateItemUsed(item)
    newItemRow.SetItem(item)

    newItemRow.HookUpGUI(item)

    newItemRow.focusElemJQWhenAllGone = focusElemJQWhenAllGone
    if (giveFocus && newItemRow.set === g_source || newItemRow.set === g_desired)
      newItemRow.idElemJQ[0].focus()

    return newItemRow
  }


  IsReal() {
    return this.isReal
  }


  Remove() {
    if (this.set === g_source || this.set === g_desired) {
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
    }

    this.rowElemJQ.remove()
  }


  SetNumber(nr) {
    this.nr = nr
    this.rowElemJQ.attr('data-nr', nr)
    if (this.set != g_combined)
      this.rowElemJQ.find('.nr').text(nr)
  }


  // only for source and desired
  SetCount(newCount) {
    this.countElemJQ.val(newCount)
  }


  AddEnchant(enchant) {
    let RemoveEnchantCallback = () => {
      let hasEnchants = this.rowElemJQ.find('.enchant[data-real="1"]').length > 0
      SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
    }

    let itemID =
      this.set === g_source || this.set === g_desired ?
      this.itemID :
      undefined
    this.enchantTemplateRow.CreateNew(enchant, itemID, true, this.addEnchantElemJQ, RemoveEnchantCallback)
  }


  RemoveEnchants() {
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
      let enchantRow = new EnchantRow($(enchantRowElem), this.set)
      if (enchantRow.IsReal())
        enchantRow.Remove()
      return true
    })
  }


  // only for source and desired
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
      this.set,
      parseInt(this.idElemJQ.val()),
      this.set === g_source ? parseInt(this.priorWorkElemJQ.val()) : 0
    )
    let enchantResult = this.AddItemEnchants(item)
    if (this.set === g_source)
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

    switch (this.set) {
      case g_source:
        this.countElemJQ.val(item.count)
        this.idElemJQ.val(item.id)
        this.priorWorkElemJQ.val(item.priorWork)
        break
      case g_desired:
        this.idElemJQ.val(item.id)
        break
      case g_combined:
        let itemSuffix
        let hideDetailsButton = false
        switch (item.set) {
          case g_source:
            itemSuffix = ` (source nr. ${item.nr})`
            hideDetailsButton = true
            break
          case g_extra:
            itemSuffix = ' (extra)'
            break
          case g_combined:
            itemSuffix = ''
            break
        }
        this.countElemJQ.text(item.count)
        this.typeElemJQ.text(item.info.name + itemSuffix)
        this.priorWorkElemJQ.text(item.priorWork)
        this.costElemJQ.text(item.totalCost)
        if (hideDetailsButton)
          this.showDetailsElemJQ.hide()
        break
    }

    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)

    this.SetEnchants(item.enchantsByID)
  }


  // ======== PRIVATE ========


  // returns Item
  EnsureAppropriateItemUsed(item) {
    if (item === undefined && this.set !== g_combined) {
      item = new Item(
        1,
        this.set,
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
      new ItemRow(this.ShowDetails, $(rowElem), g_source, false).SetNumber(rowNr)
    })
  }


  SyncEnchantOptions() {
    this.RemoveEnchants()

    this.enchantTemplateRow.UpdateEnchantOptions(this.itemID)
  }


  HookUpGUI(item) {
    if (this.set === g_source) {
      this.rowElemJQ.find('button[name="removeItem"]').click(() => {
        let tbodyElemJQ = this.rowElemJQ.parent()

        this.Remove()

        this.RenumberAllRows(tbodyElemJQ)
      })
    }

    if (this.set === g_source || this.set === g_desired) {
      this.idElemJQ.change(() => {
        this.itemID = parseInt(this.idElemJQ.val())
        SetIcon(this.iconElemJQ, this.itemID, false)
        this.SyncEnchantOptions()
      })

      this.addEnchantElemJQ = this.rowElemJQ.find('button[name="addEnchant"]')
      this.addEnchantElemJQ.click(() => {
        SetIcon(this.iconElemJQ, this.itemID, true)
        this.AddEnchant()
      })
    }

    if (this.set === g_combined) {
      this.rowElemJQ.find('button[name="show"]').click(() => {
        this.ShowDetails(item)
      })
    }
  }


  // returns ItemRow
  MakeExtraRealRow() {
    let newRowElemJQ = this.rowElemJQ.clone()
    newRowElemJQ.appendTo(this.rowElemJQ.parent())

    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', 1)

    return new ItemRow(this.ShowDetails, newRowElemJQ, this.set, false)
  }


  // returns object:
  // - count: int / NaN
  // - inError: bool
  // - errorElemJQ: JQuery-wrapped input element, if applicable
  GetValidatedCount() {
    let count = 1
    let inError = false
    if (this.set === g_source) {
      count = parseInt(this.countElemJQ.val())
      inError = isNaN(count)
    }
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
      let enchantRow = new EnchantRow(enchantRowElemJQ, this.set)
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
