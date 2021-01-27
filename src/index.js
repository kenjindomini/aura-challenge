// lambda-like handler function
module.exports.handler = async event => {
  switch (event.path) {
    case "/zipcodes": {
      return await zipcodesHandler(
        event.httpMethod,
        event.headers,
        event.queryStringParameters,
        event.body
      );
    }
    case "/zipcode": {
      return await zipcodeHandler(
        event.httpMethod,
        event.headers,
        event.queryStringParameters,
        event.body
      );
    }
    default: {
      throw new Error(`Unknown path: ${event.path}`);
    }
  }
};

async function zipcodesHandler(method, headers, queryString, body) {
  switch (method) {
    case "GET": {
      break;
    }
    default: {
      throw new Error(`Unsupported HTTP Method: ${method}`);
    }
  }
}

async function zipcodeHandler(method, headers, queryString, body) {
  switch (method) {
    case "POST": {
      break;
    }
    default: {
      throw new Error(`Unsupported HTTP Method: ${method}`);
    }
  }
}
