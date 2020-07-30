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
      this.levelElemJQ = rowElemJQ.find('select[name="level"]')
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

    // link up it's buttons and dropdown handlers, if needed
    if (this.set == g_source || this.set == g_desired) {
      // define the level updater for this enchant row
      let idElemJQ = newRowElemJQ.find('select[name="enchantID"]')
      let levelElemJQ = newRowElemJQ.find('select[name="level"]')

      // make the level options update according to the selected enchant
      idElemJQ.change(() => {
        this.UpdateLevelOptions(idElemJQ, levelElemJQ)
      })

      // and let the user be able to remove the enchant as well
      newRowElemJQ.find('button[name="removeEnchant"]').click(() => {
        // just kill our row
        newRowElemJQ.remove()
      })
    }

    // set it's enchant, if needed
    if (enchant !== undefined)
      newEnchantRow.SetEnchant(enchant)
    else
      newEnchantRow.UpdateLevelOptions(newEnchantRow.idElemJQ, newEnchantRow.levelElemJQ)

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
      parseInt(this.levelElemJQ.val())
    )
  }


  // sets the enchant
  SetEnchant(enchant) {
    if (this.set == g_source || this.set == g_desired) {
      this.idElemJQ.val(enchant.id)
      this.UpdateLevelOptions(this.idElemJQ, this.levelElemJQ)
      this.levelElemJQ.val(enchant.level)
    }
    else if (this.set == g_combined) {
      this.nameElemJQ.text(enchant.details.name)
      this.levelElemJQ.text(enchant.level)
    }
  }

  // updates the enchant level options on the row
  UpdateLevelOptions(idElemJQ, levelElemJQ) {
    // look which new enchant has been chosen
    let newEnchant = g_enchantDetailsByID[idElemJQ.val()]

    // look what level the new option should use
    let selectLevel = parseInt(levelElemJQ.val())
    if (isNaN(selectLevel))
      selectLevel = 1
    selectLevel = Math.max(1, Math.min(newEnchant.maxLevel, selectLevel))

    // and give the new enchant's level options
    levelElemJQ.find('option').remove()
    for (let level = 1; level <= newEnchant.maxLevel; ++level)
      levelElemJQ.append(`<option value="${level}"${level == selectLevel ? ' selected' : ''}>${level}</option>`)
  }
}
