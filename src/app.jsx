import React, { Component } from 'react';
import { googleSignIn } from './utilities';
import { Button } from './components/common';


export default class App extends Component {
  render() {
    return (
      <div
        className="button_container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={() => googleSignIn()}
          label="Login"
        />
      </div>
    );
  }
}
