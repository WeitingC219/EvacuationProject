import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import routes from './routes';

function App() {
  return (
    <Router>
      <Switch>
        {routes.map(route => (
          <Route
            key={route.path}
            exact={route.exact}
            path={route.path}
            component={route.component}
          />
        ))}
      </Switch>
    </Router>
  );
}

export default App;
