import 'core-js/fn/object/assign';
import 'antd/dist/antd.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'router/routes';

ReactDOM.render(<Router />, document.getElementById('app'));

if (module.hot) {
  module.hot.accept();
}
