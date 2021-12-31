/* This script tests if a planned drone mission is wholly within its flight boundary*/

console.log(validMission('drone-mission-example.json', 'flight-boundary-example.json'));

// Returns true if mission is valid (ie wholly within flight area boundary), or false otherwise.
function validMission(missionFile, flightBoundaryFile) {
    // get mission waypoints and flight area boundary as arrays of objects holding lat, long coords
    const { getMissionWaypoints, getFlightBoundary } = require('./readFlightData');
    const waypoints = getMissionWaypoints(missionFile);
    const boundary = getFlightBoundary(flightBoundaryFile);

    // return false if takeoff location is outside the flight boundary
    if(!isValidTakeOff(waypoints[0], boundary)) return false;

    // return false if any part of the flightpath crosses the flight boundary 
    if(!isValidFlightpath(waypoints, boundary)) return false;

    // otherwise return true
    return true;
}

/* Returns true if line (a,b)->(c,d) intersects with line (p,q)->(r,s). 
Intersecting includes just touching, including at line ends. 
If both lines are parallel, it assumes no intersection. 
This function would also be useful with live telemetry for checking if drone outside approval parameters. */
function intersects(a,b,c,d,p,q,r,s) {
    // Find slope and y-intercept for line 1 (vertical = Infinity)
    const slope1 = (d - b) / (c - a);
    const yIntercept1 = (b - slope1 * a);

    // Find slope and y-intercept for line 2 (vertical = Infinity)
    const slope2 = (s - q) / (r - p);
    const yIntercept2 = (q - slope2 * p);

    // return false if lines are parallel
    if(slope1 === slope2) {
        return false;
    } 
    
    // Find theoretical intersection coordinates if they exist
    let intersectionX, intersectionY;
    if(a === c) { // LINE 1 IS VERTICAL
        // theoretical intersection x coordinate set to line 1's x value
        intersectionX = a;
        // theoretical intersection y coordinate calculated from line 2's formula, where it would cross the x-intersection coordinate
        intersectionY = slope2 * intersectionX + yIntercept2;
        // if line 1's theoretical intersection x coordinate lies on line 2 and line 2's theoretical intersection y coordinate lies on line 1 return true, otherwise false
        return between(intersectionX, p, r) && between(intersectionY, b, d);
    }
    if(p === r) { // LINE 2 IS VERTICAL
        // theoretical intersection x coordinate set to line 2's x value
        intersectionX = p;
        // theoretical intersection y coordinate calculated from line 1's formula, where it would cross the x-intersection coordinate
        intersectionY = slope1 * intersectionX + yIntercept1;
        // if line 2's theoretical intersection x coordinate lies on line 1 and line 1's theoretical intersection y coordinate lies on line 2 return true, otherwise false
        return between(intersectionX, a, c) && between(intersectionY, q, s);
    }
    // ALL OTHER LINES - make y equal in both line formulae, rearrange and solve for x
    intersectionX = (yIntercept2 - yIntercept1) / (slope1 - slope2);
    // if x intersection point lies on both lines return true, otherwise false (no need to do for y as well)
    return between(intersectionX, a, c) && between(intersectionX, p, r); 
}

/* Returns true if take-off location is inside the flight area boundary, or false otherwise. 
Test works by seeing how many times an imaginary straight line outwards 
from waypoint crosses the boundary polygon. 
Anything even, including zero, means waypoint is outside. */
function isValidTakeOff(takeoff, boundary) {
    let count = 0; 
    // loop through boundary sides (not vertices, so stops before last vertex), counting number of intersections
    for(let i=0; i<boundary.length-1; i++) {
        if(intersects(
                takeoff.lat, takeoff.long, 
                takeoff.lat + 0.2, takeoff.long + 0.4, // arbitrary large distance offset for end of imaginary line
                boundary[i].lat, boundary[i].long, 
                boundary[i+1].lat, boundary[i+1].long
            )) {
            count++; 
        }
    }
    return count % 2 !== 0;
}

/* Returns true if no part of flightpath crosses any part of the boundary, or false otherwise */
function isValidFlightpath(waypoints, boundary) {
    // for each flightpath between two waypoints and for each boundary side, check if any intersect
    for(let i=0; i<waypoints.length-1; i++) {
        for(let j=0; j<boundary.length-1; j++) {
            if(intersects(
                waypoints[i].lat, waypoints[i].long, 
                waypoints[i+1].lat, waypoints[i+1].long, 
                boundary[j].lat, boundary[j].long, 
                boundary[j+1].lat, boundary[j+1].long
            )) {
                return false; // an intersection occurred
            } 
        }
    }
    return true; // no intersection occurred
}

// returns true if a number (checkNum) is between two values (x and y) inclusive
function between(checkNum, x, y) {
    return Math.max(x, y) >= checkNum && Math.min(x, y) <= checkNum;
 }