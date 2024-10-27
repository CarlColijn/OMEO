/*
  Section of enchant rows in desired and source item tables.

  Prerequisites:
  - enchantInfo.js
  - enchantRow.js

  Defined classes:
  - EnchantSection
*/


// ======== PUBLIC ========


class EnchantSection {
  constructor(item, addEnchantElemJQ, parentElemJQ, EnchantStateChangedHandler) {
    // ==== PRIVATE ====
    this.addEnchantElemJQ = addEnchantElemJQ
    this.EnchantStateChangedHandler = EnchantStateChangedHandler
    this.HookUpGUI()

    this.enchantRowTemplate = new EnchantRowTemplate(parentElemJQ, 'enchant')
    this.enchantRows = []

    this.ChangeItem(item)
  }


  HasEnchants() {
    return this.enchantRows.length > 0
  }


  RemoveEnchants() {
    this.enchantRowTemplate.RemoveCreatedElements()
    this.enchantRows.splice(0, Infinity)

    this.UpdateGUIState(false, true)
  }


  SetEnchants(enchants) {
    this.enchantRowTemplate.RemoveCreatedElements()
    this.enchantRows.splice(0, Infinity)

    enchants.forEach((enchant) => {
      this.AddEnchant(enchant, false)
    })

    this.UpdateGUIState(enchants.length > 0, false)
  }


  ChangeItem(item) {
    this.RemoveEnchants()
    let hasEnchants = false

    this.itemID = item.id
    this.CacheUsableIDs(item.id)

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = item.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined) {
        this.AddEnchant(enchant, false)
        hasEnchants = true
      }
    }

    this.UpdateGUIState(hasEnchants, false)
  }


  AddEnchantsToItem(item) {
    this.enchantRows.forEach((enchantRow) => {
      let enchant = enchantRow.GetEnchant()
      item.SetEnchant(enchant)
    })
  }


  // ======== PRIVATE ========


  HookUpGUI() {
    this.addEnchantElemJQ.click(() => {
      this.AddEnchant(undefined, true)

      this.UpdateGUIState(true, false)
    })
  }


  AddEnchant(enchant, giveFocus) {
    let ChangeEnchantCallback = () => {
      let hasEnchants = this.enchantRowTemplate.ElementsPresent()
      this.UpdateGUIState(hasEnchants, false)
    }

    let enchantRow = this.enchantRowTemplate.CreateNew(this.itemID, enchant, this.enchantRows, giveFocus, this.addEnchantElemJQ, ChangeEnchantCallback)
  }


  CacheUsableIDs(itemID) {
    this.usableIDs = new Set()

    if (itemID !== undefined) {
      let itemInfo = g_itemInfosByID.get(this.itemID)
      for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
        let enchantInfo = g_enchantInfos[enchantNr]
        if (itemInfo.CanHaveEnchant(enchantInfo.id))
          this.usableIDs.add(enchantInfo.id)
      }
    }
  }


  // returns bool
  CanCreateNew() {
    let remainingIDs = new Set(this.usableIDs)

    this.enchantRows.forEach((row) => {
      let enchantID = row.GetEnchantID()
      remainingIDs.delete(enchantID)

      GetConflictingEnchantIDs(enchantID).forEach((conflictingID) => {
        remainingIDs.delete(conflictingID)
      })
    })

    return remainingIDs.size > 0
  }


  UpdateGUIState(hasEnchants, forceToEnabled) {
    this.EnchantStateChangedHandler(hasEnchants)

    let mayAddEnchants =
      forceToEnabled ?
      true :
      this.CanCreateNew(this.enchantRows)

    this.addEnchantElemJQ.prop('disabled', !mayAddEnchants)
  }
}
