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
  constructor(sectionElemJQ) {
    // ==== PRIVATE ====
    this.elemJQ = sectionElemJQ.first()
    this.iconElemJQ = this.elemJQ.find('.icon')
    this.idElemJQ = this.elemJQ.find('select[name="itemID"]')
    this.SetupItemOptions()
    this.HookUpGUI()

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElemJQ = this.elemJQ.find('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElemJQ, this.elemJQ, EnchantStateChangedHandler)

    this.SetItem(item)
  }


  // returns object:
  // - item: Item
  // - withCountError: false
  // - countErrorElemJQ: undefined
  GetItem() {
    let item = this.SyncCurrentItemWithoutEnchants()
    this.enchantSection.AddEnchantsToItem(item)

    return {
      item: item,
      withCountError: false,
      countErrorElemJQ: undefined
    }
  }


  SetItem(item) {
    this.itemID = item.id
    this.idElemJQ.val(item.id)

    this.enchantSection.ChangeItem(item)
  }


  // returns ItemCollectionResult
  ExtractItems(itemCollector) {
    itemCollector.ProcessRow(this)
    return itemCollector.Finalize()
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


  SetupPriorWorkOptions() {
    let priorWorkSelectElemJQs = this.elemJQ.find('select[name="priorWork"]')
    for (let priorWork = 0; priorWork <= 6; ++priorWork)
      priorWorkSelectElemJQs.append(`<option value="${priorWork}">${priorWork}</option>`)
  }


  HookUpGUI() {
    this.idElemJQ.change(() => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElemJQ, this.itemID, hasEnchants)
  }
}
