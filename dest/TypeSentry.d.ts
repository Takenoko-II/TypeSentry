/**
 * `T`型の型構造を表現する抽象クラス
 */
export declare abstract class TypeModel<T> {
    constructor();
    /**
     * オブジェクトが`T`型であるかを判定します。
     * <br>必要に応じて追加のチェックも行う場合があります。
     * @param x 検査するオブジェクト
     */
    abstract test(x: unknown): x is T;
    /**
     * オブジェクトが`T`型であればそのまま返し、そうでなければ例外を投げます。
     * <br>必要に応じて追加のチェックも行う場合があります。
     * @param x 検査するオブジェクト
     * @throws `TypeSentryError`
     */
    cast(x: unknown): T;
    /**
     * このインスタンスの文字列表現を返します。
     */
    abstract toString(): string;
}
declare abstract class PrimitiveModel<T extends boolean | number | bigint | string | symbol | null | undefined> extends TypeModel<T> {
    protected constructor();
}
declare class BooleanModel extends PrimitiveModel<boolean> {
    test(x: unknown): x is boolean;
    toString(): string;
    static readonly INSTANCE: BooleanModel;
}
declare class NumberModel extends PrimitiveModel<number> {
    test(x: unknown): x is number;
    /**
     * 値が`NaN`でないことを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    nonNaN(): NumberModel;
    /**
     * 値が整数であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    int(): NumberModel;
    toString(): string;
    static readonly INSTANCE: NumberModel;
}
/**
 * @deprecated
 */
declare class IntModel extends NumberModel {
    test(x: unknown): x is number;
    /**
     * 値が`NaN`でないことを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    nonNaN(): IntModel;
    toString(): string;
    static readonly INSTANCE: IntModel;
}
declare class BigIntModel extends PrimitiveModel<bigint> {
    test(x: unknown): x is bigint;
    toString(): string;
    static readonly INSTANCE: BigIntModel;
}
interface LengthRange {
    readonly min?: number;
    readonly max?: number;
}
declare class StringModel extends PrimitiveModel<string> {
    test(x: unknown): x is string;
    /**
     * 文字列長が指定の範囲内であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     * @throws `TypeSentryError`
     */
    withLength(range: LengthRange): StringModel;
    /**
     * 文字列の形式が指定の正規表現を含むものであることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    withPattern(pattern: RegExp): StringModel;
    toString(): string;
    static readonly INSTANCE: StringModel;
}
declare class NullModel extends PrimitiveModel<null> {
    test(x: unknown): x is null;
    toString(): string;
    static readonly INSTANCE: NullModel;
}
declare class UndefinedModel extends PrimitiveModel<undefined> {
    test(x: unknown): x is undefined;
    toString(): string;
    static readonly INSTANCE: UndefinedModel;
}
declare class AnyModel extends TypeModel<any> {
    private constructor();
    test(_: unknown): _ is any;
    toString(): string;
    static readonly INSTANCE: AnyModel;
}
declare class NeverModel extends TypeModel<never> {
    test(_: unknown): _ is never;
    toString(): string;
    static readonly INSTANCE: NeverModel;
}
declare class UnknownModel extends TypeModel<unknown> {
    test(_: unknown): _ is unknown;
    toString(): string;
    static readonly INSTANCE: UnknownModel;
}
declare class VoidModel extends TypeModel<void> {
    test(x: unknown): x is void;
    toString(): string;
    static readonly INSTANCE: VoidModel;
}
type ExtractTypeInObjectValue<T> = {
    [K in keyof T]: T[K] extends TypeModel<infer U> ? U : never;
};
declare class ObjectModel<T> extends TypeModel<T> {
    private readonly object;
    protected constructor(object: T);
    test(x: unknown): x is T;
    /**
     * オブジェクトが過不足のない数のキーを持つ連想配列であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    exact(): ObjectModel<T>;
    toString(): string;
    static newInstance<U extends Record<string | number | symbol, TypeModel<unknown>>>(object: U): ObjectModel<ExtractTypeInObjectValue<U>>;
}
declare class ArrayModel<T> extends TypeModel<T[]> {
    private readonly type;
    constructor(type: TypeModel<T>);
    test(x: unknown): x is T[];
    /**
     * 配列長が指定の範囲内であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     * @throws `TypeSentryError`
     */
    withLength(range: LengthRange): ArrayModel<T>;
    /**
     * 配列の要素の型を表現する`TypeModel`を返します。
     * @returns (配列要素)型の`TypeModel`インスタンス
     */
    getModelOfElement(): TypeModel<T>;
    toString(): string;
}
declare class FunctionModel extends TypeModel<Function> {
    private constructor();
    test(x: unknown): x is Function;
    toString(): string;
    static readonly INSTANCE: FunctionModel;
}
declare class SymbolModel extends TypeModel<symbol> {
    private constructor();
    test(x: unknown): x is symbol;
    toString(): string;
    static readonly INSTANCE: SymbolModel;
}
type ExtractTypes<U extends TypeModel<unknown>[]> = U[number] extends TypeModel<infer V> ? V : never;
declare class UnionModel<T> extends TypeModel<T> {
    private readonly types;
    private constructor();
    test(x: unknown): x is T;
    toString(): string;
    static newInstance<U extends TypeModel<unknown>[]>(...types: U): UnionModel<ExtractTypes<U>>;
}
type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type ExtractIntersectTypes<T extends TypeModel<unknown>[]> = UnionToIntersection<(T extends TypeModel<infer U>[] ? U[] : never)[number]>;
declare class IntersectionModel<T> extends TypeModel<T> {
    private readonly types;
    private constructor();
    test(x: unknown): x is T;
    toString(): string;
    static newInstance<U extends TypeModel<unknown>[]>(...types: U): IntersectionModel<ExtractIntersectTypes<U>>;
}
declare class OptionalModel<T> extends TypeModel<T | undefined> {
    private readonly type;
    private constructor();
    test(x: unknown): x is (T | undefined);
    /**
     * `optional`を解除し、もとの型の`TypeModel`を返します。
     * @returns `optional`を解除した型を表現する`TypeModel`インスタンス
     */
    unwrap(): TypeModel<T>;
    toString(): string;
    static newInstance<U>(type: TypeModel<U>): OptionalModel<U>;
}
declare class NullableModel<T> extends TypeModel<T | null> {
    private readonly type;
    private constructor();
    test(x: unknown): x is (T | null);
    /**
     * `nullable`を解除し、もとの型の`TypeModel`を返します。
     * @returns `nullable`を解除した型を表現する`TypeModel`インスタンス
     */
    unwrap(): TypeModel<T>;
    toString(): string;
    static newInstance<U>(type: TypeModel<U>): NullableModel<U>;
}
declare class MapModel<K, V> extends TypeModel<Map<K, V>> {
    private readonly keyType;
    private readonly valueType;
    constructor(keyType: TypeModel<K>, valueType: TypeModel<V>);
    test(x: unknown): x is Map<K, V>;
    /**
     * `Map`のキーの型を表現する`TypeModel`を返します。
     * @returns (キー)型の`TypeModel`インスタンス
     */
    getModelOfKey(): TypeModel<K>;
    /**
     * `Map`のキーの型を表現する`TypeModel`を返します。
     * @returns (値)型の`TypeModel`インスタンス
     */
    getModelOfValue(): TypeModel<V>;
    toString(): string;
}
declare class SetModel<T> extends TypeModel<Set<T>> {
    private readonly valueType;
    constructor(valueType: TypeModel<T>);
    test(x: unknown): x is Set<T>;
    /**
     * `Set`の要素の型を表現する`TypeModel`を返します。
     * @returns (要素)型の`TypeModel`インスタンス
     */
    getModelOfElement(): TypeModel<T>;
    toString(): string;
}
declare class ClassModel<T> extends TypeModel<T> {
    private readonly constructorObject;
    private constructor();
    test(x: unknown): x is T;
    static newInstance<U extends Function>(constructor: U): ClassModel<U["prototype"]>;
    toString(): string;
}
type TypeModelArrayToTuple<T extends TypeModel<unknown>[]> = {
    [K in keyof T]: T[K] extends TypeModel<infer U> ? U : never;
};
declare class TupleModel<T extends TypeModel<unknown>[]> extends TypeModel<TypeModelArrayToTuple<T>> {
    private readonly tuple;
    private constructor();
    test(x: unknown): x is TypeModelArrayToTuple<T>;
    toString(): string;
    static newInstance<T extends TypeModel<unknown>[]>(...elements: T): TupleModel<T>;
}
declare class RecordModel<K extends string | number | symbol, V> extends TypeModel<Record<K, V>> {
    private readonly keyType;
    private readonly valueType;
    constructor(keyType: TypeModel<K>, valueType: TypeModel<V>);
    test(x: unknown): x is Record<K, V>;
    /**
     * `Record`のキーの型を表現する`TypeModel`を返します。
     * @returns (キー)型の`TypeModel`インスタンス
     */
    getModelOfKey(): TypeModel<K>;
    /**
     * `Record`のキーの型を表現する`TypeModel`を返します。
     * @returns (値)型の`TypeModel`インスタンス
     */
    getModelOfValue(): TypeModel<V>;
    toString(): string;
}
declare class LiteralModel<T extends boolean | number | bigint | string | symbol> extends PrimitiveModel<T> {
    private readonly value;
    constructor(value: T);
    test(x: unknown): x is T;
    /**
     * リテラルオブジェクトをそのまま返します。
     * @returns リテラル値
     */
    getLiteralValue(): T;
    toString(): string;
    static newInstance<U extends boolean | number | bigint | string | symbol>(string: U): LiteralModel<U>;
}
declare class EnumLikeModel<T extends Record<string, string | number>> extends TypeModel<T[keyof T]> {
    private readonly enumeration;
    constructor(enumeration: T);
    test(x: unknown): x is T[keyof T];
    static newInstance<U extends Record<string, string | number>>(enumeration: U): EnumLikeModel<U>;
    toString(): string;
}
declare const SYMBOL_FOR_PRIVATE_CONSTRUCTOR: unique symbol;
/**
 * `TypeModel`のインスタンスを提供するクラス
 */
export declare class TypeSentry {
    /**
     * `TypeSentry`のコンストラクタ関数
     * @param _ 外部からのインスタンス化を封じるための`symbol`オブジェクト
     */
    protected constructor(_: typeof SYMBOL_FOR_PRIVATE_CONSTRUCTOR);
    /**
     * 第一級オブジェクト `boolean`
     */
    readonly boolean: BooleanModel;
    /**
     * 第一級オブジェクト `number`
     */
    readonly number: NumberModel;
    /**
     * 第一級オブジェクト `bigint`
     */
    readonly bigint: BigIntModel;
    /**
     * 第一級オブジェクト `string`
     */
    readonly string: StringModel;
    /**
     * 第一級オブジェクト `function`
     */
    readonly function: FunctionModel;
    /**
     * 第一級オブジェクト `null`
     */
    readonly null: NullModel;
    /**
     * 第一級オブジェクト `undefined`
     */
    readonly undefined: UndefinedModel;
    /**
     * `undefined`のエイリアス `void`
     */
    readonly void: VoidModel;
    /**
     * `symbol`
     */
    readonly symbol: SymbolModel;
    /**
     * 全てのスーパークラス `any`
     * 基本的に非推奨
     */
    readonly any: AnyModel;
    /**
     * 全てのサブクラス `never`
     */
    readonly never: NeverModel;
    /**
     * `unknown`
     */
    readonly unknown: UnknownModel;
    /**
     * `number`のランタイムチェック付きインスタンス
     * @deprecated `NumberModel`のインスタンスメソッドに置き換えられました
     * @see NumberModel#int()
     */
    readonly int: IntModel;
    /**
     * 第一級オブジェクト `object`
     * @param object `{キー1: TypeModel, キー2: TypeModel, ...}`の形式で与えられる連想配列
     * @returns 連想配列型を表現する`TypeModel`
     */
    objectOf<U extends Record<string | number | symbol, TypeModel<unknown>>>(object: U): ObjectModel<ExtractTypeInObjectValue<U>>;
    /**
     * 第一級オブジェクト `array`
     * @param type 配列の要素の型を表現する`TypeModel`
     * @returns 配列型を表現する`TypeModel`
     */
    arrayOf<U>(type: TypeModel<U>): ArrayModel<U>;
    /**
     * 固定長配列 `tuple`
     * @param elements `tuple`の各要素の型を表現する`TypeModel`
     * @returns `tuple`型を表現する`TypeModel`
     */
    tupleOf<U extends TypeModel<unknown>[]>(...elements: U): TupleModel<U>;
    /**
     * クラス `Map`
     * @param keyType `Map`のキーの型を表現する`TypeModel`
     * @param valueType `Map`の値の型を表現する`TypeModel`
     * @returns `Map`型を表現する`TypeModel`
     */
    mapOf<K, V>(keyType: TypeModel<K>, valueType: TypeModel<V>): MapModel<K, V>;
    /**
     * クラス `Set`
     * @param valueType `Set`の値の型を表現する`TypeModel`
     * @returns `Set`型を表現する`TypeModel`
     */
    setOf<T>(valueType: TypeModel<T>): SetModel<T>;
    /**
     * 型 `Record`
     * @param keyType `Record`のキーの型を表現する`TypeModel`
     * @param valueType `Record`の値の型を表現する`TypeModel`
     * @returns `Record`型を表現する`TypeModel`
     */
    recordOf<K extends string | number | symbol, V>(keyType: TypeModel<K>, valueType: TypeModel<V>): RecordModel<K, V>;
    /**
     * 合併型
     * @param types 合併型の各要素の型を表現する`TypeModel`
     * @returns 合併型を表現する`TypeModel`
     */
    unionOf<U extends TypeModel<unknown>[]>(...types: U): UnionModel<ExtractTypes<U>>;
    /**
     * 交差型
     * @param types 交差型の各要素の型を表現する`TypeModel`
     * @returns 交差型を表現する`TypeModel`
     */
    intersectionOf<U extends TypeModel<unknown>[]>(...types: U): IntersectionModel<ExtractIntersectTypes<U>>;
    /**
     * `undefined`との合併型のエイリアス `optional`型
     * @param types `optional`型でラップする型の`TypeModel`
     * @returns `optional`型を表現する`TypeModel`
     */
    optionalOf<U>(type: TypeModel<U>): OptionalModel<U>;
    /**
     * `null`との合併型のエイリアス `nullable`型
     * @param types `nulleable`型でラップする型の`TypeModel`
     * @returns `nullable`型を表現する`TypeModel`
     */
    nullableOf<U>(type: TypeModel<U>): NullableModel<U>;
    /**
     * 任意のクラスを表現する型
     * @param constructor クラス(コンストラクタ)オブジェクト
     * @returns 任意のクラス型の`TypeModel`
     */
    classOf<U extends Function>(constructor: U): ClassModel<U["prototype"]>;
    /**
     * 任意のリテラルを表現する型
     * @param literal リテラル値
     * @returns 任意のリテラル型の`TypeModel`
     */
    literalOf<U extends boolean | number | bigint | string | symbol>(literal: U): LiteralModel<U>;
    /**
     * 任意の列挙型を表現する型
     * @param enumeration 列挙型
     * @returns 任意の列挙型の`TypeModel`
     * @experimental
     */
    enumLikeOf<U extends Record<string, string | number>>(enumeration: U): EnumLikeModel<U>;
}
/**
 * `TypeSentry`のインスタンス
 */
export declare const sentry: TypeSentry;
export {};
