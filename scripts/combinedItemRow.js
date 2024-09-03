/*
  Wrapper for a single row in a combined item table.

  Prerequisites:
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
  constructor(ShowDetails, rowElemJQ) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails
  }


  // returns CombinedItemRow
  CreateNew(item) {
    let newRowElemJQ = super.CreateExtraElement()
    let newItemRow = new CombinedItemRow(this.ShowDetails, newRowElemJQ)

    newItemRow.SetItem(item)

    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(newItemRow.elemJQ.find('.icon'), item.id, hasEnchants)

    if (hasEnchants)
      newItemRow.SetEnchants(item.enchantsByID)

    return newItemRow
  }
}




class CombinedItemRow extends RealElement {
  constructor(ShowDetails, rowElemJQ) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    let enchantTemplateRowElemJQ = this.elemJQ.find('.template').first()
    this.enchantTemplateRow = new CombinedEnchantRowTemplate(enchantTemplateRowElemJQ)
  }


  // ======== PRIVATE ========


  SetItem(item) {
    this.elemJQ.find('.count').text(item.count)
    this.elemJQ.find('.type').text(item.info.name + this.GetItemSuffix(item))
    this.elemJQ.find('.priorWork').text(item.priorWork)
    this.elemJQ.find('.cost').text(item.totalCost)
    let showDetailsElemJQ = this.elemJQ.find('[name=show]')
    if (item.set === g_source)
      showDetailsElemJQ.hide()
    else
      showDetailsElemJQ.click(() => {
        this.ShowDetails(item)
      })
  }


  GetItemSuffix(item) {
    switch (item.set) {
      case g_source:
        return ` (source nr. ${item.nr})`
      case g_extra:
        return ' (extra)'
      case g_combined:
        return ''
    }

    return ''
  }


  SetEnchants(enchantsByID) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.enchantTemplateRow.CreateNew(enchant)
    }
  }
}
