import * as ts from "@typescript-eslint/typescript-estree"

export function parse(code: string) {
  return ts.parse(code)
}
