# TypeSentry

型チェックをするための単一のオブジェクトを提供する自分用ライブラリ

## Usage

### import

```ts
import { sentry, TypeModel } from "./TypeSentry";
```

### 型チェック

`TypeModel<T>#test(x: unknown): x is T;` (型ガード関数)

```ts
let x: unknown;

if (sentry.string.test(x)) {
    // unknown -> string に型変換される
    console.log(x.length);
}
```

### 値のキャスト

`TypeModel<T>#cast(x: unknown): T;`
<br>キャストに失敗すると例外投げます

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
import { sentry, TypeModel } from "./TypeSentry";

interface Vector2 {
    x: number;
    y: number;
}

// 型注釈があるとその型の型ガード関数を作れる
const vector2Model: TypeModel<Vector2> = sentry.objectOf({
    x: sentry.number,
    y: sentry.number
});

// 型注釈なしでも型変換は可能
const itemModel = sentry.objectOf({
    id: sentry.string,
    count: sentry.unionOf(sentry.int.nonNaN(), sentry.bigint),
    components: sentry.objectOf({
        attributes: sentry.setOf(sentry.string),
        uuid: sentry.tupleOf(sentry.int.nonNaN(), sentry.int.nonNaN(), sentry.int.nonNaN(), sentry.int.nonNaN())
    })
});

let x: unknown;
let y: unknown;

if (vector2Model.test(x)) {
    // unknown -> Vector2 に型変換される
}

if (itemModel.test(y)) {
    // unknown -> { id: string; count: number | bigint; components: { attributes: Set<string>; uuid: [number, number, number, number] } } に型変換される, たとえばcountがNaNだったり小数だったりすると実行時エラー
}
```

### 型定義に使えるもの

#### `boolean`
```ts
sentry.boolean // boolean
```

#### `number`
```ts
sentry.number // number
sentry.number.nonNaN() // number, 実行時にNaNチェック付き
sentry.number.int() // number, 実行時に整数チェック付き
sentry.number.int().nonNaN() // number, 実行時にNaNチェック・整数チェック付き
```

#### `string`
```ts
sentry.string // string
sentry.string.withLength({ min: number; max: number }) // string, 実行時に文字列長チェック付き
sentry.string.withPattern(RegExp) // string, 実行時に正規表現チェック付き
sentry.string.withLength({ min: number; max: number }).withPattern(RegExp) // string, 実行時に文字列長チェック・正規表現チェック付き
```

#### `bigint`
```ts
sentry.bigint // bigint
```

#### `function`
```ts
sentry.function // function, 実行時に引数と返り値の型チェックができないのでこれ以上の機能はなし
```

#### `symbol`
```ts
sentry.symbol // symbol
```

#### `null`
```ts
sentry.null // null
```

#### `undefined`
```ts
sentry.undefined // undefined
```

#### `void`
```ts
sentry.void // void, 今のところ実行時に限ってはundefinedとの違いはない
```

#### `any`
```ts
sentry.any // any, 型チェックでは常にtrueを返す
```

#### `never`
```ts
sentry.never // never, 型チェックでは常にfalseを返す
```

#### `objectOf()`
```ts
sentry.objectOf({ [string | number | symbol]: TypeModel<any> }) // object(連想配列), nullは含まない, 引数は{ キー文字列1: 値の型1, キー文字列2: 値の型2, ... }の形式
sentry.objectOf({ [string | number | symbol]: TypeModel<any> }).exact() // object(連想配列), 実行時に被チェックオブジェクトが余計なキーを含んでいることを認めない
```

#### `arrayOf()`
```ts
sentry.arrayOf(TypeModel<any>) // array(配列), 引数は要素の型
sentry.arrayOf(TypeModel<any>).withLength({ min: number; max: number }) // array(配列), 実行時に配列長チェック付き
```

#### `tupleOf()`
```ts
sentry.tupleOf(...TypeModel<any>[]) // tuple(タプル), 引数は要素の型を左から順に並べる
```

#### `mapOf()`
```ts
sentry.mapOf(TypeModel<any>, TypeModel<any>) // Map, 第一引数がキーで第二引数が値
```

#### `setOf()`
```ts
sentry.setOf(TypeModel<any>) // Set, 引数は要素の型
```

#### `unionOf()`
```ts
sentry.unionOf(...TypeModel<any>) // union(ユニオン型), 引数は含める型を羅列
```

#### `intersectionOf()`
```ts
sentry.intersectionOf(...TypeModel<any>) // intersection(交差型), 引数は含める型を羅列
```

#### `optionalOf()`
```ts
sentry.optionalOf(TypeModel<any>) // optional型, undefinedとのユニオン型のエイリアス, 引数はundefinedとのユニオンにする型
```

#### `nullableOf()`
```ts
sentry.nullableOf(TypeModel<any>) // nullable型, nullとのユニオン型のエイリアス, 引数はnullとのユニオンにする型
```

#### `literalOf()`
```ts
sentry.literalOf(U extends string | number | boolean | bigint | symbol) // literal型, リテラル値を型として扱うための関数, 引数は型にしたいリテラル
```

#### `classOf()`
```ts
sentry.classOf(U extends Function) // 任意のクラス型, 引数はクラスオブジェクト(Function)
```

### TypeModelの継承

型はクラスの継承という方法でも一応作れはする、冗長だけど

```ts
import { sentry, TypeModel } from "./TypeSentry";

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

class Vector3Model extends TypeModel<Vector3> {
    private constructor() {
        super();
    }

    public override test(x: unknown): x is Vector3 {
        return sentry.objectOf({
            x: sentry.number.nonNaN(),
            y: sentry.number.nonNaN(),
            z: sentry.number.nonNaN()
        }).exact().test(x);
    }

    // cast()はtest()の実装に依存しているのでオーバーライドの必要はない

    public static readonly INSTANCE: Vector3Model = new this();
}

if (Vector3Model.INSTANCE.test({ x: 0, y: 1, z: -2 })) {
    // ok
}
```

> [!WARNING]
> このライブラリの弱点としては循環定義ができないこと
> ```ts
> interface Foo {
>     foo: Foo
> }
> ```
> みたいなのは定義できない

## License
[MIT LICENSE](/LICENSE)

## Author
- twitter(x): [Takenoko_4096](x.com/Takenoko_4096)
- discord: takenoko_4096
