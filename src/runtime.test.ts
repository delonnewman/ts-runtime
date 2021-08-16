import * as tsr from "./runtime"

test('any will always return true', () => {
  expect(tsr.any()(1)).toBe(true)
})

test('object will return true if the value is an object', () => {
  let isObj = tsr.object()
  expect(isObj(1)).toBe(false)
  expect(isObj("")).toBe(false)
  expect(isObj([])).toBe(true)
  expect(isObj({})).toBe(true)
  expect(isObj(function() { })).toBe(true)
  expect(isObj(new String(""))).toBe(true)
})
