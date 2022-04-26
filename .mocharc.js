'use strict';

require('source-map-support').install();

module.exports = {
  bail: true,
  exit: true,
  slow: 2000,
  timeout: process.env.MOCHA_TIMEOUT || 5000
}
