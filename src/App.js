import React, { Component } from "react";
import "./App.scss";
import Select from "react-select";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      localTime: "",
      localMin: "",
      otherTimezone: [],
      selectedCity: "",
      selectedLabel: "",
      label: "",
      elementsDisabled: false,
      options: [
        { value: "Asia/Singapore", label: "Singapore" },
        { value: "Asia/Tokyo", label: "Tokyo" },
        { value: "Asia/Seoul", label: "Seoul" },
        { value: "Australia/Melbourne", label: "Melbourne" },
        { value: "Australia/Sydney", label: "Sydney" },
        { value: "Europe/London", label: "London" },
        { value: "Europe/Paris", label: "Paris" },
        { value: "Europe/Berlin", label: "Berlin" },
        { value: "America/New_York", label: "New York" },
        { value: "America/Los_Angeles", label: "Los Angeles" },
      ],
    };
  }

  componentDidMount() {
    const localTime = "Asia/Manila";
    this.getTime(localTime, "localTime");
    setInterval(() => this.getTime(localTime, "localTime"), 5000);
  }

  getTime(location, key, label) {
    const url = "http://worldtimeapi.org/api/timezone/" + location;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.datetime) {
          const { timezone, datetime, abbreviation, utc_offset } = data;
          const renderedHour = this.renderTime(datetime);
          if (key === "localTime") {
            this.setState({
              [key]: renderedHour,
              localMin: this.renderTime(datetime, true),
            });
          } else {
            let city = timezone.split("/")[1].replace("_", " ");
            this.setState({
              otherTimezone: [
                ...this.state.otherTimezone,
                {
                  timezone: city,
                  label,
                  time: renderedHour,
                  abbreviation,
                  difference: this.getDifference(utc_offset, renderedHour),
                  value: { value: timezone, label: city },
                },
              ],
              selectedCity: "",
              selectedLabel: "",
              label: "",
              elementsDisabled: false,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getDifference = (utc, time) => {
    const { localTime } = this.state;
    const mnl = localTime.split(":")[0];
    const utcOffset = utc.split(":")[0];
    const hourOffset = time.split(":")[0];
    const difference = hourOffset - mnl;
    const hoursText = Math.abs(difference) > 1 ? " hours " : " hour ";
    let text = "";

    if (difference === 0) text = "Time same with Manila";
    else if (utcOffset < 8) {
      text = Math.abs(difference) + hoursText + "behind Manila";
    } else text = Math.abs(difference) + hoursText + "ahead Manila";

    return text;
  };

  addTimezone = (timezone, label) => {
    let timezoneList = this.state.options;
    timezoneList = timezoneList.filter((val) => val.value !== timezone);
    this.setState({ options: timezoneList });
    this.getTime(timezone, "otherTimezone", label);
  };

  removeTime = (index, val) => {
    const cities = this.state.otherTimezone;
    const timezoneList = this.state.options;
    timezoneList.push(val);
    cities.splice(index, 1);
    this.setState({ otherTimezone: cities, options: timezoneList });
  };

  renderTime = (time, isMin) => {
    const timeStamp = time.split("T")[1].split(".")[0].split(":");
    if (isMin) return timeStamp[1];
    else return timeStamp[0] + ":";
  };

  renderInput = () => {
    const { selectedCity, selectedLabel, label, elementsDisabled, options } =
      this.state;

    return (
      <div className="input_container">
        <div className="react-select-container">
          <Select
            options={options}
            placeholder="Select city"
            value={{ value: selectedCity, label: selectedLabel }}
            onChange={(val) =>
              this.setState({
                selectedCity: val.value,
                selectedLabel: val.label,
              })
            }
            disabled={elementsDisabled}
          />
        </div>
        <input
          className="timezone_label"
          placeholder="Add label (optional)"
          maxLength="20"
          value={label}
          onChange={(e) => this.setState({ label: e.target.value })}
          disabled={elementsDisabled}
        />
        <button
          className="submit_btn"
          onClick={() => {
            this.addTimezone(selectedCity, label);
            this.setState({ elementsDisabled: true });
          }}
          disabled={!selectedCity || elementsDisabled}
        >
          Add city
        </button>
      </div>
    );
  };

  render() {
    const { localTime, otherTimezone, localMin } = this.state;
    return (
      <div className="world_clock_container container">
        <div className="local_time">
          <div className="location">Manila</div>
          <div className="time">
            {localTime}
            {localMin}
          </div>
        </div>
        <div className="other_time_container row">
          {otherTimezone && otherTimezone.length
            ? otherTimezone.map((item, index) => {
                const {
                  timezone,
                  label,
                  time,
                  abbreviation,
                  difference,
                  value,
                } = item;
                return (
                  <div
                    className="col-12 col-md-3"
                    key={`other_timezone${index}`}
                  >
                    <div className="other_time">
                      <div
                        className="display_remove"
                        onClick={() => this.removeTime(index, value)}
                      >
                        Click to remove
                      </div>
                      <div className="city">{timezone}</div>
                      <div className="label">{label ? label : ""}</div>
                      <div className="time">
                        {time}
                        {localMin}
                      </div>
                      <div className="abb">{abbreviation}</div>
                      <div className="diff">{difference}</div>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
        {otherTimezone && otherTimezone.length && otherTimezone.length === 4
          ? ""
          : this.renderInput()}
      </div>
    );
  }
}

export default App;
