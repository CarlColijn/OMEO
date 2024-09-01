/*
  Wrapper for a single row in a combined item table.

  Prerequisites:
  - tableRow.js
  - enchantInfo.js
  - combinedEnchantRow.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - CombinedItemRow
*/


// ======== PUBLIC ========


class CombinedItemRow extends TableRow {
  constructor(ShowDetails, rowElemJQ) {
    super(rowElemJQ)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    let enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    this.enchantTemplateRow = new CombinedEnchantRow(enchantTemplateRowElemJQ)
  }


  // returns CombinedItemRow
  CreateNew(item) {
    let newRowElemJQ = super.MakeExtraRealRow()
    let newItemRow = new CombinedItemRow(this.ShowDetails, newRowElemJQ)

    newItemRow.SetItem(item)

    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(newItemRow.rowElemJQ.find('.icon'), item.id, hasEnchants)

    if (hasEnchants)
      newItemRow.SetEnchants(item.enchantsByID)

    return newItemRow
  }


  // ======== PRIVATE ========


  SetItem(item) {
    this.rowElemJQ.find('.count').text(item.count)
    this.rowElemJQ.find('.type').text(item.info.name + this.GetItemSuffix(item))
    this.rowElemJQ.find('.priorWork').text(item.priorWork)
    this.rowElemJQ.find('.cost').text(item.totalCost)
    let showDetailsElemJQ = this.rowElemJQ.find('[name=show]')
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
