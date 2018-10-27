import { notificationTypes } from './notification_types'
import { Users } from '../collections/users';
import { Connectors } from 'meteor/vulcan:core';

async function getAllUsers()
{
  return Connectors.find(Users, {});
}

// Return a conservative superset of the set of users who would get
// notifications of a newly created post/comment/etc.
export async function usersToPotentiallyNotifiedOfNew(document)
{
  // TODO
  return await getAllUsers();
}

// Check a user's notification settings, and check if they should be notified
// of a given post/comment/etc being new (just created, or new in a section).
// If so, return an array of new notifications.
export async function getUserNotificationsOfNew(document, user)
{
  for(let i=0; i<user.notificationSettings; i++)
  {
    let notificationType = notificationTypes[user.notificationSettings[i].type];
    let isNotified = away notificationType.documentCanGenerateNotification(document, user);
    // TODO
  }
  return [];
}

// Return a conservative superset of the set of users who would get
// notifications as a result of a post/comment/etc being upvoted.
export async function usersPotentiallyNotifiedOfUpvoted(document, oldScore, newScore)
{
  // TODO
  return await getAllUsers();
}

// Check a user's notification settings, and check if they should be notified
// of a given post/comment/etc having been upvoted from oldScore to newScore.
// If so, return an array of new notifications.
export function getUserNotificationsOfUpvoted(document, user, oldScore, newScore)
{
  for(let i=0; i<user.notificationSettings; i++)
  {
    let notificationType = notificationTypes[user.notificationSettings[i].type];
    // TODO
  }
  return [];
}
