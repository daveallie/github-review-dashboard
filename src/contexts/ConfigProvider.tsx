import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Grouping } from '../types';

type Config = {
  showMeOnly: boolean;
  notificationsEnabled: boolean;
  notifyForComments: boolean;
  grouping: Grouping;
  autoRefresh: number;
  repos: string[];
};

type ConfigContextType = {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
};

const defaultConfig: Config = {
  showMeOnly: false,
  notificationsEnabled: false,
  notifyForComments: false,
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

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = React.useContext(ConfigContext);
  if (context === null) {
    throw new Error('ConfigContext is null');
  }
  return context;
}
