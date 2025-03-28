import { sentry } from "./TypeSentry";
const namedType = sentry.objectOf({
    name: sentry.string
});
const vectorType = sentry.objectOf({
    x: sentry.number,
    y: sentry.number,
    z: sentry.number
});
function isExample(x) {
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
let x;
if (sentry.intersectionOf(namedType, vectorType).test(x)) {
    x.name; // no error, x: { name: string; x: number; y: number; z: number }
}
