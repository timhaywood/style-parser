import { createParsers, parseMarkdown } from './beta';

test('correctly create parsers', () => {
  const markdown = `# hello!

this next word will be *bold*
and this one will be _italic_

but check this one out:

i will be ==highlighted==!!!`;

  const parsers = createParsers([
    {
      name: 'highlight',
      matcher: /==(.+?)==/g,
      styles: { fillColor: [1, 1, 0] },
    },
  ]);

  const { cleaned, transforms } = parseMarkdown(markdown, parsers);

  expect(cleaned).toBe(`hello!

this next word will be bold
and this one will be italic

but check this one out:

i will be highlighted!!!`);

  const str = (v: string) => [cleaned.indexOf(v), v.length];

  expect(transforms).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', ...str(`hello!`)] },
    { method: 'setFontSize', args: [72, ...str(`hello!`)] },
    { method: 'setFont', args: ['Menlo-Bold', ...str(`bold`)] },
    { method: 'setFont', args: ['Menlo-Italic', ...str(`italic`)] },
    { method: 'setFillColor', args: [[1, 1, 0], ...str(`highlighted`)] },
  ]);
});

//

test('correctly overwrites *bold* parser', () => {
  const parsers = createParsers([
    {
      name: 'bold',
      styles: { fillColor: [1, 1, 0] },
    },
    {
      name: 'italic',
      matcher: /==(.+?)==/g, // TODO: do we want to allow user to overwrite standard markdown matchers?
      styles: { fillColor: [1, 1, 0] },
    },
  ]);

  expect(parsers.find((p) => p.name === 'bold')).toEqual({
    style: 'bold',
    matcher: /\*(.*?)\*/g,
    styles: { fillColor: [1, 1, 0] },
  });
});

//

test.skip('correctly create parsers', () => {
  const parsers = createParsers();
  expect(parsers).toStrictEqual([
    {
      style: 'bold',
      matcher: /\*(.*?)\*/g,
      styles: { font: 'Menlo-Bold' },
    },
    {
      style: 'italic',
      matcher: /_(.*?)_/g,
      styles: { font: 'Menlo-Italic' },
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
  const { transforms } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(transforms).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', 15, 4] },
    { method: 'setFont', args: ['Menlo-Italic', 39, 6] },
  ]);
});
