import React from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Card,
  Checkbox,
  Button,
  notification,
  Input,
} from 'antd';

import BuildingStatusTable from '../../../UI/Table/BuildingStatusTable';
import Chart from '../../../UI/Chart/Chart';
import { timeConverterHMS, timeConverter } from '../../../Utility/utility';


class ReactPanelContent extends React.Component {
  state = {
    refresh: false,
    urlTmp: null,
    peopleObj: [],
    sensorOnFire: [],
  }

  deviceManageRef = React.createRef();

  moistureSensorRef = React.createRef();

  componentDidMount() {
    const { temperaturePanelSettings, moisturePanelSettings } = this.props;

    if (this.moistureSensorRef.current != null) {
      moisturePanelSettings.panel.container.style.width = '1015px';
      moisturePanelSettings.panel.container.style.height = `${this.moistureSensorRef.current.clientHeight + 30}px`;
    }

    // if sensor already got url, fetch data from that url
    if (!temperaturePanelSettings.fetchDataFromSensor) {
      temperaturePanelSettings.temperatureSensorTagData.map((sensor) => {
        if (sensor.url) {
          // this.getDataFromSensor(sensor.url, sensor._id, 'temperatureSensor');
        }
        return true;
      });

      moisturePanelSettings.moistureSensorTagData.map((sensor) => {
        if (sensor.url) {
          // this.getDataFromSensor(sensor.url, sensor._id, 'moistureSensor');
        }
        return true;
      });

      temperaturePanelSettings.setFetchDataStatus();
    }

    // set test data for 000001 & 000002 temperature sensors
    this.countSensor1 = 0;
    this.countSensor2 = 0;

    setInterval(() => {
      this.countSensor1 += 1.3; this.setSensorData(10 + Math.random() * this.countSensor1, '000001', 'temperatureSensor');
    }, 1000);
    setInterval(() => {
      this.countSensor2 += 1; this.setSensorData(15 + Math.random() * this.countSensor2, '000002', 'temperatureSensor');
    }, 1000);
  }

  componentDidUpdate() {
    const { devicePanelSettings, moisturePanelSettings } = this.props;

    if (this.deviceManageRef.current != null) {
      devicePanelSettings.panel.container.style.width = '1015px';
      devicePanelSettings.panel.container.style.height = `${this.deviceManageRef.current.clientHeight + 30}px`;
    }
    if (this.moistureSensorRef.current != null) {
      moisturePanelSettings.panel.container.style.width = '1015px';
      moisturePanelSettings.panel.container.style.height = `${this.moistureSensorRef.current.clientHeight + 30}px`;
    }
  }

  refreshPanel = () => {
    this.setState(prevState => ({
      refresh: !prevState.refresh,
    }));
  }

  onCheckboxChange = (e) => {
    const { listPanelSettings } = this.props;
    listPanelSettings.setCheckboxStatus(parseInt(e.target.value, 10), 'switch');
    this.refreshPanel();
  }

  onButtonClick = (e) => {
    const { listPanelSettings } = this.props;
    listPanelSettings.setButtonStatus(parseInt(e.target.id, 10));

    if (parseInt(e.target.id, 10) < listPanelSettings.checkboxStatus.length) {
      listPanelSettings.setCheckboxStatus(parseInt(e.target.id, 10), 'setTrue');
    }
    this.refreshPanel();
  }

  onShowPeople = (peopleArray) => {
    const { buildingStatusSettings } = this.props;
    const peopleObj = [];

    peopleArray.map((people) => {
      peopleObj.push(
        buildingStatusSettings.drawThreeSphere(people.position, people.status, 0.8, -6),
      );
      return true;
    });
    this.setState({ peopleObj });
  }

  onRemovePeople = () => {
    const { buildingStatusSettings } = this.props;
    const { peopleObj } = this.state;
    buildingStatusSettings.removeThreeObject(peopleObj);
    this.setState({ peopleObj: [] });
  }

