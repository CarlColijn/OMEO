/*
  Single enchant.

  Prerequisites:
  - enchantDetails.js

  Defined classes:
  - Enchant
    - id: char
    - level: int
*/
class Enchant {
  constructor(id, level) {
    // note our details
    this.id = id
    this.level = level

    // and get the extended details for us
    this.details = g_enchantDetailsByID[id]
  }
}
