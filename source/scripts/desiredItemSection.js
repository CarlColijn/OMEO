/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - enchantRow.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - DesiredItemSection
*/


// ======== PUBLIC ========


class DesiredItemSection {
  constructor(sectionElemJQ) {
    // ==== PRIVATE ====
    this.elemJQ = sectionElemJQ.first()

    this.enchantRowTemplate = new EnchantRowTemplate(this.elemJQ, 'enchant')
    this.enchantRows = []

    this.iconElemJQ = this.elemJQ.find('.icon')
    this.idElemJQ = this.elemJQ.find('select[name="itemID"]')
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

    this.SyncEnchantOptions()

    this.SetEnchants(item.enchantsByID)
  }


  // returns ItemCollectionResult
  ExtractItems(itemCollector) {
    itemCollector.ProcessRow(this)
    return itemCollector.Finalize()
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
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      this.idElemJQ.append(`<option value="${itemInfo.id}">${itemInfo.name}</option>`)
    }
  }


  SetupPriorWorkOptions() {
    let priorWorkSelectElemJQs = this.elemJQ.find('select[name="priorWork"]')
    for (let priorWork = 0; priorWork <= 6; ++priorWork)
      priorWorkSelectElemJQs.append(`<option value="${priorWork}">${priorWork}</option>`)
  }


  SyncEnchantOptions() {
    this.RemoveEnchants()

    this.enchantRowTemplate.UpdateEnchantOptions(this.itemID)
  }


  HookUpGUI(item) {
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


  SetEnchants(enchantsByID) {
    this.RemoveEnchants()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.AddEnchant(enchant, false)
    }
  }
}
