import ReactPanel from './ReactPanel';
import config from './PanelConfig/config';

export default class PanelExtension extends window.Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);

    if (!this.viewer.panel) {
      this.viewer.panel = [];
    }

    config.map((data) => {
      this.viewer.panel.push(new ReactPanel(viewer, {
        id: data.id,
        title: data.title,
        width: data.width,
        height: data.height,
        content: data.content,
      }));
      return true;
    });
  }

  static get ExtensionId() {
    return 'PanelExtension';
  }
}

window.Autodesk.Viewing.theExtensionManager.registerExtension(
  PanelExtension.ExtensionId,
  PanelExtension,
);
