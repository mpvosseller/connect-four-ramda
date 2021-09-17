const { result: Result } = require('folktale')
const {
  add,
  all,
  always,
  and,
  any,
  append,
  chain,
  complement,
  curry,
  defaultTo,
  either,
  equals,
  evolve,
  filter,
  findLast,
  gte,
  ifElse,
  inc,
  isNil,
  join,
  last,
  map,
  mathMod,
  multiply,
  not,
  nth,
  pair,
  pipe,
  prop,
  range,
  reduce,
  splitEvery,
  update,
  values,
  __,
} = require('ramda')

const {
  addVectors,
  fromResult,
  inRange,
  isNumber,
  isOnlyDigits,
  notNil,
  validate,
} = require('./util')

const createGame = ({ players = ['⚫', '🔴'], width = 7, height = 6, k = 4 } = {}) => ({
  players,
  size: {
    width,
    height,
  },
  k,
  moves: [],
  grid: Array(width * height),
})

const position = pair
const nextPosition = addVectors
const turn = (game) => nth(mathMod(game.moves.length, game.players.length), game.players)
const lastMove = (game) => last(game.moves)
const colRange = (game) => range(0, game.size.width)
const rowRange = (game) => range(0, game.size.height)
const colInRange = (game, pos) => inRange(colRange(game), pos[0])
const rowInRange = (game, pos) => inRange(rowRange(game), pos[1])
const posInRange = (game, pos) => and(colInRange(game, pos), rowInRange(game, pos))
const gridIndex = (game, pos) =>
  posInRange(game, pos) ? add(pos[0], multiply(pos[1], game.size.width)) : -1
const cell = (game, pos) => game.grid[gridIndex(game, pos)]
const lastMoveCell = (game) => cell(game, lastMove(game))
const isCellOpen = (game, pos) => isNil(cell(game, pos))
const isColOpen = curry((game, col) => isCellOpen(game, position(col, 0)))
const isColFilled = complement(isColOpen)
const isBoardFilled = (game) => all(isColFilled(game), colRange(game))
const lastOpenRowInCol = (game, col) =>
  findLast((row) => isCellOpen(game, position(col, row)), rowRange(game))
const lastOpenPosInCol = curry((game, col) => position(col, lastOpenRowInCol(game, col)))
const evolveGame = curry((game, pos) =>
  evolve(
    {
      moves: append(pos),
      grid: update(gridIndex(game, pos), turn(game)),
    },
    game
  )
)

//
// win detection
//
const Direction = {
  Up: [0, -1],
  UpRight: [1, -1],
  Right: [1, 0],
  DownRight: [1, 1],
  Down: [0, 1],
  DownLeft: [-1, 1],
  Left: [-1, 0],
  UpLeft: [-1, -1],
}

const Orientation = {
  Vertical: [Direction.Up, Direction.Down],
  Horitontal: [Direction.Right, Direction.Left],
  DiagnolUpRight: [Direction.DownLeft, Direction.UpRight],
  DiagnolDownRight: [Direction.UpLeft, Direction.DownRight],
}

const streakInDirection = curry((game, pos, dir, value, acc = 0) =>
  not(equals(cell(game, pos), value))
    ? acc
    : streakInDirection(game, nextPosition(pos, dir), dir, value, inc(acc))
)

const streakInOrientation = (game, pos, orientation) =>
  pipe(
    map(streakInDirection(game, pos, __, cell(game, pos))),
    reduce(add, 1 - orientation.length) // only count the original position once
  )(orientation)

const isWinnerInOrientation = curry((game, pos, orientation) =>
  gte(streakInOrientation(game, pos, orientation), game.k)
)

const isWinner = (game, pos) => any(isWinnerInOrientation(game, pos), values(Orientation))

const isLastMoveWinner = (game) => game.moves.length > 0 && isWinner(game, lastMove(game))

const isGameOver = either(isLastMoveWinner, isBoardFilled)

//
// game play
//
const promptMessage = (game) => `Enter column to drop ${turn(game)}>`

const playMove = (game, col) =>
  pipe(
    Result.of,
    chain(validate(isOnlyDigits, (x) => `invalid number: ${x}`)),
    map(parseInt),
    chain(validate(isNumber, (x) => `invalid number: ${x}`)),
    chain(validate(inRange(colRange(game)), (x) => `invalid column: ${x}`)),
    chain(validate(isColOpen(game), (x) => `column not open: ${x}`)),
    map(lastOpenPosInCol(game)),
    map(evolveGame(game)),
    fromResult('game')
  )(col)

//
// game formatting
//
const displayChar = defaultTo('⬜')
const splitRows = (game) => splitEvery(game.size.width)
const joinAsString = join('')
const colLabel = (game) => join(' ', colRange(game))
const joinAsLines = join('\n')

const stringifyBoard = (game) =>
  pipe(
    prop('grid'),
    map(displayChar),
    splitRows(game),
    map(joinAsString),
    append(colLabel(game)),
    joinAsLines
  )(game)

const stringifyWinner = (game) =>
  isLastMoveWinner(game) ? `WINNER: ${lastMoveCell(game)}` : 'DRAW'

const stringifyResult = ifElse(isGameOver, stringifyWinner, always(undefined))

const stringifyGame = (game, error) =>
  pipe(
    append(stringifyBoard(game)),
    append(error),
    append(stringifyResult(game)),
    filter(notNil),
    joinAsLines
  )([])

module.exports = {
  playMove,
  createGame,
  isGameOver,
  promptMessage,
  stringifyGame,
}
