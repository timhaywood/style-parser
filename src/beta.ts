export const version: string = '_npmVersion';

import { Layer } from 'expression-globals-typescript';
import {
  StyleMethod,
  Style,
  StyleDefinition,
  Transform,
  Parser,
  MarkdownParser,
} from './types';
import { parsers } from './parsers';

type Options = {
  markdown: string;
  parsers?: Parser[];
  fontMap?: FontMap;
  baseStyles?: StyleDefinition;
};

//

export function parse({ markdown, parsers, fontMap, baseStyles }: Options) {
  const allParsers = createParsers(parsers);
  const { cleaned, transforms } = parseMarkdown(markdown, allParsers);
  return createRender(cleaned, transforms, fontMap, baseStyles);
}

export function parseMarkdown(
  markdown: string,
  parsers: Parser[] = createParsers()
) {
  const allMatches: { match: RegExpExecArray; parser: Parser }[] = [];

  parsers.forEach((parser) => {
    const matches = [...markdown.matchAll(parser.matcher)];
    allMatches.push(...matches.map((match) => ({ match, parser })));
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
      let value = replaceFont(parser.styles[style as Style]);
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

export function createParsers(customParsers: (Parser | MarkdownParser)[] = []) {
  const markdown = parsers.map((parser) => {
    const custom = customParsers.find((ct) => ct.name === parser.name);
    return {
      ...parser,
      styles: custom ? custom.styles : parser.styles,
    } as Parser;
  });

  const filtered = customParsers.filter(
    (customParser) => !markdown.some((mp) => mp.name === customParser.name)
  ) as Parser[];

  return [...markdown, ...filtered];
}

type Font = 'regular' | 'bold' | 'italic';
type FontMap = Record<Font, string>;

export const fonts: FontMap = {
  regular: 'Menlo-Regular', // 'CascadiaCode-Regular',
  bold: 'Menlo-Bold', // 'CascadiaCodeRoman-Bold',
  italic: 'Menlo-Italic', // 'CascadiaCode-Italic',
};

export function createRender(
  cleanString: string,
  transforms: Transform<any>[],
  fontMap: FontMap = fonts,
  baseStyles: StyleDefinition = {
    font: '%regular%',
    fontSize: 40,
  }
) {
  const thisLayer = new Layer();
  if (!thisLayer.text) throw `${thisLayer.name} is not a TextLayer!`;

  const baseTransforms = styleToTransform(baseStyles);
  const allTransforms = mapToFont([...baseTransforms, ...transforms], fontMap);
  const style = thisLayer.text.sourceText.createStyle();

  return () =>
    allTransforms
      .reduce((expression, { method, args }) => {
        // @ts-expect-error "Expected 1 arguments, but got 3.ts(2554)" (new AE API expects 3 arguments)
        return expression[method as StyleMethod](...args);
      }, style)
      .setText(cleanString);
}

//

function replaceFont(arg: any, fontMap: FontMap = fonts) {
  return typeof arg === 'string'
    ? arg.replace(/%(\w+)%/, (_, key) => fontMap[key as keyof typeof fontMap])
    : arg;
}

function mapToFont(transforms: Transform<any>[], fontMap: FontMap) {
  for (const transform of transforms) {
    transform.args = transform.args.map((a) =>
      replaceFont(a, fontMap)
    ) as Transform<any>['args'];
  }
  return transforms;
}

function styleToStyleMethod(style: Style) {
  const upper = style.charAt(0).toUpperCase();
  return `set${upper}${style.slice(1)}` as StyleMethod;
}

function styleToTransform(style: StyleDefinition) {
  return Object.entries(style).flatMap(([style, value]) => {
    const method = styleToStyleMethod(style as Style);
    return value !== undefined ? [{ method, args: [value] }] : [];
  }) as Transform<any>[];
}
