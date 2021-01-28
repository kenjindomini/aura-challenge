let db = require("./data");

// lambda-like handler function
module.exports.handler = async event => {
  let re = new RegExp("(\\w+)/?(.*)");
  let resource, resourceArguments;
  try {
    let matches = event.path.match(re);
    resource = matches[1];
    resourceArguments = matches[2];
  } catch (e) {
    throw new Error("Malformed request");
  }
  switch (resource) {
    case "zipcodes": {
      return await zipcodesHandler(
        event.httpMethod,
        event.headers,
        resourceArguments,
        event.queryStringParameters,
        event.body
      );
    }
    case "zipcode": {
      return await zipcodeHandler(
        event.httpMethod,
        event.headers,
        resourceArguments,
        event.queryStringParameters,
        event.body
      );
    }
    default: {
      throw new Error(`Unknown path: ${event.path}`);
    }
  }
};

async function zipcodesHandler(
  method,
  headers,
  resourceArguments,
  queryString,
  body
) {
  switch (method) {
    case "GET": {
      return getZipcodes(queryString);
    }
    default: {
      throw new Error(`Unsupported HTTP Method: ${method}`);
    }
  }
}

async function zipcodeHandler(
  method,
  headers,
  resourceArguments,
  queryString,
  body
) {
  switch (method) {
    case "GET": {
      throw new Error(`GET /zipcode not implemented`);
    }
    case "POST": {
      throw new Error(`POST /zipcode not implemented`);
    }
    default: {
      throw new Error(`Unsupported HTTP Method: ${method}`);
    }
  }
}

function getZipcodes(queryString) {
  let zipcodes = db;
  if (queryString.hasOwnProperty("type")) {
    zipcodes = zipcodes.filter(z => z.type === queryString.type);
  }
  if (queryString.hasOwnProperty("zipcode")) {
    zipcodes = zipcodes.filter(z => z.zip.match(`.*${queryString.zipcode}.*`));
  }
  return zipcodes;
}
