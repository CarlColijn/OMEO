/*
  Data sets.  Used to keep track of the data set of all objects (e.g. Item,
  ItemTable, Enchant etc.).  Just === compare anyone's set with one of the
  defined global main set types.

  Prerequisites:
  - none

  Defined classes:
  - DataSet
    - id: char

  Defined globals:
  - g_source: source DataSet
  - g_desired: desired DataSet
  - g_combined: combined DataSet
  - g_extra: extra inserted DataSet
*/


// ======== PUBLIC ========


class DataSet {
  // returns one of the predefined DataSet globals
  static GetRehydrated(set) {
    switch (set.id) {
      case 's': return g_source
      case 'd': return g_desired
      case 'c': return g_combined
      case 'e': return g_extra
    }

    return undefined
  }


  constructor(id) {
    // ==== PUBLIC ====
    this.id = id
  }
}


let g_source = new DataSet('s');
let g_desired = new DataSet('d');
let g_combined = new DataSet('c');
let g_extra = new DataSet('e');
