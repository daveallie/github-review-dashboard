import { useEffect, useState } from 'react';
import { clamp } from 'lodash';

const percentage = (start: number, end: number) => {
  if (end === start) {
    return 100;
  }

  const now = Date.now();
  const relativeEnd = end - start;
  const relativeNow = now - start;
  return clamp((relativeNow / relativeEnd) * 100, 0, 100);
};

export function useCountdownProgress(start: number, end: number) {
  const [progress, setProgress] = useState(percentage(start, end));

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(percentage(start, end));
    }, 1000);
    return () => clearInterval(interval);
  }, [end, start]);

  return progress;
}
