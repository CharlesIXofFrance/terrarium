import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './status.module.css';

const ENDPOINTS = [
  {
    name: 'Authentication API',
    endpoint: '/v1/auth/health',
    description: 'User authentication and authorization',
  },
  {
    name: 'Communities API',
    endpoint: '/v1/communities/health',
    description: 'Community management and settings',
  },
  {
    name: 'Jobs API',
    endpoint: '/v1/jobs/health',
    description: 'Job board and listings',
  },
  {
    name: 'Users API',
    endpoint: '/v1/users/health',
    description: 'User profiles and management',
  },
  {
    name: 'Analytics API',
    endpoint: '/v1/analytics/health',
    description: 'Data and reporting',
  },
];

function StatusIndicator({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'operational':
        return styles.statusOperational;
      case 'degraded':
        return styles.statusDegraded;
      case 'outage':
        return styles.statusOutage;
      default:
        return styles.statusUnknown;
    }
  };

  return (
    <div className={`${styles.statusIndicator} ${getStatusColor()}`}>
      <span className={styles.statusDot}></span>
      <span className={styles.statusText}>{status}</span>
    </div>
  );
}

function MetricsCard({ title, value, unit, trend }) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendClass = () => {
    if (trend === 'up') return styles.trendUp;
    if (trend === 'down') return styles.trendDown;
    return styles.trendNeutral;
  };

  return (
    <div className={styles.metricsCard}>
      <h3>{title}</h3>
      <div className={styles.metricValue}>
        {value}
        <span className={styles.metricUnit}>{unit}</span>
      </div>
      <div className={`${styles.trend} ${getTrendClass()}`}>
        {getTrendIcon()}
      </div>
    </div>
  );
}

function IncidentItem({ incident }) {
  return (
    <div className={styles.incidentItem}>
      <div className={styles.incidentHeader}>
        <h4>{incident.title}</h4>
        <span className={`${styles.incidentStatus} ${styles[incident.status]}`}>
          {incident.status}
        </span>
      </div>
      <p className={styles.incidentDate}>{incident.date}</p>
      <p className={styles.incidentDescription}>{incident.description}</p>
      {incident.updates && (
        <div className={styles.incidentUpdates}>
          {incident.updates.map((update, index) => (
            <div key={index} className={styles.incidentUpdate}>
              <span className={styles.updateTime}>{update.time}</span>
              <span className={styles.updateText}>{update.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Status() {
  const [systemStatus, setSystemStatus] = useState({});
  const [metrics, setMetrics] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      // In a real implementation, these would be actual API calls
      // This is mock data for demonstration
      setSystemStatus({
        'Authentication API': 'operational',
        'Communities API': 'operational',
        'Jobs API': 'degraded',
        'Users API': 'operational',
        'Analytics API': 'operational',
      });

      setMetrics({
        latency: { value: 145, unit: 'ms', trend: 'down' },
        uptime: { value: 99.99, unit: '%', trend: 'neutral' },
        requests: { value: 2.5, unit: 'M/day', trend: 'up' },
      });

      setIncidents([
        {
          title: 'Increased API Latency',
          status: 'resolved',
          date: '2025-01-15',
          description: 'We experienced elevated latency in our Jobs API.',
          updates: [
            {
              time: '14:30 UTC',
              text: 'Issue has been resolved. All systems operating normally.',
            },
            {
              time: '14:00 UTC',
              text: 'Identified the root cause as increased database load.',
            },
            {
              time: '13:45 UTC',
              text: 'Investigating increased latency in Jobs API.',
            },
          ],
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="System Status">
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading system status...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Status">
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>System Status</h1>
          <p className={styles.lastUpdated}>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className={styles.metricsGrid}>
          <MetricsCard
            title="API Latency"
            value={metrics.latency.value}
            unit={metrics.latency.unit}
            trend={metrics.latency.trend}
          />
          <MetricsCard
            title="Uptime"
            value={metrics.uptime.value}
            unit={metrics.uptime.unit}
            trend={metrics.uptime.trend}
          />
          <MetricsCard
            title="Requests"
            value={metrics.requests.value}
            unit={metrics.requests.unit}
            trend={metrics.requests.trend}
          />
        </div>

        <div className={styles.statusGrid}>
          {ENDPOINTS.map((service) => (
            <div key={service.name} className={styles.statusCard}>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <StatusIndicator status={systemStatus[service.name]} />
            </div>
          ))}
        </div>

        <div className={styles.incidentsSection}>
          <h2>Recent Incidents</h2>
          <div className={styles.incidentsList}>
            {incidents.map((incident, index) => (
              <IncidentItem key={index} incident={incident} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
