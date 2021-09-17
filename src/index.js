const { mergeAll } = require('ramda')
const { createGame, isGameOver, playMove, promptMessage, stringifyGame } = require('./game')
const { close, createLineReader, prompt } = require('./line-reader')
const { getOptions } = require('./options')

const print = console.log
const printState = (state) => print(stringifyGame(state.game, state.error))

const runGame = async (lineReader, options) => {
  let state = { game: createGame(options) }
  while (!isGameOver(state.game)) {
    printState(state)
    const move = await prompt(lineReader, promptMessage(state.game))
    state = mergeAll([state, { error: null }, playMove(state.game, move)])
  }
  printState(state)
}

const main = async (argv) => {
  const { options, error } = getOptions(argv)
  if (error) {
    print(error)
    return
  }
  const lineReader = createLineReader()
  await runGame(lineReader, options)
  close(lineReader)
}

main(process.argv)