  onUrlInputChange = (e) => {
    this.setState({ urlTmp: e.target.value });
  }

  onUrlButtonClicked = (e) => {
    const { devicePanelSettings, temperaturePanelSettings, moisturePanelSettings } = this.props;
    const { urlTmp } = this.state;
    let sensorIndex = null;

    if (e.target.id === 'temperatureSensor') {
      temperaturePanelSettings.temperatureSensorTagData.map((device, index) => {
        if (device._id === devicePanelSettings.deviceIdSelect) {
          sensorIndex = index;
        }
        return true;
      });
      temperaturePanelSettings.temperatureSensorTagData[sensorIndex].url = urlTmp;
      // this.getDataFromSensor(urlTmp, devicePanelSettings.deviceIdSelect, 'temperatureSensor');
    } else if (e.target.id === 'moistureSensor') {
      moisturePanelSettings.moistureSensorTagData.map((device, index) => {
        if (device._id === devicePanelSettings.deviceIdSelect) {
          sensorIndex = index;
        }
        return true;
      });
      moisturePanelSettings.moistureSensorTagData[sensorIndex].url = urlTmp;
      // this.getDataFromSensor(urlTmp, devicePanelSettings.deviceIdSelect, 'moistureSensor');
    }
    this.setState({ urlTmp: null });
  }

