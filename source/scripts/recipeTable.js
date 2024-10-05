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
    this.itemTemplateRow = new TemplateElement(tableElemJQ, 'item')

    this.nextCheckboxID = 0
  }


  SetItem(item) {
    let maxItemDepth = this.GetItemDepth(item)

    this.AddItemTree(item, maxItemDepth, 'f', g_rtSettings.resultLabel, undefined)
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
    let description
    switch (item.set) {
      case g_combined: description = g_rtSettings.combinedPrefix; break
      case g_source:   description = g_rtSettings.sourcePrefix; break
      case g_extra:    description = g_rtSettings.extraPrefix; break
      case g_desired:  description = g_rtSettings.desiredPrefix; break
    }

    description += item.info.name
    if (item.set === g_source)
      description += g_rtSettings.sourcePostfix.replace('#', item.nr)
    return description
  }


  AddEnchants(enchantTemplateElem, item) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = item.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined) {
        let enchantRowElemJQ = enchantTemplateElem.CreateExtraElement()

        enchantRowElemJQ.find('.name').text(enchant.info.name)
        enchantRowElemJQ.find('.level').text(GetRomanNumeralForLevel(enchant.level))
      }
    }
  }


  // returns string
  GetItemCost(item) {
    if (item.set !== g_combined)
      return g_rtSettings.noCost
    else if (item.cost == item.totalCost)
      return g_rtSettings.singleCost.replace('#s', item.cost)
    else
      return g_rtSettings.compoundCost.replace('#s', item.cost).replace('#t', item.totalCost)
  }


  LinkLabelToCheckbox(labelElemJQ, checkboxElemJQ) {
    let checkboxID = `check_${this.nextCheckboxID}`
    checkboxElemJQ.attr('id', checkboxID)
    labelElemJQ.attr('for', checkboxID)

    ++this.nextCheckboxID
  }


  SetChildHideState(rowInfo, hide) {
    rowInfo.numHides += (hide ? 1 : -1)
    if (rowInfo.numHides > 0)
      rowInfo.rowElemJQ.hide(g_rtSettings.expandCollapseSpeedMS)
    else
      rowInfo.rowElemJQ.show(g_rtSettings.expandCollapseSpeedMS)

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      this.SetChildHideState(childRowInfo, hide)
    })
  }


  NodeClicked(rowInfo) {
    rowInfo.isUserCollapsed = !rowInfo.isUserCollapsed

    if (rowInfo.isUserCollapsed) {
      rowInfo.mainTDElemJQ.html(g_rtSettings.expandGlyph)
      rowInfo.mainTDElemJQ.removeClass('treeLeft')
    }
    else {
      rowInfo.mainTDElemJQ.html(g_rtSettings.collapseGlyph)
      rowInfo.mainTDElemJQ.addClass('treeLeft')
    }

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      this.SetChildHideState(childRowInfo, rowInfo.isUserCollapsed)
    })
  }


  // returns RowInfo
  AddNewRow() {
    let newRowElemJQ = this.itemTemplateRow.CreateExtraElement()

    return {
      rowElemJQ: newRowElemJQ,
      treeNodeTemplateElem: new TemplateElement(newRowElemJQ, 'treeNode'),
      enchantTemplateElem: new TemplateElement(newRowElemJQ, 'enchant'),
      isUserCollapsed: false,
      numHides: 0,
      childRowInfos: []
    }
  }


  AddItemTree(item, numUnusedColumns, collapseTrail, placement, parentRowInfo) {
    let newRowInfo = this.AddNewRow()
    if (parentRowInfo !== undefined)
      parentRowInfo.childRowInfos.push(newRowInfo)
    let hasChildren = item.targetItem !== undefined

    let placementTDElemJQ = newRowInfo.rowElemJQ.find('.placementNode')

    let isExpandableNode = false
    for (let tdElemNr = 0; tdElemNr < collapseTrail.length; ++tdElemNr) {
      let tdElemJQ = newRowInfo.treeNodeTemplateElem.CreateExtraElement()

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
        isExpandableNode = true
        tdElemJQ.addClass('treeClick')
        tdElemJQ.html(g_rtSettings.collapseGlyph)
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
    let placementElemJQ = newRowInfo.rowElemJQ.find('.placement')
    if (isExpandableNode) {
      placementElemJQ.addClass('treeClick')
      placementElemJQ.click(() => {
        this.NodeClicked(newRowInfo)
      })
    }
    placementElemJQ.html(placement)
    if (item.renamePoint)
      newRowInfo.rowElemJQ.find('.renameInstructions').removeClass('hidden')
    newRowInfo.rowElemJQ.find('.description').text(this.GetItemDescription(item))
    this.AddEnchants(newRowInfo.enchantTemplateElem, item)
    newRowInfo.rowElemJQ.find('.priorWork').text(item.priorWork)
    newRowInfo.rowElemJQ.find('.cost').html(this.GetItemCost(item))

    let iconElemJQ = newRowInfo.rowElemJQ.find('.icon')
    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(iconElemJQ, item.id, hasEnchants)

    let labelElemJQ = newRowInfo.rowElemJQ.find('label')
    let checkboxElemJQ = newRowInfo.rowElemJQ.find('input')
    this.LinkLabelToCheckbox(labelElemJQ, checkboxElemJQ)

    if (hasChildren) {
      this.AddItemTree(item.targetItem, numUnusedColumns - 1, 'l' + collapseTrail, g_rtSettings.leftLabel, newRowInfo)
      this.AddItemTree(item.sacrificeItem, numUnusedColumns - 1, 'r' + collapseTrail, g_rtSettings.rightLabel, newRowInfo)
    }
  }
}
