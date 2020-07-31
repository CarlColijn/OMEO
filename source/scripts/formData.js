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
    - sourceItemsMerged: bool
    - withErrors: bool
*/
class FormData {
  constructor() {
    // start our subobjects
    this.desiredItem = undefined
    this.sourceItems = []
    this.sourceItemsMerged = false
    this.withErrors = false
  }


  // adds the given source item
  AddSourceItem(item) {
    this.sourceItems.push(item)
  }


  // notes whether source items were merged
  SetSourceItemsMerged(sourceItemsMerged) {
    this.sourceItemsMerged = sourceItemsMerged
  }


  // notes whether there were errors
  SetWithErrors(withErrors) {
    this.withErrors = withErrors
  }


  // sets the desired item
  SetDesiredItem(item) {
    this.desiredItem = item
  }


  // serializes the data
  Serialize(stream) {
    // start with the data version
    stream.AddCount(1)

    // serialize all source items
    let numSources = this.sourceItems.length
    stream.AddCount(numSources)
    for (let sourceNr = 0; sourceNr < numSources; ++sourceNr) {
      let sourceItem = this.sourceItems[sourceNr]
      this.SerializeItem(sourceItem, stream)
    }

    // and serialize the desired item
    this.SerializeItem(this.desiredItem, stream)
  }


  // deserializes the data
  // returns if the data was OK
  Deserialize(stream) {
    // get the data version
    let dataVersion = parseInt(stream.GetCount())
    let dataOK = true
    switch (dataVersion) {
      case 1:
        // known version -> deserialize all source items
        this.sourceItems = []
        let numSources = stream.GetCount()
        for (let sourceNr = 1; sourceNr <= numSources; ++sourceNr) {
          let sourceItem = this.DeserializeItem(stream, g_source, sourceNr)
          sourceItem.nr = sourceNr
          this.sourceItems.push(sourceItem)
        }

        // and deserialize the desired item
        this.desiredItem = this.DeserializeItem(stream, g_desired, 0)
        break
      default:
        // unknown version -> note
        dataOK = false
        this.withErrors = true
        break
    }

    // and tell what just happened
    return dataOK
  }


  // serializes enchants
  SerializeEnchants(enchantsByID, stream) {
    // serialize all enchants
    let numEnchants = Object.keys(enchantsByID).length
    stream.AddCount(numEnchants)
    for (let enchantID in enchantsByID) {
      stream.AddSizedInt(enchantID, g_numEnchantIDBits)
      stream.AddSizedInt(enchantsByID[enchantID].level, 3)
    }
  }


  // serializes an item
  SerializeItem(item, stream) {
    stream.AddCount(item.count)
    stream.AddSizedInt(item.id, g_numItemIDBits)
    stream.AddSizedInt(item.priorWork, 3)
    this.SerializeEnchants(item.enchantsByID, stream)
  }


  // deserializes enchants
  DeserializeEnchants(stream) {
    // get all enchants
    let enchantsByID = {}
    let numEnchants = stream.GetCount()
    for (let enchantNr = 0; enchantNr < numEnchants; ++enchantNr) {
      let enchant = new Enchant(
        stream.GetSizedInt(g_numEnchantIDBits),
        stream.GetSizedInt(3)
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
      stream.GetCount(),
      set,
      stream.GetSizedInt(g_numItemIDBits),
      itemNr,
      stream.GetSizedInt(3)
    )
    item.enchantsByID = this.DeserializeEnchants(stream)

    // and return what we deserialized
    return item
  }
}