  getDataFromSensor = async (url, targetId, type) => {
    setInterval(() => {
      axios.defaults.baseURL = 'https://us.wio.seeed.io';
      axios.get(
        'v1/node/GroveTempHumProD1/temperature?access_token=5d849a2515d6041082d9736b3925a334',
      )
        .then((response) => {
          const { data } = response;
          this.setSensorData(data.celsius_degree, targetId, type);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 1000);
  }

  getSensorData = async (type) => {
    let result = null;
    const { devicePanelSettings } = this.props;
    axios.defaults.baseURL = 'http://localhost:8000';
    await axios.get(`/sensor/${type}/data/${devicePanelSettings.deviceIdSelect}`)
      .then((response) => {
        const { data } = response;
        result = data.map(d => ({ ...d, name: timeConverterHMS(d.name) })).reverse();
      })
      .catch((error) => {
        console.log(error);
      });
    return result;
  }

  setSensorData = async (data, id, type) => {
    const { temperaturePanelSettings } = this.props;
    const { sensorOnFire } = this.state;

    if (type === 'temperatureSensor') {
      const openNotificationWithIcon = (notificationType) => {
        notification[notificationType]({
          message: 'Fire Alarm Activated',
          description: (
            <div>
              Level: 6
              <br />
              Temperature: {data} / exceed 40 degree
              <br />
              Time: {timeConverter(new Date().getTime())}
            </div>),
        });
      };
      if (data > 40) {
        let isOnFire = false;
        sensorOnFire.map((sensor) => {
          if (sensor.id === id) {
            isOnFire = true;
          }
          return true;
        });
        if (!isOnFire) {
          openNotificationWithIcon('warning');
          this.setState((prevState) => {
            prevState.sensorOnFire.push({
              id,
            });
          });

          let sensorPosition = {};
          temperaturePanelSettings.temperatureSensorTagData.map((sensor) => {
            if (sensor._id === id) {
              const { position } = sensor;
              sensorPosition = position;
            }
            return true;
          });
          temperaturePanelSettings.drawFireArea(7, [sensorPosition.x, sensorPosition.y]);
          temperaturePanelSettings.setPenalty([sensorPosition.x, sensorPosition.y]);
        }
      }
    }

    axios.defaults.baseURL = 'http://localhost:8000';
    axios.post(`/sensor/${type}`, type === 'temperatureSensor'
      ? {
        name: new Date().getTime(),
        temperature: data,
        bindTagId: id,
      }
      : {
        name: new Date().getTime(),
        moisture: Math.random() * 15 + 5,
        bindTagId: id,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    let content = null;

    const {
      contentType,
      listPanelSettings,
      temperaturePanelSettings,
      cameraPanelSettings,
      devicePanelSettings,
      moisturePanelSettings,
      buildingStatusSettings,
    } = this.props;

    let sensorUrl = null;
    if (contentType === 'sensor') {
      temperaturePanelSettings.temperatureSensorTagData.map((device) => {
        if (device._id === devicePanelSettings.deviceIdSelect) {
          sensorUrl = device.url;
        }
        return true;
      });
    } else if (contentType === 'moistureSensor') {
      moisturePanelSettings.moistureSensorTagData.map((device) => {
        if (device._id === devicePanelSettings.deviceIdSelect) {
          sensorUrl = device.url;
        }
        return true;
      });
    }

    switch (contentType) {
      case 'video':
        content = (
          <div className="camera-content">
            <ReactPlayer url={cameraPanelSettings.fakeCameraData} playing />
          </div>
        );
        break;
      case 'sensor':
        if (sensorUrl) {
          content = (
            <div className="sensor-content">
              <Chart getSensorData={this.getSensorData} type="temperatureSensor" />
            </div>
          );
        } else {
          content = (
            <div className="sensor-content">
              <Card title="Please Enter Url">
                <Input placeholder="Your Url" onChange={this.onUrlInputChange} style={{ marginTop: '40px' }} />
                <Button id="temperatureSensor" onClick={this.onUrlButtonClicked} style={{ float: 'right', marginBottom: '20px', marginTop: '60px' }}>Save</Button>
              </Card>
            </div>
          );
        }
        break;
      case 'tagList':
        content = (
          <div className="tag-list-content">
            <Card style={{ width: 350 }}>
              <Row type="flex" align="middle" gutter={[0, 35]}>
                <Col span={16}>
                  <Checkbox
                    checked={listPanelSettings.checkboxStatus[0]}
                    name="cb_camera"
                    value="0"
                    onChange={this.onCheckboxChange}
                    disabled={listPanelSettings.buttonStatus[0]}
                  >
                    Camera
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Button id="0" type={listPanelSettings.buttonStatus[0] ? 'danger' : 'primary'} onClick={this.onButtonClick}>
                    {listPanelSettings.buttonStatus[0] ? 'Creating' : 'Create new'}
                  </Button>
                </Col>
              </Row>
              <Row type="flex" align="middle" gutter={[0, 35]}>
                <Col span={16}>
                  <Checkbox
                    style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}
                    checked={listPanelSettings.checkboxStatus[1]}
                    name="cb_temperature_sensor"
                    value="1"
                    onChange={this.onCheckboxChange}
                    disabled={listPanelSettings.buttonStatus[1]}
                  >
                    Temperature Sensor
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Button id="1" type={listPanelSettings.buttonStatus[1] ? 'danger' : 'primary'} onClick={this.onButtonClick}>
                    {listPanelSettings.buttonStatus[1] ? 'Creating' : 'Create new'}
                  </Button>
                </Col>
              </Row>
              <Row type="flex" align="middle" gutter={[0, 35]}>
                <Col span={16}>
                  <Checkbox
                    style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}
                    checked={listPanelSettings.checkboxStatus[2]}
                    name="cb_moisture_sensor"
                    value="2"
                    onChange={this.onCheckboxChange}
                    disabled={listPanelSettings.buttonStatus[2]}
                  >
                    Moisture Sensor
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <Button id="2" type={listPanelSettings.buttonStatus[2] ? 'danger' : 'primary'} onClick={this.onButtonClick}>
                    {listPanelSettings.buttonStatus[2] ? 'Creating' : 'Create new'}
                  </Button>
                </Col>
              </Row>
              <Row type="flex" align="middle" gutter={[0, 35]}>
                <Col span={21}>
                  <div>
                    <Button id="3" type={listPanelSettings.buttonStatus[3] ? 'danger' : 'default'} onClick={this.onButtonClick} block>
                      {listPanelSettings.buttonStatus[3] ? 'Deleting' : 'Delete'}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        );
        break;
      case 'moistureSensor':
        if (sensorUrl) {
          content = (
            <div className="moisture-content">
              <Chart getSensorData={this.getSensorData} type="MoistureSensor" />
            </div>
          );
        } else {
          content = (
            <div className="moisture-content">
              <Card title="Please Enter Url">
                <Input placeholder="Your Url" onChange={this.onUrlInputChange} style={{ marginTop: '40px' }} />
                <Button id="moistureSensor" onClick={this.onUrlButtonClicked} style={{ float: 'right', marginBottom: '20px', marginTop: '60px' }}>Save</Button>
              </Card>
            </div>
          );
        }
        break;
      case 'buildingStatus':
        content = (
          <div className="structure-analysis-content">
            <Card>
              <BuildingStatusTable
                showPeopleClicked={this.onShowPeople}
                removePeopleClicked={this.onRemovePeople}
                container={buildingStatusSettings.container}
                impl={buildingStatusSettings.impl}
                getModelBoundingBox={buildingStatusSettings.getModelBoundingBox}
                execute={buildingStatusSettings.execute}
                penalty={buildingStatusSettings.penalty}
              />
            </Card>
          </div>
        );
        break;
      default:
        content = (<div />);
    }

    return (
      <div className="react-panel-content" style={{ margin: 0 }}>
        {content}
      </div>
    );
  }
}

ReactPanelContent.propTypes = {
  contentType: PropTypes.string,
  listPanelSettings: PropTypes.shape({
    setButtonStatus: PropTypes.func,
    setCheckboxStatus: PropTypes.func,
    buttonStatus: PropTypes.arrayOf(PropTypes.bool),
    checkboxStatus: PropTypes.arrayOf(PropTypes.bool),
  }),
  temperaturePanelSettings: PropTypes.shape({
    fakeTemperatureSensorData: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.number,
      base: PropTypes.number,
      temperature: PropTypes.number,
      amt: PropTypes.number,
    })),
    fetchDataFromSensor: PropTypes.bool,
    setFetchDataStatus: PropTypes.func,
    temperatureSensorTagData: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      url: PropTypes.string,
    })),
    drawFireArea: PropTypes.func,
    setPenalty: PropTypes.func,
  }),
  cameraPanelSettings: PropTypes.shape({
    fakeCameraData: PropTypes.string,
  }),
  devicePanelSettings: PropTypes.shape({
    setDeviceTypeSelect: PropTypes.func,
    setDeviceIdSelect: PropTypes.func,
    setDeviceHandSelecting: PropTypes.func,
    deviceTypeSelect: PropTypes.string,
    deviceIdSelect: PropTypes.string,
    selecting: PropTypes.bool,
    panel: PropTypes.shape({
      container: PropTypes.shape({
        style: PropTypes.shape({
          width: PropTypes.string,
          height: PropTypes.string,
        }),
      }),
    }),
  }),
  moisturePanelSettings: PropTypes.shape({
    moistureSensorIdSelect: PropTypes.string,
    panel: PropTypes.shape({
      container: PropTypes.shape({
        style: PropTypes.shape({
          width: PropTypes.string,
          height: PropTypes.string,
        }),
      }),
    }),
    moistureSensorTagData: PropTypes.arrayOf(PropTypes.shape()),
  }),
  buildingStatusSettings: PropTypes.shape({
    drawThreeSphere: PropTypes.func,
    removeThreeObject: PropTypes.func,
    container: PropTypes.shape(),
    impl: PropTypes.shape(),
    getModelBoundingBox: PropTypes.func,
    execute: PropTypes.func,
    penalty: PropTypes.arrayOf(
      PropTypes.number,
    ),
  }),
};

ReactPanelContent.defaultProps = {
  contentType: '',
  listPanelSettings: {},
  temperaturePanelSettings: [],
  cameraPanelSettings: [],
  devicePanelSettings: {},
  moisturePanelSettings: {},
  buildingStatusSettings: {},
};

export default ReactPanelContent;
