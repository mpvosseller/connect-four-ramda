const {
  add,
  complement,
  curry,
  gt,
  isNil,
  length,
  map,
  pipe,
  reduce,
  tap,
  test,
  zip,
  compose,
  __,
} = require('ramda')
const { result: Result } = require('folktale')

const labeledLog =
  (label) =>
  (...args) =>
    console.log(`${label}:`, ...args)
const tapLog = compose(tap, labeledLog)
const notNil = complement(isNil)
const isNumber = complement(isNaN)
const isOnlyDigits = test(/^\s*(\d+)\s*$/g)
const inRange = curry((range, x) => range.includes(x))
const addVectors = pipe(zip, map(reduce(add, 0)))
const gt0 = gt(__, 0)
const lengthGt0 = pipe(length, gt0)

const fromResult =
  (okKey = 'value', errKey = 'error') =>
  (result) =>
    result.matchWith({
      Ok: ({ value }) => ({ [okKey]: value }),
      Error: ({ value }) => ({ [errKey]: value }),
    })

const mapError = curry((fn, result) => result.mapError(fn))

const validate = curry((predicate, err, x) =>
  predicate(x) ? Result.Ok(x) : Result.Error(typeof err === 'function' ? err(x) : err)
)

module.exports = {
  tapLog,
  notNil,
  isNumber,
  isOnlyDigits,
  inRange,
  addVectors,
  gt0,
  lengthGt0,
  fromResult,
  mapError,
  validate,
}
