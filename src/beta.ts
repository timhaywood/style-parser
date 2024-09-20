export const version: string = '_npmVersion';

import { Layer } from 'expression-globals-typescript';

type Parser = { style: string; matcher: RegExp; transforms: Transform[] };
type Transform = { method: string; value: any };
type Method = { method: string; args: any[] };

type Options = {
  markdown: string;
  parsers: Parser[];
  fontMap: FontMap;
  baseStyles: Method[];
};

export function parse({
  markdown,
  parsers,
  fontMap = fonts,
  baseStyles,
}: Options) {
  const _parsers = createParsers(parsers);
  const { cleaned, methods } = parseMarkdown(markdown, _parsers);
  return createRender(cleaned, methods, fontMap, baseStyles);
}

export function parseMarkdown(
  markdown: string,
  parsers: Parser[] = createParsers()
): { cleaned: string; methods: Method[] } {
  const allMatches: { match: RegExpExecArray; parser: Parser }[] = [];

  parsers.forEach((parser) => {
    const matches = [...markdown.matchAll(parser.matcher)];
    allMatches.push(...matches.map((match) => ({ match, parser })));
  });

  allMatches.sort((a, b) => a.match.index - b.match.index);

  let cleaned = markdown;
  let removedChars = 0;
  const methods: Method[] = [];

  allMatches.forEach(({ match, parser }) => {
    const start = match.index!;
    const rawMatch = match[0];
    const content = match[1];

    parser.transforms.forEach((transform) => {
      methods.push({
        method: transform.method,
        args: [transform.value, start - removedChars, content.length],
      });
    });

    removedChars += rawMatch.length - content.length;
    cleaned = cleaned.replace(rawMatch, content);
  });

  return { cleaned, methods };
}

type FontMap = Record<'regular' | 'bold' | 'italic', string>;
export const fonts: FontMap = {
  regular: 'Menlo-Regular', // 'CascadiaCode-Regular',
  bold: 'Menlo-Bold', // 'CascadiaCodeRoman-Bold',
  italic: 'Menlo-Italic', // 'CascadiaCode-Italic',
};

function mapToFont(methods: Method[], fonts: FontMap) {
  for (const method of methods) {
    method.args = method.args.map((a) =>
      typeof a === 'string'
        ? a.replace(/%(\w+)%/, (_, key) => fonts[key as keyof typeof fonts])
        : a
    );
  }
  return methods;
}

export const parsers = [
  {
    style: 'bold',
    matcher: /\*(.*?)\*/g,
    transforms: [{ method: 'setFont', value: '%bold%' }],
  },
  {
    style: 'italic',
    matcher: /_(.*?)_/g,
    transforms: [{ method: 'setFont', value: '%italic%' }],
  },
  {
    style: 'h1',
    matcher: /^#\s+(.*)/gm,
    transforms: [
      { method: 'setFont', value: '%bold%' },
      { method: 'setFontSize', value: 72 },
    ],
  },
  {
    style: 'h2',
    matcher: /^##\s+(.*)/gm,
    transforms: [
      { method: 'setFont', value: '%bold%' },
      { method: 'setFontSize', value: 60 },
    ],
  },
  {
    style: 'h3',
    matcher: /^###\s+(.*)/gm,
    transforms: [
      { method: 'setFont', value: '%bold%' },
      { method: 'setFontSize', value: 48 },
    ],
  },
  {
    style: 'h4',
    matcher: /^####\s+(.*)/gm,
    transforms: [
      { method: 'setFont', value: '%bold%' },
      { method: 'setFontSize', value: 44 },
    ],
  },
  {
    style: 'h5',
    matcher: /^#####\s+(.*)/gm,
    transforms: [
      { method: 'setFont', value: '%bold%' },
      { method: 'setFontSize', value: 42 },
    ],
  },
  {
    style: 'h6',
    matcher: /^######\s+(.*)/gm,
    transforms: [
      { method: 'setFont', value: '%bold%' },
      { method: 'setFontSize', value: 40 },
    ],
  },
] as const;

type MarkdownStyle = typeof parsers[number]['style'];
type MarkdownParser = Omit<Parser, 'matcher'> & { style: MarkdownStyle };

export function createParsers(
  customParsers?: (Parser | MarkdownParser)[]
): Parser[] {
  const markdownParsers = parsers.map((parser) => {
    const customTransform = customParsers?.find(
      (ct) => ct.style === parser.style
    );
    // if (customTransform) remove from customParers[] ?
    return {
      ...parser,
      transforms: customTransform
        ? customTransform.transforms
        : parser.transforms,
    } as Parser;
  });

  // TODO: seems like we're adding customParers twice... see comment above
  return [...markdownParsers, ...((customParsers ?? []) as Parser[])];
}

export function createRender(
  cleanString: string,
  methods: Method[],
  fontMap: FontMap = fonts,
  baseStyles: Method[] = [
    { method: 'setFont', args: ['%regular%'] },
    { method: 'setFontSize', args: [40] },
  ]
) {
  const thisLayer = new Layer();
  if (!thisLayer.text) throw `${thisLayer.name} is not a TextLayer!`;

  let expression = 'thisLayer.text.sourceText.createStyle()';

  mapToFont([...baseStyles, ...methods], fontMap).forEach(
    ({ method, args }) => {
      const argsString = args.map((arg) => JSON.stringify(arg)).join(', ');
      expression += `.${method}(${argsString})`;
    }
  );

  return () => eval(expression).setText(cleanString);
}
