/*
  Wrapper for a single row in an enchant table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchant.js

  Defined classes:
  - EnchantRowTemplate
  - EnchantRow
*/


// ======== PUBLIC ========


class EnchantRowTemplate extends TemplateElement {
  constructor(parentElemJQ, elementClass) {
    super(parentElemJQ, elementClass)

    // ==== PRIVATE ====
    this.idElemJQ = this.elemJQ.find('select[name="enchantID"]')
  }


  // returns EnchantRow
  CreateNew(enchant, itemID, giveFocus, focusElemJQWhenAllGone, RemoveCallback) {
    let newRowElemJQ = super.CreateExtraElement()
    let newRow = new EnchantRow(newRowElemJQ)

    newRow.HookUpGUI(itemID, RemoveCallback)

    if (enchant === undefined)
      enchant = newRow.GetEnchant()
    newRow.SetEnchant(enchant)

    newRow.focusElemJQWhenAllGone = focusElemJQWhenAllGone
    if (giveFocus)
      newRow.idElemJQ[0].focus()

    return newRow
  }


  UpdateEnchantOptions(itemID) {
    this.idElemJQ.find('option').remove()

    let itemInfo = g_itemInfosByID.get(itemID)

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      if (itemInfo.CanHaveEnchant(enchantInfo.id))
        this.idElemJQ.append(`<option value="${enchantInfo.id}">${enchantInfo.name}</option>`)
    }
  }
}




class EnchantRow extends RealElement {
  constructor(rowElemJQ) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    this.idElemJQ = rowElemJQ.find('select[name="enchantID"]')
    this.levelElem = new ButtonStrip(rowElemJQ.find('.levelInput'))
  }


  // returns jQuery-wrapped input element
  GetIDElemJQ() {
    return this.idElemJQ
  }


  Remove() {
    let focusRowElemJQ = this.elemJQ.next()
    if (focusRowElemJQ.length == 0)
      focusRowElemJQ = this.elemJQ.prev()

    let focusElemJQ
    if (focusRowElemJQ.length > 0 && new DOMElement(focusRowElemJQ).IsReal())
      focusElemJQ = focusRowElemJQ.find('button[name="removeEnchant"]')
    else
      focusElemJQ = this.focusElemJQWhenAllGone

    if (focusElemJQ?.length > 0)
      focusElemJQ[0].focus()

    super.Remove()
  }


  // returns Enchant
  GetEnchant() {
    let enchantID = parseInt(this.idElemJQ.val())
    let enchantInfo = g_enchantInfosByID.get(enchantID)
    let enchantLevel = this.GetEnchantLevel(enchantInfo)
    return new Enchant(enchantID, enchantLevel)
  }


  SetEnchant(enchant) {
    this.idElemJQ.val(enchant.id)
    this.UpdateLevelOptions(enchant)
  }


  // ======== PRIVATE ========


  HookUpGUI(itemID, RemoveCallback) {
    this.idElemJQ.change(() => {
      this.UpdateLevelOptions(undefined)
    })

    this.elemJQ.find('button[name="removeEnchant"]').click(() => {
      this.Remove()
      if (RemoveCallback !== undefined)
        RemoveCallback()
    })
  }


  // returns int
  GetEnchantLevel(enchantInfo) {
    let selectLevelNr = this.levelElem.GetSelectionNr()
    if (selectLevelNr === undefined)
      selectLevelNr = 0
    return Math.max(1, Math.min(enchantInfo.maxLevel, selectLevelNr + 1))
  }


  UpdateLevelOptions(enchant) {
    if (enchant === undefined)
      enchant = this.GetEnchant()

    let levelTexts = GetRomanNumeralsUpToLevel(enchant.info.maxLevel)

    this.levelElem.SetOptions(levelTexts, enchant.level - 1)
  }
}
