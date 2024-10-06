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
  }


  // returns EnchantRow
  CreateNew(itemID, enchant, allRows, giveFocus, focusElemJQWhenAllGone, ChangeEnchantCallback) {
    let newRowElemJQ = super.CreateExtraElement()
    let newRow = new EnchantRow(newRowElemJQ, itemID, enchant, allRows, focusElemJQWhenAllGone, ChangeEnchantCallback)

    if (giveFocus)
      newRow.idElemJQ[0].focus()

    return newRow
  }
}




class EnchantRow extends RealElement {
  constructor(rowElemJQ, itemID, enchant, allRows, focusElemJQWhenAllGone, ChangeEnchantCallback) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    this.allRows = allRows
    this.allRows.push(this)

    this.idElemJQ = rowElemJQ.find('select[name="enchantID"]')
    this.levelElem = new ButtonStrip(rowElemJQ.find('.levelInput'))
    this.UpdateEnchantOptions(itemID)

    this.focusElemJQWhenAllGone = focusElemJQWhenAllGone
    this.HookUpGUI(itemID, ChangeEnchantCallback)

    this.SetEnchant(enchant)
  }


  // returns int
  GetEnchantID() {
    return this.enchantID
  }


  // returns Enchant
  GetEnchant() {
    let enchantInfo = g_enchantInfosByID.get(this.enchantID)
    let enchantLevel = this.GetEnchantLevel(enchantInfo)
    return new Enchant(this.enchantID, enchantLevel)
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

    let ourRowNr = this.allRows.indexOf(this)
    if (ourRowNr != -1)
      this.allRows.splice(ourRowNr, 1)

    this.SendIDChange()

    super.Remove()
  }


  // ======== PRIVATE ========


  SetEnchant(enchant) {
    if (enchant === undefined) {
      this.enchantID = parseInt(this.idElemJQ.val())
      enchant = this.GetEnchant()
    }
    else {
      this.enchantID = enchant.id
      this.idElemJQ.val(enchant.id)
    }

    this.UpdateLevelOptions(enchant)

    this.SendIDChange()
  }


  SendIDChange() {
    this.allRows.forEach((otherRow) => {
      if (otherRow !== this)
        otherRow.EnchantChoicesChanged()
    })
  }


  HookUpGUI(itemID, ChangeEnchantCallback) {
    this.idElemJQ.change(() => {
      this.enchantID = parseInt(this.idElemJQ.val())
      let enchant = this.GetEnchant()

      this.UpdateLevelOptions(enchant)

      this.SendIDChange()

      ChangeEnchantCallback()
    })

    this.elemJQ.find('button[name="removeEnchant"]').click(() => {
      this.Remove()

      ChangeEnchantCallback()
    })
  }


  // returns Set(int)
  GetUnusableEnchantIDs() {
    let unusableEnchantIDs = new Set()

    this.allRows.forEach((otherRow) => {
      if (this !== otherRow) {
        unusableEnchantIDs.add(otherRow.enchantID)
        GetConflictingEnchantIDs(otherRow.enchantID).forEach((conflictingID) => {
          unusableEnchantIDs.add(conflictingID)
        })
      }
    })

    return unusableEnchantIDs
  }


  EnchantChoicesChanged() {
    let unusableEnchantIDs = this.GetUnusableEnchantIDs()

    this.idElemJQ.find('option').each(function() {
      let optionElemJQ = $(this)
      let enchantID = parseInt(optionElemJQ.val())

      if (enchantID != this.enchantID) {
        if (unusableEnchantIDs.has(enchantID))
          optionElemJQ.attr('disabled', 'disabled')
        else
          optionElemJQ.removeAttr('disabled')
      }
    })
  }


  UpdateEnchantOptions(itemID) {
    this.idElemJQ.find('option').remove()

    let itemInfo = g_itemInfosByID.get(itemID)

    let unusableEnchantIDs = this.GetUnusableEnchantIDs()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      if (itemInfo.CanHaveEnchant(enchantInfo.id)) {
        let enchantUnusable = unusableEnchantIDs.has(enchantInfo.id)
        this.idElemJQ.append(`<option value="${enchantInfo.id}"${enchantUnusable ? ' disabled="disabled"' : ''}>${enchantInfo.name}</option>`)
      }
    }
  }


  // returns int
  GetEnchantLevel(enchantInfo) {
    let selectLevelNr = this.levelElem.GetSelectionNr()
    if (selectLevelNr === undefined)
      selectLevelNr = 0
    return Math.max(1, Math.min(enchantInfo.maxLevel, selectLevelNr + 1))
  }


  UpdateLevelOptions(enchant) {
    let levelTexts = GetRomanNumeralsUpToLevel(enchant.info.maxLevel)

    this.levelElem.SetOptions(levelTexts, enchant.level - 1)
  }
}
