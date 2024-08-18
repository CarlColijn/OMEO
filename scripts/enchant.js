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
  static Rehydrate(enchant) {
    Object.setPrototypeOf(enchant, Enchant.prototype);
    enchant.info = EnchantInfo.GetRehydrated(enchant.info)
  }


  constructor(id, level) {
    // ==== PUBLIC ====
    this.id = id
    this.level = level
    this.info = g_enchantInfosByID.get(id)
  }
}
