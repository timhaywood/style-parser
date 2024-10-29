export const version: string = '_npmVersion';

import { Layer, TextStyle } from 'expression-globals-typescript';
import { parsers } from './parsers';
import {
  FontMap,
  MarkdownParser,
  Parser,
  Style,
  StyleMethod,
  Transform,
} from './types';

const thisLayer = new Layer();

//

type ParseOptions = {
  parsers?: Parser[];
  fontMap?: Partial<FontMap>;
  textStyle?: TextStyle;
};

export function parse(
  markdown: string,
  { fontMap, parsers, textStyle }: ParseOptions | undefined = {}
) {
  const allParsers = createParsers(parsers, fontMap);
  const { cleaned, transforms } = parseMarkdown(markdown, allParsers);
  return createRender(cleaned, transforms, textStyle);
}

export function parseMarkdown(
  markdown: string,
  parsers: Parser[] = createParsers()
) {
  const allMatches: { match: RegExpExecArray; parser: Parser }[] = [];

  parsers.forEach((parser) => {
    const matches = [...markdown.matchAll(parser.matcher)]
      .filter((match): match is RegExpExecArray => match.index !== undefined)
      .map((match) => ({ match, parser }));
    allMatches.push(...matches);
  });

  allMatches.sort((a, b) => a.match.index - b.match.index);

  let cleaned = markdown;
  let removedChars = 0;
  const transforms: Transform<any>[] = [];

  allMatches.forEach(({ match, parser }) => {
    const start = match.index!;
    const rawMatch = match[0];
    const content = match[1];

    for (const style in parser.styles) {
      const value = parser.styles[style as Style];
      transforms.push({
        method: styleToStyleMethod(style as Style),
        args: [value, start - removedChars, content.length],
      });
    }

    removedChars += rawMatch.length - content.length;
    cleaned = cleaned.replace(rawMatch, content);
  });

  return { cleaned, transforms };
}

export function createParsers(
  customParsers: (Parser | MarkdownParser)[] = [],
  fontMap?: Partial<FontMap>
) {
  const defaultFonts: FontMap = {
    bold: 'Menlo-Bold',
    italic: 'Menlo-Italic',
    regular: 'Menlo-Regular',
  };

  // Override the default fonts with any custom ones
  const fonts = { ...defaultFonts, ...fontMap };

  const mergedStyles = parsers(fonts).map((parser) => {
    const custom = customParsers.find(
      (customParser) => customParser.name === parser.name
    );
    return {
      name: parser.name,
      // Override default matchers with custom ones if present
      matcher: custom && 'matcher' in custom ? custom.matcher : parser.matcher,
      // Merge custom styles with default ones
      styles: custom ? { ...parser.styles, ...custom.styles } : parser.styles,
    } as Parser;
  });

  const customStyles = customParsers.filter(
    (customParser) => !mergedStyles.some((mp) => mp.name === customParser.name)
  ) as Parser[];

  return [...mergedStyles, ...customStyles];
}

export function createRender(
  cleanString: string,
  transforms: Transform<any>[],
  textStyle?: TextStyle
) {
  let rootStyle = textStyle;
  if (rootStyle === undefined && thisLayer.text !== undefined) {
    // No custom style passed, used the one from the current layer
    rootStyle = thisLayer.text.sourceText.style;
  } else if (rootStyle === undefined) {
    // If it's not a text layer, throw an error
    throw `Error accessing default text style, this layer is not a text layer`;
  }

  return transforms
    .reduce((style, { method, args }) => {
      // @ts-expect-error "Expected 1 arguments, but got 3.ts(2554)" (new AE API expects 3 arguments)
      return style[method as StyleMethod](...args);
    }, rootStyle)
    .setText(cleanString);
}

//

function styleToStyleMethod(style: Style) {
  const upper = style.charAt(0).toUpperCase();
  return `set${upper}${style.slice(1)}` as StyleMethod;
}
