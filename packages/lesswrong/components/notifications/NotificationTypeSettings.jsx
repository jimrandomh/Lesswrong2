import React, { PureComponent } from 'react';
import { Components, registerComponent } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import { notificationTypes } from '../../lib/subscriptions/notification_types';
import get from 'lodash/get';

const styles = theme => ({
  root: {
    border: `1px solid ${grey[400]}`,
    padding: 8,
    marginTop: 8,
  },
  typeLabel: {
  },
  settingsForm: {
  },
  removeButtonWrapper: {
  },
  removeButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "canter",
  },
});

class NotificationTypeSettings extends PureComponent
{
  render() {
    const { classes, value, nestedFields, name, path, removeItem, itemIndex, ...otherProps } = this.props;
    const { document } = this.props;
    
    const isArray = typeof itemIndex !== 'undefined';
    const notificationType = value.type;
    const typeLabel = notificationTypes[notificationType].name;
    
    return (
      <div className={classes.root}>
        <label className={classes.typeLabel}>
          {typeLabel}
        </label>
        <div className={classes.settingsForm}>
          {nestedFields.map((field, i) => {
            return (
              <Components.FormComponent
                key={i}
                {...otherProps}
                {...field}
                path={`${path}.${field.name}`}
                itemIndex={itemIndex}
              />
            );
          })}
        </div>
        {isArray && [
          <div key="remove-button" className={classes.removeButtonWrapper}>
            <Components.Button
              className={classes.removeButton}
              variant="danger" size="small"
              onClick={() => { removeItem(name); }}
            >
              <Components.IconRemove height={12} width={12} />
            </Components.Button>
          </div>,
        ]}
      </div>
    );
  }
}



registerComponent("NotificationTypeSettings", NotificationTypeSettings,
  withStyles(styles, { name: "NotificationTypeSettings" })
);