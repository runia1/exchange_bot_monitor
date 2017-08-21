import React, { Component } from 'react';
import './App.css';

import ChartComponent from './ChartComponent';

class App extends Component {
  render() {
    return (
        <div className="container">
            <div className="header">
                <h1>Exchange Bot Monitor</h1>
            </div>
            <ChartComponent />
        </div>
    );
  }
}

export default App;