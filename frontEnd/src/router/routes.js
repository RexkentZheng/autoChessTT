import React from 'react'
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';
import Home from 'components/home';
import Test from 'components/test';
import stores from 'stores';
import { hot } from 'react-hot-loader/root';

function Routers() {
  return (
    <BrowserRouter>
      <Provider {...stores}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/test" component={Test} />
        </Switch>
      </Provider>
    </BrowserRouter>
  );
}

export default hot(Routers);
