import { tokens } from './tokens';
import { communityOwnerTheme } from './themes/communityOwner';
import { cn } from '@/lib/utils';

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeys<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type ThemeKey = DeepKeys<typeof communityOwnerTheme>;

export const getThemeClasses = (
  path: ThemeKey,
  variant: string = 'default',
  additionalClasses: string = ''
): string => {
  // Split the path into parts (e.g., "cards.stat.title" -> ["cards", "stat", "title"])
  const parts = path.split('.');

  // Navigate through the theme object
  let current: any = communityOwnerTheme;
  for (const part of parts) {
    if (!current[part]) {
      console.warn(`Theme path "${path}" not found at part "${part}"`);
      return additionalClasses;
    }
    current = current[part];
  }

  // If we're at an object with variants, use the specified variant
  if (current[variant]) {
    current = current[variant];
  }

  if (typeof current === 'string') {
    return cn(current, additionalClasses);
  }

  // Convert theme values to Tailwind classes
  let classes = '';
  Object.entries(current).forEach(([key, value]) => {
    if (typeof value === 'string') {
      switch (key) {
        case 'color':
          classes += ` text-[${value}]`;
          break;
        case 'background':
          classes += ` bg-[${value}]`;
          break;
        case 'fontSize':
          classes += ` text-[${value}]`;
          break;
        case 'fontWeight':
          classes += ` font-[${value}]`;
          break;
        case 'lineHeight':
          classes += ` leading-[${value}]`;
          break;
        case 'padding':
          classes += ` p-[${value}]`;
          break;
        case 'marginTop':
          classes += ` mt-[${value}]`;
          break;
        case 'marginBottom':
          classes += ` mb-[${value}]`;
          break;
        case 'marginLeft':
          classes += ` ml-[${value}]`;
          break;
        case 'marginRight':
          classes += ` mr-[${value}]`;
          break;
        case 'border':
          classes += ` border-[${value}]`;
          break;
        case 'borderRadius':
          classes += ` rounded-[${value}]`;
          break;
        case 'shadow':
          classes += ` shadow-[${value}]`;
          break;
        default:
          if (key.startsWith('margin')) {
            classes += ` m${key.slice(6).toLowerCase()}-[${value}]`;
          } else if (key.startsWith('padding')) {
            classes += ` p${key.slice(7).toLowerCase()}-[${value}]`;
          } else {
            classes += ` ${key}-[${value}]`;
          }
      }
    }
  });

  return cn(classes, additionalClasses);
};

// Utility function to get specific theme values
export const getThemeValue = <
  T extends ThemeKey,
  P extends keyof (typeof communityOwnerTheme)[T],
>(
  path: T,
  property: P
): (typeof communityOwnerTheme)[T][P] => {
  // Split the path into parts (e.g., "cards.stat.title" -> ["cards", "stat", "title"])
  const parts = path.split('.');

  // Navigate through the theme object
  let current: any = communityOwnerTheme;
  for (const part of parts) {
    if (!current[part]) {
      console.warn(`Theme path "${path}" not found at part "${part}"`);
      return undefined;
    }
    current = current[part];
  }

  return current[property];
};
