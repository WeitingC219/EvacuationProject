import './threeExtension.scss';
import * as THREE from 'three';
import particleFire from 'three-particle-fire';

const ExtensionId = 'ThreeExtension';

export default class ThreeExtension extends window.Autodesk.Viewing.Extension {
  constructor(viewer) {
    super();
    this.viewer = viewer;
    this.viewer.waitForDraw = [];
    this.viewer.doorsAndWindows = [];
  }

  // Output [dbid]
  getAllDbid = async () => {
    try {
      const { instanceTree } = await this.viewer.model.getData();
      const allDbIdsStr = Object.keys(instanceTree.nodeAccess.dbIdToIndex);
      const dbids = [];

      allDbIdsStr.forEach((elem) => { dbids.push(Number(elem)); });

      return (dbids);
    } catch (ex) {
      console.log(ex);
    }

    return null;
  }

  propertySelect = (property, el) => {
    el.properties.map((prop) => {
      if (prop.displayName === property) {
        return prop.displayValue;
      }
      return true;
    });
  }

  // Input (4100, 'Category') / print 'Revit Walls'
  // Print element "property" value
  getPropertyValue = async (dbid, property) => {
    try {
      await this.viewer.model.getProperties(dbid, this.propertySelect.bind(null, property));
    } catch (ex) {
      console.log(ex);
    }
  }

  // Output [[[xMax, yMax, zMax], [xMin, yMin, zMin]]],
  // [i] => getDbid element,
  // [i][0/1] => get element Max/Min point,
  // [i][0/1][0/1/2] => get Max/Min x/y/z,
  getOneBoundingBox = async (dbid) => {
    try {
      const { instanceTree } = await this.viewer.model.getData();
      const boundingBox = [];

      await instanceTree.enumNodeFragments(dbid, async (fragementid) => {
        const bBox = new window.THREE.Box3();
        await this.viewer.model.getFragmentList().getWorldBounds(fragementid, bBox);

        // const width = Math.abs(bBox.max.x - bBox.min.x);
        // const height = Math.abs(bBox.max.y - bBox.min.y);
        // const depth = Math.abs(bBox.max.z - bBox.min.z);

        boundingBox.push(
          [[bBox.max.x, bBox.max.y, bBox.max.z],
            [bBox.min.x, bBox.min.y, bBox.min.z]],
        );
      }, false);

      boundingBox.sort((a, b) => a[0][0] - b[0][0]);

      return boundingBox;
    } catch (ex) {
      console.log(ex);
    }

    return null;
  }

  // Output [[xMax, yMax, zMax], [xMin, yMin, zMin]],
  // [0/1] => get model Max/Min point,
  // [0/1][0/1/2] => get Max/Min x/y/z,
  getModelBoundingBox = () => {
    const bdbox = this.viewer.utilities.getBoundingBox();
    return [[bdbox.max.x, bdbox.max.y, bdbox.max.z], [bdbox.min.x, bdbox.min.y, bdbox.min.z]];
  }

  // save all element boundaries with given property to waitForDraw/doorsAndWindows
  // Input ('Revit Walls'), ('Revit Structural Columns'), ('Revit Doors'), ('Revit Windows')
  // Save [[[xMax, yMax, zMax], [xMin, yMin, zMin]]]
  getElementFromProperty = async (property) => {
    const allDbIdsStr = await this.getAllDbid();

    await this.viewer.model.getBulkProperties(allDbIdsStr, { propFilter: ['Category'] }, (results) => {
      results.map(async (result) => {
        if (result.properties[0].displayValue === property) {
          const boundingBox = await this.getOneBoundingBox(result.dbId);
          if (property === 'Revit 牆' || property === 'Revit 結構柱') {
            this.viewer.waitForDraw.push([boundingBox, property]);
          } else if (property === 'Revit 門' || property === 'Revit 窗') {
            this.viewer.doorsAndWindows.push([boundingBox, property]);
          }
        }
        return true;
      });
    });
  }

  draw = () => {
    this.viewer.waitForDraw.map((elem) => {
      this.drawThreeObject(elem[0], elem[1]);
      return true;
    });
    // for (let i = 0; i < this.viewer.waitForDraw.length; i++) {
    //   (function (index, drawObj, data) {
    //     setTimeout(() => {
    //       drawObj(data[index][0], data[index][1]);
    //     }, 300 * i);
    //   }(i, this.drawThreeObject, this.viewer.waitForDraw));
    // }
  }

  drawThreeObject = (boundingBoxArray, type) => {
    const mapping = {
      'Revit 牆': 'yellow',
      'Revit 結構柱': 'orange',
      'Revit 門': 'pink',
      'Revit 窗': 'pink',
      All: 'yellow',
    };
    if (boundingBoxArray.length !== 0) {
      boundingBoxArray.map((boundingBox) => {
        const geometry = new window.THREE.BoxGeometry(
          boundingBox[0][0] - boundingBox[1][0],
          boundingBox[0][1] - boundingBox[1][1],
          0.4,
        );
        const material = new window.THREE.MeshBasicMaterial({ color: mapping[type] });
        geometry.applyMatrix(new window.THREE.Matrix4().makeTranslation(
          (boundingBox[0][0] + boundingBox[1][0]) / 2,
          (boundingBox[0][1] + boundingBox[1][1]) / 2,
          boundingBox[0][2],
        ));
        const cube = new window.THREE.Mesh(geometry, material);
        this.viewer.impl.scene.add(cube);
        this.viewer.impl.invalidate(true);
        return true;
      });
    }
  }

