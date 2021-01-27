const { handler } = require("./index");

describe("basic tests", () => {
  test("handler function exists", () => {
    expect(typeof handler).toBe("function");
  });
  test("Unknown path throws an error", async () => {
    var event = {
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
});

describe("/zipcodes tests", () => {
  test("Unsupported method throws an error", async () => {
    var event = {
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
});

describe("/zipcode tests", () => {
  test("Unsupported method throws an error", async () => {
    var event = {
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
