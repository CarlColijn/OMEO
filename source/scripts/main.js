// logs the given text
let g_logElemJQ = undefined
function Log(text) {
  if (true) {
    if (g_logElemJQ === undefined) {
      $('#divine').after('<br><textarea id="log" rows="15" cols="80"></textarea>')
      g_logElemJQ = $('#log')
    }
    g_logElemJQ.val(`${g_logElemJQ.val()}${text}\n`)
  }
}


// start the oracle
let g_oracle = new Oracle()

// start the form
let g_form = new Form()


// execute when the DOM is fully loaded
$(() => {
  // initialize the form
  g_form.Initialize(g_oracle)
})
