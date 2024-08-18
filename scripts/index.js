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
  Enchant conflicts.

  Prerequisites:
  - enchantInfo.js

  Defined globals:
  - EnchantIDsConflict: whether 2 given enchants conflict
*/


// ======== PUBLIC ========


// returns bool
function EnchantIDsConflict(id1, id2) {
  return g_conflictingEnchantIDs.has(`${id1}~${id2}`)
}


// ======== PRIVATE ========


let g_conflictingEnchantIDs = new Set()


function RegisterConflictingEnchants(enchantNames) {
  for (let enchant1Nr = 0; enchant1Nr < enchantNames.length - 1; ++enchant1Nr) {
    let enchant1ID = g_enchantIDsByName.get(enchantNames[enchant1Nr])
    for (let enchant2Nr = enchant1Nr + 1; enchant2Nr < enchantNames.length; ++enchant2Nr) {
      let enchant2ID = g_enchantIDsByName.get(enchantNames[enchant2Nr])
      g_conflictingEnchantIDs.add(`${enchant1ID}~${enchant2ID}`)
      g_conflictingEnchantIDs.add(`${enchant2ID}~${enchant1ID}`)
    }
  }
}


RegisterConflictingEnchants(['Protection', 'Blast Protection', 'Fire Protection', 'Projectile Protection'])
RegisterConflictingEnchants(['Depth Strider', 'Frost Walker'])
RegisterConflictingEnchants(['Sharpness', 'Smite', 'Bane of Arthropods'])
// Silk Touch & Fortune can be combined with commands
RegisterConflictingEnchants(['Silk Touch', 'Fortune'])
RegisterConflictingEnchants(['Infinity', 'Mending'])
RegisterConflictingEnchants(['Riptide', 'Loyalty'])
RegisterConflictingEnchants(['Riptide', 'Channeling'])
RegisterConflictingEnchants(['Multishot', 'Piercing'])




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
  All data in the main form.

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - item.js
  - itemInfo.js

  Defined classes:
  - MainFormData
    - desiredItem: Item
    - sourceItems: array(Item)
*/


// ======== PUBLIC ========


class MainFormData {
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
      let sourceItem = this.DeserializeItem(stream, g_source)
      if (sourceItem === undefined || !stream.RetrievalOK()) {
        dataOK = false
        break
      }
      this.sourceItems.push(sourceItem)
    }

    if (dataOK) {
      this.desiredItem = this.DeserializeItem(stream, g_desired)
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
  DeserializeItem(stream, set) {
    let item = new Item(
      stream.GetCount(),
      set,
      stream.GetSizedInt(g_numItemIDBits),
      stream.GetSizedInt(3)
    )
    if (!this.DeserializeEnchants(stream, item))
      return undefined

    return (
      stream.RetrievalOK() ?
      item :
      undefined
    )
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
  Wrapper for a single row in an enchant table.

  Prerequisites:
  - dataSets.js
  - enchant.js

  Defined classes:
  - EnchantRow
    - set: DataSet
*/


// ======== PUBLIC ========


class EnchantRow {
  constructor(rowElemJQ, set) {
    // ==== PUBLIC ====
    this.set = set

    // ==== PRIVATE ====
    this.rowElemJQ = rowElemJQ
    if (set === g_source || set === g_desired) {
      this.idElemJQ = rowElemJQ.find('select[name="enchantID"]')
      this.levelElemJQ = rowElemJQ.find('select[name="level"]')
    }
    else if (set === g_combined) {
      this.nameElemJQ = rowElemJQ.find('.name')
      this.levelElemJQ = rowElemJQ.find('.level')
    }

    this.isReal = rowElemJQ.attr('data-real') != 0
  }


  // returns bool
  IsReal() {
    return this.isReal
  }


  // returns jQuery-wrapped input element
  GetIDElemJQ() {
    return this.idElemJQ
  }


  // returns EnchantRow
  CreateNew(enchant, itemID, giveFocus, focusElemJQWhenAllGone) {
    let newRow = this.MakeExtraRealRow()

    if (this.set === g_source || this.set === g_desired)
      newRow.HookUpGUI(itemID)

    if (enchant !== undefined)
      newRow.SetEnchant(enchant) // performs an UpdateLevelOptions as well
    else
      newRow.UpdateLevelOptions()

    newRow.focusElemJQWhenAllGone = focusElemJQWhenAllGone
    if (giveFocus && this.set === g_source || this.set === g_desired)
      newRow.idElemJQ[0].focus()

    return newRow
  }


  Remove() {
    if (this.set === g_source || this.set === g_desired) {
      let focusRowElemJQ = this.rowElemJQ.next()
      if (focusRowElemJQ.length == 0)
        focusRowElemJQ = this.rowElemJQ.prev()

      let focusElemJQ
      if (focusRowElemJQ.length > 0 && focusRowElemJQ.attr('data-real') != 0)
        focusElemJQ = focusRowElemJQ.find('button[name="removeEnchant"]')
      else
        focusElemJQ = this.focusElemJQWhenAllGone

      if (focusElemJQ?.length > 0)
        focusElemJQ[0].focus()
    }

    this.rowElemJQ.remove()
  }


  // returns Enchant
  GetEnchant() {
    return new Enchant(
      parseInt(this.idElemJQ.val()),
      parseInt(this.levelElemJQ.val())
    )
  }


  SetEnchant(enchant) {
    if (this.set === g_source || this.set === g_desired) {
      this.idElemJQ.val(enchant.id)
      this.UpdateLevelOptions(this.idElemJQ, this.levelElemJQ)
      this.levelElemJQ.val(enchant.level)
    }
    else if (this.set === g_combined) {
      this.nameElemJQ.text(enchant.info.name)
      this.levelElemJQ.text(GetRomanNumeralForLevel(enchant.level))
    }
  }


  // ======== PRIVATE ========


  UpdateEnchantOptions(itemID) {
    this.idElemJQ.find('option').remove()

    let itemInfo = g_itemInfosByID.get(itemID)

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      if (itemInfo.CanHaveEnchant(enchantInfo.id))
        this.idElemJQ.append(`<option value="${enchantInfo.id}">${enchantInfo.name}</option>`)
    }
  }


  // returns EnchantRow
  MakeExtraRealRow() {
    let newRowElemJQ = this.rowElemJQ.clone()
    let rowParentElemJQ = this.rowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)
    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', '1')

    return new EnchantRow(newRowElemJQ, this.set)
  }


  HookUpGUI(itemID) {
    this.UpdateEnchantOptions(itemID)

    this.idElemJQ.change(() => {
      this.UpdateLevelOptions()
    })

    this.rowElemJQ.find('button[name="removeEnchant"]').click(() => {
      this.Remove()
    })
  }


  // returns int
  GetNewEnchantLevel(newEnchant) {
    let selectLevel = parseInt(this.levelElemJQ.val())
    if (isNaN(selectLevel))
      selectLevel = 1
    return Math.max(1, Math.min(newEnchant.maxLevel, selectLevel))
  }


  SetupNewLevelOptions(maxLevel, selectedLevel) {
    this.levelElemJQ.find('option').remove()

    for (let level = 1; level <= maxLevel; ++level)
      this.levelElemJQ.append(`<option value="${level}"${level == selectedLevel ? ' selected' : ''}>${GetRomanNumeralForLevel(level)}</option>`)
  }


  UpdateLevelOptions() {
    let enchantID = parseInt(this.idElemJQ.val())
    let newEnchant = g_enchantInfosByID.get(enchantID)
    let selectedLevel = this.GetNewEnchantLevel(newEnchant)
    this.SetupNewLevelOptions(newEnchant.maxLevel, selectedLevel)
  }
}




/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - enchantRow.js
  - item.js

  Defined classes:
  - ItemRow
    - set: DataSet
    - nr: int
*/


// ======== PUBLIC ========


