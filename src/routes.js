import React from 'react';
import BIMViewer from './modules/BIMViewer';

const routes = [
  {
    path: '/',
    exact: true,
    component: () => <BIMViewer />,
  },
];

export default routes;
