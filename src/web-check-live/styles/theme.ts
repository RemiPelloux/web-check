import { createTheme, MantineColorsTuple } from '@mantine/core';

const monacoRed: MantineColorsTuple = [
  '#fff1f2',
  '#ffe4e6',
  '#fecdd3',
  '#fda4af',
  '#fb7185',
  '#f43f5e',
  '#dc2626',
  '#b91c1c',
  '#991b1b',
  '#7f1d1d',
];

const monacoGray: MantineColorsTuple = [
  '#f9fafb',
  '#f3f4f6',
  '#e5e7eb',
  '#d1d5db',
  '#9ca3af',
  '#6b7280',
  '#4b5563',
  '#374151',
  '#1f2937',
  '#111827',
];

const theme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  headings: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif' },
  defaultGradient: { from: monacoRed[6], to: monacoRed[7], deg: 135 },
  colors: {
    'monaco-red': monacoRed,
    'monaco-gray': monacoGray,
  },
  primaryColor: 'monaco-red',
  primaryShade: 6,
  components: {
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        padding: 'lg',
        shadow: 'sm',
      },
      styles: () => ({
        root: {
          backgroundColor: 'var(--background-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-color)',
        },
      }),
    },
    Badge: {
      styles: () => ({
        root: {
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
          color: 'var(--text-color)',
        },
      }),
    },
    Text: {
      styles: () => ({
        root: {
          color: 'var(--text-color)',
        },
      }),
    },
    Title: {
      styles: () => ({
        root: {
          color: 'var(--text-color)',
        },
      }),
    },
  },
});

export default theme;
