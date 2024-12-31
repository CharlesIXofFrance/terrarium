import { useState, useEffect, RefObject, useCallback } from 'react';

export function useScrollEnd(refs: RefObject<HTMLElement>[]) {
  const [allScrolledToEnd, setAllScrolledToEnd] = useState(false);

  const checkScrollEnd = useCallback(() => {
    const allAtEnd = refs.every((ref) => {
      if (!ref.current) return false;
      const { scrollHeight, scrollTop, clientHeight } = ref.current;
      // Consider it at the end if within 1px of the bottom
      return Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;
    });
    setAllScrolledToEnd(allAtEnd);
  }, [refs]);

  useEffect(() => {
    const elements = refs.map(ref => ref.current).filter(Boolean);
    elements.forEach(element => {
      element?.addEventListener('scroll', checkScrollEnd);
    });

    // Initial check
    checkScrollEnd();

    // Cleanup
    return () => {
      elements.forEach(element => {
        element?.removeEventListener('scroll', checkScrollEnd);
      });
    };
  }, [refs, checkScrollEnd]); // Include both refs and checkScrollEnd in dependencies

  return allScrolledToEnd;
}
