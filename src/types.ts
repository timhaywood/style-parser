import { TextStyle } from 'expression-globals-typescript';
import { parsers } from './parsers';

export type StyleMethod = Setters<TextStyle>;
export type Style = Styles<TextStyle>;

export type StyleDefinition = {
  [K in Style]?: Value<MethodMap<TextStyle>[`set${Capitalize<K>}`]>;
};

type Font = 'regular' | 'bold' | 'italic';
export type FontMap = Record<Font, string>;

export type Parser = {
  name: string;
  matcher: RegExp;
  styles: StyleDefinition;
};

export type MarkdownStyle = typeof parsers[number]['name'];
export type MarkdownParser = Omit<Parser, 'matcher'> & { name: MarkdownStyle };

export type Transform<M extends StyleMethod> = {
  method: M;
  args: [Value<MethodMap<TextStyle>[M]>, number?, number?];
};

//

type Setters<T> = keyof T extends infer K
  ? K extends `set${string}`
    ? K
    : never
  : never;

type Styles<T> = Setters<T> extends infer K
  ? K extends `set${infer Rest}`
    ? Uncapitalize<Rest>
    : never
  : never;

type MethodMap<T> = { [K in Setters<T>]: T[K] };
type Value<T> = T extends (arg: infer A, ...args: any[]) => any ? A : never;
