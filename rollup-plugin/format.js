// https://github.com/vvakame/typescript-formatter/tree/master/lib
import * as ts from 'typescript';

const defaultOptions = {
  baseIndentSize: 0,
  indentSize: 2,
  tabSize: 2,
  indentStyle: ts.IndentStyle.Smart,
  newLineCharacter: '\r\n',
  convertTabsToSpaces: true,
  insertSpaceAfterCommaDelimiter: true,
  insertSpaceAfterSemicolonInForStatements: true,
  insertSpaceBeforeAndAfterBinaryOperators: true,
  insertSpaceAfterConstructor: false,
  insertSpaceAfterKeywordsInControlFlowStatements: true,
  insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
  insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
  insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
  insertSpaceAfterTypeAssertion: false,
  insertSpaceBeforeFunctionParenthesis: false,
  placeOpenBraceOnNewLineForFunctions: false,
  placeOpenBraceOnNewLineForControlBlocks: false,
  insertSpaceBeforeTypeAnnotation: false,
};

class LanguageServiceHost {
  constructor() {
    this.files = {};
    // for ts.LanguageServiceHost
    this.getCompilationSettings = () => ts.getDefaultCompilerOptions();
    this.getScriptFileNames = () => Object.keys(this.files);
    this.getScriptVersion = (_fileName) => '0';
    this.getScriptSnapshot = (fileName) => this.files[fileName];
    this.getCurrentDirectory = () => process.cwd();
    this.getDefaultLibFileName = (options) => ts.getDefaultLibFilePath(options);
  }
  addFile(fileName, text) {
    this.files[fileName] = ts.ScriptSnapshot.fromString(text);
  }
}

export function format(text, fileName = 'temp.ts', options = defaultOptions) {
  const host = new LanguageServiceHost();
  host.addFile(fileName, text);

  const languageService = ts.createLanguageService(host);
  const edits = languageService.getFormattingEditsForDocument(
    fileName,
    options
  );

  edits
    .sort((a, b) => a.span.start - b.span.start)
    .reverse()
    .forEach((edit) => {
      const head = text.slice(0, edit.span.start);
      const tail = text.slice(edit.span.start + edit.span.length);
      text = `${head}${edit.newText}${tail}`;
    });

  return text;
}
