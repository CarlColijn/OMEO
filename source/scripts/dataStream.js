/*
  Data stream serializer/deserializer.
  Used to load from/save to the #serialized element for data persistence.

  Prerequisites:
  - bitSerializer.js

  Defined classes:
  - DataStreamConflictSolver
  - DataStream
*/


// ======== PUBLIC ========


class DataStreamConflictSolver {
  constructor() {
  }


  // returns bool
  MustUseLocalStorageFromUser() {
    return confirm('You\'re attempting to restore the data from a bookmark.  This will PERMANENTLY overwrite your stored data.  If you want to keep your stored data, please bookmark your data first.\n\nDo you want to ignore the bookmark and use your stored data for now?')
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
    this.AddSizedInt(numBits, 5)
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


  // returns bool (whether any data was there)
  Load(conflictSolver) {
    let serializedOptions = this.GetSerializedDataToLoad()
    let serialized = this.SelectSerializedOptionToUse(serializedOptions, conflictSolver)

    let gotData = serialized.length > 0
    if (gotData)
      this.restorer = new BitRestorer(serialized)

    return gotData
  }


  SaveToURL() {
    let serialized = this.storer.Finalize()

    let addressBase = location.href.replace(location.search, '')
    let bookmarkLink = `${addressBase}?form=${serialized}`
    let bookmarkElemJQ = $('#bookmark')
    bookmarkElemJQ.show()
    let bookmarkLinkElemJQ = bookmarkElemJQ.find('a')
    bookmarkLinkElemJQ.attr('href', bookmarkLink)
  }


  SaveToLocalStorage() {
    let serialized = this.storer.Finalize()
    localStorage.setItem('form', serialized)
  }


  // ======== PRIVATE ========


  // returns object;
  // - withLocalStorage: bool
  // - localStorage: string
  // - withURL: bool
  // - url: string
  GetSerializedDataToLoad() {
    let serializedLocalStorage = localStorage.getItem('form') || ''
    let urlDataMatches = RegExp('[?&]form=([^&#]*)').exec(location.search)
    let serializedURL = urlDataMatches ? urlDataMatches[1] : ''

    return {
      withLocalStorage: serializedLocalStorage.length > 0,
      localStorage: serializedLocalStorage,
      withURL: serializedURL.length > 0,
      url: serializedURL
    }
  }


  // returns string
  SelectSerializedOptionToUse(serializedOptions, conflictSolver) {
    if (!serializedOptions.withURL && !serializedOptions.withLocalStorage)
      return ''
    if (!serializedOptions.withURL && serializedOptions.withLocalStorage)
      return serializedOptions.localStorage
    else if (serializedOptions.withURL && !serializedOptions.withLocalStorage)
      return serializedOptions.url
    else if (serializedOptions.url == serializedOptions.localStorage)
      return serializedOptions.url
    else {
      let useLocalStorage = conflictSolver.MustUseLocalStorageFromUser()
      if (useLocalStorage)
        // he chose for localStorage, so get rid of the bookmark part keeping
        // the old link with the bookmark in the history
        window.history.replaceState(null, '', location.href.replace(location.search, ''))
      return (
        useLocalStorage ?
        serializedOptions.localStorage :
        serializedOptions.url
      )
    }
  }
}
