abstract class Type<T> {
    public constructor() {}

    public abstract test(x: unknown): x is T;
}

abstract class PrimitiveType<T extends boolean | number | bigint | string | null | undefined> extends Type<T> {
    protected constructor() {
        super();
    }

    public override test(x: unknown): x is T {
        return TypeSentry.BOOLEAN.test(x)
            || TypeSentry.NUMBER.test(x)
            || new BigIntType().test(x)
            || new StringType().test(x)
            || new NullType().test(x)
            || new UndefinedType().test(x);
    }
}

class BooleanType extends PrimitiveType<boolean> {
    public override test(x: unknown): x is boolean {
        return typeof x === "boolean";
    }

    public static readonly INSTANCE: BooleanType = new this();
}

class NumberType extends PrimitiveType<number> {
    public override test(x: unknown): x is number {
        return typeof x === "number";
    }

    public static readonly INSTANCE: NumberType = new this();
}

class BigIntType extends PrimitiveType<bigint> {
    public override test(x: unknown): x is bigint {
        return typeof x === "bigint";
    }

    public static readonly INSTANCE: BigIntType = new this();
}

class StringType extends PrimitiveType<string> {
    public override test(x: unknown): x is string {
        return typeof x === "string";
    }

    public static readonly INSTANCE: StringType = new this();
}

class NullType extends PrimitiveType<null> {
    public override test(x: unknown): x is null {
        return x === null;
    }

    public static readonly INSTANCE: NullType = new this();
}

class UndefinedType extends PrimitiveType<undefined> {
    public override test(x: unknown): x is undefined {
        return x === undefined;
    }

    public static readonly INSTANCE: UndefinedType = new this();
}

type ExtractTypeInObjectValue<T> = {
    [K in keyof T]: T[K] extends Type<infer U> ? U : never;
};

class ObjectType<T> extends Type<T> {
    private readonly object: T;

    private constructor(object: T) {
        super();
        this.object = object;
    }

    public test(x: unknown): x is T {
        if (typeof x !== "object") return false;
        if (x === null) return false;

        for (const [key, value] of Object.entries(x)) {
            const type: Type<unknown> = this.object[key];
            if (!type.test(value)) return false;
        }

        return true;
    }

    public static newInstance<U extends Record<string, Type<unknown>>>(object: U): ObjectType<ExtractTypeInObjectValue<U>> {
        return new this(object as ExtractTypeInObjectValue<U>);
    }
}

class ArrayType<T> extends Type<T[]> {
    private readonly type: Type<T>;

    public constructor(type: Type<T>) {
        super();
        this.type = type;
    }

    public test(x: unknown): x is T[] {
        return Array.isArray(x)
            && x.every(e => this.type.test(e));
    }
}

type ExtractTypes<U extends Type<unknown>[]> = U[number] extends Type<infer V> ? V : never;

class UnionType<T> extends Type<T> {
    private readonly types: Type<T>[];

    private constructor(...types: Type<unknown>[]) {
        super();
        this.types = types as Type<T>[];
    }

    public override test(x: unknown): x is T {
        return this.types.some(type => type.test(x));
    }

    public static newInstance<U extends Type<unknown>[]>(...types: U): UnionType<ExtractTypes<U>> {
        return new this(...types);
    }
}

class OptionalType<T> extends Type<T> {
    private readonly type: Type<T>;

    private constructor(type: Type<T>) {
        super();
        this.type = type;
    }

    public override test(x: unknown): x is T {
        return this.type.test(x)
            || TypeSentry.UNDEFINED.test(x);
    }

    public static newInstance<U>(type: Type<U>): OptionalType<U | undefined> {
        return new this(type);
    }
}

class TypeSentryError extends TypeError {
    public constructor(message: string) {
        super(message);
    }
}

class TypeSentry {
    public constructor() {}

    public test<T>(x: unknown, type: Type<T>): x is T {
        return type.test(x);
    }

    public expect<T>(x: unknown, type: Type<T>): void {
        if (!this.test(x, type)) {
            throw new TypeSentryError("期待と異なる型を検出しました");
        }
    }

    public cast<T>(x: unknown, type: Type<T>): T {
        this.expect(x, type);
        return x as T;
    }

    public static readonly BOOLEAN: BooleanType = BooleanType.INSTANCE;

    public static readonly NUMBER: NumberType = NumberType.INSTANCE;

    public static readonly BIGINT: BigIntType = BigIntType.INSTANCE;

    public static readonly STRING: StringType = StringType.INSTANCE;

    public static readonly NULL: NullType = NullType.INSTANCE;

    public static readonly UNDEFINED: UndefinedType = UndefinedType.INSTANCE;

    public static objectOf<U extends Record<string, Type<unknown>>>(object: U): ObjectType<ExtractTypeInObjectValue<U>> {
        return ObjectType.newInstance(object);
    }

    public static arrayOf<U>(type: Type<U>): ArrayType<U> {
        return new ArrayType(type);
    }

    public static unionOf<U extends Type<unknown>[]>(...types: U): UnionType<ExtractTypes<U>> {
        return UnionType.newInstance(...types);
    }

    public static optionalOf<U>(type: Type<U>): OptionalType<U | undefined> {
        return this.optionalOf(type);
    }
}

const sentry: TypeSentry = new TypeSentry();

const a = sentry.cast("foo", TypeSentry.objectOf({length: TypeSentry.STRING}));

// readonly はいらない