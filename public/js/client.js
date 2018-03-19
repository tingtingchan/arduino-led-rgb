'use strict';

var socket = io.connect(window.location.hostname + ':' + 3000);
var nodeListSliders = document.querySelectorAll('.slider');

function sliderValChange() {
  this.setAttribute('value', this.value);
}

function emitValue(color, e) {
  socket.emit('rgb', {
    color: color,
    value: e.target.value
  });
}

function pickColor(color) {
  socket.emit('pick color', {
    r: color.rgb[0],
    g: color.rgb[1],
    b: color.rgb[2]
  });
}

nodeListSliders.forEach(function (elem) {
  // Update slider value
  elem.addEventListener('input', sliderValChange);
  // Emit rgb value
  elem.addEventListener('input', emitValue.bind(null, elem.id));
});

// socket.on('connect', (data) => {
//   socket.emit('join', 'Client is connected!');
// });