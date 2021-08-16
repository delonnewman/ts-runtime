type SimpleTypePredicate = (value: any) => boolean
type GenericTypePredicate = (extType: TypePredicate) => TypePredicate
type TypePredicate =
  | SimpleTypePredicate
  | GenericTypePredicate

interface MetaType<T> {
  getName(): string
  getPredicate(): TypePredicate
  generate(...args): T
  satisfies(value: any, other?: any): boolean
}


class SimpleMetaType<T> implements MetaType<T> {
  private name: string
  private predicate: SimpleTypePredicate
  private generator: () => T

  constructor(name: string, predicate: SimpleTypePredicate, generator: () => T) {
    this.name = name
    this.predicate = predicate
    this.generator = generator
  }

  generate(): T {
    return this.generator()
  }

  satisfies(value: any): boolean {
    return this.predicate(value)
  }

  getName(): string {
    return this.name
  }

  getPredicate(): SimpleTypePredicate {
    return this.predicate
  }
}

class GenericMetaType<T> implements MetaType<T> {
  private name: string
  private predicate: GenericTypePredicate
  private generator: (extGen: () => any) => T

  constructor(name: string, predicate: GenericTypePredicate, generator: () => T) {
    this.name = name
    this.predicate = predicate
    this.generator = generator
  }

  generate(extGen: () => any): T {
    return this.generator(extGen)
  }

  satisfies(value: any, extType: MetaType<any>): boolean {
    // TODO: will have to unravel the predicate
    if (extType instanceof SimpleMetaType)
      return this.predicate(extType.getPredicate())(value)
  }

  getName(): string {
    return this.name
  }

  getPredicate(): GenericTypePredicate {
    return this.predicate
  }
}

const objectTypePredicate = (type: string): SimpleTypePredicate => (
  (value: any) => Object.prototype.toString.call(value) === `[object ${type}]`
)

const genericTypePredicate = (baseType: SimpleTypePredicate, f: (value: any, extType: TypePredicate) => boolean): GenericTypePredicate =>
  (extType: TypePredicate): TypePredicate => (value: any) => baseType(value) && f(value, extType)

function objectType<T>(type: string, generator: () => T): SimpleMetaType<T> {
  return new SimpleMetaType<T>(type.toLowerCase(), objectTypePredicate(type), generator)
}

const AnyType = new SimpleMetaType<any>('any', (_: any) => true, () => 1)
const ObjectType = objectType('Object', () => ({}))
const NumberType = objectType('Number', () => 1)
const StringType = objectType('String', () => "")
const BooleanType = objectType('Boolean', () => true)
const NullType = new SimpleMetaType<null>('null', (value: any) => value === null, () => null)
const UndefinedType = new SimpleMetaType<undefined>('undefined', (value: any) => value === void 0, () => undefined)

const isArray = objectTypePredicate('Array')

const genericArray: GenericTypePredicate = genericTypePredicate(isArray, (array, extType) =>
  array.reduce((res: boolean, val: any) => res && extType(val), true))

const ArrayType = new GenericMetaType<Array<any>>('Array<T>', genericArray, () => [])

const isFunction = objectTypePredicate('Function')

const genericFunction: GenericTypePredicate = genericTypePredicate(isFunction, (f, extType) => true)

const tsr = {
  any: AnyType,
  object: ObjectType,
  number: NumberType,
  string: StringType,
  boolean: BooleanType,
  null: NullType,
  undefined: UndefinedType,
  Array: ArrayType,
}

export default tsr
