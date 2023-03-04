import React, { Fragment } from 'react';
import { Flex, Heading, IconButton, useBoolean } from '@chakra-ui/react';
import { RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import { useGithubToken } from './contexts/GithubTokenProvider';
import TokenForm from './components/TokenForm';
import usePrData from './hooks/usePrData';
import PrCard from './components/PrCard';
import ConfigDrawer from './components/ConfigDrawer';

export default function Main() {
  const token = useGithubToken().token;
  const { runTime, data, refresh } = usePrData();

  const [drawerOpen, setDrawerOpen] = useBoolean();

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
      <Flex gap={4} justifyContent="space-between" mt={4}>
        <Flex gap={4} justifyContent="flex-start" alignItems="center">
          Last refreshed: {new Date(runTime).toLocaleTimeString()}
          <IconButton
            onClick={refresh}
            icon={<RepeatIcon />}
            aria-label="Manually Refresh"
          />
        </Flex>

        <IconButton
          onClick={setDrawerOpen.on}
          icon={<SettingsIcon />}
          aria-label="Settings"
        />
      </Flex>

      {data.map(({ label, data }) => (
        <Fragment key="label">
          <Heading pt={8} pb={2}>
            {label}
          </Heading>
          <Flex direction={['column', 'row']} gap={4} flexWrap="wrap">
            {data.map((d) => (
              <PrCard key={d.pr.id} {...d} />
            ))}
          </Flex>
        </Fragment>
      ))}
    </>
  );
}
