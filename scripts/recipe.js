/*
  Details on all possible enchants.

  prerequisites:
  - none

  Defined funtions:
  - GetRomanNumeralForLevel

  Defined classes:
  - EnchantInfo
    - id: char
    - maxLevel: int
    - bookMultiplier: int
    - toolMultiplier: int
    - name: string

  Defined globals:
  - g_enchantInfos: array(EnchantInfo)
  - g_numDifferentEnchants: int
  - g_enchantIDsByName: Map(string -> int)
  - g_enchantInfosByID: Map(int -> EnchantInfo)
  - g_numEnchantIDBits: int
*/


// ======== PUBLIC ========


let g_enchantIDsByName = new Map()
let g_enchantInfosByID = new Map()
let g_numDifferentEnchants = 0


// returns string
function GetRomanNumeralForLevel(level) {
  return ['-', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][level]
}


class EnchantInfo {
  // returns one of the static EnchantInfo globals
  static GetRehydrated(info) {
    return g_enchantInfosByID.get(info.id)
  }


  constructor(id, maxLevel, bookMultiplier, toolMultiplier, name) {
    // ==== PUBLIC ====
    this.id = id
    this.maxLevel = maxLevel
    this.bookMultiplier = bookMultiplier
    this.toolMultiplier = toolMultiplier
    this.name = name

    // ==== PRIVATE ====
    g_enchantIDsByName.set(name, id)
    g_enchantInfosByID.set(id, this)
    ++g_numDifferentEnchants
  }
}


let g_enchantInfos = [
  new EnchantInfo( 0, 4, 1, 1, 'Protection'),
  new EnchantInfo( 1, 4, 1, 2, 'Fire Protection'),
  new EnchantInfo( 2, 4, 1, 2, 'Feather Falling'),
  new EnchantInfo( 3, 4, 2, 4, 'Blast Protection'),
  new EnchantInfo( 4, 4, 1, 2, 'Projectile Protection'),
  new EnchantInfo( 5, 3, 4, 8, 'Thorns'),
  new EnchantInfo( 6, 3, 2, 4, 'Respiration'),
  new EnchantInfo( 7, 3, 2, 4, 'Depth Strider'),
  new EnchantInfo( 8, 1, 2, 4, 'Aqua Affinity'),
  new EnchantInfo( 9, 5, 1, 1, 'Sharpness'),
  new EnchantInfo(10, 5, 1, 2, 'Smite'),
  new EnchantInfo(11, 5, 1, 2, 'Bane of Arthropods'),
  new EnchantInfo(12, 2, 1, 2, 'Knockback'),
  new EnchantInfo(13, 2, 2, 4, 'Fire Aspect'),
  new EnchantInfo(14, 3, 2, 4, 'Looting'),
  new EnchantInfo(15, 5, 1, 1, 'Efficiency'),
  new EnchantInfo(16, 1, 4, 8, 'Silk Touch'),
  new EnchantInfo(17, 3, 1, 2, 'Unbreaking'),
  new EnchantInfo(18, 3, 2, 4, 'Fortune'),
  new EnchantInfo(19, 5, 1, 1, 'Power'),
  new EnchantInfo(20, 2, 2, 4, 'Punch'),
  new EnchantInfo(21, 1, 2, 4, 'Flame'),
  new EnchantInfo(22, 1, 4, 8, 'Infinity'),
  new EnchantInfo(23, 3, 2, 4, 'Luck of the Sea'),
  new EnchantInfo(24, 3, 2, 4, 'Lure'),
  new EnchantInfo(25, 2, 2, 4, 'Frost Walker'),
  new EnchantInfo(26, 1, 2, 4, 'Mending'),
  new EnchantInfo(27, 1, 4, 8, 'Curse of Binding'),
  new EnchantInfo(28, 1, 4, 8, 'Curse of Vanishing'),
  // Bedrock: multipliers are 1 & 2 instead of 2 & 4
  new EnchantInfo(29, 5, 2, 4, 'Impaling'),
  new EnchantInfo(30, 3, 2, 4, 'Riptide'),
  new EnchantInfo(31, 3, 1, 1, 'Loyalty'),
  new EnchantInfo(32, 1, 4, 8, 'Channeling'),
  new EnchantInfo(33, 1, 2, 4, 'Multishot'),
  new EnchantInfo(34, 4, 1, 1, 'Piercing'),
  new EnchantInfo(35, 3, 1, 2, 'Quick Charge'),
  new EnchantInfo(36, 3, 4, 8, 'Soul Speed'),
  new EnchantInfo(37, 3, 4, 8, 'Swift Sneak'),
  // Bedrock: Sweeping Edge doesn't exist
  new EnchantInfo(38, 3, 2, 4, 'Sweeping Edge')
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numEnchantIDBits = g_numDifferentEnchants.toString(2).length




/*
  Details on all possible item types.

  Prerequisites:
  - enchantInfo.js

  Defined classes:
  - ItemInfo
    - name: string
    - id: int
    - isBook: bool
    - CanHaveEnchant(enchantID: int) -> bool

  Defined globals:
  - g_itemInfosByID: Map(int -> ItemInfo)
  - g_numDifferentItems: int
  - g_numItemIDBits: int
*/


// ======== PUBLIC ========


class ItemInfo {
  // returns one of the static ItemInfo globals
  static GetRehydrated(info) {
    return g_itemInfosByID.get(info.id)
  }


  constructor(id, name, enchantNames) {
    // ==== PUBLIC ====
    this.id = id
    this.isBook = name == 'Book'
    this.name = name

    // ==== PRIVATE ====
    this.enchantsAllowedByID = new Set()

    if (this.isBook) {
      for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr)
        this.enchantsAllowedByID.add(g_enchantInfos[enchantNr].id)
    }
    else {
      for (let enchantNameNr = 0; enchantNameNr < enchantNames.length; ++enchantNameNr) {
        let enchantName = enchantNames[enchantNameNr]
        let enchantID = g_enchantIDsByName.get(enchantName)
        this.enchantsAllowedByID.add(enchantID)
      }
    }

    g_itemInfosByID.set(id, this)
    ++g_numDifferentItems
  }


  // returns bool
  CanHaveEnchant(enchantID) {
    return this.enchantsAllowedByID.has(enchantID)
  }
}


