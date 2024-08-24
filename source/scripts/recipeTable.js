/*
  Wrapper for the recipe table on the page.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - guiHelpers.js

  Defined classes:
  - RecipeTable
*/


// ======== PUBLIC ========


class RecipeTable {
  constructor(tableElemJQ) {
    // ==== PRIVATE ====
    this.tableElemJQ = tableElemJQ
    this.templateRowElemJQ = tableElemJQ.find('.template').first()
    this.allRowInfos = []
  }


  SetItem(item) {
    let maxItemDepth = this.GetItemDepth(item)

    this.AddItemTree(item, maxItemDepth, 'f', 'Result', undefined)
    this.tableElemJQ.find('th:first').attr('colspan', maxItemDepth + 1)
  }


  // ======== PRIVATE ========


  // returns int
  GetItemDepth(item) {
    if (item === undefined)
      return 0
    if (item.targetItem === undefined)
      return 1

    return 1 + Math.max(
      this.GetItemDepth(item.targetItem),
      this.GetItemDepth(item.sacrificeItem)
    )
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


  SetChildHideState(rowInfo, hide) {
    rowInfo.numHides += (hide ? 1 : -1)
    if (rowInfo.numHides > 0)
      rowInfo.rowElemJQ.hide(100)
    else
      rowInfo.rowElemJQ.show(100)

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      this.SetChildHideState(childRowInfo, hide)
    })
  }


  NodeClicked(rowInfo) {
    rowInfo.isUserCollapsed = !rowInfo.isUserCollapsed

    if (rowInfo.isUserCollapsed) {
      rowInfo.mainTDElemJQ.html('&boxplus;')
      rowInfo.mainTDElemJQ.removeClass('treeLeft')
    }
    else {
      rowInfo.mainTDElemJQ.html('&boxminus;')
      rowInfo.mainTDElemJQ.addClass('treeLeft')
    }

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      this.SetChildHideState(childRowInfo, rowInfo.isUserCollapsed)
    })
  }


  // returns RowInfo
  AddNewRow() {
    let newRowElemJQ = this.templateRowElemJQ.clone()

    let rowParentElemJQ = this.templateRowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)

    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', 1)

    return {
      rowElemJQ: newRowElemJQ,
      isUserCollapsed: false,
      numHides: 0,
      childRowInfos: []
    }
  }


  AddItemTree(item, numUnusedColumns, collapseTrail, placement, parentRowInfo) {
    let newRowInfo = this.AddNewRow()
    this.allRowInfos.push(newRowInfo)
    if (parentRowInfo !== undefined)
      parentRowInfo.childRowInfos.push(newRowInfo)
    let hasChildren = item.targetItem !== undefined

    let placementTDElemJQ = newRowInfo.rowElemJQ.find('td:first')

    for (let tdElemNr = 0; tdElemNr < collapseTrail.length; ++tdElemNr) {
      let tdElemJQ = $('<td class="treeNode"></td>')

      let isLeafNode = tdElemNr == 0
      let isNonLeafNode = tdElemNr > 0
      let isExpandableLeafNode = isLeafNode && hasChildren
      let isUnexpandableLeafNode = isLeafNode && !hasChildren
      let isOneBeforeLeafNode = tdElemNr == 1
      let isPassthroughFromLeftNode =
        !isNonLeafNode ?
        false :
        collapseTrail[tdElemNr - 1] == 'l'

      if (isLeafNode)
        newRowInfo.mainTDElemJQ = tdElemJQ

      if (isExpandableLeafNode) {
        tdElemJQ.addClass('treeClick')
        tdElemJQ.html('&boxminus;')
        newRowInfo.mainTDElemJQ.click(() => {
          this.NodeClicked(newRowInfo)
        })
      }

      if (isUnexpandableLeafNode || isOneBeforeLeafNode)
        tdElemJQ.addClass('treeTop')

      if (isExpandableLeafNode || isPassthroughFromLeftNode)
        tdElemJQ.addClass('treeLeft')

      tdElemJQ.prependTo(newRowInfo.rowElemJQ)
    }

    placementTDElemJQ.attr('colspan', numUnusedColumns)
    newRowInfo.rowElemJQ.find('.placement').html(placement)
    newRowInfo.rowElemJQ.find('.description').html(this.GetItemDescription(item))
    newRowInfo.rowElemJQ.find('.enchants').html(this.GetItemEnchants(item))
    newRowInfo.rowElemJQ.find('.priorWork').text(item.priorWork)
    newRowInfo.rowElemJQ.find('.cost').text(this.GetItemCost(item))

    let iconElemJQ = newRowInfo.rowElemJQ.find('.icon')
    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(iconElemJQ, item.id, hasEnchants)

    if (hasChildren) {
      this.AddItemTree(item.targetItem, numUnusedColumns - 1, 'l' + collapseTrail, 'Left', newRowInfo)
      this.AddItemTree(item.sacrificeItem, numUnusedColumns - 1, 'r' + collapseTrail, 'Right', newRowInfo)
    }
  }
}
