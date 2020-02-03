import './toolbarExtension.scss';

const ExtensionId = 'ToolbarExtension';

export default class ToolbarExtension extends window.Autodesk.Viewing.Extension {
  constructor(viewer) {
    super();
    this.viewer = viewer;
  }

  load() {
    if (this.viewer.toolbar) {
      // Toolbar is already available, create the UI
      this.createUI();
    } else {
      // Toolbar hasn't been created yet, wait until we get notification of its creation
      this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
      this.viewer.addEventListener(window.av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }

    // console.log(`${ExtensionId} loaded`);

    return true;
  }

  unload() {
    this.viewer.toolbar.removeControl(this.subToolbar);
    // console.log(`${ExtensionId} unloaded`);

    return true;
  }

  onToolbarCreated = () => {
    this.viewer.removeEventListener(window.av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
  };

  createUI = () => {
    const { viewer } = this;

    // Button 1
    const button1 = new window.Autodesk.Viewing.UI.Button('pinPoint-button');
    button1.onClick = () => {
      viewer.panel[2].setVisible(true);
    };
    button1.addClass('tag-list-button');
    button1.setToolTip('Device List');

    // Button 2
    const button2 = new window.Autodesk.Viewing.UI.Button('building-status-button');
    button2.onClick = async () => {
      if (viewer.model != null) {
        await viewer.getElementFromProperty('Revit 牆');
        await viewer.getElementFromProperty('Revit 結構柱');
        await viewer.getElementFromProperty('Revit 門');
        await viewer.getElementFromProperty('Revit 窗');
      }
      viewer.panel[5].setVisible(true);
    };
    button2.addClass('building-status-button');
    button2.setToolTip('Building Status');

    // Button 3
    // const button3 = new window.Autodesk.Viewing.UI.Button('three-button');
    // button3.onClick = async () => {
    //   if (viewer.model != null) {
    //     const dbids = await viewer.getAllDbid();
    //     console.log(dbids);

    //     const boundingBox = await viewer.getOneBoundingBox(4244);
    //     console.log(boundingBox);

    //     await viewer.getPropertyValue(4100, 'Category');

    //     await viewer.getElementFromProperty('Revit Walls');
    //     await viewer.getElementFromProperty('Revit Structural Columns');
    //     await viewer.getElementFromProperty('Revit Doors');
    //     await viewer.getElementFromProperty('Revit Windows');

    //     4244 Revit Walls, 2661 Revit Structural Columns, 4287 Revit Doors,
    //     4381 Revit Windows, 5886 Revit Curtain Panels

    //     viewer.drawThreeObject([await viewer.getModelBoundingBox()], 'All');
    //     viewer.drawThreeSphere([0, 0], 'Good', 0.5, -6);
    //     viewer.drawThreeSpline();
    //   }
    // };
    // button3.addClass('three-button');
    // button3.setToolTip('測試');

    // SubToolbar
    this.subToolbar = new window.Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
    this.subToolbar.addControl(button1);
    this.subToolbar.addControl(button2);

    viewer.toolbar.addControl(this.subToolbar);
  };
}

window.Autodesk.Viewing.theExtensionManager.registerExtension(
  ExtensionId, ToolbarExtension,
);
