import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  useBoolean,
  useColorMode,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useConfig } from '../contexts/ConfigProvider';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { uniq } from 'lodash';

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
  const [newRepoModalOpen, setNewRepoModalOpen] = useBoolean();
  const [newRepoInput, setNewRepoInput] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (config.repos.length === 0 && !isOpen) {
      onOpen();
    }
  }, [config.repos.length, isOpen, onOpen]);

  const onNewRepoModalClose = useCallback(() => {
    setNewRepoInput('');
    setNewRepoModalOpen.off();
  }, [setNewRepoModalOpen]);

  const addNewRepo = useCallback(() => {
    setConfig((c) => ({
      ...c,
      repos: uniq([...c.repos, newRepoInput]).sort(),
    }));
    onNewRepoModalClose();
  }, [newRepoInput, onNewRepoModalClose, setConfig]);

  const newRepoNameValid = !!newRepoInput.match(
    /[A-Za-z0-9\-_]+\/[A-Za-z0-9\-_]+/
  );

  const requestNotificationPermission = async () => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert("Notification permission denied, can't enable notifications.");
      return false;
    }
    return true;
  };

  return (
    <>
      <Modal isOpen={newRepoModalOpen} onClose={onNewRepoModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add repo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              autoFocus
              value={newRepoInput}
              placeholder="owner/repo"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && newRepoNameValid) {
                  addNewRepo();
                }
              }}
              onChange={(event) => setNewRepoInput(event.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={addNewRepo}
              isDisabled={!newRepoNameValid}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Config</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <Stack gap={4}>
              <Stack gap={2}>
                <div>
                  <FormLabel>Auto Refresh</FormLabel>
                  <Select
                    value={config.autoRefresh.toString()}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        autoRefresh: parseInt(e.target.value),
                      }))
                    }
                  >
                    <option value="0">Disabled</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                    <option value="600">10 minutes</option>
                    <option value="900">15 minutes</option>
                  </Select>
                </div>

                <div>
                  <FormLabel>Group by</FormLabel>
                  <Select
                    value={config.grouping}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        grouping: e.target.value as any,
                      }))
                    }
                  >
                    <option value="repo">Repository</option>
                    <option value="assigned">Assigned</option>
                    <option value="reviewer">Reviewer</option>
                  </Select>
                </div>

                <Checkbox
                  defaultChecked={config.showMeOnly}
                  checked={config.showMeOnly}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, showMeOnly: e.target.checked }))
                  }
                >
                  Show me only
                </Checkbox>

                <Checkbox
                  defaultChecked={config.notificationsEnabled}
                  checked={config.notificationsEnabled}
                  onChange={async (e) => {
                    if (e.target.checked)
                      e.target.checked = await requestNotificationPermission();
                    setConfig((c) => ({
                      ...c,
                      notificationsEnabled: e.target.checked,
                    }));
                  }}
                >
                  Desktop notifications
                </Checkbox>
                {config.notificationsEnabled && (
                  <Checkbox
                    defaultChecked={config.notifyForComments}
                    checked={config.notifyForComments}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        notifyForComments: e.target.checked,
                      }))
                    }
                  >
                    Notify for comments
                  </Checkbox>
                )}

                <Button onClick={toggleColorMode}>
                  Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
                </Button>
              </Stack>
              <Divider />
              <Stack gap={2}>
                <Flex alignItems="center" justifyContent="space-between">
                  <Heading size="sm">Repos</Heading>
                  <IconButton
                    size="xs"
                    aria-label="Add repo"
                    icon={<AddIcon />}
                    onClick={setNewRepoModalOpen.on}
                  />
                </Flex>
                {config.repos.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>Add repos to get started</AlertTitle>
                  </Alert>
                ) : null}
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
    </>
  );
}
