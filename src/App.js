import React, { Component } from 'react';
import './App.css';
import Dropbox from 'dropbox';
import ChangeTracker from './changetracker.js';
import IndexBuilder from './indexbuilder.js';
import _ from 'lodash';

class App extends Component {
  constructor() {
    super();

    const dbx = new Dropbox({ accessToken: localStorage["access_token"] });
    const changeTracker = new ChangeTracker(localStorage['access_token']);
    this.indexBuilder = new IndexBuilder();

    this.state = {
      index: this.indexBuilder.index,
      byId: this.indexBuilder.byId,
      selected: undefined
    };

    changeTracker.on("update", (updates) => {
      this.indexBuilder.updateIndex(updates);
      this.setState({
        index: this.indexBuilder.index,
        byId: this.indexBuilder.byId
      })
    });

    dbx.filesDownload({path: '/index.md'}).then((response) => {
      const blob = response.fileBlob;
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
          console.log(reader.result); // will print out file content
      });
      reader.readAsText(blob);
    })
    .catch((error) => {
        console.error(error);
    })
  }

  renderIndexNode(node) {
    const inner = (subnode) => {
      const subeles = _.map(subnode.children, inner);
      const files = _.map(subnode.files, (file) => {
        return <li key={file} data-id={file}>{this.state.byId[file].name}</li>;
      });

      return <ul key={subnode.id}>
        <li>
          {subnode.name}
          {subeles}
        </li>
        {files}
      </ul>;
    }

    return inner(node);
  }

  render = () => {
    const eles = this.renderIndexNode(this.state.index);
    return (
      <div className="App">
        {eles}
      </div>
    );
  }
}

export default App;
