// @ts-check

import { ItemStack } from "@minecraft/server";
import { sentry } from "./TypeSentry";

const itemStackDataType = sentry.objectOf({
    id: sentry.string,
    count: sentry.number.int,
    components: sentry.objectOf({
        "minecraft:item_name": sentry.string,
        "minecraft:custom_data": sentry.objectOf({}).exact(),
    })
});