let g_itemInfosByID = new Map()


let g_numDifferentItems = 0
let g_itemInfos = [
  new ItemInfo(0, 'Book', []),
  new ItemInfo(1, 'Axe', ['Bane of Arthropods'/*, 'Chopping'*/, 'Curse of Vanishing','Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk Touch', 'Smite', 'Unbreaking']),
  new ItemInfo(2, 'Shovel', ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(3, 'Pickaxe', ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(4, 'Hoe', ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(5, 'Fishing Rod', ['Curse of Vanishing','Luck of the Sea','Lure','Mending','Unbreaking']),
  new ItemInfo(6, 'Flint & Steel', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(7, 'Shears', ['Curse of Vanishing','Efficiency','Mending','Unbreaking']),
  new ItemInfo(8, 'Elytra', ['Curse of Binding','Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(9, 'Bow', ['Curse of Vanishing','Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemInfo(10, 'Crossbow', ['Curse of Vanishing','Mending','Multishot','Piercing','Quick Charge','Unbreaking']),
  new ItemInfo(11, 'Sword', ['Bane of Arthropods','Curse of Vanishing','Fire Aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping Edge','Unbreaking']),
  new ItemInfo(12, 'Trident', ['Channeling','Curse of Vanishing','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemInfo(13, 'Boots', ['Blast Protection','Curse of Binding','Curse of Vanishing','Depth Strider','Feather Falling','Fire Protection','Frost Walker','Mending','Projectile Protection','Protection','Soul Speed','Thorns','Unbreaking']),
  new ItemInfo(14, 'Leggings', ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Swift Sneak','Thorns','Unbreaking']),
  new ItemInfo(15, 'Chestplate', ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(16, 'Helmet', ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(17, 'Turtle Shell', ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(18, 'Shield', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(19, 'Carrot on a Stick', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(20, 'Warped Fungus on a Stick', ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(21, 'Pumpkin', ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(22, 'Head', ['Curse of Binding','Curse of Vanishing'])
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numItemIDBits = g_numDifferentItems.toString(2).length




/*
  Data sets.  Used to keep track of the data set of all objects (e.g. Item,
  ItemTable, Enchant etc.).  Just === compare anyone's set with one of the
  defined global main set types.

  Prerequisites:
  - none

  Defined classes:
  - DataSet
    - id: int
    - desc: char

  Defined globals:
  - g_source: source DataSet
  - g_desired: desired DataSet
  - g_combined: combined DataSet
  - g_extra: extra inserted DataSet
  - g_numDataSetIDBits: int
  - g_dataSetsByID: [DataSet]
*/


// ======== PUBLIC ========


class DataSet {
  // returns one of the predefined DataSet globals
  static GetRehydrated(set) {
    return g_dataSetsByID[set.id]
  }


  constructor(id, desc) {
    // ==== PUBLIC ====
    this.id = id
    this.desc = desc
  }
}


let g_source = new DataSet(0, 's');
let g_desired = new DataSet(1, 'd');
let g_combined = new DataSet(2, 'c');
let g_extra = new DataSet(3, 'e');


let g_numDataSetIDBits = 2


let g_dataSetsByID = [
  g_source,
  g_desired,
  g_combined,
  g_extra
]




/*
  Trackers for item ancestry, used to prevent duplicate item use conflicts.
  ZeroOrigin is a convenient starting point for creating true ItemOrigins.

  Prerequisites:
  - item.js

  Defined classes:
  - ZeroOrigin
    used as a fast initial base for creating ItemOrigins
  - ItemOrigin
    keeps track of the origins of each item
*/


// ======== PUBLIC ========
class ZeroOrigin {
  static Rehydrate(origin) {
    Object.setPrototypeOf(origin, ZeroOrigin.prototype);
  }


  constructor(items) {
    // ==== PRIVATE ====
    let numItems = items.length

    this.maxUses = new Array(numItems)
    this.itemUses = new Array(numItems)

    for (let itemNr = 0; itemNr < numItems; ++itemNr) {
      let item = items[itemNr]
      this.maxUses[itemNr] = item.count
      this.itemUses[itemNr] = 0
    }
  }


  // returns ItemOrigin
  CreateOrigin(itemNr) {
    return new ItemOrigin(this, itemNr)
  }
}




class ItemOrigin {
  static Rehydrate(origin) {
    Object.setPrototypeOf(origin, ItemOrigin.prototype);
  }


  constructor(otherOrigin, itemNr) {
    this.maxUses = otherOrigin.maxUses // noone is modifying it; by ref is fine
    this.itemUses = otherOrigin.itemUses.slice()

    if (itemNr !== undefined) {
      if (itemNr >= this.itemUses.length)
        throw 'Illegal item nr used for origin.'

      this.itemUses[itemNr] += 1
    }
  }


  Combine(otherOrigin) {
    let combinedOrigin = new ItemOrigin(this)

    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      combinedOrigin.itemUses[itemNr] += otherOrigin.itemUses[itemNr]

    return combinedOrigin
  }


  DetermineMaxCombineCount(otherOrigin) {
    let numCombines = 9e9 // should be enough

    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr) {
      let combinedItemUses = this.itemUses[itemNr] + otherOrigin.itemUses[itemNr]
      if (combinedItemUses > 0) {
        let thisItemNumCombines = Math.trunc(this.maxUses[itemNr] / combinedItemUses)
        if (numCombines > thisItemNumCombines)
          numCombines = thisItemNumCombines
      }
    }

    return numCombines
  }


  IsSubsetOf(otherOrigin) {
    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      if (this.itemUses[itemNr] > otherOrigin.itemUses[itemNr])
        return false

    return true
  }
}




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




/*
  Single item (source, desired, combined or extra).

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - itemInfo.js

  Defined classes:
  - Item
    all items:
    - count: int
    - set: DataSet
    - id: int
    - info: ItemInfo
    - enchantsByID: Map(int -> Enchant)
    - priorWork: int
    - cost: int
    - totalCost: int
    source and desired items only:
    - nr: int
    combined items only:
    - targetItem: Item
    - sacrificeItem: Item
    all items except desired items:
    - origin: effectively an array(bool)
*/


// ======== PUBLIC ========


function RehydrateItems(items) {
  items.forEach((item) => {
    Item.Rehydrate(item)
  })
}


class Item {
  static Rehydrate(item) {
    Object.setPrototypeOf(item, Item.prototype);
    item.set = DataSet.GetRehydrated(item.set)
    item.info = ItemInfo.GetRehydrated(item.info)
    item.enchantsByID.forEach((enchant) => {
      Enchant.Rehydrate(enchant)
    })
    if (item.origin !== undefined)
      ItemOrigin.Rehydrate(item.origin)
    if (item.targetItem !== undefined)
      Item.Rehydrate(item.targetItem)
    if (item.sacrificeItem !== undefined)
      Item.Rehydrate(item.sacrificeItem)
  }


  constructor(count, set, id, priorWork, cost=0, totalCost=0) {
    // ==== PUBLIC ====
    this.count = count
    this.set = set
    this.id = id
    this.info = g_itemInfosByID.get(id)
    this.enchantsByID = new Map()
    this.priorWork = priorWork
    this.cost = cost
    this.totalCost = totalCost
  }


  SetEnchant(enchant) {
    this.enchantsByID.set(enchant.info.id, enchant)
  }


  // returns string
  HashType() {
    return this.Hash(false, false, false)
  }


  // returns string
  HashTypeAndPriorWork() {
    return this.Hash(true, false, false)
  }


  // returns string
  HashTypeAndPriorWorkAndCost() {
    return this.Hash(true, true, false)
  }


  // returns string
  HashAll() {
    return this.Hash(true, true, true)
  }


  // returns string
  Hash(withPriorWork, withCost, withCount) {
    // note: no fancy stuff for now with bit fiddling, just a big 'ol string concat

    let allData = this.id

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = this.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        allData += `|${enchant.id}|${enchant.level}`
    }

    if (withPriorWork)
      allData += `|${this.priorWork}`

    if (withCost)
      allData += `|${this.cost}|${this.totalCost}`

    if (withCount)
      allData += `|${this.count}`

    return allData
  }


  DropUnusedEnchants() {
    let enchantIDsToDrop = []

    this.enchantsByID.forEach((enchant, id) => {
      if (enchant.level == 0)
        enchantIDsToDrop.push(id)
    })

    for (let enchantIDNr = 0; enchantIDNr < enchantIDsToDrop.length; ++enchantIDNr)
      this.enchantsByID.delete(enchantIDsToDrop[enchantIDNr])
  }
}




/*
  Bit serializer to stream bits into a text string.
  Uses a modified base64 encoding that is URL safe.

  Prerequisites:
  - none

  Defined classes:
  - BitStorer
  - BitRestorer
*/


// ======== PRIVATE ========


let g_streamSerializationChars = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'


// ======== PUBLIC ========


class BitStorer {
  constructor() {
    // ==== PRIVATE ====
    this.serialized = ''
    this.StartNewChar()
  }


  AddBits(bits, numBitsToGo) {
    while (numBitsToGo > 0) {
      let batchNumBits = Math.min(numBitsToGo, this.numBitsToStore)
      let upcomingNumBits = numBitsToGo - batchNumBits

      this.storedBits <<= batchNumBits
      let bitMask = (0x3f|0) >>> (6 - batchNumBits)
      this.storedBits |= (bits >>> upcomingNumBits) & bitMask

      numBitsToGo -= batchNumBits
      this.numBitsToStore -= batchNumBits
      if (this.numBitsToStore == 0) {
        this.serialized += g_streamSerializationChars[this.storedBits]
        this.StartNewChar()
      }
    }
  }


  // returns string (the final stream data)
  Finalize() {
    // flush out any remaining data by pushing enough 0 bits
    this.AddBits(0|0, this.numBitsToStore)

    return this.serialized
  }


  // ======== PRIVATE ========


  StartNewChar() {
    this.storedBits = 0|0 // real uint32
    this.numBitsToStore = 6
  }
}


class BitRestorer {
  constructor(serialized) {
    this.valid = true
    this.overflow = false

    // ==== PRIVATE ====
    this.serialized = serialized
    this.nextCharNr = 0
    this.numBitsToRestore = 0
  }


  // returns int
  GetBits(numBitsToGo) {
    let bits = 0|0
    while (numBitsToGo > 0) {
      if (this.numBitsToRestore == 0)
        this.LoadNextBits()

      let batchNumBits = Math.min(numBitsToGo, this.numBitsToRestore)
      let upcomingNumBits = this.numBitsToRestore - batchNumBits

      bits <<= batchNumBits
      let bitMask = (0x3f|0) >>> (6 - batchNumBits)
      bits |= (this.restoredBits >>> upcomingNumBits) & bitMask

      numBitsToGo -= batchNumBits
      this.numBitsToRestore -= batchNumBits
    }

    return bits
  }


  // ======== PRIVATE ========


  LoadNextBits() {
    if (this.nextCharNr >= this.serialized.length) {
      this.restoredBits = 0|0 // past end of stream... just play along
      this.overflow = true
    }
    else {
      let nextChar = this.serialized[this.nextCharNr]
      ++this.nextCharNr
      let charNr = g_streamSerializationChars.indexOf(nextChar)
      if (charNr < 0) {
        charNr = 0
        this.valid = false
      }
      this.restoredBits = charNr|0
    }

    this.numBitsToRestore = 6
  }
}




/*
  Data stream serializer/deserializer.
  Used to load from/save to the #serialized element for data persistence.

  Prerequisites:
  - bitSerializer.js

  Defined classes:
  - DataStreamLoadingOptions
    - inConflict: bool
    - serialized: string
  - DataStream
*/


// ======== PUBLIC ========


class DataStreamLoadingOptions {
  constructor() {
    // ==== PRIVATE ====
    this.localStorage = localStorage.getItem('form') || ''
    this.withLocalStorage = this.localStorage.length > 0

    let urlDataMatches = RegExp('[?&]form=([^&#]*)').exec(location.search)
    this.url = urlDataMatches ? urlDataMatches[1] : ''
    this.withURL = this.url.length > 0

    // ==== PUBLIC ====
    this.inConflict = false
    if (!this.withURL && !this.withLocalStorage)
      this.serialized = ''
    else if (this.withURL && !this.withLocalStorage)
      this.serialized = this.url
    else if (!this.withURL && this.withLocalStorage)
      this.serialized = this.localStorage
    else if (this.url == this.localStorage)
      this.serialized = this.url
    else {
      this.inConflict = true
      this.serialized = ''
    }
  }


  ChooseURL() {
    this.inConflict = false
    this.serialized = this.url
  }


  ChooseLocalStorage() {
    this.inConflict = false
    this.serialized = this.localStorage

    // We're in conflict but the user chose for localStorage, so get rid of
    // the bookmark part keeping the old link with the bookmark in the history.
    window.history.replaceState(null, '', location.href.replace(location.search, ''))
  }
}




class DataStream {
  constructor(storeMode) {
    // ==== PRIVATE ====
    if (storeMode)
      this.storer = new BitStorer()
  }


  AddSizedInt(intValue, numBits) {
    this.storer.AddBits(intValue, numBits)
  }


  AddCount(intValue) {
    let numBits = intValue.toString(2).length
    this.AddSizedInt(numBits, 5) // 5 bits is more than we ever need to count
    this.AddSizedInt(intValue, numBits)
  }


  // returns int
  GetSizedInt(numBits) {
    return this.restorer.GetBits(numBits)
  }


  // returns int
  GetCount() {
    let numBits = this.GetSizedInt(5)
    return this.GetSizedInt(numBits)
  }


  // returns bool
  RetrievalOK() {
    return (
      this.restorer.valid &&
      !this.restorer.overflow
    )
  }


  Load(dataStreamLoadingOptions) {
    this.restorer = new BitRestorer(dataStreamLoadingOptions.serialized)

    return dataStreamLoadingOptions.serialized.length > 0
  }


  GetAsURL(url) {
    let urlBase = url.href.replace(url.search, '')
    let serialized = this.storer.Finalize()
    return `${urlBase}?form=${serialized}`
  }


  SaveToBookmarkLink() {
    let bookmarkLink = this.GetAsURL(location)
    let bookmarkElemJQ = $('#bookmark')
    bookmarkElemJQ.show()
    let bookmarkLinkElemJQ = bookmarkElemJQ.find('a')
    bookmarkLinkElemJQ.attr('href', bookmarkLink)
  }


  SaveToLocalStorage() {
    let serialized = this.storer.Finalize()
    localStorage.setItem('form', serialized)
  }
}




/*
  Wrapper for the recipe table on the page.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js

  Defined classes:
  - RecipeTable
*/


// ======== PUBLIC ========


class RecipeTable {
  constructor(tableElemJQ) {
    // ==== PRIVATE ====
    this.tableElemJQ = tableElemJQ
    this.templateRowElemJQ = tableElemJQ.find('.template').first()
    this.allRowInfos = []
  }


  SetItem(item) {
    let maxItemDepth = this.GetItemDepth(item)

    this.AddItemTree(item, maxItemDepth, 'f', 'Result', undefined)
    this.tableElemJQ.find('th:first').attr('colspan', maxItemDepth + 1)
  }


  // ======== PRIVATE ========


  // returns int
  GetItemDepth(item) {
    if (item === undefined)
      return 0
    if (item.targetItem === undefined)
      return 1

    return 1 + Math.max(
      this.GetItemDepth(item.targetItem),
      this.GetItemDepth(item.sacrificeItem)
    )
  }


  // returns string
  GetItemDescription(item) {
    let description = '<input type="checkbox"></input> '

    switch (item.set) {
      case g_combined: description += 'Combined '; break
      case g_source:   description += 'Source '; break
      case g_extra:    description += 'Extra '; break
      case g_desired:  description += 'Desired '; break
    }

    description += item.info.name
    if (item.set == g_source)
      description += ` nr. ${item.nr}`
    return description
  }


  // returns string
  GetItemEnchants(item) {
    let enchants = ''
    let isFirstEnchant = true
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = item.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined) {
        enchants += isFirstEnchant ? '' : '<br>'
        isFirstEnchant = false
        enchants += `${enchant.info.name} ${GetRomanNumeralForLevel(enchant.level)}`
      }
    }
    return enchants
  }


  // returns string
  GetItemCost(item) {
    if (item.set !== g_combined)
      return '-'
    else if (item.cost == item.totalCost)
      return `${item.cost}`
    else
      return `${item.cost} (${item.totalCost} in total)`
  }


  SetChildHideState(rowInfo, hide) {
    rowInfo.numHides += (hide ? 1 : -1)
    if (rowInfo.numHides > 0)
      rowInfo.rowElemJQ.hide(100)
    else
      rowInfo.rowElemJQ.show(100)

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      this.SetChildHideState(childRowInfo, hide)
    })
  }


  NodeClicked(rowInfo) {
    rowInfo.isUserCollapsed = !rowInfo.isUserCollapsed

    if (rowInfo.isUserCollapsed) {
      rowInfo.mainTDElemJQ.html('&boxplus;')
      rowInfo.mainTDElemJQ.removeClass('treeLeft')
    }
    else {
      rowInfo.mainTDElemJQ.html('&boxminus;')
      rowInfo.mainTDElemJQ.addClass('treeLeft')
    }

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      this.SetChildHideState(childRowInfo, rowInfo.isUserCollapsed)
    })
  }


  // returns RowInfo
  AddNewRow() {
    let newRowElemJQ = this.templateRowElemJQ.clone()

    let rowParentElemJQ = this.templateRowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)

    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', 1)

    return {
      rowElemJQ: newRowElemJQ,
      isUserCollapsed: false,
      numHides: 0,
      childRowInfos: []
    }
  }


  AddItemTree(item, numUnusedColumns, collapseTrail, placement, parentRowInfo) {
    let newRowInfo = this.AddNewRow()
    this.allRowInfos.push(newRowInfo)
    if (parentRowInfo !== undefined)
      parentRowInfo.childRowInfos.push(newRowInfo)
    let hasChildren = item.targetItem !== undefined

    let placementTDElemJQ = newRowInfo.rowElemJQ.find('td:first')

    for (let tdElemNr = 0; tdElemNr < collapseTrail.length; ++tdElemNr) {
      let tdElemJQ = $('<td class="treeNode"></td>')

      let isLeafNode = tdElemNr == 0
      let isNonLeafNode = tdElemNr > 0
      let isExpandableLeafNode = isLeafNode && hasChildren
      let isUnexpandableLeafNode = isLeafNode && !hasChildren
      let isOneBeforeLeafNode = tdElemNr == 1
      let isPassthroughFromLeftNode =
        !isNonLeafNode ?
        false :
        collapseTrail[tdElemNr - 1] == 'l'

      if (isLeafNode)
        newRowInfo.mainTDElemJQ = tdElemJQ

      if (isExpandableLeafNode) {
        tdElemJQ.addClass('treeClick')
        tdElemJQ.html('&boxminus;')
        newRowInfo.mainTDElemJQ.click(() => {
          this.NodeClicked(newRowInfo)
        })
      }

      if (isUnexpandableLeafNode || isOneBeforeLeafNode)
        tdElemJQ.addClass('treeTop')

      if (isExpandableLeafNode || isPassthroughFromLeftNode)
        tdElemJQ.addClass('treeLeft')

      tdElemJQ.prependTo(newRowInfo.rowElemJQ)
    }

    placementTDElemJQ.attr('colspan', numUnusedColumns)
    newRowInfo.rowElemJQ.find('.placement').html(placement)
    newRowInfo.rowElemJQ.find('.description').html(this.GetItemDescription(item))
    newRowInfo.rowElemJQ.find('.enchants').html(this.GetItemEnchants(item))
    newRowInfo.rowElemJQ.find('.priorWork').text(item.priorWork)
    newRowInfo.rowElemJQ.find('.cost').text(this.GetItemCost(item))

    if (hasChildren) {
      this.AddItemTree(item.targetItem, numUnusedColumns - 1, 'l' + collapseTrail, 'Left', newRowInfo)
      this.AddItemTree(item.sacrificeItem, numUnusedColumns - 1, 'r' + collapseTrail, 'Right', newRowInfo)
    }
  }
}




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
    return this.item !== undefined
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
    this.SerializeEnchants(item.enchantsByID, stream)
    if (item.targetItem === undefined)
      stream.AddSizedInt(0, 1)
    else {
      stream.AddSizedInt(1, 1)
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
    if (
      !this.DeserializeEnchants(stream, item) ||
      !stream.RetrievalOK()
    )
      return undefined

    let withChildren = stream.GetSizedInt(1)
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




/*
  Recipe form (page I/O) management.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - itemTable.js
  - itemRow.js
  - dataStream.js
  - recipeFormData.js

  Defined classes:
  - RecipeForm
*/


// ======== PUBLIC ========


class RecipeForm {
  constructor(formHandler) {
    this.formHandler = formHandler

    $(() => {
      // only execute once the DOM is fully loaded
      this.recipeTable = new RecipeTable($('#recipe table'))

      this.Load()
    })
  }


  // ======== PRIVATE ========


  Load() {
    let allOK = false
    let stream = new DataStream(false)

    let loadingOptions = new DataStreamLoadingOptions()
    loadingOptions.ChooseURL()
    if (stream.Load(loadingOptions)) {
      let data = new RecipeFormData()
      allOK = data.Deserialize(stream)
      if (allOK)
        this.recipeTable.SetItem(data.item)
    }

    if (!allOK)
      this.formHandler.FailedToLoad()
  }
}




/*
  Recipe page javascript module.

  Prerequisites:
  - recipeForm.js

  Defined classes:
  - FormHandler

  Defined globals:
  - g_form: RecipeForm
*/


class FormHandler {
  MakeDialogKeyboardCloseable(dialogElemJQ, exitButtonElemJQ, OnClose) {
    let keyboardListener = (event) => {
      if (
        event.key === 'Escape' ||
        event.key === ' ' ||
        event.key === 'Enter'
      ) {
        event.preventDefault()
        ExitDialog()
      }
    }

    window.addEventListener('keydown', keyboardListener)

    let ExitDialog = () => {
      window.removeEventListener('keydown', keyboardListener)

      dialogElemJQ.hide()

      if (OnClose !== undefined)
        OnClose()
    }

    exitButtonElemJQ.click(() => {
      ExitDialog()
    })
  }


  ShowSimpleDialog(dialogID, ContinueCallback) {
    let dialogElemJQ = $(dialogID)
    dialogElemJQ.css('display', 'flex')

    let exitButtonJQ = dialogElemJQ.find('.exit')
    exitButtonJQ[0].focus()

    this.MakeDialogKeyboardCloseable(dialogElemJQ, exitButtonJQ, ContinueCallback)
  }


  FailedToLoad() {
    this.ShowSimpleDialog('#dataInErrorForLoad', undefined)
  }
}




let g_form = new RecipeForm(new FormHandler())
