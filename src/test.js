import { describe, expect, test } from "@jest/globals";
const { handler } = require("./index");

describe("basic tests", () => {
  test("handler function exists", () => {
    expect(typeof handler).toBe("function");
  });
  test("Unknown path throws an error", async () => {
    let event = {
      httpMethod: "GET",
      path: "/resource",
      headers: {},
      queryStringParameters: {
        date: "2020-11-13"
      }
    };
    expect.assertions(1);
    await expect(handler(event)).rejects.toEqual(
      Error("Unknown path: /resource")
    );
  });
  test("Throws an error when the path cannot be parsed", async () => {
    let event = {
      httpMethod: "GET",
      path: "/&*",
      headers: {},
      queryStringParameters: {
        date: "2020-11-13"
      }
    };
    expect.assertions(1);
    await expect(handler(event)).rejects.toEqual(Error("Malformed request"));
  });
});

describe("/zipcodes tests", () => {
  test("Unsupported method throws an error", async () => {
    let event = {
      httpMethod: "POST",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        date: "2020-11-13"
      }
    };
    expect.assertions(1);
    await expect(handler(event)).rejects.toEqual(
      Error("Unsupported HTTP Method: POST")
    );
  });
  test("GET returns an array", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {}
    };
    expect.assertions(1);
    let response = await handler(event);
    expect(Array.isArray(response)).toEqual(true);
  });
  test("A complete zipcode returns a single result in an array", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        zipcode: "04091"
      }
    };
    let expectResult = [
      {
        zip: "04091",
        type: "STANDARD",
        primary_city: "West Baldwin",
        acceptable_cities: null,
        unacceptable_cities: null,
        state: "ME",
        county: "Cumberland County",
        timezone: "America/New_York",
        area_codes: "207",
        latitude: "43.83",
        longitude: "-70.77",
        country: "US",
        estimated_population: "746"
      }
    ];
    expect.assertions(1);
    let response = await handler(event);
    expect(response).toEqual(expectResult);
  });
  test("A partial zipcode returns all matches", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        zipcode: 701
      }
    };
    let expectResult = [
      {
        zip: "01701",
        type: "STANDARD",
        primary_city: "Framingham",
        acceptable_cities: null,
        unacceptable_cities: "Framingham Center, Framingham So, Saxonville",
        state: "MA",
        county: "Middlesex County",
        timezone: "America/New_York",
        area_codes: "508,617,774,781,978",
        latitude: "42.3",
        longitude: "-71.43",
        country: "US",
        estimated_population: "27821"
      },
      {
        zip: "05701",
        type: "STANDARD",
        primary_city: "Rutland",
        acceptable_cities: "Mendon, S Chittenden, South Chittenden",
        unacceptable_cities:
          "Clementwood, East Pittsford, Glen, Heartwell, Mill Village, Rutland Town",
        state: "VT",
        county: "Rutland County",
        timezone: "America/New_York",
        area_codes: "802",
        latitude: "43.6",
        longitude: "-72.97",
        country: "US",
        estimated_population: "16970"
      },
      {
        zip: "06701",
        type: "UNIQUE",
        primary_city: "Waterbury",
        acceptable_cities: null,
        unacceptable_cities: "U S Postal Service, Wtby",
        state: "CT",
        county: "New Haven County",
        timezone: "America/New_York",
        area_codes: "203",
        latitude: "41.55",
        longitude: "-73.03",
        country: "US",
        estimated_population: "0"
      }
    ];
    expect.assertions(1);
    let response = await handler(event);
    expect(response).toEqual(expectResult);
  });
  test("A partial zipcode + a type filter returns the expected subset", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        zipcode: 701,
        type: "UNIQUE"
      }
    };
    let expectResult = [
      {
        zip: "06701",
        type: "UNIQUE",
        primary_city: "Waterbury",
        acceptable_cities: null,
        unacceptable_cities: "U S Postal Service, Wtby",
        state: "CT",
        county: "New Haven County",
        timezone: "America/New_York",
        area_codes: "203",
        latitude: "41.55",
        longitude: "-73.03",
        country: "US",
        estimated_population: "0"
      }
    ];
    expect.assertions(1);
    let response = await handler(event);
    expect(response).toEqual(expectResult);
  });
  test("A partial city returns the expected results", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        city: "ashla"
      }
    };
    let expectResult = [
      {
        zip: "01721",
        type: "STANDARD",
        primary_city: "Ashland",
        acceptable_cities: null,
        unacceptable_cities: null,
        state: "MA",
        county: "Middlesex County",
        timezone: "America/New_York",
        area_codes: "508,617",
        latitude: "42.25",
        longitude: "-71.46",
        country: "US",
        estimated_population: "14769"
      },
      {
        zip: "03217",
        type: "STANDARD",
        primary_city: "Ashland",
        acceptable_cities: null,
        unacceptable_cities: null,
        state: "NH",
        county: "Grafton County",
        timezone: "America/New_York",
        area_codes: "603",
        latitude: "43.69",
        longitude: "-71.63",
        country: "US",
        estimated_population: "1929"
      },
      {
        zip: "04732",
        type: "STANDARD",
        primary_city: "Ashland",
        acceptable_cities: "Garfield Plt, Masardis, Nashville Plt",
        unacceptable_cities: null,
        state: "ME",
        county: "Aroostook County",
        timezone: "America/New_York",
        area_codes: "207",
        latitude: "46.63",
        longitude: "-68.4",
        country: "US",
        estimated_population: "1375"
      }
    ];
    expect.assertions(1);
    let response = await handler(event);
    expect(response).toEqual(expectResult);
  });
  test("Provided Latitude and Longitude returns the single expected result", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        latitude: 46.84,
        longitude: -67.94
      }
    };
    let expectResult = [
      {
        zip: "04736",
        type: "STANDARD",
        primary_city: "Caribou",
        acceptable_cities: "Connor Twp, Woodland",
        unacceptable_cities: null,
        state: "ME",
        county: "Aroostook County",
        timezone: "America/New_York",
        area_codes: "207",
        latitude: "46.86",
        longitude: "-67.99",
        country: "US",
        estimated_population: "7868"
      }
    ];
    expect.assertions(1);
    let response = await handler(event);
    expect(response).toEqual(expectResult);
  });
  test("Unacceptable city is filtered out of results", async () => {
    let event = {
      httpMethod: "GET",
      path: "/zipcodes",
      headers: {},
      queryStringParameters: {
        zipcode: "0473",
        city: "ASHLAND"
      }
    };
    let expectResult = [
      {
        "zip": "04732",
        "type": "STANDARD",
        "primary_city": "Ashland",
        "acceptable_cities": "Garfield Plt, Masardis, Nashville Plt",
        "unacceptable_cities": null,
        "state": "ME",
        "county": "Aroostook County",
        "timezone": "America/New_York",
        "area_codes": "207",
        "latitude": "46.63",
        "longitude": "-68.4",
        "country": "US",
        "estimated_population": "1375"
      }
    ];
    expect.assertions(1);
    let response = await handler(event);
    expect(response).toEqual(expectResult);
  });
});
