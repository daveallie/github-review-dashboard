import { PrData } from '../types';

export const createDesktopNotification = (
  title: string,
  body: string,
  clickUrl: string,
  iconUrl = '/logo192.png'
) => {
  const notification = new Notification(title, {
    body,
    icon: iconUrl,
  });
  notification.onclick = () => {
    window.open(clickUrl, '_blank')?.opener?.focus();
    notification.close();
  };
};

export const getPrsReadyForReview = (data: PrData[], login: string) =>
  data.filter(
    (pr) =>
      pr.pr.state === 'open' &&
      !pr.pr.draft &&
      !pr.pr.merged_at &&
      pr.pr.user?.login !== login &&
      (!Object.values(pr.reviews ?? {}).some(
        (r) => r?.state === 'CHANGES_REQUESTED'
      ) ||
        pr.pr.requested_reviewers?.some((r) => r.login === login))
  );

export const getComments = (data: PrData[], login: string) => {
  const filteredData = data.filter(
    (pr) => pr.pr.state === 'open' && !pr.pr.merged_at && pr.comments
  );

  return filteredData.reduce((comments, pr) => {
    const prComments = pr.comments?.filter((c) => c.user?.login !== login);
    if (!prComments) return comments;

    if (pr.pr.user?.login === login) {
      // My pr, notify for all comments
      return [...comments, ...prComments];
    }

    // Not my PR, notify for comments that are in reply to my reviews, comments or mention me
    const myCommentIds = prComments
      .filter((c) => c.user?.login === login)
      .map((c) => c.id);
    const myReviewIds = Object.values(pr.reviews ?? {})
      .filter((r) => r.user?.login === login)
      .map((r) => r.id);
    return [
      ...comments,
      ...prComments.filter(
        (c) =>
          myReviewIds.includes(c.pull_request_review_id ?? -1) ||
          myCommentIds.includes(c.in_reply_to_id ?? -1) ||
          c.body.includes(`@${login}`)
      ),
    ];
  }, [] as Exclude<PrData['comments'], undefined>);
};

export const getReviews = (data: PrData[], login: string) => {
  let reviews = [];
  for (const pr of data) {
    if (
      pr.pr.state !== 'open' ||
      !!pr.pr.merged_at ||
      pr.pr.user?.login !== login
    )
      continue;

    const prReviews = Object.values(pr.reviews || {}).filter(
      (r) => r.user?.login !== login
    );
    if (prReviews?.length) reviews.push(prReviews);
  }
  return reviews.flat();
};
