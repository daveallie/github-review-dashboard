import { Octokit } from 'octokit';
import { groupBy, mapValues, sortBy } from 'lodash';
import { PrData } from '../types';

export default async function fetchPrData(
  token: string,
  pr: { owner: string; repo: string; number: number; login: string },
): Promise<Required<Pick<PrData, 'reviews' | 'commits'>>> {
  const octokit = new Octokit({ auth: token });

  const reviewsPromise = octokit.rest.pulls
    .listReviews({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
    })
    // @ts-expect-error TODO - Resolve
    .then((reviewsData) =>
      mapValues(
        groupBy(
          // @ts-expect-error TODO - Resolve
          reviewsData.data.filter((r) => r.user?.login !== pr.login),
          'user.login',
        ),
        (v) => sortBy(v, 'submitted_at')[v.length - 1]!,
      ),
    );

  const commitsPromise = octokit.rest.pulls
    .listCommits({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
    })
    // @ts-expect-error TODO - Resolve
    .then((commitData) => commitData.data);

  return Promise.all([reviewsPromise, commitsPromise]).then(
    ([reviews, commits]) => ({
      reviews,
      commits,
    }),
  );
}
