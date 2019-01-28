import { Components, registerComponent } from 'meteor/vulcan:core';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { karmaChangeNotifierDefaultSettings } from '../../lib/karmaChanges.js';
import withTimezone from '../common/withTimezone';
import moment from 'moment-timezone';

const styles = theme => ({
  radioGroup: {
    marginTop: 4,
    marginLeft: 12,
  },
  radioButton: {
    padding: 4,
  },
  inline: {
    display: "inline",
  },
});

const karmaNotificationTimingChoices = {
  disabled: {
    label: "Disabled",
  },
  daily: {
    label: "Batched daily (default)",
  },
  weekly: {
    label: "Batched weekly",
  },
  realtime: {
    label: "Realtime",
  },
};

class KarmaChangeNotifierSettings extends PureComponent {
  setUpdateFrequency = (updateFrequency) => {
    const oldSettings = this.props.value || karmaChangeNotifierDefaultSettings;
    const settings = { ...oldSettings, updateFrequency:updateFrequency };
    this.context.updateCurrentValues({
      [this.props.path]: settings
    });
  }
  
  setBatchingTimeOfDay = (timeOfDay, tz) => {
    const oldTimeLocalTZ = this.getBatchingTimeLocalTZ();
    const newTimeLocalTZ = {
      timeOfDay: timeOfDay,
      dayOfWeek: oldTimeLocalTZ.dayOfWeek
    };
    const newTimeGMT = this.convertTimezone(newTimeLocalTZ.timeOfDay, newTimeLocalTZ.dayOfWeek, tz, "GMT");
    
    const oldSettings = this.props.value || karmaChangeNotifierDefaultSettings;
    const newSettings = {
      ...oldSettings,
      timeOfDayGMT: newTimeGMT.timeOfDay,
      dayOfWeekGMT: newTimeGMT.dayOfWeek,
    };
    this.context.updateCurrentValues({
      [this.props.path]: newSettings
    });
  }
  
  setBatchingDayOfWeek = (dayOfWeek, tz) => {
    const oldTimeLocalTZ = this.getBatchingTimeLocalTZ();
    const newTimeLocalTZ = {
      timeOfDay: oldTimeLocalTZ.timeOfDay,
      dayOfWeek: dayOfWeek
    };
    const newTimeGMT = this.convertTimezone(newTimeLocalTZ.timeOfDay, newTimeLocalTZ.dayOfWeek, tz, "GMT");
    
    const oldSettings = this.props.value || karmaChangeNotifierDefaultSettings;
    const newSettings = {
      ...oldSettings,
      timeOfDayGMT: newTimeGMT.timeOfDay,
      dayOfWeekGMT: newTimeGMT.dayOfWeek,
    };
    this.context.updateCurrentValues({
      [this.props.path]: newSettings
    });
  }
  
  // Given a time of day (number of hours, 0-24)
  convertTimezone = (timeOfDay, dayOfWeek, fromTimezone, toTimezone) => {
    let time = moment()
      .tz(fromTimezone)
      .day(dayOfWeek).hour(timeOfDay).minute(0)
      .tz(toTimezone);
    return {
      timeOfDay: time.hour(),
      dayOfWeek: time.format("dddd")
    };
  }
  
  getBatchingTimeLocalTZ = () => {
    const settings = this.props.value || karmaChangeNotifierDefaultSettings;
    const { timeOfDayGMT, dayOfWeekGMT } = settings;
    const { timeOfDay, dayOfWeek } = this.convertTimezone(timeOfDayGMT, dayOfWeekGMT, "GMT", this.props.timezone);
    return { timeOfDay, dayOfWeek };
  }
  
  render() {
    const { timezone, classes } = this.props;
    const settings = this.props.value || karmaChangeNotifierDefaultSettings;
    
    const {timeOfDay, dayOfWeek} = this.getBatchingTimeLocalTZ();
    
    return <div>
      <Typography variant="body1">
        Vote Notifications
      </Typography>
      <Typography variant="body2">
        Shows upvotes and downvotes to your posts and comments on top of the
        page. By default, this is on but only updates once per day, to avoid
        creating a distracting temptation to frequently recheck it. Can be
        set to real time (removing the batching), disabled (to remove it
        from the header entirely), or to some other update interval.
      </Typography>
      
      <RadioGroup className={classes.radioGroup}
        value={settings.updateFrequency}
        onChange={(event, newValue) => this.setUpdateFrequency(newValue)}
      >
        {_.map(karmaNotificationTimingChoices, (timingChoice, key) =>
          <FormControlLabel
            key={key}
            value={key}
            control={<Radio className={classes.radioButton} />}
            label={
              <Typography className={classes.inline} variant="body2" component="label">
                {timingChoice.label}
              </Typography>
            }
            classes={{
              label: null,
            }}
          />
        )}
      </RadioGroup>
      
      <Typography variant="body2">
        Batched updates occur at <Select
          value={timeOfDay}
          onChange={(event) => this.setBatchingTimeOfDay(event.target.value, timezone)}
        >
          { _.range(24).map(hour =>
              <MenuItem key={hour} value={hour}>{hour}:00</MenuItem>
            )
          }
          
        </Select>
        
        {moment().tz(timezone).format("z")}
        
        { settings.updateFrequency==="weekly" && <span>
            on <Select value={dayOfWeek}
              onChange={(event) => this.setBatchingDayOfWeek(event.target.value, timezone)}
            >
              <MenuItem value="Sunday">Sunday</MenuItem>
              <MenuItem value="Monday">Monday</MenuItem>
              <MenuItem value="Tuesday">Tuesday</MenuItem>
              <MenuItem value="Wednesday">Wednesday</MenuItem>
              <MenuItem value="Thursday">Thursday</MenuItem>
              <MenuItem value="Friday">Friday</MenuItem>
              <MenuItem value="Saturday">Saturday</MenuItem>
            </Select>
          </span>
        }
      </Typography>
    </div>
  }
}

KarmaChangeNotifierSettings.contextTypes = {
  updateCurrentValues: PropTypes.func,
};

registerComponent("KarmaChangeNotifierSettings", KarmaChangeNotifierSettings,
  withStyles(styles, {name: "KarmaChangeNotifierSettings"}),
  withTimezone);