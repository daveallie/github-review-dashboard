import { useEffect, useState } from 'react';
import { useConfig } from '../contexts/ConfigProvider';
import { PrData } from '../types';
import useLogin from './useLogin';

export default function useDesktopNotifications(rawData: PrData[]) {
  const login = useLogin();
  const { notificationsEnabled, notifyForComments } = useConfig().config;
  const [previousData, setPreviousData] = useState<PrData[]>(rawData);

  useEffect(() => {
    const notifyOfUpdates = () => {
      if (
        !login ||
        !notificationsEnabled ||
        Notification.permission !== 'granted' ||
        !previousData.length ||
        !rawData.length ||
        previousData.some((p) => p.loading)
      )
        return;

      // Notify if any PRs have become ready for review
      const currentReadyForReview = getPrsReadyForReview(rawData, login);
      const previousReadyForReview = getPrsReadyForReview(previousData, login);
      const newPrsReadyForReview = currentReadyForReview
        .filter(
          (pr) =>
            !previousReadyForReview.some(
              (prevPr) => prevPr.pr.number === pr.pr.number
            )
        )
        .filter((pr) => pr.pr.user?.login !== login);
      for (const newPr of newPrsReadyForReview) {
        notify(
          'PR ready',
          `${newPr.pr.title} is ready for review`,
          newPr.pr.html_url,
          newPr.pr.user?.avatar_url
        );
      }

      // Notify if any of our PRs have new reviews
      const currentReviews = getReviews(rawData, login);
      const previousReviews = getReviews(previousData, login);
      const newReviews = currentReviews.filter(
        (r) => !previousReviews.some((prevR) => prevR.id === r.id)
      );
      for (const review of newReviews) {
        notify(
          review.state,
          `${review.user?.login} reviewed: ${review.body}`,
          review.html_url,
          review.user?.avatar_url
        );
      }

      if (notifyForComments) {
        // Notify if any of our PRs have new comments
        const currentComments = getComments(rawData, login);
        const previousComments = getComments(previousData, login);
        const newComments = currentComments.filter(
          (c) => !previousComments.some((prevC) => prevC.id === c.id)
        );
        for (const comment of newComments) {
          notify(
            'New comment',
            `${comment.user?.login} commented: ${comment.body}`,
            comment.html_url,
            comment.user?.avatar_url
          );
        }
      }
    };

    notifyOfUpdates();

    setPreviousData(rawData);
  }, [rawData, notificationsEnabled, previousData, login, notifyForComments]);

  const notify = (
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
      // window.focus();
      window.open(clickUrl, '_blank')?.opener?.focus();
      notification.close();
    };
  };
}

const getPrsReadyForReview = (data: PrData[], login: string) =>
  data.filter(
    (pr) =>
      pr.pr.state === 'open' &&
      !pr.pr.draft &&
      !pr.pr.merged_at &&
      (!Object.values(pr.reviews ?? {}).some(
        (r) => r?.state === 'CHANGES_REQUESTED'
      ) ||
        pr.pr.requested_reviewers?.some((r) => r.login === login))
  );

const getComments = (data: PrData[], login: string) => {
  let comments = [];
  for (const pr of data) {
    if (pr.pr.state !== 'open' || !!pr.pr.merged_at) continue;

    // If it's not our pr only get comments in reply to our reviews or ones we're tagged in
    let prComments = pr.comments?.filter((c) => c.user?.login !== login);
    if (pr.pr.user?.login !== login)
      prComments = prComments?.filter(
        (c) => c.in_reply_to_id || c.body.includes(`@${login}`)
      );

    if (prComments?.length) comments.push(prComments);
  }
  return comments.flat();
};

const getReviews = (data: PrData[], login: string) => {
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
