/*
  Wrapper for the details table on the page.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js

  Defined classes:
  - DetailsTable
*/


// ======== PUBLIC ========


class DetailsTable {
  constructor(tableElemJQ) {
    // ==== PRIVATE ====
    this.tableElemJQ = tableElemJQ
    this.templateRowElemJQ = tableElemJQ.find('.template').first()
  }


  Clear() {
    this.tableElemJQ.find('.item').each((rowNr, rowElem) => {
      let rowElemJQ = $(rowElem)
      if (rowElemJQ.attr('data-real') != 0)
        rowElemJQ.remove()
      return true
    })
  }


  ShowItem(item) {
    this.Clear()
    this.AddItem(item, 0, 'Result') // adds the whole tree recursively
  }


  // ======== PRIVATE ========


  // returns jQueryElem
  AddNewRow() {
    let newRowElemJQ = this.templateRowElemJQ.clone()
    let rowParentElemJQ = this.templateRowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)

    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', 1)

    return newRowElemJQ
  }


  // returns string
  GetItemDescription(item) {
    let description = ''

    switch (item.set) {
      case g_combined: description = 'Combined '; break
      case g_source:   description = 'Source '; break
      case g_extra:    description = 'Extra '; break
      case g_desired:  description = 'Desired '; break
    }

    description += item.info.name
    if (item.set == g_source)
      description += ` nr. ${item.nr}`
    return description
  }


  // returns string
  GetItemEnchants(item) {
    let enchants = ''
    let isFirstEnchant = true
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = item.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined) {
        enchants += isFirstEnchant ? '' : '<br>'
        isFirstEnchant = false
        enchants += `${enchant.info.name} ${GetRomanNumeralForLevel(enchant.level)}`
      }
    }
    return enchants
  }


  // returns string
  GetItemCost(item) {
    if (item.set !== g_combined)
      return '-'
    else if (item.cost == item.totalCost)
      return `${item.cost}`
    else
      return `${item.cost} (${item.totalCost} in total)`
  }


  AddItem(item, indent, placement) {
    if (item !== undefined) {
      let newRowElemJQ = this.AddNewRow()

      let placementElemJQ = newRowElemJQ.find('.placement')
      placementElemJQ.css('padding-left', `+=${indent * 1.5}em`)
      placementElemJQ.text(placement)
      newRowElemJQ.find('.description').html(this.GetItemDescription(item))
      newRowElemJQ.find('.enchants').html(this.GetItemEnchants(item))
      newRowElemJQ.find('.priorWork').text(item.priorWork)
      newRowElemJQ.find('.cost').text(this.GetItemCost(item))

      this.AddItem(item.targetItem, indent + 1, 'Left')
      this.AddItem(item.sacrificeItem, indent + 1, 'Right')
    }
  }
}
