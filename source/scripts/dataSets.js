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
