import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data?: DataPoint[];
}

export function LineChart({ data }: LineChartProps) {
  const defaultData = [
    { date: '2024-01', value: 28423 },
    { date: '2024-02', value: 30823 },
    { date: '2024-03', value: 33423 },
    { date: '2024-04', value: 36480 },
  ];

  const chartData = data || defaultData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value: number) => {
            return new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(value);
          },
        },
      },
    },
  };

  const chartConfig = {
    labels: chartData.map((d) => d.date),
    datasets: [
      {
        data: chartData.map((d) => d.value),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line options={options} data={chartConfig} />
    </div>
  );
}
