import $ from 'jquery';
import Snap from 'snapsvg-cjs';
import temperatureSensorTagData from '../../FakeData/TemperatureSensorTagData';
import cameraTagData from '../../FakeData/CameraTagData';
import moistureSensorTagData from '../../FakeData/MoistureSensorTagData';

const ExtensionId = 'MarkupExtension';

export default class MarkupExtension extends window.Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(options);
    this.viewer = viewer;
    this.keyPress = null;
    this.currentSelect = 0;
    this.viewer.temperatureSensorTagData = temperatureSensorTagData;
    this.viewer.cameraTagData = cameraTagData;
    this.viewer.moistureSensorTagData = moistureSensorTagData;
  }

  onSelectionChange = (event) => {
    const dbIds = event.dbIdArray;
    if (dbIds.length > 0) {
      this.currentSelect = dbIds;
      // console.log('Now Selected: ', dbIds);
    }
  }

  load() {
    this.init();
    this.viewer.addEventListener(
      window.Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      this.onSelectionChange,
    );

    return true;
  }

  // unload() {
  //   return true;
  // }

  init() {
    $(this.viewer.container).bind('click', this.onMouseClick);

    // delegate the event of CAMERA_CHANGE_EVENT
    this.viewer.addEventListener(window.Autodesk.Viewing.CAMERA_CHANGE_EVENT, () => {
      // find out all pushpin markups
      const $eles = $("div[id^='mymk']");
      const DOMeles = $eles.get();

      DOMeles.map((DOMEle) => {
        // get each DOM element
        const divEle = $(`#${DOMEle.id}`);
        // get out the 3D coordination
        const val = divEle.data('3DData');
        const pushpinModelPt = JSON.parse(val);
        // get the updated screen point
        const screenpoint = this.viewer.worldToClient(new window.THREE.Vector3(
          pushpinModelPt.x,
          pushpinModelPt.y,
          pushpinModelPt.z,
        ));
        // update the SVG position.
        divEle.css({
          left: screenpoint.x - pushpinModelPt.radius,
          top: screenpoint.y - pushpinModelPt.radius,
        });

        return true;
      });
    });

    this.viewer.createAllPinPoint = this.createAllPinPoint;
    this.viewer.removeAllPinPoint = this.removeAllPinPoint;
    this.viewer.createTemperaturePinPoint = this.createTemperaturePinPoint;
    this.viewer.removeTemperaturePinPoint = this.removeTemperaturePinPoint;
    this.viewer.createCameraPinPoint = this.createCameraPinPoint;
    this.viewer.removeCameraPinPoint = this.removeCameraPinPoint;
    this.viewer.createMoisturePinPoint = this.createMoisturePinPoint;
    this.viewer.removeMoisturePinPoint = this.removeMoisturePinPoint;
  }

  onMouseClick = (event) => {
    let target = null;

    // ensure in the adding stage
    this.viewer.buttonStatus.map((value, index) => {
      if (value) {
        target = index;
      }
      return true;
    });

    if (target === null) {
      return;
    }

    const screenPoint = {
      x: event.clientX,
      y: event.clientY,
    };

    const viewerPosition = this.viewer.container.getBoundingClientRect();

    const hitTest = this.viewer.impl.hitTest(
      screenPoint.x - viewerPosition.x, screenPoint.y - viewerPosition.y, true,
    );
    // var hitTest = this.viewer.impl.hitTest(screenPoint.x,screenPoint.y,true);

    if (hitTest) {
      let sameElement = false;

      // check if the target has been created at the same element before
      switch (target) {
        case 0:
          this.viewer.cameraTagData.map((cctv) => {
            if (cctv.bindElementId === this.currentSelect[0]) {
              sameElement = true;
            }
            return false;
          });
          break;
        case 1:
          this.viewer.temperatureSensorTagData.map((sensor) => {
            if (sensor.bindElementId === this.currentSelect[0]) {
              sameElement = true;
            }
            return false;
          });
          break;
        case 2:
          this.viewer.moistureSensorTagData.map((moisture) => {
            if (moisture.bindElementId === this.currentSelect[0]) {
              sameElement = true;
            }
            return false;
          });
          break;
        default:
      }

      let pinPoint;
      if (!sameElement) {
        // create pinPoint
        // console.log({
        //   x: hitTest.intersectPoint.x,
        //   y: hitTest.intersectPoint.y,
        //   z: hitTest.intersectPoint.z,
        // });
        switch (target) {
          case 0:
            pinPoint = {
              _id: Math.floor(Math.random() * 1000000).toString(),
              position: {
                x: hitTest.intersectPoint.x,
                y: hitTest.intersectPoint.y,
                z: hitTest.intersectPoint.z,
              },
              bindElementId: this.currentSelect[0],
              name: '高清数字智能新仪器',
              company: '海康威视数字技术股份有限公司',
              automaticRenewal: true,
              installTime: new Date().getTime(),
              lastMaintenance: new Date().getTime(),
              status: 'running',
              price: 5000,
              personInCharge: '华晨宇',
              description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
            };
            this.viewer.cameraTagData.push(pinPoint);
            this.drawPushpin(pinPoint, 'cctv');
            break;
          case 1:
            pinPoint = {
              _id: Math.floor(Math.random() * 1000000).toString(),
              position: {
                x: hitTest.intersectPoint.x,
                y: hitTest.intersectPoint.y,
                z: hitTest.intersectPoint.z,
              },
              bindElementId: this.currentSelect[0],
              name: '高清数字智能新仪器',
              company: '海康威视数字技术股份有限公司',
              automaticRenewal: true,
              installTime: new Date().getTime(),
              lastMaintenance: new Date().getTime(),
              status: 'running',
              price: 5000,
              personInCharge: '华晨宇',
              description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
            };
            this.viewer.temperatureSensorTagData.push(pinPoint);
            this.drawPushpin(pinPoint, 'sensor');
            break;
          case 2:
            pinPoint = {
              _id: Math.floor(Math.random() * 1000000).toString(),
              position: {
                x: hitTest.intersectPoint.x,
                y: hitTest.intersectPoint.y,
                z: hitTest.intersectPoint.z,
              },
              bindElementId: this.currentSelect[0],
              name: '新养护纪录表单',
              priority: '',
              period: '',
              personInCharge: '',
            };
            this.viewer.moistureSensorTagData.push(pinPoint);
            this.drawPushpin(pinPoint, 'moistureSensor');
            break;
          default:
        }
      }
    }
  }

  drawPushpin(pushpinModelPt, type) {
    const pushpinPt = pushpinModelPt;

    // convert 3D position to 2D screen coordination
    const screenpoint = this.viewer.worldToClient(
      new window.THREE.Vector3(
        pushpinPt.position.x,
        pushpinPt.position.y,
        pushpinPt.position.z,
      ),
    );

    // build the div container
    const id = pushpinPt.bindElementId;
    const htmlMarker = `<div id="mymk${id}-${type}"></div>`;
    const parent = this.viewer.container;

    $(parent).append(htmlMarker);
    $(`#mymk${id}-${type}`).css({
      'pointer-events': 'auto',
      position: 'absolute',
      overflow: 'visible',
      cursor: 'pointer',
      display: 'block',
    });

    const divContainer = $(`#mymk${id}-${type}`);

    divContainer.bind('click', () => {
      // while in selecting state
      this.viewer.deviceIdSelect = pushpinPt._id;
      if (this.viewer.deviceHandSelecting) {
        switch (type) {
          case 'sensor':
            this.viewer.deviceTypeSelect = '2';
            // this.viewer.deviceIdSelect = pushpinPt._id;
            this.viewer.deviceHandSelecting = false;
            this.viewer.createPanel();
            break;
          case 'cctv':
            this.viewer.deviceTypeSelect = '1';
            // this.viewer.deviceIdSelect = pushpinPt._id;
            this.viewer.deviceHandSelecting = false;
            this.viewer.createPanel();
            break;
          default:
        }
        return;
      }

      if (type === 'moistureSensor') {
        this.viewer.moistureSensorIdSelect = pushpinPt._id;
      }

      // delete pinPoint
      if (this.viewer.buttonStatus[3]) {
        this.removeOnePinPoint(id, type);
        return;
      }

      // show panel and fitToView
      switch (type) {
        case 'sensor':
          this.viewer.panel[1].setVisible(true);
          this.viewer.fitToView([id]);
          break;
        case 'cctv':
          this.viewer.panel[0].setVisible(true);
          this.viewer.fitToView([id]);
          break;
        case 'moistureSensor':
          this.viewer.panel[4].setVisible(true);
          this.viewer.fitToView([id]);
          break;
        default:
      }
    });

    const rad = 12;

    // create div and svg
    if (type === 'cctv') {
      divContainer.append(`
      <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -65 512 512" width="30px" class="">
        <g>
          <path d="m428.242188 34.117188h-58.921876v-23.109376c0-6.078124 4.929688-11.007812 11.007813-11.007812h36.910156c6.078125 0 11.003907 4.929688 11.003907 11.007812zm0 0" fill="#618baa" data-original="#618BAA" class=""/>
          <path d="m151.441406 23.664062v38.519532h-102.949218v-38.519532c0-6.074218 4.933593-11.007812 11.007812-11.007812h80.9375c6.074219 0 11.003906 4.933594 11.003906 11.007812zm0 0" fill="#e3f4ff" data-original="#E3F4FF" class=""/>
          <path d="m48.492188 37.234375h102.949218v24.949219h-102.949218zm0 0" fill="#bddff4" data-original="#BDDFF4"/>
          <path d="m450.257812 62.183594h-102.949218v-23.113282c0-6.078124 4.929687-11.003906 11.007812-11.003906h80.933594c6.078125 0 11.007812 4.925782 11.007812 11.003906zm0 0" fill="#38627c" data-original="#38627C" class=""/>
          <path d="m221.882812 62.183594h-36.910156v-27.515625c0-6.078125 4.925782-11.003907 11.003906-11.003907h14.898438c6.078125 0 11.007812 4.925782 11.007812 11.003907zm0 0" fill="#fc3e81" data-original="#FC3E81" class=""/>
          <path d="m512 72.453125v274.425781c0 12.148438-9.851562 22.011719-22.011719 22.011719h-467.976562c-12.160157 0-22.011719-9.863281-22.011719-22.011719v-274.425781c0-12.152344 9.851562-22.011719 22.011719-22.011719h467.976562c12.160157 0 22.011719 9.859375 22.011719 22.011719zm0 0" fill="#9cc6db" data-original="#9CC6DB" class=""/>
          <path d="m408.203125 243.960938c0 51.660156-25.875 97.402343-65.355469 124.929687h-173.695312c-39.480469-27.527344-65.355469-73.269531-65.355469-124.929687 0-83.921876 68.28125-152.203126 152.203125-152.203126s152.203125 68.28125 152.203125 152.203126zm0 0" fill="#84a1c0" data-original="#84A1C0" class=""/>
          <path d="m463.25 118.894531h-51.300781c-5.691407 0-10.300781-4.613281-10.300781-10.300781v-15.195312c0-5.691407 4.609374-10.304688 10.300781-10.304688h51.300781c5.691406 0 10.304688 4.613281 10.304688 10.304688v15.195312c-.003907 5.6875-4.613282 10.300781-10.304688 10.300781zm0 0" fill="#fc3e81" data-original="#FC3E81" class=""/>
          <path d="m0 118.898438h512v217.335937h-512zm0 0" fill="#618baa" data-original="#618BAA" class=""/><path d="m408.203125 243.960938c0 34.65625-11.644531 66.652343-31.234375 92.273437h-241.9375c-19.589844-25.621094-31.234375-57.617187-31.234375-92.273437 0-51.75 25.964844-97.546876 65.542969-125.0625h173.320312c39.578125 27.515624 65.542969 73.3125 65.542969 125.0625zm0 0" fill="#4e7693" data-original="#4E7693" class=""/>
          <path d="m420.269531 264.085938h-32.199219v-45.144532h32.199219c7.148438 0 12.945313 5.796875 12.945313 12.945313v19.253906c0 7.148437-5.796875 12.945313-12.945313 12.945313zm0 0" fill="#38627c" data-original="#38627C" class=""/><path d="m394.992188 243.960938c0 76.761718-62.226563 138.992187-138.992188 138.992187s-138.992188-62.230469-138.992188-138.992187c0-76.765626 62.226563-138.996094 138.992188-138.996094s138.992188 62.230468 138.992188 138.996094zm0 0" fill="#e3f4ff" data-original="#E3F4FF" class=""/>
          <path d="m365.078125 243.960938c0 60.242187-48.835937 109.078124-109.078125 109.078124s-109.078125-48.835937-109.078125-109.078124c0-60.246094 48.835937-109.082032 109.078125-109.082032s109.078125 48.835938 109.078125 109.082032zm0 0" fill="#bddff4" data-original="#BDDFF4"/><path d="m352.230469 243.960938c0 53.144531-43.085938 96.226562-96.230469 96.226562s-96.230469-43.082031-96.230469-96.226562c0-53.148438 43.085938-96.230469 96.230469-96.230469s96.230469 43.082031 96.230469 96.230469zm0 0" fill="#38627c" data-original="#38627C" class=""/>
          <g fill="#3fefef">
              <path d="m320.878906 243.960938c0 35.828124-29.046875 64.875-64.878906 64.875s-64.878906-29.046876-64.878906-64.875c0-35.832032 29.046875-64.878907 64.878906-64.878907s64.878906 29.046875 64.878906 64.878907zm0 0" data-original="#000000" class="active-path"/><path d="m99.96875 118.894531c0 11.949219-9.6875 21.632813-21.632812 21.632813-11.949219 0-21.636719-9.683594-21.636719-21.632813s9.6875-21.632812 21.636719-21.632812c11.945312 0 21.632812 9.683593 21.632812 21.632812zm0 0" data-original="#000000" class="active-path"/>
          </g>
        </g> 
      </svg>`);
    } else if (type === 'sensor') {
      // build the svg element and draw a circle
      divContainer.append(`<svg id="mysvg${id}-${type}"></svg>`);
      const snap = Snap($(`#mysvg${id}-${type}`)[0]);
      const circle = snap.paper.circle(14, 14, rad);

      circle.attr({
        fill: type === 'sensor' ? '#FF8888' : '#FFFE58',
        fillOpacity: 0.6,
        stroke: type === 'sensor' ? '#FF0000' : '#FFC801',
        strokeWidth: 3,
      });

      // set the position of the SVG
      // adjust to make the circle center is the position of the click point
      const svgContainer = $(`#mysvg${id}-${type}`);
      svgContainer.css({
        width: rad * 2 + 7,
        height: rad * 2 + 7,
      });
    } else {
      // build the svg element and draw a circle
      divContainer.append(`<svg id="mysvg${id}-${type}"></svg>`);
      const snap = Snap($(`#mysvg${id}-${type}`)[0]);
      const circle = snap.paper.circle(14, 14, rad);

      circle.attr({
        fill: type === 'sensor' ? '#FF8888' : '#FFFE58',
        fillOpacity: 0.6,
        stroke: type === 'sensor' ? '#FF0000' : '#FFC801',
        strokeWidth: 3,
      });

      // set the position of the SVG
      // adjust to make the circle center is the position of the click point
      const svgContainer = $(`#mysvg${id}-${type}`);
      svgContainer.css({
        width: rad * 2 + 7,
        height: rad * 2 + 7,
      });
    }

    divContainer.css({
      left: screenpoint.x - rad,
      top: screenpoint.y - rad,
      width: rad * 2 + 7,
      height: rad * 2 + 7,
    });

    // store 3D point data to the DOM
    const div = $(`#mymk${id}-${type}`);
    // add radius info with the 3D data
    pushpinPt.position.radius = rad;
    const storeData = JSON.stringify(pushpinPt.position);
    div.data('3DData', storeData);
  }

  createTemperaturePinPoint = () => {
    this.viewer.temperatureSensorTagData.map((sensor) => {
      this.drawPushpin(sensor, 'sensor');
      return true;
    });
    this.viewer.temperatureVisibility = true;
  }

  createCameraPinPoint = () => {
    this.viewer.cameraTagData.map((cctv) => {
      this.drawPushpin(cctv, 'cctv');
      return true;
    });
    this.viewer.cameraVisibility = true;
  }

  createMoisturePinPoint = () => {
    this.viewer.moistureSensorTagData.map((moisture) => {
      this.drawPushpin(moisture, 'moistureSensor');
      return true;
    });
    this.viewer.moistureVisibility = true;
  }

  removeTemperaturePinPoint = () => {
    this.viewer.temperatureSensorTagData.map((sensor) => {
      $(`#mymk${sensor.bindElementId}-sensor`).remove();
      return true;
    });
    this.viewer.temperatureVisibility = false;
  }

  removeCameraPinPoint = () => {
    this.viewer.cameraTagData.map((cctv) => {
      $(`#mymk${cctv.bindElementId}-cctv`).remove();
      return true;
    });
    this.viewer.cameraVisibility = false;
  }

  removeMoisturePinPoint = () => {
    this.viewer.moistureSensorTagData.map((moisture) => {
      $(`#mymk${moisture.bindElementId}-moistureSensor`).remove();
      return true;
    });
    this.viewer.moistureVisibility = false;
  }

  removeOnePinPoint = (id, type) => {
    $(`#mymk${id}-${type}`).remove();
    if (type === 'sensor') {
      this.viewer.temperatureSensorTagData = this.viewer.temperatureSensorTagData.filter(
        item => item.bindElementId !== id,
      );
    } else if (type === 'cctv') {
      this.viewer.cameraTagData = this.viewer.cameraTagData.filter(
        item => item.bindElementId !== id,
      );
    } else if (type === 'moistureSensor') {
      this.viewer.moistureSensorTagData = this.viewer.moistureSensorTagData.filter(
        item => item.bindElementId !== id,
      );
    }
  }
}

window.Autodesk.Viewing.theExtensionManager.registerExtension(
  ExtensionId, MarkupExtension,
);
