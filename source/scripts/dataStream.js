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
