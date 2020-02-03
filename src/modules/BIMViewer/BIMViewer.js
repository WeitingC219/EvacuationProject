import React from 'react';
import styled from 'styled-components';
import ModelViewer from '../../components/ModelViewer';

const ModelViewerWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const BIMViewer = () => (
  <ModelViewerWrapper className="forge-model-viewer">
    <ModelViewer />
  </ModelViewerWrapper>
);

export default BIMViewer;
