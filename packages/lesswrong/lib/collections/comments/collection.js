/*

Comments collection

*/

import schema from './schema.js';
import { createCollection, getDefaultResolvers, getDefaultMutations } from 'meteor/vulcan:core';
import Users from 'meteor/vulcan:users';
import { Posts } from '../posts';
import { addUniversalFields } from '../../collectionUtils'
/**
 * @summary The global namespace for Comments.
 * @namespace Comments
 */

// LESSWRONG - New options
 const options = {
   newCheck: (user, document) => {
     if (!user || !document) return false;
     const post = Posts.findOne(document.postId)

     if (!Users.isAllowedToComment(user, post)) {
       return Users.canDo(user, `posts.moderate.all`)
     }
     return Users.canDo(user, 'comments.new')
   },

   editCheck: (user, document) => {
     if (!user || !document) return false;
     if (Users.canDo(user, 'comments.alignment.move.all') ||
         Users.canDo(user, 'comments.alignment.suggest')) {
       return true
     }
     return Users.owns(user, document) ? Users.canDo(user, 'comments.edit.own') : Users.canDo(user, `comments.edit.all`)
   },

   removeCheck: (user, document) => {
     if (!user || !document) return false;
     return Users.owns(user, document) ? Users.canDo(user, 'comments.edit.own') : Users.canDo(user, `comments.edit.all`)
   },
 }

 export const Comments = createCollection({

   collectionName: 'Comments',

   typeName: 'Comment',

   schema,

   resolvers: getDefaultResolvers('Comments'),

   mutations: getDefaultMutations('Comments', options),

});

Comments.checkAccess = (currentUser, comment) => {
  if (Users.isAdmin(currentUser) || Users.owns(currentUser, comment)) { // admins can always see everything, users can always see their own posts
    return true;
  } else if (comment.isDeleted) {
    return false;
  } else {
    return true;
  }
}

addUniversalFields({collection: Comments})