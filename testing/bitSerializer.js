jazil.AddTestSet(mainPage, 'BitSerializer', {
  'Store full byte': (jazil) => {
    let storer = new BitStorer
    storer.AddBits(255, 8)
    jazil.ShouldBe(storer.Finalize(), '-V')
  },
  'Restore full byte': (jazil) => {
    let restorer = new BitRestorer('-V')
    jazil.ShouldBe(restorer.GetBits(8), 255)
  },

  'Store 11 bits': (jazil) => {
    let storer = new BitStorer
    storer.AddBits(1840, 11)
    jazil.ShouldBe(storer.Finalize(), '4F')
  },
  'Restore 11 bits': (jazil) => {
    let restorer = new BitRestorer('4F')
    jazil.ShouldBe(restorer.GetBits(11), 1840)
  },

  'Store 80 bytes': (jazil) => {
    let storer = new BitStorer
    for (let byteNr = 0; byteNr < 80; ++byteNr)
      storer.AddBits(byteNr, 8)
    jazil.ShouldBe(storer.Finalize(), '__db_VpeaFBhbpNkc_ZncW_qdGlteqxwfaJzfWVCgG7FhrhIibtLiXFOjHRRkr3UlcdXlYp0mIB3nsN6ocZ9oZaapJmdqtygrdKjrZWmsJ7')
  },
  'Restore 80 bytes': (jazil) => {
    let restorer = new BitRestorer('__db_VpeaFBhbpNkc_ZncW_qdGlteqxwfaJzfWVCgG7FhrhIibtLiXFOjHRRkr3UlcdXlYp0mIB3nsN6ocZ9oZaapJmdqtygrdKjrZWmsJ7')
    for (let byteNr = 0; byteNr < 80; ++byteNr)
      jazil.ShouldBe(restorer.GetBits(8), byteNr)
  },

  'Store flipping bit blocks': (jazil) => {
    let storer = new BitStorer
    for (let bitNr = 0; bitNr < 25; ++bitNr)
      storer.AddBits(bitNr % 2 == 0 ? 0 : 1, 1)
    jazil.ShouldBe(storer.Finalize(), 'uuuu_')
  },

  'Store 100 zero bits': (jazil) => {
    let storer = new BitStorer
    storer.AddBits(0, 100)
    jazil.ShouldBe(storer.Finalize(), '_________________')
  },
  'Restore 100 zero bits': (jazil) => {
    let restorer = new BitRestorer('_________________')
    for (let bitNr = 0; bitNr < 100; ++bitNr)
      jazil.ShouldBe(restorer.GetBits(1), 0)
  },

  'Store 100 one bits': (jazil) => {
    let storer = new BitStorer
    for (let bitNr = 0; bitNr < 100; ++bitNr)
      storer.AddBits(1, 1)
    jazil.ShouldBe(storer.Finalize(), '----------------7')
  },
  'Restore 100 one bits': (jazil) => {
    let restorer = new BitRestorer('----------------7')
    for (let bitNr = 0; bitNr < 100; ++bitNr)
      jazil.ShouldBe(restorer.GetBits(1), 1)
  },

  'Store nothing': (jazil) => {
    let storer = new BitStorer
    jazil.ShouldBe(storer.Finalize(), '_')
  },
  'Restore nothing': (jazil) => {
    let restorer = new BitRestorer('')
    jazil.ShouldBe(restorer.GetBits(44), 0)
  },

  'Restore buffer overflow': (jazil) => {
    let restorer = new BitRestorer('4F')
    jazil.ShouldBe(restorer.GetBits(11 + 3), 1840 * 2 * 2 * 2)
  },

  'Restore within buffer': (jazil) => {
    let restorer = new BitRestorer('4F')
    restorer.GetBits(12)
    jazil.Assert(!restorer.overflow, 'state is overflowed!')
  },

  'Restore past buffer': (jazil) => {
    let restorer = new BitRestorer('4F')
    restorer.GetBits(12)
    jazil.ShouldBe(restorer.GetBits(3), 0)
    jazil.Assert(restorer.overflow, 'state is not overflowed!')
  },

  'Restore from legal input': (jazil) => {
    let restorer = new BitRestorer('abc')
    restorer.GetBits(18)
    jazil.Assert(restorer.valid, 'state is invalid!')
  },

  'Restore from illegal input': (jazil) => {
    let restorer = new BitRestorer('a?b')
    jazil.ShouldBe(restorer.GetBits(18), 4098)
    jazil.Assert(!restorer.valid, 'state is still valid!')
  },

  'Store/restore 20 random 10-bit values': (jazil) => {
    for (let tryNr = 0; tryNr < 20; ++tryNr) {
      let storer = new BitStorer
      let value = Math.floor(Math.random() * 1024)
      storer.AddBits(value, 10)
      let restorer = new BitRestorer(storer.Finalize())
      jazil.ShouldBe(restorer.GetBits(10), value)
    }
  },
})
