/*
  Wrapper for a single row in an enchant table.

  Prerequisites:
  - dataSets.js
  - enchant.js

  Defined classes:
  - EnchantRow
    - set: char (s=source, d=desired, c=combined)
*/
class EnchantRow {
  constructor(rowElemJQ, set) {
    // note our set
    this.set = set

    // note the elements to use
    this.rowElemJQ = rowElemJQ
    if (set == g_source || set == g_desired) {
      this.idElemJQ = rowElemJQ.find('select[name="enchantID"]')
      this.levelElemJQ = rowElemJQ.find('input[name="level"]')
    }
    else if (set == g_combined) {
      this.nameElemJQ = rowElemJQ.find('.name')
      this.levelElemJQ = rowElemJQ.find('.level')
    }

    // and note whether we're real
    this.isReal = rowElemJQ.data('real') != 0
  }


  // whether the row is real
  IsReal() {
    return this.isReal
  }


  // creates a copy of us
  // returns the new row
  CreateNew(enchant) {
    // create the new row
    let newRowElemJQ = this.rowElemJQ.clone()
    let rowParentElemJQ = this.rowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)

    // make sure it is not a template row anymore
    newRowElemJQ.removeClass('template')
    newRowElemJQ.data('real', 1)

    // wrap it as a proper EnchantRow
    let newEnchantRow = new EnchantRow(newRowElemJQ, this.set)

    // link up it's buttons, if needed
    if (this.set == g_source || this.set == g_desired) {
      newRowElemJQ.find('button[name="removeEnchant"]').click(() => {
        // just kill our row
        newRowElemJQ.remove()
      })
    }

    // set it's enchant, if needed
    if (enchant !== undefined)
      newEnchantRow.SetEnchant(enchant)

    // and return the new row
    return newEnchantRow
  }


  // removes us
  Remove() {
    this.rowElemJQ.remove()
  }


  // gets the enchant
  GetEnchant() {
    return new Enchant(
      this.idElemJQ.val(),
      this.levelElemJQ.val(),
      this.levelElemJQ
    )
  }


  // sets the enchant
  SetEnchant(enchant) {
    if (this.set == g_source || this.set == g_desired) {
      this.idElemJQ.val(enchant.id)
      this.levelElemJQ.val(enchant.level)
    }
    else if (this.set == g_combined) {
      this.nameElemJQ.text(enchant.details.name)
      this.levelElemJQ.text(enchant.level)
    }
  }
}
