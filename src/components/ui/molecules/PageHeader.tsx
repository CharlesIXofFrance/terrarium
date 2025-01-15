import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Shared UI Component
 * User Types: ALL
 *
 * A consistent page header component used across all user types.
 * Provides a standardized way to display page titles and actions.
 *
 * Location: /src/components/ui/molecules/
 * - Part of the shared UI component library
 * - Used by all user type pages
 *
 * Responsibilities:
 * - Display page title and optional subtitle
 * - Show contextual actions (buttons, filters, etc.)
 * - Maintain consistent spacing and alignment
 *
 * Design Constraints:
 * - Must use design system tokens
 * - Must maintain responsive layout
 * - Must preserve accessibility
 */
interface PageHeaderProps {
  /**
   * The main title of the page
   * @example "Welcome back! 👋" for Dashboard
   * @example "Members" for Members page
   */
  title: string;

  /**
   * Optional subtitle providing additional context
   * @example "Here's how Community Name is doing" for Dashboard
   * @example "150 total members" for Members page
   */
  subtitle?: string;

  /**
   * Optional className to override container styles
   */
  className?: string;

  /**
   * Actions to be displayed on the right side.
   * Typically buttons or select elements for page-level actions
   * @example Post Job button for Jobs page
   * @example Time period select for Dashboard
   */
  actions?: React.ReactNode;

  /**
   * Optional className for the actions container
   */
  actionsClassName?: string;
}

/**
 * PageHeader component for consistent page headers across community owner pages.
 * Used at the top of main pages to display the title, subtitle, and primary actions.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Members"
 *   subtitle="150 total members"
 *   actions={
 *     <Button>
 *       <Plus /> Invite Member
 *     </Button>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  className,
  actions,
  actionsClassName,
}: PageHeaderProps) {
  return (
    <div className={cn('flex justify-between items-center', className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className={cn('flex items-center space-x-4', actionsClassName)}>
          {actions}
        </div>
      )}
    </div>
  );
}
