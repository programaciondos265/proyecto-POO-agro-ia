import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    // Palette adjusted to match provided mock
    mintBg: '#6EC1A9',
    primary: '#2F6E62',
    primaryDark: '#23564D',
    surface: '#FFFFFF',
    textOnMint: '#FFFFFF',
    textOnSurface: '#1F2A37',
    textSecondary: '#6B7280',
    muted: '#5B7A72',
    accentOrange: '#F19B18',
    background: '#F9FAFB',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '28px',
    pill: '999px'
  },
  shadow: {
    soft: '0 10px 24px rgba(0,0,0,0.14)'
  },
  layout: {
    maxWidth: '1200px'
  }
} as const;

export const GlobalStyles = createGlobalStyle`
  :root { color-scheme: dark; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    background: ${({ theme }) => theme.colors.mintBg};
    color: ${({ theme }) => theme.colors.textOnMint};
    line-height: 1.4;
  }
  a { color: inherit; text-decoration: none; }
  img { display: block; max-width: 100%; height: auto; }
  button { font: inherit; }
`;

export type AppTheme = typeof theme;
declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}


