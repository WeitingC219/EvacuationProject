import React from 'react';
import ReactDOM from 'react-dom';
import ReactPanelContent from './ReactPanelContent';
import fakeTemperatureSensorData from '../../../FakeData/TemperatureSensorData';
import fakeCameraData from '../../../FakeData/CameraData';
import fakeMoistureSensorData from '../../../FakeData/MoistureSensorData';
import './ReactPanel.scss';

export default class ReactPanel extends window.Autodesk.Viewing.UI.DockingPanel {
  constructor(viewer, options) {
    super(viewer.container, options.id, options.title, {
      addFooter: false,
      content: options.content,
      viewer,
    });

    this.container.classList.add('react-docking-panel');
    this.container.style.width = options.width;
    this.container.style.height = options.height;

    this.DOMContent = document.createElement('div');

    this.DOMContent.className = 'content';

    this.container.appendChild(this.DOMContent);
  }

  initialize() {
    super.initialize();

    this.viewer = this.options.viewer;
    this.footer = this.createFooter();

    // device list checkbox = [false, false, false]
    this.viewer.checkboxStatus = [false, false, false];
    // device list button = [false, false, false, false]
    this.viewer.buttonStatus = [false, false, false, false];
    // device management selecting button = false
    this.viewer.deviceHandSelecting = false;
    // device management selecting button = 0/1
    this.viewer.deviceTypeSelect = null;
    // device management selecting button = id
    this.viewer.deviceIdSelect = null;

    this.viewer.moistureSensorIdSelect = null;
    this.viewer.moistureSensorData = fakeMoistureSensorData;

    this.viewer.fetchDataFromSensor = false;

    this.viewer.penalty = [];

    this.container.appendChild(this.footer);
  }

  setCheckboxStatus = (index, mode) => {
    if (mode === 'setTrue' && this.viewer.checkboxStatus[index]) {
      return;
    }

    const newCheckboxStatus = this.viewer.checkboxStatus;
    newCheckboxStatus[index] = !this.viewer.checkboxStatus[index];

    switch (index) {
      case 0:
        if (newCheckboxStatus[index]) {
          this.viewer.createCameraPinPoint();
        } else {
          this.viewer.removeCameraPinPoint();
        }
        break;
      case 1:
        if (newCheckboxStatus[index]) {
          this.viewer.createTemperaturePinPoint();
        } else {
          this.viewer.removeTemperaturePinPoint();
        }
        break;
      case 2:
        if (newCheckboxStatus[index]) {
          this.viewer.createMoisturePinPoint();
        } else {
          this.viewer.removeMoisturePinPoint();
        }
        break;
      default:
    }

    this.viewer.checkboxStatus = newCheckboxStatus;
  }

  setButtonStatus = (index) => {
    const newButtonStatus = this.viewer.buttonStatus;
    const check = !this.viewer.buttonStatus[index];

    newButtonStatus.map((value, i) => {
      newButtonStatus[i] = false;
      return false;
    });

    if (check) {
      newButtonStatus[index] = true;
    }

    this.viewer.buttonStatus = newButtonStatus;
  }

  setDeviceTypeSelect = (e) => {
    this.viewer.deviceTypeSelect = e.key;
    this.createPanel();
  }

  setDeviceIdSelect = (e) => {
    this.viewer.deviceIdSelect = e.key;
    this.createPanel();
  }

  setDeviceHandSelecting = () => {
    this.viewer.deviceHandSelecting = !this.viewer.deviceHandSelecting;
    this.createPanel();
  }

  setFetchDataStatus = () => {
    this.viewer.fetchDataFromSensor = true;
  }

  setPenalty = (penaltyPt) => {
    const boundingBox = this.viewer.getModelBoundingBox();
    this.viewer.penalty.push({
      point: [
        Math.round((penaltyPt[0] - boundingBox[1][0]) * 4),
        Math.round((penaltyPt[1] - boundingBox[1][1]) * 4),
      ],
      value: 10000,
      radius: 30,
    });
  }

  async setVisible(show) {
    super.setVisible(show);

    if (this.options.content === 'deviceManage') {
      this.viewer.createPanel = this.createPanel;
    }

    if (show) {
      this.createPanel();
    } else if (this.rweactNode) {
      ReactDOM.unmountComponentAtNode(
        this.DOMContent,
      );
      this.reactNode = null;
    }
  }

  createPanel = () => {
    const setPinPoint = {
      createCameraPinPoint: this.viewer.createCameraPinPoint,
      createTemperaturePinPoint: this.viewer.createTemperaturePinPoint,
      createMoisturePinPoint: this.viewer.createMoisturePinPoint,
      removeCameraPinPoint: this.viewer.removeCameraPinPoint,
      removeTemperaturePinPoint: this.viewer.removeTemperaturePinPoint,
      removeMoisturePinPoint: this.viewer.removeMoisturePinPoint,
    };

    const listPanelSettings = {
      setCheckboxStatus: this.setCheckboxStatus,
      setButtonStatus: this.setButtonStatus,
      checkboxStatus: this.viewer.checkboxStatus,
      buttonStatus: this.viewer.buttonStatus,
      setPinPoint,
    };

    // for test
    function getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const temperaturePanelSettings = {
      fakeTemperatureSensorData: fakeTemperatureSensorData[getRandom(0, 1)],
      temperatureSensorTagData: this.viewer.temperatureSensorTagData,
      drawFireArea: this.viewer.drawFireArea,
      setFetchDataStatus: this.setFetchDataStatus,
      fetchDataFromSensor: this.viewer.fetchDataFromSensor,
      setPenalty: this.setPenalty,
    };

    const cameraPanelSettings = {
      fakeCameraData: fakeCameraData[getRandom(0, 0)],
    };

    const devicePanelSettings = {
      cameraTagData: this.viewer.cameraTagData,
      setDeviceTypeSelect: this.setDeviceTypeSelect,
      setDeviceIdSelect: this.setDeviceIdSelect,
      setDeviceHandSelecting: this.setDeviceHandSelecting,
      deviceTypeSelect: this.viewer.deviceTypeSelect,
      deviceIdSelect: this.viewer.deviceIdSelect,
      selecting: this.viewer.deviceHandSelecting,
      panel: this.viewer.panel[3],
    };

    const moisturePanelSettings = {
      moistureSensorTagData: this.viewer.moistureSensorTagData,
      moistureSensorData: this.viewer.moistureSensorData,
      moistureSensorIdSelect: this.viewer.moistureSensorIdSelect,
      panel: this.viewer.panel[4],
    };

    const buildingStatusSettings = {
      drawThreeSphere: this.viewer.drawThreeSphere,
      removeThreeObject: this.viewer.removeThreeObject,
      container: this.viewer.container,
      impl: this.viewer.impl,
      getModelBoundingBox: this.viewer.getModelBoundingBox,
      execute: this.viewer.execute,
      penalty: this.viewer.penalty,
    };

    this.reacreactNodetNode = ReactDOM.render(
      <ReactPanelContent
        contentType={this.options.content}
        listPanelSettings={listPanelSettings}
        temperaturePanelSettings={temperaturePanelSettings}
        cameraPanelSettings={cameraPanelSettings}
        devicePanelSettings={devicePanelSettings}
        moisturePanelSettings={moisturePanelSettings}
        buildingStatusSettings={buildingStatusSettings}
        refresh={this.createPanel}
      />,
      this.DOMContent,
    );
  }
}
