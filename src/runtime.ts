type SimpleTypePredicate = (value: any) => boolean
type GenericTypePredicate = (value: any, ...extTypes: Array<MetaType<any>>) => boolean
type TypePredicate =
  | SimpleTypePredicate
  | GenericTypePredicate

type Generator<T> = (...args: any[]) => T

interface MetaType<T> {
  readonly name: string
  readonly predicate: TypePredicate
  generate(...args: any[]): T
  satisfies(value: any): boolean
}

class BasicMetaType<T> implements MetaType<T> {
  readonly name: string
  readonly predicate: TypePredicate
  protected generator: Generator<T>

  constructor(name: string, predicate: SimpleTypePredicate, generator: Generator<T>) {
    this.name = name
    this.predicate = predicate
    this.generator = generator
  }

  generate(...args: any[]): T {
    return this.generator(...args)
  }

  satisfies(value: any): boolean {
    return this.predicate(value)
  }
}

class SimpleMetaType<T> extends BasicMetaType<T> implements MetaType<T> {
  readonly predicate: SimpleTypePredicate
}

class GenericMetaType extends BasicMetaType<any> implements MetaType<any> {
  readonly predicate: GenericTypePredicate
  private base: SimpleTypePredicate
  private extTypes: Array<MetaType<any>>

  constructor(name: string, predicate: GenericTypePredicate, generator: Generator<any>, base: SimpleTypePredicate, extTypes: Array<MetaType<any>>) {
    super(name, predicate, generator)
    this.base = base
    this.extTypes = extTypes
  }

  generate(extGen: Generator<any>): any {
    return this.generator(extGen)
  }

  satisfies(value: any): boolean {
    return this.base(value) && this.predicate(value, ...this.extTypes)
  }

  extentionTypes(): Array<MetaType<any>> {
    return this.extTypes
  }
}

const objectTypePredicate = (type: string): SimpleTypePredicate => (
  (value: any) => Object.prototype.toString.call(value) === `[object ${type}]`
)

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

const genericType = (name: string, base: SimpleTypePredicate, predicate: GenericTypePredicate, generator: Generator<any>) =>
  (...extTypes: Array<MetaType<any>>) =>
    new GenericMetaType(`${name}<${extTypes.map((t) => t.name).join(', ')}>`, predicate, generator, base, extTypes)

const genericArray: GenericTypePredicate = (array: Array<any>, extType: SimpleMetaType<any>) =>
  array.reduce((res: boolean, val: any) => res && extType.satisfies(val), true)

const ArrayType = genericType('Array', isArray, genericArray, () => [])

class TupleMetaType extends GenericMetaType implements MetaType<any> {
  readonly length: number

  constructor(name: string | null, extTypes: Array<MetaType<any>>) {
    name = name || `[${extTypes.map((t) => t.name).join(', ')}]`
    const generator = () => extTypes.map((t) => t.generate())

    const predicate = (array: any[]) => {
      let res = true
      for (let i = 0; i < array.length; i++) {
        res = extTypes[i].satisfies(array[i])
        if (res == false) return res
      }
      return res
    }

    super(name, isArray, generator, predicate, extTypes)

    this.length = extTypes.length
  }
}

const genericTupleType = (name: string = null) =>
  (...extTypes: Array<MetaType<any>>) =>
    new TupleMetaType(name, extTypes)

const TupleType = genericTupleType()

const ArgumentsType = (...extTypes: Array<MetaType<any>>) =>
  new TupleMetaType(extTypes.map((t) => t.name).join(', '), extTypes)

const isFunction = objectTypePredicate('Function')

class FunctionMetaType extends GenericMetaType implements MetaType<any> {
  protected generator: null
  private anonymous: boolean

  constructor(name: string | null, argumentType: TupleMetaType, returnType: MetaType<any>) {
    const predicate = (f: Function) => {
      return f.length === argumentType.length
    }

    name = name || `(${argumentType.name}) => ${returnType.name}`

    super(name, isFunction, null, predicate, [argumentType, returnType])

    this.anonymous = name == null
  }

  isAnonymous(): boolean {
    return this.anonymous
  }

  generate(): Function {
    return () => null
  }
}

const functionType = (name: string = null) =>
  (argumentsType: TupleMetaType, returnType: MetaType<any>) =>
    new FunctionMetaType(name, argumentsType, returnType)

const FunctionExpressionType = functionType()

class UnionMetaType extends GenericMetaType implements MetaType<any> {
  constructor(typeA: MetaType<any>, typeB: MetaType<any>) {
    let predicate = (value: any) => typeA.satisfies(value) || typeB.satisfies(value)
    let generator = () => typeA.generate()
    super(`${typeA.name} | ${typeB.name}`, AnyType.predicate, generator, predicate, [typeA, typeB])
  }
}

const unionType = (...types: Array<MetaType<any>>) =>
  types.reduce((a, b) => new UnionMetaType(a, b))

// TODO: Add Symbol
// TODO: Add Enum types

const tsr = {
  any: AnyType,
  object: ObjectType,
  number: NumberType,
  string: StringType,
  boolean: BooleanType,
  null: NullType,
  undefined: UndefinedType,
  void: UndefinedType,
  Array: ArrayType,
  Tuple: TupleType,
  Arguments: ArgumentsType,
  FunctionExpression: FunctionExpressionType,
  Union: unionType,
  Or: unionType,
}

export default tsr
