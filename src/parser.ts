import * as ts from "@typescript-eslint/typescript-estree"

export function parse(code: string) {
  return ts.parse(code)
}

const BASIC_TYPES = {
  TSStringKeyword: 'string',
  TSNumberKeyword: 'number',
  TSBooleanKeyword: 'boolean',
  TSNullKeyword: 'null',
  TSUndefinedKeyword: 'undefined',
  TSAnyKeyword: 'any',
  TSObjectKeyword: 'object',
  TSUnknownKeyword: 'unknown',
  TSSymbolKeyword: 'symbol',
}

function isBasicType(type: string): boolean {
  return !!BASIC_TYPES[type]
}

function transformBasicTypes(ast, transform: boolean) {
  if (!transform) return ast

  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'TSRuntime' },
    property: { type: 'Identifier', name: BASIC_TYPES[ast.type] },
    computed: false,
    optional: false
  }
}

export function transform(ast, transformAll: boolean = false) {
  switch (ast.type) {
    case 'Program':
      return transformProgram(ast, transformAll)
    case 'TSTypeAliasDeclaration':
      return transformTypeAlias(ast)
    case 'TSTypeLiteral':
      return transformTypeLiteral(ast, transformAll)
    case 'TSPropertySignature':
      return transformPropertySignature(ast, transformAll)
    case 'TSTypeAnnotation':
      return transformTypeAnnotation(ast, transformAll)
    default:
      if (isBasicType(ast.type))
        return transformBasicTypes(ast, transformAll)
      return ast
  }
}

function transformProgram(ast, transformAll: boolean) {
  const node = Object.assign({}, ast)
  node.body = ast.body.map(ast => transform(ast, transformAll))
  return node
}

function transformTypeAlias(ast) {
  return {
    type: 'VariableDeclaration',
    kind: 'const',
    declarations: [{ id: ast.id, init: transform(ast.typeAnnotation, true) }],
  }
}

function transformTypeLiteral(ast, transformAll: boolean) {
  if (!transformAll) return ast

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'TSRuntime' },
      property: { type: 'Identifier', name: 'Object' },
    },
    arguments: ast.members.map(ast => transform(ast, transformAll))
  }
}

function transformPropertySignature(ast, transformAll: boolean) {
  if (!transformAll) return ast

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
      transform(ast.typeAnnotation, transformAll),
    ],
    optional: false,
  }
}

function transformTypeAnnotation(ast, transformAll: boolean) {
  if (!transformAll) return ast

  return {
    type: 'MemberExpression',
    object: { type: 'Identifier', name: 'TSRuntime' },
    property: transform(ast.typeAnnotation, transformAll),
    computed: false,
    optional: false,
  }
}
