import React, { useState } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function Feedback() {
  const location = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');

  const handleRating = async (value) => {
    setRating(value);
    
    // Submit simple rating without comment
    if (!showForm) {
      await submitFeedback(value);
    }
    
    // Show comment form for negative ratings
    if (value < 4) {
      setShowForm(true);
    }
  };

  const submitFeedback = async (selectedRating = rating) => {
    try {
      const feedback = {
        url: location.pathname,
        rating: selectedRating,
        comment: comment,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Send feedback to your analytics service
      // This is just an example - replace with your actual endpoint
      await fetch('https://api.terrarium.dev/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setShowForm(false);
        setRating(null);
        setComment('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (feedbackSubmitted) {
    return (
      <div className={styles.container}>
        <p className={styles.thankYou}>Thank you for your feedback! 🎉</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.question}>Was this page helpful?</p>
      
      <div className={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`${styles.ratingButton} ${
              rating === value ? styles.selected : ''
            }`}
            onClick={() => handleRating(value)}
            aria-label={`Rate ${value} stars`}
          >
            {value <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <textarea
            className={styles.commentInput}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What could we improve? (optional)"
            rows={3}
          />
          <button
            className={styles.submitButton}
            onClick={() => submitFeedback()}
            disabled={!rating}
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}
