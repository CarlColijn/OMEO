/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchantSection.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - SourceItemRowTemplate
  - SourceItemRow
    - nr: int
*/


// ======== PUBLIC ========


class SourceItemRowTemplate extends TemplateElement {
  constructor(parentElem, elementClass) {
    super(parentElem, elementClass)

    this.SetupItemOptions()
  }


  // returns SourceItemRow
  CreateNew(nr, item, allRows, giveFocus, focusElemWhenAllGone) {
    let newRowElem = super.CreateExtraElement()
    let newItemRow = new SourceItemRow(newRowElem, allRows)

    newItemRow.SetNumber(nr)

    item = newItemRow.EnsureAppropriateItemUsed(item)
    newItemRow.SetItem(item)

    newItemRow.HookUpGUI(item)

    newItemRow.focusElemWhenAllGone = focusElemWhenAllGone
    if (giveFocus)
      newItemRow.idElem.focus()

    return newItemRow
  }


  // ======== PRIVATE ========


  SetupItemOptions() {
    let itemSelectElem = this.elem.querySelector('select[name="itemID"]')
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      let optionElem = document.createElement('option')
      optionElem.value = itemInfo.id
      optionElem.textContent = itemInfo.name
      itemSelectElem.appendChild(optionElem)
    }
  }
}




class SourceItemRow extends RealElement {
  constructor(rowElem, allRows) {
    super(rowElem)

    // ==== PUBLIC ====
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    this.nrElem = rowElem.querySelector('.nr')
    this.countElem = rowElem.querySelector('input[name="count"]')
    this.countErrorElem = rowElem.querySelector('.error')
    this.iconElem = rowElem.querySelector('.icon')
    this.idElem = rowElem.querySelector('select[name="itemID"]')
    this.priorWorkElem = new ButtonStrip(rowElem.querySelector('.priorWorkInput'))

    this.allRows = allRows

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElem = this.elem.querySelector('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElem, this.elem, EnchantStateChangedHandler)
  }


  Remove() {
    let focusRowElem = this.elem.nextElementSibling
    if (focusRowElem === null || !new DOMElement(focusRowElem).IsReal())
      focusRowElem = this.elem.previousElementSibling

    let focusElem
    if (focusRowElem !== null && new DOMElement(focusRowElem).IsReal())
      focusElem = focusRowElem.querySelector('button[name="removeItem"]')
    else
      focusElem = this.focusElemWhenAllGone

    if (focusElem)
      focusElem.focus()

    this.enchantSection.RemoveEnchants()
    super.Remove()

    let nextRowNr = this.nr
    this.allRows.splice(nextRowNr - 1, 1)

    for (; nextRowNr <= this.allRows.length; ++nextRowNr)
      this.allRows[nextRowNr - 1].SetNumber(nextRowNr)
  }


  SetNumber(nr) {
    this.nr = nr
    this.elem.dataset.nr = nr
    this.nrElem.textContent = nr
  }


  SetCount(newCount) {
    this.countElem.value = newCount
    this.countErrorElem.style.display = 'none'
  }


  // returns object:
  // - item: Item
  // - withCountError: bool
  GetItem() {
    let count = parseInt(this.countElem.value)
    let withCountError = isNaN(count)
    let itemID = parseInt(this.idElem.value)
    let priorWork = this.priorWorkElem.GetSelectionNr()

    let item = new Item(withCountError ? 1 : count, g_source, itemID, priorWork)
    this.enchantSection.AddEnchantsToItem(item)

    item.nr = parseInt(this.elem.dataset.nr)

    return {
      item: item,
      withCountError: withCountError
    }
  }


  SetItem(item) {
    this.itemID = item.id

    this.SetCount(item.count)
    this.idElem.value = item.id
    this.SetupPriorWorkOptions()
    this.priorWorkElem.SetSelectionNr(item.priorWork)

    this.enchantSection.ChangeItem(item)
  }


  // ======== PRIVATE ========


  // returns Item
  SyncCurrentItemWithoutEnchants() {
    this.itemID = parseInt(this.idElem.value)
    return new Item(
      1,
      g_source,
      parseInt(this.itemID),
      0
    )
  }


  SetupPriorWorkOptions() {
    this.priorWorkElem.SetOptions([0,1,2,3,4,5,6], undefined)
  }


  // returns Item
  EnsureAppropriateItemUsed(item) {
    if (item === undefined) {
      item = new Item(
        1,
        g_source,
        parseInt(this.idElem.value),
        0
      )
    }

    return item
  }


  HookUpGUI(item) {
    this.elem.querySelector('button[name="removeItem"]').addEventListener('click', () => {
      this.Remove()
    })

    this.countElem.addEventListener('focusout', () => {
      let count = parseInt(this.countElem.value)
      if (isNaN(count))
        this.countErrorElem.style.display = 'block'
      else
        this.countErrorElem.style.display = 'none'
    })

    this.idElem.addEventListener('change', () => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElem, this.itemID, hasEnchants)
  }
}
