declare abstract class Type<T> {
    constructor();
    abstract test(x: unknown): x is T;
    cast(x: unknown): T;
}
declare abstract class PrimitiveType<T extends boolean | number | bigint | string | null | undefined> extends Type<T> {
    protected constructor();
    test(x: unknown): x is T;
}
declare class BooleanType extends PrimitiveType<boolean> {
    test(x: unknown): x is boolean;
    static readonly INSTANCE: BooleanType;
}
declare class NumberType extends PrimitiveType<number> {
    test(x: unknown): x is number;
    nonNaN(): NumberType;
    static readonly INSTANCE: NumberType;
    readonly int: IntType;
}
declare class IntType extends NumberType {
    test(x: unknown): x is number;
    nonNaN(): IntType;
    static readonly INSTANCE: IntType;
}
declare class BigIntType extends PrimitiveType<bigint> {
    test(x: unknown): x is bigint;
    static readonly INSTANCE: BigIntType;
}
interface LengthRange {
    readonly min?: number;
    readonly max?: number;
}
declare class StringType extends PrimitiveType<string> {
    test(x: unknown): x is string;
    lengthLimited(range: LengthRange): StringType;
    static readonly INSTANCE: StringType;
}
declare class NullType extends PrimitiveType<null> {
    test(x: unknown): x is null;
    static readonly INSTANCE: NullType;
}
declare class UndefinedType extends PrimitiveType<undefined> {
    test(x: unknown): x is undefined;
    static readonly INSTANCE: UndefinedType;
}
declare class AnyType extends Type<any> {
    private constructor();
    test(x: unknown): x is any;
    static readonly INSTANCE: AnyType;
}
declare class NeverType extends Type<never> {
    test(x: unknown): x is never;
    static readonly INSTANCE: NeverType;
}
declare class VoidType extends Type<void> {
    test(x: unknown): x is void;
    static readonly INSTANCE: VoidType;
}
type ExtractTypeInObjectValue<T> = {
    [K in keyof T]: T[K] extends Type<infer U> ? U : never;
};
declare class ObjectType<T> extends Type<T> {
    private readonly object;
    protected constructor(object: T);
    test(x: unknown): x is T;
    exact(): ObjectType<T>;
    static newInstance<U extends Record<string | number | symbol, Type<unknown>>>(object: U): ObjectType<ExtractTypeInObjectValue<U>>;
}
declare class ArrayType<T> extends Type<T[]> {
    private readonly type;
    constructor(type: Type<T>);
    test(x: unknown): x is T[];
    lengthLimited(range: LengthRange): ArrayType<T>;
}
declare class FunctionType extends Type<Function> {
    private constructor();
    test(x: unknown): x is Function;
    static readonly INSTANCE: FunctionType;
}
type ExtractTypes<U extends Type<unknown>[]> = U[number] extends Type<infer V> ? V : never;
declare class UnionType<T> extends Type<T> {
    private readonly types;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends Type<unknown>[]>(...types: U): UnionType<ExtractTypes<U>>;
}
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type ExtractIntersectTypes<T extends Type<unknown>[]> = UnionToIntersection<(T extends Type<infer U>[] ? U[] : never)[number]>;
declare class IntersectionType<T> extends Type<T> {
    private readonly types;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends Type<unknown>[]>(...types: U): IntersectionType<ExtractIntersectTypes<U>>;
}
declare class OptionalType<T> extends Type<T | undefined> {
    private readonly type;
    private constructor();
    test(x: unknown): x is (T | undefined);
    static newInstance<U>(type: Type<U>): OptionalType<U>;
}
declare class MapType<K, V> extends Type<Map<K, V>> {
    private readonly keyType;
    private readonly valueType;
    constructor(keyType: Type<K>, valueType: Type<V>);
    test(x: unknown): x is Map<K, V>;
}
declare class SetType<T> extends Type<Set<T>> {
    private readonly valueType;
    constructor(valueType: Type<T>);
    test(x: unknown): x is Set<T>;
}
declare class ClassType<T> extends Type<T> {
    private readonly constructorObject;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends Function>(constructor: U): ClassType<U["prototype"]>;
}
declare class TypeSentry {
    private constructor();
    readonly boolean: BooleanType;
    readonly number: NumberType;
    readonly bigint: BigIntType;
    readonly string: StringType;
    readonly null: NullType;
    readonly undefined: UndefinedType;
    readonly any: AnyType;
    readonly never: NeverType;
    readonly void: VoidType;
    readonly function: FunctionType;
    objectOf<U extends Record<string | number | symbol, Type<unknown>>>(object: U): ObjectType<ExtractTypeInObjectValue<U>>;
    arrayOf<U>(type: Type<U>): ArrayType<U>;
    mapOf<K, V>(keyType: Type<K>, valueType: Type<V>): MapType<K, V>;
    setOf<T>(valueType: Type<T>): SetType<T>;
    unionOf<U extends Type<unknown>[]>(...types: U): UnionType<ExtractTypes<U>>;
    intersectionOf<U extends Type<unknown>[]>(...types: U): IntersectionType<ExtractIntersectTypes<U>>;
    optionalOf<U>(type: Type<U>): OptionalType<U>;
    classOf<U extends Function>(constructor: U): ClassType<U["prototype"]>;
    static readonly INSTANCE: TypeSentry;
}
export declare const sentry: TypeSentry;
export {};
