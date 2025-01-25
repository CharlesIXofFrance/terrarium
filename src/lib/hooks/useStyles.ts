import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Single font to reduce bundle size
export const FONTS = {
  Inter: "'Inter', sans-serif",
};

// Store styles in localStorage to persist customizations
const stylesAtom = atomWithStorage('terrarium_styles', {
  colors: {
    primary: '#4F46E5',
    secondary: '#E5E7EB',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    accent: '#F59E0B',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseSize: '16px',
    scale: 1.2,
  },
  layout: {
    maxWidth: '1200px',
    contentPadding: '24px',
    sectionSpacing: '32px',
  },
  components: {
    cardStyle: 'minimal',
    buttonStyle: 'rounded',
    inputStyle: 'bordered',
  },
  effects: {
    borderRadius: '8px',
    shadowLevel: 'medium',
    transitions: true,
    animations: true,
  },
});

// Cache computed styles
const computedStylesAtom = atom((get) => {
  const styles = get(stylesAtom);
  return {
    ...styles,
    typography: {
      ...styles.typography,
      headingFont: FONTS[styles.typography.headingFont as keyof typeof FONTS],
      bodyFont: FONTS[styles.typography.bodyFont as keyof typeof FONTS],
    },
  };
});

export function useStyles() {
  const [styles, setStyles] = useAtom(stylesAtom);
  const [computedStyles] = useAtom(computedStylesAtom);

  const updateStyles = (category: string, property: string, value: any) => {
    setStyles((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value,
      },
    }));
  };

  return {
    styles: computedStyles,
    updateStyles,
  };
}
