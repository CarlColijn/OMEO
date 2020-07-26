/*
  Single enchant.

  Prerequisites:
  - enchantDetails.js

  Defined classes:
  - Enchant
    - id: char
    - level:
      - string for freshly form-grabbed enchants
      - int for computed and validated enchants
    - levelElemJQ: jQuery elem (only on form-grabbed enchants)
*/
class Enchant {
  constructor(id, level, levelElemJQ) {
    // note our details
    this.id = id
    this.level = level
    this.levelElemJQ = levelElemJQ

    // and get the extended details for us
    this.details = g_enchantDetailsByID[id]
  }


  // validates the enchant
  // returns if the enchant is valid
  Validate(form) {
    // validate our data
    let allOK = true
    this.level = parseInt(this.level)
    if (isNaN(this.level)) {
      // level in error -> tell
      form.NoteError(this.levelElemJQ, 'This is not a number')
      allOK = false
    }
    else if (this.level > this.details.maxLevel) {
      // level too high -> tell
      form.NoteError(this.levelElemJQ, 'This is higher than the max')
      allOK = false
    }

    // and return the verdict
    return allOK
  }
}
