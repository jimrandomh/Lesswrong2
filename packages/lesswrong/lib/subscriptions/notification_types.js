import SimpleSchema from 'simpl-schema';
import { Posts } from '../collections/posts';
import { Comments } from '../collections/comments';
import { Connectors } from 'meteor/vulcan:core';

const notificationTypeFieldCommon = {
  optional: true,
  viewableBy: ['members'],
  editableBy: ['members'],
  insertableBy: ['members'],
};

export const notificationTypeSchema = new SimpleSchema({
  type: {
    ...notificationTypeFieldCommon,
    type: String,
    hidden: true,
    optional: false,
  },
  deliverOnsite: {
    ...notificationTypeFieldCommon,
    type: Boolean,
  },
  deliverByEmail: {
    ...notificationTypeFieldCommon,
    type: Boolean,
  },
  batching: {
    ...notificationTypeFieldCommon,
    type: String,
    control: "select",
    form: {
      options: () => [
        { value: "default", label: "Default (daily)" },
        { value: "daily",   label: "Daily" },
        { value: "weekly",  label: "Weekly" },
        { value: "monthly", label: "Monthly" },
      ]
    },
  },
  minKarma: {
    ...notificationTypeFieldCommon,
    type: Number,
  },
  location: {
    ...notificationTypeFieldCommon,
    type: String,
  },
  users: {
    ...notificationTypeFieldCommon,
    type: Array,
    control: "UsersListEditor",
  },
  "users.$": {
    type: String
  },
});

const commonFields = ["deliverOnsite", "deliverByEmail", "batching", "minKarma"];

const documentEvents = {
  created: "created",
  upvoted: "upvoted",
  moved: "moved",
}

// Types of notifications. Each is an object whose key is used to identify
// the notification type, and whose value is an object with:
//
//   name: String
//   Description of this notification type used in the settings UI
//
//   defaultValue: Object
//   Values of fields (in notificationTypeSchema) that are prefilled when the
//   user adds this notification type to their notifications
//
//   fields: Array[String]
//   The set of fields (in notificationTypeSchema) that apply to this
//   notification type.
//
//   eventCanGenerateNotification:
//     async (notificationSettings,document,user,event)=>bool`
//   Returns true if the given event happening on a document could generate a
//   notification for this user. `event` is one of `documentEvents`. This
//   applies type-specific filtering, but does not apply minKarma,
//   deduplication, or batching, which are applied elsewhere.
//
export const notificationTypes = {
  "replies_to_posts": {
    name: "Replies to my posts",
    defaultValue: {
      deliverOnsite: true,
      batching: "default",
    },
    fields: [...commonFields],
    
    eventCanGenerateNotification: async (notificationSettings, document, user, event) => {
      let postId = document.postId;
      if (!postId) return false;
      let post = await Connectors.get(Posts, {documentId:postId});
      if (!post) return false;
      return post.userId === user._id;
    }
  },
  "replies_to_comments": {
    name: "Replies to my comments",
    defaultValue: {
      deliverOnsite: true,
      batching: "default",
    },
    fields: [...commonFields],
    
    eventCanGenerateNotification: async (notificationSettings, document, user, event) => {
      let parentCommentId = document.parentCommentId;
      if (!parentCommentId) return false;
      let parentComment = await Connectors.get(Comments, {documentId:parentCommentId});
      if (!parentComment) return false;
      return parentComment.userId === user._id;
    }
  },
  "events_near_location": {
    name: "Events near location",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "instant",
    },
    fields: [...commonFields, "location"],
    
    eventCanGenerateNotification: async (notificationSettings, document, user, event) => {
      let location = notificationSettings.location;
      if (!location) return false;
      // TODO
      return false;
    }
  },
  "new_posts": {
    name: "New Posts",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "default",
      minKarma: 10,
    },
    fields: [...commonFields],
    
    eventCanGenerateNotification: async (notificationSettings, document, user, event) => {
      // TODO
      return false;
    }
  },
  "posts_in_group": {
    name: "Posts in group(s)",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "default",
    },
    fields: [...commonFields],
    
    eventCanGenerateNotification: async (notificationSettings, document, user, event) => {
      // TODO
      return false;
    }
  },
  "posts_by_user": {
    name: "Posts by user(s)",
    defaultValue: {
      deliverOnsite: true,
      batching: "default",
    },
    fields: [...commonFields, "users"],
    
    eventCanGenerateNotification: async (notificationSettings, document, user, event) => {
      let users = notificationSettings.users;
      if (!users) return false;
      // TODO
      return false;
    }
  },
};
