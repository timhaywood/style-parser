export const parsers = [
  {
    name: 'bold',
    matcher: /\*(.*?)\*/g,
    styles: {
      font: '%bold%',
    },
  },
  {
    name: 'italic',
    matcher: /_(.*?)_/g,
    styles: {
      font: '%italic%',
    },
  },
  {
    name: 'h1',
    matcher: /^#\s+(.*)/gm,
    styles: {
      font: '%bold%',
      fontSize: 72,
    },
  },
  {
    name: 'h2',
    matcher: /^##\s+(.*)/gm,
    styles: {
      font: '%bold%',
      fontSize: 60,
    },
  },
  {
    name: 'h3',
    matcher: /^###\s+(.*)/gm,
    styles: {
      font: '%bold%',
      fontSize: 48,
    },
  },
  {
    name: 'h4',
    matcher: /^####\s+(.*)/gm,
    styles: {
      font: '%bold%',
      fontSize: 44,
    },
  },
  {
    name: 'h5',
    matcher: /^#####\s+(.*)/gm,
    styles: {
      font: '%bold%',
      fontSize: 42,
    },
  },
  {
    name: 'h6',
    matcher: /^######\s+(.*)/gm,
    styles: {
      font: '%bold%',
      fontSize: 40,
    },
  },
] as const;
