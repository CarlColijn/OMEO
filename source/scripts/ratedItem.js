/*
  Rating details for combine result items.

  Prerequisites:
  - item.js

  Defined constants:
  - g_exactMatch
  - g_betterMatch
  - g_lesserMatch
  - g_mixedMatch

  Defined classes:
  - RatedItem:
    - item: Item
    - isSource: bool
    - enchantMatch: int (one of the g_xxxMatch constants)
    - enchantRating: float (lower is better)
    - priorWorkRating: float (lower is better)
    - totalCostRating: float (lower is better)
    - totalRating: float (lower is better)
*/


// ======== PUBLIC ========


// Note: this is actually a bitmask
const g_exactMatch = 0
const g_betterMatch = 1
const g_lesserMatch = 2
const g_mixedMatch = 3


function RehydrateRatedItems(ratedItems) {
  ratedItems.forEach((ratedItem) => {
    RatedItem.Rehydrate(ratedItem)
  })
}


// ======== PRIVATE ========


const g_enchantWeight = 50
const g_unwantedCurseWeight = 10
const g_priorWorkWeight = 1
const g_totalCostWeight = 1/50


class RatedItem {
  // ======== PUBLIC ========


  static Rehydrate(ratedItem) {
    Object.setPrototypeOf(ratedItem, RatedItem.prototype);
    Item.Rehydrate(ratedItem.item)
  }


  constructor(item, desiredItem) {
    this.item = item

    this.AddSourceDetails()
    this.AddEnchantDetails(desiredItem)
    this.AddPriorWorkDetails()
    this.AddTotalCostDetails()

    this.AddTotalRating()
  }


  // ======== PRIVATE ========


  AddSourceDetails() {
    this.isSource = this.item.set === g_source
  }


  AddEnchantDetails(desiredItem) {
    this.enchantRating = 0.0
    let missesEnchants = false
    let extraEnchants = false

    // all enchants on desired, missing or not on combined
    desiredItem.enchantsByID.forEach((desiredEnchant, id) => {
      let levelDiff = 0
      if (this.item.enchantsByID.has(id)) {
        let itemEnchant = this.item.enchantsByID.get(id)
        levelDiff = desiredEnchant.level - itemEnchant.level
        if (levelDiff > 0)
          missesEnchants = true
        else if (levelDiff < 0)
          extraEnchants = true
      }
      else {
        levelDiff = desiredEnchant.level
        missesEnchants = true
      }

      this.enchantRating += (levelDiff / desiredEnchant.info.maxLevel)
    })

    // all enchants missing on desired
    this.item.enchantsByID.forEach((itemEnchant, id) => {
      if (!desiredItem.enchantsByID.has(id)) {
        extraEnchants = true
        let extraPenalty = itemEnchant.info.isCurse ? g_unwantedCurseWeight : 1
        this.enchantRating -= (itemEnchant.level / itemEnchant.info.maxLevel) * extraPenalty
      }
    })

    this.enchantRating *= g_enchantWeight

    this.enchantMatch =
      (missesEnchants ? g_lesserMatch : 0) +
      (extraEnchants ? g_betterMatch : 0)
  }


  AddPriorWorkDetails() {
    this.priorWorkRating = this.item.priorWork * g_priorWorkWeight
  }


  AddTotalCostDetails() {
    this.totalCostRating = this.item.totalCost * g_totalCostWeight
  }


  AddTotalRating() {
    this.totalRating = (
      this.enchantRating +
      this.priorWorkRating +
      this.totalCostRating
    )
  }
}
