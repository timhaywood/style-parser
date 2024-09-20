import { createParsers, parseMarkdown } from './beta';

test('correctly create parsers', () => {
  const markdown = `# hello!

this next word will be *bold*
and this one will be _italic_

but check this one out:

i will be ==highlighted==!!!`;

  const parsers = createParsers([
    {
      style: 'highlight',
      matcher: /==(.+?)==/g,
      transforms: [{ method: 'setFillColor', value: [1, 1, 0, 1] }],
    },
  ]);

  const { cleaned, methods } = parseMarkdown(markdown, parsers);

  expect(cleaned).toBe(`hello!

this next word will be bold
and this one will be italic

but check this one out:

i will be highlighted!!!`);

  const str = (v: string) => [cleaned.indexOf(v), v.length];

  expect(methods).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', ...str(`hello!`)] },
    { method: 'setFontSize', args: [72, ...str(`hello!`)] },
    { method: 'setFont', args: ['Menlo-Bold', ...str(`bold`)] },
    { method: 'setFont', args: ['Menlo-Italic', ...str(`italic`)] },
    { method: 'setFillColor', args: [[1, 1, 0, 1], ...str(`highlighted`)] },
  ]);
});

//

test.skip('correctly create parsers', () => {
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

test.skip('correctly parses styles', () => {
  const { cleaned } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(cleaned).toStrictEqual(
    `This should be bold and this should be italic`
  );
});

test.skip('correctly parses methods', () => {
  const { methods } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(methods).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', 15, 4] },
    { method: 'setFont', args: ['Menlo-Italic', 39, 6] },
  ]);
});
