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
  constructor(parentElem, elementClass) {
    super(parentElem, elementClass)
  }


  // returns CombinedEnchantRow
  CreateNew(enchant) {
    let newRowElem = super.CreateExtraElement()

    return new CombinedEnchantRow(newRowElem, enchant)
  }
}


class CombinedEnchantRow extends RealElement {
  constructor(rowElem, enchant) {
    super(rowElem)

    this.elem.querySelector('.name').textContent = enchant.info.name
    this.elem.querySelector('.level').textContent = GetRomanNumeralForLevel(enchant.level)
  }
}
