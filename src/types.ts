import { TextStyle } from 'expression-globals-typescript';
import { parsers } from './parsers';
import { Helpers } from '.';

export type StyleProp = Props<TextStyle>;
export type StyleMethod = Methods<TextStyle>;
export type StyleValue<M extends StyleMethod> = Value<MethodMap<TextStyle>[M]>;

export type Styles = {
  [K in StyleProp]?: StyleValue<`set${Capitalize<K>}`>;
};

type FontStyle = 'regular' | 'bold' | 'italic';
export type FontMap = Record<FontStyle, string>;

export type Parser = {
  name: string;
  matcher: RegExp;
  styles: Styles;
};

export type MarkdownStyle = ReturnType<typeof parsers>[number]['name'];
export type MarkdownParser = Omit<Parser, 'matcher'> & { name: MarkdownStyle };

export type Transform<M extends StyleMethod> = {
  method: M;
  args: [StyleValue<M>, number?, number?];
};

//

export type Parsed = { text: string; transforms: Transform<any>[] };

export type Plugin = {
  name: string;
  transform: (parsed: Parsed, helpers: Helpers) => Parsed;
};

//

type Methods<T> = keyof T extends infer K
  ? K extends `set${string}`
    ? K
    : never
  : never;

type Props<T> = Methods<T> extends infer K
  ? K extends `set${infer Rest}`
    ? Uncapitalize<Rest>
    : never
  : never;

type MethodMap<T> = { [K in Methods<T>]: T[K] };
type Value<T> = T extends (arg: infer A, ...args: any[]) => any ? A : never;
