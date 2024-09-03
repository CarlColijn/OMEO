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
  - DesiredItemRow
*/


// ======== PUBLIC ========


class DesiredItemRow extends TableRow {
  constructor(rowElemJQ) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    let enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    this.enchantTemplateRow = new EnchantRow(enchantTemplateRowElemJQ)

    this.iconElemJQ = rowElemJQ.find('.icon')
    this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
    this.SetupItemOptions()

    let item = this.GetAppropriateItemToUse()
    this.SetItem(item)

    this.HookUpGUI(item)
  }


  // returns object:
  // - item: Item
  // - withCountError: false
  // - countErrorElemJQ: undefined
  // - withEnchantConflict: bool
  // - enchantConflictInfo: {
  //     conflictingEnchantName: string,
  //     inputElemJQ: JQuery-wrapped input element
  //   }
  // - withEnchantDupe: bool
  // - enchantDupeElemJQ: JQuery-wrapped input element, if applicable
  GetItem() {
    let item = new Item(
      1,
      g_desired,
      parseInt(this.idElemJQ.val()),
      0
    )
    let enchantResult = this.AddItemEnchants(item)

    return {
      item: item,
      withCountError: false,
      countErrorElemJQ: undefined,
      withEnchantConflict: enchantResult.withConflict,
      enchantConflictInfo: enchantResult.conflictInfo,
      withEnchantDupe: enchantResult.withDupe,
      enchantDupeElemJQ: enchantResult.dupeElemJQ
    }
  }


  SetItem(item) {
    this.itemID = item.id

    this.idElemJQ.val(item.id)

    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)

    this.SetEnchants(item.enchantsByID)
  }


  // ======== PRIVATE ========


  // returns Item
  GetAppropriateItemToUse() {
    return new Item(
      1,
      g_desired,
      parseInt(this.idElemJQ.val()),
      0
    )
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


  SyncEnchantOptions() {
    this.RemoveEnchants()

    this.enchantTemplateRow.UpdateEnchantOptions(this.itemID)
  }


  HookUpGUI(item) {
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


  SetEnchants(enchantsByID) {
    this.RemoveEnchants()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.AddEnchant(enchant)
    }
  }
}