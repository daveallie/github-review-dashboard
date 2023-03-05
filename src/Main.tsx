import React, { Fragment, useEffect } from 'react';
import {
  Flex,
  Heading,
  IconButton,
  Progress,
  SimpleGrid,
  useBoolean,
} from '@chakra-ui/react';
import { RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import { useGithubToken } from './contexts/GithubTokenProvider';
import TokenForm from './components/TokenForm';
import usePrData from './hooks/usePrData';
import PrCard from './components/PrCard';
import ConfigDrawer from './components/ConfigDrawer';
import { useConfig } from './contexts/ConfigProvider';
import { useCountdownProgress } from './hooks/useCountdown';

export default function Main() {
  const token = useGithubToken().token;
  const { repos, autoRefresh } = useConfig().config;
  const { runTime, data, refresh } = usePrData();
  const progress = useCountdownProgress(runTime, runTime + autoRefresh * 1000);
  const [drawerOpen, setDrawerOpen] = useBoolean();

  useEffect(() => {
    if (progress >= 100) {
      refresh();
    }
  }, [progress, refresh]);

  if (!token) {
    return <TokenForm />;
  }

  return (
    <>
      <ConfigDrawer
        isOpen={drawerOpen}
        onOpen={setDrawerOpen.on}
        onClose={setDrawerOpen.off}
      />
      <Flex gap={4} mt={4} mb={8}>
        {repos.length > 0 ? (
          <Flex
            gap={4}
            justifyContent="flex-start"
            alignItems="center"
            flexGrow={1}
          >
            <Flex flexDirection="column" flexGrow={1}>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                flexGrow={1}
              >
                {autoRefresh !== 0 ? <b>Next refresh</b> : <div />}
                Last refreshed: {new Date(runTime).toLocaleTimeString()}
              </Flex>
              {autoRefresh !== 0 ? (
                <Progress
                  width="100%"
                  value={100 - progress}
                  sx={{
                    '& > div:first-child': {
                      transitionProperty: 'width',
                    },
                  }}
                />
              ) : null}
            </Flex>
          </Flex>
        ) : (
          <div />
        )}

        <Flex gap={2}>
          <IconButton
            onClick={refresh}
            icon={<RepeatIcon />}
            aria-label="Manually Refresh"
          />
          <IconButton
            onClick={setDrawerOpen.on}
            icon={<SettingsIcon />}
            aria-label="Settings"
          />
        </Flex>
      </Flex>

      {data.map(({ label, data }) => (
        <Fragment key={label}>
          <Heading mb={2} size="lg">
            {label}
          </Heading>
          <SimpleGrid gap={4} mb={8} columns={{ base: 1, md: 2, lg: 3 }}>
            {data.map((d) => (
              <PrCard key={d.pr.id} {...d} />
            ))}
          </SimpleGrid>
        </Fragment>
      ))}
    </>
  );
}