class ItemRow {
  constructor(ShowDetails, rowElemJQ, set, hookUpGUI) {
    // ==== PUBLIC ====
    this.set = set
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.rowElemJQ = rowElemJQ
    this.isReal = rowElemJQ.attr('data-real') != 0

    let enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    this.enchantTemplateRow = new EnchantRow(enchantTemplateRowElemJQ, this.set)

    switch (set) {
      case g_source:
        this.countElemJQ = rowElemJQ.find('input[name="count"]')
        this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
        this.priorWorkElemJQ = rowElemJQ.find('select[name="priorWork"]')

        // only once set up the item options in the template row;
        // all created rows will inherit the options.
        if (!this.isReal) {
          this.SetupItemOptions()
          this.SetupPriorWorkOptions()
        }
        break
      case g_desired:
        this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
        this.SetupItemOptions()
        break
      case g_combined:
        this.countElemJQ = rowElemJQ.find('.count')
        this.typeElemJQ = rowElemJQ.find('.type')
        this.priorWorkElemJQ = rowElemJQ.find('.priorWork')
        this.costElemJQ = rowElemJQ.find('.cost')
        this.showDetailsElemJQ = rowElemJQ.find('[name=show]')
        break
    }

    if (hookUpGUI)
      this.HookUpGUI(undefined)
  }


  // returns ItemRow
  CreateNew(nr, item, giveFocus, focusElemJQWhenAllGone) {
    let newItemRow = this.MakeExtraRealRow()

    newItemRow.SetNumber(nr)

    newItemRow.HookUpGUI(item)

    if (item !== undefined)
      newItemRow.SetItem(item)

    newItemRow.focusElemJQWhenAllGone = focusElemJQWhenAllGone
    if (giveFocus && this.set === g_source || this.set === g_desired)
      newItemRow.idElemJQ[0].focus()

    return newItemRow
  }


  IsReal() {
    return this.isReal
  }


  Remove() {
    if (this.set === g_source || this.set === g_desired) {
      let focusRowElemJQ = this.rowElemJQ.next()
      if (focusRowElemJQ.length == 0)
        focusRowElemJQ = this.rowElemJQ.prev()

      let focusElemJQ
      if (focusRowElemJQ.length > 0 && focusRowElemJQ.attr('data-real') != 0)
        focusElemJQ = focusRowElemJQ.find('button[name="removeItem"]')
      else
        focusElemJQ = this.focusElemJQWhenAllGone

      if (focusElemJQ?.length > 0)
        focusElemJQ[0].focus()
    }

    this.rowElemJQ.remove()
  }


  SetNumber(nr) {
    this.nr = nr
    this.rowElemJQ.attr('data-nr', nr)
    if (this.set != g_combined)
      this.rowElemJQ.find('.nr').text(nr)
  }


  // only for source and desired
  SetCount(newCount) {
    this.countElemJQ.val(newCount)
  }


  AddEnchant(enchant) {
    let itemID =
      this.set === g_source || this.set === g_desired ?
      parseInt(this.idElemJQ.val()) :
      undefined
    this.enchantTemplateRow.CreateNew(enchant, itemID, true, this.addEnchantElemJQ)
  }


  RemoveEnchants() {
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
      let enchantRow = new EnchantRow($(enchantRowElem), this.set)
      if (enchantRow.IsReal())
        enchantRow.Remove()
      return true
    })
  }


  // only for source and desired
  // returns object:
  // - item: Item
  // - withCountError: bool
  // - countErrorElemJQ: JQuery-wrapped input element, if applicable
  // - withEnchantConflict: bool
  // - enchantConflictInfo: {
  //     conflictingEnchantName: string,
  //     inputElemJQ: JQuery-wrapped input element
  //   }
  // - withEnchantDupe: bool
  // - enchantDupeElemJQ: JQuery-wrapped input element, if applicable
  GetItem() {
    let countResult = this.GetValidatedCount()

    let item = new Item(
      countResult.count,
      this.set,
      parseInt(this.idElemJQ.val()),
      this.set === g_source ? parseInt(this.priorWorkElemJQ.val()) : 0
    )
    let enchantResult = this.AddItemEnchants(item)
    if (this.set === g_source)
      item.nr = parseInt(this.rowElemJQ.attr('data-nr'))

    return {
      item: item,
      withCountError: countResult.inError,
      countErrorElemJQ: countResult.errorElemJQ,
      withEnchantConflict: enchantResult.withConflict,
      enchantConflictInfo: enchantResult.conflictInfo,
      withEnchantDupe: enchantResult.withDupe,
      enchantDupeElemJQ: enchantResult.dupeElemJQ
    }
  }


  SetItem(item) {
    switch (this.set) {
      case g_source:
        this.countElemJQ.val(item.count)
        this.idElemJQ.val(item.id)
        this.priorWorkElemJQ.val(item.priorWork)
        break
      case g_desired:
        this.idElemJQ.val(item.id)
        break
      case g_combined:
        let itemSuffix
        let hideDetailsButton = false
        switch (item.set) {
          case g_source:
            itemSuffix = ` (source nr. ${item.nr})`
            hideDetailsButton = true
            break
          case g_extra:
            itemSuffix = ' (extra)'
            break
          case g_combined:
            itemSuffix = ''
            break
        }
        this.countElemJQ.text(item.count)
        this.typeElemJQ.text(item.info.name + itemSuffix)
        this.priorWorkElemJQ.text(item.priorWork)
        this.costElemJQ.text(item.totalCost)
        if (hideDetailsButton)
          this.showDetailsElemJQ.hide()
        break
    }

    this.SetEnchants(item.enchantsByID)
  }


  // ======== PRIVATE ========


  SetupItemOptions() {
    let itemSelectElemJQs = this.rowElemJQ.find('select[name="itemID"]')
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      itemSelectElemJQs.append(`<option value="${itemInfo.id}">${itemInfo.name}</option>`)
    }
  }


  SetupPriorWorkOptions() {
    let priorWorkSelectElemJQs = this.rowElemJQ.find('select[name="priorWork"]')
    for (let priorWork = 0; priorWork <= 6; ++priorWork)
      priorWorkSelectElemJQs.append(`<option value="${priorWork}">${priorWork}</option>`)
  }


  RenumberAllRows(tbodyElemJQ) {
    tbodyElemJQ.find('.item').each((rowNr, rowElem) => {
      new ItemRow(this.ShowDetails, $(rowElem), g_source, false).SetNumber(rowNr)
    })
  }


  SyncEnchantOptions() {
    this.RemoveEnchants()

    let itemID = parseInt(this.idElemJQ.val())
    this.enchantTemplateRow.UpdateEnchantOptions(itemID)
  }


  HookUpGUI(item) {
    if (this.set === g_source) {
      this.rowElemJQ.find('button[name="removeItem"]').click(() => {
        let tbodyElemJQ = this.rowElemJQ.parent()

        this.Remove()

        this.RenumberAllRows(tbodyElemJQ)
      })
    }

    if (this.set === g_source || this.set === g_desired) {
      this.idElemJQ.change(() => {
        this.SyncEnchantOptions()
      })

      this.addEnchantElemJQ = this.rowElemJQ.find('button[name="addEnchant"]')
      this.addEnchantElemJQ.click(() => {
        this.AddEnchant()
      })
    }

    if (this.set === g_combined) {
      this.rowElemJQ.find('button[name="show"]').click(() => {
        this.ShowDetails(item)
      })
    }
  }


  // returns ItemRow
  MakeExtraRealRow() {
    let newRowElemJQ = this.rowElemJQ.clone()
    newRowElemJQ.appendTo(this.rowElemJQ.parent())

    newRowElemJQ.removeClass('template')
    newRowElemJQ.attr('data-real', 1)

    return new ItemRow(this.ShowDetails, newRowElemJQ, this.set, false)
  }


  // returns object:
  // - count: int / NaN
  // - inError: bool
  // - errorElemJQ: JQuery-wrapped input element, if applicable
  GetValidatedCount() {
    let count = 1
    let inError = false
    if (this.set === g_source) {
      count = parseInt(this.countElemJQ.val())
      inError = isNaN(count)
    }
    return {
      count: count,
      inError: inError,
      errorElemJQ:
        inError ?
        this.countElemJQ :
        undefined
    }
  }


  // returns object:
  // - withConflict: bool
  // - conflictInfo: {
  //     conflictingEnchantName: string
  //     inputElemJQ: JQuery-wrapped input element, if applicable
  //   }
  // - withDupe: bool
  // - dupeElemJQ: JQuery-wrapped input element, if applicable
  AddItemEnchants(item) {
    let result = {
      withConflict: false,
      conflictInfo: {},
      withDupe: false,
      dupeElemJQ: undefined
    }
    let foundEnchants = []
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
      let enchantRowElemJQ = $(enchantRowElem)
      let enchantRow = new EnchantRow(enchantRowElemJQ, this.set)
      if (enchantRow.IsReal()) {
        let enchant = enchantRow.GetEnchant()
        foundEnchants.forEach((previousEnchant) => {
          if (EnchantIDsConflict(previousEnchant.info.id, enchant.info.id)) {
            result.withConflict = true
            result.conflictInfo.conflictingEnchantName = previousEnchant.info.name
            result.conflictInfo.inputElemJQ = enchantRow.GetIDElemJQ()
          }
          if (previousEnchant.info.id == enchant.info.id) {
            result.withDupe = true
            result.dupeElemJQ = enchantRow.GetIDElemJQ()
          }
        })

        foundEnchants.push(enchant)

        item.SetEnchant(enchant)
      }
      return !result.withConflict
    })

    return result
  }


  SetEnchants(enchantsByID) {
    this.RemoveEnchants()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.AddEnchant(enchant)
    }
  }
}




