import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Flex,
  Heading,
  Link,
  Select,
  Skeleton,
  SkeletonCircle,
  Spacer,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import { Octokit } from 'octokit';
import { Endpoints } from '@octokit/types';
import { useGithubToken } from './contexts/GithubTokenProvider';
import TokenForm from './components/TokenForm';
import { groupBy, mapValues, sortBy, uniq } from 'lodash';

type Data = Partial<Awaited<ReturnType<typeof fetchPRData>>> & {
  pr: Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];
  loading: boolean;
};

const fetchPRData = async (
  token: string,
  pr: { owner: string; repo: string; number: number; login: string }
) => {
  const octokit = new Octokit({ auth: token });

  const reviews = octokit.rest.pulls
    .listReviews({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
    })
    .then((res) =>
      mapValues(
        groupBy(
          res.data.filter((r) => r.user?.login !== pr.login),
          'user.login'
        ),
        (v) => sortBy(v, 'submitted_at')[v.length - 1]
      )
    );
  const commits = octokit.rest.pulls
    .listCommits({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
    })
    .then((res) => res.data);

  return Promise.all([reviews, commits]).then(([reviews, commits]) => ({
    reviews,
    commits,
  }));
};

const useAllData = () => {
  const token = useGithubToken().token;
  const [runTime, setRunTime] = useState(0);
  const [data, setData] = useState<{ mono: Data[]; native: Data[] }>({
    mono: [],
    native: [],
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const octokit = new Octokit({ auth: token });

    REPOS.forEach(({ owner, repo }) => {
      octokit.rest.pulls
        .list({
          owner,
          repo,
          state: 'open',
        })
        .then((res) => {
          setData((data) => ({
            ...data,
            mono: res.data.map((pr) => ({ pr, loading: true })),
          }));

          res.data.forEach((pr) => {
            fetchPRData(token, {
              number: pr.number,
              login: pr.user?.login || '',
              owner,
              repo,
            }).then((res) =>
              setData((data) => ({
                ...data,
                mono: data.mono.map((d) =>
                  d.pr.number === pr.number
                    ? { ...d, ...res, loading: false }
                    : d
                ),
              }))
            );
          });
        });
    });
  }, [token, runTime]);

  return {
    data: useMemo(() => [...data.mono, ...data.native], [data]),
    refresh: useCallback(() => setRunTime(Date.now), []),
  };
};

function PrCard({ pr, loading, reviews = {}, commits = [] }: Data) {
  const pendingReviewers = (pr.requested_reviewers || []).filter(
    (u) => u.login !== pr.user?.login && !Object.keys(reviews).includes(u.login)
  );

  return (
    <Card width="sm" opacity={pr.draft ? 0.5 : 1}>
      <CardHeader>
        <Flex direction="column" gap={2}>
          <Flex alignItems="center" gap={2}>
            <Link href={pr.head.repo.html_url}>
              <Text fontSize="sm">{pr.head.repo.full_name}</Text>
            </Link>
            <Text fontSize="sm">/</Text>
            <Link href={pr.html_url}>
              <Text fontSize="sm">#{pr.number}</Text>
            </Link>
          </Flex>
          <Flex alignItems="top" gap={2}>
            <Heading size="sm">
              <Link href={pr.html_url}>{pr.title}</Link>
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
      <CardBody>
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
                  {r.state === 'APPROVED' ? (
                    <Badge colorScheme="green">Approved</Badge>
                  ) : null}
                  {r.state === 'CHANGES_REQUESTED' ? (
                    <Badge colorScheme="red">Changes requested</Badge>
                  ) : null}
                  {r.state === 'COMMENTED' ? <Badge>Commented</Badge> : null}
                  {r.state === 'DISMISSED' ? <Badge>Dismissed</Badge> : null}
                  {newCommits > 0 ? (
                    <Tooltip
                      label={`${newCommits} new commit${
                        newCommits > 1 ? 's' : ''
                      } since last review`}
                    >
                      <Badge colorScheme="pink">
                        <SmallAddIcon boxSize={4} mb="1px" />
                        {newCommits}
                      </Badge>
                    </Tooltip>
                  ) : null}
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

export default function Main() {
  const token = useGithubToken().token;
  const [login, setLogin] = useState('');
  const { data, refresh } = useAllData();
  const [grouping, setGrouping] = useState<'repo' | 'assigned' | 'reviewer'>(
    'repo'
  );
  const [showMeOnly, setShowMeOnly] = useState(false);

  const groupedData = useMemo(() => {
    const filtered = showMeOnly
      ? data.filter((d) =>
          [
            (d.pr.assignee || d.pr.user)?.login,
            ...Object.keys(d.reviews || {}),
            ...(d.pr.requested_reviewers || []).map((r) => r.login),
          ].includes(login)
        )
      : data;

    const grouped: { [key: string]: Data[] } = {};

    filtered.forEach((d) => {
      switch (grouping) {
        case 'repo':
          grouped[d.pr.head.repo.full_name] = [
            ...(grouped[d.pr.head.repo.full_name] || []),
            d,
          ];
          break;
        case 'assigned':
          grouped[(d.pr.assignee || d.pr.user)?.login || ''] = [
            ...(grouped[(d.pr.assignee || d.pr.user)?.login || ''] || []),
            d,
          ];
          break;
        case 'reviewer':
          uniq([
            ...Object.keys(d.reviews || []),
            ...(d.pr.requested_reviewers || []).map((rr) => rr.login),
          ]).forEach((login) => {
            grouped[login] = [...(grouped[login] || []), d];
          });
          break;
        default:
          grouped[''] = [...(grouped[''] || []), d];
          break;
      }
    });

    return sortBy(
      Object.entries(grouped).map(([group, data]) => ({
        label: group,
        data: sortBy(data, ({ pr }) => [!pr.draft, pr.updated_at]).reverse(),
      })),
      ({ label }) => [label !== login, label.toLowerCase()]
    );
  }, [data, grouping, login, showMeOnly]);

  useEffect(() => {
    const octokit = new Octokit({ auth: token });
    octokit.rest.users
      .getAuthenticated()
      .then((res) => setLogin(res.data.login));
  }, [token]);

  if (!token) {
    return <TokenForm />;
  }

  return (
    <>
      <Checkbox
        checked={showMeOnly}
        onChange={(e) => setShowMeOnly(e.target.checked)}
      >
        Show me only
      </Checkbox>
      <Select
        value={grouping}
        onChange={(e) => setGrouping(e.target.value as any)}
      >
        <option value="repo">Group by repo</option>
        <option value="assigned">Group by assigned</option>
        <option value="reviewer">Group by reviewer</option>
      </Select>
      <Button onClick={refresh}>Refresh</Button>

      {groupedData.map(({ label, data }) => (
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
