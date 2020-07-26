/*
  Wrapper for the details table on the page.

  Prerequisites:
  - dataSets.js
  - enchantDetails.js

  Defined classes:
  - DetailsTable
*/
class DetailsTable {
  constructor(tableElemJQ) {
    // note the elements
    this.tableElemJQ = tableElemJQ
    this.templateRowElemJQ = tableElemJQ.find('.template').first()
  }


  // clears us
  Clear() {
    this.tableElemJQ.find('.item').each((rowNr, rowElem) => {
      let rowElemJQ = $(rowElem)
      if (rowElemJQ.data('real') != 0)
        rowElemJQ.remove()
      return true
    })
  }


  // shows the details for the given item
  ShowItem(item) {
    // remove any old details
    this.Clear()

    // and spell out the new details
    this.AddItem(item, 0)
  }


  // adds the given item's details
  AddItem(item, indent) {
    // start the item row
    let newRowElemJQ = this.templateRowElemJQ.clone()
    let rowParentElemJQ = this.templateRowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)

    // make sure it is not a template row anymore
    newRowElemJQ.removeClass('template')
    newRowElemJQ.data('real', 1)

    // spell out the item description
    let description = ''
    if (item.set == g_combined)
      description += 'Combined '
    else if (item.set == g_source)
      description += 'Source '
    else if (item.set == g_extra)
      description += 'Extra '
    else if (item.set == g_desired)
      description += 'Desired '
    description += `${item.details.name} nr. ${item.nr}`
    let descriptionElemJQ = newRowElemJQ.find('.description')
    descriptionElemJQ.text(description)
    descriptionElemJQ.css('padding-left', `+=${indent}em`)

    // add enchants
    let enchants = ''
    let isFirstEnchant = true
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      let enchant = item.enchantsByID[g_enchantDetails[enchantNr].id]
      if (enchant !== undefined) {
        enchants += isFirstEnchant ? '' : '<br>'
        isFirstEnchant = false
        enchants += `${enchant.details.name} ${enchant.level}`
      }
    }
    newRowElemJQ.find('.enchants').html(enchants)

    // add costs, if appropriate
    let cost = ''
    if (item.set != g_combined)
      cost = '-'
    else {
      cost = item.cost
      if (item.cost != item.totalCost)
        cost += ` (${item.totalCost} in total)`
    }
    newRowElemJQ.find('.cost').text(cost)

    // add prior work
    newRowElemJQ.find('.priorWork').text(item.priorWork)

    // and also add sub items, if needed
    if (item.set == g_combined) {
      this.AddItem(item.targetItem, indent + 1)
      this.AddItem(item.sacrificeItem, indent + 1)
    }
  }
}
