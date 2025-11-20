import React from 'react';
import {
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Link,
  Skeleton,
  SkeletonCircle,
  Spacer,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, ChatIcon } from '@chakra-ui/icons';
import { PrData } from '../types';

const BADGE_COLOR: Record<string, string> = {
  APPROVED: 'green',
  CHANGES_REQUESTED: 'red',
};

const BADGE_TEXT: Record<string, string> = {
  APPROVED: 'Approved',
  CHANGES_REQUESTED: 'Changes requested',
  COMMENTED: 'Commented',
  DISMISSED: 'Dismissed',
};

export default function PrCard({
  pr,
  loading,
  reviews = {},
  commits = [],
}: PrData) {
  const pendingReviewers = (pr.requested_reviewers || []).filter(
    (u) =>
      u.login !== pr.user?.login && !Object.keys(reviews).includes(u.login),
  );

  const navigateToPr = () => {
    window.open(pr.html_url, '_blank');
  };

  return (
    <Card opacity={pr.draft ? 0.5 : 1}>
      <CardHeader>
        <Flex direction="column" gap={2}>
          <Flex alignItems="center" gap={2}>
            <Link href={pr.base.repo.html_url} target="_blank">
              <Text fontSize="sm">{pr.base.repo.full_name}</Text>
            </Link>
            <Text fontSize="sm">/</Text>
            <Link href={pr.html_url} target="_blank">
              <Text fontSize="sm">#{pr.number}</Text>
            </Link>
          </Flex>
          <Flex alignItems="top" gap={2}>
            <Heading size="sm">
              <Link href={pr.html_url} target="_blank">
                {pr.title}
              </Link>
            </Heading>
            <Spacer />
            <Avatar
              size="xs"
              src={(pr.assignee || pr.user)?.avatar_url}
              name={(pr.assignee || pr.user)?.login}
            />
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody onClick={navigateToPr} _hover={{ cursor: 'pointer' }}>
        {loading ? (
          <Stack>
            <Flex gap={4} direction="row" alignItems="center">
              <SkeletonCircle size="12" />
              <Skeleton height="4" width="20" />
            </Flex>
          </Stack>
        ) : (
          <Stack>
            {Object.values(reviews).map((r) => {
              const newCommits =
                commits.length -
                commits.findIndex((c) => c.sha === r.commit_id) -
                1;

              return (
                <Flex key={r.id} gap={4} direction="row" alignItems="center">
                  <Avatar src={r.user?.avatar_url} name={r.user?.login} />

                  <Flex direction="row" gap={2} alignItems="center">
                    <Badge
                      colorScheme={BADGE_COLOR[r.state]}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => window.open(r.html_url, '_blank')}
                    >
                      {BADGE_TEXT[r.state] || r.state}
                    </Badge>
                    {r.body ? (
                      <Tooltip label={r.body}>
                        <Badge>
                          <ChatIcon boxSize={2} mb="1px" />
                        </Badge>
                      </Tooltip>
                    ) : null}
                    {newCommits > 0 ? (
                      <Tooltip
                        label={`${newCommits} new commit${
                          newCommits > 1 ? 's' : ''
                        } since last review`}
                      >
                        <Badge colorScheme="pink">
                          <AddIcon boxSize={2} mb="1px" mr={1} />
                          {newCommits}
                        </Badge>
                      </Tooltip>
                    ) : null}
                  </Flex>
                </Flex>
              );
            })}
            {pendingReviewers.map((user) => (
              <Flex key={user.id} gap={4} direction="row" alignItems="center">
                <Avatar src={user.avatar_url} name={user.login} />
                <Badge colorScheme="yellow">Pending</Badge>
              </Flex>
            ))}
          </Stack>
        )}
      </CardBody>
    </Card>
  );
}
