/* This script creates a canvas object, containing a basemap image, flight boundary and waypoints. 
These are then saved to a .png file.
*/

const fs = require('fs');
const { getMissionWaypoints, getFlightBoundary } = require('./readFlightData');
const {createCanvas, loadImage} = require('canvas');

// Import the mission and boundary shapes, converting lat, long into x, y (reversed order)
const waypoints = getMissionWaypoints('drone-mission-example.json', false);
const boundary = getFlightBoundary('flight-boundary-example.json', false);

// Find min and max coords of data
const minMaxCoords = findMinMax([boundary, waypoints]);

// set canvas size, ensuring correct aspect ratio to fit the data
const width = 1000;
const height = getCanvasHeight();

// returns canvas height in relative units
function getCanvasHeight() {
    // calculate lat, long degrees between min and max coords
    const longDeg = minMaxCoords.xMax - minMaxCoords.xMin;
    const latDeg = minMaxCoords.yMax - minMaxCoords.yMin;

    // convert lat, long degrees to km
    const latKm = 110.574 * latDeg;
    const longKm = 111.32 * Math.cos(deg2rad(minMaxCoords.yMin)) * longDeg;

    // helper conversion for degrees to radians
    function deg2rad(d) {
        return d/180*Math.PI; 
    }

    return width / longKm * latKm;
}


// scale data to canvas size
const scaledWaypoints = transformCoords(waypoints, width, height, minMaxCoords);
const scaledBoundary = transformCoords(boundary, width, height, minMaxCoords);

// create canvas and set drawing context
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Import background image and draw the mission and boundary polygons on top
loadImage('./basemap.png').then(image => {
    // draw background image to fill canvas
    ctx.drawImage(image, 0, 0, width, height);
    // draw waypoints and boundary
    draw(scaledWaypoints, 'purple', 7);
    draw(scaledBoundary, 'orange', 5);
    
    // acknowledge map data in background image
    writeAcknowledgements('Map Imagery and Data \u00A9 Maxar Technologies');

    // save to file
    savePng('flight.png');
});

// Takes an array of shapes and returns the min and max coordinates that all the shapes fit within.
function findMinMax(arrayOfShapes) {
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

/* Scales coordinates to fit inside a canvas of specified height and width.
xMin, yMin, xMax and yMax are the smallest and largest coordinates that all plottable shapes fit within */
function transformCoords(coords, width, height, {xMin, yMin, xMax, yMax}) {
    return coords.map(coord => ({
        // scale x coords
        'x': parseInt(
            ((coord.x - xMin) * width) / (xMax - xMin)
            ),
        // scale y coords - this also inverts the y-axis to allow for canvas origin at top left
        'y': parseInt(
            ((yMax - coord.y) * height) / (yMax - yMin) 
            )
    })); 
}

// Draws shape to canvas in chosen colour and line width
function draw(shape, colour, lineWidth) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(shape[0].x, shape[0].y);
    for(let i=1; i<shape.length; i++) {
        ctx.lineTo(shape[i].x, shape[i].y);
    }
    ctx.stroke();
}

// Writes map data acknowledgments
function writeAcknowledgements(text) {
    ctx.font = 'bold 16pt Helvetica';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, 50, height - 30);
}

// Creates png image file from canvas
function savePng(filename) {
    const buffer = canvas.toBuffer();
    fs.writeFileSync(filename, buffer);
}