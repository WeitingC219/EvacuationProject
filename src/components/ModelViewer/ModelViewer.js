import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import qs from 'qs';
import styled from 'styled-components';
import autodeskForgeConfig from './autodeskForgeConfig';
import Viewer from './Viewer';


class ModelViewer extends React.Component {
  constructor() {
    super();
    this.Autodesk = window.Autodesk;
    this.viewer = null;
  }

  onChangeHandler = (event) => {
    this.value = event.target.value;
  }

  onClickHandler = () => {
    this.viewer.fitToView([this.value]);
  }

  async onViewerCreated(viewer) {
    try {
      const { extensions } = this.props;

      const extIds = extensions;

      const token = await this.getForgeToken();
      const { urn } = autodeskForgeConfig;
      const pathIdx = null;
      let path = null;

      await this.initialize({
        env: 'AutodeskProduction',
        accessToken: token,
      });

      if (urn) {
        const doc = await this.loadDocument(urn);
        path = this.getViewablePath(doc, pathIdx || 0);
      } else if (!path) {
        const error = 'Invalid query parameter: '
          + 'use id OR urn OR path in url';
        throw new Error(error);
      }

      viewer.start();

      if (extIds) {
        extIds.map((extId) => {
          viewer.loadDynamicExtension(extId);
          return true;
        });
      }

      viewer.loadModel(path);

      this.viewer = viewer;
    } catch (ex) {
      // console.log('Viewer Initialization Error: ');
      // console.log(ex);
    }
  }

  getForgeToken = () => new Promise((resolve, reject) => {
    const data = {
      client_id: autodeskForgeConfig.clientId,
      client_secret: autodeskForgeConfig.clientSecret,
      grant_type: autodeskForgeConfig.grantType,
      scope: autodeskForgeConfig.scope,
    };

    axios.post(
      'https://cors-anywhere.herokuapp.com/https://developer.api.autodesk.com/authentication/v1/authenticate',
      qs.stringify(data),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
      .then((response) => {
        resolve(response.data.access_token);
      })
      .catch((error) => {
        reject(error);
      });
  })

  getViewablePath(doc, pathIdx = 0, roles = ['3d', '2d']) {
    const rootItem = doc.getRootItem();
    const roleArray = [...roles];
    let items = [];

    roleArray.forEach((role) => {
      items = [...items,
        ...this.Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { type: 'geometry', role }, true,
        ),
      ];
    });

    if (!items.length || pathIdx > items.length) {
      return null;
    }

    return doc.getViewablePath(items[pathIdx]);
  }

  loadDocument(urn) {
    return new Promise((resolve, reject) => {
      const paramUrn = !urn.startsWith('urn:')
        ? `urn:${urn}`
        : urn;

      this.Autodesk.Viewing.Document.load(paramUrn, (doc) => {
        resolve(doc);
      }, (error) => {
        reject(error);
      });
    });
  }

  initialize(options) {
    return new Promise((resolve, reject) => {
      this.Autodesk.Viewing.Initializer(options, () => {
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }

  render() {
    const { style } = this.props;

    const ViewerViewWrapper = styled.div`
      width: ${style.width};
      height: ${style.height};
      top: ${style.top};
      left: ${style.left};
      background-color: #dadada;
      position: relative;
    `;

    return (
      <ViewerViewWrapper className="forge-viewer-view">
        <Viewer onViewerCreated={((viewer) => {
          this.onViewerCreated(viewer);
        })}
        />
      </ViewerViewWrapper>
    );
  }
}

ModelViewer.propTypes = {
  extensions: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
    top: PropTypes.string,
    left: PropTypes.string,
  }),
};

ModelViewer.defaultProps = {
  extensions: ['MarkupExtension', 'PanelExtension', 'ToolbarExtension', 'ThreeExtension', 'FindPathExtension'],
  style: {
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
  },
};

export default ModelViewer;
