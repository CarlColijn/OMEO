/*
  Data stream serializer/deserializer.
  Used to load from/save to the #serialized element for data persistence.

  Prerequisites:
  - none

  Defined classes:
  - DataStream
*/

// all characters to use
let g_streamChars = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'

// bit storer
// for internal use only
class BitStorer {
  constructor() {
    this.serialized = ''
    this.storedBits = 0|0 // real uint32
    this.numBitsToStore = 6
  }

  // adds the given number of bits
  AddBits(bits, numBitsToGo) {
    // add all bits
    while (numBitsToGo > 0) {
      // look how many to do this round
      let batchNumBits = Math.min(numBitsToGo, this.numBitsToStore)

      // look how many remain after that
      let upcomingNumBits = numBitsToGo - batchNumBits

      // transfer the bits
      this.storedBits <<= batchNumBits
      let bitMask = (0x3f|0) >>> (6 - batchNumBits)
      this.storedBits |= (bits >>> upcomingNumBits) & bitMask

      // and move on
      numBitsToGo -= batchNumBits
      this.numBitsToStore -= batchNumBits
      if (this.numBitsToStore == 0) {
        // we've just finished another char -> finalize it
        this.serialized += g_streamChars[this.storedBits]

        // and start over
        this.storedBits = 0|0
        this.numBitsToStore = 6
      }
    }
  }

  // finalizes the storing
  Finalize() {
    // flush any remaining bits
    this.AddBits(0|0, this.numBitsToStore)

    // and return the serialized form
    return this.serialized
  }
}



// bit restorer
// for internal use only
class BitRestorer {
  // starts the restorer
  Start(serialized) {
    this.serialized = serialized
    this.nextCharNr = 0
    this.numBitsToRestore = 0
  }

  // loads the next char into the bit buffer
  LoadNextBits() {
    if (this.nextCharNr < this.serialized.length) {
      let nextChar = this.serialized[this.nextCharNr]
      ++this.nextCharNr
      let charNr = g_streamChars.indexOf(nextChar)
      this.restoredBits = charNr|0
    }
    else
      this.restoredBits = 0|0 // past end of stream... just play along
    this.numBitsToRestore = 6
  }

  // gets the given number of bits
  GetBits(numBitsToGo) {
    // add all bits
    let bits = 0|0
    while (numBitsToGo > 0) {
      // look if we have any bits left
      if (this.numBitsToRestore == 0)
        // no -> load in the next batch
        this.LoadNextBits()

      // look how many to do this round
      let batchNumBits = Math.min(numBitsToGo, this.numBitsToRestore)

      // look how many remain after that
      let upcomingNumBits = this.numBitsToRestore - batchNumBits

      // transfer the bits
      bits <<= batchNumBits
      let bitMask = (0x3f|0) >>> (6 - batchNumBits)
      bits |= (this.restoredBits >>> upcomingNumBits) & bitMask

      // and move on
      numBitsToGo -= batchNumBits
      this.numBitsToRestore -= batchNumBits
    }

    // and return the extracted bits
    return bits
  }
}



// single data stream
class DataStream {
  constructor(storeMode) {
    // start our little helpers
    if (storeMode)
      this.storer = new BitStorer()
    else
      this.restorer = new BitRestorer()
  }


  // adds a value to the stream
  AddSizedInt(intValue, numBits) {
    this.storer.AddBits(intValue, numBits)
  }


  // adds a value to the stream
  AddCount(intValue) {
    let numBits = intValue.toString(2).length
    this.AddSizedInt(numBits, 5)
    this.AddSizedInt(intValue, numBits)
  }


  // gets a value from the stream
  GetSizedInt(numBits) {
    return this.restorer.GetBits(numBits)
  }


  // gets a value from the stream
  GetCount() {
    let numBits = this.GetSizedInt(5)
    return this.GetSizedInt(numBits)
  }


  // loads the data stream
  // returns whether any data was there
  Load() {
    // get the serialized data to load from both places
    let serializedLS = localStorage.getItem('form') || ''
    let urlDataMatches = RegExp('[?&]form=([^&#]*)').exec(location.search)
    let serializedURL = urlDataMatches ? urlDataMatches[1] : ''

    // look which one to use
    let serialized = ''
    if (serializedURL.length == 0 && serializedLS.length > 0)
      // localStorage
      serialized = serializedLS
    else if (serializedURL.length > 0 && serializedLS.length == 0)
      // url
      serialized = serializedURL
    else if (serializedURL.length > 0 && serializedLS.length > 0) {
      if (serializedURL == serializedLS)
        // either (they're the same)
        serialized = serializedURL
      else {
        // conflict -> ask
        let useLS = confirm('You\'re attempting to restore the data from a bookmark.  This will PERMANENTLY overwrite your stored data.  If you want to keep your stored data, please bookmark your data first.\n\nDo you want to ignore the bookmark and use your stored data for now?')
        serialized = useLS ? serializedLS : serializedURL
        if (useLS)
          // he chose for LS -> get rid of the bookmark part keeping the old link
          // with the bookmark in the history
          location.href = location.href.replace(location.search, '')
      }
    }

    // look if we got data
    let gotData = serialized.length > 0
    if (gotData)
      // yes -> load it
      this.restorer.Start(serialized)

    // and return if we loaded anything
    return gotData
  }


  // saves the data stream
  Save(toURL) {
    // get the serialized data to save
    let serialized = this.storer.Finalize()

    // and save it
    if (toURL) {
      let addressBase = location.href.replace(location.search, '')
      let bookmarkLink = `${addressBase}?form=${serialized}`
      let bookmarkElemJQ = $('#bookmark')
      bookmarkElemJQ.show()
      let bookmarkLinkElemJQ = bookmarkElemJQ.find('a')
      bookmarkLinkElemJQ.attr('href', bookmarkLink)
    }
    else
      localStorage.setItem('form', serialized)
  }
}
