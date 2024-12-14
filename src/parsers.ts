import { FontMap } from './types';

export const parsers = (fontMap: FontMap) =>
  [
    {
      name: 'bold',
      matcher: /\*(.*?)\*/g,
      styles: {
        font: fontMap.bold,
      },
    },
    {
      name: 'italic',
      matcher: /_(.*?)_/g,
      styles: {
        font: fontMap.italic,
      },
    },
    {
      name: 'h1',
      matcher: /^#\s+(.*)/gm,
      styles: {
        font: fontMap.bold,
        fontSize: 72,
      },
    },
    {
      name: 'h2',
      matcher: /^##\s+(.*)/gm,
      styles: {
        font: fontMap.bold,
        fontSize: 60,
      },
    },
    {
      name: 'h3',
      matcher: /^###\s+(.*)/gm,
      styles: {
        font: fontMap.bold,
        fontSize: 48,
      },
    },
    {
      name: 'h4',
      matcher: /^####\s+(.*)/gm,
      styles: {
        font: fontMap.bold,
        fontSize: 44,
      },
    },
    {
      name: 'h5',
      matcher: /^#####\s+(.*)/gm,
      styles: {
        font: fontMap.bold,
        fontSize: 42,
      },
    },
    {
      name: 'h6',
      matcher: /^######\s+(.*)/gm,
      styles: {
        font: fontMap.bold,
        fontSize: 40,
      },
    },
  ] as const;
