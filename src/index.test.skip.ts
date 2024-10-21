import { parseStyles, styleByIndex, styleBySearch } from './index';

test('correctly parses styles', () => {
  expect(
    parseStyles(`This should be *bold*
and this _should italics_ be`)
  ).toStrictEqual([
    { content: 'This should be', line: 0, style: 'regular' },
    { content: 'bold', line: 0, style: 'bold' },
    { content: 'and this', line: 1, style: 'regular' },
    { content: 'should italics', line: 1, style: 'italics' },
    { content: 'be', line: 1, style: 'regular' },
  ]);
});

test('correctly styles by search', () => {
  expect(
    styleBySearch(
      `This should be bold
and this should italics be`,
      { boldString: 'bold', italicsString: 'should italics' }
    )
  ).toStrictEqual([
    { content: 'This should be', line: 0, style: 'regular' },
    { content: 'bold', line: 0, style: 'bold' },
    { content: 'and this', line: 1, style: 'regular' },
    { content: 'should italics', line: 1, style: 'italics' },
    { content: 'be', line: 1, style: 'regular' },
  ]);
});

test('correctly styles by index', () => {
  expect(
    styleByIndex(
      `This should be bold
  and this italics be`,
      { boldIndexes: [3], italicsIndexes: [6] }
    )
  ).toStrictEqual([
    { content: 'This should be', line: 0, style: 'regular' },
    { content: 'bold', line: 0, style: 'bold' },
    { content: 'and this', line: 1, style: 'regular' },
    { content: 'should italics', line: 1, style: 'italics' },
    { content: 'be', line: 1, style: 'regular' },
  ]);
});
