export function any() {
  return (_: any) => true
}

export function object() {
  return (value: any) => isObject(value)
}
