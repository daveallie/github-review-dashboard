import { useEffect, useState } from 'react';
import { useConfig } from '../contexts/ConfigProvider';
import { PrData } from '../types';
import useLogin from './useLogin';
import {
  createDesktopNotification,
  getComments,
  getPrsReadyForReview,
  getReviews,
} from '../util/notificationHelpers';
import _ from 'lodash';

export default function useDesktopNotifications(rawData: PrData[]) {
  const login = useLogin();
  const { notificationsEnabled, notifyForComments } = useConfig().config;
  const [previousData, setPreviousData] = useState<PrData[]>(rawData);

  useEffect(() => {
    if (
      !login ||
      !notificationsEnabled ||
      Notification.permission !== 'granted' ||
      !previousData.length ||
      !rawData.length ||
      rawData.some((p) => p.loading)
    ) {
      if (!rawData.some((p) => p.loading)) setPreviousData(rawData);
      return;
    }

    // Notify if any PRs have become ready for review
    const prevReadyForReview = getPrsReadyForReview(previousData, login);
    const currentReadyForReview = getPrsReadyForReview(rawData, login);
    const newPrsReadyForReview = _.differenceBy(
      currentReadyForReview,
      prevReadyForReview,
      'pr.number'
    );
    for (const newPr of newPrsReadyForReview) {
      createDesktopNotification(
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
      createDesktopNotification(
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
        createDesktopNotification(
          'New comment',
          `${comment.user?.login} commented: ${comment.body}`,
          comment.html_url,
          comment.user?.avatar_url
        );
      }
    }

    if (!rawData.some((p) => p.loading)) setPreviousData(rawData);
  }, [rawData, notificationsEnabled, previousData, login, notifyForComments]);
}
