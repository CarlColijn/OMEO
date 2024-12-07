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
  constructor(tableElem) {
    // ==== PRIVATE ====
    this.tableElem = tableElem
    this.itemTemplateRow = new TemplateElement(tableElem, 'item')

    this.nextCheckboxID = 0
  }


  SetItem(item) {
    let maxItemDepth = this.GetItemDepth(item)

    this.AddItemTree(item, maxItemDepth, 'f', g_rtSettings.resultLabel, undefined)
    // Note: only the 1st th needs the colspan, and querySelector only returns the 1st
    this.tableElem.querySelector('th').setAttribute('colspan', maxItemDepth + 1)
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
        let enchantRowElem = enchantTemplateElem.CreateExtraElement()

        enchantRowElem.querySelector('.name').textContent = enchant.info.name
        enchantRowElem.querySelector('.level').textContent = GetRomanNumeralForLevel(enchant.level)
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


  LinkLabelToCheckbox(labelElem, checkboxElem) {
    let checkboxID = `check_${this.nextCheckboxID}`
    checkboxElem.setAttribute('id', checkboxID)
    labelElem.setAttribute('for', checkboxID)

    ++this.nextCheckboxID
  }


  GatherAnimationInfos(hide, rowInfo, rowElemInfos, tdElemInfos) {
    rowInfo.numHides += (hide ? 1 : -1)
    let mustShow = rowInfo.numHides == 0

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      rowElemInfos.push({
        elem: childRowInfo.rowElem,
        mustShow: mustShow
      })
      childRowInfo.rowElem.querySelectorAll('.sizer').forEach((tdElem) => {
        tdElemInfos.push({
          elem: tdElem,
          mustShow: mustShow,
          displayStyle: 'block'
        })
      })

      this.GatherAnimationInfos(hide, childRowInfo, rowElemInfos, tdElemInfos)
    })
  }


  NodeClicked(rowInfo) {
    rowInfo.isUserCollapsed = !rowInfo.isUserCollapsed

    rowInfo.expanderElem.innerHTML =
      rowInfo.isUserCollapsed ?
      g_rtSettings.expandGlyph :
      g_rtSettings.collapseGlyph

    let rowElemInfos = []
    let tdElemInfos = []
    this.GatherAnimationInfos(rowInfo.isUserCollapsed, rowInfo, rowElemInfos, tdElemInfos)

    AnimateElementsVisibility(tdElemInfos, g_rtSettings.expandCollapseSpeedMS, (started) => {
      if (started) {
        if (!rowInfo.isUserCollapsed)
          rowInfo.mainTDElem.classList.add('treeLeft')

        rowElemInfos.forEach((rowElemInfo) => {
          if (rowElemInfo.mustShow)
            rowElemInfo.elem.style.display = 'table-row'
        })
      }
      else {
        if (rowInfo.isUserCollapsed)
          rowInfo.mainTDElem.classList.remove('treeLeft')

        rowElemInfos.forEach((rowElemInfo) => {
          if (!rowElemInfo.mustShow)
            rowElemInfo.elem.style.display = 'none'
        })
      }
    })
  }


  // returns RowInfo
  AddNewRow() {
    let newRowElem = this.itemTemplateRow.CreateExtraElement()

    return {
      rowElem: newRowElem,
      treeNodeTemplateElem: new TemplateElement(newRowElem, 'treeNode'),
      enchantTemplateElem: new TemplateElement(newRowElem, 'enchant'),
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

    let placementTDElem = newRowInfo.rowElem.querySelector('.placementNode')

    let isExpandableNode = false
    for (let tdElemNr = 0; tdElemNr < collapseTrail.length; ++tdElemNr) {
      let tdElem = newRowInfo.treeNodeTemplateElem.CreateExtraElement()

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
        newRowInfo.mainTDElem = tdElem

      if (isExpandableLeafNode) {
        isExpandableNode = true
        newRowInfo.expanderElem = tdElem.querySelector('.expander')
        tdElem.classList.add('treeClick')
        newRowInfo.expanderElem.innerHTML = g_rtSettings.collapseGlyph
        newRowInfo.mainTDElem.addEventListener('click', () => {
          this.NodeClicked(newRowInfo)
        })
      }

      if (isUnexpandableLeafNode || isOneBeforeLeafNode)
        tdElem.classList.add('treeTop')

      if (isExpandableLeafNode || isPassthroughFromLeftNode)
        tdElem.classList.add('treeLeft')

      newRowInfo.rowElem.prepend(tdElem)
    }

    placementTDElem.setAttribute('colspan', numUnusedColumns)
    let placementElem = newRowInfo.rowElem.querySelector('.placement')
    if (isExpandableNode) {
      placementElem.classList.add('treeClick')
      placementElem.addEventListener('click', () => {
        this.NodeClicked(newRowInfo)
      })
    }
    placementElem.innerHTML = placement
    if (item.renamePoint)
      newRowInfo.rowElem.querySelector('.renameInstructions').classList.remove('hidden')
    newRowInfo.rowElem.querySelector('.description').textContent = this.GetItemDescription(item)
    this.AddEnchants(newRowInfo.enchantTemplateElem, item)
    newRowInfo.rowElem.querySelector('.priorWork').textContent = item.priorWork
    newRowInfo.rowElem.querySelector('.cost').innerHTML = this.GetItemCost(item)

    let iconElem = newRowInfo.rowElem.querySelector('.icon')
    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(iconElem, item.id, hasEnchants)

    let labelElem = newRowInfo.rowElem.querySelector('label')
    let checkboxElem = newRowInfo.rowElem.querySelector('input')
    this.LinkLabelToCheckbox(labelElem, checkboxElem)

    if (hasChildren) {
      this.AddItemTree(item.targetItem, numUnusedColumns - 1, 'l' + collapseTrail, g_rtSettings.leftLabel, newRowInfo)
      this.AddItemTree(item.sacrificeItem, numUnusedColumns - 1, 'r' + collapseTrail, g_rtSettings.rightLabel, newRowInfo)
    }
  }
}