/*
  Collects Item-s from ItemRow-s, merging mergeable items/rows in the process if needed.

  Prerequisites:
  - item.js
  - itemRow.js

  Defined classes:
  - ItemCollectionResult
    - withCountErrors: bool
    - countErrorElemJQs: [] of JQuery wrapped DOM input elements
    - withEnchantConflicts: bool
    - enchantConflictInfos: [] of {
        conflictEnchantName: string,
        inputElemJQ: JQuery wrapped DOM input element
      }
    - withEnchantDupes: bool
    - enchantDupeElemJQs: [] of JQuery wrapped DOM input elements
    - items: Item[]
    - mergedItems: bool
    - rowsToUpdateNr: ItemRow[]
    - rowsToUpdateCount: ItemRow[]
    - rowsToRemove: ItemRow[]
    - itemsByRow: Map(ItemRow -> Item)
      if mergedItems, maps the ItemRow-s returned in rowsToUpdateCount,
      rowsToUpdateNr and rowsToRemove to their corresponding Item-s
      returned in items.
  - ItemCollector
*/


// ======== PUBLIC ========


class ItemCollectionResult {
  constructor() {
    // ==== PUBLIC ====
    this.withCountErrors = false
    this.countErrorElemJQs = []
    this.withEnchantConflicts = false
    this.enchantConflictInfos = []
    this.withEnchantDupes = false
    this.enchantDupeElemJQs = []
    this.items = []
    this.mergedItems = false
    this.rowsToUpdateNr = []
    this.rowsToUpdateCount = []
    this.rowsToRemove = []
    this.itemsByRow = new Map()
  }
}




class ItemCollector {
  constructor(mergeItems) {
    // ==== PRIVATE ====
    this.mergeItems = mergeItems
    this.rowDetailsByHash = new Map()
    this.rowItemsMappedForUpdateCount = new Set()
    this.nextRowNr = 1

    this.result = new ItemCollectionResult()
  }


  ProcessRow(itemRow) {
    let itemResult = itemRow.GetItem()
    if (itemResult.withCountError) {
      this.result.withCountErrors = true
      this.result.countErrorElemJQs.push(itemResult.countErrorElemJQ)
    }
    if (itemResult.withEnchantConflict) {
      this.result.withEnchantConflicts = true
      this.result.enchantConflictInfos.push(itemResult.enchantConflictInfo)
    }
    if (itemResult.withEnchantDupe) {
      this.result.withEnchantDupes = true
      this.result.enchantDupeElemJQs.push(itemResult.enchantDupeElemJQ)
    }

    let item = itemResult.item
    let itemHash = item.HashTypeAndPriorWork()

    item.nr = this.nextRowNr

    let rowNrUpdated = false
    if (itemRow.nr != this.nextRowNr) {
      itemRow.nr = this.nextRowNr
      rowNrUpdated = true
    }

    let mayMergeRow =
      this.mergeItems &&
      !this.result.withCountErrors &&
      !this.result.withEnchantDupes

    let rowMerged = false
    if (mayMergeRow) {
      let prevRowDetails = this.rowDetailsByHash.get(itemHash)
      if (prevRowDetails !== undefined) {
        this.result.rowsToRemove.push(itemRow)
        this.result.itemsByRow.set(itemRow, item)

        prevRowDetails.item.count += item.count
        if (!this.rowItemsMappedForUpdateCount.has(prevRowDetails.row)) {
          this.result.rowsToUpdateCount.push(prevRowDetails.row)
          this.result.itemsByRow.set(prevRowDetails.row, prevRowDetails.item)
          this.rowItemsMappedForUpdateCount.add(prevRowDetails.row)
        }

        rowMerged = true
        this.result.mergedItems = true
      }
    }

    if (!rowMerged) {
      if (rowNrUpdated) {
        this.result.rowsToUpdateNr.push(itemRow)
        this.result.itemsByRow.set(itemRow, item)
      }

      this.result.items.push(item)
      this.rowDetailsByHash.set(itemHash, {
        'item': item,
        'row': itemRow
      })

      ++this.nextRowNr
    }
  }


  // return ItemCollectionResult
  Finalize() {
    return this.result
  }
}




/*
  Wrapper for item tables (source, desired, combined).

  Prerequisites:
  - dataSets.js
  - itemRow.js
  - itemCollector.js

  Defined classes:
  - ItemTable
    - set: DataSet
    - tableElemJQ: the main table's jQuery element
*/


// ======== PUBLIC ========


class ItemTable {
  constructor(ShowDetails, tableElemJQ, addItemElemJQ, set) {
    // ==== PUBLIC ====
    this.set = set
    this.tableElemJQ = tableElemJQ

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.addItemElemJQ = addItemElemJQ
    if (this.addItemElemJQ !== undefined) {
      addItemElemJQ.click(() => {
        this.AddRow()
      })
    }

    if (this.set === g_desired) {
      let itemRowElemJQ = this.tableElemJQ.find('.item').first()
      this.itemRow = new ItemRow(this.ShowDetails, itemRowElemJQ, this.set, true)
    }
    else {
      let templateRowElemJQ = this.tableElemJQ.find('.template').first()
      this.templateRow = new ItemRow(this.ShowDetails, templateRowElemJQ, this.set, false)
    }
  }


  // returns ItemRow
  AddRow() {
    let newNr = this.tableElemJQ.find('.item').length
    return this.templateRow.CreateNew(newNr, undefined, true, this.addItemElemJQ)
  }


  // note: for g_desired tables, only the 1st item is used.
  SetItems(items) {
    if (this.set === g_desired)
      this.itemRow.SetItem(items[0])
    else {
      this.Clear()

      for (let itemNr = 0; itemNr < items.length; ++itemNr) {
        let item = items[itemNr]
        this.templateRow.CreateNew(itemNr + 1, item, false, this.addItemElemJQ)
      }
    }
  }


  // returns ItemCollectionResult
  GetItems(itemCollector) {
    let itemRows = this.GetItemRows()

    for (let rowNr = 0; rowNr < itemRows.length; ++rowNr)
      itemCollector.ProcessRow(itemRows[rowNr])

    let result = itemCollector.Finalize()

    if (result.mergedItems) {
      this.UpdateRowNrs(itemRows, result)
      this.UpdateRowCounts(itemRows, result)
      this.RemoveMergedRows(itemRows, result)
    }

    return result
  }


  // ======== PRIVATE ========


  Clear() {
    this.tableElemJQ.find('.item').each((rowNr, rowElem) => {
      let itemRow = new ItemRow(this.ShowDetails, $(rowElem), this.set, false)
      if (itemRow.IsReal())
        itemRow.Remove()
      return true
    })
  }


  UpdateRowNrs(itemRows, mergeResult) {
    for (let rowNr = 0; rowNr < mergeResult.rowsToUpdateNr.length; ++rowNr) {
      let itemRow = mergeResult.rowsToUpdateNr[rowNr]
      itemRow.SetNumber(itemRow.nr)
    }
  }


  UpdateRowCounts(itemRows, mergeResult) {
    for (let rowNr = 0; rowNr < mergeResult.rowsToUpdateCount.length; ++rowNr) {
      let itemRow = mergeResult.rowsToUpdateCount[rowNr]
      let item = mergeResult.itemsByRow.get(itemRow)
      itemRow.SetCount(item.count)
    }
  }


  RemoveMergedRows(itemRows, mergeResult) {
    for (let rowNr = 0; rowNr < mergeResult.rowsToRemove.length; ++rowNr)
      mergeResult.rowsToRemove[rowNr].Remove()
  }


