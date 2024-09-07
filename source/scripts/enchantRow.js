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
  constructor(rowElemJQ) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    this.idElemJQ = rowElemJQ.find('select[name="enchantID"]')
  }


  // returns EnchantRow
  CreateNew(enchant, itemID, giveFocus, focusElemJQWhenAllGone, RemoveCallback) {
    let newRowElemJQ = super.CreateExtraElement()
    let newRow = new EnchantRow(newRowElemJQ)

    newRow.HookUpGUI(itemID, RemoveCallback)

    if (enchant !== undefined)
      newRow.SetEnchant(enchant) // performs an UpdateLevelOptions as well
    else
      newRow.UpdateLevelOptions()

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
    this.levelElemJQ = rowElemJQ.find('select[name="level"]')
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
    if (focusRowElemJQ.length > 0 && focusRowElemJQ.attr('data-real') != 0)
      focusElemJQ = focusRowElemJQ.find('button[name="removeEnchant"]')
    else
      focusElemJQ = this.focusElemJQWhenAllGone

    if (focusElemJQ?.length > 0)
      focusElemJQ[0].focus()

    super.Remove()
  }


  // returns Enchant
  GetEnchant() {
    return new Enchant(
      parseInt(this.idElemJQ.val()),
      parseInt(this.levelElemJQ.val())
    )
  }


  SetEnchant(enchant) {
    this.idElemJQ.val(enchant.id)
    this.UpdateLevelOptions(this.idElemJQ, this.levelElemJQ)
    this.levelElemJQ.val(enchant.level)
  }


  // ======== PRIVATE ========


  HookUpGUI(itemID, RemoveCallback) {
    this.idElemJQ.change(() => {
      this.UpdateLevelOptions()
    })

    this.elemJQ.find('button[name="removeEnchant"]').click(() => {
      this.Remove()
      if (RemoveCallback !== undefined)
        RemoveCallback()
    })
  }


  // returns int
  GetNewEnchantLevel(newEnchant) {
    let selectLevel = parseInt(this.levelElemJQ.val())
    if (isNaN(selectLevel))
      selectLevel = 1
    return Math.max(1, Math.min(newEnchant.maxLevel, selectLevel))
  }


  SetupNewLevelOptions(maxLevel, selectedLevel) {
    this.levelElemJQ.find('option').remove()

    for (let level = 1; level <= maxLevel; ++level)
      this.levelElemJQ.append(`<option value="${level}"${level == selectedLevel ? ' selected' : ''}>${GetRomanNumeralForLevel(level)}</option>`)
  }


  UpdateLevelOptions() {
    let enchantID = parseInt(this.idElemJQ.val())
    let newEnchant = g_enchantInfosByID.get(enchantID)
    let selectedLevel = this.GetNewEnchantLevel(newEnchant)
    this.SetupNewLevelOptions(newEnchant.maxLevel, selectedLevel)
  }
}
