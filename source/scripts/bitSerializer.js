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