  // returns ItemRow[]
  GetItemRows() {
    let itemRows = []
    this.tableElemJQ.find('.item').each((rowNr, itemRowElem) => {
      let itemRow = new ItemRow(this.ShowDetails, $(itemRowElem), this.set, false)
      if (itemRow.IsReal()) {
        itemRow.nr = itemRows.length
        itemRows.push(itemRow)
      }
      return true
    })
    return itemRows
  }
}




/*
  Main form (page I/O) management.  Links all buttons to action handlers, and
  populates form element values/options.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - itemTable.js
  - itemRow.js
  - mainFormData.js
  - dataStream.js
  - itemCombiner.js
  - combineResultFilter.js
  - recipeFormData.js

  Defined classes:
  - MainForm
*/


// ======== PUBLIC ========


class MainForm {
  constructor(formHandler) {
    this.formHandler = formHandler

    $(() => {
      // only execute once the DOM is fully loaded
      this.StartUp()
    })

    $(window).on('beforeunload', (event) => {
      this.ShutDown(event)
    })
  }


  // ======== PRIVATE ========


  StartUp() {
    this.InitializeSubObjects()

    this.HookUpGUI()

    this.InitializeNotesSection()

    this.StartLoading()
  }


  ShutDown(event) {
    if (!this.Save(false))
      this.formHandler.FailedToSaveOnUnload(event)
  }


  ShowRecipePage(item) {
    let dataStream = new DataStream(true)

    let recipeFormData = new RecipeFormData()
    recipeFormData.SetItem(item)
    recipeFormData.Serialize(dataStream)

    let baseURL = new URL('recipe.html', document.baseURI)
    let recipeUrl = dataStream.GetAsURL(baseURL)
    window.open(recipeUrl)
  }


  InitializeSubObjects() {
    this.sourceItemTable = new ItemTable(undefined, $('#sources table'), $('#addSourceItem'), g_source)
    this.desiredItemTable = new ItemTable(undefined, $('#desired table'), undefined, g_desired)
    this.combineItemTable = new ItemTable(this.ShowRecipePage, $('#combines table'), undefined, g_combined)
  }


  HookUpGUI() {
    $('#divine').click(() => {
      this.PerformDivine()
    })

    $('#makeBookmark').click(() => {
      if (!this.Save(true))
        this.formHandler.TellFailedToSaveOnRequest()
    })
  }


  ContinueDivine(dataInContext) {
    this.formHandler.TellCombineStarting(() => {
      this.ExitDivine()
    })

    // Note: the path should be relative to the html document loading us!
    this.combineWorker = new Worker('scripts/itemCombineWorker.js')

    this.combineWorker.onmessage = (e) => {
      switch (e.data.type) {
        case 0:
          this.formHandler.TellCombineProgress(e.data.progress, e.data.maxProgress, e.data.timeInMS)
          break
        case 1:
          this.formHandler.TellCombineFinalizing()
          break
        case 2:
          let cleanedUpItemsResult = e.data.result
          RehydrateItems(cleanedUpItemsResult.items)
          cleanedUpItemsResult.level = CombineResultLevel.GetRehydrated(cleanedUpItemsResult.level)

          this.ShowCombinedItems(cleanedUpItemsResult.items)

          this.formHandler.TellCombineDone(cleanedUpItemsResult.level, cleanedUpItemsResult.hasSources, e.data.maxProgress, e.data.timeInMS)
          break
      }
    }

    this.combineWorker.postMessage({
      type: 0,
      sourceItems: dataInContext.data.sourceItems,
      desiredItem: dataInContext.data.desiredItem,
      feedbackIntervalMS: 100
    })
  }


  PerformDivine() {
    this.ClearErrors()
    this.ClearResult()

    let dataInContext = this.GetData(true)
    if (dataInContext.withCountErrors || dataInContext.withEnchantConflicts || dataInContext.withEnchantDupes)
      this.formHandler.TellDataInError()
    else {
      let ContinueCombine = () => {
        this.ContinueDivine(dataInContext)
      }

      if (dataInContext.mergedSourceItems)
        this.formHandler.TellItemsMerged(ContinueCombine)
      else
        ContinueCombine()
    }
  }


  ExitDivine() {
    if (this.combineWorker !== undefined) {
      this.combineWorker.terminate()
      this.combineWorker = undefined
    }
  }


  InitializeNotesSection() {
    let notesElemJQ = $('#notes')
    let hideNotesElemJQ = $('#hideNotes')
    let showNotesElemJQ = $('#showNotes')

    let hideNotes = localStorage.getItem('hideNotes') != null
    if (hideNotes) {
      notesElemJQ.hide()
      showNotesElemJQ.show()
    }

    let showHideOptions = {
      'duration': 400
    }
    hideNotesElemJQ.click(() => {
      notesElemJQ.hide(showHideOptions)
      showNotesElemJQ.show(showHideOptions)
      localStorage.setItem('hideNotes', '1')
    })
    showNotesElemJQ.click(() => {
      notesElemJQ.show(showHideOptions)
      showNotesElemJQ.hide(showHideOptions)
      localStorage.removeItem('hideNotes')
    })
  }


  ClearErrors() {
    this.formHandler.ClearErrors()
  }


  ClearResult() {
    this.combineItemTable.Clear()
  }


  ShowCombinedItems(combinedItems) {
    this.combineItemTable.SetItems(combinedItems)
  }


  // returns object;
  // - data: MainFormData
  // - withCountErrors: bool
  // - withEnchantConflicts: bool
  // - withEnchantDupes: bool
  // - mergedSourceItems: bool
  GetData(mergeSourceItems) {
    let sourceItemsResult = this.sourceItemTable.GetItems(new ItemCollector(mergeSourceItems))
    let desiredItemResult = this.desiredItemTable.GetItems(new ItemCollector(false))

    let data = new MainFormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItemResult.items[0])

    let withCountErrors =
      sourceItemsResult.withCountErrors ||
      desiredItemResult.withCountErrors
    if (withCountErrors) {
      let countErrorElemJQs = [...sourceItemsResult.countErrorElemJQs, ...desiredItemResult.countErrorElemJQs]
      countErrorElemJQs.forEach((countErrorElemJQ) => {
        this.formHandler.NoteCountError(countErrorElemJQ)
      })
    }

    let withEnchantConflicts =
      sourceItemsResult.withEnchantConflicts ||
      desiredItemResult.withEnchantConflicts
    if (withEnchantConflicts) {
      let enchantConflictInfos = [...sourceItemsResult.enchantConflictInfos, ...desiredItemResult.enchantConflictInfos]
      enchantConflictInfos.forEach((enchantConflictInfo) => {
        this.formHandler.NoteEnchantConflict(enchantConflictInfo)
      })
    }

    let withEnchantDupes =
      sourceItemsResult.withEnchantDupes ||
      desiredItemResult.withEnchantDupes
    if (withEnchantDupes) {
      let enchantDupeElemJQs = [...sourceItemsResult.enchantDupeElemJQs, ...desiredItemResult.enchantDupeElemJQs]
      enchantDupeElemJQs.forEach((enchantDupeElemJQ) => {
        this.formHandler.NoteEnchantDupe(enchantDupeElemJQ)
      })
    }

