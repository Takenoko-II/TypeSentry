# TypeSentry

型チェックをするための単一のオブジェクトを提供する自分用ライブラリ

## Usage

### import

```ts
import { sentry } from "./TypeSentry";
```

### 型チェック

```ts
let x: unknown;

if (sentry.string.test(x)) {
    // unknown -> string に型変換される
    console.log(x.length);
}
```

### 値のキャスト

```js
function add(a, b) {
    const numA = sentry.number.cast(a); // any -> number に型変換される
    const numB = sentry.number.cast(b); // any -> number に型変換される

    return numA + numB;
}

console.log(add(2, 3)); // 5
console.log(add("str", 1)); // TypeSentryError: キャストに失敗しました
```

### 型定義

```ts
const vector2Type = sentry.objectOf({
    x: sentry.number,
    y: sentry.number
});

const itemType = sentry.objectOf({
    id: sentry.string,
    count: sentry.unionOf(sentry.int.nonNaN(), sentry.bigint),
    components: sentry.objectOf({
        attributes: sentry.setOf(sentry.string),
        uuid: sentry.arrayOf(sentry.int.nonNaN())
    })
});

let x: unknown;
let y: unknown;

if (vectorType.test(x)) {
    // unknown -> { x: number; y: number } に型変換される
}

if (itemType.test(y)) {
    // unknown -> { id: string; count: number | bigint; components: { attributes: Set<string>; uuid: number[] } } に型変換される, たとえばcountがNaNだったり小数だったりすると実行時エラー
}
```

> [!NOTE]
> このライブラリの弱点としては循環定義ができないこと
> ```ts
> interface Foo { foo: Foo }
> ```
> みたいなのは定義できない

## License
[MIT LICENSE](/LICENSE)

## Author
[Takenoko_4096](x.com/Takenoko_4096)
