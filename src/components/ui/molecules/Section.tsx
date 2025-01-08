import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AI Context: Shared UI Component
 * User Types: ALL
 *
 * A consistent section component used to group related content.
 * Provides a standardized way to display content blocks with titles.
 *
 * Location: /src/components/ui/molecules/
 * - Part of the shared UI component library
 * - Used by all user type pages
 *
 * Responsibilities:
 * - Group related content with a title
 * - Provide consistent padding and spacing
 * - Support optional actions and subtitles
 *
 * Design Constraints:
 * - Must use white background with subtle shadow
 * - Must maintain consistent spacing
 * - Must preserve accessibility
 */
interface SectionProps {
  /**
   * The title of the section
   * @example "Active Members" for Dashboard stats
   * @example "All Jobs" for Jobs listing
   */
  title: string;

  /**
   * Optional subtitle providing additional context
   * @example "Updated daily" for stats section
   */
  subtitle?: string;

  /**
   * The main content of the section
   */
  children: React.ReactNode;

  /**
   * Optional className to override container styles
   */
  className?: string;

  /**
   * Actions to be displayed next to the title
   * @example Filter or sort controls
   * @example "View all" link
   */
  actions?: React.ReactNode;

  /**
   * Optional className for the content container
   */
  contentClassName?: string;
}

/**
 * Section component for consistent content sections across community owner pages.
 * Used to group related content with a title and optional actions.
 * Provides consistent styling with white background and subtle shadow.
 *
 * @example
 * ```tsx
 * <Section
 *   title="All Members"
 *   actions={<Button>Filter</Button>}
 * >
 *   <MemberTable members={members} />
 * </Section>
 * ```
 */
export function Section({
  title,
  subtitle,
  children,
  className,
  actions,
  contentClassName,
}: SectionProps) {
  return (
    <div className={cn('bg-white p-6 rounded-lg shadow-sm', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
