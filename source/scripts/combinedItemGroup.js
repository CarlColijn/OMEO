/*
  Wrapper for a single row group in a combined item table.

  Prerequisites:
  - templateElement.js
  - combinedItemRow.js

  Defined classes:
  - CombinedItemGroupTemplate
  - CombinedItemGroup
*/


// ======== PUBLIC ========


class CombinedItemGroupTemplate extends TemplateElement {
  constructor(parentElem, elementClass, ShowDetails) {
    super(parentElem, elementClass)

    this.ShowDetails = ShowDetails
  }


  // returns CombinedItemGroup
  CreateNew(match) {
    let newTBodyElem = super.CreateExtraElement()
    let newItemGroup = new CombinedItemGroup(newTBodyElem, this.ShowDetails, match)

    return newItemGroup
  }
}




class CombinedItemGroup extends RealElement {
  constructor(tbodyElem, ShowDetails, match) {
    super(tbodyElem)

    this.SetHeading(match)

    this.itemTemplateRow = new CombinedItemRowTemplate(this.elem, 'item', ShowDetails)
  }


  // returns CombinedItemRow
  AddItem(ratedItem) {
    return this.itemTemplateRow.CreateNew(ratedItem)
  }


  // ======== PRIVATE ========


  GetHeadingClassForMatch(match) {
    switch (match) {
      case g_exactMatch:
        return '.descriptionExact'
      case g_betterMatch:
        return '.descriptionBetter'
      case g_lesserMatch:
        return '.descriptionLesser'
      case g_mixedMatch:
        return '.descriptionMixed'
    }
  }


  SetHeading(match) {
    let headingClass = this.GetHeadingClassForMatch(match)
    let headingElem = this.elem.querySelector(headingClass)
    headingElem.classList.remove('template')
  }
}
