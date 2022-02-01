import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import {Renderer} from './components/Renderer';

ReactDOM.render(
  <React.StrictMode>
    <Renderer />
  </React.StrictMode>,
  document.getElementById('root'),
);
