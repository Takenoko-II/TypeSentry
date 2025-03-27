import { TypeModel, sentry } from "./TypeSentry";

interface Named {
    name: string;
}

interface Vector {
    x: number;

    y: number;

    z: number;
}

interface Example {
    foo: string;

    bar: number | bigint;

    baz?: (Named & Vector)[]
}

const namedType: TypeModel<Named> = sentry.objectOf({
    name: sentry.string
});

const vectorType: TypeModel<Vector> = sentry.objectOf({
    x: sentry.number,
    y: sentry.number,
    z: sentry.number
});

function isExample(x: unknown): x is Example {
    return sentry.objectOf({
        foo: sentry.string,
        bar: sentry.unionOf(sentry.number, sentry.bigint),
        baz: sentry.arrayOf(sentry.intersectionOf(namedType, vectorType))
    }).test(x);
}

console.log(isExample({
    foo: "str",
    bar: 10n,
    baz: [
        { name: "aaa", x: 0, y: 0, z: 0 },
        { name: "bbb", x: 0, y: 1, z: 2 }
    ]
})); // true

let x: unknown;

if (sentry.intersectionOf(namedType, vectorType).test(x)) {
    x.name // no error, x: { name: string; x: number; y: number; z: number }
}
