export declare abstract class TypeModel<T> {
    constructor();
    abstract test(x: unknown): x is T;
    cast(x: unknown): T;
}
declare abstract class PrimitiveModel<T extends boolean | number | bigint | string | symbol | null | undefined> extends TypeModel<T> {
    protected constructor();
    test(x: unknown): x is T;
}
declare class BooleanModel extends PrimitiveModel<boolean> {
    test(x: unknown): x is boolean;
    static readonly INSTANCE: BooleanModel;
}
declare class NumberModel extends PrimitiveModel<number> {
    test(x: unknown): x is number;
    nonNaN(): NumberModel;
    static readonly INSTANCE: NumberModel;
}
declare class IntModel extends NumberModel {
    test(x: unknown): x is number;
    nonNaN(): IntModel;
    static readonly INSTANCE: IntModel;
}
declare class BigIntModel extends PrimitiveModel<bigint> {
    test(x: unknown): x is bigint;
    static readonly INSTANCE: BigIntModel;
}
interface LengthRange {
    readonly min?: number;
    readonly max?: number;
}
declare class StringModel extends PrimitiveModel<string> {
    test(x: unknown): x is string;
    withLength(range: LengthRange): StringModel;
    withPattern(pattern: RegExp): StringModel;
    static readonly INSTANCE: StringModel;
}
declare class NullModel extends PrimitiveModel<null> {
    test(x: unknown): x is null;
    static readonly INSTANCE: NullModel;
}
declare class UndefinedModel extends PrimitiveModel<undefined> {
    test(x: unknown): x is undefined;
    static readonly INSTANCE: UndefinedModel;
}
declare class AnyModel extends TypeModel<any> {
    private constructor();
    test(x: unknown): x is any;
    static readonly INSTANCE: AnyModel;
}
declare class NeverModel extends TypeModel<never> {
    test(x: unknown): x is never;
    static readonly INSTANCE: NeverModel;
}
declare class VoidModel extends TypeModel<void> {
    test(x: unknown): x is void;
    static readonly INSTANCE: VoidModel;
}
type ExtractTypeInObjectValue<T> = {
    [K in keyof T]: T[K] extends TypeModel<infer U> ? U : never;
};
declare class ObjectModel<T> extends TypeModel<T> {
    private readonly object;
    protected constructor(object: T);
    test(x: unknown): x is T;
    exact(): ObjectModel<T>;
    static newInstance<U extends Record<string | number | symbol, TypeModel<unknown>>>(object: U): ObjectModel<ExtractTypeInObjectValue<U>>;
}
declare class ArrayModel<T> extends TypeModel<T[]> {
    private readonly type;
    constructor(type: TypeModel<T>);
    test(x: unknown): x is T[];
    withLength(range: LengthRange): ArrayModel<T>;
    getModelOfElement(): TypeModel<T>;
}
declare class FunctionModel extends TypeModel<Function> {
    private constructor();
    test(x: unknown): x is Function;
    static readonly INSTANCE: FunctionModel;
}
declare class SymbolModel extends TypeModel<symbol> {
    private constructor();
    test(x: unknown): x is symbol;
    static readonly INSTANCE: SymbolModel;
}
type ExtractTypes<U extends TypeModel<unknown>[]> = U[number] extends TypeModel<infer V> ? V : never;
declare class UnionModel<T> extends TypeModel<T> {
    private readonly types;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends TypeModel<unknown>[]>(...types: U): UnionModel<ExtractTypes<U>>;
}
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type ExtractIntersectTypes<T extends TypeModel<unknown>[]> = UnionToIntersection<(T extends TypeModel<infer U>[] ? U[] : never)[number]>;
declare class IntersectionModel<T> extends TypeModel<T> {
    private readonly types;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends TypeModel<unknown>[]>(...types: U): IntersectionModel<ExtractIntersectTypes<U>>;
}
declare class OptionalModel<T> extends TypeModel<T | undefined> {
    private readonly type;
    private constructor();
    test(x: unknown): x is (T | undefined);
    unwrap(): TypeModel<T>;
    static newInstance<U>(type: TypeModel<U>): OptionalModel<U>;
}
declare class NullableModel<T> extends TypeModel<T | null> {
    private readonly type;
    private constructor();
    test(x: unknown): x is (T | null);
    unwrap(): TypeModel<T>;
    static newInstance<U>(type: TypeModel<U>): NullableModel<U>;
}
declare class MapModel<K, V> extends TypeModel<Map<K, V>> {
    private readonly keyType;
    private readonly valueType;
    constructor(keyType: TypeModel<K>, valueType: TypeModel<V>);
    test(x: unknown): x is Map<K, V>;
    getModelOfKey(): TypeModel<K>;
    getModelOfValue(): TypeModel<V>;
}
declare class SetModel<T> extends TypeModel<Set<T>> {
    private readonly valueType;
    constructor(valueType: TypeModel<T>);
    test(x: unknown): x is Set<T>;
    getModelOfElement(): TypeModel<T>;
}
declare class ClassModel<T> extends TypeModel<T> {
    private readonly constructorObject;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends Function>(constructor: U): ClassModel<U["prototype"]>;
}
type TypeModelArrayToTuple<T extends TypeModel<unknown>[]> = {
    [K in keyof T]: T[K] extends TypeModel<infer U> ? U : never;
};
declare class TupleModel<T extends TypeModel<unknown>[]> extends TypeModel<TypeModelArrayToTuple<T>> {
    private readonly tuple;
    private constructor();
    test(x: unknown): x is TypeModelArrayToTuple<T>;
    static newInstance<T extends TypeModel<unknown>[]>(...elements: T): TupleModel<T>;
}
declare class LiteralModel<T extends boolean | number | bigint | string | symbol> extends PrimitiveModel<T> {
    private readonly value;
    constructor(value: T);
    test(x: unknown): x is T;
    getLiteralValue(): T;
    static newInstance<U extends boolean | number | bigint | string | symbol>(string: U): LiteralModel<U>;
}
declare const INTERNAL_CONSTRUCTOR_KEY: unique symbol;
export declare class TypeSentry {
    protected constructor(key: typeof INTERNAL_CONSTRUCTOR_KEY);
    readonly boolean: BooleanModel;
    readonly number: NumberModel;
    readonly bigint: BigIntModel;
    readonly string: StringModel;
    readonly null: NullModel;
    readonly undefined: UndefinedModel;
    readonly any: AnyModel;
    readonly never: NeverModel;
    readonly void: VoidModel;
    readonly function: FunctionModel;
    readonly symbol: SymbolModel;
    readonly int: IntModel;
    objectOf<U extends Record<string | number | symbol, TypeModel<unknown>>>(object: U): ObjectModel<ExtractTypeInObjectValue<U>>;
    arrayOf<U>(type: TypeModel<U>): ArrayModel<U>;
    mapOf<K, V>(keyType: TypeModel<K>, valueType: TypeModel<V>): MapModel<K, V>;
    setOf<T>(valueType: TypeModel<T>): SetModel<T>;
    unionOf<U extends TypeModel<unknown>[]>(...types: U): UnionModel<ExtractTypes<U>>;
    intersectionOf<U extends TypeModel<unknown>[]>(...types: U): IntersectionModel<ExtractIntersectTypes<U>>;
    optionalOf<U>(type: TypeModel<U>): OptionalModel<U>;
    nullableOf<U>(type: TypeModel<U>): NullableModel<U>;
    classOf<U extends Function>(constructor: U): ClassModel<U["prototype"]>;
    tupleOf<U extends TypeModel<unknown>[]>(...elements: U): TupleModel<U>;
    literalOf<U extends boolean | number | bigint | string | symbol>(literal: U): LiteralModel<U>;
}
export declare const sentry: TypeSentry;
export {};
