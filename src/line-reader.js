const readline = require('readline')

const createLineReader = () =>
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
const close = (lr) => lr.close()
const prompt = (lr, msg) => new Promise((resolve) => lr.question(msg, resolve))

module.exports = {
  createLineReader,
  close,
  prompt,
}
