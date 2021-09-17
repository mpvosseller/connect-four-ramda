const { result: Result } = require('folktale')
const {
  apply,
  always,
  chain,
  compose,
  curry,
  filter,
  fromPairs,
  map,
  match,
  pipe,
  split,
  tail,
  traverse,
} = require('ramda')
const { fromResult, gt0, isNumber, isOnlyDigits, lengthGt0, mapError, validate } = require('./util')

const optionError = (option) => (e) => `--${option}: ${e}`
const mapOptionError = compose(mapError, optionError)

const parseWordsOption = (option) =>
  pipe(
    Result.of,
    map(split(' ')),
    map(filter(lengthGt0)),
    chain(validate(lengthGt0, `must have one or more values`)),
    mapOptionError(option)
  )

const parseIntOption = (option) =>
  pipe(
    Result.of,
    chain(validate(isOnlyDigits, `must be a positive integer`)),
    map(parseInt),
    chain(validate(isNumber, `must be a positive integer`)),
    chain(validate(gt0, `must be a positive integer`)),
    mapOptionError(option)
  )

const parseUnknownOption = (option) =>
  pipe(always(Result.Error('unsupported option')), mapOptionError(option))

const getParser = (parsers, option) => parsers[option] || parseUnknownOption(option)

const parseOption = curry((parsers, [option, value]) => [
  option,
  apply(getParser(parsers, option), [value]),
])

const bubbleParseResult = ([option, valueResult]) =>
  valueResult.matchWith({
    Ok: ({ value }) => Result.Ok([option, value]),
    Error: ({ value: error }) => Result.Error(error),
  })

const optionValuePair = pipe(match(/^--(\w+)=?(.*)$/), tail)

const optionParsers = {
  players: parseWordsOption('players'),
  width: parseIntOption('width'),
  height: parseIntOption('height'),
  k: parseIntOption('k'),
}

const getOptions = pipe(
  map(optionValuePair),
  filter(lengthGt0),
  map(parseOption(optionParsers)),
  traverse(Result.of, bubbleParseResult),
  map(fromPairs),
  fromResult('options')
)

module.exports = {
  getOptions,
}
