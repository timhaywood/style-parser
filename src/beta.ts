export const version: string = '_npmVersion';

import { Layer } from 'expression-globals-typescript';

type Parser = { style: string; matcher: RegExp; transforms: Transform[] };
type Transform = { method: string; value: any };
type Method = { method: string; args: any[] };

export function parse(markdown: string, customParsers: Parser[]) {
  const parsers = createParsers(customParsers);
  const { cleaned, methods } = parseMarkdown(markdown, parsers);
  return createRender(cleaned, methods);
}

export function parseMarkdown(
  markdown: string,
  parsers: Parser[] = createParsers()
): { cleaned: string; methods: Method[] } {
  const methods: Method[] = [];

  const allMatches: { match: RegExpExecArray; parser: Parser }[] = [];

  parsers.forEach((parser) => {
    const matches = [...markdown.matchAll(parser.matcher)];
    allMatches.push(...matches.map((match) => ({ match, parser })));
  });

  allMatches.sort((a, b) => a.match.index - b.match.index);

  let cleaned = markdown;
  let removedChars = 0;

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

// TODO: be sure that custom parsers overwrite default parser...
export function createParsers(customParsers?: Parser[]): Parser[] {
  const parsers: Parser[] = [
    {
      style: 'bold',
      matcher: /\*(.*?)\*/g,
      transforms: [{ method: 'setFont', value: 'Menlo-Bold' }],
    },
    {
      style: 'italic',
      matcher: /_(.*?)_/g,
      transforms: [{ method: 'setFont', value: 'Menlo-Italic' }],
    },
    {
      style: 'h1',
      matcher: /^#\s+(.*)/g,
      transforms: [
        { method: 'setFont', value: 'Menlo-Bold' },
        { method: 'setFontSize', value: 72 },
      ],
    },
    {
      style: 'h2',
      matcher: /^##\s+(.*)/g,
      transforms: [
        { method: 'setFont', value: 'Menlo-Bold' },
        { method: 'setFontSize', value: 60 },
      ],
    },
    {
      style: 'h3',
      matcher: /^###\s+(.*)/g,
      transforms: [
        { method: 'setFont', value: 'Menlo-Bold' },
        { method: 'setFontSize', value: 48 },
      ],
    },
    {
      style: 'h4',
      matcher: /^####\s+(.*)/g,
      transforms: [
        { method: 'setFont', value: 'Menlo-Bold' },
        { method: 'setFontSize', value: 44 },
      ],
    },
    {
      style: 'h5',
      matcher: /^#####\s+(.*)/g,
      transforms: [
        { method: 'setFont', value: 'Menlo-Bold' },
        { method: 'setFontSize', value: 42 },
      ],
    },
    {
      style: 'h6',
      matcher: /^######\s+(.*)/g,
      transforms: [
        { method: 'setFont', value: 'Menlo-Bold' },
        { method: 'setFontSize', value: 40 },
      ],
    },
  ];

  const markdownParsers = parsers.map((parser) => {
    const customTransform = customParsers?.find(
      (ct) => ct.style === parser.style
    );
    return {
      ...parser,
      transforms: customTransform
        ? customTransform.transforms
        : parser.transforms,
    };
  });

  return [...markdownParsers, ...(customParsers ?? [])];
}

export function createRender(
  cleanString: string,
  methods: Method[],
  defaultStyles: Method[] = [
    { method: 'setFont', args: ['Menlo-Regular'] },
    { method: 'setFontSize', args: [40] },
  ]
) {
  const thisLayer = new Layer();
  if (!thisLayer.text) throw `${thisLayer.name} is not a TextLayer!`;

  let expression = 'thisLayer.text.sourceText.createStyle()';

  [...defaultStyles, ...methods].forEach(({ method, args }) => {
    const argsString = args.map((arg) => JSON.stringify(arg)).join(', ');
    expression += `.${method}(${argsString})`;
  });

  return () => eval(expression).setText(cleanString);
}

// // Example usage
// const markdown = `
// # Heading 1
// This is a *bold* text and _italic_ text.
// ## Heading 2
// `;

const customTransforms = [
  {
    style: 'highlight',
    matcher: /==(.+?)==/g,
    transforms: [
      { method: 'setFillColor', value: [1, 1, 0, 1] }, // Yellow background
    ],
  },
] as Parser[];

// const parsers = createParsers(customTransforms);
// const methods = parseMarkdown(markdown, parsers);
// createTextDocument(markdown, methods);