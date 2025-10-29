import { sentry } from "./TypeSentry.js";
const rotationModel = sentry.objectOf({
    yaw: sentry.number.nonNaN(),
    pitch: sentry.number.nonNaN(),
});
const vector3Model = sentry.objectOf({
    x: sentry.number.nonNaN(),
    y: sentry.number.nonNaN(),
    z: sentry.number.nonNaN()
});
const nonNaNIntModel = sentry.number.nonNaN().int();
const dimensionIdModel = sentry.unionOf(sentry.literalOf("minecraft:overworld"), sentry.literalOf("minecraft:the_nether"), sentry.literalOf("minecraft:the_end"));
const intRangeModel = sentry.objectOf({
    min: nonNaNIntModel,
    max: nonNaNIntModel
});
const entityModel = sentry.objectOf({
    id: sentry.number.nonNaN().int(),
    uuid: sentry.tupleOf(nonNaNIntModel, nonNaNIntModel, nonNaNIntModel, nonNaNIntModel),
    type: sentry.objectOf({
        id: sentry.string
    }),
    position: vector3Model,
    rotation: rotationModel,
    bounding_box: sentry.objectOf({
        width: sentry.number.nonNaN(),
        height: sentry.number.nonNaN()
    }),
    velocity: vector3Model,
    dimension: sentry.objectOf({
        id: dimensionIdModel,
        heightRange: intRangeModel,
    }),
    command_tags: sentry.arrayOf(sentry.string),
    custom_name: sentry.optionalOf(sentry.string),
    fire_ticks: nonNaNIntModel,
    air: nonNaNIntModel
});
console.log(entityModel.toString()); // "{id: number; uuid: [number, number, number, number]; type: {id: string}; position: {x: number; y: number; z: number}; rotation: {yaw: number; pitch: number}; bounding_box: {width: number; height: number}; velocity: {x: number; y: number; z: number}; dimension: {id: "minecraft:overworld" | "minecraft:the_nether" | "minecraft:the_end"; heightRange: {min: number; max: number}}; command_tags: string[]; custom_name: string | undefined; fire_ticks: number; air: number}"
const testModel = sentry.neoObjectOf({
    id: sentry.string,
    count: sentry.neoOptionalOf(sentry.number.int())
}).exact();
console.log(testModel.test({ id: "a", count: 1 }));
