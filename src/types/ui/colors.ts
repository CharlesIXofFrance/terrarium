export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface ThemeColors {
  light: ColorScheme;
  dark: ColorScheme;
}

export type ColorMode = 'light' | 'dark';
