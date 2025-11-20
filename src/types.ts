import { Endpoints } from '@octokit/types';

export type Grouping = 'repo' | 'assigned' | 'reviewer';

export interface PrData {
  pr: Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];
  reviews?: Record<
    string,
    Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews']['response']['data'][number]
  >;
  commits?: Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/commits']['response']['data'];
  loading: boolean;
}
