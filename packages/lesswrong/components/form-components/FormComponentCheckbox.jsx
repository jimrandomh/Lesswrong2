import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { registerComponent, Components } from 'meteor/vulcan:core';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    marginRight:theme.spacing.unit*3,
    marginTop: 5,
    display: "flex",
    alignItems: "center"
  },
  size: {
    width:36,
    height:0
  },
  inline: {
    display:"inline",
  }
})

class FormComponentCheckbox extends Component {
  constructor(props, context) {
    super(props,context);
  }

  render() {
    const { classes, label, leftLabel, disabled=false } = this.props
    const checkbox = (<React.Fragment>
      <Checkbox
        className={classes.size}
        checked={this.props.value}
        onChange={(event, checked) => {
          this.context.updateCurrentValues({
            [this.props.path]: checked
          })
        }}
        disabled={disabled}
        disableRipple
      />
      <Typography className={classes.inline} variant="body2" component="label">{label}</Typography>
    </React.Fragment>);
    
    if(this.props.twoColumn) {
      return (
        <Components.TwoColumnForm label={leftLabel}>
          {checkbox}
        </Components.TwoColumnForm>);
    } else {
      return <div className={classes.root}>
        {checkbox}
      </div>
    }
  }
}

FormComponentCheckbox.contextTypes = {
  updateCurrentValues: PropTypes.func,
};

// Replaces FormComponentCheckbox from vulcan-ui-bootstrap
registerComponent("FormComponentCheckbox", FormComponentCheckbox, withStyles(styles, { name: "FormComponentCheckbox" }));
