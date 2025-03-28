export class TypeModel {
    constructor() { }
    cast(x) {
        if (this.test(x)) {
            return x;
        }
        else {
            throw new TypeSentryError("値のキャストに失敗しました: 期待された型に一致しません");
        }
    }
}
class PrimitiveModel extends TypeModel {
    constructor() {
        super();
    }
    test(x) {
        return sentry.boolean.test(x)
            || sentry.number.test(x)
            || sentry.bigint.test(x)
            || sentry.string.test(x)
            || sentry.null.test(x)
            || sentry.undefined.test(x);
    }
}
class BooleanModel extends PrimitiveModel {
    test(x) {
        return typeof x === "boolean";
    }
    static INSTANCE = new this();
}
class NumberModel extends PrimitiveModel {
    test(x) {
        return typeof x === "number";
    }
    nonNaN() {
        const that = this;
        return new (class extends NumberModel {
            test(x) {
                return that.test(x) && !Number.isNaN(x);
            }
        })();
    }
    static INSTANCE = new this();
}
class IntModel extends NumberModel {
    test(x) {
        return super.test(x) && Number.isInteger(x);
    }
    nonNaN() {
        const that = this;
        return new (class extends IntModel {
            test(x) {
                return that.test(x) && !Number.isNaN(x);
            }
        })();
    }
    static INSTANCE = new this();
}
class BigIntModel extends PrimitiveModel {
    test(x) {
        return typeof x === "bigint";
    }
    static INSTANCE = new this();
}
;
class StringModel extends PrimitiveModel {
    test(x) {
        return typeof x === "string";
    }
    withLength(range) {
        const min = range.min === undefined ? 0 : range.min;
        const max = range.max === undefined ? Infinity : range.max;
        if (min > max || min < 0) {
            throw TypeError("無効な範囲です");
        }
        const that = this;
        return new (class extends StringModel {
            test(x) {
                return that.test(x) && (min <= x.length && x.length <= max);
            }
        })();
    }
    withPattern(pattern) {
        const that = this;
        return new (class extends StringModel {
            test(x) {
                return that.test(x) && new RegExp(pattern).test(x);
            }
        })();
    }
    static INSTANCE = new this();
}
class NullModel extends PrimitiveModel {
    test(x) {
        return x === null;
    }
    static INSTANCE = new this();
}
class UndefinedModel extends PrimitiveModel {
    test(x) {
        return x === undefined;
    }
    static INSTANCE = new this();
}
class AnyModel extends TypeModel {
    constructor() {
        super();
    }
    test(x) {
        return true;
    }
    static INSTANCE = new this();
}
class NeverModel extends TypeModel {
    test(x) {
        return false;
    }
    static INSTANCE = new this();
}
class VoidModel extends TypeModel {
    test(x) {
        return x === undefined;
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
    withLength(range) {
        const min = range.min === undefined ? 0 : range.min;
        const max = range.max === undefined ? Infinity : range.max;
        if (min > max || min < 0) {
            throw TypeError("無効な範囲です");
        }
        const that = this;
        return new (class extends ArrayModel {
            test(x) {
                return that.test(x) && (min <= x.length && x.length <= max);
            }
        })(this.type);
    }
    getModelOfElement() {
        return this.type;
    }
}
class FunctionModel extends TypeModel {
    constructor() {
        super();
    }
    test(x) {
        return typeof x === "function";
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
    unwrap() {
        return this.type;
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
    unwrap() {
        return this.type;
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
    getModelOfKey() {
        return this.keyType;
    }
    getModelOfValue() {
        return this.valueType;
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
    getModelOfElement() {
        return this.valueType;
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
    getLiteralValue() {
        return this.value;
    }
    static newInstance(string) {
        return new this(string);
    }
}
class TypeSentryError extends TypeError {
    constructor(message) {
        super(message);
    }
}
const INTERNAL_CONSTRUCTOR_KEY = Symbol();
export class TypeSentry {
    constructor(key) { }
    boolean = BooleanModel.INSTANCE;
    number = NumberModel.INSTANCE;
    bigint = BigIntModel.INSTANCE;
    string = StringModel.INSTANCE;
    null = NullModel.INSTANCE;
    undefined = UndefinedModel.INSTANCE;
    any = AnyModel.INSTANCE;
    never = NeverModel.INSTANCE;
    void = VoidModel.INSTANCE;
    function = FunctionModel.INSTANCE;
    int = IntModel.INSTANCE;
    objectOf(object) {
        return ObjectModel.newInstance(object);
    }
    arrayOf(type) {
        return new ArrayModel(type);
    }
    mapOf(keyType, valueType) {
        return new MapModel(keyType, valueType);
    }
    setOf(valueType) {
        return new SetModel(valueType);
    }
    unionOf(...types) {
        return UnionModel.newInstance(...types);
    }
    intersectionOf(...types) {
        return IntersectionModel.newInstance(...types);
    }
    optionalOf(type) {
        return OptionalModel.newInstance(type);
    }
    nullableOf(type) {
        return NullableModel.newInstance(type);
    }
    classOf(constructor) {
        return ClassModel.newInstance(constructor);
    }
    tupleOf(...elements) {
        return TupleModel.newInstance(...elements);
    }
    literalOf(literal) {
        return LiteralModel.newInstance(literal);
    }
}
export const sentry = (class extends TypeSentry {
    static INSTANCE = new this(INTERNAL_CONSTRUCTOR_KEY);
}).INSTANCE;
