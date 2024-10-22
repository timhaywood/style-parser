const defaultFonts = {
  bold: 'Verdana-Bold',
  italic: 'Verdana-Italic',
} as const;

export const parsers = [
  {
    name: 'bold',
    matcher: /\*(.*?)\*/g,
    styles: {
      font: defaultFonts.bold,
    },
  },
  {
    name: 'italic',
    matcher: /_(.*?)_/g,
    styles: {
      font: defaultFonts.italic,
    },
  },
  {
    name: 'h1',
    matcher: /^#\s+(.*)/gm,
    styles: {
      font: defaultFonts.bold,
      fontSize: 72,
    },
  },
  {
    name: 'h2',
    matcher: /^##\s+(.*)/gm,
    styles: {
      font: defaultFonts.bold,
      fontSize: 60,
    },
  },
  {
    name: 'h3',
    matcher: /^###\s+(.*)/gm,
    styles: {
      font: defaultFonts.bold,
      fontSize: 48,
    },
  },
  {
    name: 'h4',
    matcher: /^####\s+(.*)/gm,
    styles: {
      font: defaultFonts.bold,
      fontSize: 44,
    },
  },
  {
    name: 'h5',
    matcher: /^#####\s+(.*)/gm,
    styles: {
      font: defaultFonts.bold,
      fontSize: 42,
    },
  },
  {
    name: 'h6',
    matcher: /^######\s+(.*)/gm,
    styles: {
      font: defaultFonts.bold,
      fontSize: 40,
    },
  },
] as const;
