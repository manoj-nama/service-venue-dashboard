const axios = require('axios');
const axiosRetry = require('axios-retry');

import ms from 'ms';

const DEFAULT_REQ_TIMEOUT = '10s';

const getError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response;
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return error.request;
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message;
  }
};

const createAuthenticationHeader = (
  accessToken
) => {
  let headers = {
    Accept: '*/*'
  };
  if (accessToken) {
    headers = {
      authorization: accessToken
    }
  }
  return headers;
};

async function post(
  url,
  payload,
  timeout,
  accessToken = null,
) {
  try {
    const headers = createAuthenticationHeader(accessToken);
    const requestTimeout = timeout || DEFAULT_REQ_TIMEOUT;

    const client = axios.create({ headers, timeout: ms(requestTimeout) });
    axiosRetry(client, { retries: 3 });
    const endpointResponse = await client.post(url, payload);
    const result = endpointResponse.data
      ? endpointResponse.data
      : endpointResponse;
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(getError(error));
  }
}

export default { post };
