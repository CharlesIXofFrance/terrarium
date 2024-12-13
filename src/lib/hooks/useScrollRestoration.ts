import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_KEY_PREFIX = 'scroll_position_';

export function useScrollRestoration() {
  const location = useLocation();
  const isJobBoard = location.pathname.includes('/jobs') && !location.pathname.includes('/jobs/');
  const isJobListing = location.pathname.includes('/jobs/');
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // Only handle scroll restoration for job board and job listings
    if (!isJobBoard && !isJobListing) return;

    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;
    
    // Save scroll position when navigating away from job board
    if (previousPath.includes('/jobs') && !previousPath.includes('/jobs/')) {
      const scrollKey = `${SCROLL_KEY_PREFIX}job_board`;
      sessionStorage.setItem(scrollKey, window.scrollY.toString());
    }

    // Restore scroll position when returning to job board
    if (isJobBoard) {
      const scrollKey = `${SCROLL_KEY_PREFIX}job_board`;
      const savedPosition = sessionStorage.getItem(scrollKey);
      
      if (savedPosition) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        });
      }
    }

    // Always scroll to top for job listings
    if (isJobListing) {
      window.scrollTo(0, 0);
    }

    previousPathRef.current = currentPath;

    // Cleanup
    return () => {
      if (isJobBoard) {
        const scrollKey = `${SCROLL_KEY_PREFIX}job_board`;
        sessionStorage.removeItem(scrollKey);
      }
    };
  }, [location.pathname, isJobBoard, isJobListing]);
}