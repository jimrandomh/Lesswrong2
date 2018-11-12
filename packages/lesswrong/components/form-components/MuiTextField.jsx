import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { registerComponent, Components } from 'meteor/vulcan:core';
import TextField from '@material-ui/core/TextField';
import FormLabel from '@material-ui/core/FormLabel';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  textField: {
    fontSize: "15px",
    width: "100%",
    [theme.breakpoints.down('md')]: {
      width: "100%",
    },
  },
  fullWidth: {
    width:"100%",
  },
})

class MuiTextField extends PureComponent {
  constructor(props, context) {
    super(props,context);
  }

  onChange = (event) => {
    this.context.updateCurrentValues({
      [this.props.path]: event.target.value
    })
  }

  render() {
    const { classes, value, select, children, label, multiLine, rows, fullWidth, type, defaultValue, InputLabelProps } = this.props

    return <Components.TwoColumnForm label={label}>
      <TextField
        select={select}
        value={value}
        defaultValue={defaultValue}
        onChange={this.onChange}
        multiline={multiLine}
        rows={rows}
        type={type}
        fullWidth={fullWidth}
        classes={{input: classes.input}}
        className={classnames(
          classes.textField,
          {fullWidth:fullWidth}
        )}
      >
        {children}
      </TextField>
    </Components.TwoColumnForm>;
  }
}

MuiTextField.contextTypes = {
  updateCurrentValues: PropTypes.func,
};

registerComponent("MuiTextField", MuiTextField, withStyles(styles, { name: "MuiTextField" }));
