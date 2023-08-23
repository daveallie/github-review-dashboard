import React, { useState, useEffect } from 'react';

function getStorageValue<T extends {} | string | number>(
  key: string,
  defaultValue: T,
): T {
  // getting stored value
  const saved = localStorage.getItem(key);
  if (saved == null) {
    return defaultValue;
  }

  return JSON.parse(saved) as T;
}

export function useLocalStorage<T extends {} | string | number>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue));

  useEffect(
    () => localStorage.setItem(key, JSON.stringify(value)),
    [key, value],
  );

  return [value, setValue];
}
