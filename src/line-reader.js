const readline = require('readline')
const rxjs = require('rxjs')

const createLineReader = () =>
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
const close = (lr) => lr.close()
const prompt = (lr, msg) => new Promise((resolve) => lr.question(msg, resolve))

const prompt$ = (lr, msg) => rxjs.from(prompt(lr, msg))

module.exports = {
  createLineReader,
  close,
  prompt,
  prompt$,
}
