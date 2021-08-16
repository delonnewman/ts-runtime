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

test("array will return true if the value is an array and it's elements match the extention type", () => {
  let array = tsr.Array
  expect(array.satisfies(tsr.any, [1, "2", 3])).toBe(true)
  expect(array.satisfies(tsr.number, [1, "2", 3])).toBe(false)
  expect(array.satisfies(tsr.number, [1, 2, 3])).toBe(true)
})
