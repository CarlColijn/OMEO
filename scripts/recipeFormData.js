/*
  All data on the recipe page.

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - item.js
  - itemInfo.js

  Defined classes:
  - RecipeFormData
    - item: Item
*/


// ======== PUBLIC ========


class RecipeFormData {
  constructor() {
    // ==== PUBLIC ====
    this.Reset()
  }


  SetItem(item) {
    this.item = item
  }


  Serialize(stream) {
    stream.AddCount(1) // version nr

    this.SerializeItem(this.item, stream)
  }


  // returns bool (if the data was OK)
  Deserialize(stream) {
    this.Reset()

    let dataVersion = stream.GetCount()
    switch (dataVersion) {
      case 1:
        return this.DeserializeV1(stream)
    }

    // unknown version...
    return false
  }


  // ======== PRIVATE ========


  Reset() {
    this.item = undefined
  }


  // returns bool (if the data was OK)
  DeserializeV1(stream) {
    this.item = this.DeserializeItem(stream)
    return this.item !== undefined && stream.RetrievalOK()
  }


  SerializeEnchants(enchantsByID, stream) {
    let numEnchants = enchantsByID.size
    stream.AddCount(numEnchants)
    enchantsByID.forEach((enchant, id) => {
      stream.AddSizedInt(id, g_numEnchantIDBits)
      stream.AddSizedInt(enchant.level, 3)
    })
  }


  SerializeItem(item, stream) {
    stream.AddCount(item.count)
    stream.AddSizedInt(item.set.id, g_numDataSetIDBits)
    stream.AddSizedInt(item.id, g_numItemIDBits)
    stream.AddSizedInt(item.priorWork, 3)
    stream.AddCount(item.cost)
    stream.AddCount(item.totalCost)

    if (item.set === g_source)
      stream.AddCount(item.nr, 3)
    else if (item.set === g_combined)
      stream.AddBool(item.renamePoint)

    this.SerializeEnchants(item.enchantsByID, stream)

    let withChildren = item.targetItem !== undefined
    stream.AddBool(withChildren)
    if (withChildren) {
      this.SerializeItem(item.targetItem, stream)
      this.SerializeItem(item.sacrificeItem, stream)
    }
  }


  // returns bool (whether the deserialization went OK)
  DeserializeEnchants(stream, item) {
    let numEnchants = stream.GetCount()
    for (let enchantNr = 0; enchantNr < numEnchants; ++enchantNr) {
      let enchant = new Enchant(
        stream.GetSizedInt(g_numEnchantIDBits),
        stream.GetSizedInt(3)
      )
      if (enchant.info === undefined || !stream.RetrievalOK())
        return false
      item.SetEnchant(enchant)
    }
    return true
  }


  // returns Item, or undefined on error
  DeserializeItem(stream) {
    let item = new Item(
      stream.GetCount(),
      g_dataSetsByID[stream.GetSizedInt(g_numDataSetIDBits)],
      stream.GetSizedInt(g_numItemIDBits),
      stream.GetSizedInt(3),
      stream.GetCount(3),
      stream.GetCount(3)
    )
    if (item.set === g_source)
      item.nr = stream.GetCount(3)
    else if (item.set === g_combined)
      item.renamePoint = stream.GetBool()

    if (
      !this.DeserializeEnchants(stream, item) ||
      !stream.RetrievalOK()
    )
      return undefined

    let withChildren = stream.GetBool()
    if (withChildren) {
      item.targetItem = this.DeserializeItem(stream)
      if (item.targetItem === undefined)
        return undefined

      item.sacrificeItem = this.DeserializeItem(stream)
      if (item.sacrificeItem === undefined)
        return undefined
    }

    return item
  }
}
