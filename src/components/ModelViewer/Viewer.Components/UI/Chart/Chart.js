import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  CartesianGrid,
  XAxis, YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

class ChartUI extends React.Component {
    state = {
      data: [],
    }

    componentDidMount() {
      const { getSensorData, type } = this.props;

      getSensorData(type).then((result) => { this.setState({ data: result }); });
      setInterval(() => {
        getSensorData(type).then((result) => { this.setState({ data: result }); });
      }, 1000);
    }

    render() {
      const { data } = this.state;
      const { type } = this.props;

      return (
        <LineChart
          width={550}
          height={250}
          data={data}
          margin={{
            top: 25,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={type === 'temperatureSensor' ? 'temperature' : 'moisture'} stroke="#8884d8" />
          {/* <Line type="monotone" dataKey="base" stroke="#82ca9d" /> */}
        </LineChart>
      );
    }
}

ChartUI.propTypes = {
  getSensorData: PropTypes.func,
  type: PropTypes.string,
};
ChartUI.defaultProps = {
  getSensorData: () => {},
  type: '',
};

export default ChartUI;