    return {
      data: data,
      withCountErrors: withCountErrors,
      withEnchantConflicts: withEnchantConflicts,
      withEnchantDupes: withEnchantDupes,
      mergedSourceItems: sourceItemsResult.mergedItems
    }
  }


  SetData(data) {
    this.ClearResult()
    this.sourceItemTable.SetItems(data.sourceItems)
    this.desiredItemTable.SetItems([data.desiredItem])
  }


  StartLoading() {
    let loadingOptions = new DataStreamLoadingOptions()

    let ContinueLoading = () => {
      let allOK = true
      let stream = new DataStream(false)
      if (stream.Load(loadingOptions)) {
        let data = new MainFormData()
        allOK = data.Deserialize(stream)
        if (allOK)
          this.SetData(data)
      }

      if (!allOK)
        this.formHandler.FailedToLoad()
    }

    if (!loadingOptions.inConflict)
      ContinueLoading()
    else {
      this.formHandler.AskLoadFromURLOrLocalStorage(() => {
        loadingOptions.ChooseLocalStorage()
        ContinueLoading()
      },
      () => {
        loadingOptions.ChooseURL()
        ContinueLoading()
      })
    }
  }


  // returns bool (if saving was successful)
  Save(toURL) {
    this.ClearErrors()

    let dataInContext = this.GetData(false)
    let dataOK = !dataInContext.withCountErrors && !dataInContext.withEnchantDupes
    if (dataOK) {
      let stream = new DataStream(true)
      dataInContext.data.Serialize(stream)

      if (toURL)
        stream.SaveToBookmarkLink()
      else
        stream.SaveToLocalStorage()
    }

    return dataOK
  }
}




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
    this.isRelevant = this.targetLevel > 0 || this.sacrificeLevel > 0
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
      combinedLevel = 0
      targetUsed = false
      sacrificeUsed = false
      costless = true
    }
    else if (this.targetLevel < this.sacrificeLevel) {
      combinedLevel = this.sacrificeLevel
      targetUsed = false
      sacrificeUsed = true
      costless = false
    }
    else if (this.targetLevel > this.sacrificeLevel) {
      combinedLevel = this.targetLevel
      targetUsed = true
      sacrificeUsed = false
      costless = this.sacrificeLevel == 0
    }
    else { // this.targetLevel == this.sacrificeLevel
      combinedLevel = Math.min(this.targetLevel + 1, this.enchantInfo.maxLevel)
      targetUsed = combinedLevel > this.targetLevel
      sacrificeUsed = targetUsed
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




/*
  Tracks lists and progress for combining items.

  Strategy: we process all items, combining them with all items that
  come before them.  New items are added at the back so that they
  in turn will automatically be picked up too in time.  The process
  stops out of itself once no new items can be added anymore, which
  should happen since at some point all low-level combinations have
  already been made and new combinations are just too costly due to
  the prior work penalty.
  To make the process more efficient, we want to be able to remove
  inferior items.  For that we keep track of 3 lists;
  - allItems: Item[]
    Contains all items, incl. source items.
  - allItemsByTypeHash: Map(string -> Item)
    Groups same-typed items together to enable quick retrieval for
    comparison on fitness.
  - itemListInfosByItem: Map(Item -> ItemListInfo)
    Stores extra list indexing information for each item, to make
    managing our internal lists more efficient.
  Each ItemListInfo in turn tracks three things;
  - index: int
    The index the item has in the allItems list.
  - typeHash: string
    The type hash of the item, and thus also the index the item has
    in the allItemsByTypeHash list.
  - derivedItems: [Item]
    All items that are derived from the item (whose targetItem or
    sacrificeItem is set to that item).

  Prerequisites:
  - item.js

  Defined classes:
  - ItemCombineList
*/


class ItemCombineList {
  constructor(sourceItems) {
    this.allItems = []
    this.allItemsByTypeHash = new Map()
    this.itemListInfosByItem = new Map()

    this.numSourceItems = sourceItems.length
    sourceItems.forEach((item) => {
      this.AddItem(item, item.HashType())
    })

    this.item1Nr = 0
    this.item2Nr = 0
  }


  // Returns if there are next items.
  // Items will have its .item1 and .item2 set to the items.
  GetNextItems(items) {
    if (this.item1Nr >= this.allItems.length)
      return false

    items.item1 = this.allItems[this.item1Nr]
    items.item2 = this.allItems[this.item2Nr]

    ++this.item2Nr
    if (this.item2Nr > this.item1Nr) {
      ++this.item1Nr
      this.item2Nr = 0
    }

    return true
  }


  ProcessItem(combinedItem, GradeCombinedItems) {
    // Optimization: if the new item is identical to something we already
    // have in both type and enchants, then we can dedupe these and toss
    // the one that:
    // - has the same or a superset of the same origins, and
    // - has the same or a higher priorWork, and
    // - has the same or higher totalCost
    // If not all conditions are met it's a toss-up which one will turn out
    // to be the better one, so we need to take both.

    if (combinedItem === undefined)
      // No item; nothing to do.
      return

    let combinedItemTypeHash = combinedItem.HashType()

    // Note: we keep the item by default; if there is no itemsByHashType
    // for this item we haven't seen items of this kind yet, so keep it.
    // If there already are like items, we let GradeCombinedItems decide
    // what should happen by holding it against all other items.  And in
    // case that list has become empty, .every returns true for empty
    // arrays, which is what we want too.
    let keepItem = true
    let removeItems = []
    if (this.allItemsByTypeHash.has(combinedItemTypeHash)) {
      let otherSameTypedItems = this.allItemsByTypeHash.get(combinedItemTypeHash)
      keepItem = otherSameTypedItems.every((otherItem) => {
        let grade = GradeCombinedItems(otherItem, combinedItem)
        if (grade == -1)
          // This other item is constructed better, so we can discard the
          // new one.  We can also stop checking, since all other items
          // will not be worse than the new one either.
          return false

        if (grade == +1)
          // The new item is constructed better; we can discard the other
          // one and all it's decendants.
          removeItems.push(otherItem)

        // The new one's grade is a toss-up or better than all, so keep it.
        return true
      })
    }

    if (keepItem)
      this.AddItem(combinedItem, combinedItemTypeHash)

    if (removeItems.length > 0)
      this.RemoveItems(removeItems)
  }


  GetCombinedItems() {
    return this.allItems.slice(this.numSourceItems, this.allItems.length)
  }


  GetCurrentProgress() {
    return this.Progress(this.item1Nr) + this.item2Nr
  }


  GetMaxProgress() {
    return this.Progress(this.allItems.length)
  }


  // ======== PRIVATE ========


  Progress(value) {
    return value * (value + 1) / 2
  }


  AddItem(item, itemTypeHash) {
    let itemIndex = this.allItems.length
    let itemListInfo = {
      index: itemIndex,
      typeHash: itemTypeHash,
      derivedItems: []
    }

    this.allItems.push(item)

    this.itemListInfosByItem.set(item, itemListInfo)
    if (item.set === g_combined) {
      this.itemListInfosByItem.get(item.targetItem).derivedItems.push(item)
      this.itemListInfosByItem.get(item.sacrificeItem).derivedItems.push(item)
    }

    if (this.allItemsByTypeHash.has(itemTypeHash))
      this.allItemsByTypeHash.get(itemTypeHash).push(item)
    else
      this.allItemsByTypeHash.set(itemTypeHash, [item])
  }


  RemoveFromParentLists(item, parentItem) {
    // Note: if we already removed the parent item, it's
    // itemListInfo will also be gone by now.  That's OK
    // though; no need then to patch it up either.
    let parentListInfo = this.itemListInfosByItem.get(parentItem)
    if (parentListInfo !== undefined) {
      let index = parentListInfo.derivedItems.indexOf(item)
      parentListInfo.derivedItems.splice(index, 1)
    }
  }


  RemoveItems(items) {
    for (let itemIndex = 0; itemIndex < items.length; ++itemIndex) {
      let item = items[itemIndex]
      let listInfo = this.itemListInfosByItem.get(item)

      this.allItems.splice(listInfo.index, 1)
      for (let higherItemIndex = listInfo.index; higherItemIndex < this.allItems.length; ++higherItemIndex) {
        let higherItem = this.allItems[higherItemIndex]
        let higherListInfo = this.itemListInfosByItem.get(higherItem)
        --higherListInfo.index
      }
      if (listInfo.index < this.numSourceItems)
        --this.numSourceItems

      if (this.item1Nr == listInfo.index)
        this.item2Nr = 0
      else {
        if (this.item1Nr > listInfo.index)
          --this.item1Nr
        if (this.item2Nr > listInfo.index)
          --this.item2Nr
      }

      this.itemListInfosByItem.delete(item)
      if (item.set === g_combined) {
        this.RemoveFromParentLists(item, item.targetItem)
        this.RemoveFromParentLists(item, item.sacrificeItem)
      }

      let otherSameTypedItems = this.allItemsByTypeHash.get(listInfo.typeHash)
      let otherItemIndex = otherSameTypedItems.indexOf(item)
      otherSameTypedItems.splice(otherItemIndex, 1)

      if (listInfo.derivedItems.length > 0)
        items.push(...listInfo.derivedItems)
    }
  }
}




/*
  Performs all sorts of tests for item combining.

  Prerequisites:
  - none

  Defined classes:
  - ItemCombineTester
*/


// ======== PUBLIC ========


class ItemCombineTester {
  constructor() {
  }


  // returns bool
  TargetIsRelevant(targetItem, desiredItem) {
    return (
      targetItem.info.isBook ||
      targetItem.info === desiredItem.info
    )
  }


  // returns bool
  ItemsCompatible (targetItem, sacrificeItem) {
    return (
      targetItem.info.isBook ? (
        sacrificeItem.info.isBook // we can only add books to books
      ) : (
        sacrificeItem.info.isBook || // we can always add books to anything
        sacrificeItem.info === targetItem.info // or combine items of the same type
      )
    )
  }


  // returns bool
  CombineIsWasteful(targetItem, targetUsed, sacrificeItem, sacrificeUsed) {
    if (!targetItem.info.isBook && sacrificeItem.info.isBook)
      // ... book-on-tool: we only care if the book's enchants got used;
      // if the tool's enchants went unused we just singlehandedly upgraded
      // all enchants on the tool, which is perfectly fine
      return !sacrificeUsed
    else if (targetItem.info.isBook == sacrificeItem.info.isBook)
      // ... tool-on-tool or book-on-book; if either didn't get used it's
      // just a waste of that item (book or tool)
      return !targetUsed || !sacrificeUsed
    else
      // ... tool-on-book wtf situation; just bail out
      return true
  }


  // returns bool
  UnenchantedSourcePresent(sourceItems, desiredItem) {
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr) {
      let sourceItem = sourceItems[itemNr]
      if (
        sourceItem.info === desiredItem.info &&
        sourceItem.enchantsByID.size == 0
      )
        return true
    }

    return false
  }


  // returns bool
  EnchantConflictsForItem(enchantInfo, targetItem) {
    let conflicts = false
    targetItem.enchantsByID.forEach((enchant, id) => {
      if (EnchantIDsConflict(enchantInfo.id, id))
        conflicts = true
    })

    return conflicts
  }
}




