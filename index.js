function run(genFn) {
  const gen = genFn()
  
  const next = value => {
    const ret = gen.next(value)
    if (ret.done) return
    
    ret.value((err, val) => {
      if (err) return console.error(err)
      
      // Looop
      next(val)
    })
  }
  
  // First call
  next()
}
function echo(content) {
  return callback => {
    callback(null, content)
  }
}
run(function*() {
  const msg1 = yield echo('Hello')
  const msg2 = yield echo(`${msg1} World`)

  console.log(msg2) //=> Hello Wolrd
})