/*
  Single enchant.

  Prerequisites:
  - enchantInfo.js

  Defined classes:
  - Enchant
    - id: char
    - level: int
    - info: EnchantInfo
*/


// ======== PUBLIC ========


class Enchant {
  constructor(id, level) {
    // ==== PUBLIC ====
    this.id = id
    this.level = level
    this.info = g_enchantInfosByID.get(id)
  }
}
