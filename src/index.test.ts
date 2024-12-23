import { createParsers, helpers, parseMarkdown } from '.';
import { Plugin, Transform } from './types';

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

  const { text, transforms } = parseMarkdown(markdown, parsers);

  expect(text).toBe(`hello!

this next word will be bold
and this one will be italic

but check this one out:

i will be highlighted!!!`);

  const str = (v: string) => [text.indexOf(v), v.length];

  expect(transforms).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', ...str(`hello!`)] },
    { method: 'setFontSize', args: [72, ...str(`hello!`)] },
    { method: 'setFont', args: ['Menlo-Bold', ...str(`bold`)] },
    { method: 'setFont', args: ['Menlo-Italic', ...str(`italic`)] },
    { method: 'setFillColor', args: [[1, 1, 0], ...str(`highlighted`)] },
  ]);
});

//

test('correctly overwrites *bold* parser style', () => {
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
    name: 'bold',
    matcher: /\*(.*?)\*/g,
    styles: { fillColor: [1, 1, 0], font: 'Menlo-Bold' },
  });
});

//

test('correctly uses custom font map', () => {
  const parsers = createParsers(undefined, {
    bold: 'Font-Bold',
  });

  expect(parsers.find((p) => p.name === 'bold')).toEqual({
    name: 'bold',
    matcher: /\*(.*?)\*/g,
    styles: { font: 'Font-Bold' },
  });
});

//

test('correctly creates default parsers', () => {
  const parsers = createParsers();
  expect(parsers.slice(0, 2)).toStrictEqual([
    {
      name: 'bold',
      matcher: /\*(.*?)\*/g,
      styles: { font: 'Menlo-Bold' },
    },
    {
      name: 'italic',
      matcher: /_(.*?)_/g,
      styles: { font: 'Menlo-Italic' },
    },
    // other default parsers...
  ]);
});

test('correctly cleans text', () => {
  const { text } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(text).toStrictEqual(`This should be bold and this should be italic`);
});

test('correctly generates transforms', () => {
  const { transforms } = parseMarkdown(
    `This should be *bold* and this should be _italic_`,
    createParsers()
  );

  expect(transforms).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', 15, 4] },
    { method: 'setFont', args: ['Menlo-Italic', 39, 6] },
  ]);
});

test('correctly handles a simple plugin', () => {
  const markdown = 'This is a *sample* markdown text with _some_ formatting.';

  let parsed = parseMarkdown(markdown);

  const plugins: Plugin[] = [
    {
      name: 'capitalize',
      transform: (parsed) => {
        const capitalizedText = parsed.text.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );

        return {
          text: capitalizedText,
          transforms: parsed.transforms,
        };
      },
    },
  ];

  for (const plugin of plugins) {
    parsed = plugin.transform(parsed, helpers);
  }

  expect(parsed.text).toBe(
    'This Is A Sample Markdown Text With Some Formatting.'
  );
});

test('correctly handles a slightly more complex plugin', () => {
  const markdown = 'This is a *sample* markdown text with _some_ formatting.';

  let parsed = parseMarkdown(markdown);

  const plugins: Plugin[] = [
    {
      name: 'remove-vowels',
      transform: (parsed) => {
        const vowels = /[aeiou]/gi;
        let newText = '';
        let removedChars = 0;
        const updatedTransforms: Transform<any>[] = [];

        // Iterate through each character in the text
        for (let i = 0; i < parsed.text.length; i++) {
          const char = parsed.text[i];
          if (!vowels.test(char)) {
            newText += char;
          } else {
            removedChars++;
          }

          // Update transforms that start at or after this index
          parsed.transforms.forEach((transform) => {
            const [value, start = 0, length = 0] = transform.args;
            if (start === i) {
              const newStart = start - removedChars;
              const newLength = length - (vowels.test(char) ? 1 : 0);
              updatedTransforms.push({
                ...transform,
                args: [value, newStart, newLength],
              });
            }
          });
        }

        // Handle transforms that haven't been processed (those starting after the text end)
        parsed.transforms.forEach((transform) => {
          const [value, start = 0, length = 0] = transform.args;
          if (start >= parsed.text.length) {
            updatedTransforms.push({
              ...transform,
              args: [value, start - removedChars, length],
            });
          }
        });

        return {
          text: newText,
          transforms: updatedTransforms,
        };
      },
    },
  ];

  for (const plugin of plugins) {
    parsed = plugin.transform(parsed, helpers);
  }

  expect(parsed.text).toBe('Ths s  smpl mrkdwn txt wth sm frmttng.');
  expect(parsed.transforms).toStrictEqual([
    { method: 'setFont', args: ['Menlo-Bold', 7, 6] }, // "smpl"
    { method: 'setFont', args: ['Menlo-Italic', 27, 4] }, // "sm"
  ]);
});
