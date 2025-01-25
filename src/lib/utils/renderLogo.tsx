import React from 'react';
import { Building2 } from 'lucide-react';
import * as allIcons from 'simple-icons';

interface RenderLogoProps {
  brandName: string;
  size?: number;
  color?: string;
  className?: string;
  fallbackType?: 'initials' | 'icon' | 'random';
}

/**
 * Clean brand name for matching with Simple Icons
 */
function cleanBrandName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Get random icon from Simple Icons library
 */
function getRandomIcon(): { title: string; path: string } {
  const icons = Object.values(allIcons);
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

/**
 * Generate initials from brand name
 */
function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Render SVG path from Simple Icons
 */
function renderSvgPath(path: string, size: number, color: string): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} />
    </svg>
  );
}

/**
 * Render brand logo with fallback options
 */
export function renderLogo({
  brandName,
  size = 24,
  color = '#6B7280',
  className = '',
  fallbackType = 'initials',
}: RenderLogoProps): JSX.Element {
  // Try to find matching Simple Icon
  const cleanName = cleanBrandName(brandName);
  const brandIcon = (allIcons as any)[`si${cleanName}`];

  if (brandIcon) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        aria-label={`${brandName} logo`}
      >
        {renderSvgPath(brandIcon.path, size, color)}
      </div>
    );
  }

  // Handle fallback cases
  switch (fallbackType) {
    case 'random':
      const randomIcon = getRandomIcon();
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          aria-label={`${brandName} logo`}
        >
          {renderSvgPath(randomIcon.path, size, color)}
        </div>
      );

    case 'icon':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          aria-label={`${brandName} logo`}
        >
          <Building2 size={size} color={color} />
        </div>
      );

    case 'initials':
    default:
      const initials = generateInitials(brandName);
      return (
        <div
          className={`
            flex 
            items-center 
            justify-center 
            rounded-lg 
            bg-gray-100 
            font-medium 
            ${className}
          `}
          style={{
            width: size,
            height: size,
            fontSize: size * 0.4,
          }}
          aria-label={`${brandName} logo`}
        >
          {initials}
        </div>
      );
  }
}
