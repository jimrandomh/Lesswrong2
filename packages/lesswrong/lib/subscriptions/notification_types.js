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
});

const commonFields = ["deliverOnsite", "deliverByEmail", "batching", "minKarma"];

export const notificationTypes = {
  "replies_to_posts": {
    name: "Replies to my posts",
    defaultValue: {
      deliverOnsite: true,
      batching: "default",
    },
    fields: [...commonFields],
  },
  "replies_to_comments": {
    name: "Replies to my comments",
    defaultValue: {
      deliverOnsite: true,
      batching: "default",
    },
    fields: [...commonFields],
  },
  "events_near_location": {
    name: "Events near location",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "instant",
    },
    fields: [...commonFields, "location"],
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
  },
  "posts_in_group": {
    name: "Posts in group(s)",
    defaultValue: {
      deliverOnsite: true,
      deliverByEmail: true,
      batching: "default",
    },
    fields: [...commonFields],
  },
  "posts_by_user": {
    name: "Posts by user(s)",
    defaultValue: {
      deliverOnsite: true,
      batching: "default",
    },
    fields: [...commonFields],
  },
};
