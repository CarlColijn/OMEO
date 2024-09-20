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
    this.levelElemJQ = rowElemJQ.find('.levelInput')
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
    let enchantID = parseInt(this.idElemJQ.val())
    let enchantInfo = g_enchantInfosByID.get(enchantID)
    let enchantLevel = this.GetNewEnchantLevel(enchantInfo)
    return new Enchant(enchantID, enchantLevel)
  }


  SetEnchant(enchant) {
    this.idElemJQ.val(enchant.id)
    this.UpdateLevelOptions(this.idElemJQ, this.levelElemJQ)
    this.levelElemJQ.find('button').removeClass('selected')
    this.levelElemJQ.find(`button[value=${enchant.level}]`).addClass('selected')
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
  GetNewEnchantLevel(enchantInfo) {
    let selectLevel = parseInt(this.levelElemJQ.find('.selected').val())
    if (isNaN(selectLevel))
      selectLevel = 1
    return Math.max(1, Math.min(enchantInfo.maxLevel, selectLevel))
  }


  SetupNewLevelOptions(maxLevel, selectedLevel) {
    this.levelElemJQ.empty()

    for (let level = 1; level <= maxLevel; ++level) {
      let orderClass =
        level == 1 && level == maxLevel ?
        ' onlyOption' :
        level == 1 ?
        ' firstOption' :
        level == maxLevel ?
        ' lastOption' :
        ' middleOption'
      let selectedClass =
        level == selectedLevel ?
        ' selected' :
        ''
      let levelButtonElemJQ = $(`<button type="button" class="levelBox${orderClass}${selectedClass}" value="${level}"><div>${GetRomanNumeralForLevel(level)}</div></button>`)
      this.levelElemJQ.append(levelButtonElemJQ)

      let levelElemJQ = this.levelElemJQ
      levelButtonElemJQ.on('click', function() {
        levelElemJQ.find('button').removeClass('selected')
        $(this).addClass('selected')
      })
    }
  }


  UpdateLevelOptions() {
    let enchant = this.GetEnchant()
    this.SetupNewLevelOptions(enchant.info.maxLevel, enchant.level)
  }
}
