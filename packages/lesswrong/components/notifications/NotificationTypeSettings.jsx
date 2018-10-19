import React, { PureComponent } from 'react';
import { Components, registerComponent } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import { notificationTypes } from '../../lib/subscriptions/notification_types';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    position: "relative",
    border: `1px solid ${grey[400]}`,
    padding: 8,
    marginTop: 8,
  },
  typeLabel: {
  },
  settingsForm: {
  },
  closeIcon: {
    position: "absolute",
    right: 8,
    top: 8,
    color: "rgba(0,0,0,0.5)",
    height: "15px",
    width: "15px",
  },
});

class NotificationTypeSettings extends PureComponent
{
  render() {
    const { classes, value, nestedFields, name, path, removeItem, itemIndex, ...otherProps } = this.props;
    
    const isArray = typeof itemIndex !== 'undefined';
    const notificationType = value.type;
    const typeLabel = notificationTypes[notificationType].name;
    
    const fieldsToShow = notificationTypes[notificationType].fields;
    
    return (
      <div className={classes.root}>
        <Typography variant="body2" component="label" className={classes.typeLabel}>
          {typeLabel}
        </Typography>
        <div className={classes.settingsForm}>
          {nestedFields
            .filter(field => _.find(fieldsToShow, f=>f===field.name))
            .map((field, i) =>
              <Components.FormComponent
                key={i}
                {...otherProps}
                {...field}
                path={`${path}.${field.name}`}
                itemIndex={itemIndex}
              />
            )
          }
        </div>
        {isArray &&
          <a>
            <CloseIcon className={classes.closeIcon} onClick={() => removeItem(name)}/>
          </a>
        }
      </div>
    );
  }
}



registerComponent("NotificationTypeSettings", NotificationTypeSettings,
  withStyles(styles, { name: "NotificationTypeSettings" })
);