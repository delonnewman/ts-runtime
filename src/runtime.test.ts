import tsr from "./runtime"

test('any will always return true', () => {
  expect(tsr.any.satisfies(tsr.any.generate())).toBe(true)
})

test('object will return true if the value is an object', () => {
  const failing = [
    { value: 1, result: false },
    { value: "", result: false },
    { value: [], result: false },
    { value: function() { }, result: false },
    { value: new String(""), result: false }
  ]

  let obj = tsr.object
  failing.forEach((example) => {
    expect(obj.satisfies(example.value)).toBe(example.result)
  })
  expect(obj.satisfies(obj.generate())).toBe(true)
})

test('number will return true if the value is a number', () => {
  let num = tsr.number

  expect(num.satisfies(num.generate())).toBe(true)
  expect(num.satisfies("")).toBe(false)
})

test('string will return true if the value is a string', () => {
  let str = tsr.string
  expect(str.satisfies(1)).toBe(false)
  expect(str.satisfies(str.generate())).toBe(true)
})

test('boolean will return true if the value is true or false', () => {
  let bool = tsr.boolean
  expect(bool.satisfies(bool.generate())).toBe(true)
  expect(bool.satisfies(2)).toBe(false)
})

test('Symbol will return true if the value is a symbol', () => {
  let sym = tsr.Symbol
  expect(sym.satisfies(sym.generate())).toBe(true)
  expect(sym.satisfies(3)).toBe(false)
})

test('null will return true if the value is null', () => {
  let nullType = tsr.null
  expect(nullType.satisfies(null)).toBe(true)
  expect(nullType.satisfies(undefined)).toBe(false)
  expect(nullType.satisfies(1)).toBe(false)
})

test('undefined will return true if the value is null', () => {
  let undef = tsr.undefined
  expect(undef.satisfies(null)).toBe(false)
  expect(undef.satisfies(undefined)).toBe(true)
  expect(undef.satisfies(1)).toBe(false)
})

test("Array will return true if the value is an array and it's elements match the extention type", () => {
  let arrayAny = tsr.Array(tsr.any)
  let arrayNum = tsr.Array(tsr.number)
  expect(arrayAny.satisfies([1, "2", 3])).toBe(true)
  expect(arrayNum.satisfies([1, "2", 3])).toBe(false)
  expect(arrayNum.satisfies([1, 2, 3])).toBe(true)
})

test("Tuple will return true if the value is a tuple and it's elements match the extention types", () => {
  let tuple = tsr.Tuple(tsr.string, tsr.number)
  expect(tuple.satisfies(["Peter", 23])).toBe(true)
  expect(tuple.satisfies([true, 47])).toBe(false)
  expect(tuple.satisfies(23)).toBe(false)
})

test("Function will return true if the value is a function and it's arity matches the number of it's argument types", () => {
  let fn = tsr.FunctionExpression(tsr.Arguments(tsr.string), tsr.string)
  expect(fn.satisfies(function(name) { return name }))
  expect(fn.satisfies(function() { })).toBe(false)
  expect(fn.satisfies(34)).toBe(false)
})

test("Union will return true if the value matches any of it's types", () => {
  let or = tsr.Union
  let strOrNum = or(tsr.string, tsr.number)
  expect(strOrNum.satisfies(1)).toBe(true)
  expect(strOrNum.satisfies("1")).toBe(true)
  expect(strOrNum.satisfies([1])).toBe(false)
  expect(strOrNum.satisfies(false)).toBe(false)
})

test("Literal will return true if the value is identical to it's type", () => {
  expect(tsr.Literal("hello").satisfies("hello")).toBe(true)
  expect(tsr.Literal("hello").satisfies(1)).toBe(false)
  expect(tsr.Literal("hello").satisfies("world")).toBe(false)
})
