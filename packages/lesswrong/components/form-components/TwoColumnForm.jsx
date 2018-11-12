import React, { Component } from 'react';
import { registerComponent, Components } from 'meteor/vulcan:core';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  label: {
    display: "inline-block",
    width: 200,
    paddingRight: 20,
    position: "relative",
    textAlign: "right",
    top: 4,
  },
  rightColumn: {
    display: "inline-block",
    width: 350,
  },
});

const TwoColumnForm = (props) => {
  const { classes, label, children } = props;
  return (<div>
    <Typography className={classes.label} variant="body2" component="label">
      {label}
    </Typography>
    <div className={classes.rightColumn}>
      {children}
    </div>
  </div>);
}

registerComponent("TwoColumnForm", TwoColumnForm, withStyles(styles, {name: "TwoColumnForm"}));