class Type {
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
class PrimitiveType extends Type {
    constructor() {
        super();
    }
    test(x) {
        return TypeSentry.INSTANCE.boolean.test(x)
            || TypeSentry.INSTANCE.number.test(x)
            || TypeSentry.INSTANCE.bigint.test(x)
            || TypeSentry.INSTANCE.string.test(x)
            || TypeSentry.INSTANCE.null.test(x)
            || TypeSentry.INSTANCE.undefined.test(x);
    }
}
class BooleanType extends PrimitiveType {
    test(x) {
        return typeof x === "boolean";
    }
    static INSTANCE = new this();
}
class NumberType extends PrimitiveType {
    test(x) {
        return typeof x === "number";
    }
    nonNaN() {
        return new (class extends NumberType {
            test(x) {
                return super.test(x) && !Number.isNaN(x);
            }
        })();
    }
    static INSTANCE = new this();
}
class BigIntType extends PrimitiveType {
    test(x) {
        return typeof x === "bigint";
    }
    static INSTANCE = new this();
}
;
class StringType extends PrimitiveType {
    test(x) {
        return typeof x === "string";
    }
    lengthLimited(range) {
        const min = range.min === undefined ? 0 : range.min;
        const max = range.max === undefined ? Infinity : range.max;
        if (min > max || min < 0) {
            throw TypeError("無効な範囲です");
        }
        return new (class extends StringType {
            test(x) {
                return super.test(x) && (min <= x.length && x.length <= max);
            }
        })();
    }
    static INSTANCE = new this();
}
class NullType extends PrimitiveType {
    test(x) {
        return x === null;
    }
    static INSTANCE = new this();
}
class UndefinedType extends PrimitiveType {
    test(x) {
        return x === undefined;
    }
    static INSTANCE = new this();
}
class AnyType extends Type {
    constructor() {
        super();
    }
    test(x) {
        return true;
    }
    static INSTANCE = new this();
}
class NeverType extends Type {
    test(x) {
        return false;
    }
    static INSTANCE = new this();
}
class VoidType extends Type {
    test(x) {
        return x === undefined;
    }
    static INSTANCE = new this();
}
class ObjectType extends Type {
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
    static newInstance(object) {
        return new this(object);
    }
}
class ArrayType extends Type {
    type;
    constructor(type) {
        super();
        this.type = type;
    }
    test(x) {
        return Array.isArray(x)
            && x.every(e => this.type.test(e));
    }
    lengthLimited(range) {
        const min = range.min === undefined ? 0 : range.min;
        const max = range.max === undefined ? Infinity : range.max;
        if (min > max || min < 0) {
            throw TypeError("無効な範囲です");
        }
        return new (class extends ArrayType {
            test(x) {
                return super.test(x) && (min <= x.length && x.length <= max);
            }
        })(this.type);
    }
}
class FunctionType extends Type {
    constructor() {
        super();
    }
    test(x) {
        return typeof x === "function";
    }
    static INSTANCE = new this();
}
class UnionType extends Type {
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
class IntersectionType extends Type {
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
class OptionalType extends Type {
    type;
    constructor(type) {
        super();
        this.type = type;
    }
    test(x) {
        return this.type.test(x)
            || TypeSentry.INSTANCE.undefined.test(x);
    }
    static newInstance(type) {
        return new this(type);
    }
}
class MapType extends Type {
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
}
class SetType extends Type {
    valueType;
    constructor(valueType) {
        super();
        this.valueType = valueType;
    }
    test(x) {
        if (!(x instanceof Set))
            return false;
        for (const [key, value] of x.values()) {
            if (!this.valueType.test(value))
                return false;
        }
        return true;
    }
}
class ClassType extends Type {
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
class TypeSentryError extends TypeError {
    constructor(message) {
        super(message);
    }
}
class TypeSentry {
    constructor() { }
    boolean = BooleanType.INSTANCE;
    number = NumberType.INSTANCE;
    bigint = BigIntType.INSTANCE;
    string = StringType.INSTANCE;
    null = NullType.INSTANCE;
    undefined = UndefinedType.INSTANCE;
    any = AnyType.INSTANCE;
    never = NeverType.INSTANCE;
    void = VoidType.INSTANCE;
    function = FunctionType.INSTANCE;
    objectOf(object) {
        return ObjectType.newInstance(object);
    }
    arrayOf(type) {
        return new ArrayType(type);
    }
    mapOf(keyType, valueType) {
        return new MapType(keyType, valueType);
    }
    setOf(valueType) {
        return new SetType(valueType);
    }
    unionOf(...types) {
        return UnionType.newInstance(...types);
    }
    intersectionOf(...types) {
        return IntersectionType.newInstance(...types);
    }
    optionalOf(type) {
        return OptionalType.newInstance(type);
    }
    classOf(constructor) {
        return ClassType.newInstance(constructor);
    }
    static INSTANCE = new this();
}
export const sentry = TypeSentry.INSTANCE;