/*
  Combines all given items to get all possible item combinations.

  Prerequisites:
  - dataSets.js
  - enchantConflicts.js
  - enchantInfo.js
  - item.js
  - enchant.js
  - itemOrigins.js
  - enchantCombiner.js
  - itemCombineList.js
  - itemCombineTester.js

  Defined classes:
  - ItemCombiner
*/


// ======== PRIVATE ========


class CombineResult {
  constructor() {
    this.targetUsed = false
    this.sacrificeUsed = false
    this.enchantsByID = new Map()
    this.cost = 0
  }
}


// ======== PUBLIC ========


class ItemCombiner {
  // returns object; { combinedItems: Item[], maxProgress: int }
  GetAllItemCombinations(sourceItems, desiredItem, feedbackHandler) {
    let tester = new ItemCombineTester()

    let filteredSourceItems = this.DropNonMatchingSourceItems(tester, sourceItems, desiredItem)

    this.DropUnusedEnchantsFromItems(filteredSourceItems, desiredItem)

    this.InsertExtraUnenchantedItem(tester, filteredSourceItems, desiredItem)

    this.SetupItemOrigins(filteredSourceItems)

    let itemList = new ItemCombineList(filteredSourceItems)

    this.MakeAllCombinations(tester, itemList, desiredItem, feedbackHandler)

    return {
      combinedItems: itemList.GetCombinedItems(),
      maxProgress: itemList.GetMaxProgress()
    }
  }


  // ======== PRIVATE ========


  DropNonMatchingSourceItems(tester, sourceItems, desiredItem) {
    let filteredSourceItems = []
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr) {
      let sourceItem = sourceItems[itemNr]
      if (tester.TargetIsRelevant(sourceItem, desiredItem))
        filteredSourceItems.push(sourceItem)
    }

    return filteredSourceItems
  }


  DropUnusedEnchantsFromItems(sourceItems, desiredItem) {
    desiredItem.DropUnusedEnchants()
    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr)
      sourceItems[itemNr].DropUnusedEnchants()
  }


  SetupItemOrigins(sourceItems) {
    let zeroOrigin = new ZeroOrigin(sourceItems)

    for (let itemNr = 0; itemNr < sourceItems.length; ++itemNr) {
      let item = sourceItems[itemNr]
      item.origin = zeroOrigin.CreateOrigin(itemNr, item.count)
    }
  }


  // Grades the given combined items; returns:
  // -1: previousItem is constructed better
  // +1: newItem is constructed better
  //  0: it's a mixed bag
  //
  // Used to optimize adding items: if one item is identical to
  // something we already have in both type and enchants, then
  // we can dedupe these and toss the one that:
  // - has the same or a superset of the same origins, and
  // - has the same or a higher priorWork, and
  // - has the same or higher totalCost
  GradeCombinedItems(previousItem, newItem) {
    if (
      previousItem.totalCost <= newItem.totalCost &&
      previousItem.priorWork <= newItem.priorWork &&
      previousItem.origin.IsSubsetOf(newItem.origin)
    )
      return -1
    else if (
      newItem.totalCost <= previousItem.totalCost &&
      newItem.priorWork <= previousItem.priorWork &&
      newItem.origin.IsSubsetOf(previousItem.origin)
    )
      return +1
    else
      return 0
  }


  ProcessItemCombination(tester, item1, item2, desiredItem, itemList) {
    let combinedItem = this.CombineItems(tester, item1, item2, desiredItem)

    itemList.ProcessItem(combinedItem, this.GradeCombinedItems)
  }


  MakeAllCombinations(tester, itemList, desiredItem, feedbackHandler) {
    let nextItems = {}
    while (itemList.GetNextItems(nextItems)) {
      if (feedbackHandler.TimeForFeedback())
        feedbackHandler.TellProgress(
          itemList.GetCurrentProgress(),
          itemList.GetMaxProgress()
        )

      this.ProcessItemCombination(tester, nextItems.item1, nextItems.item2, desiredItem, itemList)
      if (nextItems.item1 !== nextItems.item2)
        // Optimization: no need reversing the same item onto itself
        this.ProcessItemCombination(tester, nextItems.item2, nextItems.item1, desiredItem, itemList)
    }
  }


  InsertExtraUnenchantedItem(tester, sourceItems, desiredItem) {
    let hasEnchants = desiredItem.enchantsByID.size > 0
    if (
      !desiredItem.info.isBook &&
      hasEnchants &&
      !tester.UnenchantedSourcePresent(sourceItems, desiredItem)
    ) {
      let extraItem = new Item(
        1,
        g_extra,
        desiredItem.info.id,
        0
      )
      sourceItems.push(extraItem)
    }
  }


  CombineEnchants(tester, targetItem, sacrificeItem, combineResult) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      let enchantCombiner = new EnchantCombiner(targetItem, sacrificeItem, enchantInfo)
      if (
        targetItem.info.CanHaveEnchant(enchantInfo.id) &&
        enchantCombiner.isRelevant
      ) {
        if (tester.EnchantConflictsForItem(enchantInfo, targetItem))
          // Java: conflicts cost nonetheless
          // Bedrock: no penalty on conflicts
          ++combineResult.cost
        else {
          let enchantCombineResult = enchantCombiner.Combine()

          if (enchantCombineResult.targetUsed)
            combineResult.targetUsed = true
          if (enchantCombineResult.sacrificeUsed)
            combineResult.sacrificeUsed = true
          combineResult.enchantsByID.set(enchantInfo.id, new Enchant(enchantInfo.id, enchantCombineResult.combinedLevel))
          combineResult.cost += enchantCombineResult.cost
        }
      }
    }
  }


  // returns int
  PriorWorkToCost(priorWork) {
    return (1 << priorWork) - 1
  }


  // returns Item (the combined item, or undefined if they couldn't be combined)
  CombineItems(tester, targetItem, sacrificeItem, desiredItem) {
    let combinedItem = undefined

    if (
      tester.TargetIsRelevant(targetItem, desiredItem) &&
      tester.ItemsCompatible(targetItem, sacrificeItem)
    ) {
      let combineResult = new CombineResult()
      let numCombines = targetItem.origin.DetermineMaxCombineCount(sacrificeItem.origin)
      if (numCombines > 0) {
        this.CombineEnchants(tester, targetItem, sacrificeItem, combineResult)

        combineResult.cost +=
          this.PriorWorkToCost(targetItem.priorWork) +
          this.PriorWorkToCost(sacrificeItem.priorWork)

        if (
          !tester.CombineIsWasteful(targetItem, combineResult.targetUsed, sacrificeItem, combineResult.sacrificeUsed) &&
          combineResult.cost <= 39
        ) {
          let combinedPriorWork = Math.max(targetItem.priorWork, sacrificeItem.priorWork) + 1

          combinedItem = new Item(
            numCombines,
            g_combined,
            targetItem.info.id,
            combinedPriorWork
          )

          combinedItem.enchantsByID = combineResult.enchantsByID
          combinedItem.targetItem = targetItem
          combinedItem.sacrificeItem = sacrificeItem
          combinedItem.origin = targetItem.origin.Combine(sacrificeItem.origin)
          combinedItem.cost = combineResult.cost
          combinedItem.totalCost = combineResult.cost
          if (targetItem.set === g_combined)
            combinedItem.totalCost += targetItem.totalCost
          if (sacrificeItem.set === g_combined)
            combinedItem.totalCost += sacrificeItem.totalCost
        }
      }
    }

    return combinedItem
  }
}




