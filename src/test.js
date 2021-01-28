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
});

describe("/zipcode tests", () => {
  test("Unsupported method throws an error", async () => {
    let event = {
      httpMethod: "PATCH",
      path: "/zipcode",
      headers: {},
      queryStringParameters: {
        date: "2020-11-13"
      }
    };
    expect.assertions(1);
    await expect(handler(event)).rejects.toEqual(
      Error("Unsupported HTTP Method: PATCH")
    );
  });
});
