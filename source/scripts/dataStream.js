/*
  Data stream serializer/deserializer.
  Used to load from/save to the #serialized element for data persistence.

  Prerequisites:
  - none

  Defined classes:
  - DataStream
*/
class DataStream {
  constructor() {
    // start our stream
    this.stream = []

    // and ref our backing form element
    this.streamElemJQ = $('#serialized')
  }


  // adds an item to the stream
  Add(dataToAdd) {
    this.stream.push(dataToAdd)
  }


  // gets an item from the stream
  Get() {
    return this.stream.shift()
  }


  // loads the data stream
  Load() {
    // get and normalize the data to restore
    this.stream = this.streamElemJQ.val().split('|')
    for (let partNr = 0; partNr < this.stream.length; ++partNr)
      this.stream[partNr] = this.stream[partNr].trim()
  }


  // saves the data stream
  Save() {
    // and store the complete data set
    this.streamElemJQ.val(this.stream.join('|'))
  }
}
