/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - enchantRow.js
  - item.js

  Defined classes:
  - ItemRow
    - set: DataSet
    - nr: int
*/


// ======== PUBLIC ========


class ItemRow {
  constructor(ShowCountInputError, ShowDetails, rowElemJQ, set, hookUpGUI) {
    // ==== PUBLIC ====
    this.set = set
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    this.ShowCountInputError = ShowCountInputError
    this.ShowDetails = ShowDetails

    this.rowElemJQ = rowElemJQ
    this.isReal = rowElemJQ.attr('data-real') != 0

    let enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    this.enchantTemplateRow = new EnchantRow(enchantTemplateRowElemJQ, this.set)

    switch (set) {
      case g_source:
        this.countElemJQ = rowElemJQ.find('input[name="count"]')
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
        this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
        this.SetupItemOptions()
        break
      case g_combined:
        this.countElemJQ = rowElemJQ.find('.count')
        this.typeElemJQ = rowElemJQ.find('.type')
        this.priorWorkElemJQ = rowElemJQ.find('.priorWork')
        this.costElemJQ = rowElemJQ.find('.cost')
        this.showDetailsElemJQ = rowElemJQ.find('[name=showDetails]')
        break
    }

    if (hookUpGUI)
      this.HookUpGUI(undefined)
  }


  // returns ItemRow
  CreateNew(nr, item) {
    let newItemRow = this.MakeExtraRealRow()

    newItemRow.SetNumber(nr)

    newItemRow.HookUpGUI(item)

    if (item !== undefined)
      newItemRow.SetItem(item)

    return newItemRow
  }


  IsReal() {
    return this.isReal
  }


  Remove() {
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
    let itemID =
      this.set === g_source || this.set === g_desired ?
      parseInt(this.idElemJQ.val()) :
      undefined
    this.enchantTemplateRow.CreateNew(enchant, itemID)
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
  // - withErrors: bool
  GetItem() {
    let countResult = this.GetValidatedCount()

    let item = new Item(
      countResult.count,
      this.set,
      parseInt(this.idElemJQ.val()),
      this.set === g_source ? parseInt(this.priorWorkElemJQ.val()) : 0
    )
    this.AddItemEnchants(item)
    if (this.set === g_source)
      item.nr = parseInt(this.rowElemJQ.attr('data-nr'))

    return {
      item: item,
      withErrors: countResult.withErrors
    }
  }


  SetItem(item) {
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

    this.SetEnchants(item.enchantsByID)
  }


  // ======== PRIVATE ========


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
      new ItemRow(this.ShowCountInputError, this.ShowDetails, $(rowElem), g_source, false).SetNumber(rowNr)
    })
  }


  SyncEnchantOptions() {
    this.RemoveEnchants()

    let itemID = parseInt(this.idElemJQ.val())
    this.enchantTemplateRow.UpdateEnchantOptions(itemID)
  }


  HookUpGUI(item) {
    if (this.set === g_source) {
      this.rowElemJQ.find('button[name="removeItem"]').click(() => {
        let tbodyElemJQ = this.rowElemJQ.parent()

        this.rowElemJQ.remove()

        this.RenumberAllRows(tbodyElemJQ)
      })
    }

    if (this.set === g_source || this.set === g_desired) {
      this.idElemJQ.change(() => {
        this.SyncEnchantOptions()
      })

      this.rowElemJQ.find('button[name="addEnchant"]').click(() => {
        this.AddEnchant()
      })
    }

    if (this.set === g_combined) {
      this.rowElemJQ.find('button[name="showDetails"]').click(() => {
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

    return new ItemRow(this.ShowCountInputError, this.ShowDetails, newRowElemJQ, this.set, false)
  }


  // returns object:
  // - count: int / NaN
  // - withErrors: bool
  GetValidatedCount() {
    let count = 1
    let withErrors = false
    if (this.set === g_source) {
      count = parseInt(this.countElemJQ.val())
      if (isNaN(count)) {
        this.ShowCountInputError(this.countElemJQ)
        withErrors = true
      }
    }
    return {
      count: count,
      withErrors: withErrors
    }
  }


  AddItemEnchants(item) {
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
      let enchantRowElemJQ = $(enchantRowElem)
      let enchantRow = new EnchantRow(enchantRowElemJQ, this.set)
      if (enchantRow.IsReal()) {
        let enchant = enchantRow.GetEnchant()

        item.SetEnchant(enchant)
      }
      return true
    })
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
