import { RefObject, useEffect } from 'react';

export function useScrollSync(refs: RefObject<HTMLElement>[]) {
  useEffect(() => {
    if (!refs || refs.length < 2) return;

    const [sourceRef, targetRef] = refs;
    const source = sourceRef?.current;
    const target = targetRef?.current;

    if (!source || !target) return;

    const handleWheel = (event: WheelEvent) => {
      // Get the scrollable area of the filters
      const filtersArea = source.querySelector(
        '.filters-scroll-area'
      ) as HTMLElement;
      if (!filtersArea) return;

      const {
        scrollHeight: filterHeight,
        scrollTop: filterTop,
        clientHeight: filterClient,
      } = filtersArea;
      const {
        scrollHeight: targetHeight,
        scrollTop: targetTop,
        clientHeight: targetClient,
      } = target;

      const filterAtBottom =
        Math.abs(filterHeight - filterTop - filterClient) <= 1;
      const filterAtTop = filterTop <= 0;
      const targetAtBottom =
        Math.abs(targetHeight - targetTop - targetClient) <= 1;
      const targetAtTop = targetTop <= 0;

      // When scrolling up
      if (event.deltaY < 0) {
        // If filters are at top, scroll job list first
        if (filterAtTop && !targetAtTop) {
          event.preventDefault();
          target.scrollBy({ top: event.deltaY });
          return;
        }

        // If job list is at top, then scroll filters
        if (targetAtTop && !filterAtTop) {
          event.preventDefault();
          filtersArea.scrollBy({ top: event.deltaY });
          return;
        }
      }

      // When scrolling down
      if (event.deltaY > 0) {
        // If filters aren't at bottom, scroll them first
        if (!filterAtBottom) {
          event.preventDefault();
          filtersArea.scrollBy({ top: event.deltaY });
          return;
        }

        // If filters are at bottom, scroll job list
        if (filterAtBottom && !targetAtBottom) {
          event.preventDefault();
          target.scrollBy({ top: event.deltaY });
          return;
        }
      }
    };

    source.addEventListener('wheel', handleWheel, { passive: false });
    return () => source.removeEventListener('wheel', handleWheel);
  }, [refs]);
}
