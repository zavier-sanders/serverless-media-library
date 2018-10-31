import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import Amplify, { Storage } from 'aws-amplify';
import {getCurrentUser} from '../auth/auth'

import './upload.css'

window.URL = window.URL || window.webkitURL;

export default class Uploader extends React.Component {
  constructor() {
    super()
    this.state = { 
      user: '',
      files: [],
      metadata: '',
      objectID: ''
    };
    
  }

  componentWillMount() {
    let { params } = this.props;

    getCurrentUser( (err, user) => {
      if (!err) {
        this.setState({user})
        let collection = user.email;

        const metadata = {
          userid: user.email,
          collectionID: collection.replace(/ /g, '+') + "/" + params.folder.toLowerCase(),
          // remove this
          albumID: collection.replace(/ /g, '+') + "/" + params.folder.toLowerCase(),
          collection: collection.replace(/ /g, '+') + "/" + params.folder.toLowerCase(),
          collectionname: params.folder.charAt(0).toUpperCase() + params.folder.slice(1),
          acl: 'public-read'
        };
    
        const objectID = this.generateObjectID(metadata);
    
        this.setState({
          metadata: metadata,
          objectID: objectID
        });
      };
    });
  }

  onDrop(files) {
    let data = {
      files: files,
      state: this.state
    }

    return this.props.onDrop(data);
    
  }

  //**dataURL to blob**
dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

  
  generateObjectID(metadata) {
    return ("" + new Date().getTime()).split("").reverse().join("")
      + "-" + metadata.collectionID;
      // + "-" + metadata.userid;
  }

  render() {
    

    return (
      <span>
        <div className="dropzone">
          <Dropzone onDrop={this.onDrop.bind(this)}>
            <p>Try dropping some images here, or click to browse.</p>
          </Dropzone>
        </div>
      </span>
    );
  }
}