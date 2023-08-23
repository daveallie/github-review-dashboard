import { Octokit } from 'octokit';
import { groupBy, mapValues, sortBy } from 'lodash';
import { PrData } from '../types';

export default async function fetchPrData(
  token: string,
  pr: { owner: string; repo: string; number: number; login: string },
): Promise<Required<Pick<PrData, 'reviews' | 'commits'>>> {
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
          'user.login',
        ),
        (v) => sortBy(v, 'submitted_at')[v.length - 1],
      ),
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
}
