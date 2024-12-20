import logoColorsJson from './logoColors.json';

export interface LogoColor {
  jobId: string;
  companyName: string;
  logoUrl: string;
  dominantColor: string;
  palette: string[];
  contrast: {
    light: number;
    dark: number;
  };
  timestamp: string;
}

export type LogoColors = {
  [key: string]: LogoColor;
};

export const logoColors: LogoColors = logoColorsJson;
