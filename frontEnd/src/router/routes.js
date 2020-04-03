import Home from 'components/home';
import LinesMain from 'components/lines';
import Test from 'components/test';
import { Provider } from 'mobx-react';
import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import stores from 'stores';

function Routers() {
  return (
    <BrowserRouter>
      <Provider {...stores}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/test" component={Test} />
          <Route exact path="/lines" component={LinesMain} />
        </Switch>
      </Provider>
    </BrowserRouter>
  );
}

export default Routers;
