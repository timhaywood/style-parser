import { createParsers, parseMarkdown } from './beta';

test('correctly create parsers', () => {
  const parsers = createParsers();
  expect(parsers).toStrictEqual([
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
  ]);
});

test('correctly parses styles', () => {
  const { cleaned } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(cleaned).toStrictEqual(
    `This should be bold and this should be italic`
  );
});

test('correctly parses methods', () => {
  const { methods } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(methods).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', 15, 4] },
    { method: 'setFont', args: ['Menlo-Italic', 39, 6] },
  ]);
});
