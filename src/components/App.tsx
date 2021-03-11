import React from 'react';
import './App.css';
import './TutorialViewer';
import TutorialViewer from './TutorialViewer';

type AppState = {
}

const exampleDoc = `
# Title

Lorem ipsum

~~~py
from microbit import *
display.show(1)
~~~

More explanation
`;

class App extends React.Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    return (
      <div className="App">
        <header className="App-header">
          <button className="App-button">Start</button>
          <button className="App-button">Run Code</button>
          <button className="App-button">Flash Code</button>
          <button className="App-button">Interrupt</button>
          <button className="App-button">Reboot</button>
        </header>
        <div className="App-textareas">
          <TutorialViewer className="App-doc" markdown={exampleDoc}/>
          <textarea className="App-editor"></textarea>
        </div>
      </div>
    );
  }
}

export default App;
