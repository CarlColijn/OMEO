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
  constructor(tbodyElemJQ, ShowDetails) {
    super(tbodyElemJQ)

    this.ShowDetails = ShowDetails
  }


  // returns CombinedItemGroup
  CreateNew(match) {
    let newTBodyElemJQ = super.CreateExtraElement()
    let newItemGroup = new CombinedItemGroup(newTBodyElemJQ, this.ShowDetails, match)

    return newItemGroup
  }
}




class CombinedItemGroup extends RealElement {
  constructor(tbodyElemJQ, ShowDetails, match) {
    super(tbodyElemJQ)

    this.SetHeading(match)

    let templateRowElemJQ = this.elemJQ.find('.template.item').first()
    this.itemTemplateRow = new CombinedItemRowTemplate(templateRowElemJQ, ShowDetails)
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
    this.elemJQ.find(this.GetHeadingClassForMatch(match)).removeClass('template')
  }
}