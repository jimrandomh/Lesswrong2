import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { registerComponent, Components } from 'meteor/vulcan:core';

class FormComponentDate extends Component {
  render() {
    return <Components.MuiTextField
      {...this.props}
      InputLabelProps={{
        shrink: true,
      }}
      type="date"
    />
  }
}

// Replaces FormComponentDate from vulcan-ui-bootstrap
registerComponent("FormComponentDate", FormComponentDate);
