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
  constructor(parentElem, elementClass) {
    super(parentElem, elementClass)
  }


  // returns EnchantRow
  CreateNew(itemID, enchant, allRows, giveFocus, focusElemWhenAllGone, ChangeEnchantCallback) {
    let newRowElem = super.CreateExtraElement()
    let newRow = new EnchantRow(newRowElem, itemID, enchant, allRows, focusElemWhenAllGone, ChangeEnchantCallback)

    if (giveFocus)
      newRow.idElem.focus()

    return newRow
  }
}




class EnchantRow extends RealElement {
  constructor(rowElem, itemID, enchant, allRows, focusElemWhenAllGone, ChangeEnchantCallback) {
    super(rowElem)

    // ==== PRIVATE ====
    this.allRows = allRows
    this.allRows.push(this)

    this.idElem = rowElem.querySelector('select[name="enchantID"]')
    this.levelElem = new ButtonStrip(rowElem.querySelector('.levelInput'))
    this.UpdateEnchantOptions(itemID)

    this.focusElemWhenAllGone = focusElemWhenAllGone
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
    let focusRowElem = this.elem.nextElementSibling
    if (focusRowElem === null || !new DOMElement(focusRowElem).IsReal())
      focusRowElem = this.elem.previousElementSibling

    let focusElem
    if (focusRowElem !== null && new DOMElement(focusRowElem).IsReal())
      focusElem = focusRowElem.querySelector('button[name="removeEnchant"]')
    else
      focusElem = this.focusElemWhenAllGone

    if (focusElem)
      focusElem.focus()

    let ourRowNr = this.allRows.indexOf(this)
    if (ourRowNr != -1)
      this.allRows.splice(ourRowNr, 1)

    this.SendIDChange()

    super.Remove()
  }


  // ======== PRIVATE ========


  SetEnchant(enchant) {
    if (enchant === undefined) {
      this.enchantID = parseInt(this.idElem.value)
      enchant = this.GetEnchant()
    }
    else {
      this.enchantID = enchant.id
      this.idElem.value = enchant.id
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
    this.idElem.addEventListener('change', () => {
      this.enchantID = parseInt(this.idElem.value)
      let enchant = this.GetEnchant()

      this.UpdateLevelOptions(enchant)

      this.SendIDChange()

      ChangeEnchantCallback()
    })

    this.elem.querySelector('button[name="removeEnchant"]').addEventListener('click', () => {
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

    this.idElem.querySelectorAll('option').forEach((optionElem) => {
      let enchantID = parseInt(optionElem.value)

      if (enchantID != this.enchantID) {
        if (unusableEnchantIDs.has(enchantID))
          optionElem.setAttribute('disabled', 'disabled')
        else
          optionElem.removeAttribute('disabled')
      }
    })
  }


  UpdateEnchantOptions(itemID) {
    this.idElem.querySelectorAll('option').forEach((optionElem) => {
      optionElem.remove()
    })

    let itemInfo = g_itemInfosByID.get(itemID)

    let unusableEnchantIDs = this.GetUnusableEnchantIDs()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      if (itemInfo.CanHaveEnchant(enchantInfo.id)) {
        let enchantUnusable = unusableEnchantIDs.has(enchantInfo.id)
        let optionElem = document.createElement('option')
        optionElem.value = enchantInfo.id
        optionElem.textContent = enchantInfo.name
        if (enchantUnusable)
          optionElem.setAttribute('disabled', 'disabled')
        this.idElem.appendChild(optionElem)
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
