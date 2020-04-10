/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const intermediateCanvas = document.querySelector('canvas');
const context = intermediateCanvas.getContext('2d');
const videoHidden = document.querySelector('#hidden');

//function drawToCanvas() {
  //  if (renderVideoToCanvas)  context.drawImage(videoHidden, 0, 0, intermediateCanvas.width, intermediateCanvas.height);
  //requestAnimationFrame(drawToCanvas)
//};

function handleSuccess(stream) {
    videoHidden.srcObject = stream;
    window.stream = stream;
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true //or just true
    }).then(handleSuccess, handleError);
    requestAnimationFrame(render); //in ai.js
  }