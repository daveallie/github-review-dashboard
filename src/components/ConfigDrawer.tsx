import {
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  Select,
  Stack,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useConfig } from '../contexts/ConfigProvider';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';

export default function ConfigDrawer({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const { config, setConfig } = useConfig();

  useEffect(() => {
    if (config.repos.length === 0 && !isOpen) {
      onOpen();
    }
  }, [config.repos.length, isOpen, onOpen]);

  return (
    <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">Config</DrawerHeader>
        <DrawerBody>
          <Stack gap={4}>
            <Select
              value={config.grouping}
              onChange={(e) =>
                setConfig((c) => ({ ...c, grouping: e.target.value as any }))
              }
            >
              <option value="repo">Group by repo</option>
              <option value="assigned">Group by assigned</option>
              <option value="reviewer">Group by reviewer</option>
            </Select>
            <Checkbox
              checked={config.showMeOnly}
              onChange={(e) =>
                setConfig((c) => ({ ...c, showMeOnly: e.target.checked }))
              }
            >
              Show me only
            </Checkbox>
            <Stack gap={2}>
              <Flex alignItems="center" justifyContent="space-between">
                <Heading size="sm">Repos</Heading>
                <IconButton
                  size="xs"
                  aria-label="Add repo"
                  icon={<AddIcon />}
                  onClick={() => {
                    const res = window.prompt('new repo');
                    if (res) {
                      setConfig((c) => ({
                        ...c,
                        repos: [...c.repos, res],
                      }));
                    }
                  }}
                />
              </Flex>
              {config.repos.map((r) => (
                <Flex
                  key={r}
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                >
                  {r}
                  <IconButton
                    size="xs"
                    aria-label={`Remove ${r}`}
                    icon={<CloseIcon />}
                    onClick={() =>
                      setConfig((c) => ({
                        ...c,
                        repos: c.repos.filter((rr) => rr !== r),
                      }))
                    }
                  />
                </Flex>
              ))}
            </Stack>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
