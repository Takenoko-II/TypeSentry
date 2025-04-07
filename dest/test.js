import { sentry } from "./TypeSentry.js";
const fooModel = sentry.objectOf({
    name: sentry.string,
    vec: sentry.objectOf({
        x: sentry.number.nonNaN(),
        y: sentry.number.nonNaN(),
        z: sentry.number.nonNaN()
    }).exact(),
    obj: sentry.objectOf({
        uuid: sentry.tupleOf(sentry.number.nonNaN(), sentry.number.nonNaN(), sentry.number.nonNaN(), sentry.number.nonNaN()),
        type: sentry.unionOf(sentry.literalOf("BANANA"), sentry.literalOf("NOT_BANANA"))
    }).exact()
}).exact();
console.log(fooModel.toString());
