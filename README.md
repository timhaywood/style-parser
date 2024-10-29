# style-parser

> This project was create with [create-expression-lib](https://github.com/motiondeveloper/create-expression-lib)

## Use the library

1. Download the latest version from the releases page.
2. Import into After Effects and reference in your expressions

Learn more about writing `.jsx` files for After Effects here: https://motiondeveloper.com/blog/write-expressions-external-files/

## Overview

This library takes in a string of markdown, and renders it using the appropriate `set` text style expressions.

```ts
const { parse } = footage('style-parser.jsx').sourceData.get();

parse(value);
```

For example, by default the text wrapped in `*` will be set to a bold font, and text wrapped in `_` will be italicized.

> For the full set of default parsers, see [/src/parsers.ts](src/parsers.ts).

So the following source text:

```txt
This is *a string* of _markdown_
```

Will result in the expression:

```js
text.sourceText.style
  .setFont('Verdana-Bold', 8, 16)
  .setFont('Verdana-Italic', 20, 8)
  .setText('This is a string of markdown');
```

## API

### Parse function

```ts
parse(markdown: string, {
  parsers?: Parser[],
  fontMap?: FontMap,
  textStyle?: TextStyle
}): TextStyle;
```

### `parsers`

```ts
type Parser = {
  name: string;
  matcher?: RegExp;
  styles: StyleDefinition;
};
```

`StyleDefintion` is an object, where each property is a settable [`TextStyle`](https://docs.motiondeveloper.com/classes/textstyle) attribute with an equivalent value type. For example:

```ts
parse(value, {
  parsers: [
    { name: 'bold', styles: { fontSize: 40, fillColor: [1, 0, 0, 1] } },
    { name: 'italic', styles: { fontName: 'Arial-Italic ' } },
    { name: 'wide', matcher: /~(.*?)~/g, styles: { tracking: 130 } },
  ],
});
```

### `fontMap`

```ts
type FontMap = {
  regular?: string;
  bold?: string;
  italic?: string;
};
```

To avoid having to manually set the `fontName` for multiple styles (such as bold and all the headings), you can pass in a `fontMap` object that will be used to set the default fonts for each parser. For example:

```ts
parse(value, { fontMap: { bold: 'Menlo-Bold' } });
```

Will set the `fontName` for all the bold parsers to 'Menlo-Bold'.

### `textStyle`

```ts
// typeof thisLayer.text.sourceText.style
type textStyle = TextStyle;
```

By default, the `parse` function will apply the default text style from the current layer. You can pass in a custom text style if you want to modify the default styles, or inherit them from another layer. For example:

```ts
// Modify the current style
const textStyle = thisLayer.text.sourceText.style.setLeading(20);
parse(value, { textStyle });
```
