/*
  Wrapper for a single row in a combined enchant table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchant.js

  Defined classes:
  - CombinedEnchantRowTemplate
  - CombinedEnchantRow
*/


// ======== PUBLIC ========


class CombinedEnchantRowTemplate extends TemplateElement {
  constructor(parentElemJQ, elementClass) {
    super(parentElemJQ, elementClass)
  }


  // returns CombinedEnchantRow
  CreateNew(enchant) {
    let newRowElemJQ = super.CreateExtraElement()

    return new CombinedEnchantRow(newRowElemJQ, enchant)
  }
}


class CombinedEnchantRow extends RealElement {
  constructor(rowElemJQ, enchant) {
    super(rowElemJQ)

    this.elemJQ.find('.name').text(enchant.info.name)
    this.elemJQ.find('.level').text(GetRomanNumeralForLevel(enchant.level))
  }
}
