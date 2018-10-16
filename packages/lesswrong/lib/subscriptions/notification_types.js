import SimpleSchema from 'simpl-schema';

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
  },
  minKarma: {
    ...notificationTypeFieldCommon,
    type: Number,
  }
});

export const notificationTypes = {
  "replies_to_posts": {
    name: "Replies to my posts",
    defaultValue: {
      deliverOnsite: true,
      batching: "daily",
    }
  },
  "replies_to_comments": {
    name: "Replies to my comments",
    defaultValue: {
      deliverOnsite: true,
      batching: "daily",
    }
  },
  "events_near_location": {
    name: "Events near location",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "instant",
    }
  },
  "new_posts": {
    name: "New Posts",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "daily",
      minKarma: 10,
    }
  },
  "posts_in_group": {
    name: "Posts in group(s)",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "daily",
    }
  },
  "posts_by_user": {
    name: "Posts by user(s)",
    defaultValue: {
      deliverOnsite: true,
      batching: "daily",
    }
  },
};
