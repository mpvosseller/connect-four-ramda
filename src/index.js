const { mergeAll, curry, pipe, map } = require('ramda')
const rxjs = require('rxjs')
const { createGame, isGameOver, playMove, promptMessage, stringifyGame } = require('./game')
const { close, createLineReader, prompt$ } = require('./line-reader')
const { getOptions } = require('./options')
const { mapError } = require('./util')

const print = console.log
const printState = (state) => print(stringifyGame(state.game, state.error))
const initialState = (options) => ({ game: createGame(options) })
const mergeStates = (lastState, moveState) => mergeAll([lastState, { error: null }, moveState])

const nextStateFromUser$ = (lineReader, state) =>
  prompt$(lineReader, promptMessage(state.game)).pipe(
    rxjs.map((move) => playMove(state.game, move)),
    rxjs.map((moveState) => mergeStates(state, moveState))
  )

const nextState$ = curry((lineReader, state) =>
  isGameOver(state.game) ? rxjs.EMPTY : nextStateFromUser$(lineReader, state)
)

const game$ = (options) => {
  const lineReader = createLineReader()
  return rxjs.of(initialState(options)).pipe(
    rxjs.expand(nextState$(lineReader)),
    rxjs.tap(printState),
    rxjs.takeLast(),
    rxjs.finalize(() => {
      close(lineReader)
    })
  )
}

const main = pipe(
  getOptions,
  map((options) => game$(options).subscribe()),
  mapError(console.log)
)

main(process.argv)
