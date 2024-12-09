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
  constructor(sectionElem, AskMaySetMaxedDesiredEnchants) {
    // ==== PRIVATE ====
    this.elem = sectionElem
    this.iconElem = this.elem.querySelector('.icon')
    this.idElem = this.elem.querySelector('select[name="itemID"]')
    this.SetupItemOptions()
    this.HookUpGUI(AskMaySetMaxedDesiredEnchants)

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElem = this.elem.querySelector('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElem, this.elem, EnchantStateChangedHandler)

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
    this.idElem.value = item.id

    this.enchantSection.ChangeItem(item)
  }


  // ======== PRIVATE ========


  // returns Item
  SyncCurrentItemWithoutEnchants() {
    let id = parseInt(this.idElem.value)
    this.itemID = id
    return new Item(
      1,
      g_desired,
      id,
      0
    )
  }


  SetupItemOptions() {
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      let optionElem = document.createElement('option')
      optionElem.setAttribute('value', itemInfo.id)
      optionElem.textContent = itemInfo.name
      this.idElem.appendChild(optionElem)
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
        this.SetMaxEnchants(maxEnchantsCallbackInfo.info.nonConflictingNormalEnchantIDs, chosenConflictingIDs)
      }
    }

    if (!maxEnchantsCallbackInfo.enchantsAlreadyPresent && !maxEnchantsCallbackInfo.hasConflictingEnchants)
      maxEnchantsCallbackInfo.OnContinue(maxEnchantsCallbackInfo, [])
    else
      AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo)
  }


  HookUpGUI(AskMaySetMaxedDesiredEnchants) {
    this.idElem.addEventListener('change', () => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })

    this.elem.querySelector('button[name="addMaxEnchants"]').addEventListener('click', () => {
      this.AddMaxEnchants(AskMaySetMaxedDesiredEnchants)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElem, this.itemID, hasEnchants)
  }
}
