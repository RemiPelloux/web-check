import { Global, css } from '@emotion/react';

const GlobalStyles = () => (
  <Global
    styles={css`
    @font-face {
      font-family: PTMono;
      font-style: normal;
      font-weight: 400;
      src: url('/fonts/PTMono-Regular.ttf') format('truetype');
    }
    body, div, a, p, span, ul, li, small, h1, h2, h3, h4, button, section {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      color: var(--text-color);
      letter-spacing: -0.01em;
      line-height: 1.5;
    }
    body {
      background-color: var(--background);
      color: var(--text-color);
    }
    code, pre {
      font-family: PTMono, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      color: var(--text-color);
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      letter-spacing: -0.025em;
      color: var(--text-color);
    }
    #fancy-background p span {
      color: transparent;
    }
    svg {
      color: inherit;
    }
    `}
  />
);

export default GlobalStyles;
