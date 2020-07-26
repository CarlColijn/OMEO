/*
  All data in the form.

  Prerequisites:
  - dataSets.js
  - enchant.js
  - item.js

  Defined classes:
  - FormData
    - desiredItem: Item
    - sourceItems: array(Item)
*/
class FormData {
  constructor() {
    // start our subobjects
    this.desiredItem = undefined
    this.sourceItems = []
  }


  // adds the given source item
  AddSourceItem(item) {
    this.sourceItems.push(item)
  }


  // sets the desired item
  SetDesiredItem(item) {
    this.desiredItem = item
  }


  // serializes the data
  Serialize(stream) {
    // serialize all source items
    let numSources = this.sourceItems.length
    stream.Add(numSources)
    for (let sourceNr = 0; sourceNr < numSources; ++sourceNr) {
      let sourceItem = this.sourceItems[sourceNr]
      this.SerializeItem(sourceItem, stream)
    }

    // and serialize the desired item
    this.SerializeItem(this.desiredItem, stream)
  }


  // deserializes the data
  Deserialize(stream) {
    // deserialize all source items
    this.sourceItems = []
    let numSources = stream.Get()
    for (let sourceNr = 1; sourceNr <= numSources; ++sourceNr) {
      let sourceItem = this.DeserializeItem(stream, g_source, sourceNr)
      sourceItem.nr = sourceNr
      this.sourceItems.push(sourceItem)
    }

    // and deserialize the desired item
    this.desiredItem = this.DeserializeItem(stream, g_desired, 0)
  }


  // serializes enchants
  SerializeEnchants(enchantsByID, stream) {
    // serialize all enchants
    let numEnchants = Object.keys(enchantsByID).length
    stream.Add(numEnchants)
    for (let enchantID in enchantsByID) {
      stream.Add(enchantID)
      stream.Add(enchantsByID[enchantID].level)
    }
  }


  // serializes an item
  SerializeItem(item, stream) {
    stream.Add(item.id)
    stream.Add(item.priorWork)
    this.SerializeEnchants(item.enchantsByID, stream)
  }


  // deserializes enchants
  DeserializeEnchants(stream) {
    // get all enchants
    let enchantsByID = {}
    let numEnchants = stream.Get()
    for (let enchantNr = 0; enchantNr < numEnchants; ++enchantNr) {
      let enchant = new Enchant(
        stream.Get(),
        stream.Get()
      )
      enchantsByID[enchant.id] = enchant
    }

    // and return what we deserialized
    return enchantsByID
  }


  // deserializes items
  DeserializeItem(stream, set, itemNr) {
    // get the item
    let item = new Item(
      set,
      stream.Get(),
      itemNr,
      stream.Get()
    )
    item.enchantsByID = this.DeserializeEnchants(stream)

    // and return what we deserialized
    return item
  }
}
