/*
  All data in the form.

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - item.js
  - itemInfo.js

  Defined classes:
  - FormData
    - desiredItem: Item
    - sourceItems: array(Item)
*/


// ======== PUBLIC ========


class FormData {
  constructor() {
    // ==== PUBLIC ====
    this.Reset()
  }


  AddSourceItem(item) {
    this.sourceItems.push(item)
  }


  AddSourceItems(items) {
    for (let itemNr = 0; itemNr < items.length; ++itemNr)
      this.AddSourceItem(items[itemNr])
  }


  SetDesiredItem(item) {
    this.desiredItem = item
  }


  Serialize(stream) {
    stream.AddCount(1) // version nr

    let numSources = this.sourceItems.length
    stream.AddCount(numSources)
    for (let sourceNr = 0; sourceNr < numSources; ++sourceNr) {
      let sourceItem = this.sourceItems[sourceNr]
      this.SerializeItem(sourceItem, stream)
    }

    this.SerializeItem(this.desiredItem, stream)
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
    this.sourceItems = []
    this.desiredItem = undefined
  }


  // returns bool (if the data was OK)
  DeserializeV1(stream) {
    let dataOK = true
    let numSources = stream.GetCount()
    for (let sourceNr = 1; sourceNr <= numSources; ++sourceNr) {
      let sourceItem = this.DeserializeItem(stream, g_source, sourceNr)
      if (sourceItem === undefined) {
        dataOK = false
        break
      }
      sourceItem.nr = sourceNr
      this.sourceItems.push(sourceItem)
    }

    if (dataOK) {
      this.desiredItem = this.DeserializeItem(stream, g_desired, 0)
      dataOK = this.desiredItem !== undefined
    }

    if (!dataOK)
      this.Reset()

    return dataOK
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
    stream.AddSizedInt(item.id, g_numItemIDBits)
    stream.AddSizedInt(item.priorWork, 3)
    this.SerializeEnchants(item.enchantsByID, stream)
  }


  DeserializeEnchants(stream, item) {
    let numEnchants = stream.GetCount()
    for (let enchantNr = 0; enchantNr < numEnchants; ++enchantNr) {
      let enchant = new Enchant(
        stream.GetSizedInt(g_numEnchantIDBits),
        stream.GetSizedInt(3)
      )
      item.SetEnchant(enchant)
    }
  }


  // returns Item, or undefined on error
  DeserializeItem(stream, set, itemNr) {
    let item = new Item(
      stream.GetCount(),
      set,
      stream.GetSizedInt(g_numItemIDBits),
      itemNr,
      stream.GetSizedInt(3)
    )
    this.DeserializeEnchants(stream, item)

    return (
      stream.RetrievalOK() ?
      item :
      undefined
    )
  }
}
