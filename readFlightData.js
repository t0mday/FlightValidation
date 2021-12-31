/* This module reads mission and flight boundary JSON files in standard formats, 
returning waypoints and flight boundary data */

const fs = require('fs');

/* Parses location data from missionFile and returns an array of objects 
holding lat, long coordinates for each waypoint (including take-off and landing). */
exports.getMissionWaypoints = (missionFile) => {
  // read file
  const mission = JSON.parse(fs.readFileSync(missionFile, 'utf8'));

  // array of objects holding lat, long coordinates for each waypoint (including take-off and landing)
  return mission.actions.map(waypoint => 
          ({'lat': waypoint.coordinate[0], 'long': waypoint.coordinate[1]})
      );
}

/* Parses location data from missionFile and returns an array of objects 
holding lat, long coordinates for each waypoint (including take-off and landing). */
exports.getFlightBoundary = (flightBoundaryFile) => {
  // read file
  const flightBoundary = JSON.parse(fs.readFileSync(flightBoundaryFile, 'utf8'));

  // array of objects holding lat, long coordinates for flight-boundary polygon vertices
  return flightBoundary.geometry.coordinates[0].map(vertex => 
          ({'lat': vertex[0], 'long': vertex[1]})
      );
}

