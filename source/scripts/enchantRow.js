/*
  Wrapper for a single row in an enchant table.

  Prerequisites:
  - dataSets.js
  - enchant.js

  Defined classes:
  - EnchantRow
    - set: DataSet
*/


// ======== PUBLIC ========


class EnchantRow {
  constructor(rowElemJQ, set) {
    // ==== PUBLIC ====
    this.set = set

    // ==== PRIVATE ====
    this.rowElemJQ = rowElemJQ
    if (set === g_source || set === g_desired) {
      this.idElemJQ = rowElemJQ.find('select[name="enchantID"]')
      this.levelElemJQ = rowElemJQ.find('select[name="level"]')
    }
    else if (set === g_combined) {
      this.nameElemJQ = rowElemJQ.find('.name')
      this.levelElemJQ = rowElemJQ.find('.level')
    }

    this.isReal = rowElemJQ.attr('data-real') != 0
  }


  // returns bool
  IsReal() {
    return this.isReal
  }


  // returns EnchantRow
  CreateNew(enchant, itemID) {
    let newRow = this.MakeExtraRealRow()

    if (this.set === g_source || this.set === g_desired)
      newRow.HookUpGUI(itemID)

    if (enchant !== undefined)
      newRow.SetEnchant(enchant) // performs an UpdateLevelOptions as well
    else
      newRow.UpdateLevelOptions()

    return newRow
  }


  Remove() {
    this.rowElemJQ.remove()
  }


  // returns Enchant
  GetEnchant() {
    return new Enchant(
      parseInt(this.idElemJQ.val()),
      parseInt(this.levelElemJQ.val())
    )
  }


  SetEnchant(enchant) {
    if (this.set === g_source || this.set === g_desired) {
      this.idElemJQ.val(enchant.id)
      this.UpdateLevelOptions(this.idElemJQ, this.levelElemJQ)
      this.levelElemJQ.val(enchant.level)
    }
    else if (this.set === g_combined) {
      this.nameElemJQ.text(enchant.info.name)
      this.levelElemJQ.text(enchant.level)
    }
  }


  // ======== PRIVATE ========


  UpdateEnchantOptions(itemID) {
    this.idElemJQ.find('option').remove()

    let itemInfo = g_itemInfosByID.get(itemID)

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      if (itemInfo.CanHaveEnchant(enchantInfo.id))
        this.idElemJQ.append(`<option value="${enchantInfo.id}">${enchantInfo.name}</option>`)
    }
  }


  // returns EnchantRow
  MakeExtraRealRow() {
    let newRowElemJQ = this.rowElemJQ.clone()
    let rowParentElemJQ = this.rowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)
    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', '1')

    return new EnchantRow(newRowElemJQ, this.set)
  }


  HookUpGUI(itemID) {
    this.UpdateEnchantOptions(itemID)

    this.idElemJQ.change(() => {
      this.UpdateLevelOptions()
    })

    this.rowElemJQ.find('button[name="removeEnchant"]').click(() => {
      this.rowElemJQ.remove()
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
      this.levelElemJQ.append(`<option value="${level}"${level == selectedLevel ? ' selected' : ''}>${level}</option>`)
  }


  UpdateLevelOptions() {
    let enchantID = parseInt(this.idElemJQ.val())
    let newEnchant = g_enchantInfosByID.get(enchantID)
    let selectedLevel = this.GetNewEnchantLevel(newEnchant)
    this.SetupNewLevelOptions(newEnchant.maxLevel, selectedLevel)
  }
}
