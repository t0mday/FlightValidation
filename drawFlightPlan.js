// Creates a canvas and saves drawn shapes to a .png file.
const fs = require('fs');
const rise = require('./rise_exports.js');
const {createCanvas, loadImage} = require('canvas');
const width = 1000;
const height = 1000;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
// Rotate canvas to get the origin in bottom left corner
ctx.translate(width / 2, height / 2);
ctx.rotate(-90 * Math.PI / 180);
ctx.translate(-width / 2, -height / 2);
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);
// Import the mission and boundary shapes
const waypoints = rise.readMissionFile('drone-example-mission.json');
const boundary = rise.readFlightAreaFile('flight-boundary.json');
// Transform mission and boundary shapes to canvas extent
const minMaxCoords = findMinMax([boundary, waypoints]);
const scaledWaypoints = transformCoords(waypoints, minMaxCoords, width, height);
const scaledBoundary = transformCoords(boundary, minMaxCoords, width, height);
draw(scaledWaypoints, 'blue');
draw(scaledBoundary, 'orange');
savePng('flight.png');

function findMinMax(arrayOfShapes) {
  // Takes an array of shapes and returns the min and max coordinates that all the shapes fit within.
  let xMin = 180, xMax = -180, yMin = 180, yMax = -180;
  for(let shape of arrayOfShapes) {
    for(let point of shape) {
      if(point.x < xMin) xMin = point.x;
      if(point.y < yMin) yMin = point.y;
      if(point.x > xMax) xMax = point.x;
      if(point.y > yMax) yMax = point.y;
    }
  }
  return {
    'xMin': xMin,
    'yMin': yMin,
    'xMax': xMax,
    'yMax': yMax
  }
}

function transformCoords(coords, minMax, height, width) {
  // Scales lat, long coordinates into graphical x, y coordinates to fit inside a canvas of specified height and width. minMax is an object of min/max coordinates that need to be able to be plotted on the canvas.
  return coords.map(coord => ({
    'x': parseInt(
      ((coord.x - minMax.xMin) * width) / (minMax.xMax - minMax.xMin)
      ),
    'y': parseInt(
      ((coord.y - minMax.yMin) * height) / (minMax.yMax - minMax.yMin)
      )
  })); 
}

function draw(shape, colour) {
  // Draws shape to canvas in chosen colour.
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.moveTo(shape[0].x, shape[0].y);
  for(let i=1; i<shape.length; i++) {
    ctx.lineTo(shape[i].x, shape[i].y);
  }
  ctx.stroke();
}

function savePng(filename) {
  //saves canvas as a png file.
  const buf = canvas.toBuffer();
  fs.writeFileSync(filename, buf);
}


