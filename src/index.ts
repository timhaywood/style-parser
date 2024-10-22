export const version: string = '_npmVersion';

import { Layer } from 'expression-globals-typescript';
import { parsers } from './parsers';
import { MarkdownParser, Parser, Style, StyleMethod, Transform } from './types';

const thisLayer = new Layer();

//

export function parse(markdown: string, customParsers?: Parser[]) {
  const allParsers = createParsers(customParsers);
  const { cleaned, transforms } = parseMarkdown(markdown, allParsers);
  return createRender(cleaned, transforms);
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

export function createParsers(customParsers: (Parser | MarkdownParser)[] = []) {
  const mergedStyles = parsers.map((parser) => {
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
  transforms: Transform<any>[]
) {
  if (!thisLayer.text) throw `${thisLayer.name} is not a TextLayer!`;

  const style = thisLayer.text.sourceText.style;

  return transforms
    .reduce((textStyle, { method, args }) => {
      // @ts-expect-error "Expected 1 arguments, but got 3.ts(2554)" (new AE API expects 3 arguments)
      return textStyle[method as StyleMethod](...args);
    }, style)
    .setText(cleanString);
}

//

function styleToStyleMethod(style: Style) {
  const upper = style.charAt(0).toUpperCase();
  return `set${upper}${style.slice(1)}` as StyleMethod;
}
