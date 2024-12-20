import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
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
import { communityStateAtom } from '../../lib/stores/community';
import { Button } from '../../components/ui/Button';
import { LineChart } from '../../components/charts/LineChart';
import { Navigate } from 'react-router-dom';

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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
        <span
          className={`flex items-center text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">from {period}</p>
      </div>
    </div>
  );
}

function ResourceLink({
  url,
  label,
  onCopy,
}: {
  url: string;
  label: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <span className="text-sm text-gray-600 truncate">{url}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
        <span>Copy</span>
      </Button>
    </div>
  );
}

export function Dashboard() {
  const [{ community, isLoading }] = useAtom(communityStateAtom);
  const navigate = useNavigate();

  console.log('Dashboard - Current Community State:', { community, isLoading });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
          <p className="text-gray-600 mt-1">
            Here's how {community.name} is doing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border-gray-300 text-sm">
            <option>Last 4 weeks</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Active Members
            </h3>
            <LineChart
              data={[
                { date: '2024-01', value: 28423 },
                { date: '2024-02', value: 30823 },
                { date: '2024-03', value: 33423 },
                { date: '2024-04', value: 36480 },
              ]}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Resources
            </h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}