/*
  Combined items result filtering.
  Used to filter, grade and sort resulting combined items for display to
  the user.

  Prerequisites:
  - item.js

  Defined classes:
  - CombineResultFilter

  Defined globals:
  - g_onlyPerfectCombines
  - g_perfectAndPerfectWithExtrasCombines
  - g_onlyPerfectWithExtrasCombines
  - g_onlyImperfectCombines
  - g_noCombines

  Desired match sorting order:
  - Put the single most fit perfect match (item + enchants) first.
  - Add all unique perfect matches with extra enchantments,
    picking the most fit of each set and sorting by decreasing fitness.
  - If none of the above are present, pick all unique imperfect items
    that are at least of the correct type, sorted decreasing by fitness.
*/


// ======== PUBLIC ========


class CombineResultLevel {
  // returns one of the predefined CombineResultLevel globals
  static GetRehydrated(level) {
    switch (level.id) {
      case 'p': return g_onlyPerfectCombines
      case 'pe': return g_perfectAndPerfectWithExtrasCombines
      case 'e': return g_onlyPerfectWithExtrasCombines
      case 'i': return g_onlyImperfectCombines
      case 'n': return g_noCombines
    }
    return undefined
  }


  constructor(id) {
    this.id = id
  }
}
g_onlyPerfectCombines = new CombineResultLevel('p')
g_perfectAndPerfectWithExtrasCombines = new CombineResultLevel('pe')
g_onlyPerfectWithExtrasCombines = new CombineResultLevel('e')
g_onlyImperfectCombines = new CombineResultLevel('i')
g_noCombines = new CombineResultLevel('n')




class CombineResultFilter {
  // ======== PUBLIC ========


  constructor(desiredItem) {
    this.desiredItem = desiredItem
  }


  // returns object;
  // - level: CombineResultLevel
  // - items: Item[]
  // - hasSources: bool
  GetCleanedUpItemList(sourceItems, combinedItems) {
    let itemGroups = this.SortItemsInGroups([...sourceItems, ...combinedItems])

    this.SortItemGroupsByFitness(itemGroups)

    // Note: perfects always hold the same items, so if we pick the 1st
    // then we have the one with best overall fitness.

    let hasPerfects = itemGroups.perfects.length > 0
    let hasPerfectsWithExtras = itemGroups.perfectsWithExtras.length > 0

    let level
    let items
    if (hasPerfects && !hasPerfectsWithExtras) {
      level = g_onlyPerfectCombines
      items = this.PickBestUniqueItems(itemGroups.perfects)
    }
    else if (hasPerfects && hasPerfectsWithExtras) {
      level = g_perfectAndPerfectWithExtrasCombines
      items = [
        ...this.PickBestUniqueItems(itemGroups.perfects),
        ...this.PickBestUniqueItems(itemGroups.perfectsWithExtras)
      ]
    }
    else if (!hasPerfects && hasPerfectsWithExtras) {
      level = g_onlyPerfectWithExtrasCombines
      items = this.PickBestUniqueItems(itemGroups.perfectsWithExtras)
    }
    else if (itemGroups.imperfects.length > 0) {
      level = g_onlyImperfectCombines
      items = this.PickBestUniqueItems(itemGroups.imperfects)
    }
    else {
      level = g_noCombines
      items = []
    }

    return {
      level: level,
      items: items,
      hasSources: this.ItemListContainsSources(items)
    }
  }


  // ======== PRIVATE ========


  // returns object;
  // - matchesType: bool
  // - matchesPerfect: bool
  // - hasExtraEnchants: bool
  // - rating: float
  CheckItemMatch(combinedItem) {
    let matchesType = combinedItem.info === this.desiredItem.info
    let matchesPerfect = matchesType
    let hasExtraEnchants = false
    let rating = 0.0

    if (matchesType) {
      // all enchants on desired, missing or not on combined
      this.desiredItem.enchantsByID.forEach((desiredEnchant, id) => {
        let combinedLevel
        if (!combinedItem.enchantsByID.has(id)) {
          combinedLevel = 0
          matchesPerfect = false
        }
        else {
          let combinedEnchant = combinedItem.enchantsByID.get(id)
          combinedLevel = combinedEnchant.level

          if (combinedLevel < desiredEnchant.level)
            matchesPerfect = false
          else if (combinedLevel > desiredEnchant.level)
            hasExtraEnchants = true
        }

        rating += Math.abs(combinedLevel - desiredEnchant.level)
      })

      // all enchants missing on desired
      combinedItem.enchantsByID.forEach((combinedEnchant, id) => {
        if (!this.desiredItem.enchantsByID.has(id)) {
          hasExtraEnchants = true

          rating += combinedEnchant.level
        }
      })
    }

    return {
      matchesType: matchesType,
      matchesPerfect: matchesPerfect,
      hasExtraEnchants: hasExtraEnchants,
      rating: rating
    }
  }


  // returns object
  // - perfect: Item[]
  // - perfectsWithExtras: Item[]
  // - imperfects: Item[]
  SortItemsInGroups(items) {
    let groups = {
      perfects: [],
      perfectsWithExtras: [],
      imperfects: []
    }

    for (let itemNr = 0; itemNr < items.length; ++itemNr) {
      let item = items[itemNr]
      let matchResult = this.CheckItemMatch(item)

      if (matchResult.matchesType) {
        if (matchResult.matchesPerfect && !matchResult.hasExtraEnchants)
          groups.perfects.push(item)
        else if (matchResult.matchesPerfect && matchResult.hasExtraEnchants)
          groups.perfectsWithExtras.push(item)
        else
          groups.imperfects.push(item)
      }
    }

    return groups
  }


  // returns which item is the 1) best, 2) lowest priorWork and 3) cheapest match
  CompareRatedItemsByFitness(ratedItem1, ratedItem2) {
    if (ratedItem1.rating < ratedItem2.rating)
      return -1
    if (ratedItem1.rating > ratedItem2.rating)
      return +1

    if (ratedItem1.item.priorWork < ratedItem2.item.priorWork)
      return -1
    if (ratedItem1.item.priorWork > ratedItem2.item.priorWork)
      return +1

    if (ratedItem1.item.totalCost < ratedItem2.item.totalCost)
      return -1
    if (ratedItem1.item.totalCost > ratedItem2.item.totalCost)
      return +1

    return 0
  }


  // returns float
  RateItem(combinedItem) {
    let rating = 0.0

    // all enchants on desired, missing or not on combined
    this.desiredItem.enchantsByID.forEach((desiredEnchant, id) => {
      if (combinedItem.enchantsByID.has(id)) {
        let combinedEnchant = combinedItem.enchantsByID.get(id)
        rating += Math.abs(combinedEnchant.level - desiredEnchant.level)
      }
      else
        rating += desiredEnchant.level
    })

    // all enchants missing on desired
    combinedItem.enchantsByID.forEach((combinedEnchant, id) => {
      if (!this.desiredItem.enchantsByID.has(id))
        rating += combinedEnchant.level
    })

    return rating
  }


  // returns RatedItem[];
  // - item: Item
  // - rating: float // note: lower is better
  RateItems(items) {
    return items.map((item, itemNr, array) => {
      return {
        item: item,
        rating: this.RateItem(item)
      }
    })
  }


  // returns Item[]
  SortItemsByFitness(items) {
    let ratedItems = this.RateItems(items)

    ratedItems.sort(this.CompareRatedItemsByFitness)

    return ratedItems.map((ratedItem, itemNr, array) => {
      return ratedItem.item
    })
  }


