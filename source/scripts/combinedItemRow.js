/*
  Wrapper for a single row in a combined item table.

  Prerequisites:
  - settings.js
  - templateElement.js
  - enchantInfo.js
  - combinedEnchantRow.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - CombinedItemRowTemplate
  - CombinedItemRow
*/


// ======== PUBLIC ========


class CombinedItemRowTemplate extends TemplateElement {
  constructor(parentElem, elementClass, ShowDetails) {
    super(parentElem, elementClass)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails
  }


  // returns CombinedItemRow
  CreateNew(ratedItem) {
    let newRowElem = super.CreateExtraElement()
    let newItemRow = new CombinedItemRow(newRowElem, this.ShowDetails)

    let item = ratedItem.item
    newItemRow.SetItem(ratedItem)

    let hasEnchants = item.enchantsByID.size > 0
    let iconElem = newItemRow.elem.querySelector('.icon')
    SetIcon(iconElem, item.id, hasEnchants)

    if (hasEnchants)
      newItemRow.SetEnchants(item.enchantsByID)

    return newItemRow
  }
}




class CombinedItemRow extends RealElement {
  constructor(rowElem, ShowDetails) {
    super(rowElem)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.enchantTemplateRow = new CombinedEnchantRowTemplate(this.elem, 'enchant')
  }


  // ======== PRIVATE ========


  SetItem(ratedItem) {
    let item = ratedItem.item

    this.elem.querySelector('.count').textContent = item.count
    this.elem.querySelector('.type').textContent = item.info.name
    this.elem.querySelector('.priorWork').textContent = item.priorWork
    this.elem.querySelector('.cost').textContent = item.totalCost + (item.includesRename ? 1 : 0)
    let showDetailsElem = this.elem.querySelector('[name=show]')
    if (item.set === g_source)
      showDetailsElem.style.display = 'none'
    else
      showDetailsElem.addEventListener('click', () => {
        this.ShowDetails(item)
      })
  }


  SetEnchants(enchantsByID) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.enchantTemplateRow.CreateNew(enchant)
    }
  }
}
