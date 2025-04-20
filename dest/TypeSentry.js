/**
 * `T`型の型構造を表現する抽象クラス
 */
export class TypeModel {
    constructor() { }
    /**
     * オブジェクトが`T`型であればそのまま返し、そうでなければ例外を投げます。
     * <br>必要に応じて追加のチェックも行う場合があります。
     * @param x 検査するオブジェクト
     * @throws `TypeSentryError`
     */
    cast(x) {
        if (this.test(x)) {
            return x;
        }
        else {
            throw new TypeSentryError(`値のキャストに失敗しました: '${x}'の型は期待された型(${this.toString()})に一致しません`);
        }
    }
}
class PrimitiveModel extends TypeModel {
    constructor() {
        super();
    }
}
class BooleanModel extends PrimitiveModel {
    test(x) {
        return typeof x === "boolean";
    }
    toString() {
        return "boolean";
    }
    static INSTANCE = new this();
}
class NumberModel extends PrimitiveModel {
    test(x) {
        return typeof x === "number";
    }
    /**
     * 値が`NaN`でないことを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    nonNaN() {
        const that = this;
        return new (class extends NumberModel {
            test(x) {
                return that.test(x) && !Number.isNaN(x);
            }
        })();
    }
    /**
     * 値が整数であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    int() {
        const that = this;
        return new (class extends NumberModel {
            test(x) {
                return that.test(x) && Number.isInteger(x);
            }
        })();
    }
    toString() {
        return "number";
    }
    static INSTANCE = new this();
}
/**
 * @deprecated
 */
class IntModel extends NumberModel {
    test(x) {
        return super.test(x) && Number.isInteger(x);
    }
    /**
     * 値が`NaN`でないことを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    nonNaN() {
        const that = this;
        return new (class extends IntModel {
            test(x) {
                return that.test(x) && !Number.isNaN(x);
            }
        })();
    }
    toString() {
        return "number(int)";
    }
    static INSTANCE = new this();
}
class BigIntModel extends PrimitiveModel {
    test(x) {
        return typeof x === "bigint";
    }
    toString() {
        return "bigint";
    }
    static INSTANCE = new this();
}
class StringModel extends PrimitiveModel {
    test(x) {
        return typeof x === "string";
    }
    /**
     * 文字列長が指定の範囲内であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     * @throws `TypeSentryError`
     */
    withLength(range) {
        const min = range.min === undefined ? 0 : range.min;
        const max = range.max === undefined ? Infinity : range.max;
        if (min > max || min < 0) {
            throw new TypeSentryError(`無効な範囲です: ${min}～${max}`);
        }
        const that = this;
        return new (class extends StringModel {
            test(x) {
                return that.test(x) && (min <= x.length && x.length <= max);
            }
        })();
    }
    /**
     * 文字列の形式が指定の正規表現を含むものであることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    withPattern(pattern) {
        const that = this;
        return new (class extends StringModel {
            test(x) {
                return that.test(x) && new RegExp(pattern).test(x);
            }
        })();
    }
    toString() {
        return "string";
    }
    static INSTANCE = new this();
}
class NullModel extends PrimitiveModel {
    test(x) {
        return x === null;
    }
    toString() {
        return "null";
    }
    static INSTANCE = new this();
}
class UndefinedModel extends PrimitiveModel {
    test(x) {
        return x === undefined;
    }
    toString() {
        return "undefined";
    }
    static INSTANCE = new this();
}
class AnyModel extends TypeModel {
    constructor() {
        super();
    }
    test(_) {
        return true;
    }
    toString() {
        return "any";
    }
    static INSTANCE = new this();
}
class NeverModel extends TypeModel {
    test(_) {
        return false;
    }
    toString() {
        return "never";
    }
    static INSTANCE = new this();
}
class UnknownModel extends TypeModel {
    test(_) {
        return true;
    }
    toString() {
        return "unknown";
    }
    static INSTANCE = new this();
}
class VoidModel extends TypeModel {
    test(x) {
        return x === undefined;
    }
    toString() {
        return "void";
    }
    static INSTANCE = new this();
}
class ObjectModel extends TypeModel {
    object;
    constructor(object) {
        super();
        this.object = object;
    }
    test(x) {
        if (typeof x !== "object")
            return false;
        if (x === null)
            return false;
        for (const [key, type] of Object.entries(this.object)) {
            const value = x[key];
            if (!type.test(value))
                return false;
        }
        return true;
    }
    /**
     * オブジェクトが過不足のない数のキーを持つ連想配列であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     */
    exact() {
        const that = this;
        return new (class extends ObjectModel {
            test(x) {
                if (that.test(x)) {
                    return Object.keys(x).length === Object.keys(this.object).length;
                }
                else
                    return false;
            }
        })(this.object);
    }
    toString() {
        let string = "{";
        let first = true;
        for (const [key, model] of Object.entries(this.object)) {
            if (!first) {
                string += "; ";
            }
            let k = key;
            if (key.includes(":")) {
                k = "\"" + k + "\"";
            }
            else if (key.includes("\"")) {
                k = k.replace(/"/g, "\\\"");
            }
            string += k;
            string += ": ";
            string += model.toString();
            first = false;
        }
        string += "}";
        return string;
    }
    static newInstance(object) {
        return new this(object);
    }
}
class ArrayModel extends TypeModel {
    type;
    constructor(type) {
        super();
        this.type = type;
    }
    test(x) {
        return Array.isArray(x)
            && x.every(e => this.type.test(e));
    }
    /**
     * 配列長が指定の範囲内であることを実行時の検査において追加で要求するインスタンスを新しく生成します。
     * @returns ランタイム条件付きインスタンス
     * @throws `TypeSentryError`
     */
    withLength(range) {
        const min = range.min === undefined ? 0 : range.min;
        const max = range.max === undefined ? Infinity : range.max;
        if (min > max || min < 0) {
            throw new TypeSentryError(`無効な範囲です: ${min}～${max}`);
        }
        const that = this;
        return new (class extends ArrayModel {
            test(x) {
                return that.test(x) && (min <= x.length && x.length <= max);
            }
        })(this.type);
    }
    /**
     * 配列の要素の型を表現する`TypeModel`を返します。
     * @returns (配列要素)型の`TypeModel`インスタンス
     */
    getModelOfElement() {
        return this.type;
    }
    toString() {
        return this.type.toString() + "[]";
    }
}
class FunctionModel extends TypeModel {
    constructor() {
        super();
    }
    test(x) {
        return typeof x === "function";
    }
    toString() {
        return "function";
    }
    static INSTANCE = new this();
}
class SymbolModel extends TypeModel {
    constructor() {
        super();
    }
    test(x) {
        return typeof x === "symbol";
    }
    toString() {
        return "symbol";
    }
    static INSTANCE = new this();
}
class UnionModel extends TypeModel {
    types;
    constructor(...types) {
        super();
        this.types = types;
    }
    test(x) {
        return this.types.some(type => type.test(x));
    }
    toString() {
        return this.types.map(type => type.toString()).join(" | ");
    }
    static newInstance(...types) {
        return new this(...types);
    }
}
class IntersectionModel extends TypeModel {
    types;
    constructor(...types) {
        super();
        this.types = types;
    }
    test(x) {
        return this.types.some(type => type.test(x));
    }
    toString() {
        return this.types.map(type => type.toString()).join(" & ");
    }
    static newInstance(...types) {
        return new this(...types);
    }
}
class OptionalModel extends TypeModel {
    type;
    constructor(type) {
        super();
        this.type = type;
    }
    test(x) {
        return this.type.test(x)
            || sentry.undefined.test(x);
    }
    /**
     * `optional`を解除し、もとの型の`TypeModel`を返します。
     * @returns `optional`を解除した型を表現する`TypeModel`インスタンス
     */
    unwrap() {
        return this.type;
    }
    toString() {
        return this.type.toString() + " | undefined";
    }
    static newInstance(type) {
        return new this(type);
    }
}
class NullableModel extends TypeModel {
    type;
    constructor(type) {
        super();
        this.type = type;
    }
    test(x) {
        return this.type.test(x)
            || sentry.null.test(x);
    }
    /**
     * `nullable`を解除し、もとの型の`TypeModel`を返します。
     * @returns `nullable`を解除した型を表現する`TypeModel`インスタンス
     */
    unwrap() {
        return this.type;
    }
    toString() {
        return this.type.toString() + " | null";
    }
    static newInstance(type) {
        return new this(type);
    }
}
class MapModel extends TypeModel {
    keyType;
    valueType;
    constructor(keyType, valueType) {
        super();
        this.keyType = keyType;
        this.valueType = valueType;
    }
    test(x) {
        if (!(x instanceof Map))
            return false;
        for (const [key, value] of x.entries()) {
            if (!this.keyType.test(key))
                return false;
            if (!this.valueType.test(value))
                return false;
        }
        return true;
    }
    /**
     * `Map`のキーの型を表現する`TypeModel`を返します。
     * @returns (キー)型の`TypeModel`インスタンス
     */
    getModelOfKey() {
        return this.keyType;
    }
    /**
     * `Map`のキーの型を表現する`TypeModel`を返します。
     * @returns (値)型の`TypeModel`インスタンス
     */
    getModelOfValue() {
        return this.valueType;
    }
    toString() {
        return "Map<" + this.keyType.toString() + ", " + this.valueType.toString() + ">";
    }
}
class SetModel extends TypeModel {
    valueType;
    constructor(valueType) {
        super();
        this.valueType = valueType;
    }
    test(x) {
        if (!(x instanceof Set))
            return false;
        for (const value of x.values()) {
            if (!this.valueType.test(value))
                return false;
        }
        return true;
    }
    /**
     * `Set`の要素の型を表現する`TypeModel`を返します。
     * @returns (要素)型の`TypeModel`インスタンス
     */
    getModelOfElement() {
        return this.valueType;
    }
    toString() {
        return "Set<" + this.valueType.toString() + ">";
    }
}
class ClassModel extends TypeModel {
    constructorObject;
    constructor(constructorObject) {
        super();
        this.constructorObject = constructorObject;
    }
    test(x) {
        return x instanceof this.constructorObject;
    }
    static newInstance(constructor) {
        return new this(constructor);
    }
    toString() {
        return this.constructorObject.name;
    }
}
class TupleModel extends TypeModel {
    tuple;
    constructor(tuple) {
        super();
        this.tuple = tuple;
    }
    test(x) {
        if (!Array.isArray(x))
            return false;
        else if (x.length !== this.tuple.length)
            return false;
        for (const [index, model] of this.tuple.entries()) {
            if (!model.test(x[index]))
                return false;
        }
        return true;
    }
    toString() {
        let string = "[";
        let first = true;
        for (const model of this.tuple.values()) {
            if (!first) {
                string += ", ";
            }
            string += model.toString();
            first = false;
        }
        string += "]";
        return string;
    }
    static newInstance(...elements) {
        return new this(elements);
    }
}
class LiteralModel extends PrimitiveModel {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    test(x) {
        return x === this.value;
    }
    /**
     * リテラルオブジェクトをそのまま返します。
     * @returns リテラル値
     */
    getLiteralValue() {
        return this.value;
    }
    toString() {
        switch (typeof this.value) {
            case "boolean": return this.value.toString();
            case "number": return this.value.toString();
            case "bigint": return this.value.toString() + "n";
            case "string": return "\"" + this.value.replace(/"/g, "\\\"") + "\"";
            case "symbol": return "symbol(" + (this.value.description === undefined ? "" : "\"" + this.value.description + "\"") + ")";
        }
    }
    static newInstance(string) {
        return new this(string);
    }
}
/**
 * `TypeSentry`が投げるエラー
 */
class TypeSentryError extends TypeError {
    constructor(message) {
        super(message);
    }
}
const SYMBOL_FOR_PRIVATE_CONSTRUCTOR = Symbol();
/**
 * `TypeModel`のインスタンスを提供するクラス
 */
export class TypeSentry {
    /**
     * `TypeSentry`のコンストラクタ関数
     * @param _ 外部からのインスタンス化を封じるための`symbol`オブジェクト
     */
    constructor(_) { }
    /**
     * 第一級オブジェクト `boolean`
     */
    boolean = BooleanModel.INSTANCE;
    /**
     * 第一級オブジェクト `number`
     */
    number = NumberModel.INSTANCE;
    /**
     * 第一級オブジェクト `bigint`
     */
    bigint = BigIntModel.INSTANCE;
    /**
     * 第一級オブジェクト `string`
     */
    string = StringModel.INSTANCE;
    /**
     * 第一級オブジェクト `function`
     */
    function = FunctionModel.INSTANCE;
    /**
     * 第一級オブジェクト `null`
     */
    null = NullModel.INSTANCE;
    /**
     * 第一級オブジェクト `undefined`
     */
    undefined = UndefinedModel.INSTANCE;
    /**
     * `undefined`のエイリアス `void`
     */
    void = VoidModel.INSTANCE;
    /**
     * `symbol`
     */
    symbol = SymbolModel.INSTANCE;
    /**
     * 全てのスーパークラス `any`
     */
    any = AnyModel.INSTANCE;
    /**
     * 全てのサブクラス `never`
     */
    never = NeverModel.INSTANCE;
    /**
     * `unknown`
     */
    unknown = UnknownModel.INSTANCE;
    /**
     * `number`のランタイムチェック付きインスタンス
     * @deprecated `NumberModel`のインスタンスメソッドに置き換えられました
     * @see NumberModel#int()
     */
    int = IntModel.INSTANCE;
    /**
     * 第一級オブジェクト `object`
     * @param object `{キー1: TypeModel, キー2: TypeModel, ...}`の形式で与えられる連想配列
     * @returns 連想配列型を表現する`TypeModel`
     */
    objectOf(object) {
        return ObjectModel.newInstance(object);
    }
    /**
     * 第一級オブジェクト `array`
     * @param type 配列の要素の型を表現する`TypeModel`
     * @returns 配列型を表現する`TypeModel`
     */
    arrayOf(type) {
        return new ArrayModel(type);
    }
    /**
     * 固定長配列 `tuple`
     * @param elements `tuple`の各要素の型を表現する`TypeModel`
     * @returns `tuple`型を表現する`TypeModel`
     */
    tupleOf(...elements) {
        return TupleModel.newInstance(...elements);
    }
    /**
     * クラス `Map`
     * @param keyType `Map`のキーの型を表現する`TypeModel`
     * @param valueType `Map`の値の型を表現する`TypeModel`
     * @returns `Map`型を表現する`TypeModel`
     */
    mapOf(keyType, valueType) {
        return new MapModel(keyType, valueType);
    }
    /**
     * クラス `Set`
     * @param valueType `Set`の値の型を表現する`TypeModel`
     * @returns `Set`型を表現する`TypeModel`
     */
    setOf(valueType) {
        return new SetModel(valueType);
    }
    /**
     * 合併型
     * @param types 合併型の各要素の型を表現する`TypeModel`
     * @returns 合併型を表現する`TypeModel`
     */
    unionOf(...types) {
        return UnionModel.newInstance(...types);
    }
    /**
     * 交差型
     * @param types 交差型の各要素の型を表現する`TypeModel`
     * @returns 交差型を表現する`TypeModel`
     */
    intersectionOf(...types) {
        return IntersectionModel.newInstance(...types);
    }
    /**
     * `undefined`との合併型のエイリアス `optional`型
     * @param types `optional`型でラップする型の`TypeModel`
     * @returns `optional`型を表現する`TypeModel`
     */
    optionalOf(type) {
        return OptionalModel.newInstance(type);
    }
    /**
     * `null`との合併型のエイリアス `nullable`型
     * @param types `nulleable`型でラップする型の`TypeModel`
     * @returns `nullable`型を表現する`TypeModel`
     */
    nullableOf(type) {
        return NullableModel.newInstance(type);
    }
    /**
     * 任意のクラスを表現する型
     * @param constructor クラス(コンストラクタ)オブジェクト
     * @returns 任意のクラス型の`TypeModel`
     */
    classOf(constructor) {
        return ClassModel.newInstance(constructor);
    }
    /**
     * 任意のリテラルを表現する型
     * @param literal リテラル値
     * @returns 任意のリテラル型の`TypeModel`
     */
    literalOf(literal) {
        return LiteralModel.newInstance(literal);
    }
}
/**
 * `TypeSentry`のインスタンス
 */
export const sentry = (class extends TypeSentry {
    static INSTANCE = new this(SYMBOL_FOR_PRIVATE_CONSTRUCTOR);
}).INSTANCE;