  SortItemGroupsByFitness(itemGroups) {
    itemGroups.perfects = this.SortItemsByFitness(itemGroups.perfects)
    itemGroups.perfectsWithExtras = this.SortItemsByFitness(itemGroups.perfectsWithExtras)
    itemGroups.imperfects = this.SortItemsByFitness(itemGroups.imperfects)
  }


  // returns Map(hash(type) -> Item[])
  GroupItemsByType(items) {
    let itemsByType = new Map()
    items.forEach((item) => {
      let typeHash = item.HashType()
      if (!itemsByType.has(typeHash))
        itemsByType.set(typeHash, [])
      itemsByType.get(typeHash).push(item)
    })

    return itemsByType
  }


  AddLowestPrioAndCostItems(items, itemsToKeep) {
    /*
      Strategy:
      - For each priorWork and totalCost, decide which item has the lowest
        other property value.  This way we get an optimum for each value in
        each category.
      - Afterwards we find the items which score best on both accounts from
        these optimized lists.  If we e.g. know the item with the lowest
        priorWork for a particular totalCost, then we're only interested in
        that item if there isn't any lower totalCost item for that priorWork.
        We also check if there aren't any other items with both lower priorWork
        and totalCost.
    */

    if (items.length == 1)
      itemsToKeep.add(items[0])
    else {
      let minTotalCostItemByPriorWork = new Map()
      let minPriorWorkItemByTotalCost = new Map()
      items.forEach((item) => {
        if ((minTotalCostItemByPriorWork.get(item.priorWork)?.totalCost ?? 9e9) > item.totalCost)
          minTotalCostItemByPriorWork.set(item.priorWork, item)
        if ((minPriorWorkItemByTotalCost.get(item.totalCost)?.priorWork ?? 9e9) > item.priorWork)
          minPriorWorkItemByTotalCost.set(item.totalCost, item)
      })

      let CheckNoBetterItemPresent = (item, itemsByKey) => {
        let noBetterItemPresent = true
        itemsByKey.forEach((otherItem) => {
          if (
            otherItem.priorWork < item.priorWork &&
            otherItem.totalCost < item.totalCost
          )
            noBetterItemPresent = false
          return noBetterItemPresent
        })
        return noBetterItemPresent
      }

      minTotalCostItemByPriorWork.forEach((item) => {
        if (
          minPriorWorkItemByTotalCost.get(item.totalCost) === item &&
          CheckNoBetterItemPresent(item, minTotalCostItemByPriorWork)
        )
          itemsToKeep.add(item)
      })
      minPriorWorkItemByTotalCost.forEach((item) => {
        if (
          minTotalCostItemByPriorWork.get(item.priorWork) === item &&
          CheckNoBetterItemPresent(item, minPriorWorkItemByTotalCost)
        )
          itemsToKeep.add(item)
      })
    }
  }


  PickBestUniqueItems(items) {
    let itemsByType = this.GroupItemsByType(items)

    let itemsToKeep = new Set()
    itemsByType.forEach((items) => {
      this.AddLowestPrioAndCostItems(items, itemsToKeep)
    })

    return items.filter((item, itemNr, array) => {
      return itemsToKeep.has(item)
    })
  }


  ItemListContainsSources(items) {
    let hasSources = false
    items.forEach((item) => {
      if (item.set !== g_source)
        return true
      hasSources = true
      return false
    })
    return hasSources
  }
}




/*
  Main page javascript module.

  Prerequisites:
  - mainForm.js

  Defined classes:
  - FormHandler

  Defined globals:
  - g_form: MainForm
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


  ClearErrors() {
    $('.error').remove()
  }


  NoteCountError(inputElemJQ) {
    inputElemJQ.after('<div class="error">This is not a number</div>')
  }


  NoteEnchantConflict(conflictInfo) {
    conflictInfo.inputElemJQ.after(`<div class="error">This enchantment conflicts<br>with ${conflictInfo.conflictingEnchantName}</div>`)
  }


  NoteEnchantDupe(inputElemJQ) {
    inputElemJQ.after('<div class="error">Duplicate enchantment</div>')
  }


  AskLoadFromURLOrLocalStorage(OnLocalStorage, OnURL) {
    let dialogElemJQ = $('#urlVsLocalStorageConflict')
    dialogElemJQ.css('display', 'flex')

    dialogElemJQ.find('.useURL').click(() => {
      dialogElemJQ.hide()

      OnURL()
    })

    dialogElemJQ.find('.useLocalStorage').click(() => {
      dialogElemJQ.hide()

      OnLocalStorage()
    })
  }


  FailedToLoad() {
    this.ShowSimpleDialog('#dataInErrorForLoad', undefined)
  }


  FailedToSaveOnUnload(unloadEvent) {
    unloadEvent.preventDefault()
    unloadEvent.returnValue = 'Your data has issues and could not be saved.\n\nAre you sure you want to leave now?  Any unsaved changes will be lost!'
  }


  TellFailedToSaveOnRequest() {
    this.ShowSimpleDialog('#dataInErrorForSave', undefined)
  }


  TellDataInError() {
    this.ShowSimpleDialog('#dataInErrorForDivine', undefined)
  }


  TellItemsMerged(OnExit) {
    this.ShowSimpleDialog('#itemsMerged', OnExit)
  }


  TellCombineStarting(OnCancel) {
    let dialogElemJQ = $('#divining')
    dialogElemJQ.css('display', 'flex')
    let exitButtonElemJQ = $('#divining .exit')

    $('#divineTitle').html('Divination is in progress')
    $('#divineProgress').html('Starting up...')
    exitButtonElemJQ.html('Stop')

    exitButtonElemJQ[0].focus()
    this.MakeDialogKeyboardCloseable(dialogElemJQ, exitButtonElemJQ, OnCancel)
  }


  TellCombineFinalizing() {
    $('#divineProgress').html('Finalizing...')
  }


  TellCombineProgress(progress, maxProgress, timeInMilliseconds) {
    $('#divineProgress').html(this.GetProgressMessage(progress, maxProgress, timeInMilliseconds))
  }


  TellCombineDone(level, hasSources, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)

    let title = 'Divination is compete!'
    let message = `${this.GetProgressMessage(maxProgress, maxProgress, timeInMilliseconds)}<br><br>`

    if (level === g_noCombines) {
      title = 'Divination is unsuccessful'
      message += 'Sorry, I couldn\'t come up with your desired item at all.<br><br>Please look at your source items and desired item and make sure there is some sort of match.'
    }
    else if (level === g_onlyImperfectCombines)
      message += 'An exact match cannot be made.<br>I\'ll show you what can be made.'
    else if (level === g_onlyPerfectWithExtrasCombines)
      message += 'An exact match cannot be made, but I could create combinations with even more enchantments.<br>I\'ll show these instead.'
    else if (level === g_perfectAndPerfectWithExtrasCombines)
      message += 'I could also create combinations with even more enchantments.<br>I\'ll also show these combinations.'
    else if (level === g_onlyPerfectCombines)
      message += 'I listed how to get at your desired item.'

    if (hasSources)
      message += '<br><br>Some of your source item(s) are however also nice matches for what you requested.<br>I\'ve also listed these and marked them for you.'

    $('#divineTitle').html(title)
    $('#divineProgress').html(message)
    $('#divining .exit').html('OK')
  }


  // returns string
  GetFormattedTime(time) {
    time = Math.round(time)
    let seconds = time % 60
    time = Math.round((time - seconds) / 60)
    let minutes = time % 60
    time = Math.round((time - minutes) / 60)
    let hours = time
    return (
      hours == 0 ?
      `${minutes}:${seconds.toString().padStart(2, '0')}` :
      `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
  }


  // returns string
  GetProgressMessage(progress, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)

    let percentageText =
      maxProgress == 0 ?
      '100.0' :
      (100 * progress / maxProgress).toFixed(1)
    let maxProgressText = maxProgress.toLocaleString('en-US')
    let maxTimeInMilliseconds =
      progress == 0 ?
      0 :
      timeInMilliseconds * maxProgress / progress
    let maxTimeInSeconds = Math.round(maxTimeInMilliseconds / 1000)

    return `Progress: ${percentageText}% of ${maxProgressText} combinations<br>Time elapsed: ${this.GetFormattedTime(timeInSeconds)} of ${this.GetFormattedTime(maxTimeInSeconds)}`
  }
}




let g_form = new MainForm(new FormHandler())
