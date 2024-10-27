/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - enchantSection.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - DesiredItemSection
*/


// ======== PUBLIC ========


class DesiredItemSection {
  constructor(sectionElemJQ, AskMaySetMaxedDesiredEnchants) {
    // ==== PRIVATE ====
    this.elemJQ = sectionElemJQ.first()
    this.iconElemJQ = this.elemJQ.find('.icon')
    this.idElemJQ = this.elemJQ.find('select[name="itemID"]')
    this.SetupItemOptions()
    this.HookUpGUI(AskMaySetMaxedDesiredEnchants)

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElemJQ = this.elemJQ.find('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElemJQ, this.elemJQ, EnchantStateChangedHandler)

    this.SetItem(item)
  }


  // returns Item
  GetItem() {
    let item = this.SyncCurrentItemWithoutEnchants()
    this.enchantSection.AddEnchantsToItem(item)
    return item
  }


  SetItem(item) {
    this.itemID = item.id
    this.idElemJQ.val(item.id)

    this.enchantSection.ChangeItem(item)
  }


  // ======== PRIVATE ========


  // returns Item
  SyncCurrentItemWithoutEnchants() {
    this.itemID = parseInt(this.idElemJQ.val())
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


  SetMaxEnchants(nonConflictingIDs, chosenConflictingIDs) {
    let ids = [...nonConflictingIDs, ...chosenConflictingIDs]
    let idInfos = ids.map((id) => {
      return {
        id: id,
        info: g_enchantInfosByID.get(id)
      }
    })
    idInfos.sort((idInfo1, idInfo2) => {
      return (
        idInfo1.info.name < idInfo2.info.name ?
        -1 :
        idInfo1.info.name > idInfo2.info.name ?
        +1 :
        0
      )
    })
    let maxLevelEnchants = idInfos.map((idInfo) => {
      return new Enchant(idInfo.id, idInfo.info.maxLevel)
    })
    this.enchantSection.SetEnchants(maxLevelEnchants)
  }


  AddMaxEnchants(AskMaySetMaxedDesiredEnchants) {
    let item = this.SyncCurrentItemWithoutEnchants()

    let maxEnchantsCallbackInfo = {
      enchantsAlreadyPresent: this.enchantSection.HasEnchants(),
      hasConflictingEnchants: item.info.conflictingEnchantIDSetsList.length > 0,
      info: item.info,
      OnContinue: (maxEnchantsCallbackInfo, chosenConflictingIDs) => {
        this.SetMaxEnchants(maxEnchantsCallbackInfo.info.nonConflictingEnchantIDs, chosenConflictingIDs)
      }
    }

    if (!maxEnchantsCallbackInfo.enchantsAlreadyPresent && !maxEnchantsCallbackInfo.hasConflictingEnchants)
      maxEnchantsCallbackInfo.OnContinue(maxEnchantsCallbackInfo, [])
    else
      AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo)
  }


  HookUpGUI(AskMaySetMaxedDesiredEnchants) {
    this.idElemJQ.change(() => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })

    this.elemJQ.find('button[name="addMaxEnchants"]').click(() => {
      this.AddMaxEnchants(AskMaySetMaxedDesiredEnchants)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
  }
}
