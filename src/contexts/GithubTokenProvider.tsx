import React, { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const GithubTokenContext = React.createContext<{
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
}>({
  token: '',
  setToken: () => {},
});

export default function GithubTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useLocalStorage<string>('githubToken', '');

  const value = useMemo(() => ({ token, setToken }), [token, setToken]);

  return (
    <GithubTokenContext.Provider value={value}>
      {children}
    </GithubTokenContext.Provider>
  );
}

export function useGithubToken() {
  const context = React.useContext(GithubTokenContext);
  if (context === null) {
    throw new Error('GithubTokenContext is null');
  }
  return context;
}
