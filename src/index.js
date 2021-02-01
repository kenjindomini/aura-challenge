import LatLon from "geodesy/latlon-spherical.js";

// Load the zipcode database in to memory, to scale move to a proper external queryable database
let db = require("./data");

// lambda-like handler function
module.exports.handler = async event => {
  let re = new RegExp("(\\w+)/?(.*)");
  let resource, resourceArguments;
  try {
    let matches = event.path.match(re);
    resource = matches[1];
  } catch (e) {
    throw new Error("Malformed request");
  }
  if (resource === "zipcodes") {
    return zipcodesHandler(
      event.httpMethod,
      event.headers,
      event.queryStringParameters
    );
  } else {
    throw new Error(`Unknown path: ${event.path}`);
  }
};

function zipcodesHandler(method, headers, queryString) {
  switch (method) {
    case "GET": {
      return getZipcodes(queryString);
    }
    default: {
      throw new Error(`Unsupported HTTP Method: ${method}`);
    }
  }
}

function getZipcodes(queryString) {
  queryString = getZipcodesValidation(queryString);
  let zips = db;
  // If latitude and longitude are provided we only return the closest zip so there is no reason to continue
  // filtering just return the result
  if (
    queryString.hasOwnProperty("latitude") &&
    queryString.hasOwnProperty("longitude")
  ) {
    let closestZip;
    let shortestDisatance = undefined;
    zips.some(z => {
      if (
        queryString.latitude === z.latitude &&
        queryString.longitude === z.longitude
      ) {
        // short circuit if coords are equal
        closestZip = z;
        return true;
      }
      let p1 = new LatLon(queryString.latitude, queryString.longitude);
      let p2 = new LatLon(z.latitude, z.longitude);
      let d = p1.distanceTo(p2);
      if (shortestDisatance === undefined) {
        shortestDisatance = d;
        closestZip = z;
      } else if (d < shortestDisatance) {
        shortestDisatance = d;
        closestZip = z;
      }
      // This function could be optimized by identifying the actual floor;
      // finding the two closest zips and identifying the midpoint.
    });
    return [closestZip];
  }
  if (queryString.hasOwnProperty("type")) {
    zips = zips.filter(z => z.type === queryString.type);
  }
  if (queryString.hasOwnProperty("zipcode")) {
    zips = zips.filter(z => z.zip.includes(queryString.zipcode));
  }
  if (queryString.hasOwnProperty("city")) {
    let city = queryString.city.toLowerCase();
    zips = zips.filter(z => {
      let primaryCityMatches = z.primary_city.toLowerCase().includes(city);
      let acceptableCityMatches = false;
      if (z.acceptable_cities !== null) {
        acceptableCityMatches = z.acceptable_cities
          .toLowerCase()
          .includes(city);
      }
      let unacceptableCityMatches = false;
      if (z.unacceptable_cities !== null) {
        unacceptableCityMatches = z.unacceptable_cities
          .toLowerCase()
          .split(", ")
          .includes(city);
      }
      return (
        (primaryCityMatches || acceptableCityMatches) &&
        !unacceptableCityMatches
      );
    });
  }
  return zips;
}

/***
 * getZipcodesValidation will return a new querystring object with coerced values or throw a validation error
 * @param queryString - querystring object received from the API Gateway event
 *
 * @returns queryString - modified copy of queryString object
 */
function getZipcodesValidation(queryString) {
  if (
    queryString.hasOwnProperty("latitude") ||
    queryString.hasOwnProperty("longitude")
  ) {
    if (
      queryString.hasOwnProperty("latitude") === false ||
      queryString.hasOwnProperty("longitude") === false
    ) {
      throw new Error("latitude and longitude require each other");
    }
    queryString.latitude = Number(queryString.latitude);
    queryString.longitude = Number(queryString.longitude);
    if (isNaN(queryString.latitude)) {
      throw new Error(
        "latitude must be a number representing degrees; minute and second notation is not supported"
      );
    }
    if (isNaN(queryString.longitude)) {
      throw new Error(
        "longitude must be a number representing degrees; minute and second notation is not supported"
      );
    }
  }

  if (queryString.hasOwnProperty("zipcode")) {
    let re = new RegExp("^\\d{1,5}$");
    let matches;
    try {
      matches = queryString.zipcode.match(re);
    } catch (e) {
      matches = null;
    }
    if (matches === null) {
      throw new Error("zipcode must be a string of 1-5 digits");
    }
  }

  if (queryString.hasOwnProperty("city")) {
    let re = new RegExp("^[a-zA-Z -]+$");
    let matches;
    try {
      matches = queryString.city.match(re);
    } catch (e) {
      matches = null;
    }
    if (matches === null) {
      throw new Error(
        "city must be a string with only letters, spaces, and dashes"
      );
    }
  }

  if (queryString.hasOwnProperty("type")) {
    queryString.type = queryString.type.toUpperCase();
    let re = new RegExp("^STANDARD$|^PO BOX$|^UNIQUE$");
    let matches;
    try {
      matches = queryString.type.match(re);
    } catch (e) {
      matches = null;
    }
    if (matches === null) {
      throw new Error(
        "type must be a string with a value one of STANDARD, PO BOX, UNIQUE"
      );
    }
  }

  return queryString;
}