  drawThreeSphere = (point, status, radius, height) => {
    const geometry = new window.THREE.SphereGeometry(radius, 50, 50);
    const material = new window.THREE.MeshBasicMaterial({ color: status === 'Good' ? 'green' : 'red' });
    geometry.applyMatrix(new window.THREE.Matrix4().makeTranslation(
      point[0],
      point[1],
      height,
    ));
    const sphere = new window.THREE.Mesh(geometry, material);
    this.viewer.impl.scene.add(sphere);
    this.viewer.impl.invalidate(true);
    return sphere;
  }

  removeThreeObject = (objectArray) => {
    objectArray.map((object) => {
      this.viewer.impl.scene.remove(object);
      this.viewer.impl.invalidate(true);
      return true;
    });
  }

  drawThreeSpline = (points) => {
    const curve = new THREE.CatmullRomCurve3(points.map(
      point => new THREE.Vector3(point[0], point[1], point[2]),
    ));

    const pointArray = curve.getPoints(500);

    const drawPoints = [];
    pointArray.map((point) => {
      const geometry = new window.THREE.BoxGeometry(
        0.4,
        0.4,
        0.4,
      );
      const material = new window.THREE.MeshBasicMaterial({ color: 'yellow' });
      geometry.applyMatrix(new window.THREE.Matrix4().makeTranslation(
        point.x,
        point.y,
        point.z,
      ));
      const cube = new window.THREE.Mesh(geometry, material);
      drawPoints.push(cube);
      this.viewer.impl.scene.add(cube);
      this.viewer.impl.invalidate(true);
      return true;
    });

    return drawPoints;

    // const curve = new THREE.CatmullRomCurve3([
    //   new THREE.Vector3(-10, 0, 10),
    //   new THREE.Vector3(-5, 5, 5),
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(5, -5, 5),
    //   new THREE.Vector3(10, 0, 10),
    // ]);

    // const points = curve.getPoints(50);
    // console.log(points);
    // console.log(points.x);
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // // Create the final object to add to the scene
    // const curveObject = new THREE.Line(geometry, material);

    // const sphere = new THREE.SphereGeometry(20);
    // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // const mesh = new THREE.Mesh(sphere, material);

    // this.viewer.impl.scene.add(mesh);
    // this.viewer.impl.invalidate(true);
  }

  drawFireArea = (radius, point) => {
    const opacity = 1.0;
    const c1 = new window.THREE.Color('#686868');
    const c2 = new window.THREE.Color('red');

    const cubeGeometry = new THREE.CircleGeometry(radius, 50, 0);

    const cubeMaterial = new window.THREE.MeshBasicMaterial({
      vertexColors: window.THREE.VertexColors,
    });

    cubeGeometry.applyMatrix(new window.THREE.Matrix4().makeTranslation(
      point[0],
      point[1],
      -7.05,
    ));

    if (opacity < 1.0) {
      cubeMaterial.opacity = opacity;
      cubeMaterial.transparent = true;
    }

    const nmax = cubeGeometry.faces.length;
    for (let n = 0; n < nmax; n++) {
      cubeGeometry.faces[n].vertexColors[0] = c1;
      cubeGeometry.faces[n].vertexColors[1] = c1;
      cubeGeometry.faces[n].vertexColors[2] = c2;
    }

    const sphere = new window.THREE.Mesh(cubeGeometry, cubeMaterial);
    this.viewer.impl.scene.add(sphere);
    this.viewer.impl.invalidate(true);
  }

  async load() {
    // console.log(`${ExtensionId} loaded`);

    this.viewer.getAllDbid = this.getAllDbid;
    this.viewer.getOneBoundingBox = this.getOneBoundingBox;
    this.viewer.getPropertyValue = this.getPropertyValue;
    this.viewer.getElementFromProperty = this.getElementFromProperty;
    this.viewer.drawFireArea = this.drawFireArea;
    this.viewer.drawThreeObject = this.drawThreeObject;
    this.viewer.getModelBoundingBox = this.getModelBoundingBox;
    this.viewer.getAvailableNode = this.getAvailableNode;
    this.viewer.drawThreeSphere = this.drawThreeSphere;
    this.viewer.removeThreeObject = this.removeThreeObject;
    this.viewer.drawThreeSpline = this.drawThreeSpline;
    this.viewer.draw = this.draw;

    return true;
  }

  unload() {
    // console.log(`${ExtensionId} unloaded`);

    return this;
  }
}

window.Autodesk.Viewing.theExtensionManager.registerExtension(
  ExtensionId, ThreeExtension,
);
