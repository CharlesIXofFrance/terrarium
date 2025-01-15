import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedback: 0,
    positivePercentage: 0,
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.terrarium.dev/v1/feedback');
      const data = await response.json();
      
      setFeedback(data.items);
      calculateStats(data.items);
      setLoading(false);
    } catch (err) {
      setError('Failed to load feedback');
      setLoading(false);
    }
  };

  const calculateStats = (items) => {
    if (!items.length) return;

    const totalRating = items.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / items.length;
    const positiveCount = items.filter(item => item.rating >= 4).length;
    const positivePercentage = (positiveCount / items.length) * 100;

    setStats({
      averageRating: averageRating.toFixed(1),
      totalFeedback: items.length,
      positivePercentage: positivePercentage.toFixed(1),
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Layout
      title="Feedback Dashboard"
      description="View and analyze documentation feedback">
      <main className={styles.container}>
        <h1>Feedback Dashboard</h1>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Average Rating</h3>
            <p className={styles.statValue}>{stats.averageRating} ★</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Feedback</h3>
            <p className={styles.statValue}>{stats.totalFeedback}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Positive Feedback</h3>
            <p className={styles.statValue}>{stats.positivePercentage}%</p>
          </div>
        </div>

        <div className={styles.feedbackList}>
          <h2>Recent Feedback</h2>
          <table className={styles.feedbackTable}>
            <thead>
              <tr>
                <th>Page</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item, index) => (
                <tr key={index}>
                  <td>{item.url}</td>
                  <td>{item.rating} ★</td>
                  <td>{item.comment || '-'}</td>
                  <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  );
}

export default FeedbackDashboard;
