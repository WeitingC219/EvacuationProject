import React from 'react';
import PropTypes from 'prop-types';
import './Viewer.scss';

class Viewer extends React.Component {
  constructor() {
    super();

    this.loadDynamicExtension = this.loadDynamicExtension.bind(this);

    this.height = 0;
    this.width = 0;
    this.Autodesk = window.Autodesk;
  }

  componentDidMount() {
    this.viewer = new this.Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer);

    this.viewer.loadDynamicExtension = this.loadDynamicExtension;

    const { onViewerCreated } = this.props;

    if (onViewerCreated) {
      onViewerCreated(this.viewer);
    }
  }

  componentDidUpdate() {
    if (this.viewer && this.viewer.impl) {
      if (this.viewerContainer.offsetHeight !== this.height
        || this.viewerContainer.offsetWidth !== this.width) {
        this.height = this.viewerContainer.offsetHeight;
        this.width = this.viewerContainer.offsetWidth;

        this.viewer.resize();
      }
    }
  }

  componentWillUnmount() {
    if (this.viewer) {
      if (this.viewer.impl.selector) {
        this.viewer.tearDown();
        this.viewer.finish();
        this.viewer = null;
      }
    }
  }

  async loadDynamicExtension(extensionId, options = {}) {
    await import(`../Viewer.Components/Extensions/${extensionId}/`);

    const extInstance = await this.viewer.loadExtension(
      extensionId,
      options,
    );

    return extInstance;
  }

  render() {
    return (
      <div
        className="forge-viewer"
        ref={(div) => {
          this.viewerContainer = div;
        }}
      />
    );
  }
}

Viewer.propTypes = {
  onViewerCreated: PropTypes.func,
};

Viewer.defaultProps = {
  onViewerCreated: null,
};

export default Viewer;
