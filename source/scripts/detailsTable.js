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
    this.AddItem(item, 0) // adds the whole tree recursively
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
    let set = ''
    switch (item.set) {
      case g_combined: set = 'Combined'; break
      case g_source:   set = 'Source'; break
      case g_extra:    set = 'Extra'; break
      case g_desired:  set = 'Desired'; break
    }

    return `${set} ${item.info.name} nr. ${item.nr}`
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
        enchants += `${enchant.info.name} ${enchant.level}`
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


  AddItem(item, indent) {
    if (item !== undefined) {
      let newRowElemJQ = this.AddNewRow()

      let descriptionElemJQ = newRowElemJQ.find('.description')
      descriptionElemJQ.css('padding-left', `+=${indent}em`)
      descriptionElemJQ.text(this.GetItemDescription(item))
      newRowElemJQ.find('.enchants').html(this.GetItemEnchants(item))
      newRowElemJQ.find('.priorWork').text(item.priorWork)
      newRowElemJQ.find('.cost').text(this.GetItemCost(item))

      this.AddItem(item.targetItem, indent + 1)
      this.AddItem(item.sacrificeItem, indent + 1)
    }
  }
}
