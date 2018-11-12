import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { registerComponent, Components } from 'meteor/vulcan:core';

class FormComponentDate extends Component {
  render() {
    return (
      <Components.TwoColumnForm label={this.props.label}>
        <Components.MuiTextField
          {...this.props}
          type="date"
        />
      </Components.TwoColumnForm>
    );
  }
}

registerComponent("FormComponentDate", FormComponentDate);
