/**
 * @fileoverview Server info.
 */

var querystring = require('querystring');

/** @type {server} */
module.exports = server;

/**
 * @constructor
 */
function server() {}

/** @const {string} */
server.url = 'http://localhost:3000/genotet';

/** @const {string} */
server.uploadURL = 'http://localhost:3000/genotet/upload';

/**
 * @typedef {{
 *   error: {type: string, message: string}
 * }}
 */
server.UploadResponse;

/**
 * Gets a query string.
 * @param {!Object} params
 * @return {string}
 */
server.queryURL = function(params) {
  return server.url + '?' + querystring.stringify(params);
};

/**
 * Posts a file via multi-part form to the server.
 * @param {!frisby} frisby
 * @param {!formData} form
 * @return {!frisby}
 */
server.postForm = function(frisby, form) {
  frisby.post(server.uploadURL, form, {
    headers: {
      'content-type': 'multipart/form-data; boundary=' +
      form.getBoundary(),
      'content-length': form.getLengthSync()
    }
  });
  return frisby;
};
