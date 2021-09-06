import * as tsr from "./parser"

test('it takes a type ast node an converts it to an equivalent meta object', () => {
  const ast = tsr.transform(tsr.parse('type Person = { name: string, age: number }'))
  expect(ast.type).toBe('Program')
  expect(ast.body[0].type).toBe('VariableDeclaration')
  expect(ast.body[0].kind).toBe('const')
  expect(ast.body[0]).toHaveProperty('declarations')
  expect(ast.body[0].declarations[0].id.name).toBe('Person')
  expect(ast.body[0].declarations[0].init.type).toBe('CallExpression')
  expect(ast.body[0].declarations[0].init.callee.type).toBe('MemberExpression')
  expect(ast.body[0].declarations[0].init.callee.object.name).toBe('TSRuntime')
  expect(ast.body[0].declarations[0].init.callee.property.name).toBe('Object')
  expect(ast.body[0].declarations[0].init.arguments[0].type).toBe('CallExpression')
  expect(ast.body[0].declarations[0].init.arguments[0].callee.type).toBe('MemberExpression')
})
