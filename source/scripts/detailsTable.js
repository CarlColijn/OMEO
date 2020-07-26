/*
  Wrapper for the details table on the page.

  Prerequisites:
  - dataSets.js
  - enchantDetails.js

  Defined classes:
  - DetailsTable
*/
class DetailsTable {
  constructor(rootElemJQ) {
    // note the elements
    this.rootElemJQ = rootElemJQ
  }


  // clears us
  Clear() {
    this.rootElemJQ.find('ul').remove()
    this.rootElemJQ.find('li').remove()
  }


  // shows the details for the given item
  ShowItem(item) {
    // remove any old details
    this.Clear()

    // and spell out the new details
    this.AddItemToNode(item, this.rootElemJQ)
  }


  // adds the given item's details to the given node
  AddItemToNode(item, nodeJQ) {
    // start the node
    let nodeHTML = '<li>'

    // spell out the item set
    if (item.set == g_combined)
      nodeHTML += 'Combined '
    else if (item.set == g_source)
      nodeHTML += 'Source '
    else if (item.set == g_extra)
      nodeHTML += 'Extra '
    else if (item.set == g_desired)
      nodeHTML += 'Desired '

    // add the item id
    nodeHTML += `${item.details.name} nr. ${item.nr}`

    // add costs, if appropriate
    if (item.set == g_combined) {
      nodeHTML += `; costs ${item.cost}`
      if (item.cost != item.totalCost)
        nodeHTML += ` (${item.totalCost} in total)`
    }

    // add enchants
    let isFirstEnchant = true
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      let enchant = item.enchantsByID[g_enchantDetails[enchantNr].id]
      if (enchant !== undefined) {
        nodeHTML += isFirstEnchant ? ':<br>' : ', '
        isFirstEnchant = false
        nodeHTML += `${enchant.details.name} ${enchant.level}`
      }
    }

    // close off the node
    nodeHTML += '</li>'

    // add it
    nodeJQ.append(nodeHTML)

    // and also add subnodes, if needed
    if (item.set == g_combined) {
      nodeJQ.append('<ul/>')
      let subNodeJQ = nodeJQ.find('ul')
      this.AddItemToNode(item.targetItem, subNodeJQ)
      this.AddItemToNode(item.sacrificeItem, subNodeJQ)
    }
  }
}
