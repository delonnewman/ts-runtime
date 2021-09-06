import * as ts from "@typescript-eslint/typescript-estree"

export function parse(code: string) {
  return ts.parse(code)
}


export function transform(ast) {
  switch (ast.type) {
    case 'Program':
      return transformProgram(ast)
    case 'TSTypeAliasDeclaration':
      return transformTypeAlias(ast)
    case 'TSTypeLiteral':
      return transformTypeLiteral(ast)
    case 'TSPropertySignature':
      return transformPropertySignature(ast)
    case 'TSTypeAnnotation':
      return transformTypeAnnotation(ast)
    case 'TSStringKeyword':
      return 'string'
    case 'TSNumberKeyword':
      return 'number'
    default:
      throw new Error(`Unknown ast type: ${ast.type}`)
  }
}

function transformProgram(ast) {
  const node = Object.assign({}, ast)
  node.body = ast.body.map(transform)
  return node
}

function transformTypeAlias(ast) {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{ id: ast.id, init: transform(ast.typeAnnotation) }],
  }
}

function transformTypeLiteral(ast) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'TSRuntime' },
      property: { type: 'Identifier', name: 'Object' },
    },
    arguments: ast.members.map(transform)
  }
}

function transformPropertySignature(ast) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'TSRuntime' },
      property: { type: 'Identifier', name: 'ObjectProperty' },
      compututed: false,
      optional: false,
    },
    arguments: [
      { type: 'Literal', value: ast.key.name, raw: JSON.stringify(ast.key.name) },
      transform(ast.typeAnnotation),
    ],
    optional: false,
  }
}

function transformTypeAnnotation(ast) {
  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'TSRuntime' },
    property: transform(ast.typeAnnotation),
    computed: false,
    optional: false,
  }
}
