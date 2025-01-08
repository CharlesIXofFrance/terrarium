/**
 * AI CONTEXT - DON'T DELETE
 * AI Context: Community Management
 * User Types: COMMUNITY_OWNER
 *
 * Dashboard overview for community owners to monitor their community.
 * Shows key metrics, recent activity, and quick actions.
 *
 * Location: /src/pages/community/
 * - Main landing page for community owners
 * - Central hub for community management
 *
 * Responsibilities:
 * - Display community metrics
 * - Show recent member activity
 * - Track job board stats
 * - Provide quick actions
 *
 * Design Constraints:
 * - Must use shared UI components
 * - Must be responsive
 * - Must prioritize key metrics
 */

import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { communityStateAtom } from '@/lib/stores/community';
import { Button } from '@/components/ui/atoms/Button';
import { LineChart } from '@/components/charts/LineChart';
import { getThemeClasses } from '@/lib/styles/utils';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/molecules/PageHeader';
import { Section } from '@/components/ui/molecules/Section';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  period: string;
  icon: React.ElementType;
}

function StatCard({ title, value, change, period, icon: Icon }: StatCardProps) {
  const isPositive = change > 0;

  return (
    <div className={getThemeClasses('cards.stat.container')}>
      <div className={getThemeClasses('cards.stat.header')}>
        <div className={getThemeClasses('cards.stat.icon.wrapper')}>
          <Icon className={getThemeClasses('cards.stat.icon.icon')} />
        </div>
        <span
          className={cn(
            getThemeClasses('cards.stat.metric.wrapper'),
            isPositive
              ? getThemeClasses('cards.stat.metric.positive')
              : getThemeClasses('cards.stat.metric.negative')
          )}
        >
          {isPositive ? (
            <ArrowUpRight
              className={getThemeClasses('cards.stat.metric.icon')}
            />
          ) : (
            <ArrowDownRight
              className={getThemeClasses('cards.stat.metric.icon')}
            />
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <div className={getThemeClasses('cards.stat.content')}>
        <h3 className={getThemeClasses('cards.stat.title')}>{title}</h3>
        <p className={getThemeClasses('cards.stat.value')}>{value}</p>
        <p className={getThemeClasses('cards.stat.period')}>from {period}</p>
      </div>
    </div>
  );
}

interface ResourceLinkProps {
  url: string;
  label: string;
  onCopy: () => void;
}

function ResourceLink({ url, label, onCopy }: ResourceLinkProps) {
  return (
    <div className={getThemeClasses('cards.resource.container')}>
      <div className={getThemeClasses('cards.resource.content.wrapper')}>
        <p className={getThemeClasses('cards.resource.content.label')}>
          {label}
        </p>
        <p className={getThemeClasses('cards.resource.content.url')}>{url}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        className={getThemeClasses('cards.resource.action')}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Dashboard() {
  const [{ community, isLoading }] = useAtom(communityStateAtom);
  const navigate = useNavigate();

  const stats = useMemo(
    () => [
      {
        title: 'Active Members',
        value: '8,543',
        change: 10,
        period: '7,689 (last 4 weeks)',
        icon: Users,
      },
      {
        title: 'Members Active This Week',
        value: '67%',
        change: -7,
        period: '74% (last 4 weeks)',
        icon: TrendingUp,
      },
      {
        title: 'Job Post Views',
        value: '11,453',
        change: 11,
        period: '10,328 (last 4 weeks)',
        icon: Eye,
      },
    ],
    []
  );

  if (isLoading && !community) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!community) {
    console.log('No community found in Dashboard');
    return <Navigate to="/" replace />;
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back! 👋"
        subtitle={`Here's how ${community.name} is doing`}
        actions={
          <select className="rounded-lg border-gray-300 text-sm">
            <option>Last 4 weeks</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Section title="Active Members">
            <LineChart
              data={[
                { date: '2024-01', value: 28423 },
                { date: '2024-02', value: 30823 },
                { date: '2024-03', value: 33423 },
                { date: '2024-04', value: 36480 },
              ]}
            />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Resources">
            <div className="space-y-3">
              <ResourceLink
                label="Community URL"
                url={`https://terrarium.com/c/${community.slug}`}
                onCopy={() =>
                  handleCopy(`https://terrarium.com/c/${community.slug}`)
                }
              />
              <ResourceLink
                label="Job Board URL"
                url={`https://terrarium.com/c/${community.slug}/jobs`}
                onCopy={() =>
                  handleCopy(`https://terrarium.com/c/${community.slug}/jobs`)
                }
              />
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Need help?</h4>
              <a
                href="#"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                Knowledge base
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
              <a
                href="#"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                API Documentation
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
