import { useCallback, useEffect, useMemo, useState } from 'react';
import { Octokit } from 'octokit';
import { flatten, sortBy, uniq } from 'lodash';
import { PrData } from '../types';
import useLogin from './useLogin';
import { useConfig } from '../contexts/ConfigProvider';
import { useGithubToken } from '../contexts/GithubTokenProvider';
import fetchPrData from '../util/fetchPrData';

function useRawPrData(): {
  runTime: number;
  data: PrData[];
  refresh: () => void;
} {
  const token = useGithubToken().token;
  const { repos } = useConfig().config;
  const [runTime, setRunTime] = useState(Date.now());
  const [data, setData] = useState<{ [repo: string]: PrData[] }>({});

  useEffect(() => {
    if (!token) {
      return;
    }

    if (repos.length === 0) {
      setData({});
      return;
    }

    const octokit = new Octokit({ auth: token });

    repos.forEach((fullRepo) => {
      const [owner, repo] = fullRepo.split('/', 2);

      octokit.rest.pulls
        .list({
          owner,
          repo,
          state: 'open',
        })
        .then((res) => {
          setData((data) => ({
            ...data,
            [fullRepo]: res.data.map((pr) => ({ pr, loading: true })),
          }));

          res.data.forEach((pr) => {
            fetchPrData(token, {
              number: pr.number,
              login: pr.user?.login || '',
              owner,
              repo,
            }).then((res) =>
              setData((data) => ({
                ...data,
                [fullRepo]: (data[fullRepo] || []).map((d) =>
                  d.pr.number === pr.number
                    ? { ...d, ...res, loading: false }
                    : d
                ),
              }))
            );
          });
        });
    });
  }, [token, runTime, repos]);

  return {
    runTime,
    data: useMemo(() => flatten(Object.values(data)), [data]),
    refresh: useCallback(() => setRunTime(Date.now), []),
  };
}

export default function usePrData(): {
  runTime: number;
  data: Array<{ label: string; data: PrData[] }>;
  refresh: () => void;
} {
  const login = useLogin();
  const { showMeOnly, grouping } = useConfig().config;
  const { runTime, data, refresh } = useRawPrData();

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

    const grouped: { [key: string]: PrData[] } = {};

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

  return {
    runTime,
    data: groupedData,
    refresh,
  };
}
