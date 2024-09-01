/*
  Wrapper for a single row in a combined enchant table.

  Prerequisites:
  - tableRow.js
  - dataSets.js
  - enchant.js

  Defined classes:
  - CombinedEnchantRow
*/


// ======== PUBLIC ========


class CombinedEnchantRow extends TableRow {
  constructor(rowElemJQ) {
    super(rowElemJQ)
  }


  // returns CombinedEnchantRow
  CreateNew(enchant) {
    let newRowElemJQ = super.MakeExtraRealRow()

    newRowElemJQ.find('.name').text(enchant.info.name)
    newRowElemJQ.find('.level').text(GetRomanNumeralForLevel(enchant.level))

    return new CombinedEnchantRow(newRowElemJQ)
  }
}
