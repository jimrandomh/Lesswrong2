import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Components, registerComponent } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import withUser from '../common/withUser';
import withErrorBoundary from '../common/withErrorBoundary';
import { notificationTypes } from '../../lib/subscriptions/notification_types';

const styles = theme => ({
  root: {
  },
  addNotificationType: {
    border: `1px solid ${grey[400]}`,
    padding: 8,
  },
  notificationType: {
  },
});

// User notification settings. This consists of a set of NotificationTypeSettings
// blocks, each of which represents a type of event you might receive
// notifications for and some settings related to batching and filtering that
// type of event. Loosely based on FormNestedArray in vulcan-forms.
class LWNotificationSettings extends PureComponent
{
  getCurrentValue() {
    return this.props.value || []
  }

  addNotificationType(notificationType) {
    const value = this.getCurrentValue()
    const defaults = notificationTypes[notificationType].defaultValue
    const newNotificationSettings = {
      type: notificationType,
      ...defaults,
    };
    this.props.updateCurrentValues({
      [`${this.props.path}.${value.length}`]: newNotificationSettings
    }, { mode: 'merge'});
  }
  
  removeItem(index) {
    this.props.updateCurrentValues({ [`${this.props.path}.${index}`]: null });
  }

  //
  // Go through this.context.deletedValues and see if any value matches both
  // the current field and the given index (ex: if we want to know if the
  // second address is deleted, we look for the presence of 'addresses.1')
  //
  isDeleted = index => {
    return this.props.deletedValues.includes(`${this.props.path}.${index}`);
  };
  
  renderAddNotificationType() {
    const { classes } = this.props;
    return (<div className={classes.addNotificationType}>
      <Typography variant="body2" component="label" className={classes.typeLabel}>
        Add Notification Type
      </Typography>
      <ul>
        {_.map(notificationTypes, (notif, key) => (<li key={key}>
          <a onClick={() => this.addNotificationType(key)}>{notif.name}</a>
        </li>))}
      </ul>
    </div>)
  }

  render() {
    const value = this.getCurrentValue()
    // do not pass FormNested's own value, input and inputProperties props down
    const forwardedProps = _.omit(this.props, 'classes', 'value', 'input', 'inputProperties', 'nestedInput');
    const { classes, errors, path } = this.props;
    // only keep errors specific to the nested array (and not its subfields)
    const nestedArrayErrors = errors.filter(error => error.path && error.path === path);
    const hasErrors = nestedArrayErrors && nestedArrayErrors.length;

    return (
      <div className={classes.root}>
        {this.renderAddNotificationType()}
        <div>
          {value.map(
            (subDocument, i) =>
              !this.isDeleted(i) && (
                <Components.NotificationTypeSettings
                  {...forwardedProps}
                  value={subDocument}
                  key={i}
                  itemIndex={i}
                  path={`${this.props.path}.${i}`}
                  removeItem={() => {
                    this.removeItem(i);
                  }}
                />
              )
          )}
        </div>
        {hasErrors ? <Components.FieldErrors errors={nestedArrayErrors} /> : null}
      </div>
    );
  }
}

LWNotificationSettings.contextTypes = {
  updateCurrentValues: PropTypes.func,
}

registerComponent("LWNotificationSettings", LWNotificationSettings,
  withStyles(styles, { name: "LWNotificationSettings" }),
  withErrorBoundary, withUser);
