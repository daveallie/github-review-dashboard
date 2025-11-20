import React, { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Grouping } from '../types';

interface Config {
  showMeOnly: boolean;
  grouping: Grouping;
  autoRefresh: number;
  repos: string[];
}

interface ConfigContextType {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

const defaultConfig: Config = {
  showMeOnly: false,
  grouping: 'repo',
  autoRefresh: 300,
  repos: [],
};

const ConfigContext = React.createContext<ConfigContextType>({
  config: defaultConfig,
  setConfig: () => {},
});

export default function ConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useLocalStorage<Config>('config', defaultConfig);

  const value = useMemo(() => ({ config, setConfig }), [config, setConfig]);

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = React.useContext(ConfigContext);
  if (context === null) {
    throw new Error('ConfigContext is null');
  }
  return context;
}
