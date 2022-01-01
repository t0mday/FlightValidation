/* This module reads mission and flight boundary JSON files in standard formats, 
returning waypoints and flight boundary data */

const fs = require('fs');

/* Parses location data from missionFile and returns an array of objects 
holding user-choice { lat, long } (default) or { x, y } coordinates for each waypoint (including take-off and landing). */
exports.getMissionWaypoints = (missionFile, latLong=true) => {
  // read file
  const mission = JSON.parse(fs.readFileSync(missionFile, 'utf8'));
  // return array of mapped objects
  return mission.actions.map(waypoint => latLong ? 
          ({'lat': waypoint.coordinate[0], 'long': waypoint.coordinate[1]}) :
          ({'x': waypoint.coordinate[1], 'y': waypoint.coordinate[0]})
      );
}

/* Parses location data from flightBoundaryFile and returns an array of objects 
holding user-choice { lat, long } (default) or { x, y } coordinates for each vertex of the polygon. */
exports.getFlightBoundary = (flightBoundaryFile, latLong=true) => {
  // read file
  const flightBoundary = JSON.parse(fs.readFileSync(flightBoundaryFile, 'utf8'));
  // return array of mapped objects
  return flightBoundary.geometry.coordinates[0].map(vertex => latLong ? 
          ({'lat': vertex[0], 'long': vertex[1]}) : 
          ({'x': vertex[1], 'y': vertex[0]})
      );
}

