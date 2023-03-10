/*
  Combines enchants from two items.

  Prerequisites:
  - enchantInfo.js
  - item.js

  Defined classes:
  - EnchantCombiner
    - isRelevant: bool
*/


// ======== PUBLIC ========


class EnchantCombiner {
  constructor(targetItem, sacrificeItem, enchantInfo) {
    // ==== PRIVATE ====
    this.enchantInfo = enchantInfo

    this.targetItem = targetItem
    this.targetEnchant = targetItem.enchantsByID.get(enchantInfo.id)
    this.onTarget = this.targetEnchant !== undefined

    this.sacrificeItem = sacrificeItem
    this.sacrificeEnchant = sacrificeItem.enchantsByID.get(enchantInfo.id)
    this.onSacrifice = this.sacrificeEnchant !== undefined

    this.targetLevel = this.onTarget ? this.targetEnchant.level : 0
    this.sacrificeLevel = this.onSacrifice ? this.sacrificeEnchant.level : 0

    // ==== PUBLIC ====
    this.isRelevant = this.onTarget || this.onSacrifice
  }


  // returns object;
  // - targetUsed: bool
  // - sacrificeUsed: bool
  // - combinedLevel: int
  // - cost: int
  Combine() {
    let combinedLevel
    let targetUsed
    let sacrificeUsed
    let costless
    if (!this.isRelevant) {
      targetUsed = false
      sacrificeUsed = false
      combinedLevel = 0
      costless = true
    }
    else if (this.targetLevel < this.sacrificeLevel) {
      targetUsed = false
      sacrificeUsed = true
      combinedLevel = this.sacrificeLevel
      costless = false
    }
    else if (this.targetLevel > this.sacrificeLevel) {
      targetUsed = true
      sacrificeUsed = false
      combinedLevel = this.targetLevel
      costless = this.sacrificeLevel == 0
    }
    else { // this.targetLevel == this.sacrificeLevel
      targetUsed = true
      sacrificeUsed = true
      combinedLevel = Math.min(this.targetLevel + 1, this.enchantInfo.maxLevel)
      costless = false
    }

    // difference for Bedrock: for the cost, do not multiply with the final
    // level, but with the level increase on the target item instead
    return {
      targetUsed: targetUsed,
      sacrificeUsed: sacrificeUsed,
      combinedLevel: combinedLevel,
      cost: costless ? 0 : this.MultiplierForItem(this.sacrificeItem) * combinedLevel
    }
  }


  // ======== PRIVATE ========


  // returns int
  MultiplierForItem(item) {
    return (
      item.info.isBook ?
      this.enchantInfo.bookMultiplier :
      this.enchantInfo.toolMultiplier
    )
  }
}
